'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Transaction {
    id: string;
    amount: number;
    status: string;
    provider: string;
    createdAt: string;
    user: { name: string; email: string };
}

export default function FinancePage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/finance?page=${page}`);
            const data = await res.json();
            setTransactions(data.transactions);
            setTotalPages(data.pages);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [page]);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Histórico Financeiro</h2>
                <p className="text-gray-500 mt-1">Acompanhe todas as transações e assinaturas.</p>
            </div>

            <div className="bg-white border border-black/5 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/50 border-b border-black/5 text-gray-500 font-medium">
                            <tr>
                                <th className="px-8 py-4">Data</th>
                                <th className="px-6 py-4">Usuário</th>
                                <th className="px-6 py-4">Valor</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Provedor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={5} className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-black" /></td></tr>
                            ) : transactions.length === 0 ? (
                                <tr><td colSpan={5} className="p-12 text-center text-gray-500">Nenhuma transação encontrada.</td></tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="px-8 py-4 text-gray-500 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{new Date(tx.createdAt).toLocaleDateString()}</div>
                                            <div className="text-xs">{new Date(tx.createdAt).toLocaleTimeString()}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                                    {tx.user.name ? tx.user.name.charAt(0).toUpperCase() : '?'}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{tx.user.name || 'Sem nome'}</div>
                                                    <div className="text-xs text-gray-500">{tx.user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            R$ {tx.amount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${tx.status === 'paid' ? 'bg-green-50 text-green-700 border-green-100' :
                                                    tx.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                                        'bg-red-50 text-red-700 border-red-100'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${tx.status === 'paid' ? 'bg-green-500' :
                                                        tx.status === 'pending' ? 'bg-yellow-500' :
                                                            'bg-red-500'
                                                    }`} />
                                                {tx.status === 'paid' ? 'Pago' : tx.status === 'pending' ? 'Pendente' : 'Falhou'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded uppercase tracking-wide">
                                                {tx.provider}
                                            </span>
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
