'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatCard } from '@/components/ui/StatCard';
import { NewProjectDialog } from '@/components/dashboard/NewProjectDialog';
import { FunnelCard } from '@/components/dashboard/FunnelCard';
import {
    Plus, Search, LayoutGrid, List as ListIcon, Filter, ArrowUpDown,
    TrendingUp, Users, Eye, MousePointer, Zap, Sparkles, ArrowRight,
    CalendarClock, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type StatusFilter = 'all' | 'published' | 'draft' | 'banned'
type SortBy = 'recent' | 'oldest' | 'name' | 'leads' | 'views'

interface DashboardClientProps {
    projects: any[];
    isSubscriptionExpired?: boolean;
    userName?: string | null;
    userPlan?: string;
}

export function DashboardClient({ projects, isSubscriptionExpired, userName, userPlan }: DashboardClientProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [sortBy, setSortBy] = useState<SortBy>('recent');

    // Métricas agregadas
    const stats = useMemo(() => {
        const totalLeads = projects.reduce((acc, p) => {
            // Cada project tem _count.sessions; usamos como proxy até ter dados reais
            return acc + (p._count?.sessions || 0)
        }, 0)
        const published = projects.filter((p) => p.status === 'published' && !p.isBanned).length
        const drafts = projects.filter((p) => p.status === 'draft' && !p.isBanned).length
        return { totalLeads, published, drafts, total: projects.length }
    }, [projects])

    // Filtragem + sort
    const filteredProjects = useMemo(() => {
        let list = [...projects]
        if (search) {
            const q = search.toLowerCase()
            list = list.filter((p) =>
                p.title?.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q) ||
                p.slug?.toLowerCase().includes(q)
            )
        }
        if (statusFilter !== 'all') {
            list = list.filter((p) => {
                if (statusFilter === 'banned') return p.isBanned
                if (statusFilter === 'published') return p.status === 'published' && !p.isBanned
                if (statusFilter === 'draft') return p.status === 'draft' && !p.isBanned
                return true
            })
        }
        list.sort((a, b) => {
            switch (sortBy) {
                case 'recent': return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                case 'oldest': return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
                case 'name': return (a.title || '').localeCompare(b.title || '')
                default: return 0
            }
        })
        return list
    }, [projects, search, statusFilter, sortBy])

    const greeting = useMemo(() => {
        const h = new Date().getHours()
        if (h < 12) return 'Bom dia'
        if (h < 18) return 'Boa tarde'
        return 'Boa noite'
    }, [])

    return (
        <div className="min-h-screen bg-[#F5F5F7]">
            <div className="max-w-[1400px] mx-auto px-6 py-8">
                {/* HERO */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                        <div>
                            <p className="text-sm text-muted-foreground font-medium mb-1">{greeting},</p>
                            <h1 className="text-4xl font-bold tracking-tight text-balance">
                                {userName || 'Bem-vindo de volta'} 👋
                            </h1>
                            <p className="text-muted-foreground mt-2 text-base">
                                {projects.length === 0
                                    ? 'Vamos criar seu primeiro funil interativo.'
                                    : `${stats.total} ${stats.total === 1 ? 'projeto' : 'projetos'} · ${stats.published} publicados`}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/admin" className="hidden">
                                {/* admin link reservado para futuro */}
                            </Link>
                            <Button
                                onClick={() => setDialogOpen(true)}
                                disabled={isSubscriptionExpired}
                                size="lg"
                                leftIcon={<Plus className="w-4 h-4" />}
                                className="shadow-lg shadow-blue-500/20"
                            >
                                Novo Funil
                            </Button>
                        </div>
                    </div>

                    {isSubscriptionExpired && (
                        <div className="mt-5 flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-50 border border-red-200/60 text-red-700">
                            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                            <div className="flex-1 text-sm">
                                <p className="font-semibold">Assinatura expirada</p>
                                <p className="text-xs text-red-600/80">Renove para voltar a editar funis e capturar leads.</p>
                            </div>
                            <Link href="/dashboard/account">
                                <Button size="sm" variant="outline">Renovar</Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* KPI ROW */}
                {projects.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <StatCard
                            label="Total de Funis"
                            value={stats.total}
                            icon={Zap}
                        />
                        <StatCard
                            label="Publicados"
                            value={stats.published}
                            icon={Activity}
                            variant="primary"
                        />
                        <StatCard
                            label="Sessões capturadas"
                            value={stats.totalLeads}
                            icon={Users}
                        />
                        <StatCard
                            label="Rascunhos"
                            value={stats.drafts}
                            icon={MousePointer}
                        />
                    </div>
                )}

                {/* TOOLBAR */}
                {projects.length > 0 && (
                    <div className="flex flex-col md:flex-row gap-3 mb-6">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            <Input
                                placeholder="Buscar por título, slug…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 h-11"
                            />
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Status filter */}
                            <div className="inline-flex h-11 items-center gap-1 rounded-xl border border-border/60 bg-background p-1">
                                {[
                                    { v: 'all', l: 'Todos' },
                                    { v: 'published', l: 'Publicados' },
                                    { v: 'draft', l: 'Rascunhos' },
                                ].map((opt) => (
                                    <button
                                        key={opt.v}
                                        onClick={() => setStatusFilter(opt.v as StatusFilter)}
                                        className={cn(
                                            'h-9 px-3 rounded-lg text-xs font-medium transition-all',
                                            statusFilter === opt.v
                                                ? 'bg-foreground text-background shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground'
                                        )}
                                    >
                                        {opt.l}
                                    </button>
                                ))}
                            </div>

                            {/* Sort */}
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                                    className="h-11 pl-9 pr-3 rounded-xl border border-border/60 bg-background text-sm font-medium appearance-none cursor-pointer hover:border-foreground/30"
                                >
                                    <option value="recent">Mais recentes</option>
                                    <option value="oldest">Mais antigos</option>
                                    <option value="name">Nome A-Z</option>
                                </select>
                                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                            </div>

                            {/* View toggle */}
                            <div className="inline-flex h-11 items-center gap-1 rounded-xl border border-border/60 bg-background p-1">
                                <button
                                    onClick={() => setView('grid')}
                                    className={cn(
                                        'h-9 w-9 rounded-lg flex items-center justify-center transition-all',
                                        view === 'grid' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
                                    )}
                                    title="Grid"
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setView('list')}
                                    className={cn(
                                        'h-9 w-9 rounded-lg flex items-center justify-center transition-all',
                                        view === 'list' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
                                    )}
                                    title="Lista"
                                >
                                    <ListIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* CONTENT */}
                {projects.length === 0 ? (
                    <EmptyDashboard onCreate={() => setDialogOpen(true)} disabled={isSubscriptionExpired} />
                ) : filteredProjects.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="p-2">
                            <EmptyState
                                title="Nenhum funil corresponde à busca"
                                description="Tente ajustar os filtros ou criar um novo projeto."
                                action={
                                    <Button onClick={() => { setSearch(''); setStatusFilter('all') }} variant="outline">
                                        Limpar filtros
                                    </Button>
                                }
                                icon={<Search className="w-7 h-7" />}
                            />
                        </CardContent>
                    </Card>
                ) : (
                    <div className={cn(
                        'gap-5',
                        view === 'grid'
                            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                            : 'flex flex-col'
                    )}>
                        {filteredProjects.map((project: any) => (
                            <FunnelCard
                                key={project.id}
                                project={project}
                                isSubscriptionExpired={isSubscriptionExpired}
                                layout={view}
                            />
                        ))}
                    </div>
                )}
            </div>

            <NewProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
        </div>
    );
}

function EmptyDashboard({ onCreate, disabled }: { onCreate: () => void; disabled?: boolean }) {
    const starters = [
        { emoji: '💸', title: 'Low Ticket', description: 'Quiz que qualifica leads para oferta', color: 'from-emerald-500/20 to-emerald-500/5' },
        { emoji: '🧲', title: 'Lead Magnético', description: 'Quiz viral que captura e-mails', color: 'from-purple-500/20 to-purple-500/5' },
        { emoji: '🎬', title: 'VSL + Oferta', description: 'Videocarta de vendas com CTA', color: 'from-red-500/20 to-red-500/5' },
    ]
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <Card className="overflow-hidden border-0 bg-gradient-to-br from-foreground to-foreground/90 text-background shadow-2xl">
                    <CardContent className="p-10 lg:p-12 relative">
                        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-blue-500/20 blur-3xl" />
                        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-purple-500/20 blur-3xl" />
                        <div className="relative">
                            <Badge variant="default" className="mb-4 bg-background/20 text-background border-background/20">
                                <Sparkles className="w-3 h-3" /> Bem-vindo ao Kuiz
                            </Badge>
                            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3 text-balance">
                                Crie seu primeiro funil de alta conversão
                            </h2>
                            <p className="text-background/70 max-w-md mb-6 text-balance">
                                Templates otimizados, editor visual drag & drop, analytics em tempo real.
                                Você está a 1 minuto do seu primeiro lead.
                            </p>
                            <Button
                                onClick={onCreate}
                                disabled={disabled}
                                size="lg"
                                className="bg-background text-foreground hover:bg-background/90"
                                rightIcon={<ArrowRight className="w-4 h-4" />}
                            >
                                Criar meu primeiro funil
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Templates populares
                </p>
                {starters.map((s) => (
                    <button
                        key={s.title}
                        onClick={onCreate}
                        disabled={disabled}
                        className={cn(
                            'w-full text-left p-4 rounded-2xl border border-border/60 bg-gradient-to-br hover:shadow-pop hover:-translate-y-0.5 transition-all group',
                            s.color
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">{s.emoji}</span>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm">{s.title}</p>
                                <p className="text-xs text-muted-foreground">{s.description}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}
