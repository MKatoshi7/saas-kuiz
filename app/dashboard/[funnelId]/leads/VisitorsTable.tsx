'use client';

import { useState, useMemo } from 'react';
import {
    Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import {
    Eye, ChevronLeft, ChevronRight, Search, Tag,
    ExternalLink, Mail, Phone, MapPin, Monitor,
    Clock, Target, Hash, Globe, X, User, Download,
    Smartphone, Laptop, Tablet, Copy
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
    deviceType: string | null;
    browser: string | null;
    referrer: string | null;
    fbc: string | null;
    fbp: string | null;
    answersSnapshot: Record<string, any>;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    utmContent: string | null;
    utmTerm: string | null;
    isLead: boolean;
    isConverted: boolean;
    email: string | null;
    name: string | null;
    phone: string | null;
}

interface Step {
    id: string;
    title: string;
    order: number;
}

interface StepStat {
    id: string;
    title: string;
    count: number;
    percentage: number;
}

interface VisitorsTableProps {
    visitors: Visitor[];
    steps: Step[];
    stepStats: StepStat[];
    funnelId: string;
}

export function VisitorsTable({ visitors, steps, stepStats, funnelId }: VisitorsTableProps) {
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null)
    const limit = 30

    const filtered = visitors.filter((v) => {
        if (!search) return true
        const q = search.toLowerCase()
        return (
            v.sessionId?.toLowerCase().includes(q) ||
            v.email?.toLowerCase().includes(q) ||
            v.name?.toLowerCase().includes(q) ||
            v.phone?.toLowerCase().includes(q) ||
            v.utmSource?.toLowerCase().includes(q) ||
            v.utmCampaign?.toLowerCase().includes(q) ||
            v.answersSnapshot && Object.values(v.answersSnapshot).some(
                (val) => String(val).toLowerCase().includes(q)
            )
        )
    })

    const totalPages = Math.max(1, Math.ceil(filtered.length / limit))
    const pageItems = filtered.slice((page - 1) * limit, page * limit)

    return (
        <>
            <div className="flex flex-col md:flex-row gap-3 mb-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                        placeholder="Buscar por nome, email, UTM, resposta..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                        className="pl-10"
                    />
                </div>
                <div className="text-xs text-muted-foreground self-center">
                    {filtered.length} visitante{filtered.length === 1 ? '' : 's'}
                </div>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="min-w-[150px]">Quando</TableHead>
                                <TableHead>Origem</TableHead>
                                <TableHead>UTM</TableHead>
                                <TableHead>Identificado</TableHead>
                                {steps.map((step, idx) => {
                                    const stat = stepStats.find((s) => s.id === step.id)
                                    return (
                                        <TableHead key={step.id} className="min-w-[170px]">
                                            <div className="flex items-stretch gap-2">
                                                <div className="flex flex-col items-center shrink-0 w-2.5 pt-0.5">
                                                    <div className="w-1 flex-1 bg-secondary rounded-full overflow-hidden relative" style={{ minHeight: '36px' }}>
                                                        <div
                                                            className={cn(
                                                                'absolute bottom-0 left-0 w-full rounded-full transition-all',
                                                                (stat?.percentage || 0) >= 70 ? 'bg-emerald-500' :
                                                                (stat?.percentage || 0) >= 40 ? 'bg-amber-500' : 'bg-red-500'
                                                            )}
                                                            style={{ height: `${stat?.percentage || 0}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate" title={step.title}>
                                                        Etapa {idx + 1} · {step.title}
                                                    </p>
                                                    <p className="text-sm font-bold text-foreground tabular-nums mt-0.5">
                                                        {stat?.percentage || 0}%
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground tabular-nums">
                                                        {stat?.count || 0} resposta{stat?.count === 1 ? '' : 's'}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableHead>
                                    )
                                })}
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pageItems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5 + steps.length} className="h-32 text-center text-muted-foreground">
                                        Nenhum visitante registrado
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pageItems.map((visitor) => (
                                    <TableRow key={visitor.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-medium">
                                                    {format(new Date(visitor.startedAt), "dd/MM HH:mm", { locale: ptBR })}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {formatDistanceToNow(new Date(visitor.startedAt), { addSuffix: true, locale: ptBR })}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {visitor.referrer ? (
                                                <span className="text-xs text-muted-foreground truncate max-w-[180px] block" title={visitor.referrer}>
                                                    {(() => {
                                                        try { return new URL(visitor.referrer).hostname } catch { return visitor.referrer }
                                                    })()}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground/40 text-xs">Direto</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <UtmCell
                                                source={visitor.utmSource}
                                                medium={visitor.utmMedium}
                                                campaign={visitor.utmCampaign}
                                                content={visitor.utmContent}
                                                term={visitor.utmTerm}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {visitor.email ? (
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-medium truncate max-w-[160px]">{visitor.name || '—'}</span>
                                                    <span className="text-[10px] text-muted-foreground truncate max-w-[160px]">{visitor.email}</span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground/40 text-xs">Anônimo</span>
                                            )}
                                        </TableCell>
                                        {steps.map((step) => {
                                            const value = visitor.answersSnapshot?.[step.id]
                                            return (
                                                <TableCell key={step.id}>
                                                    {value ? (
                                                        <Badge variant="success" size="sm">
                                                            <span className="truncate max-w-[140px]">{String(value)}</span>
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground/30 text-xs">—</span>
                                                    )}
                                                </TableCell>
                                            )
                                        })}
                                        <TableCell>
                                            {visitor.isConverted ? (
                                                <Badge variant="success" size="sm" dot>Convertido</Badge>
                                            ) : visitor.isLead ? (
                                                <Badge variant="info" size="sm" dot>Lead</Badge>
                                            ) : (
                                                <Badge variant="secondary" size="sm">Visita</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => setSelectedVisitor(visitor)}
                                            >
                                                <Eye className="w-4 h-4" />
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

            {selectedVisitor && (
                <VisitorDetailDialog
                    visitor={selectedVisitor}
                    steps={steps}
                    onClose={() => setSelectedVisitor(null)}
                />
            )}
        </>
    )
}

function UtmCell({ source, medium, campaign, content, term }: {
    source: string | null; medium: string | null; campaign: string | null; content: string | null; term: string | null
}) {
    const [open, setOpen] = useState(false)
    const hasAny = source || medium || campaign || content || term
    if (!hasAny) return <span className="text-muted-foreground/30 text-xs">—</span>

    return (
        <div className="relative inline-block">
            <button
                onClick={() => setOpen(!open)}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary/60 hover:bg-secondary text-xs font-medium transition-colors"
            >
                {source ? (
                    <Badge variant="primary" size="sm">{source}</Badge>
                ) : (
                    <span className="text-muted-foreground">Direto</span>
                )}
                {(campaign || content || term || medium) && (
                    <span className="text-[9px] text-muted-foreground">+{[
                        campaign, content, term, medium
                    ].filter(Boolean).length}</span>
                )}
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
                    <div className="absolute z-40 left-0 top-full mt-1 w-64 bg-background border border-border/60 rounded-xl shadow-2xl p-3 animate-fade-in-up">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                            Parâmetros UTM
                        </p>
                        <div className="space-y-1.5">
                            <UtmRow label="Source" value={source} />
                            <UtmRow label="Medium" value={medium} />
                            <UtmRow label="Campaign" value={campaign} />
                            <UtmRow label="Content (anúncio)" value={content} />
                            <UtmRow label="Term (conjunto)" value={term} />
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

function UtmRow({ label, value }: { label: string; value: string | null }) {
    return (
        <div className="flex items-center gap-2 px-1">
            <span className="text-[10px] text-muted-foreground w-24 shrink-0">{label}</span>
            <span className={cn('text-xs font-mono truncate', value ? 'text-foreground' : 'text-muted-foreground/40')}>
                {value || '—'}
            </span>
        </div>
    )
}

function DeviceIcon({ type }: { type: string | null }) {
    if (type === 'mobile') return <Smartphone className="w-3.5 h-3.5" />
    if (type === 'tablet') return <Tablet className="w-3.5 h-3.5" />
    return <Laptop className="w-3.5 h-3.5" />
}

function InfoRow({ label, value, mono, icon: Icon }: {
    label: string; value: string | null; mono?: boolean; icon?: any
}) {
    const [copied, setCopied] = useState(false)
    const handleCopy = () => {
        if (!value) return
        navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }
    return (
        <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group">
            {Icon && (
                <div className="mt-0.5 text-muted-foreground shrink-0">
                    <Icon className="w-3.5 h-3.5" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                <p className={cn(
                    'text-sm mt-0.5 break-all',
                    mono ? 'font-mono text-[11px]' : '',
                    value ? 'text-foreground' : 'text-muted-foreground/40'
                )}>
                    {value || '—'}
                </p>
            </div>
            {value && (
                <button
                    onClick={handleCopy}
                    className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 text-muted-foreground hover:text-foreground"
                    title="Copiar"
                >
                    {copied ? (
                        <span className="text-[10px] text-emerald-500 font-medium">Copiado!</span>
                    ) : (
                        <Copy className="w-3 h-3" />
                    )}
                </button>
            )}
        </div>
    )
}

function VisitorDetailDialog({ visitor, steps, onClose }: {
    visitor: Visitor; steps: Step[]; onClose: () => void
}) {
    const answers = visitor.answersSnapshot || {}
    const hasFacebook = visitor.fbc || visitor.fbp

    return (
        <Dialog open onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto p-0">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                'w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0',
                                visitor.email
                                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                                    : 'bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-600 text-zinc-600 dark:text-zinc-200'
                            )}>
                                {visitor.name ? visitor.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold">
                                    {visitor.name || 'Visitante Anônimo'}
                                </DialogTitle>
                                <DialogDescription className="text-xs mt-0.5">
                                    Sessão iniciada {formatDistanceToNow(new Date(visitor.startedAt), { addSuffix: true, locale: ptBR })}
                                </DialogDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {visitor.isConverted ? (
                                <Badge variant="success" size="sm" dot>Convertido</Badge>
                            ) : visitor.isLead ? (
                                <Badge variant="info" size="sm" dot>Lead</Badge>
                            ) : (
                                <Badge variant="secondary" size="sm">Visita</Badge>
                            )}
                            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="px-6 py-4 space-y-5">
                    {/* Dados de Contato */}
                    {(visitor.email || visitor.phone) && (
                        <Section title="Dados de Contato" icon={User}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <InfoRow label="Nome" value={visitor.name} icon={User} />
                                <InfoRow label="E-mail" value={visitor.email} icon={Mail} />
                                <InfoRow label="Telefone" value={visitor.phone} icon={Phone} />
                            </div>
                        </Section>
                    )}

                    {/* Localização e Dispositivo */}
                    <Section title="Localização & Dispositivo" icon={MapPin}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            <InfoRow
                                label="País"
                                value={visitor.country}
                                icon={Globe}
                            />
                            <InfoRow
                                label="Cidade"
                                value={visitor.city}
                                icon={MapPin}
                            />
                            <InfoRow
                                label="Região"
                                value={visitor.region}
                                icon={MapPin}
                            />
                            <InfoRow
                                label="IP"
                                value={visitor.ip}
                                mono
                                icon={Monitor}
                            />
                            <InfoRow
                                label="Dispositivo"
                                value={visitor.deviceType ? (visitor.deviceType === 'mobile' ? 'Mobile' : visitor.deviceType === 'tablet' ? 'Tablet' : 'Desktop') : null}
                                icon={visitor.deviceType === 'mobile' ? Smartphone : visitor.deviceType === 'tablet' ? Tablet : Laptop}
                            />
                            <InfoRow
                                label="Navegador"
                                value={visitor.browser}
                                icon={Globe}
                            />
                        </div>
                    </Section>

                    {/* Facebook Tracking */}
                    {hasFacebook && (
                        <Section title="Facebook Tracking" icon={ExternalLink}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <InfoRow label="fbc (click ID)" value={visitor.fbc} mono />
                                <InfoRow label="fbp (pixel ID)" value={visitor.fbp} mono />
                            </div>
                        </Section>
                    )}

                    {/* UTMs */}
                    <Section title="UTMs & Origem" icon={Tag}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            <InfoRow label="Source" value={visitor.utmSource} />
                            <InfoRow label="Medium" value={visitor.utmMedium} />
                            <InfoRow label="Campaign" value={visitor.utmCampaign} />
                            <InfoRow label="Content" value={visitor.utmContent} />
                            <InfoRow label="Term" value={visitor.utmTerm} />
                            <InfoRow
                                label="Referrer"
                                value={visitor.referrer ? (() => {
                                    try { return new URL(visitor.referrer).hostname } catch { return visitor.referrer }
                                })() : null}
                                icon={ExternalLink}
                            />
                        </div>
                    </Section>

                    {/* Respostas por Etapa */}
                    <Section title="Respostas por Etapa" icon={Target}>
                        <div className="space-y-2">
                            {steps.map((step, idx) => {
                                const value = answers[step.id]
                                if (value === undefined || value === null || value === '') return null
                                return (
                                    <div key={step.id} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/40 hover:bg-secondary/60 transition-colors">
                                        <div className="h-7 w-7 shrink-0 rounded-lg bg-foreground text-background flex items-center justify-center text-[10px] font-mono font-bold">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
                                                {step.title}
                                            </p>
                                            <p className="text-sm font-medium mt-0.5 break-words">
                                                {String(value)}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                            {Object.keys(answers).length === 0 && (
                                <p className="text-xs text-muted-foreground text-center py-3">Nenhuma resposta registrada</p>
                            )}
                        </div>
                    </Section>

                    {/* Sessão */}
                    <Section title="Sessão" icon={Clock}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            <InfoRow
                                label="Início"
                                value={format(new Date(visitor.startedAt), "dd/MM/yy HH:mm:ss", { locale: ptBR })}
                                icon={Clock}
                            />
                            <InfoRow
                                label="Fim"
                                value={visitor.completedAt
                                    ? format(new Date(visitor.completedAt), "dd/MM/yy HH:mm:ss", { locale: ptBR })
                                    : null}
                                icon={Clock}
                            />
                            <InfoRow
                                label="Duração"
                                value={visitor.completedAt
                                    ? (() => {
                                        const ms = new Date(visitor.completedAt).getTime() - new Date(visitor.startedAt).getTime()
                                        const min = Math.floor(ms / 60000)
                                        const sec = Math.floor((ms % 60000) / 1000)
                                        return `${min}m ${sec}s`
                                    })()
                                    : null}
                                icon={Clock}
                            />
                            <InfoRow
                                label="ID da Sessão"
                                value={visitor.sessionId}
                                mono
                                icon={Hash}
                            />
                        </div>
                    </Section>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function Section({ title, icon: Icon, children }: {
    title: string; icon: any; children: React.ReactNode
}) {
    return (
        <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Icon className="w-3 h-3" /> {title}
            </p>
            {children}
        </div>
    )
}

function UtmKV({ label, value }: { label: string; value: string | null }) {
    return (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/40">
            <span className="text-[10px] text-muted-foreground w-16 shrink-0">{label}</span>
            <span className={cn('font-mono text-[11px] truncate', value ? 'text-foreground' : 'text-muted-foreground/40')}>
                {value || '—'}
            </span>
        </div>
    )
}
