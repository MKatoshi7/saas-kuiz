import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { processWebhook } from '@/lib/webhook-processor'
import { parseWebhook } from '@/lib/webhook-parser'
import { logAdminAction } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        await requireAdmin()
        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get('page') || '1')
        const status = searchParams.get('status') || undefined
        const provider = searchParams.get('provider') || undefined
        const search = searchParams.get('search') || undefined
        const limit = 30
        const skip = (page - 1) * limit

        const where: any = {}
        if (status) where.status = status
        if (provider) where.provider = provider
        if (search) {
            where.OR = [
                { customerEmail: { contains: search, mode: 'insensitive' as const } },
                { customerName: { contains: search, mode: 'insensitive' as const } },
                { productName: { contains: search, mode: 'insensitive' as const } },
                { externalId: { contains: search, mode: 'insensitive' as const } },
                { eventType: { contains: search, mode: 'insensitive' as const } },
            ]
        }

        const [events, total] = await Promise.all([
            prisma.webhookEvent.findMany({
                where,
                orderBy: { receivedAt: 'desc' },
                skip,
                take: limit,
                include: {
                    affectedUser: { select: { id: true, email: true, name: true } },
                },
            }),
            prisma.webhookEvent.count({ where }),
        ])

        return NextResponse.json({
            events,
            total,
            pages: Math.ceil(total / limit),
        })
    } catch (error) {
        console.error('List webhooks error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

/**
 * Cola/parser manual de um payload (admin envia o JSON cru copiado do provedor).
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getSession()
        await requireAdmin()
        const body = await req.json()
        const { payload, provider, reprocessEventId } = body

        if (reprocessEventId) {
            // Reprocessar evento existente
            const event = await prisma.webhookEvent.findUnique({
                where: { id: reprocessEventId },
            })
            if (!event) {
                return NextResponse.json({ error: 'Event not found' }, { status: 404 })
            }
            // Marca o anterior como ignored (será duplicado) e cria novo
            await prisma.webhookEvent.update({
                where: { id: event.id },
                data: { status: 'ignored', error: 'Re-submetido para reprocessamento' },
            })
            const result = await processWebhook({
                rawPayload: event.rawPayload,
                headers: (event.headers as any) || {},
                provider: provider || event.provider,
                source: 'manual',
            })
            await logAdminAction({
                adminId: session!.userId,
                action: 'system_message',
                details: { type: 'webhook_reprocess', originalId: event.id, newId: result.webhookEventId, status: result.status },
            })
            return NextResponse.json(result)
        }

        if (!payload) {
            return NextResponse.json({ error: 'payload é obrigatório' }, { status: 400 })
        }

        // Validar que é JSON válido
        let parsedPayload = payload
        if (typeof payload === 'string') {
            try {
                parsedPayload = JSON.parse(payload)
            } catch {
                return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
            }
        }

        const result = await processWebhook({
            rawPayload: parsedPayload,
            headers: { 'x-source': 'admin-manual' },
            provider,
            source: 'manual',
        })

        await logAdminAction({
            adminId: session!.userId,
            action: 'system_message',
            details: { type: 'webhook_manual', eventId: result.webhookEventId, status: result.status },
        })

        return NextResponse.json(result)
    } catch (error: any) {
        console.error('Process webhook error:', error)
        return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 })
    }
}

/**
 * Apenas parsear (sem persistir) — útil para preview.
 */
export async function PUT(req: NextRequest) {
    try {
        await requireAdmin()
        const body = await req.json()
        const { payload, provider } = body
        if (!payload) {
            return NextResponse.json({ error: 'payload é obrigatório' }, { status: 400 })
        }
        const parsedPayload = typeof payload === 'string' ? JSON.parse(payload) : payload
        const result = parseWebhook(provider || 'unknown', parsedPayload)
        return NextResponse.json({ parsed: result })
    } catch (error: any) {
        return NextResponse.json({ error: error?.message }, { status: 500 })
    }
}
