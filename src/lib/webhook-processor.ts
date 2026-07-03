import prisma from '@/lib/prisma'
import { parseWebhook, type ParsedWebhook } from './webhook-parser'

export interface ProcessOptions {
    source?: 'api' | 'manual'
    rawPayload: any
    headers?: Record<string, string>
    provider?: string
    ipAddress?: string | null
    userAgent?: string | null
}

export interface ProcessResult {
    ok: boolean
    webhookEventId: string
    status: 'processed' | 'ignored' | 'duplicate' | 'failed'
    message: string
    affectedUserId?: string
    parsed?: ParsedWebhook
    planMappingId?: string
}

/**
 * Processa um webhook de provedor de pagamento.
 *
 * Fluxo:
 * 1. Persiste o evento bruto (WebhookEvent) com source = api|manual
 * 2. Faz parse com o parser apropriado
 * 3. Se já existe evento com mesmo externalId → marca como duplicate
 * 4. Se status não é 'paid' → marca como ignored
 * 5. Procura PlanMapping (provider + productId) para descobrir plano Kuiz
 * 6. Acha/cria User pelo email
 * 7. Estende subscriptionEndsAt em +periodDays (acumulativo se já ativo)
 * 8. Cria SubscriptionTransaction
 * 9. Marca WebhookEvent como processed
 */
export async function processWebhook(opts: ProcessOptions): Promise<ProcessResult> {
    const { rawPayload, headers = {}, provider: providerHint, source = 'api', ipAddress, userAgent } = opts

    // 1) Persistir evento bruto primeiro (sempre)
    const event = await prisma.webhookEvent.create({
        data: {
            provider: providerHint || 'unknown',
            eventType: null,
            externalId: null,
            source,
            rawPayload,
            headers,
            status: 'pending',
            ipAddress: ipAddress || null,
            userAgent: userAgent || null,
        },
    })

    // 2) Parse
    const provider = providerHint || guessProvider(rawPayload, headers)
    const parsed = parseWebhook(provider, rawPayload)

    // 3) Idempotência por externalId
    if (parsed.externalId) {
        const existing = await prisma.webhookEvent.findFirst({
            where: { externalId: parsed.externalId, NOT: { id: event.id } },
        })
        if (existing) {
            await prisma.webhookEvent.update({
                where: { id: event.id },
                data: {
                    status: 'duplicate',
                    eventType: parsed.eventType,
                    externalId: parsed.externalId,
                    provider: parsed.provider,
                    parsedData: parsed as any,
                    customerEmail: parsed.customer.email,
                    customerName: parsed.customer.name,
                    customerPhone: parsed.customer.phone,
                    productId: parsed.product.id,
                    productName: parsed.product.name,
                    amount: parsed.payment.amount,
                    currency: parsed.payment.currency,
                    error: `Duplicado de ${existing.id}`,
                },
            })
            return {
                ok: true,
                webhookEventId: event.id,
                status: 'duplicate',
                message: `Evento já processado em ${existing.id}`,
                parsed,
            }
        }
    }

    // 4) Só processa pagamentos confirmados
    if (parsed.payment.status !== 'paid') {
        await prisma.webhookEvent.update({
            where: { id: event.id },
            data: {
                status: 'ignored',
                eventType: parsed.eventType,
                externalId: parsed.externalId,
                provider: parsed.provider,
                parsedData: parsed as any,
                customerEmail: parsed.customer.email,
                customerName: parsed.customer.name,
                customerPhone: parsed.customer.phone,
                productId: parsed.product.id,
                productName: parsed.product.name,
                amount: parsed.payment.amount,
                currency: parsed.payment.currency,
                error: `Status não é 'paid' (é '${parsed.payment.status}')`,
            },
        })
        return {
            ok: true,
            webhookEventId: event.id,
            status: 'ignored',
            message: `Pagamento não confirmado (status: ${parsed.payment.status})`,
            parsed,
        }
    }

    // Sem email = não dá pra criar/achar usuário
    if (!parsed.customer.email) {
        await prisma.webhookEvent.update({
            where: { id: event.id },
            data: {
                status: 'failed',
                eventType: parsed.eventType,
                externalId: parsed.externalId,
                provider: parsed.provider,
                parsedData: parsed as any,
                customerEmail: parsed.customer.email,
                customerName: parsed.customer.name,
                customerPhone: parsed.customer.phone,
                productId: parsed.product.id,
                productName: parsed.product.name,
                amount: parsed.payment.amount,
                currency: parsed.payment.currency,
                error: 'Email ausente no payload — não foi possível identificar o usuário',
            },
        })
        return {
            ok: false,
            webhookEventId: event.id,
            status: 'failed',
            message: 'Email ausente no payload',
            parsed,
        }
    }

    // 5) PlanMapping
    let planMapping = null as Awaited<ReturnType<typeof prisma.planMapping.findFirst>>
    if (parsed.product.id) {
        planMapping = await prisma.planMapping.findFirst({
            where: {
                provider: parsed.provider,
                externalProductId: parsed.product.id,
                isActive: true,
            },
        })
    }

    const kuizPlan = planMapping?.kuizPlan || defaultPlanFromAmount(parsed.payment.amount)
    const periodDays = planMapping?.periodDays || defaultPeriodFromPlan(kuizPlan)

    // 6) Encontrar/criar usuário
    let user = await prisma.user.findUnique({
        where: { email: parsed.customer.email },
    })

    const tempPassword = user ? null : `temp_${Math.random().toString(36).slice(2)}_${Date.now()}`

    if (!user) {
        try {
            user = await prisma.user.create({
                data: {
                    email: parsed.customer.email,
                    name: parsed.customer.name || parsed.customer.email.split('@')[0],
                    password: tempPassword || 'changeme',
                    role: 'user',
                    subscriptionStatus: 'active',
                    subscriptionPlan: kuizPlan,
                    subscriptionEndsAt: new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000),
                },
            })
        } catch (e) {
            // Email duplicado em race condition
            user = await prisma.user.findUnique({ where: { email: parsed.customer.email } })
            if (!user) throw e
        }
    }

    // 7) Estender assinatura (acumulativo se ativa)
    const now = new Date()
    const currentEnd = user.subscriptionEndsAt && new Date(user.subscriptionEndsAt) > now
        ? new Date(user.subscriptionEndsAt)
        : now
    const newEnd = new Date(currentEnd)
    newEnd.setDate(newEnd.getDate() + periodDays)

    await prisma.user.update({
        where: { id: user.id },
        data: {
            name: parsed.customer.name || user.name, // atualiza nome se vier mais completo
            subscriptionStatus: 'active',
            subscriptionPlan: kuizPlan,
            subscriptionEndsAt: newEnd,
        },
    })

    // 8) SubscriptionTransaction
    const transaction = await prisma.subscriptionTransaction.create({
        data: {
            userId: user.id,
            amount: parsed.payment.amount || 0,
            status: 'paid',
            provider: parsed.provider,
            transactionId: parsed.externalId || null,
            metadata: {
                event: parsed.eventType,
                product: parsed.product,
                planMapping: planMapping?.id || null,
                periodDays,
                source,
            } as any,
        },
    })

    // 9) Atualizar WebhookEvent
    await prisma.webhookEvent.update({
        where: { id: event.id },
        data: {
            status: 'processed',
            processedAt: new Date(),
            eventType: parsed.eventType,
            externalId: parsed.externalId,
            provider: parsed.provider,
            parsedData: parsed as any,
            customerEmail: parsed.customer.email,
            customerName: parsed.customer.name,
            customerPhone: parsed.customer.phone,
            productId: parsed.product.id,
            productName: parsed.product.name,
            amount: parsed.payment.amount,
            currency: parsed.payment.currency,
            kuizPlan,
            periodDays,
            affectedUserId: user.id,
        },
    })

    return {
        ok: true,
        webhookEventId: event.id,
        status: 'processed',
        message: `Assinatura de ${user.email} estendida até ${newEnd.toISOString()} (${periodDays} dias, plano ${kuizPlan})`,
        affectedUserId: user.id,
        parsed,
        planMappingId: planMapping?.id,
    }
}

/** Heurística: tenta adivinhar o provedor pelo payload/headers. */
function guessProvider(payload: any, headers: Record<string, string>): string {
    // Headers
    const h = JSON.stringify(headers).toLowerCase()
    if (h.includes('cakto')) return 'cakto'
    if (h.includes('stripe')) return 'stripe'
    if (h.includes('hotmart')) return 'hotmart'
    if (h.includes('kiwify')) return 'kiwify'
    if (h.includes('eduzz')) return 'eduzz'
    if (h.includes('braip')) return 'braip'

    // Campos do payload
    if (payload?.event?.includes('purchase') && payload?.data?.checkout) return 'cakto'
    if (payload?.type?.startsWith('checkout.') || payload?.type?.startsWith('invoice.')) return 'stripe'
    if (payload?.webhook_event_type && payload?.Product) return 'kiwify'
    if (payload?.transID && payload?.client) return 'eduzz'
    if (payload?.buyer && payload?.product && payload?.purchase) return 'hotmart'
    if (payload?.transaction_id && payload?.customer) return 'braip'

    return 'unknown'
}

/** Plano default baseado no valor (BRL) quando não há PlanMapping. */
function defaultPlanFromAmount(amount: number | null): 'starter' | 'pro' | 'enterprise' {
    if (!amount) return 'starter'
    if (amount >= 200) return 'enterprise'
    if (amount >= 70) return 'pro'
    return 'starter'
}

function defaultPeriodFromPlan(plan: string): number {
    switch (plan) {
        case 'enterprise':
            return 365
        case 'pro':
            return 90
        default:
            return 30
    }
}
