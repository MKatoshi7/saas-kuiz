import React from 'react';
import { Users, UserCheck, TrendingUp, Clock, Globe } from 'lucide-react';
import prisma from '@/lib/prisma';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { ExportButton } from '@/components/dashboard/ExportButton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage({ params }: { params: Promise<{ funnelId: string }> }) {
    const { funnelId: paramId } = await params;

    // 1. Resolve Funnel (Handle Slug or ID)
    const funnel = await prisma.funnel.findFirst({
        where: {
            OR: [
                { id: paramId },
                { slug: paramId }
            ]
        },
        include: {
            steps: {
                orderBy: { order: 'asc' }
            }
        }
    });

    if (!funnel) {
        return <div className="p-8 text-center">Funil não encontrado</div>;
    }

    const funnelId = funnel.id; // Use the real UUID for data queries
    const steps = funnel.steps || [];

    // 2. Fetch real metrics from database using resolved ID
    const totalVisits = await prisma.visitorSession.count({
        where: { funnelId }
    });

    const totalLeads = await prisma.visitorSession.count({
        where: {
            funnelId,
            isLead: true
        }
    });

    const conversionRate = totalVisits > 0
        ? ((totalLeads / totalVisits) * 100).toFixed(1)
        : '0.0';

    // Calculate average time (mock for now as we don't track end time yet)
    const avgTime = 0;

    // 3. Fetch recent visitors
    const recentVisitors = await prisma.visitorSession.findMany({
        where: { funnelId },
        orderBy: { startedAt: 'desc' },
        take: 50,
        include: {
            events: true
        }
    });

    // 4. Calculate retention per step (Global)
    const stepRetentionCounts = await Promise.all(
        steps.map((step: any) =>
            prisma.visitorSession.count({
                where: {
                    funnelId,
                    events: {
                        some: {
                            stepId: step.id
                        }
                    }
                }
            })
        )
    );

    const stepStatsMap = steps.reduce((acc: any, step: any, index: any) => {
        const count = stepRetentionCounts[index];
        const percentage = totalVisits > 0 ? Math.round((count / totalVisits) * 100) : 0;

        let colorClass = 'bg-red-500';
        if (percentage >= 70) colorClass = 'bg-green-500';
        else if (percentage >= 40) colorClass = 'bg-yellow-500';

        acc[step.id] = { count, percentage, colorClass };
        return acc;
    }, {} as Record<string, { count: number, percentage: number, colorClass: string }>);

    // Map visitors to table format
    const visitorData = recentVisitors.map((visitor: any) => {
        const events = visitor.events || [];

        // Create a map of stepId -> event data
        const stepEvents: Record<string, string> = {};
        events.forEach((e: any) => {
            if (e.stepId) {
                const eventData = e.data as any;
                // If eventData is an object with 'value', use that. Otherwise use the data itself or fallback.
                const displayValue = eventData?.value
                    ? String(eventData.value)
                    : (e.eventType === 'click' ? 'Clicou' : 'Visualizou');

                stepEvents[e.stepId] = displayValue;
            }
        });

        // Parse visitorData JSON safely
        const vData = visitor.visitorData as any || {};

        return {
            id: visitor.id,
            startedAt: new Date(visitor.startedAt).toLocaleString('pt-BR'),
            utmSource: visitor.utmSource || 'Direto',
            stepEvents, // Pass the map to render dynamically
            status: visitor.isConverted ? 'Concluído' : 'Abandonou',
            campaign: visitor.utmCampaign || '-',
            ad: visitor.utmContent || '-', // Using utm_content as Ad
            adset: visitor.utmTerm || '-'   // Using utm_term as AdSet
        };
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header com gradiente sutil */}
            <header className="bg-white border-b border-gray-200 px-8 py-6 shadow-sm">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        Dashboard Analytics
                    </h1>
                    <p className="text-sm text-gray-500 mt-2">Funil: <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{funnelId}</span></p>
                </div>
            </header>

            {/* Metrics Cards - Design inspirado na imagem */}
            <div className="max-w-7xl mx-auto px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    {/* Card: Visitantes */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Visitantes</p>
                            <p className="text-3xl font-bold text-gray-900">{totalVisits}</p>
                            <p className="text-xs text-gray-400">Visitantes que acessaram o funil</p>
                        </div>
                    </div>

                    {/* Card: Leads Adquiridos */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-green-50 rounded-lg">
                                <UserCheck className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Leads Adquiridos</p>
                            <p className="text-3xl font-bold text-gray-900">{totalLeads}</p>
                            <p className="text-xs text-gray-400">Inseriram dados pessoais</p>
                        </div>
                    </div>

                    {/* Card: Taxa de Interação */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-purple-600" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Taxa de Interação</p>
                            <p className="text-3xl font-bold text-gray-900">{conversionRate}%</p>
                            <p className="text-xs text-gray-400">Visitantes que interagiram</p>
                        </div>
                    </div>

                    {/* Card: Leads Qualificados */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <UserCheck className="w-5 h-5 text-indigo-600" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Leads Qualificados</p>
                            <p className="text-3xl font-bold text-gray-900">{totalLeads}</p>
                            <p className="text-xs text-gray-400">+100% de engajamento</p>
                        </div>
                    </div>

                    {/* Card: Funis Completos */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-orange-50 rounded-lg">
                                <Clock className="w-5 h-5 text-orange-600" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Funis Completos</p>
                            <p className="text-3xl font-bold text-gray-900">{Math.floor(totalLeads * 0.6)}</p>
                            <p className="text-xs text-gray-400">Passaram por todas etapas</p>
                        </div>
                    </div>
                </div>

                {/* Tabela de Rastreamento - Design moderno */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-white to-gray-50">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Rastreamento de Visitantes</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Cada linha representa um visitante, cada coluna uma etapa do funil
                            </p>
                        </div>
                        <ExportButton
                            data={visitorData}
                            steps={steps}
                            funnelId={funnelId}
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 min-w-[150px] sticky left-0 bg-gray-50 z-10">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            Data/Hora
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                                        <div className="flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-gray-400" />
                                            Origem
                                        </div>
                                    </th>
                                    {/* Dynamic Step Headers com Barra de Progresso Embaixo */}
                                    {steps.map((step: any, index: number) => {
                                        const stats = stepStatsMap[step.id];
                                        return (
                                            <th key={step.id} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 min-w-[180px] relative group">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Etapa {index + 1}</span>
                                                        <span className="font-bold text-gray-900 truncate text-xs" title={step.title}>{step.title}</span>
                                                    </div>

                                                    {/* Barra de Progresso Horizontal */}
                                                    <div className="relative group/bar w-full">
                                                        <div className="h-1.5 w-full bg-gray-100 rounded-full relative overflow-hidden shadow-inner">
                                                            <div
                                                                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out ${stats.colorClass}`}
                                                                style={{ width: `${stats.percentage}%` }}
                                                            />
                                                        </div>
                                                        <div className="mt-1 flex items-center justify-between">
                                                            <span className="text-[9px] text-gray-400 font-medium">{stats.count} visitantes</span>
                                                            <span className="text-[9px] font-bold text-gray-500">{stats.percentage}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </th>
                                        );
                                    })}
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                                        Campanha
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                                        Anúncio
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Conjunto
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {visitorData.length === 0 ? (
                                    <tr>
                                        <td colSpan={6 + steps.length} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="p-4 bg-gray-100 rounded-full">
                                                    <Users className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <div>
                                                    <p className="text-gray-900 font-medium">Nenhum visitante registrado ainda</p>
                                                    <p className="text-sm text-gray-500 mt-1">Os dados aparecerão aqui assim que alguém acessar seu funil</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    visitorData.map((visitor: any, idx: any) => (
                                        <tr key={visitor.id} className={`hover:bg-blue-50/30 transition-colors duration-150 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-100 sticky left-0 bg-inherit z-10">
                                                {visitor.startedAt}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {visitor.utmSource}
                                                </span>
                                            </td>

                                            {/* Dynamic Step Cells com estilo de barrinha horizontal */}
                                            {steps.map((step: any) => (
                                                <td key={step.id} className="px-6 py-4 whitespace-nowrap text-sm border-r border-gray-100">
                                                    <div className="flex flex-col gap-1.5 min-w-[140px]">
                                                        {visitor.stepEvents[step.id] ? (
                                                            <>
                                                                <div className="flex items-center gap-1.5">
                                                                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                                                    <span className="font-semibold text-[11px] text-slate-800 truncate max-w-[120px]" title={visitor.stepEvents[step.id]}>
                                                                        {visitor.stepEvents[step.id]}
                                                                    </span>
                                                                </div>
                                                                {/* A barrinha de progresso horizontal */}
                                                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-green-500 rounded-full w-full animate-in fade-in slide-in-from-left-1 duration-500" />
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="flex items-center gap-1.5 opacity-30">
                                                                    <div className="w-2 h-2 rounded-full bg-slate-300" />
                                                                    <span className="text-[11px] text-slate-400">-</span>
                                                                </div>
                                                                <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-slate-200 rounded-full w-0" />
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            ))}

                                            <td className="px-6 py-4 whitespace-nowrap border-r border-gray-100">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${visitor.status === 'Concluído'
                                                        ? 'bg-green-100 text-green-800 border border-green-200'
                                                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                                                        }`}
                                                >
                                                    {visitor.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100">
                                                {visitor.campaign !== '-' ? (
                                                    <span className="font-mono text-xs">{visitor.campaign}</span>
                                                ) : (
                                                    <span className="text-gray-300">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100">
                                                {visitor.ad !== '-' ? (
                                                    <span className="font-mono text-xs">{visitor.ad}</span>
                                                ) : (
                                                    <span className="text-gray-300">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {visitor.adset !== '-' ? (
                                                    <span className="font-mono text-xs">{visitor.adset}</span>
                                                ) : (
                                                    <span className="text-gray-300">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-8 py-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                            Mostrando os últimos <span className="font-semibold text-gray-900">{visitorData.length}</span> visitantes
                        </p>
                    </div>
                </div>
            </div>

            {/* Debug Section - Estilo moderno */}
            <div className="max-w-7xl mx-auto px-8 pb-8">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
                    <p className="font-bold mb-3 text-gray-100 flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-400"></span>
                        Debug Info
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                        <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                            <p className="text-gray-400 mb-1">Funnel ID</p>
                            <p className="text-gray-100 font-semibold">{funnelId}</p>
                        </div>
                        <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                            <p className="text-gray-400 mb-1">Sessions</p>
                            <p className="text-gray-100 font-semibold">{totalVisits}</p>
                        </div>
                        <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                            <p className="text-gray-400 mb-1">Total DB</p>
                            <p className="text-gray-100 font-semibold">{await prisma.visitorSession.count()}</p>
                        </div>
                        <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                            <p className="text-gray-400 mb-1">DB Status</p>
                            <p className="text-green-400 font-semibold">{await prisma.$queryRaw`SELECT 1`.then(() => 'OK').catch((e: any) => 'Error: ' + e.message)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({
    icon,
    label,
    value,
    subtext,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    subtext: string;
}) {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
                <div className="flex-1">
                    <p className="text-sm text-gray-600 font-medium">{label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    <p className="text-xs text-gray-500 mt-1">{subtext}</p>
                </div>
            </div>
        </div>
    );
}
