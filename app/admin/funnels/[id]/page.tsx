'use client'

import React, { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    ArrowLeft, ExternalLink, Eye, Ban, CheckCircle, Loader2,
    Users, UserCheck, TrendingUp, Target, Calendar, MessageSquarePlus,
    Trash2, Send, Copy, Globe, User, Activity, Tag
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/Avatar'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/Skeleton'
import {
    Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { StatCard } from '@/components/ui/StatCard'

interface FunnelDetailData {
    funnel: {
        id: string
        title: string
        slug: string
        description: string | null
        status: string
        isBanned: boolean
        banReason: string | null
        createdAt: string
        updatedAt: string
        publishedAt: string | null
        customDomain: string | null
        user: {
            id: string
            name: string | null
            email: string
            subscriptionStatus: string | null
            subscriptionPlan: string | null
            createdAt: string
        }
        steps: { id: string; title: string; order: number; _count: { components: number } }[]
    }
    metrics: {
        totalSessions: number
        sessionsThisMonth: number
        totalLeads: number
        leadsThisMonth: number
        totalConverted: number
        convertedThisMonth: number
        uniqueVisitors: number
        conversionRate: number
        completionRate: number
    }
    stepStats: { id: string; title: string; order: number; components: number; visitors: number; retention: number }[]
    topUtmSources: { source: string; count: number }[]
    recentSessions: any[]
    dailyChart: { day: string; count: number }[]
}

interface Note {
    id: string
    content: string
    createdAt: string
    author: { id: string; name: string | null; email: string }
}

export default function FunnelDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [data, setData] = useState<FunnelDetailData | null>(null)
    const [loading, setLoading] = useState(true)
    const [notes, setNotes] = useState<Note[]>([])
    const [noteText, setNoteText] = useState('')
    const [postingNote, setPostingNote] = useState(false)
    const [banDialogOpen, setBanDialogOpen] = useState(false)
    const [banReason, setBanReason] = useState('')
    const [isBanning, setIsBanning] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/admin/funnels/${id}`)
            if (!res.ok) throw new Error('Failed')
            const json = await res.json()
            setData(json)
            setBanReason(json.funnel.banReason || '')
        } catch (e) {
            toast.error('Erro ao carregar funil')
        } finally {
            setLoading(false)
        }
    }

    const fetchNotes = async () => {
        try {
            const res = await fetch(`/api/admin/funnels/${id}/notes`)
            if (res.ok) {
                const json = await res.json()
                setNotes(json.notes || [])
            }
        } catch {}
    }

    useEffect(() => {
        fetchData()
        fetchNotes()
    }, [id])

    const handleBan = async () => {
        const newState = !data?.funnel.isBanned
        if (newState && !banReason.trim()) {
            toast.error('Informe o motivo')
            return
        }
        setIsBanning(true)
        try {
            const res = await fetch(`/api/admin/funnels/${id}/ban`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isBanned: newState, reason: banReason }),
            })
            if (!res.ok) throw new Error()
            toast.success(newState ? 'Funil banido' : 'Funil desbanido')
            setBanDialogOpen(false)
            fetchData()
        } catch {
            toast.error('Erro ao atualizar funil')
        } finally {
            setIsBanning(false)
        }
    }

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const res = await fetch(`/api/admin/funnels/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error()
            toast.success('Funil deletado')
            router.push('/admin/funnels')
        } catch {
            toast.error('Erro ao deletar')
            setIsDeleting(false)
        }
    }

    const handleAddNote = async () => {
        if (!noteText.trim()) return
        setPostingNote(true)
        try {
            const res = await fetch(`/api/admin/funnels/${id}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: noteText }),
            })
            if (!res.ok) throw new Error()
            setNoteText('')
            fetchNotes()
            toast.success('Anotação adicionada')
        } catch {
            toast.error('Erro ao salvar anotação')
        } finally {
            setPostingNote(false)
        }
    }

    const handleDeleteNote = async (noteId: string) => {
        try {
            await fetch(`/api/admin/funnels/notes/${noteId}`, { method: 'DELETE' })
            fetchNotes()
        } catch {
            toast.error('Erro ao deletar')
        }
    }

    const copySlug = () => {
        if (!data) return
        navigator.clipboard.writeText(`${window.location.origin}/${data.funnel.slug}`)
        toast.success('URL copiada!')
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-64" />
                <div className="grid grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
                </div>
                <Skeleton className="h-96 rounded-2xl" />
            </div>
        )
    }

    if (!data) return <div>Funil não encontrado</div>

    const { funnel, metrics, stepStats, recentSessions, dailyChart, topUtmSources } = data
    const maxDaily = Math.max(...dailyChart.map((d) => d.count), 1)

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex items-center gap-3">
                <Link href="/admin/funnels">
                    <Button variant="ghost" size="icon-sm">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl font-bold tracking-tight truncate">{funnel.title}</h1>
                        {funnel.isBanned ? (
                            <Badge variant="destructive" dot>Banido</Badge>
                        ) : funnel.status === 'published' ? (
                            <Badge variant="success" dot>Publicado</Badge>
                        ) : (
                            <Badge variant="secondary" dot>Rascunho</Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <button onClick={copySlug} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                            <code className="font-mono text-xs">/{funnel.slug}</code>
                            <Copy className="w-3 h-3" />
                        </button>
                        {funnel.customDomain && (
                            <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                <code className="font-mono text-xs">{funnel.customDomain}</code>
                            </span>
                        )}
                        <span>·</span>
                        <span>criado {formatDistanceToNow(new Date(funnel.createdAt), { addSuffix: true, locale: ptBR })}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/f/${funnel.id}`} target="_blank">
                        <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                            Preview
                        </Button>
                    </Link>
                    <Link href={`/dashboard/${funnel.id}/builder`} target="_blank">
                        <Button variant="outline" size="sm" leftIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                            Builder
                        </Button>
                    </Link>
                    <Button
                        size="sm"
                        variant={funnel.isBanned ? 'default' : 'outline'}
                        onClick={() => setBanDialogOpen(true)}
                        leftIcon={funnel.isBanned ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                    >
                        {funnel.isBanned ? 'Desbanir' : 'Banir'}
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteDialogOpen(true)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>

            {/* Owner card */}
            <Card>
                <CardContent className="p-5 flex items-center gap-4">
                    <Avatar name={funnel.user.name} email={funnel.user.email} size="lg" />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="font-semibold truncate">{funnel.user.name || 'Sem nome'}</p>
                            <Badge variant={funnel.user.subscriptionStatus === 'active' ? 'success' : 'secondary'} size="sm">
                                {funnel.user.subscriptionPlan || 'Free'}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{funnel.user.email}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                            cadastrado {formatDistanceToNow(new Date(funnel.user.createdAt), { addSuffix: true, locale: ptBR })}
                        </p>
                    </div>
                    <Link href={`/admin/users/${funnel.user.id}`}>
                        <Button variant="outline" size="sm">Ver usuário</Button>
                    </Link>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                            try {
                                const res = await fetch('/api/admin/impersonate', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ userId: funnel.user.id }),
                                })
                                if (res.ok) {
                                    window.location.href = `/dashboard/${funnel.id}/builder`
                                } else throw new Error()
                            } catch {
                                toast.error('Erro ao impersonar')
                            }
                        }}
                    >
                        <User className="w-3.5 h-3.5" />
                        Acessar conta
                    </Button>
                </CardContent>
            </Card>

            {/* Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Visitantes"
                    value={metrics.totalSessions.toLocaleString('pt-BR')}
                    icon={Users}
                    trend={{ value: 0, label: `${metrics.sessionsThisMonth} este mês` }}
                />
                <StatCard
                    label="Leads"
                    value={metrics.totalLeads.toLocaleString('pt-BR')}
                    icon={UserCheck}
                    variant="primary"
                />
                <StatCard
                    label="Conversão"
                    value={`${metrics.conversionRate}%`}
                    icon={TrendingUp}
                />
                <StatCard
                    label="Conclusão"
                    value={`${metrics.completionRate}%`}
                    icon={Target}
                />
            </div>

            <Tabs defaultValue="analytics">
                <TabsList>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="sessions">Sessões</TabsTrigger>
                    <TabsTrigger value="notes">Anotações {notes.length > 0 && <span className="ml-1.5 text-[10px] bg-secondary px-1.5 py-0.5 rounded-full">{notes.length}</span>}</TabsTrigger>
                </TabsList>

                <TabsContent value="analytics">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Sessões (30 dias)</CardTitle>
                                <CardDescription>Últimas 4 semanas de atividade</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-56 flex items-end gap-1">
                                    {dailyChart.map((d, i) => {
                                        const heightPct = (d.count / maxDaily) * 100
                                        return (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                                                <div className="relative w-full h-full flex items-end">
                                                    <div
                                                        className="w-full bg-foreground/10 rounded-t-md group-hover:bg-foreground/30 transition-colors"
                                                        style={{ height: `${Math.max(heightPct, 2)}%` }}
                                                    />
                                                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="bg-foreground text-background text-[10px] font-semibold rounded px-1.5 py-0.5 whitespace-nowrap">
                                                            {d.count}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Top UTMs</CardTitle>
                                <CardDescription>Fontes de tráfego</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {topUtmSources.length === 0 ? (
                                    <p className="text-sm text-muted-foreground py-4 text-center">Sem dados</p>
                                ) : (
                                    <div className="space-y-2">
                                        {topUtmSources.map((s, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <span className="text-sm font-medium truncate">{s.source}</span>
                                                <Badge variant="secondary">{s.count}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-3">
                            <CardHeader>
                                <CardTitle>Retenção por Etapa</CardTitle>
                                <CardDescription>Quantos visitantes visualizaram cada etapa</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {stepStats.map((s) => (
                                        <div key={s.id} className="flex items-center gap-3">
                                            <span className="text-xs font-mono text-muted-foreground w-6 text-right">{s.order + 1}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-medium truncate">{s.title}</span>
                                                    <span className="text-xs text-muted-foreground ml-2">
                                                        {s.visitors} · {s.retention}%
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${
                                                            s.retention >= 70 ? 'bg-emerald-500' :
                                                            s.retention >= 40 ? 'bg-amber-500' : 'bg-red-500'
                                                        }`}
                                                        style={{ width: `${s.retention}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="sessions">
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead>Quando</TableHead>
                                    <TableHead>Origem</TableHead>
                                    <TableHead>Identificado</TableHead>
                                    <TableHead>Dispositivo</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentSessions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                            Nenhuma sessão registrada
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    recentSessions.map((s) => (
                                        <TableRow key={s.id}>
                                            <TableCell>
                                                <span className="text-sm">
                                                    {format(new Date(s.startedAt), "dd/MM HH:mm", { locale: ptBR })}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">{s.utmSource || 'Direto'}</span>
                                            </TableCell>
                                            <TableCell>
                                                {s.email ? (
                                                    <div>
                                                        <p className="text-sm font-medium">{s.name || '—'}</p>
                                                        <p className="text-[11px] text-muted-foreground">{s.email}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">Anônimo</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-muted-foreground">{s.deviceType || '—'}</span>
                                            </TableCell>
                                            <TableCell>
                                                {s.isConverted ? (
                                                    <Badge variant="success" size="sm">Convertido</Badge>
                                                ) : s.isLead ? (
                                                    <Badge variant="info" size="sm">Lead</Badge>
                                                ) : (
                                                    <Badge variant="secondary" size="sm">Visitou</Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                <TabsContent value="notes">
                    <Card>
                        <CardContent className="p-5 space-y-4">
                            <div className="space-y-2">
                                <Label>Nova anotação interna</Label>
                                <Textarea
                                    placeholder="Escreva uma nota para outros admins (ex: cliente contatou suporte pedindo downgrade...)"
                                    value={noteText}
                                    onChange={(e) => setNoteText(e.target.value)}
                                    rows={3}
                                />
                                <div className="flex justify-end">
                                    <Button
                                        size="sm"
                                        onClick={handleAddNote}
                                        loading={postingNote}
                                        disabled={!noteText.trim()}
                                        leftIcon={<MessageSquarePlus className="w-3.5 h-3.5" />}
                                    >
                                        Adicionar anotação
                                    </Button>
                                </div>
                            </div>

                            <div className="border-t border-border/60 pt-4 space-y-3">
                                {notes.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-6">
                                        Nenhuma anotação para este funil
                                    </p>
                                ) : (
                                    notes.map((n) => (
                                        <div key={n.id} className="flex gap-3 group">
                                            <Avatar name={n.author.name} email={n.author.email} size="sm" />
                                            <div className="flex-1 min-w-0 bg-secondary/40 rounded-xl p-3">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-xs font-medium">
                                                        {n.author.name || n.author.email.split('@')[0]}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ptBR })}
                                                        </span>
                                                        <button
                                                            onClick={() => handleDeleteNote(n.id)}
                                                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-600 transition-all"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-sm whitespace-pre-wrap">{n.content}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Ban dialog */}
            <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{funnel.isBanned ? 'Desbanir funil' : 'Banir funil'}</DialogTitle>
                        <DialogDescription>
                            {funnel.isBanned
                                ? 'O funil voltará a ficar acessível.'
                                : 'O funil ficará inacessível aos visitantes.'}
                        </DialogDescription>
                    </DialogHeader>
                    {!funnel.isBanned && (
                        <div className="space-y-2">
                            <Label>Motivo</Label>
                            <Textarea
                                value={banReason}
                                onChange={(e) => setBanReason(e.target.value)}
                                rows={3}
                            />
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBanDialogOpen(false)}>Cancelar</Button>
                        <Button
                            variant={funnel.isBanned ? 'default' : 'destructive'}
                            onClick={handleBan}
                            loading={isBanning}
                        >
                            {funnel.isBanned ? 'Desbanir' : 'Banir'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Deletar funil permanentemente?</DialogTitle>
                        <DialogDescription>
                            Esta ação não pode ser desfeita. Todos os dados (sessões, leads, eventos) serão perdidos.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleDelete} loading={isDeleting}>
                            Deletar permanentemente
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
