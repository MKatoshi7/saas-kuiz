'use client';

import { useState, useMemo } from 'react';
import {
    Users, UserCheck, TrendingUp, Target, Tag, ChevronLeft, ChevronRight,
    Search, Eye, X, Globe, Hash, MapPin, Monitor, Mail, Phone,
    Layers, Megaphone
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/Avatar';
import {
    Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/Skeleton';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Visitor {
    id: string;
    sessionId: string;
    startedAt: string;
    completedAt: string | null;
    email: string | null;
    name: string | null;
    phone: string | null;
    city: string | null;
    country: string | null;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    utmContent: string | null;
    utmTerm: string | null;
    referrer: string | null;
    isLead: boolean;
    isConverted: boolean;
    answersSnapshot: Record<string, any>;
}

interface StepStat {
    id: string;
    title: string;
    count: number;
    percentage: number;
}

interface DashboardAnalyticsClientProps {
    funnelId: string;
    funnelTitle: string;
    steps: StepStat[];
    visitors: Visitor[];
    metrics: {
        totalVisits: number;
        totalLeads: number;
        totalConverted: number;
        conversionRate: number;
        completionRate: number;
    };
}

export function DashboardAnalyticsClient({ funnelId, funnelTitle, steps, visitors, metrics }: DashboardAnalyticsClientProps) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<'all' | 'lead' | 'converted' | 'visit'>('all');
    const [openUtmId, setOpenUtmId] = useState<string | null>(null);
    const [detailVisitor, setDetailVisitor] = useState<Visitor | null>(null);
    const limit = 30;

    const filtered = useMemo(() => {
        return visitors.filter((v) => {
            if (statusFilter === 'lead' && !v.isLead) return false;
            if (statusFilter === 'converted' && !v.isConverted) return false;
            if (statusFilter === 'visit' && (v.isLead || v.isConverted)) return false;
            if (search) {
                const q = search.toLowerCase();
                return (
                    v.sessionId?.toLowerCase().includes(q) ||
                    v.email?.toLowerCase().includes(q) ||
                    v.name?.toLowerCase().includes(q) ||
                    v.utmSource?.toLowerCase().includes(q) ||
                    v.utmCampaign?.toLowerCase().includes(q) ||
                    Object.values(v.answersSnapshot).some((val) => String(val).toLowerCase().includes(q))
                );
            }
            return true;
        });
    }, [visitors, search, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
    const pageItems = filtered.slice((page - 1) * limit, page * limit);

    return (
        <div className="h-full overflow-y-auto bg-[#F5F5F7]">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Analytics</p>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">{funnelTitle}</h1>
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate">{funnelId}</p>
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <StatCard label="Visitantes" value={metrics.totalVisits.toLocaleString('pt-BR')} icon={Users} />
                    <StatCard
                        label="Leads"
                        value={metrics.totalLeads.toLocaleString('pt-BR')}
                        icon={UserCheck}
                        variant="primary"
                    />
                    <StatCard
                        label="Conversão"
                        value={`${metrics.conversionRate.toFixed(1)}%`}
                        icon={TrendingUp}
                    />
                    <StatCard
                        label="Conclusão"
                        value={`${metrics.completionRate.toFixed(1)}%`}
                        icon={Target}
                    />
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <Input
                            placeholder="Buscar sessão, email, UTM, resposta..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                            className="pl-10"
                        />
                    </div>
                    <div className="inline-flex h-10 items-center gap-1 rounded-full border border-border/60 bg-secondary/40 p-1 overflow-x-auto">
                        {[
                            { v: 'all', l: 'Todos' },
                            { v: 'lead', l: 'Leads' },
                            { v: 'converted', l: 'Convertidos' },
                            { v: 'visit', l: 'Visitas' },
                        ].map((opt) => (
                            <button
                                key={opt.v}
                                onClick={() => { setStatusFilter(opt.v as any); setPage(1) }}
                                className={cn(
                                    'h-8 px-3 rounded-full text-xs font-medium transition-all whitespace-nowrap',
                                    statusFilter === opt.v
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                {opt.l}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tabela (desktop) + Cards (mobile) */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Rastreamento de Visitantes</CardTitle>
                        <CardDescription>Cada linha = 1 visitante. Clique em UTM ou no olho para detalhes.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* Mobile: cards */}
                        <div className="md:hidden divide-y divide-border/40">
                            {pageItems.length === 0 ? (
                                <div className="p-8 text-center text-sm text-muted-foreground">Nenhum visitante</div>
                            ) : (
                                pageItems.map((v) => (
                                    <MobileVisitorCard
                                        key={v.id}
                                        visitor={v}
                                        steps={steps}
                                        onOpenDetail={() => setDetailVisitor(v)}
                                    />
                                ))
                            )}
                        </div>

                        {/* Desktop: tabela */}
                        <div className="hidden md:block overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="min-w-[140px]">Quando</TableHead>
                                        <TableHead>Identificado</TableHead>
                                        <TableHead>UTM</TableHead>
                                        {steps.map((step, idx) => (
                                            <TableHead key={step.id} className="min-w-[160px]">
                                                <div className="flex items-start gap-2 py-1">
                                                    {/* Barra vertical compacta */}
                                                    <div className="flex flex-col items-center shrink-0">
                                                        <span className="text-[9px] font-mono text-muted-foreground font-bold">{idx + 1}</span>
                                                        <div className="w-1 h-10 bg-secondary rounded-full overflow-hidden mt-0.5">
                                                            <div
                                                                className={cn(
                                                                    'w-full rounded-full transition-all',
                                                                    step.percentage >= 70 ? 'bg-emerald-500' :
                                                                    step.percentage >= 40 ? 'bg-amber-500' : 'bg-red-500'
                                                                )}
                                                                style={{ height: `${step.percentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate" title={step.title}>
                                                            {step.title}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                                                            {step.percentage}%
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableHead>
                                        ))}
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Ver</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pageItems.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4 + steps.length} className="h-24 text-center text-muted-foreground">
                                                Nenhum visitante
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        pageItems.map((v) => (
                                            <TableRow key={v.id}>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-medium">
                                                            {format(new Date(v.startedAt), "dd/MM HH:mm", { locale: ptBR })}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {formatDistanceToNow(new Date(v.startedAt), { addSuffix: true, locale: ptBR })}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {v.email ? (
                                                        <div className="flex items-center gap-2">
                                                            <Avatar name={v.name} email={v.email} size="xs" />
                                                            <div className="min-w-0">
                                                                <p className="text-xs font-medium truncate max-w-[140px]">{v.name || '—'}</p>
                                                                <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">{v.email}</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground/50">Anônimo</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <UtmCell
                                                        visitor={v}
                                                        isOpen={openUtmId === v.id}
                                                        onToggle={() => setOpenUtmId(openUtmId === v.id ? null : v.id)}
                                                    />
                                                </TableCell>
                                                {steps.map((step) => {
                                                    const value = v.answersSnapshot?.[step.id]
                                                    return (
                                                        <TableCell key={step.id}>
                                                            {value ? (
                                                                <Badge variant="success" size="sm">
                                                                    <span className="truncate max-w-[120px]">{String(value)}</span>
                                                                </Badge>
                                                            ) : (
                                                                <span className="text-muted-foreground/30 text-xs">—</span>
                                                            )}
                                                        </TableCell>
                                                    )
                                                })}
                                                <TableCell>
                                                    {v.isConverted ? (
                                                        <Badge variant="success" size="sm" dot>Convertido</Badge>
                                                    ) : v.isLead ? (
                                                        <Badge variant="info" size="sm" dot>Lead</Badge>
                                                    ) : (
                                                        <Badge variant="secondary" size="sm">Visita</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        onClick={() => setDetailVisitor(v)}
                                                        title="Ver detalhes"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {totalPages > 1 && (
                            <div className="px-4 py-3 border-t border-border/60 flex items-center justify-between bg-secondary/20">
                                <span className="text-xs text-muted-foreground">
                                    <span className="font-semibold text-foreground">{filtered.length}</span> visitante{filtered.length === 1 ? '' : 's'} · pág {page}/{totalPages}
                                </span>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                                        <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Anterior
                                    </Button>
                                    <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                                        Próxima <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {detailVisitor && (
                    <VisitorDetailDialog
                        visitor={detailVisitor}
                        steps={steps}
                        onClose={() => setDetailVisitor(null)}
                    />
                )}
            </div>
        </div>
    );
}

/**
 * Card de visitante para mobile (md:hidden).
 */
function MobileVisitorCard({ visitor, steps, onOpenDetail }: {
    visitor: Visitor; steps: StepStat[]; onOpenDetail: () => void
}) {
    return (
        <button
            onClick={onOpenDetail}
            className="w-full text-left p-4 hover:bg-secondary/40 transition-colors"
        >
            <div className="flex items-center gap-3 mb-2">
                <Avatar name={visitor.name} email={visitor.email} size="sm" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                        {visitor.name || visitor.email?.split('@')[0] || 'Anônimo'}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                        {format(new Date(visitor.startedAt), "dd/MM HH:mm", { locale: ptBR })} · {formatDistanceToNow(new Date(visitor.startedAt), { addSuffix: true, locale: ptBR })}
                    </p>
                </div>
                {visitor.isConverted ? (
                    <Badge variant="success" size="sm" dot>OK</Badge>
                ) : visitor.isLead ? (
                    <Badge variant="info" size="sm" dot>Lead</Badge>
                ) : null}
            </div>
            <div className="flex flex-wrap gap-1.5">
                {visitor.utmSource && <Badge variant="primary" size="sm">{visitor.utmSource}</Badge>}
                {visitor.utmCampaign && (
                    <span className="text-[10px] font-mono text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded">
                        {visitor.utmCampaign}
                    </span>
                )}
                {steps.map((s) => {
                    const v = visitor.answersSnapshot?.[s.id]
                    if (!v) return null
                    return (
                        <span key={s.id} className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded truncate max-w-[160px]">
                            {String(v)}
                        </span>
                    )
                })}
            </div>
        </button>
    )
}

/**
 * Coluna UTM compacta: badge clicável com source + popover com TODOS os UTMs.
 */
function UtmCell({ visitor, isOpen, onToggle }: { visitor: Visitor; isOpen: boolean; onToggle: () => void }) {
    const hasAny = visitor.utmSource || visitor.utmMedium || visitor.utmCampaign || visitor.utmContent || visitor.utmTerm

    if (!hasAny) {
        return <span className="text-muted-foreground/30 text-xs">—</span>
    }

    return (
        <div className="relative">
            <button
                onClick={(e) => { e.stopPropagation(); onToggle() }}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary/60 hover:bg-secondary text-xs transition-colors"
            >
                {visitor.utmSource ? (
                    <Badge variant="primary" size="sm">{visitor.utmSource}</Badge>
                ) : (
                    <span className="text-muted-foreground">Direto</span>
                )}
                {([visitor.utmCampaign, visitor.utmContent, visitor.utmTerm, visitor.utmMedium].filter(Boolean).length > 0) && (
                    <span className="text-[9px] text-muted-foreground">
                        +{[visitor.utmCampaign, visitor.utmContent, visitor.utmTerm, visitor.utmMedium].filter(Boolean).length}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-30" onClick={onToggle} />
                    <div className="absolute z-40 left-0 top-full mt-1 w-72 bg-popover border border-border/60 rounded-xl shadow-2xl p-3 animate-fade-in-up">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Parâmetros UTM
                        </p>
                        <div className="space-y-1.5">
                            <UtmRow icon={Tag} label="Source" value={visitor.utmSource} />
                            <UtmRow icon={Megaphone} label="Medium" value={visitor.utmMedium} />
                            <UtmRow icon={Target} label="Campaign" value={visitor.utmCampaign} />
                            <UtmRow icon={Layers} label="Content (anúncio)" value={visitor.utmContent} />
                            <UtmRow icon={Hash} label="Term (conjunto)" value={visitor.utmTerm} />
                        </div>
                        {visitor.referrer && (
                            <>
                                <div className="border-t border-border/60 my-2.5" />
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                    <Globe className="w-3 h-3" /> Referrer
                                </p>
                                <p className="text-xs font-mono truncate" title={visitor.referrer}>
                                    {(() => {
                                        try { return new URL(visitor.referrer).hostname } catch { return visitor.referrer }
                                    })()}
                                </p>
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

function UtmRow({ icon: Icon, label, value }: { icon: any; label: string; value: string | null }) {
    return (
        <div className="flex items-center gap-2">
            <Icon className="w-3 h-3 text-muted-foreground shrink-0" />
            <span className="text-[10px] text-muted-foreground w-24 shrink-0">{label}</span>
            <span className={cn('text-xs font-mono truncate flex-1', value ? 'text-foreground' : 'text-muted-foreground/40')}>
                {value || '—'}
            </span>
        </div>
    )
}

function VisitorDetailDialog({ visitor, steps, onClose }: {
    visitor: Visitor; steps: StepStat[]; onClose: () => void
}) {
    return (
        <Dialog open onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-[640px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-muted-foreground" />
                        Detalhes do visitante
                    </DialogTitle>
                    <DialogDescription>
                        {format(new Date(visitor.startedAt), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {visitor.email && (
                        <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-xl p-4 space-y-1.5">
                            <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">Lead identificado</p>
                            {visitor.name && <p className="text-sm font-semibold">{visitor.name}</p>}
                            <p className="text-xs flex items-center gap-1.5"><Mail className="w-3 h-3" /> {visitor.email}</p>
                            {visitor.phone && <p className="text-xs flex items-center gap-1.5"><Phone className="w-3 h-3" /> {visitor.phone}</p>}
                        </div>
                    )}

                    <div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Respostas por etapa</p>
                        <div className="space-y-1.5">
                            {steps.map((step, idx) => {
                                const value = visitor.answersSnapshot?.[step.id]
                                if (!value) return null
                                return (
                                    <div key={step.id} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-secondary/30">
                                        <span className="h-6 w-6 shrink-0 rounded-md bg-foreground text-background flex items-center justify-center text-[10px] font-mono font-bold">
                                            {idx + 1}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{step.title}</p>
                                            <p className="text-sm font-medium mt-0.5 break-words">{String(value)}</p>
                                        </div>
                                    </div>
                                )
                            })}
                            {Object.keys(visitor.answersSnapshot).length === 0 && (
                                <p className="text-xs text-muted-foreground text-center py-3">Nenhuma resposta</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">UTM</p>
                        <div className="space-y-1">
                            <UtmRow icon={Tag} label="Source" value={visitor.utmSource} />
                            <UtmRow icon={Megaphone} label="Medium" value={visitor.utmMedium} />
                            <UtmRow icon={Target} label="Campaign" value={visitor.utmCampaign} />
                            <UtmRow icon={Layers} label="Content" value={visitor.utmContent} />
                            <UtmRow icon={Hash} label="Term" value={visitor.utmTerm} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-secondary/30">
                            <p className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Localização</p>
                            <p className="font-medium">{[visitor.city, visitor.country].filter(Boolean).join(', ') || '—'}</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-secondary/30">
                            <p className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1"><Monitor className="w-3 h-3" /> IP</p>
                            <p className="font-mono text-[11px]">—</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
