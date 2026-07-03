import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ funnelId: string }> }
) {
    let session: Awaited<ReturnType<typeof getSession>> | null = null
    try {
        session = await getSession()
        await requireAdmin();
        const { funnelId } = await params;
        const { reason, isBanned } = await req.json();

        const funnel = await prisma.funnel.update({
            where: { id: funnelId },
            data: {
                isBanned: isBanned,
                banReason: isBanned ? reason : null
            }
        });

        if (session) {
            await logAdminAction({
                adminId: session.userId,
                action: isBanned ? 'ban_funnel' : 'unban_funnel',
                targetFunnelId: funnelId,
                targetUserId: funnel.userId,
                details: { reason: reason || null },
            })
        }

        return NextResponse.json({ funnel });
    } catch (error) {
        console.error('Error banning funnel:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
