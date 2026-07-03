import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        await requireAdmin();

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const startOfLastMonth = new Date(startOfMonth);
        startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

        const [
            totalUsers,
            activeSubs,
            totalFunnels,
            totalRevenueAgg,
            bannedFunnels,
            newUsersThisMonth,
            newUsersLastMonth,
            leadsThisMonth,
            totalLeads,
            // 12 meses de histórico de novos usuários
            monthlyData,
            recentActivity,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { subscriptionStatus: 'active' } }),
            prisma.funnel.count(),
            prisma.subscriptionTransaction.aggregate({
                _sum: { amount: true },
                where: { status: 'paid' },
            }),
            prisma.funnel.count({ where: { isBanned: true } }),
            prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
            prisma.user.count({
                where: {
                    createdAt: { gte: startOfLastMonth, lt: startOfMonth },
                },
            }),
            prisma.visitorSession.count({
                where: { isLead: true, startedAt: { gte: startOfMonth } },
            }),
            prisma.visitorSession.count({ where: { isLead: true } }),
            prisma.$queryRaw<{ month: Date; count: bigint }[]>`
                SELECT
                    date_trunc('month', "createdAt") AS month,
                    COUNT(*) AS count
                FROM "users"
                WHERE "createdAt" >= NOW() - INTERVAL '12 months'
                GROUP BY 1
                ORDER BY 1 ASC
            `.catch(() => [] as { month: Date; count: bigint }[]),
            prisma.adminAction.findMany({
                take: 8,
                orderBy: { createdAt: 'desc' },
                include: {
                    admin: { select: { name: true, email: true } },
                    targetUser: { select: { name: true, email: true } },
                },
            }),
        ])

        const totalRevenue = totalRevenueAgg._sum.amount || 0
        const userGrowth = newUsersLastMonth > 0
            ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100
            : newUsersThisMonth > 0 ? 100 : 0

        // Normalizar monthlyData para 12 entradas
        const now = new Date()
        const months: { label: string; count: number }[] = []
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const label = d.toLocaleString('pt-BR', { month: 'short' }).replace('.', '')
            const found = monthlyData.find((m) => {
                const md = new Date(m.month)
                return md.getFullYear() === d.getFullYear() && md.getMonth() === d.getMonth()
            })
            months.push({ label, count: found ? Number(found.count) : 0 })
        }

        return NextResponse.json({
            totalUsers,
            activeSubs,
            totalFunnels,
            totalRevenue,
            bannedFunnels,
            newUsersThisMonth,
            leadsThisMonth,
            totalLeads,
            userGrowth,
            monthlyData: months,
            recentActivity,
        })
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
