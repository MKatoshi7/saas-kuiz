'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Search, ExternalLink, Loader2, ChevronLeft, ChevronRight,
    Ban, CheckCircle, Eye, MoreHorizontal, Trash2, X
} from 'lucide-react';
import {
    Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/Avatar';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Funnel {
    id: string;
    title: string;
    slug: string;
    status: string;
    createdAt: string;
    publishedAt: string | null;
    user: { id: string; name: string; email: string };
    _count: { steps: number; sessions: number };
    sessionsThisMonth: number;
    isBanned: boolean;
    banReason?: string;
}

type StatusFilter = 'all' | 'published' | 'draft' | 'banned';

export default function FunnelsPage() {
    const [funnels, setFunnels] = useState<Funnel[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Bulk
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [bulkBanOpen, setBulkBanOpen] = useState(false);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [bulkReason, setBulkReason] = useState('');
    const [bulkWorking, setBulkWorking] = useState(false);

    // Single ban
    const [banDialogOpen, setBanDialogOpen] = useState(false);
    const [selectedFunnel, setSelectedFunnel] = useState<Funnel | null>(null);
    const [banReason, setBanReason] = useState('');
    const [isSubmittingBan, setIsSubmittingBan] = useState(false);

    const fetchFunnels = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                search,
                page: String(page),
                status: statusFilter,
            });
            const res = await fetch(`/api/admin/funnels?${params}`);
            const data = await res.json();
            setFunnels(data.funnels || []);
            setTotalPages(data.pages || 1);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar funis');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const t = setTimeout(() => {
            fetchFunnels();
            setSelectedIds(new Set());
        }, 300);
        return () => clearTimeout(t);
    }, [search, page, statusFilter]);

    const allOnPageSelected = useMemo(
        () => funnels.length > 0 && funnels.every((f) => selectedIds.has(f.id)),
        [funnels, selectedIds]
    );

    const toggleAll = () => {
        if (allOnPageSelected) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(funnels.map((f) => f.id)))
        }
    }

    const toggleOne = (id: string) => {
        const next = new Set(selectedIds)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        setSelectedIds(next)
    }

    const handleOpenBanDialog = (funnel: Funnel) => {
        setSelectedFunnel(funnel);
        setBanReason(funnel.banReason || '');
        setBanDialogOpen(true);
    };

    const handleToggleBan = async () => {
        if (!selectedFunnel) return;
        const newBanState = !selectedFunnel.isBanned;
        if (newBanState && !banReason.trim()) {
            toast.error('Informe o motivo');
            return;
        }

        setIsSubmittingBan(true);
        try {
            const res = await fetch(`/api/admin/funnels/${selectedFunnel.id}/ban`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isBanned: newBanState, reason: banReason })
            });
            if (!res.ok) throw new Error()
            toast.success(newBanState ? 'Funil banido' : 'Funil desbanido');
            setBanDialogOpen(false);
            fetchFunnels();
        } catch {
            toast.error('Erro ao atualizar funil');
        } finally {
            setIsSubmittingBan(false);
        }
    };

    const handleBulkBan = async () => {
        if (!bulkReason.trim()) {
            toast.error('Informe o motivo');
            return
        }
        setBulkWorking(true)
        try {
            const res = await fetch('/api/admin/funnels/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    funnelIds: Array.from(selectedIds),
                    action: 'ban',
                    reason: bulkReason,
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            toast.success(`${data.affected} funis banidos`)
            setBulkBanOpen(false)
            setBulkReason('')
            setSelectedIds(new Set())
            fetchFunnels()
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Erro')
        } finally {
            setBulkWorking(false)
        }
    }

    const handleBulkDelete = async () => {
        setBulkWorking(true)
        try {
            const res = await fetch('/api/admin/funnels/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    funnelIds: Array.from(selectedIds),
                    action: 'delete',
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            toast.success(`${data.affected} funis deletados`)
            setBulkDeleteOpen(false)
            setSelectedIds(new Set())
            fetchFunnels()
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Erro')
        } finally {
            setBulkWorking(false)
        }
    }

    const statusBadge = (f: Funnel) => {
        if (f.isBanned) return <Badge variant="destructive" dot>Banido</Badge>;
        if (f.status === 'published') return <Badge variant="success" dot>Publicado</Badge>;
        return <Badge variant="warning" dot>Rascunho</Badge>;
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Gerenciar Funis</h1>
                <p className="text-muted-foreground mt-1">
                    Visualize, edite e modere todos os funis da plataforma.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                        placeholder="Buscar por título, slug, email do dono..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="inline-flex h-10 items-center gap-1 rounded-full border border-border/60 bg-secondary/40 p-1 overflow-x-auto">
                    {[
                        { v: 'all', l: 'Todos' },
                        { v: 'published', l: 'Publicados' },
                        { v: 'draft', l: 'Rascunhos' },
                        { v: 'banned', l: 'Banidos' },
                    ].map((opt) => (
                        <button
                            key={opt.v}
                            onClick={() => { setStatusFilter(opt.v as StatusFilter); setPage(1); }}
                            className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                                statusFilter === opt.v
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {opt.l}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bulk action bar */}
            {selectedIds.size > 0 && (
                <div className="sticky top-2 z-10 bg-foreground text-background rounded-2xl px-4 py-3 flex items-center justify-between shadow-2xl animate-fade-in-up">
                    <div className="flex items-center gap-3">
                        <span className="font-semibold text-sm">
                            {selectedIds.size} selecionado{selectedIds.size > 1 ? 's' : ''}
                        </span>
                        <button
                            onClick={() => setSelectedIds(new Set())}
                            className="text-background/70 hover:text-background"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setBulkBanOpen(true)}
                            className="text-background hover:bg-background/10"
                            leftIcon={<Ban className="w-3.5 h-3.5" />}
                        >
                            Banir
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setBulkDeleteOpen(true)}
                            className="text-red-300 hover:bg-red-500/20"
                            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                        >
                            Deletar
                        </Button>
                    </div>
                </div>
            )}

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-10">
                                <input
                                    type="checkbox"
                                    checked={allOnPageSelected}
                                    onChange={toggleAll}
                                    className="rounded border-border"
                                />
                            </TableHead>
                            <TableHead>Funil</TableHead>
                            <TableHead>Dono</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Visitas (Mês / Total)</TableHead>
                            <TableHead>Criado</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : funnels.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                    Nenhum funil encontrado
                                </TableCell>
                            </TableRow>
                        ) : (
                            funnels.map((funnel) => (
                                <TableRow key={funnel.id} data-state={selectedIds.has(funnel.id) ? 'selected' : undefined}>
                                    <TableCell>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(funnel.id)}
                                            onChange={() => toggleOne(funnel.id)}
                                            className="rounded border-border"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/admin/funnels/${funnel.id}`} className="block">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-foreground hover:text-blue-600 transition-colors">
                                                    {funnel.title}
                                                </span>
                                                <span className="text-[11px] text-muted-foreground font-mono">
                                                    /{funnel.slug}
                                                </span>
                                            </div>
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2.5">
                                            <Avatar name={funnel.user.name} email={funnel.user.email} size="sm" />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate">{funnel.user.name || 'Sem nome'}</p>
                                                <p className="text-[11px] text-muted-foreground truncate">{funnel.user.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{statusBadge(funnel)}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2 text-sm">
                                            <span className="font-semibold text-foreground">{funnel.sessionsThisMonth}</span>
                                            <span className="text-muted-foreground">/</span>
                                            <span className="text-muted-foreground">{funnel._count.sessions}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                            {formatDistanceToNow(new Date(funnel.createdAt), { addSuffix: true, locale: ptBR })}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon-sm">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/funnels/${funnel.id}`}>
                                                        <Eye className="w-3.5 h-3.5" /> Ver detalhes
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/dashboard/${funnel.id}/builder`} target="_blank">
                                                        <ExternalLink className="w-3.5 h-3.5" /> Abrir builder
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleOpenBanDialog(funnel)}>
                                                    {funnel.isBanned ? (
                                                        <><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Desbanir</>
                                                    ) : (
                                                        <><Ban className="w-3.5 h-3.5 text-red-600" /> Banir</>
                                                    )}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
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
            </Card>

            {/* Single ban dialog */}
            <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedFunnel?.isBanned ? 'Desbanir funil' : 'Banir funil'}</DialogTitle>
                        <DialogDescription>
                            {selectedFunnel?.isBanned
                                ? 'O funil voltará a ficar acessível.'
                                : 'O funil ficará inacessível aos visitantes.'}
                        </DialogDescription>
                    </DialogHeader>
                    {!selectedFunnel?.isBanned && (
                        <div className="space-y-2 py-2">
                            <Label>Motivo do banimento</Label>
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
                            variant={selectedFunnel?.isBanned ? 'default' : 'destructive'}
                            onClick={handleToggleBan}
                            loading={isSubmittingBan}
                        >
                            {selectedFunnel?.isBanned ? 'Desbanir' : 'Banir funil'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk ban dialog */}
            <Dialog open={bulkBanOpen} onOpenChange={setBulkBanOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Banir {selectedIds.size} funis</DialogTitle>
                        <DialogDescription>
                            Todos os funis selecionados ficarão inacessíveis aos visitantes.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                        <Label>Motivo do banimento</Label>
                        <Textarea
                            value={bulkReason}
                            onChange={(e) => setBulkReason(e.target.value)}
                            rows={3}
                            placeholder="Ex: Spam, violação dos termos..."
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBulkBanOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleBulkBan} loading={bulkWorking}>
                            Banir {selectedIds.size} funis
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk delete dialog */}
            <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Deletar {selectedIds.size} funis permanentemente?</DialogTitle>
                        <DialogDescription>
                            Esta ação não pode ser desfeita. Todos os dados (sessões, leads, eventos) serão perdidos.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBulkDeleteOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleBulkDelete} loading={bulkWorking}>
                            Deletar permanentemente
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
