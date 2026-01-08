'use client';

import React, { useState, useEffect } from 'react';
import { Search, ExternalLink, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

interface Funnel {
    id: string;
    title: string;
    status: string;
    createdAt: string;
    user: { name: string; email: string };
    _count: { steps: number; sessions: number };
}

export default function FunnelsPage() {
    const [funnels, setFunnels] = useState<Funnel[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchFunnels = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/funnels?search=${search}&page=${page}`);
            const data = await res.json();
            setFunnels(data.funnels);
            setTotalPages(data.pages);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(fetchFunnels, 300);
        return () => clearTimeout(timeout);
    }, [search, page]);

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
                                <th className="px-6 py-4">Métricas</th>
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
                                    <tr key={funnel.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="px-8 py-4 font-medium text-gray-900">{funnel.title}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                                    {funnel.user.name ? funnel.user.name.charAt(0).toUpperCase() : '?'}
                                                </div>
                                                <div className="text-xs text-gray-500">{funnel.user.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${funnel.status === 'published' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${funnel.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'
                                                    }`} />
                                                {funnel.status === 'published' ? 'Publicado' : 'Rascunho'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-4 text-xs text-gray-500">
                                                <span title="Etapas">{funnel._count.steps} etapas</span>
                                                <span title="Sessões">{funnel._count.sessions} sessões</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-xs">
                                            {new Date(funnel.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/dashboard/${funnel.id}/builder`} target="_blank">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-black hover:text-white transition-colors">
                                                    <ExternalLink className="w-4 h-4" />
                                                </Button>
                                            </Link>
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
        </div>
    );
}
