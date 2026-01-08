'use client';

import React, { useState, useEffect } from 'react';
import { Search, Edit, Loader2, Check, X, ChevronLeft, ChevronRight, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

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
        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar usuários');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(fetchUsers, 300);
        return () => clearTimeout(timeout);
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
                    role
                })
            });

            if (res.ok) {
                toast.success('Usuário atualizado com sucesso');
                setEditingUser(null);
                fetchUsers();
            } else {
                toast.error('Erro ao atualizar usuário');
            }
        } catch (error) {
            console.error(error);
            toast.error('Erro ao atualizar usuário');
        }
    };

    const handleImpersonate = async (userId: string) => {
        if (!confirm("Tem certeza que deseja acessar a conta deste usuário? Você será deslogado da sua conta de admin.")) return;

        try {
            const res = await fetch('/api/admin/impersonate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            if (res.ok) {
                toast.success('Acesso concedido! Redirecionando...');
                window.location.href = '/dashboard';
            } else {
                toast.error('Erro ao acessar conta');
            }
        } catch (error) {
            toast.error('Erro ao acessar conta');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Gerenciar Usuários</h2>
                    <p className="text-gray-500 mt-1">Visualize e edite informações dos usuários.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Buscar por nome ou email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-11 h-12 rounded-full border-black/5 bg-white shadow-sm focus:ring-2 focus:ring-black/5 transition-all"
                    />
                </div>
            </div>

            <div className="bg-white border border-black/5 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/50 border-b border-black/5 text-gray-500 font-medium">
                            <tr>
                                <th className="px-8 py-4">Usuário</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Plano</th>
                                <th className="px-6 py-4">Funis</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={6} className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-black" /></td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={6} className="p-12 text-center text-gray-500">Nenhum usuário encontrado.</td></tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs border border-white shadow-sm">
                                                    {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">{user.name || 'Sem nome'}</div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${user.subscriptionStatus === 'active' ? 'bg-green-50 text-green-700 border-green-100' :
                                                user.subscriptionStatus === 'expired' ? 'bg-red-50 text-red-700 border-red-100' :
                                                    'bg-gray-50 text-gray-700 border-gray-100'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${user.subscriptionStatus === 'active' ? 'bg-green-500' :
                                                    user.subscriptionStatus === 'expired' ? 'bg-red-500' :
                                                        'bg-gray-400'
                                                    }`} />
                                                {user.subscriptionStatus || 'free'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-600 font-medium capitalize">{user.subscriptionPlan || 'Free'}</div>
                                            {user.subscriptionEndsAt && (
                                                <div className="text-[10px] text-gray-400 mt-0.5">
                                                    Vence em {new Date(user.subscriptionEndsAt).toLocaleDateString()}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-gray-600">
                                                <span className="font-semibold">{user._count.funnels}</span>
                                                <span className="text-gray-400 text-xs">criados</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded uppercase tracking-wide">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full hover:bg-black hover:text-white transition-colors"
                                                    onClick={() => handleImpersonate(user.id)}
                                                    title="Acessar conta (Impersonate)"
                                                >
                                                    <LogIn className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-black hover:text-white transition-colors" onClick={() => setEditingUser(user)}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Pagination */}
                <div className="px-8 py-4 border-t border-black/5 bg-gray-50/30 flex items-center justify-between">
                    <span className="text-sm text-gray-500">Página {page} de {totalPages}</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="rounded-full h-8 px-4 text-xs">
                            <ChevronLeft className="w-3 h-3 mr-1" /> Anterior
                        </Button>
                        <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="rounded-full h-8 px-4 text-xs">
                            Próxima <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                <DialogContent className="sm:max-w-[425px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Editar Usuário</DialogTitle>
                    </DialogHeader>
                    {editingUser && (
                        <form onSubmit={handleSaveUser} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nome</Label>
                                <Input value={editingUser.name || ''} disabled className="bg-gray-50" />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input value={editingUser.email} disabled className="bg-gray-50" />
                            </div>
                            <div className="space-y-2">
                                <Label>Dia que assinou</Label>
                                <Input
                                    value={new Date(editingUser.createdAt).toLocaleDateString()}
                                    disabled
                                    className="bg-gray-50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Nova Senha</Label>
                                <Input name="password" type="password" placeholder="Deixe em branco para manter" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <select name="subscriptionStatus" defaultValue={editingUser.subscriptionStatus || 'free'} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                        <option value="free">Free</option>
                                        <option value="active">Active</option>
                                        <option value="canceled">Canceled</option>
                                        <option value="expired">Expired</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Plano</Label>
                                    <select name="subscriptionPlan" defaultValue={editingUser.subscriptionPlan || 'starter'} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                        <option value="starter">Starter</option>
                                        <option value="pro">Pro</option>
                                        <option value="enterprise">Enterprise</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Função</Label>
                                    <select name="role" defaultValue={editingUser.role || 'user'} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
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
                            <DialogFooter className="pt-4">
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
