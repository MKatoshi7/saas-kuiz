import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { logAdminAction } from '@/lib/audit'

type BulkAction = 'ban' | 'unban' | 'delete'

export async function POST(req: Request) {
    try {
        const session = await getSession()
        await requireAdmin()
        const body = await req.json()
        const { funnelIds, action, reason } = body as { funnelIds: string[]; action: BulkAction; reason?: string }

        if (!Array.isArray(funnelIds) || funnelIds.length === 0) {
            return NextResponse.json({ error: 'funnelIds é obrigatório' }, { status: 400 })
        }
        if (!['ban', 'unban', 'delete'].includes(action)) {
            return NextResponse.json({ error: 'action inválida' }, { status: 400 })
        }
        if (action === 'ban' && !reason?.trim()) {
            return NextResponse.json({ error: 'Motivo é obrigatório para banir' }, { status: 400 })
        }
        if (funnelIds.length > 100) {
            return NextResponse.json({ error: 'Limite de 100 funis por operação' }, { status: 400 })
        }

        let affected = 0

        if (action === 'ban' || action === 'unban') {
            const result = await prisma.funnel.updateMany({
                where: { id: { in: funnelIds } },
                data: {
                    isBanned: action === 'ban',
                    banReason: action === 'ban' ? reason : null,
                },
            })
            affected = result.count
        } else if (action === 'delete') {
            // Replicar lógica de delete individual: limpa sessões e cloudinary é best-effort
            for (const id of funnelIds) {
                try {
                    await prisma.$transaction([
                        prisma.event.deleteMany({ where: { session: { funnelId: id } } }),
                        prisma.visitorSession.deleteMany({ where: { funnelId: id } }),
                        prisma.funnelComponent.deleteMany({ where: { step: { funnelId: id } } }),
                        prisma.funnelStep.deleteMany({ where: { funnelId: id } }),
                        prisma.funnel.delete({ where: { id } }),
                    ])
                    affected++
                } catch (e) {
                    console.error(`Failed to delete funnel ${id}:`, e)
                }
            }
        }

        // Log por funil (best-effort, sem falhar a operação)
        for (const fid of funnelIds.slice(0, affected)) {
            try {
                await logAdminAction({
                    adminId: session!.userId,
                    action: action === 'ban' ? 'ban_funnel' : action === 'unban' ? 'unban_funnel' : 'delete_funnel',
                    targetFunnelId: fid,
                    details: { reason: reason || null, bulk: true },
                })
            } catch {}
        }

        return NextResponse.json({ success: true, affected, action })
    } catch (error) {
        console.error('Error in bulk action:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
