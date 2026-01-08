import React from 'react';
import { Users, UserCheck, TrendingUp, Clock } from 'lucide-react';
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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Analytics</h1>
                <p className="text-sm text-gray-500 mt-1">Funil ID: {funnelId}</p>
            </header>

            {/* Metrics Cards */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <MetricCard
                        icon={<Users className="w-6 h-6 text-blue-600" />}
                        label="Total de Visitantes"
                        value={totalVisits.toString()}
                        subtext="que acessaram o funil"
                    />

                    <MetricCard
                        icon={<UserCheck className="w-6 h-6 text-green-600" />}
                        label="Leads Adquiridos"
                        value={totalLeads.toString()}
                        subtext="inseriram dados pessoais"
                    />

                    <MetricCard
                        icon={<TrendingUp className="w-6 h-6 text-indigo-600" />}
                        label="Taxa de Conversão"
                        value={`${conversionRate}%`}
                        subtext="visitantes que converteram"
                    />

                    <MetricCard
                        icon={<Clock className="w-6 h-6 text-orange-600" />}
                        label="Tempo Médio"
                        value={`${Math.floor(avgTime / 60)}m ${avgTime % 60}s`}
                        subtext="duração no funil"
                    />
                </div>

                {/* Matrix View Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Rastreamento de Visitantes</h2>
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
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 min-w-[150px]">
                                        Data/Hora
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                                        Origem
                                    </th>
                                    {/* Dynamic Step Headers with Progress Bar */}
                                    {steps.map((step: any) => {
                                        const stats = stepStatsMap[step.id];
                                        return (
                                            <th key={step.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 min-w-[150px] relative group">
                                                <div className="flex items-end gap-3">
                                                    {/* Vertical Progress Bar */}
                                                    <div className="h-8 w-2 bg-gray-200 rounded-full relative overflow-hidden flex-shrink-0" title={`${stats.percentage}% de retenção`}>
                                                        <div
                                                            className={`absolute bottom-0 left-0 w-full rounded-full transition-all duration-500 ${stats.colorClass}`}
                                                            style={{ height: `${stats.percentage}%` }}
                                                        />
                                                    </div>

                                                    <div className="flex flex-col">
                                                        <span>{step.title}</span>
                                                        <span className="text-[10px] text-gray-400 font-normal mt-0.5">
                                                            {stats.count} visitantes ({stats.percentage}%)
                                                        </span>
                                                    </div>
                                                </div>
                                            </th>
                                        );
                                    })}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                                        Campanha
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                                        Anúncio
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Conjunto
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {visitorData.length === 0 ? (
                                    <tr>
                                        <td colSpan={6 + steps.length} className="px-6 py-8 text-center text-gray-500">
                                            Nenhum visitante registrado ainda.
                                        </td>
                                    </tr>
                                ) : (
                                    visitorData.map((visitor: any, idx: any) => (
                                        <tr key={visitor.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                                                {visitor.startedAt}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">
                                                {visitor.utmSource}
                                            </td>

                                            {/* Dynamic Step Cells */}
                                            {steps.map((step: any) => (
                                                <td key={step.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">
                                                    {visitor.stepEvents[step.id] || '-'}
                                                </td>
                                            ))}

                                            <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                                                <span
                                                    className={`px-2 py-1 text-xs font-medium rounded-full ${visitor.status === 'Concluído'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                        }`}
                                                >
                                                    {visitor.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">
                                                {visitor.campaign}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">
                                                {visitor.ad}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {visitor.adset}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                            Mostrando os últimos {visitorData.length} visitantes
                        </p>
                    </div>
                </div>
            </div>

            {/* Debug Section */}
            <div className="px-6 pb-8">
                <div className="bg-gray-100 p-4 rounded text-xs font-mono text-gray-600">
                    <p className="font-bold mb-2">Debug Info:</p>
                    <p>Funnel ID (URL): {funnelId}</p>
                    <p>Sessions for this Funnel: {totalVisits}</p>
                    <p>Total Sessions in DB: {await prisma.visitorSession.count()}</p>
                    <p>DB Connection: {await prisma.$queryRaw`SELECT 1`.then(() => 'OK').catch((e: any) => 'Error: ' + e.message)}</p>
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
