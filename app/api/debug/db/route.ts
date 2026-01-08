import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const funnelId = 'cmjcbu9gq005ybouyai4cbfe3';

    try {
        const count = await prisma.visitorSession.count({
            where: { funnelId }
        });

        const sessions = await prisma.visitorSession.findMany({
            where: { funnelId },
            take: 5,
            orderBy: { startedAt: 'desc' }
        });

        return NextResponse.json({
            funnelId,
            count,
            sessions
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
