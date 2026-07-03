'use client'

import React, { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    ArrowLeft, LogIn, Download, Loader2, MessageSquarePlus, Trash2,
    Mail, Calendar, CreditCard, Filter, Shield
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { StatCard } from '@/components/ui/StatCard'
import { toast } from 'sonner'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface UserDetail {
    id: string
    name: string | null
    email: string
    role: string
    subscriptionStatus: string | null
    subscriptionPlan: string | null
    subscriptionEndsAt: string | null
    createdAt: string
    _count: { funnels: number; transactions: number }
}

interface FunnelRow {
    id: string
    title: string
    slug: string
    status: string
    isBanned: boolean
    createdAt: string
    _count: { sessions: number }
}

interface Note {
    id: string
    content: string
    createdAt: string
    author: { id: string; name: string | null; email: string }
}

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [user, setUser] = useState<UserDetail | null>(null)
    const [funnels, setFunnels] = useState<FunnelRow[]>([])
    const [notes, setNotes] = useState<Note[]>([])
    const [noteText, setNoteText] = useState('')
    const [loading, setLoading] = useState(true)
    const [postingNote, setPostingNote] = useState(false)

    const fetchData = async () => {
        try {
            const [uRes, nRes] = await Promise.all([
                fetch(`/api/admin/users/${id}`),
                fetch(`/api/admin/users/${id}/notes`),
            ])
            if (!uRes.ok) throw new Error()
            const u = await uRes.json()
            setUser(u.user)
            setFunnels(u.funnels || [])
            if (nRes.ok) {
                const n = await nRes.json()
                setNotes(n.notes || [])
            }
        } catch {
            toast.error('Erro ao carregar usuário')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [id])

    const handleImpersonate = async () => {
        if (!confirm('Acessar a conta deste usuário? Você será deslogado da sua conta admin.')) return
        try {
            const res = await fetch('/api/admin/impersonate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: id }),
            })
            if (!res.ok) throw new Error()
            window.location.href = '/dashboard'
        } catch {
            toast.error('Erro ao impersonar')
        }
    }

    const handleExport = () => {
        window.location.href = `/api/admin/users/${id}/export`
    }

    const handleAddNote = async () => {
        if (!noteText.trim()) return
        setPostingNote(true)
        try {
            const res = await fetch(`/api/admin/users/${id}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: noteText }),
            })
            if (!res.ok) throw new Error()
            setNoteText('')
            const n = await fetch(`/api/admin/users/${id}/notes`).then((r) => r.json())
            setNotes(n.notes || [])
            toast.success('Anotação adicionada')
        } catch {
            toast.error('Erro ao salvar')
        } finally {
            setPostingNote(false)
        }
    }

    const handleDeleteNote = async (noteId: string) => {
        try {
            await fetch(`/api/admin/users/notes/${noteId}`, { method: 'DELETE' })
            setNotes((prev) => prev.filter((n) => n.id !== noteId))
        } catch {
            toast.error('Erro ao deletar')
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-32 rounded-2xl" />
                <Skeleton className="h-96 rounded-2xl" />
            </div>
        )
    }

    if (!user) return <div>Usuário não encontrado</div>

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex items-center gap-3">
                <Link href="/admin/users">
                    <Button variant="ghost" size="icon-sm">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold tracking-tight truncate">
                        {user.name || user.email.split('@')[0]}
                    </h1>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleExport} leftIcon={<Download className="w-3.5 h-3.5" />}>
                        Exportar LGPD
                    </Button>
                    <Button size="sm" onClick={handleImpersonate} leftIcon={<LogIn className="w-3.5 h-3.5" />}>
                        Acessar conta
                    </Button>
                </div>
            </div>

            {/* Header card */}
            <Card>
                <CardContent className="p-5 flex items-center gap-4">
                    <Avatar name={user.name} email={user.email} size="xl" />
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Plano</p>
                            <Badge variant={user.subscriptionStatus === 'active' ? 'success' : 'secondary'}>
                                {user.subscriptionPlan || 'Free'}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Role</p>
                            <Badge variant={user.role === 'admin' ? 'primary' : 'outline'}>
                                <Shield className="w-3 h-3" />
                                {user.role}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Cadastro</p>
                            <p className="text-sm">{format(new Date(user.createdAt), "dd 'de' MMM, yyyy", { locale: ptBR })}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Vencimento</p>
                            <p className="text-sm">
                                {user.subscriptionEndsAt
                                    ? format(new Date(user.subscriptionEndsAt), "dd/MM/yyyy")
                                    : '—'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Funis" value={user._count.funnels} icon={Filter} />
                <StatCard label="Transações" value={user._count.transactions} icon={CreditCard} />
                <StatCard label="Sessões" value={funnels.reduce((acc, f) => acc + f._count.sessions, 0)} icon={Mail} />
                <StatCard label="Anotações" value={notes.length} icon={MessageSquarePlus} />
            </div>

            <Tabs defaultValue="funnels">
                <TabsList>
                    <TabsTrigger value="funnels">Funis ({funnels.length})</TabsTrigger>
                    <TabsTrigger value="notes">Anotações ({notes.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="funnels">
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead>Funil</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Sessões</TableHead>
                                    <TableHead>Criado</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {funnels.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            Nenhum funil criado
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    funnels.map((f) => (
                                        <TableRow key={f.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{f.title}</p>
                                                    <p className="text-[11px] text-muted-foreground font-mono">/{f.slug}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {f.isBanned ? (
                                                    <Badge variant="destructive" size="sm" dot>Banido</Badge>
                                                ) : f.status === 'published' ? (
                                                    <Badge variant="success" size="sm" dot>Publicado</Badge>
                                                ) : (
                                                    <Badge variant="secondary" size="sm" dot>Rascunho</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>{f._count.sessions}</TableCell>
                                            <TableCell>
                                                <span className="text-sm text-muted-foreground">
                                                    {formatDistanceToNow(new Date(f.createdAt), { addSuffix: true, locale: ptBR })}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/admin/funnels/${f.id}`}>
                                                    <Button variant="ghost" size="sm">Ver detalhes</Button>
                                                </Link>
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
                                    placeholder="Notas visíveis para outros admins..."
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
                                    >
                                        Adicionar
                                    </Button>
                                </div>
                            </div>

                            <div className="border-t border-border/60 pt-4 space-y-3">
                                {notes.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-6">
                                        Nenhuma anotação
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
                                                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-600"
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
        </div>
    )
}
