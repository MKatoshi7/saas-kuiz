'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar } from '@/components/ui/Avatar';
import {
    Search, Download, ChevronLeft, ChevronRight, Mail, Phone,
    Tag, MapPin, Monitor, User, Hash, CheckCircle2, X, Send
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Visitor {
    id: string;
    sessionId: string;
    startedAt: string | Date;
    completedAt: string | Date | null;
    userAgent: string | null;
    ip: string | null;
    city: string | null;
    region: string | null;
    country: string | null;
    answersSnapshot: Record<string, any>;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    utmContent: string | null;
    utmTerm: string | null;
    referrer: string | null;
    isLead: boolean;
    isConverted: boolean;
    email: string | null;
    name: string | null;
    phone: string | null;
}

interface Step { id: string; title: string; order: number }

/**
 * Caixa de entrada dedicada para **leads identificados**
 * (visitas que preencheram nome / email / telefone).
 *
 * - Lista compacta à esquerda
 * - Painel de detalhes à direita com TODAS as respostas
 * - Botão "Exportar só inputs" (CSV com nome/email/tel + respostas por etapa)
 */
export function LeadsInbox({ visitors, steps, funnelId }: {
    visitors: Visitor[]; steps: Step[]; funnelId: string
}) {
    const leads = useMemo(
        () => visitors.filter((v) => v.isLead || v.email || v.phone || v.name),
        [visitors]
    )
    const [search, setSearch] = useState('')
    const [selectedId, setSelectedId] = useState<string | null>(leads[0]?.id || null)
    const [page, setPage] = useState(1)
    const [noteText, setNoteText] = useState('')
    const limit = 20

    const filtered = leads.filter((l) => {
        if (!search) return true
        const q = search.toLowerCase()
        return (
            l.name?.toLowerCase().includes(q) ||
            l.email?.toLowerCase().includes(q) ||
            l.phone?.toLowerCase().includes(q) ||
            Object.values(l.answersSnapshot || {}).some((v) => String(v).toLowerCase().includes(q))
        )
    })

    const totalPages = Math.max(1, Math.ceil(filtered.length / limit))
    const pageItems = filtered.slice((page - 1) * limit, page * limit)
    const selected = filtered.find((l) => l.id === selectedId) || pageItems[0] || null

    const handleExportLeadsOnly = () => {
        if (filtered.length === 0) {
            toast.error('Nenhum lead para exportar')
            return
        }
        // CSV só com inputs capturados (nome, email, telefone) + respostas
        const headers = ['Lead #', 'Nome', 'Email', 'Telefone', 'Status', 'Data', 'Origem', 'UTM Source', 'UTM Campaign', 'UTM Content', 'UTM Term', ...steps.map((s, i) => `Etapa ${i + 1}: ${s.title}`)]
        const rows = filtered.map((l, i) => {
            return [
                `LEAD-${String(i + 1).padStart(4, '0')}`,
                l.name || '',
                l.email || '',
                l.phone || '',
                l.isConverted ? 'Convertido' : l.isLead ? 'Lead' : 'Visita',
                format(new Date(l.startedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
                l.referrer || 'Direto',
                l.utmSource || '',
                l.utmCampaign || '',
                l.utmContent || '',
                l.utmTerm || '',
                ...steps.map((s) => {
                    const v = l.answersSnapshot?.[s.id]
                    return v !== undefined && v !== null && v !== '' ? String(v) : ''
                })
            ]
        })

        const csv = [
            headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(','),
            ...rows.map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
        ].join('\n')

        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `leads_${funnelId}_${format(new Date(), 'yyyy-MM-dd')}.csv`
        link.click()
        URL.revokeObjectURL(url)
        toast.success(`${filtered.length} leads exportados!`)
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[380px,1fr] gap-4">
            {/* LISTA */}
            <Card className="overflow-hidden">
                <div className="p-3 border-b border-border/60 space-y-2">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {filtered.length} lead{filtered.length === 1 ? '' : 's'}
                        </p>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleExportLeadsOnly}
                            leftIcon={<Download className="w-3.5 h-3.5" />}
                            disabled={filtered.length === 0}
                        >
                            Exportar
                        </Button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                        <Input
                            placeholder="Buscar lead..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                            className="pl-9 h-9 text-sm"
                        />
                    </div>
                </div>
                <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                    {pageItems.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            Nenhum lead capturado ainda
                        </div>
                    ) : (
                        pageItems.map((lead) => {
                            const isActive = lead.id === selected?.id
                            return (
                                <button
                                    key={lead.id}
                                    onClick={() => setSelectedId(lead.id)}
                                    className={cn(
                                        'w-full text-left p-3 border-b border-border/40 hover:bg-secondary/50 transition-colors flex items-start gap-3',
                                        isActive && 'bg-secondary/60'
                                    )}
                                >
                                    <Avatar name={lead.name} email={lead.email} size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <p className="text-sm font-medium truncate">
                                                {lead.name || lead.email?.split('@')[0] || 'Sem nome'}
                                            </p>
                                            {lead.isConverted && <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />}
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {lead.email || lead.phone || '—'}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">
                                            {formatDistanceToNow(new Date(lead.startedAt), { addSuffix: true, locale: ptBR })}
                                        </p>
                                    </div>
                                </button>
                            )
                        })
                    )}
                </div>
                {totalPages > 1 && (
                    <div className="p-2 border-t border-border/60 flex items-center justify-between bg-secondary/20">
                        <span className="text-[10px] text-muted-foreground">
                            {page}/{totalPages}
                        </span>
                        <div className="flex gap-1">
                            <Button variant="outline" size="icon-sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                                <ChevronLeft className="w-3 h-3" />
                            </Button>
                            <Button variant="outline" size="icon-sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                                <ChevronRight className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* DETALHE */}
            <div>
                {selected ? (
                    <LeadDetailPanel lead={selected} steps={steps} funnelId={funnelId} />
                ) : (
                    <Card>
                        <CardContent className="p-12 text-center text-muted-foreground">
                            <User className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Selecione um lead para ver os detalhes</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}

function LeadDetailPanel({ lead, steps, funnelId }: { lead: Visitor; steps: Step[]; funnelId: string }) {
    const answers = lead.answersSnapshot || {}
    const inputAnswers = steps.map((step) => {
        const value = answers[step.id]
        return { step, value }
    }).filter((a) => a.value !== undefined && a.value !== null && a.value !== '')

    const handleCopy = (text: string, kind: string) => {
        navigator.clipboard.writeText(text)
        toast.success(`${kind} copiado!`)
    }

    return (
        <Card>
            <CardContent className="p-6 space-y-5">
                {/* Header */}
                <div className="flex items-start gap-4 pb-4 border-b border-border/60">
                    <Avatar name={lead.name} email={lead.email} size="lg" />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-xl font-semibold truncate">
                                {lead.name || lead.email?.split('@')[0] || 'Sem nome'}
                            </h2>
                            {lead.isConverted && <Badge variant="success" size="sm" dot>Convertido</Badge>}
                            {!lead.isConverted && lead.isLead && <Badge variant="info" size="sm" dot>Lead</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {format(new Date(lead.startedAt), "dd 'de' MMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                    </div>
                </div>

                {/* Inputs capturados (Nome / Email / Telefone) */}
                {(lead.name || lead.email || lead.phone) && (
                    <div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <User className="w-3 h-3" /> Dados de contato
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {lead.name && (
                                <button
                                    onClick={() => handleCopy(lead.name!, 'Nome')}
                                    className="group text-left p-3 rounded-xl bg-secondary/40 hover:bg-secondary transition-colors"
                                >
                                    <p className="text-[10px] text-muted-foreground mb-0.5">Nome</p>
                                    <p className="text-sm font-medium truncate flex items-center gap-1">
                                        {lead.name}
                                        <Send className="w-3 h-3 opacity-0 group-hover:opacity-50" />
                                    </p>
                                </button>
                            )}
                            {lead.email && (
                                <button
                                    onClick={() => handleCopy(lead.email!, 'Email')}
                                    className="group text-left p-3 rounded-xl bg-secondary/40 hover:bg-secondary transition-colors"
                                >
                                    <p className="text-[10px] text-muted-foreground mb-0.5 flex items-center gap-1">
                                        <Mail className="w-2.5 h-2.5" /> Email
                                    </p>
                                    <p className="text-sm font-medium truncate">{lead.email}</p>
                                </button>
                            )}
                            {lead.phone && (
                                <button
                                    onClick={() => handleCopy(lead.phone!, 'Telefone')}
                                    className="group text-left p-3 rounded-xl bg-secondary/40 hover:bg-secondary transition-colors"
                                >
                                    <p className="text-[10px] text-muted-foreground mb-0.5 flex items-center gap-1">
                                        <Phone className="w-2.5 h-2.5" /> Telefone
                                    </p>
                                    <p className="text-sm font-medium truncate">{lead.phone}</p>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Respostas por etapa (com label + valor) */}
                <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Hash className="w-3 h-3" /> Respostas ({inputAnswers.length})
                    </p>
                    {inputAnswers.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">Nenhuma resposta registrada</p>
                    ) : (
                        <div className="space-y-2">
                            {inputAnswers.map(({ step, value }, idx) => (
                                <div key={step.id} className="p-3 rounded-xl bg-secondary/30 border-l-2 border-foreground/20">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                            Etapa {idx + 1} · {step.title}
                                        </p>
                                        <button
                                            onClick={() => handleCopy(String(value), 'Resposta')}
                                            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            Copiar
                                        </button>
                                    </div>
                                    <p className="text-sm font-medium break-words">{String(value)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* UTM */}
                {(lead.utmSource || lead.utmCampaign || lead.utmContent || lead.utmTerm || lead.utmMedium) && (
                    <div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Tag className="w-3 h-3" /> Origem
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                            {lead.utmSource && <UtmPill label="Source" value={lead.utmSource} />}
                            {lead.utmMedium && <UtmPill label="Medium" value={lead.utmMedium} />}
                            {lead.utmCampaign && <UtmPill label="Campaign" value={lead.utmCampaign} />}
                            {lead.utmContent && <UtmPill label="Ad" value={lead.utmContent} />}
                            {lead.utmTerm && <UtmPill label="AdSet" value={lead.utmTerm} />}
                        </div>
                    </div>
                )}

                {/* Meta */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-secondary/30">
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> Localização</p>
                        <p className="font-medium mt-0.5">{[lead.city, lead.region, lead.country].filter(Boolean).join(', ') || '—'}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-secondary/30">
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Monitor className="w-3 h-3" /> IP</p>
                        <p className="font-mono text-[11px] mt-0.5">{lead.ip || '—'}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function UtmPill({ label, value }: { label: string; value: string }) {
    return (
        <div className="px-2.5 py-1.5 rounded-lg bg-secondary/40">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="font-mono text-[11px] truncate" title={value}>{value}</p>
        </div>
    )
}
