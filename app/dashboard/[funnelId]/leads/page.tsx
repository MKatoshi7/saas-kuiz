import prisma from "@/lib/prisma";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadsActions } from "./LeadsActions";
import { VisitorsTable } from "./VisitorsTable";
import { TabBar, type TabItem } from "@/components/ui/TabBar";
import { LeadsInbox } from "./LeadsInbox";
import { Users, UserCheck, Inbox } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function LeadsPage({ params, searchParams }: {
    params: Promise<{ funnelId: string }>;
    searchParams: Promise<{ tab?: string }>;
}) {
    const { funnelId } = await params;
    const { tab = 'visitors' } = await searchParams;

    const funnel = await prisma.funnel.findFirst({
        where: {
            OR: [
                { id: funnelId },
                { slug: funnelId }
            ]
        },
        include: {
            steps: {
                orderBy: { order: 'asc' }
            }
        }
    });

    if (!funnel) return <div>Funil não encontrado</div>;

    const sessions = await prisma.visitorSession.findMany({
        where: { funnelId: funnel.id },
        orderBy: { startedAt: 'desc' },
        take: 200
    });

    const totalVisits = await prisma.visitorSession.count({ where: { funnelId: funnel.id } });
    const totalLeads = await prisma.visitorSession.count({ where: { funnelId: funnel.id, isLead: true } });
    const conversionRate = totalVisits > 0 ? ((totalLeads / totalVisits) * 100).toFixed(1) : "0.0";

    const completedSessions = sessions.filter((s: any) => s.completedAt && s.startedAt);
    let avgTime = "0s";
    if (completedSessions.length > 0) {
        const totalDuration = completedSessions.reduce((acc: number, s: any) => {
            return acc + (new Date(s.completedAt!).getTime() - new Date(s.startedAt).getTime());
        }, 0);
        const avgMs = totalDuration / completedSessions.length;
        const minutes = Math.floor(avgMs / 60000);
        const seconds = Math.floor((avgMs % 60000) / 1000);
        avgTime = `${minutes}m ${seconds}s`;
    }

    const visitorsData = sessions.map((session: any) => ({
        id: session.id,
        sessionId: session.sessionId,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        userAgent: session.userAgent,
        ip: session.ipAddress,
        city: (session.visitorData as any)?.city || null,
        region: (session.visitorData as any)?.region || null,
        country: session.country,
        deviceType: session.deviceType,
        browser: session.browser,
        referrer: session.referrer,
        fbc: (session.visitorData as any)?.fbc || null,
        fbp: (session.visitorData as any)?.fbp || null,
        answersSnapshot: session.answersSnapshot as Record<string, any> || {},
        utmSource: session.utmSource,
        utmMedium: session.utmMedium,
        utmCampaign: session.utmCampaign,
        utmContent: session.utmContent,
        utmTerm: session.utmTerm,
        isLead: session.isLead,
        isConverted: session.isConverted,
        email: session.email,
        name: session.name,
        phone: session.phone,
    }));

    const stepStats = funnel.steps.map((step: any) => {
        const count = sessions.filter((s: any) => {
            const answers = s.answersSnapshot as Record<string, any> || {};
            return !!answers[step.id];
        }).length;
        const percentage = sessions.length > 0 ? Math.round((count / sessions.length) * 100) : 0;
        return { id: step.id, title: step.title, count, percentage };
    });

    const tabs: TabItem[] = [
        { value: 'visitors', label: 'Visitantes', count: totalVisits, icon: Users },
        { value: 'leads', label: 'Leads', count: totalLeads, icon: Inbox },
    ];

    return (
        <div className="h-full overflow-y-auto bg-[#F5F5F7]">
            <div className="max-w-[1400px] mx-auto px-6 py-8">
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Respostas & Leads</h1>
                        <p className="text-muted-foreground mt-1">
                            Acompanhe cada visita e capture leads em tempo real.
                        </p>
                    </div>
                    <LeadsActions
                        funnelId={funnelId}
                        visitors={visitorsData}
                        steps={funnel.steps}
                    />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Visitantes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{totalVisits}</div>
                            <p className="text-xs text-muted-foreground mt-1">que acessaram o funil</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Leads Adquiridos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-emerald-600">{totalLeads}</div>
                            <p className="text-xs text-muted-foreground mt-1">inseriram dados pessoais</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Conversão</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-[#007AFF]">{conversionRate}%</div>
                            <p className="text-xs text-muted-foreground mt-1">visitantes que converteram</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Tempo Médio</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-amber-600">{avgTime}</div>
                            <p className="text-xs text-muted-foreground mt-1">duração no funil</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="mb-4">
                    <TabBar
                        tabs={tabs}
                        activeTab={tab}
                        paramName="tab"
                    />
                </div>

                {tab === 'leads' ? (
                    <LeadsInbox
                        visitors={visitorsData}
                        steps={funnel.steps}
                        funnelId={funnelId}
                    />
                ) : (
                    <VisitorsTable
                        visitors={visitorsData}
                        steps={funnel.steps}
                        stepStats={stepStats}
                        funnelId={funnelId}
                    />
                )}
            </div>
        </div>
    );
}
