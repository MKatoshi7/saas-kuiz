import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        await requireAdmin();

        const [totalUsers, activeSubs, totalFunnels, totalRevenue] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { subscriptionStatus: 'active' } }),
            prisma.funnel.count(),
            prisma.subscriptionTransaction.aggregate({
                _sum: { amount: true },
                where: { status: 'paid' }
            })
        ]);

        return NextResponse.json({
            totalUsers,
            activeSubs,
            totalFunnels,
            totalRevenue: totalRevenue._sum.amount || 0
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
