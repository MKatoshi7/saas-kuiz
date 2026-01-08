import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        await requireAdmin();
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = 10;
        const skip = (page - 1) * limit;

        const where = search ? {
            OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { user: { email: { contains: search, mode: 'insensitive' } } }
            ]
        } : {};

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const [funnelsData, total] = await Promise.all([
            prisma.funnel.findMany({
                where: where as any,
                include: {
                    user: { select: { name: true, email: true } },
                    _count: { select: { steps: true, sessions: true } }
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.funnel.count({ where: where as any })
        ]);

        // Enhance with monthly stats
        const funnels = await Promise.all(funnelsData.map(async (f) => {
            const sessionsThisMonth = await prisma.visitorSession.count({
                where: {
                    funnelId: f.id,
                    startedAt: { gte: startOfMonth }
                }
            });
            return {
                ...f,
                sessionsThisMonth,
                // Ensure these fields are returned even if null (though prisma does this)
                isBanned: f.isBanned,
                banReason: f.banReason
            };
        }));

        return NextResponse.json({ funnels, total, pages: Math.ceil(total / limit) });
    } catch (error) {
        console.error('Error listing funnels:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
