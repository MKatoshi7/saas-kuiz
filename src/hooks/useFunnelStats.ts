'use client';

import { useEffect, useState } from 'react';

interface FunnelStats {
    views: number;
    leads: number;
    conversionRate: number;
    lastUpdated: Date | null;
    isLoading: boolean;
}

export function useFunnelStats(funnelId: string) {
    const [stats, setStats] = useState<FunnelStats>({
        views: 0,
        leads: 0,
        conversionRate: 0,
        lastUpdated: null,
        isLoading: true,
    });

    useEffect(() => {
        async function fetchStats() {
            try {
                const response = await fetch(`/api/funnels/${funnelId}/leads`);

                if (!response.ok) {
                    // Silenciar erro - usar valores padrão
                    setStats({
                        views: 0,
                        leads: 0,
                        conversionRate: 0,
                        lastUpdated: new Date(),
                        isLoading: false,
                    });
                    return;
                }

                const data = await response.json();

                const totalViews = data.sessions?.length || 0;
                const totalLeads = data.sessions?.filter((s: any) => s.isLead).length || 0;
                const conversionRate = totalViews > 0 ? (totalLeads / totalViews) * 100 : 0;

                setStats({
                    views: totalViews,
                    leads: totalLeads,
                    conversionRate: Math.round(conversionRate * 10) / 10,
                    lastUpdated: new Date(),
                    isLoading: false,
                });
            } catch (error) {
                // Silenciar erro no console - apenas usar valores padrão
                setStats({
                    views: 0,
                    leads: 0,
                    conversionRate: 0,
                    lastUpdated: new Date(),
                    isLoading: false,
                });
            }
        }

        if (funnelId) {
            fetchStats();
        }
    }, [funnelId]);

    return stats;
}
