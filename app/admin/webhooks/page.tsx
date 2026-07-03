'use client';

import React, { useState, useEffect } from 'react';
import {
    Search, Webhook, Eye, Copy, Check, Loader2, X, Code2, Settings,
    Send, RefreshCw, ChevronLeft, ChevronRight, AlertTriangle, Tag,
    CheckCircle2, XCircle, Clock, ZapOff, Webhook as WebhookIcon,
    Plus, ExternalLink, Copy as CopyIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '@/components/ui/table';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface WebhookEvent {
    id: string;
    provider: string;
    eventType: string | null;
    externalId: string | null;
    source: 'api' | 'manual';
    status: 'pending' | 'processed' | 'failed' | 'ignored' | 'duplicate';
    customerEmail: string | null;
    customerName: string | null;
    customerPhone: string | null;
    productId: string | null;
    productName: string | null;
    amount: number | null;
    currency: string | null;
    kuizPlan: string | null;
    periodDays: number | null;
    error: string | null;
    receivedAt: string;
    affectedUser: { id: string; email: string; name: string | null } | null;
}

type StatusFilter = 'all' | 'processed' | 'failed' | 'ignored' | 'duplicate' | 'pending';

export default function WebhooksPage() {
    const [events, setEvents] = useState<WebhookEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [providerFilter, setProviderFilter] = useState('all');
    const [activeTab, setActiveTab] = useState<'events' | 'configs' | 'mappings' | 'paste'>('events');
    const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page),
                status: statusFilter,
                provider: providerFilter,
                search,
            });
            const res = await fetch(`/api/admin/webhooks?${params}`);
            const data = await res.json();
            setEvents(data.events || []);
            setTotalPages(data.pages || 1);
        } catch {
            toast.error('Erro ao carregar webhooks');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab !== 'events') return;
        const t = setTimeout(fetchEvents, 200);
        return () => clearTimeout(t);
    }, [search, page, statusFilter, providerFilter, activeTab]);

    const handleReprocess = async (eventId: string) => {
        try {
            const res = await fetch('/api/admin/webhooks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reprocessEventId: eventId }),
            });
            if (!res.ok) throw new Error();
            toast.success('Evento reprocessado');
            setSelectedEvent(null);
            fetchEvents();
        } catch {
            toast.error('Erro ao reprocessar');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Webhooks</h1>
                    <p className="text-muted-foreground mt-1">
                        Receba e processe eventos de pagamento (Cakto, Stripe, Hotmart, Kiwify, etc).
                    </p>
                </div>
                <a
                    href="/webhook-info"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-secondary hover:bg-secondary/70 text-foreground text-sm font-medium transition-colors shrink-0"
                >
                    <Code2 className="w-4 h-4" />
                    Como configurar o webhook
                    <ExternalLink className="w-3 h-3" />
                </a>
            </div>

            {/* Tabs */}
            <div className="inline-flex h-10 items-center gap-1 rounded-full border border-border/60 bg-secondary/40 p-1 overflow-x-auto">
                {[
                    { v: 'events', l: 'Eventos', icon: Webhook },
                    { v: 'paste', l: 'Colar payload', icon: Copy },
                    { v: 'mappings', l: 'Mapeamento de planos', icon: Tag },
                    { v: 'configs', l: 'Configurações', icon: Settings },
                ].map((t) => {
                    const Icon = t.icon
                    const isActive = activeTab === t.v
                    return (
                        <button
                            key={t.v}
                            onClick={() => setActiveTab(t.v as any)}
                            className={cn(
                                'h-8 px-4 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap',
                                isActive ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {t.l}
                        </button>
                    )
                })}
            </div>

            {activeTab === 'events' && (
                <>
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            <Input
                                placeholder="Buscar por email, evento, externalId..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                                className="pl-10"
                            />
                        </div>
                        <div className="inline-flex h-10 items-center gap-1 rounded-full border border-border/60 bg-secondary/40 p-1">
                            {[
                                { v: 'all', l: 'Todos' },
                                { v: 'processed', l: 'Processados' },
                                { v: 'failed', l: 'Falhos' },
                                { v: 'duplicate', l: 'Duplicados' },
                                { v: 'ignored', l: 'Ignorados' },
                            ].map((opt) => (
                                <button
                                    key={opt.v}
                                    onClick={() => { setStatusFilter(opt.v as StatusFilter); setPage(1) }}
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

                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead>Quando</TableHead>
                                    <TableHead>Provedor</TableHead>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Produto</TableHead>
                                    <TableHead>Valor</TableHead>
                                    <TableHead>Plano</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-32 text-center">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ) : events.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                                            <Webhook className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                            Nenhum webhook recebido ainda
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    events.map((e) => (
                                        <TableRow key={e.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-medium">
                                                        {format(new Date(e.receivedAt), "dd/MM HH:mm:ss", { locale: ptBR })}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {formatDistanceToNow(new Date(e.receivedAt), { addSuffix: true, locale: ptBR })}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <Badge variant="outline" size="sm" className="capitalize">{e.provider}</Badge>
                                                    {e.source === 'manual' && (
                                                        <Badge variant="secondary" size="sm">manual</Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {e.customerEmail ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-medium truncate max-w-[160px]">{e.customerName || '—'}</span>
                                                        <span className="text-[10px] text-muted-foreground truncate max-w-[160px]">{e.customerEmail}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground/40 text-xs">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {e.productName ? (
                                                    <div className="flex flex-col max-w-[160px]">
                                                        <span className="text-xs truncate">{e.productName}</span>
                                                        {e.productId && <span className="text-[10px] text-muted-foreground font-mono truncate">{e.productId}</span>}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground/40 text-xs">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {e.amount ? (
                                                    <span className="text-xs font-semibold tabular-nums">
                                                        {e.currency || 'BRL'} {e.amount.toFixed(2)}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground/40 text-xs">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {e.kuizPlan ? (
                                                    <Badge variant="primary" size="sm" className="capitalize">
                                                        {e.kuizPlan} · {e.periodDays || 30}d
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground/40 text-xs">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge status={e.status} error={e.error} />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() => setSelectedEvent(e)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                        {totalPages > 1 && (
                            <div className="px-4 py-3 border-t border-border/60 flex items-center justify-between bg-secondary/20">
                                <span className="text-xs text-muted-foreground">
                                    Página <span className="font-semibold text-foreground">{page}</span> de {totalPages}
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
                    </Card>
                </>
            )}

            {activeTab === 'paste' && <PastePayloadTab onProcessed={fetchEvents} />}
            {activeTab === 'mappings' && <MappingsTab />}
            {activeTab === 'configs' && <ConfigsTab />}

            {selectedEvent && (
                <WebhookDetailDialog
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                    onReprocess={() => handleReprocess(selectedEvent.id)}
                />
            )}
        </div>
    );
}

function StatusBadge({ status, error }: { status: string; error: string | null }) {
    const map: Record<string, { label: string; icon: any; variant: any }> = {
        processed: { label: 'Processado', icon: CheckCircle2, variant: 'success' },
        failed: { label: 'Falhou', icon: AlertTriangle, variant: 'destructive' },
        duplicate: { label: 'Duplicado', icon: CopyIcon, variant: 'secondary' },
        ignored: { label: 'Ignorado', icon: ZapOff, variant: 'outline' },
        pending: { label: 'Pendente', icon: Clock, variant: 'warning' },
    }
    const cfg = map[status] || map.pending
    const Icon = cfg.icon
    return (
        <div>
            <Badge variant={cfg.variant} size="sm" dot>
                <Icon className="w-3 h-3" />
                {cfg.label}
            </Badge>
            {error && status === 'failed' && (
                <p className="text-[10px] text-red-600 mt-1 max-w-[200px] truncate" title={error}>{error}</p>
            )}
        </div>
    )
}

/**
 * Tab "Colar payload" — admin cola JSON cru copiado do provedor
 * e vê o parse + processa (cria usuário, estende assinatura).
 */
function PastePayloadTab({ onProcessed }: { onProcessed: () => void }) {
    const [payload, setPayload] = useState('')
    const [provider, setProvider] = useState('auto')
    const [parsed, setParsed] = useState<any>(null)
    const [parsing, setParsing] = useState(false)
    const [processing, setProcessing] = useState(false)
    const [result, setResult] = useState<any>(null)

    const handleParse = async () => {
        if (!payload.trim()) {
            toast.error('Cole um payload primeiro')
            return
        }
        setParsing(true)
        setResult(null)
        try {
            const res = await fetch('/api/admin/webhooks', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payload, provider: provider === 'auto' ? undefined : provider }),
            })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Erro ao parsear')
            }
            const data = await res.json()
            setParsed(data.parsed)
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setParsing(false)
        }
    }

    const handleProcess = async () => {
        if (!payload.trim()) return
        setProcessing(true)
        try {
            const res = await fetch('/api/admin/webhooks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payload, provider: provider === 'auto' ? undefined : provider }),
            })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Erro ao processar')
            }
            const data = await res.json()
            setResult(data)
            toast.success(data.message || 'Processado!')
            onProcessed()
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setProcessing(false)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Code2 className="w-4 h-4" />
                        Payload JSON
                    </CardTitle>
                    <CardDescription>
                        Cole o JSON cru que o provedor envia. O Kuiz identifica automaticamente.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div>
                        <Label>Provedor (opcional)</Label>
                        <select
                            value={provider}
                            onChange={(e) => setProvider(e.target.value)}
                            className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm"
                        >
                            <option value="auto">Detectar automaticamente</option>
                            <option value="cakto">Cakto</option>
                            <option value="stripe">Stripe</option>
                            <option value="hotmart">Hotmart</option>
                            <option value="kiwify">Kiwify</option>
                            <option value="eduzz">Eduzz</option>
                            <option value="braip">Braip</option>
                        </select>
                    </div>
                    <div>
                        <Label>JSON do payload</Label>
                        <Textarea
                            value={payload}
                            onChange={(e) => setPayload(e.target.value)}
                            rows={16}
                            className="font-mono text-xs"
                            placeholder='{ "event": "purchase.approved", "data": { "customer": { "email": "..." } } }'
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleParse}
                            loading={parsing}
                            leftIcon={<Code2 className="w-3.5 h-3.5" />}
                        >
                            Apenas parsear
                        </Button>
                        <Button
                            onClick={handleProcess}
                            loading={processing}
                            leftIcon={<Send className="w-3.5 h-3.5" />}
                        >
                            Processar e creditar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Resultado</CardTitle>
                    <CardDescription>
                        Dados identificados pelo parser.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {result ? (
                        <div className="space-y-3">
                            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/60">
                                <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">Status</p>
                                <p className="text-sm font-medium mt-0.5">{result.message}</p>
                                <p className="text-[10px] font-mono text-emerald-700 mt-1">
                                    {result.status} · {result.webhookEventId}
                                </p>
                            </div>
                            {parsed && <ParsedView parsed={parsed} />}
                        </div>
                    ) : parsed ? (
                        <ParsedView parsed={parsed} />
                    ) : (
                        <div className="text-center py-12 text-sm text-muted-foreground">
                            <Code2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            Cole um payload e clique em "Parsear" ou "Processar"
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function ParsedView({ parsed }: { parsed: any }) {
    return (
        <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/40">
                <span className="text-muted-foreground">Provedor</span>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" size="sm" className="capitalize">{parsed.provider}</Badge>
                    <Badge variant={parsed.confidence === 'high' ? 'success' : parsed.confidence === 'medium' ? 'warning' : 'destructive'} size="sm">
                        {parsed.confidence}
                    </Badge>
                </div>
            </div>
            {parsed.eventType && <KV label="Evento" value={parsed.eventType} mono />}
            {parsed.externalId && <KV label="External ID" value={parsed.externalId} mono />}

            <Section title="Cliente">
                <KV label="Email" value={parsed.customer?.email} mono />
                <KV label="Nome" value={parsed.customer?.name} />
                <KV label="Telefone" value={parsed.customer?.phone} mono />
            </Section>

            <Section title="Produto">
                <KV label="ID" value={parsed.product?.id} mono />
                <KV label="Nome" value={parsed.product?.name} />
            </Section>

            <Section title="Pagamento">
                <KV label="Status" value={parsed.payment?.status} badge />
                {parsed.payment?.amount && (
                    <KV label="Valor" value={`${parsed.payment.currency} ${parsed.payment.amount.toFixed(2)}`} mono />
                )}
            </Section>

            {parsed.notes?.length > 0 && (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200/60">
                    <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider mb-1">Notas</p>
                    <ul className="space-y-0.5 text-amber-900">
                        {parsed.notes.map((n: string, i: number) => (
                            <li key={i} className="text-[11px]">• {n}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="p-2.5 rounded-lg bg-secondary/30">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{title}</p>
            <div className="space-y-1">{children}</div>
        </div>
    )
}

function KV({ label, value, mono, badge }: { label: string; value: any; mono?: boolean; badge?: boolean }) {
    if (value === null || value === undefined || value === '') return null
    return (
        <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">{label}</span>
            {badge ? (
                <Badge variant={value === 'paid' ? 'success' : 'secondary'} size="sm" className="capitalize">{value}</Badge>
            ) : (
                <span className={cn('font-medium', mono && 'font-mono')}>{value}</span>
            )}
        </div>
    )
}

function MappingsTab() {
    const [mappings, setMappings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [openCreate, setOpenCreate] = useState(false)
    const [form, setForm] = useState({
        provider: 'cakto',
        externalProductId: '',
        externalProductName: '',
        kuizPlan: 'pro',
        periodDays: 30,
        amount: '',
        notes: '',
    })

    const fetchMappings = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/plan-mappings')
            const data = await res.json()
            setMappings(data.mappings || [])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchMappings() }, [])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/admin/plan-mappings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error)
            }
            toast.success('Mapping criado!')
            setOpenCreate(false)
            setForm({ provider: 'cakto', externalProductId: '', externalProductName: '', kuizPlan: 'pro', periodDays: 30, amount: '', notes: '' })
            fetchMappings()
        } catch (e: any) {
            toast.error(e.message)
        }
    }

    const handleToggle = async (m: any) => {
        try {
            await fetch(`/api/admin/plan-mappings/${m.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !m.isActive }),
            })
            fetchMappings()
        } catch {
            toast.error('Erro')
        }
    }

    const handleDelete = async (m: any) => {
        if (!confirm(`Deletar mapping ${m.provider}/${m.externalProductId}?`)) return
        try {
            await fetch(`/api/admin/plan-mappings/${m.id}`, { method: 'DELETE' })
            toast.success('Deletado')
            fetchMappings()
        } catch {
            toast.error('Erro')
        }
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-base">Mapeamento de Planos</CardTitle>
                        <CardDescription>
                            Conecta o <code className="text-xs font-mono">product_id</code> do provedor ao plano Kuiz + periodicidade.
                        </CardDescription>
                    </div>
                    <Button onClick={() => setOpenCreate(true)} leftIcon={<Plus className="w-4 h-4" />}>
                        Novo mapping
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead>Provedor</TableHead>
                                <TableHead>Product ID</TableHead>
                                <TableHead>Plano Kuiz</TableHead>
                                <TableHead>Período</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : mappings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                        Nenhum mapping. Adicione o primeiro para mapear produtos do provedor.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                mappings.map((m) => (
                                    <TableRow key={m.id}>
                                        <TableCell>
                                            <Badge variant="outline" size="sm" className="capitalize">{m.provider}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-mono text-xs">{m.externalProductId}</p>
                                                {m.externalProductName && <p className="text-[10px] text-muted-foreground">{m.externalProductName}</p>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="primary" size="sm" className="capitalize">{m.kuizPlan}</Badge>
                                        </TableCell>
                                        <TableCell><span className="text-xs tabular-nums">{m.periodDays} dias</span></TableCell>
                                        <TableCell>
                                            {m.amount ? (
                                                <span className="text-xs font-mono">{m.currency} {Number(m.amount).toFixed(2)}</span>
                                            ) : (
                                                <span className="text-muted-foreground/40 text-xs">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={m.isActive ? 'success' : 'secondary'} size="sm">
                                                {m.isActive ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon-sm" onClick={() => handleToggle(m)}>
                                                    {m.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                                </Button>
                                                <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(m)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Novo mapeamento</DialogTitle>
                        <DialogDescription>
                            Quando um webhook deste provider com este product_id chegar, o usuário recebe o plano Kuiz selecionado.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Provedor</Label>
                                <select
                                    value={form.provider}
                                    onChange={(e) => setForm({ ...form, provider: e.target.value })}
                                    className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm"
                                >
                                    <option value="cakto">Cakto</option>
                                    <option value="stripe">Stripe</option>
                                    <option value="hotmart">Hotmart</option>
                                    <option value="kiwify">Kiwify</option>
                                    <option value="eduzz">Eduzz</option>
                                    <option value="braip">Braip</option>
                                </select>
                            </div>
                            <div>
                                <Label>Plano Kuiz</Label>
                                <select
                                    value={form.kuizPlan}
                                    onChange={(e) => setForm({ ...form, kuizPlan: e.target.value })}
                                    className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm"
                                >
                                    <option value="starter">Starter</option>
                                    <option value="pro">Pro</option>
                                    <option value="enterprise">Enterprise</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <Label>Product ID (do provedor) *</Label>
                            <Input
                                value={form.externalProductId}
                                onChange={(e) => setForm({ ...form, externalProductId: e.target.value })}
                                placeholder="ex: 7f8a9b0c-1d2e-3f4g-5h6i-7j8k9l0m1n2o"
                                required
                            />
                        </div>
                        <div>
                            <Label>Nome do produto (opcional)</Label>
                            <Input
                                value={form.externalProductName}
                                onChange={(e) => setForm({ ...form, externalProductName: e.target.value })}
                                placeholder="Plano Pro Mensal"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Período (dias)</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={form.periodDays}
                                    onChange={(e) => setForm({ ...form, periodDays: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <Label>Valor (BRL)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={form.amount}
                                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                    placeholder="97.00"
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Notas (opcional)</Label>
                            <Textarea
                                value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                rows={2}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>Cancelar</Button>
                            <Button type="submit">Criar mapping</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}

function ConfigsTab() {
    const [configs, setConfigs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState<any | null>(null)
    const [secretInput, setSecretInput] = useState('')

    const fetchConfigs = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/webhook-configs')
            const data = await res.json()
            setConfigs(data.configs || [])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchConfigs() }, [])

    const handleSave = async () => {
        try {
            const res = await fetch('/api/admin/webhook-configs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider: editing.provider,
                    secret: secretInput || null,
                    isActive: editing.isActive,
                    description: editing.description,
                }),
            })
            if (!res.ok) throw new Error()
            toast.success('Configuração salva!')
            setEditing(null)
            setSecretInput('')
            fetchConfigs()
        } catch {
            toast.error('Erro ao salvar')
        }
    }

    const providers = ['cakto', 'stripe', 'hotmart', 'kiwify', 'eduzz', 'braip']

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                    <div>
                        <CardTitle className="text-base">Configurações de Webhook</CardTitle>
                        <CardDescription>
                            Defina o secret HMAC (compartilhado com o provedor) para validar autenticidade das requisições.
                        </CardDescription>
                    </div>
                    <a
                        href="/webhook-info"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-500 hover:text-blue-600 shrink-0"
                    >
                        Ver passo a passo
                        <ExternalLink className="w-3 h-3" />
                    </a>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="py-12 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>
                    ) : (
                        <div className="space-y-2">
                            {providers.map((p) => {
                                const cfg = configs.find((c) => c.provider === p)
                                const url = `/api/webhooks/${p}`
                                return (
                                    <div key={p} className="flex items-center gap-3 p-3 rounded-xl border border-border/60 hover:bg-secondary/30 transition-colors">
                                        <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center capitalize text-xs font-bold">
                                            {p.slice(0, 2)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium capitalize">{p}</p>
                                            <code className="text-[10px] text-muted-foreground font-mono break-all">
                                                POST {url}
                                            </code>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.origin}${url}`)
                                                toast.success('URL copiada!')
                                            }}
                                            title="Copiar URL"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                        </Button>
                                        <Badge variant={cfg?.isActive ? 'success' : 'secondary'} size="sm">
                                            {cfg?.isActive ? 'Ativo' : 'Sem config'}
                                        </Badge>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setEditing({ provider: p, isActive: cfg?.isActive ?? true, description: cfg?.description || '' })
                                                setSecretInput('')
                                            }}
                                        >
                                            Configurar
                                        </Button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Configurar {editing?.provider}</DialogTitle>
                        <DialogDescription>
                            Cole o secret compartilhado. Se vazio, o webhook é aceito sem validação (modo dev).
                        </DialogDescription>
                    </DialogHeader>
                    {editing && (
                        <div className="space-y-3">
                            <div>
                                <Label>Secret (HMAC SHA-256)</Label>
                                <Input
                                    type="password"
                                    value={secretInput}
                                    onChange={(e) => setSecretInput(e.target.value)}
                                    placeholder="Deixe vazio para não validar"
                                />
                                <p className="text-[10px] text-muted-foreground mt-1">
                                    O Kuiz valida o header <code className="font-mono">x-webhook-signature: sha256=&lt;hmac&gt;</code>.
                                </p>
                            </div>
                            <div>
                                <Label>Descrição</Label>
                                <Input
                                    value={editing.description}
                                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                                    placeholder="Notas internas"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={editing.isActive}
                                    onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })}
                                />
                                <Label htmlFor="isActive" className="cursor-pointer">Aceitar webhooks deste provedor</Label>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
                        <Button onClick={handleSave}>Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

function WebhookDetailDialog({ event, onClose, onReprocess }: {
    event: WebhookEvent; onClose: () => void; onReprocess: () => void
}) {
    const [copied, setCopied] = useState(false)
    const copyJson = () => {
        navigator.clipboard.writeText(JSON.stringify(event, null, 2))
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Dialog open onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-[720px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Webhook className="w-4 h-4" />
                        Webhook {event.provider}
                    </DialogTitle>
                    <DialogDescription>
                        Recebido {format(new Date(event.receivedAt), "dd 'de' MMM, HH:mm:ss", { locale: ptBR })}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={event.status} error={event.error} />
                        {event.eventType && <Badge variant="outline" size="sm">{event.eventType}</Badge>}
                        <Badge variant="secondary" size="sm">source: {event.source}</Badge>
                        {event.kuizPlan && <Badge variant="primary" size="sm">{event.kuizPlan} · {event.periodDays}d</Badge>}
                    </div>

                    {event.affectedUser && (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/60">
                            <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider mb-1">Usuário afetado</p>
                            <p className="text-sm font-medium">{event.affectedUser.name || event.affectedUser.email}</p>
                            <p className="text-xs text-emerald-700 font-mono">{event.affectedUser.email}</p>
                        </div>
                    )}

                    {(event.customerEmail || event.productName || event.amount) && (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            {event.customerEmail && <KV label="Email" value={event.customerEmail} mono />}
                            {event.customerName && <KV label="Nome" value={event.customerName} />}
                            {event.productName && <KV label="Produto" value={event.productName} />}
                            {event.amount && <KV label="Valor" value={`${event.currency || 'BRL'} ${event.amount.toFixed(2)}`} mono />}
                            {event.externalId && <KV label="External ID" value={event.externalId} mono />}
                        </div>
                    )}

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Payload cru</p>
                            <Button variant="ghost" size="sm" onClick={copyJson} leftIcon={copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}>
                                {copied ? 'Copiado' : 'Copiar JSON'}
                            </Button>
                        </div>
                        <pre className="text-[10px] font-mono p-3 bg-secondary/40 rounded-lg overflow-x-auto max-h-64 overflow-y-auto">
                            {JSON.stringify(event, null, 2)}
                        </pre>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Fechar</Button>
                    <Button onClick={onReprocess} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
                        Reprocessar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
