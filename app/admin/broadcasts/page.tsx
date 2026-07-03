'use client'

import React, { useState, useEffect } from 'react'
import { Send, Loader2, Users, ChevronLeft, ChevronRight, Mail, Eye, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '@/components/ui/table'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Avatar } from '@/components/ui/Avatar'

interface Broadcast {
    id: string
    subject: string
    message: string
    segmentRole: string | null
    segmentPlan: string | null
    segmentStatus: string | null
    totalTargeted: number
    totalSent: number
    status: string
    sentAt: string | null
    createdAt: string
    author: { id: string; name: string | null; email: string }
}

const PLAN_OPTIONS = [
    { value: 'all', label: 'Todos' },
    { value: 'free', label: 'Free' },
    { value: 'starter', label: 'Starter' },
    { value: 'pro', label: 'Pro' },
    { value: 'enterprise', label: 'Enterprise' },
]

const STATUS_OPTIONS = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Ativos' },
    { value: 'expired', label: 'Expirados' },
    { value: 'canceled', label: 'Cancelados' },
    { value: 'free', label: 'Free' },
]

export default function BroadcastsPage() {
    const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    // Form
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [segment, setSegment] = useState({
        role: 'all' as 'all' | 'user' | 'admin',
        plan: 'all',
        status: 'all',
    })
    const [previewCount, setPreviewCount] = useState<number | null>(null)
    const [previewing, setPreviewing] = useState(false)
    const [sending, setSending] = useState(false)
    const [selected, setSelected] = useState<Broadcast | null>(null)

    const fetchBroadcasts = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/broadcasts?page=${page}`)
            const data = await res.json()
            setBroadcasts(data.broadcasts || [])
            setTotalPages(data.pages || 1)
        } catch {
            toast.error('Erro ao carregar')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBroadcasts()
    }, [page])

    const handlePreview = async () => {
        setPreviewing(true)
        try {
            const res = await fetch('/api/admin/broadcasts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject, message, segment, action: 'preview' }),
            })
            const data = await res.json()
            setPreviewCount(data.totalTargeted)
        } catch {
            toast.error('Erro ao calcular')
        } finally {
            setPreviewing(false)
        }
    }

    const handleSend = async () => {
        if (!subject.trim() || !message.trim()) {
            toast.error('Preencha assunto e mensagem')
            return
        }
        if (previewCount === 0) {
            toast.error('Nenhum usuário no segmento')
            return
        }
        if (!confirm(`Enviar para ${previewCount} usuário(s)?`)) return

        setSending(true)
        try {
            const res = await fetch('/api/admin/broadcasts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject, message, segment }),
            })
            if (!res.ok) throw new Error()
            const data = await res.json()
            toast.success(`Enviado para ${data.broadcast.totalSent} de ${data.broadcast.totalTargeted}`)
            setSubject('')
            setMessage('')
            setPreviewCount(null)
            fetchBroadcasts()
        } catch {
            toast.error('Erro ao enviar')
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Broadcast</h1>
                <p className="text-muted-foreground mt-1">Envie mensagens em massa para um segmento de usuários.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Nova Mensagem</CardTitle>
                        <CardDescription>Escreva a mensagem e selecione o segmento-alvo.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Assunto *</Label>
                            <Input
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Ex: Novidades no Kuiz — Confira!"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Mensagem *</Label>
                            <Textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={8}
                                placeholder="Use quebras de linha para parágrafos..."
                            />
                        </div>

                        <div className="space-y-3 pt-2">
                            <Label>Segmentação</Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Plano</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {PLAN_OPTIONS.map((p) => (
                                            <button
                                                key={p.value}
                                                onClick={() => setSegment({ ...segment, plan: p.value })}
                                                className={`h-8 px-3 rounded-full text-xs font-medium border transition-colors ${
                                                    segment.plan === p.value
                                                        ? 'bg-foreground text-background border-foreground'
                                                        : 'border-border text-muted-foreground hover:border-foreground/30'
                                                }`}
                                            >
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Status</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {STATUS_OPTIONS.map((s) => (
                                            <button
                                                key={s.value}
                                                onClick={() => setSegment({ ...segment, status: s.value })}
                                                className={`h-8 px-3 rounded-full text-xs font-medium border transition-colors ${
                                                    segment.status === s.value
                                                        ? 'bg-foreground text-background border-foreground'
                                                        : 'border-border text-muted-foreground hover:border-foreground/30'
                                                }`}
                                            >
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-border/60">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePreview}
                                    loading={previewing}
                                    leftIcon={<Users className="w-3.5 h-3.5" />}
                                >
                                    Calcular público
                                </Button>
                                {previewCount !== null && (
                                    <Badge variant={previewCount > 0 ? 'info' : 'secondary'}>
                                        {previewCount} usuário{previewCount === 1 ? '' : 's'}
                                    </Badge>
                                )}
                            </div>
                            <Button
                                onClick={handleSend}
                                loading={sending}
                                disabled={!subject || !message || previewCount === 0}
                                leftIcon={<Send className="w-3.5 h-3.5" />}
                            >
                                Enviar broadcast
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Preview do E-mail</CardTitle>
                        <CardDescription>Como o usuário verá</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-secondary/40 rounded-xl p-4 min-h-[200px]">
                            <div className="bg-background rounded-lg p-4 shadow-sm">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                                    {subject || 'Assunto'}
                                </p>
                                <h3 className="font-semibold text-base mb-3">
                                    {subject || 'Seu assunto aqui'}
                                </h3>
                                <p className="text-xs text-muted-foreground mb-3">Olá,</p>
                                <div className="text-sm whitespace-pre-wrap leading-relaxed">
                                    {message || 'Sua mensagem aparecerá aqui...'}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Broadcasts</CardTitle>
                </CardHeader>
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead>Data</TableHead>
                            <TableHead>Assunto</TableHead>
                            <TableHead>Segmento</TableHead>
                            <TableHead>Enviados</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : broadcasts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    Nenhum broadcast enviado
                                </TableCell>
                            </TableRow>
                        ) : (
                            broadcasts.map((b) => (
                                <TableRow key={b.id}>
                                    <TableCell>
                                        <div>
                                            <p className="text-sm">{format(new Date(b.createdAt), "dd/MM/yyyy", { locale: ptBR })}</p>
                                            <p className="text-[11px] text-muted-foreground">
                                                {format(new Date(b.createdAt), 'HH:mm', { locale: ptBR })}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-sm font-medium truncate max-w-xs">{b.subject}</p>
                                        <p className="text-[11px] text-muted-foreground">por {b.author.name || b.author.email}</p>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {b.segmentPlan && b.segmentPlan !== 'all' && <Badge variant="outline" size="sm">{b.segmentPlan}</Badge>}
                                            {b.segmentStatus && b.segmentStatus !== 'all' && <Badge variant="outline" size="sm">{b.segmentStatus}</Badge>}
                                            {(!b.segmentPlan || b.segmentPlan === 'all') && (!b.segmentStatus || b.segmentStatus === 'all') && (
                                                <span className="text-xs text-muted-foreground">Todos</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm font-semibold">{b.totalSent}</span>
                                        <span className="text-muted-foreground text-sm"> / {b.totalTargeted}</span>
                                    </TableCell>
                                    <TableCell>
                                        {b.status === 'sent' && <Badge variant="success" size="sm" dot>Enviado</Badge>}
                                        {b.status === 'sending' && <Badge variant="info" size="sm" dot>Enviando</Badge>}
                                        {b.status === 'failed' && <Badge variant="destructive" size="sm" dot>Falhou</Badge>}
                                        {b.status === 'draft' && <Badge variant="secondary" size="sm" dot>Rascunho</Badge>}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon-sm" onClick={() => setSelected(b)}>
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                <div className="px-4 py-3 border-t border-border/60 flex items-center justify-between bg-secondary/20">
                    <span className="text-xs text-muted-foreground">
                        Página <span className="font-semibold">{page}</span> de {totalPages}
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
            </Card>

            {/* Detail dialog */}
            {selected && (
                <Dialog open onOpenChange={() => setSelected(null)}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>{selected.subject}</DialogTitle>
                            <DialogDescription>
                                Enviado por {selected.author.name || selected.author.email} · {format(new Date(selected.createdAt), "dd 'de' MMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="bg-secondary/30 rounded-xl p-4 max-h-[40vh] overflow-y-auto">
                            <p className="text-sm whitespace-pre-wrap">{selected.message}</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Alcance: <strong className="text-foreground">{selected.totalTargeted}</strong></span>
                            <span>Enviados: <strong className="text-foreground">{selected.totalSent}</strong></span>
                            <span>Status: <strong className="text-foreground">{selected.status}</strong></span>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}
