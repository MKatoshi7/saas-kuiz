'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, AlertTriangle, Info, CheckCircle, XCircle, ChevronLeft, ChevronRight, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LogsPage() {
    const [activeTab, setActiveTab] = useState('system');
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/logs?type=${activeTab}&page=${page}`);
            const data = await res.json();
            setLogs(data.logs);
            setTotalPages(data.pages);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
        fetchLogs();
    }, [activeTab]);

    useEffect(() => {
        fetchLogs();
    }, [page]);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Logs do Sistema</h2>
                <p className="text-gray-500 mt-1">Monitore erros e eventos de webhook em tempo real.</p>
            </div>

            <Tabs defaultValue="system" onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-white border border-black/5 p-1 rounded-full mb-6 inline-flex h-auto">
                    <TabsTrigger value="system" className="rounded-full px-6 py-2 data-[state=active]:bg-black data-[state=active]:text-white transition-all">
                        Erros do Sistema
                    </TabsTrigger>
                    <TabsTrigger value="webhook" className="rounded-full px-6 py-2 data-[state=active]:bg-black data-[state=active]:text-white transition-all">
                        Webhooks
                    </TabsTrigger>
                </TabsList>

                <div className="bg-white border border-black/5 rounded-3xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50/50 border-b border-black/5 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-8 py-4">Data</th>
                                    <th className="px-6 py-4">Nível/Status</th>
                                    <th className="px-6 py-4">Mensagem/Evento</th>
                                    <th className="px-6 py-4">Detalhes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={4} className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-black" /></td></tr>
                                ) : logs.length === 0 ? (
                                    <tr><td colSpan={4} className="p-12 text-center text-gray-500">Nenhum log encontrado.</td></tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="px-8 py-4 text-gray-500 whitespace-nowrap font-mono text-xs">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                {activeTab === 'system' ? (
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${log.level === 'error' ? 'bg-red-50 text-red-700 border-red-100' :
                                                            log.level === 'warn' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                                                'bg-blue-50 text-blue-700 border-blue-100'
                                                        }`}>
                                                        {log.level === 'error' ? <XCircle className="w-3 h-3" /> :
                                                            log.level === 'warn' ? <AlertTriangle className="w-3 h-3" /> :
                                                                <Info className="w-3 h-3" />}
                                                        {log.level.toUpperCase()}
                                                    </span>
                                                ) : (
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${log.status === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                                                        }`}>
                                                        {log.status === 'success' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                        {log.status}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-gray-700">
                                                {activeTab === 'system' ? log.message : log.eventType}
                                            </td>
                                            <td className="px-6 py-4">
                                                <details className="group/details">
                                                    <summary className="cursor-pointer text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 list-none">
                                                        <Terminal className="w-3 h-3" />
                                                        Ver Payload
                                                    </summary>
                                                    <div className="mt-2 p-3 bg-gray-900 rounded-lg text-gray-300 overflow-x-auto max-w-xs md:max-w-md shadow-inner">
                                                        <pre className="text-[10px] font-mono leading-relaxed">
                                                            {JSON.stringify(activeTab === 'system' ? log.context : log.payload, null, 2)}
                                                        </pre>
                                                    </div>
                                                </details>
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
            </Tabs>
        </div>
    );
}
