'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, DollarSign, ChevronLeft, ChevronRight, TrendingUp, Webhook, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/StatCard';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';

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
    const [stats, setStats] = useState({
        totalRevenue: 0,
        thisMonth: 0,
        activeSubs: 0,
        webhookCount: 0,
    });

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/finance?page=${page}`);
            const data = await res.json();
            setTransactions(data.transactions || []);
            setTotalPages(data.pages || 1);
            setStats((s) => ({ ...s, totalRevenue: data.totalRevenue || 0, thisMonth: data.thisMonth || 0 }));
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
        <div className="space-y-6 animate-fade-in-up">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
                <p className="text-muted-foreground mt-1">
                    Receitas, transações e assinaturas ativas.
                </p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Receita total"
                    value={`R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    icon={DollarSign}
                    variant="dark"
                />
                <StatCard
                    label="Este mês"
                    value={`R$ ${stats.thisMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    icon={TrendingUp}
                    variant="primary"
                />
                <StatCard
                    label="Assinaturas ativas"
                    value={stats.activeSubs}
                    icon={ArrowUpRight}
                />
                <Link href="/admin/webhooks" className="block">
                    <StatCard
                        label="Webhooks"
                        value={stats.webhookCount}
                        icon={Webhook}
                    />
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Transações</CardTitle>
                    <CardDescription>
                        Pagamentos confirmados (webhook processado com sucesso) ou pendentes.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-secondary/30 border-y border-border/60 text-muted-foreground text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3">Data</th>
                                    <th className="px-6 py-3">Usuário</th>
                                    <th className="px-6 py-3">Valor</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Provedor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                        </td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-muted-foreground">
                                            <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                            Nenhuma transação registrada.
                                            <p className="text-xs mt-1">
                                                Configure webhooks em <Link href="/admin/webhooks" className="text-blue-500 underline">/admin/webhooks</Link> para começar.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-secondary/40 transition-colors">
                                            <td className="px-6 py-3.5 whitespace-nowrap">
                                                <div className="font-medium text-foreground">
                                                    {format(new Date(tx.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                                                </div>
                                                <div className="text-[10px] text-muted-foreground">
                                                    {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true, locale: ptBR })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <div className="font-medium text-foreground">{tx.user.name || '—'}</div>
                                                <div className="text-[10px] text-muted-foreground font-mono">{tx.user.email}</div>
                                            </td>
                                            <td className="px-6 py-3.5 font-semibold tabular-nums">
                                                R$ {tx.amount.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <Badge
                                                    variant={tx.status === 'paid' ? 'success' : tx.status === 'pending' ? 'warning' : 'destructive'}
                                                    size="sm"
                                                    dot
                                                >
                                                    {tx.status === 'paid' ? 'Pago' : tx.status === 'pending' ? 'Pendente' : 'Falhou'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <Badge variant="outline" size="sm" className="uppercase font-mono">
                                                    {tx.provider}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (
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
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
