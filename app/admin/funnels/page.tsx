'use client';

import React, { useState, useEffect } from 'react';
import { Search, ExternalLink, Loader2, ChevronLeft, ChevronRight, Ban, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import Link from 'next/link';

interface Funnel {
    id: string;
    title: string;
    status: string;
    createdAt: string;
    user: { name: string; email: string };
    _count: { steps: number; sessions: number };
    sessionsThisMonth: number;
    isBanned: boolean;
    banReason?: string;
}

export default function FunnelsPage() {
    const [funnels, setFunnels] = useState<Funnel[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Ban Dialog State
    const [banDialogOpen, setBanDialogOpen] = useState(false);
    const [selectedFunnel, setSelectedFunnel] = useState<Funnel | null>(null);
    const [banReason, setBanReason] = useState('');
    const [isSubmittingBan, setIsSubmittingBan] = useState(false);

    const fetchFunnels = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/funnels?search=${search}&page=${page}`);
            const data = await res.json();
            setFunnels(data.funnels);
            setTotalPages(data.pages);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar funis');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(fetchFunnels, 300);
        return () => clearTimeout(timeout);
    }, [search, page]);

    const handleOpenBanDialog = (funnel: Funnel) => {
        setSelectedFunnel(funnel);
        setBanReason(funnel.banReason || '');
        setBanDialogOpen(true);
    };

    const handleToggleBan = async () => {
        if (!selectedFunnel) return;

        const newBanState = !selectedFunnel.isBanned;
        if (newBanState && !banReason.trim()) {
            toast.error('Por favor, informe o motivo do banimento.');
            return;
        }

        setIsSubmittingBan(true);
        try {
            const res = await fetch(`/api/admin/funnels/${selectedFunnel.id}/ban`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    isBanned: newBanState,
                    reason: banReason
                })
            });

            if (!res.ok) throw new Error('Failed to update funnel');

            toast.success(newBanState ? 'Funil banido com sucesso' : 'Funil desbanido com sucesso');
            setBanDialogOpen(false);
            fetchFunnels(); // Refresh list
        } catch (error) {
            console.error(error);
            toast.error('Erro ao atualizar status do funil');
        } finally {
            setIsSubmittingBan(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Gerenciar Funis</h2>
                    <p className="text-gray-500 mt-1">Visualize todos os funis criados na plataforma.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Buscar por título ou dono..."
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
                                <th className="px-8 py-4">Funil</th>
                                <th className="px-6 py-4">Dono</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Visitas (Mês / Total)</th>
                                <th className="px-6 py-4">Criado em</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={6} className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-black" /></td></tr>
                            ) : funnels.length === 0 ? (
                                <tr><td colSpan={6} className="p-12 text-center text-gray-500">Nenhum funil encontrado.</td></tr>
                            ) : (
                                funnels.map((funnel) => (
                                    <tr key={funnel.id} className={`hover:bg-gray-50/80 transition-colors group ${funnel.isBanned ? 'bg-red-50/30' : ''}`}>
                                        <td className="px-8 py-4 font-medium text-gray-900">
                                            <div className="flex flex-col">
                                                <span>{funnel.title}</span>
                                                {funnel.isBanned && (
                                                    <span className="text-[10px] text-red-600 font-bold uppercase tracking-wider flex items-center gap-1 mt-1">
                                                        <AlertTriangle className="w-3 h-3" /> Banido
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                                    {funnel.user.name ? funnel.user.name.charAt(0).toUpperCase() : '?'}
                                                </div>
                                                <div className="text-xs text-gray-500">{funnel.user.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${funnel.isBanned ? 'bg-red-50 text-red-700 border-red-100' :
                                                    funnel.status === 'published' ? 'bg-green-50 text-green-700 border-green-100' :
                                                        'bg-yellow-50 text-yellow-700 border-yellow-100'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${funnel.isBanned ? 'bg-red-500' :
                                                        funnel.status === 'published' ? 'bg-green-500' :
                                                            'bg-yellow-500'
                                                    }`} />
                                                {funnel.isBanned ? 'Banido' : funnel.status === 'published' ? 'Publicado' : 'Rascunho'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-4 text-xs text-gray-500">
                                                <span className="font-semibold text-gray-900">{funnel.sessionsThisMonth}</span>
                                                <span className="text-gray-300">/</span>
                                                <span>{funnel._count.sessions}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-xs">
                                            {new Date(funnel.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenBanDialog(funnel)}
                                                    className={`h-8 w-8 rounded-full transition-colors ${funnel.isBanned ? 'text-green-600 hover:bg-green-50' : 'text-red-500 hover:bg-red-50'}`}
                                                    title={funnel.isBanned ? "Desbanir Funil" : "Banir Funil"}
                                                >
                                                    {funnel.isBanned ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                                </Button>
                                                <Link href={`/dashboard/${funnel.id}/builder`} target="_blank">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-black hover:text-white transition-colors">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </Button>
                                                </Link>
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

            {/* Ban Dialog */}
            <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedFunnel?.isBanned ? 'Desbanir Funil' : 'Banir Funil'}</DialogTitle>
                        <DialogDescription>
                            {selectedFunnel?.isBanned
                                ? 'Ao desbanir, o funil voltará a ficar acessível publicamente.'
                                : 'Ao banir, o funil ficará inacessível e exibirá uma mensagem de erro para os visitantes.'}
                        </DialogDescription>
                    </DialogHeader>

                    {!selectedFunnel?.isBanned && (
                        <div className="space-y-2 py-4">
                            <Label>Motivo do Banimento</Label>
                            <Textarea
                                placeholder="Ex: Violação dos termos de uso, conteúdo impróprio..."
                                value={banReason}
                                onChange={(e) => setBanReason(e.target.value)}
                            />
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBanDialogOpen(false)}>Cancelar</Button>
                        <Button
                            variant={selectedFunnel?.isBanned ? "default" : "destructive"}
                            onClick={handleToggleBan}
                            disabled={isSubmittingBan}
                        >
                            {isSubmittingBan ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {selectedFunnel?.isBanned ? 'Desbanir' : 'Banir Funil'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
