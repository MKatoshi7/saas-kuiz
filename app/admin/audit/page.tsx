'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, ChevronLeft, ChevronRight, Activity, User as UserIcon, Filter as FilterIcon, Mail, Shield } from 'lucide-react';
import {
    Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AdminAction {
    id: string;
    action: string;
    createdAt: string;
    ipAddress: string | null;
    details: any;
    admin: { id: string; name: string | null; email: string };
    targetUser: { id: string; name: string | null; email: string } | null;
}

const ACTION_LABELS: Record<string, { label: string; color: any; icon: any }> = {
    ban_funnel: { label: 'Baniu funil', color: 'destructive', icon: Shield },
    unban_funnel: { label: 'Desbaniu funil', color: 'success', icon: Shield },
    edit_user: { label: 'Editou usuário', color: 'info', icon: UserIcon },
    impersonate_user: { label: 'Acessou conta', color: 'warning', icon: UserIcon },
    change_role: { label: 'Alterou permissão', color: 'warning', icon: Shield },
    change_subscription: { label: 'Alterou assinatura', color: 'primary', icon: Activity },
    reset_password: { label: 'Resetou senha', color: 'warning', icon: Mail },
    delete_funnel: { label: 'Deletou funil', color: 'destructive', icon: Shield },
    delete_user: { label: 'Deletou usuário', color: 'destructive', icon: UserIcon },
    create_user: { label: 'Criou usuário', color: 'success', icon: UserIcon },
    system_message: { label: 'Mensagem do sistema', color: 'info', icon: Activity },
};

export default function AuditPage() {
    const [actions, setActions] = useState<AdminAction[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState<string>('all');

    const fetchActions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page),
                action: actionFilter === 'all' ? '' : actionFilter,
            });
            const res = await fetch(`/api/admin/audit?${params}`);
            const data = await res.json();
            setActions(data.actions || []);
            setTotalPages(data.pages || 1);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActions();
    }, [page, actionFilter]);

    const filtered = actions.filter((a) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            a.admin?.email?.toLowerCase().includes(q) ||
            a.admin?.name?.toLowerCase().includes(q) ||
            a.targetUser?.email?.toLowerCase().includes(q) ||
            a.action.toLowerCase().includes(q)
        );
    });

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
                <p className="text-muted-foreground mt-1">
                    Histórico completo de ações administrativas da plataforma.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <FilterIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                        placeholder="Filtrar por admin, usuário, ação..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="inline-flex h-10 items-center gap-1 rounded-full border border-border/60 bg-secondary/40 p-1 overflow-x-auto">
                    {[
                        { v: 'all', l: 'Todas' },
                        { v: 'ban_funnel', l: 'Banimentos' },
                        { v: 'impersonate_user', l: 'Impersonate' },
                        { v: 'edit_user', l: 'Edições' },
                    ].map((opt) => (
                        <button
                            key={opt.v}
                            onClick={() => { setActionFilter(opt.v); setPage(1); }}
                            className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                                actionFilter === opt.v
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
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
                            <TableHead>Admin</TableHead>
                            <TableHead>Ação</TableHead>
                            <TableHead>Alvo</TableHead>
                            <TableHead>IP</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                    Nenhuma ação registrada
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((a) => {
                                const meta = ACTION_LABELS[a.action] || { label: a.action, color: 'secondary', icon: Activity };
                                const Icon = meta.icon;
                                return (
                                    <TableRow key={a.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm">
                                                    {format(new Date(a.createdAt), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2.5">
                                                <Avatar name={a.admin?.name} email={a.admin?.email} size="sm" />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium truncate">{a.admin?.name || 'Admin'}</p>
                                                    <p className="text-[11px] text-muted-foreground truncate">{a.admin?.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={meta.color} size="sm">
                                                <Icon className="w-3 h-3" />
                                                {meta.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {a.targetUser ? (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="text-muted-foreground">→</span>
                                                    <div>
                                                        <p className="font-medium">{a.targetUser.name || a.targetUser.email.split('@')[0]}</p>
                                                        <p className="text-[11px] text-muted-foreground">{a.targetUser.email}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <code className="text-[11px] text-muted-foreground font-mono">
                                                {a.ipAddress || '—'}
                                            </code>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
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
        </div>
    );
}
