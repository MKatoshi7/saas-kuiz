'use client';

import React, { useEffect, useState } from 'react';
import { Users, CreditCard, Filter, DollarSign, Loader2, TrendingUp, ArrowUpRight } from 'lucide-react';

interface Stats {
    totalUsers: number;
    activeSubs: number;
    totalFunnels: number;
    totalRevenue: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/stats')
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center h-full min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-black" /></div>;
    }

    if (!stats) return <div>Erro ao carregar estatísticas.</div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Visão Geral</h2>
                    <p className="text-gray-500 mt-1">Bem-vindo de volta ao painel de controle.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-full border border-black/5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Sistema Operacional
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Receita Total"
                    value={`R$ ${stats.totalRevenue.toFixed(2)}`}
                    icon={<DollarSign className="w-6 h-6 text-white" />}
                    bg="bg-black text-white"
                    trend="+12.5%"
                />
                <StatCard
                    title="Usuários Totais"
                    value={stats.totalUsers}
                    icon={<Users className="w-6 h-6 text-blue-600" />}
                    bg="bg-white"
                    iconBg="bg-blue-50"
                />
                <StatCard
                    title="Assinaturas Ativas"
                    value={stats.activeSubs}
                    icon={<CreditCard className="w-6 h-6 text-green-600" />}
                    bg="bg-white"
                    iconBg="bg-green-50"
                />
                <StatCard
                    title="Funis Criados"
                    value={stats.totalFunnels}
                    icon={<Filter className="w-6 h-6 text-purple-600" />}
                    bg="bg-white"
                    iconBg="bg-purple-50"
                />
            </div>

            {/* Placeholder for Charts or Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-black/5 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg">Crescimento de Usuários</h3>
                        <button className="text-sm text-gray-400 hover:text-black transition-colors">Ver Detalhes</button>
                    </div>
                    <div className="h-64 flex items-end justify-between gap-2">
                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 100].map((h, i) => (
                            <div key={i} className="w-full bg-gray-100 rounded-t-lg hover:bg-black transition-colors duration-300 relative group" style={{ height: `${h}%` }}>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    {h * 10}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm">
                    <h3 className="font-bold text-lg mb-6">Atividade Recente</h3>
                    <div className="space-y-6">
                        {[1, 2, 3, 4].map((_, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0">
                                    <TrendingUp className="w-4 h-4 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Novo usuário registrado</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Há 2 minutos</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, bg, iconBg, trend }: { title: string; value: string | number; icon: React.ReactNode; bg: string; iconBg?: string; trend?: string }) {
    return (
        <div className={`${bg} p-6 rounded-3xl border border-black/5 shadow-sm hover:shadow-md transition-all duration-300 group`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconBg || 'bg-white/20'}`}>
                    {icon}
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                        <TrendingUp className="w-3 h-3" />
                        {trend}
                    </div>
                )}
            </div>
            <div>
                <p className={`text-sm font-medium mb-1 ${bg.includes('black') ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
                <h3 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    {value}
                    <ArrowUpRight className={`w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity ${bg.includes('black') ? 'text-gray-400' : 'text-gray-400'}`} />
                </h3>
            </div>
        </div>
    );
}
