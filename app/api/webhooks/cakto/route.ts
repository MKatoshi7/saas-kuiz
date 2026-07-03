import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { processWebhook } from '@/lib/webhook-processor'
import { verifyHmacSignature } from '@/lib/webhook-signature'

export const dynamic = 'force-dynamic'

/**
 * Webhook público para provedores de pagamento.
 *
 * Aceita QUALQUER provedor (Cakto, Stripe, Hotmart, Kiwify, Eduzz, Braip, etc).
 * O provedor pode ser:
 * - Fornecido via query string: `?provider=cakto`
 * - Detectado automaticamente via headers + payload
 *
 * Segurança:
 * - HMAC SHA-256 opcional (configurável em /admin/webhooks → Configs)
 * - Se não houver secret configurado, aceita e loga (modo dev)
 */
export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text()
        const payload = JSON.parse(rawBody || '{}')

        // Detectar provedor
        const url = new URL(req.url)
        const providerHint = url.searchParams.get('provider')?.toLowerCase() || undefined

        // Capturar headers
        const headers: Record<string, string> = {}
        req.headers.forEach((v, k) => {
            headers[k] = v
        })

        // IP / User-Agent
        const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || null
        const userAgent = req.headers.get('user-agent') || null

        // Validar assinatura HMAC se houver config para o provider
        const guessedProvider = providerHint || guessFromHeaders(headers)
        if (guessedProvider) {
            const config = await prisma.webhookConfig.findUnique({
                where: { provider: guessedProvider },
            })
            if (config?.secret) {
                const sig =
                    req.headers.get('x-webhook-signature') ||
                    req.headers.get('x-cakto-signature') ||
                    req.headers.get('x-stripe-signature') ||
                    null
                const valid = verifyHmacSignature(rawBody, sig, config.secret)
                if (!valid) {
                    return NextResponse.json(
                        { error: 'Invalid signature', provider: guessedProvider },
                        { status: 401 }
                    )
                }
            }
        }

        const result = await processWebhook({
            rawPayload: payload,
            headers,
            provider: providerHint,
            source: 'api',
            ipAddress,
            userAgent,
        })

        // Sempre 200 OK (mesmo em duplicate/ignored) — webhook não deve retentar
        return NextResponse.json({
            ok: result.ok,
            status: result.status,
            message: result.message,
            webhookEventId: result.webhookEventId,
            parsed: result.parsed,
        })
    } catch (error: any) {
        console.error('Webhook processing error:', error)
        // Retorna 200 pra evitar retentativas em loop infinito do provedor
        return NextResponse.json(
            { ok: false, error: error?.message || 'Processing failed' },
            { status: 200 }
        )
    }
}

function guessFromHeaders(headers: Record<string, string>): string | null {
    const h = JSON.stringify(headers).toLowerCase()
    if (h.includes('cakto')) return 'cakto'
    if (h.includes('stripe')) return 'stripe'
    if (h.includes('hotmart')) return 'hotmart'
    if (h.includes('kiwify')) return 'kiwify'
    if (h.includes('eduzz')) return 'eduzz'
    if (h.includes('braip')) return 'braip'
    return null
}
