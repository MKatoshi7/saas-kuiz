import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import prisma from '@/lib/prisma';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ funnelId: string }> }
) {
    try {
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

        return NextResponse.json({ funnel });
    } catch (error) {
        console.error('Error banning funnel:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
