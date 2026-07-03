import prisma from "@/lib/prisma";
import { DashboardAnalyticsClient } from "./DashboardAnalyticsClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage({ params }: { params: Promise<{ funnelId: string }> }) {
    const { funnelId: paramId } = await params;

    const funnel = await prisma.funnel.findFirst({
        where: { OR: [{ id: paramId }, { slug: paramId }] },
        include: { steps: { orderBy: { order: 'asc' } } },
    });

    if (!funnel) {
        return <div className="p-8 text-center text-muted-foreground">Funil não encontrado</div>;
    }

    const funnelId = funnel.id;
    const steps = funnel.steps || [];

    const [
        totalVisits,
        totalLeads,
        totalConverted,
        recentSessions,
    ] = await Promise.all([
        prisma.visitorSession.count({ where: { funnelId } }),
        prisma.visitorSession.count({ where: { funnelId, isLead: true } }),
        prisma.visitorSession.count({ where: { funnelId, isConverted: true } }),
        prisma.visitorSession.findMany({
            where: { funnelId },
            orderBy: { startedAt: 'desc' },
            take: 100,
        }),
    ]);

    // Retenção por etapa (quantos visualizaram cada step)
    const stepRetentionCounts = await Promise.all(
        steps.map((step: any) =>
            prisma.visitorSession.count({
                where: {
                    funnelId,
                    events: { some: { stepId: step.id } },
                },
            })
        )
    );

    const stepStats = steps.map((step: any, idx: number) => {
        const count = stepRetentionCounts[idx];
        const percentage = totalVisits > 0 ? Math.round((count / totalVisits) * 100) : 0;
        return { id: step.id, title: step.title, count, percentage };
    });

    // Map visitors para o client
    const visitors = recentSessions.map((s: any) => ({
        id: s.id,
        sessionId: s.sessionId,
        startedAt: s.startedAt.toISOString(),
        completedAt: s.completedAt?.toISOString() || null,
        email: s.email,
        name: s.name,
        phone: s.phone,
        city: (s.visitorData as any)?.city || null,
        country: s.country,
        utmSource: s.utmSource,
        utmMedium: s.utmMedium,
        utmCampaign: s.utmCampaign,
        utmContent: s.utmContent,
        utmTerm: s.utmTerm,
        referrer: s.referrer,
        isLead: s.isLead,
        isConverted: s.isConverted,
        answersSnapshot: (s.answersSnapshot as Record<string, any>) || {},
    }));

    return (
        <DashboardAnalyticsClient
            funnelId={funnelId}
            funnelTitle={funnel.title}
            steps={stepStats}
            visitors={visitors}
            metrics={{
                totalVisits,
                totalLeads,
                totalConverted,
                conversionRate: totalVisits > 0 ? (totalLeads / totalVisits) * 100 : 0,
                completionRate: totalVisits > 0 ? (totalConverted / totalVisits) * 100 : 0,
            }}
        />
    );
}
