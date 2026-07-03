import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        await requireAdmin();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = 20;
        const skip = (page - 1) * limit;

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const [
            transactions,
            total,
            totalRevenueAgg,
            thisMonthAgg,
            activeSubs,
            webhookCount,
        ] = await Promise.all([
            prisma.subscriptionTransaction.findMany({
                include: { user: { select: { name: true, email: true } } },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.subscriptionTransaction.count(),
            prisma.subscriptionTransaction.aggregate({
                _sum: { amount: true },
                where: { status: 'paid' },
            }),
            prisma.subscriptionTransaction.aggregate({
                _sum: { amount: true },
                where: { status: 'paid', createdAt: { gte: startOfMonth } },
            }),
            prisma.user.count({ where: { subscriptionStatus: 'active' } }),
            prisma.webhookEvent.count(),
        ])

        return NextResponse.json({
            transactions,
            total,
            pages: Math.ceil(total / limit),
            totalRevenue: totalRevenueAgg._sum.amount || 0,
            thisMonth: thisMonthAgg._sum.amount || 0,
            activeSubs,
            webhookCount,
        })
    } catch (error) {
        console.error('Error listing transactions:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
