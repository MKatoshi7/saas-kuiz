'use client';

import React, { useState, useEffect } from 'react';
import {
    Users,
    CreditCard,
    Filter,
    DollarSign,
    TrendingUp,
    Loader2,
    Activity,
    ScrollText,
    Shield,
    ArrowUpRight,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AdminStats {
    totalUsers: number;
    activeSubs: number;
    totalFunnels: number;
    totalRevenue: number;
    bannedFunnels: number;
    newUsersThisMonth: number;
    leadsThisMonth: number;
    totalLeads: number;
    userGrowth: number;
    monthlyData: { label: string; count: number }[];
    recentActivity: any[];
}

const ACTION_LABELS: Record<string, { label: string; color: 'primary' | 'warning' | 'destructive' | 'info' | 'secondary' | 'success' | 'outline' | 'ghost' | 'default' }> = {
    ban_funnel: { label: 'Baniu funil', color: 'destructive' },
    unban_funnel: { label: 'Desbaniu funil', color: 'success' },
    edit_user: { label: 'Editou usuário', color: 'info' },
    impersonate_user: { label: 'Acessou conta', color: 'warning' },
    change_role: { label: 'Alterou role', color: 'warning' },
    change_subscription: { label: 'Alterou assinatura', color: 'primary' },
    reset_password: { label: 'Resetou senha', color: 'warning' },
    delete_funnel: { label: 'Deletou funil', color: 'destructive' },
    delete_user: { label: 'Deletou usuário', color: 'destructive' },
    create_user: { label: 'Criou usuário', color: 'success' },
    system_message: { label: 'Mensagem do sistema', color: 'info' },
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/stats')
            .then((res) => res.json())
            .then((data) => {
                setStats(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="space-y-2">
                    <Skeleton className="h-9 w-48" />
                    <Skeleton className="h-5 w-72" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-2xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
                    <Skeleton className="h-80 rounded-2xl" />
                </div>
            </div>
        );
    }

    if (!stats) return <div>Erro ao carregar estatísticas.</div>;

    const maxCount = Math.max(...stats.monthlyData.map((m) => m.count), 1);

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
                    <p className="text-muted-foreground mt-1">
                        Resumo executivo da plataforma em tempo real.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-emerald-50 border border-emerald-200/60 px-3.5 py-2 rounded-full">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-soft" />
                    Sistema Operacional
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Receita Total"
                    value={`R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    icon={DollarSign}
                    variant="dark"
                />
                <StatCard
                    label="Usuários Totais"
                    value={stats.totalUsers}
                    icon={Users}
                    trend={{ value: stats.userGrowth, label: `${stats.newUsersThisMonth} este mês` }}
                />
                <StatCard
                    label="Assinaturas Ativas"
                    value={stats.activeSubs}
                    icon={CreditCard}
                />
                <StatCard
                    label="Funis Criados"
                    value={stats.totalFunnels}
                    icon={Filter}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Crescimento de Usuários</CardTitle>
                                <CardDescription>
                                    Novos cadastros nos últimos 12 meses
                                </CardDescription>
                            </div>
                            <Badge variant="success" dot>
                                +{stats.newUsersThisMonth} este mês
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-end justify-between gap-2">
                            {stats.monthlyData.map((m, i) => {
                                const heightPct = (m.count / maxCount) * 100
                                const isCurrentMonth = i === stats.monthlyData.length - 1
                                return (
                                    <div
                                        key={i}
                                        className="flex-1 flex flex-col items-center gap-2 group"
                                    >
                                        <div className="relative w-full h-full flex items-end">
                                            <div
                                                className={`w-full rounded-t-lg transition-all duration-700 ease-out group-hover:opacity-90 ${
                                                    isCurrentMonth
                                                        ? 'bg-gradient-to-t from-[#007AFF] to-[#4DA3FF]'
                                                        : 'bg-secondary group-hover:bg-foreground/30'
                                                }`}
                                                style={{ height: `${Math.max(heightPct, 4)}%` }}
                                            />
                                            <div className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                <div className="bg-foreground text-background text-xs font-semibold rounded-lg px-2 py-1 whitespace-nowrap shadow-lg">
                                                    {m.count} {m.count === 1 ? 'usuário' : 'usuários'}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                                            {m.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Atividade Recente</CardTitle>
                        <CardDescription>Últimas ações administrativas</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.recentActivity.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    Nenhuma atividade recente
                                </p>
                            )}
                            {stats.recentActivity.map((a) => {
                                const meta = ACTION_LABELS[a.action] || { label: a.action, color: 'secondary' as const }
                                return (
                                    <div key={a.id} className="flex items-start gap-3">
                                        <Avatar
                                            name={a.admin?.name || a.admin?.email}
                                            size="sm"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm">
                                                <span className="font-medium text-foreground">
                                                    {a.admin?.name || a.admin?.email?.split('@')[0]}
                                                </span>{' '}
                                                <span className="text-muted-foreground">
                                                    {meta.label.toLowerCase()}
                                                </span>
                                            </p>
                                            {a.targetUser && (
                                                <p className="text-xs text-muted-foreground truncate">
                                                    → {a.targetUser.email}
                                                </p>
                                            )}
                                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                                {formatDistanceToNow(new Date(a.createdAt), {
                                                    addSuffix: true,
                                                    locale: ptBR,
                                                })}
                                            </p>
                                        </div>
                                        <Badge variant={meta.color} size="sm">
                                            {meta.label.split(' ')[0]}
                                        </Badge>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card hover>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <TrendingUp className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Leads do Mês
                            </p>
                            <p className="text-2xl font-bold">{stats.leadsThisMonth.toLocaleString('pt-BR')}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card hover>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center">
                            <Activity className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Leads Totais
                            </p>
                            <p className="text-2xl font-bold">{stats.totalLeads.toLocaleString('pt-BR')}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card hover>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center">
                            <Shield className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Funis Banidos
                            </p>
                            <p className="text-2xl font-bold">{stats.bannedFunnels}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
