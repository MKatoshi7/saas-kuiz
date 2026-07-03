import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ funnelId: string }> }
) {
    try {
        await requireAdmin()
        const { funnelId } = await params

        const funnel = await prisma.funnel.findUnique({
            where: { id: funnelId },
            include: {
                user: {
                    select: { id: true, name: true, email: true, subscriptionStatus: true, subscriptionPlan: true, createdAt: true },
                },
                steps: {
                    orderBy: { order: 'asc' },
                    include: { _count: { select: { components: true } } },
                },
                _count: { select: { sessions: true } },
            },
        })

        if (!funnel) {
            return NextResponse.json({ error: 'Funnel not found' }, { status: 404 })
        }

        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const start30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

        // Métricas agregadas
        const [
            totalSessions,
            sessionsThisMonth,
            totalLeads,
            leadsThisMonth,
            totalConverted,
            convertedThisMonth,
            uniqueVisitors,
            recentSessions,
            topUtmSources,
            // retenção por step
            stepRetention,
            // sessions por dia (últimos 30)
            dailySessions,
        ] = await Promise.all([
            prisma.visitorSession.count({ where: { funnelId } }),
            prisma.visitorSession.count({ where: { funnelId, startedAt: { gte: startOfMonth } } }),
            prisma.visitorSession.count({ where: { funnelId, isLead: true } }),
            prisma.visitorSession.count({ where: { funnelId, isLead: true, startedAt: { gte: startOfMonth } } }),
            prisma.visitorSession.count({ where: { funnelId, isConverted: true } }),
            prisma.visitorSession.count({ where: { funnelId, isConverted: true, startedAt: { gte: startOfMonth } } }),
            prisma.visitorSession.findMany({
                where: { funnelId },
                select: { sessionId: true },
                distinct: ['sessionId'],
            }).then((r) => r.length),
            prisma.visitorSession.findMany({
                where: { funnelId },
                orderBy: { startedAt: 'desc' },
                take: 50,
                select: {
                    id: true,
                    sessionId: true,
                    email: true,
                    name: true,
                    phone: true,
                    isLead: true,
                    isConverted: true,
                    startedAt: true,
                    completedAt: true,
                    utmSource: true,
                    utmMedium: true,
                    utmCampaign: true,
                    country: true,
                    deviceType: true,
                },
            }),
            prisma.visitorSession.groupBy({
                by: ['utmSource'],
                where: { funnelId, utmSource: { not: null } },
                _count: { utmSource: true },
                orderBy: { _count: { utmSource: 'desc' } },
                take: 10,
            }),
            prisma.$queryRawUnsafe<{ stepId: string; count: bigint }[]>(
                `SELECT "stepId", COUNT(DISTINCT "sessionId") as count
                 FROM "events"
                 WHERE "eventType" = 'view'
                   AND "sessionId" IN (SELECT id FROM "visitor_sessions" WHERE "funnelId" = $1)
                   AND "stepId" IS NOT NULL
                 GROUP BY "stepId"
                 ORDER BY count DESC`,
                funnelId
            ).catch(() => [] as { stepId: string; count: bigint }[]),
            prisma.$queryRawUnsafe<{ day: Date; count: bigint }[]>(
                `SELECT date_trunc('day', "startedAt") as day, COUNT(*) as count
                 FROM "visitor_sessions"
                 WHERE "funnelId" = $1 AND "startedAt" >= $2
                 GROUP BY 1 ORDER BY 1 ASC`,
                funnelId,
                start30
            ).catch(() => [] as { day: Date; count: bigint }[]),
        ])

        const conversionRate = totalSessions > 0 ? (totalLeads / totalSessions) * 100 : 0
        const completionRate = totalSessions > 0 ? (totalConverted / totalSessions) * 100 : 0

        // Map step retention para o front
        const stepStats = funnel.steps.map((step) => {
            const r = stepRetention.find((x) => x.stepId === step.id)
            const count = r ? Number(r.count) : 0
            return {
                id: step.id,
                title: step.title,
                order: step.order,
                components: step._count.components,
                visitors: count,
                retention: totalSessions > 0 ? Math.round((count / totalSessions) * 100) : 0,
            }
        })

        // Daily chart (preencher 30 dias)
        const days: { day: string; count: number; leads: number }[] = []
        for (let i = 29; i >= 0; i--) {
            const d = new Date()
            d.setHours(0, 0, 0, 0)
            d.setDate(d.getDate() - i)
            const found = dailySessions.find((x) => {
                const dd = new Date(x.day)
                return dd.getFullYear() === d.getFullYear() && dd.getMonth() === d.getMonth() && dd.getDate() === d.getDate()
            })
            days.push({
                day: d.toISOString().split('T')[0],
                count: found ? Number(found.count) : 0,
                leads: 0,
            })
        }

        return NextResponse.json({
            funnel,
            metrics: {
                totalSessions,
                sessionsThisMonth,
                totalLeads,
                leadsThisMonth,
                totalConverted,
                convertedThisMonth,
                uniqueVisitors,
                conversionRate: Math.round(conversionRate * 10) / 10,
                completionRate: Math.round(completionRate * 10) / 10,
            },
            stepStats,
            topUtmSources: topUtmSources.map((s) => ({ source: s.utmSource, count: s._count.utmSource })),
            recentSessions,
            dailyChart: days,
        })
    } catch (error) {
        console.error('Error fetching funnel details:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
