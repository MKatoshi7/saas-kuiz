import prisma from "@/lib/prisma";
import { formatDistance, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LeadsActions, LeadDetails } from "./LeadsActions";

export default async function LeadsPage({ params }: { params: Promise<{ funnelId: string }> }) {
    const { funnelId } = await params;

    // Fetch funnel steps for table headers
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

    // Fetch sessions
    const sessions = await prisma.visitorSession.findMany({
        where: { funnelId: funnel.id },
        orderBy: { startedAt: 'desc' },
        take: 50
    });

    const totalVisits = await prisma.visitorSession.count({ where: { funnelId: funnel.id } });
    const totalLeads = await prisma.visitorSession.count({ where: { funnelId: funnel.id, isLead: true } });
    const conversionRate = totalVisits > 0 ? ((totalLeads / totalVisits) * 100).toFixed(1) : "0.0";

    // Calculate average time (simple approximation for now)
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

    // Prepare leads data for client components
    const leadsData = sessions.map((session: any) => ({
        id: session.id,
        sessionId: session.sessionId,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        userAgent: session.userAgent,
        ip: session.ipAddress,
        city: null, // Not available in current schema
        region: null, // Not available in current schema
        country: session.country,
        answersSnapshot: session.answersSnapshot as Record<string, any> || {},
        utmSource: session.utmSource,
        utmMedium: session.utmMedium,
        utmCampaign: session.utmCampaign,
        utmContent: session.utmContent,
        utmTerm: session.utmTerm,
    }));

    return (
        <div className="p-6 h-full overflow-y-auto">
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Dashboard Analytics</h2>
                    <p className="text-slate-500">Funil ID: <span className="font-mono text-xs bg-slate-100 px-1 rounded">{funnelId}</span></p>
                </div>
                <LeadsActions funnelId={funnelId} leads={leadsData} />
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Total de Visitantes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{totalVisits}</div>
                        <p className="text-xs text-slate-400">que acessaram o funil</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Leads Adquiridos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{totalLeads}</div>
                        <p className="text-xs text-slate-400">inseriram dados pessoais</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Taxa de Conversão</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{conversionRate}%</div>
                        <p className="text-xs text-slate-400">visitantes que converteram</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Tempo Médio</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{avgTime}</div>
                        <p className="text-xs text-slate-400">duração no funil</p>
                    </CardContent>
                </Card>
            </div>

            {/* Leads Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Rastreamento de Visitantes</CardTitle>
                    <CardDescription>Cada linha representa um visitante, cada coluna uma etapa do funil</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[180px]">Data/Hora</TableHead>
                                <TableHead className="w-[120px]">ID do Lead</TableHead>
                                <TableHead>Origem</TableHead>
                                {/* Dynamic Step Headers */}
                                {funnel.steps.map((step: any) => (
                                    <TableHead key={step.id} className="min-w-[150px]">
                                        {step.title}
                                    </TableHead>
                                ))}
                                <TableHead>Status</TableHead>
                                <TableHead>Campanha</TableHead>
                                <TableHead>Anúncio</TableHead>
                                <TableHead>Conjunto</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sessions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7 + funnel.steps.length} className="text-center py-8 text-slate-500">
                                        Nenhum visitante registrado ainda.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sessions.map((session: any, index: any) => {
                                    const answers = session.answersSnapshot as Record<string, any> || {};
                                    const leadData = leadsData[index];
                                    return (
                                        <TableRow key={session.id} className="hover:bg-slate-50">
                                            <TableCell className="text-xs text-slate-700 whitespace-nowrap font-medium">
                                                {format(session.startedAt, "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                                            </TableCell>
                                            <TableCell>
                                                <LeadDetails lead={leadData} leadNumber={index + 1} />
                                            </TableCell>
                                            <TableCell>
                                                {session.utmSource ? (
                                                    <Badge variant="outline" className="text-xs font-mono">
                                                        {session.utmSource}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-slate-300 text-xs">-</span>
                                                )}
                                            </TableCell>

                                            {/* Dynamic Step Answers */}
                                            {funnel.steps.map((step: any) => {
                                                const answer = answers[step.id];
                                                return (
                                                    <TableCell key={step.id}>
                                                        {answer ? (
                                                            <div className="font-medium text-xs text-slate-700 truncate max-w-[150px]" title={String(answer)}>
                                                                {String(answer)}
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-200 text-xs">·</span>
                                                        )}
                                                    </TableCell>
                                                );
                                            })}

                                            <TableCell>
                                                {session.completedAt ? (
                                                    <Badge className="bg-green-500 hover:bg-green-600">
                                                        Checkout 💰
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="text-slate-500">
                                                        Abandonou
                                                    </Badge>
                                                )}
                                            </TableCell>

                                            {/* UTM Columns */}
                                            <TableCell className="text-xs text-slate-500">{session.utmCampaign || '-'}</TableCell>
                                            <TableCell className="text-xs text-slate-500">{session.utmContent || '-'}</TableCell>
                                            <TableCell className="text-xs text-slate-500">{session.utmTerm || '-'}</TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
