'use client';

import React, { useState, useEffect } from 'react';
import { Search, Edit, Loader2, ChevronLeft, ChevronRight, LogIn, ExternalLink, Download } from 'lucide-react';
import {
    Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/card';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Link from 'next/link';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    subscriptionStatus: string;
    subscriptionPlan: string;
    subscriptionEndsAt: string | null;
    createdAt: string;
    _count: { funnels: number };
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/users?search=${search}&page=${page}`);
            const data = await res.json();
            setUsers(data.users);
            setTotalPages(data.pages);
        } catch {
            toast.error('Erro ao carregar usuários');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const t = setTimeout(fetchUsers, 300);
        return () => clearTimeout(t);
    }, [search, page]);

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const password = formData.get('password') as string;
        const subscriptionStatus = formData.get('subscriptionStatus') as string;
        const subscriptionPlan = formData.get('subscriptionPlan') as string;
        const subscriptionEndsAt = formData.get('subscriptionEndsAt') as string;
        const role = formData.get('role') as string;

        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingUser.id,
                    password: password || undefined,
                    subscriptionStatus,
                    subscriptionPlan,
                    subscriptionEndsAt: subscriptionEndsAt || null,
                    role,
                })
            });
            if (res.ok) {
                toast.success('Usuário atualizado');
                setEditingUser(null);
                fetchUsers();
            } else {
                toast.error('Erro ao atualizar');
            }
        } catch {
            toast.error('Erro ao atualizar');
        }
    };

    const handleImpersonate = async (userId: string) => {
        if (!confirm("Acessar conta deste usuário? Você será deslogado.")) return;
        try {
            const res = await fetch('/api/admin/impersonate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            if (res.ok) {
                window.location.href = '/dashboard';
            } else throw new Error();
        } catch {
            toast.error('Erro ao impersonar');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Gerenciar Usuários</h1>
                <p className="text-muted-foreground mt-1">Visualize, edite e gerencie usuários da plataforma.</p>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nome ou email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead>Usuário</TableHead>
                            <TableHead>Plano</TableHead>
                            <TableHead>Funis</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                    Nenhum usuário
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <Link href={`/admin/users/${user.id}`} className="flex items-center gap-3 group">
                                            <Avatar name={user.name} email={user.email} size="sm" />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium group-hover:text-blue-600 transition-colors truncate">
                                                    {user.name || 'Sem nome'}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                                            </div>
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={user.subscriptionStatus === 'active' ? 'success' : 'secondary'} size="sm">
                                                {user.subscriptionPlan || 'Free'}
                                            </Badge>
                                            {user.subscriptionEndsAt && (
                                                <span className="text-[10px] text-muted-foreground">
                                                    {new Date(user.subscriptionEndsAt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm font-semibold">{user._count.funnels}</span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === 'admin' ? 'primary' : 'outline'} size="sm">
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => handleImpersonate(user.id)}
                                                title="Acessar conta"
                                            >
                                                <LogIn className="w-4 h-4" />
                                            </Button>
                                            <Link href={`/admin/users/${user.id}`}>
                                                <Button variant="ghost" size="icon-sm" title="Ver detalhes">
                                                    <ExternalLink className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => setEditingUser(user)}
                                                title="Editar"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                        </div>
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

            <Dialog open={!!editingUser} onOpenChange={(o) => !o && setEditingUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Usuário</DialogTitle>
                    </DialogHeader>
                    {editingUser && (
                        <form onSubmit={handleSaveUser} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nome</Label>
                                <Input value={editingUser.name || ''} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input value={editingUser.email} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label>Nova Senha</Label>
                                <Input name="password" type="password" placeholder="Deixe vazio para manter" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <select name="subscriptionStatus" defaultValue={editingUser.subscriptionStatus || 'free'} className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm">
                                        <option value="free">Free</option>
                                        <option value="active">Active</option>
                                        <option value="canceled">Canceled</option>
                                        <option value="expired">Expired</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Plano</Label>
                                    <select name="subscriptionPlan" defaultValue={editingUser.subscriptionPlan || 'starter'} className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm">
                                        <option value="starter">Starter</option>
                                        <option value="pro">Pro</option>
                                        <option value="enterprise">Enterprise</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Role</Label>
                                    <select name="role" defaultValue={editingUser.role || 'user'} className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm">
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Vencimento</Label>
                                    <Input
                                        name="subscriptionEndsAt"
                                        type="date"
                                        defaultValue={editingUser.subscriptionEndsAt ? new Date(editingUser.subscriptionEndsAt).toISOString().split('T')[0] : ''}
                                    />
                                </div>
                            </div>
                            <DialogFooter className="pt-2">
                                <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>Cancelar</Button>
                                <Button type="submit">Salvar</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
