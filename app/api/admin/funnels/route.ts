import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        await requireAdmin();
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || 'all';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = 20;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search, mode: 'insensitive' } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
                { user: { name: { contains: search, mode: 'insensitive' } } },
            ];
        }
        if (status === 'banned') where.isBanned = true;
        else if (status === 'published') { where.status = 'published'; where.isBanned = false; }
        else if (status === 'draft') { where.status = 'draft'; where.isBanned = false; }
        else if (status === 'all') {
            // no extra filter
        }

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const [funnelsData, total] = await Promise.all([
            prisma.funnel.findMany({
                where: where as any,
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    _count: { select: { steps: true, sessions: true } }
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.funnel.count({ where: where as any })
        ]);

        const funnels = await Promise.all(funnelsData.map(async (f) => {
            const sessionsThisMonth = await prisma.visitorSession.count({
                where: {
                    funnelId: f.id,
                    startedAt: { gte: startOfMonth }
                }
            });
            return { ...f, sessionsThisMonth };
        }));

        return NextResponse.json({ funnels, total, pages: Math.ceil(total / limit) });
    } catch (error) {
        console.error('Error listing funnels:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
