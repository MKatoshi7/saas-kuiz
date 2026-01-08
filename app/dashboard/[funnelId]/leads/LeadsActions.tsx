'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Download, Eye, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface LeadData {
    id: string;
    sessionId: string;
    startedAt: Date;
    completedAt: Date | null;
    userAgent: string | null;
    ip: string | null;
    city: string | null;
    region: string | null;
    country: string | null;
    answersSnapshot: Record<string, any>;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    utmContent: string | null;
    utmTerm: string | null;
}

interface LeadsActionsProps {
    funnelId: string;
    leads: LeadData[];
}

export function LeadsActions({ funnelId, leads }: LeadsActionsProps) {
    const [isClearing, setIsClearing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const handleClearLeads = async () => {
        if (!confirm('Tem certeza que deseja limpar TODOS os leads? Esta ação não pode ser desfeita!')) {
            return;
        }

        setIsClearing(true);
        try {
            const response = await fetch(`/api/funnels/${funnelId}/leads`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Falha ao limpar leads');
            }

            toast.success('Leads limpos com sucesso!');
            window.location.reload();
        } catch (error) {
            console.error('Error clearing leads:', error);
            toast.error('Erro ao limpar leads. Tente novamente.');
        } finally {
            setIsClearing(false);
        }
    };

    const handleExportLeads = async () => {
        setIsExporting(true);
        try {
            // Create CSV content
            const headers = [
                'Lead #',
                'ID Sessão',
                'Data/Hora Início',
                'Data/Hora Fim',
                'Status',
                'IP',
                'Cidade',
                'Região',
                'País',
                'User Agent',
                'UTM Source',
                'UTM Medium',
                'UTM Campaign',
                'UTM Content',
                'UTM Term',
                'Respostas',
                'System ID'
            ];

            const rows = leads.map((lead, index) => [
                `LEAD-${String(index + 1).padStart(4, '0')}`,
                lead.sessionId,
                new Date(lead.startedAt).toLocaleString('pt-BR'),
                lead.completedAt ? new Date(lead.completedAt).toLocaleString('pt-BR') : 'Não completou',
                lead.completedAt ? 'Completado' : 'Abandonado',
                lead.ip || '-',
                lead.city || '-',
                lead.region || '-',
                lead.country || '-',
                lead.userAgent || '-',
                lead.utmSource || '-',
                lead.utmMedium || '-',
                lead.utmCampaign || '-',
                lead.utmContent || '-',
                lead.utmTerm || '-',
                JSON.stringify(lead.answersSnapshot),
                lead.id
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            ].join('\n');

            // Download CSV
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `leads_${funnelId}_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success('Leads exportados com sucesso!');
        } catch (error) {
            console.error('Error exporting leads:', error);
            toast.error('Erro ao exportar leads. Tente novamente.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="flex gap-2">
            <Button
                variant="outline"
                onClick={handleExportLeads}
                disabled={isExporting || leads.length === 0}
                className="gap-2"
            >
                <Download size={16} />
                {isExporting ? 'Exportando...' : 'Exportar Leads (CSV)'}
            </Button>
            <Button
                variant="destructive"
                onClick={handleClearLeads}
                disabled={isClearing || leads.length === 0}
                className="gap-2"
            >
                <Trash2 size={16} />
                {isClearing ? 'Limpando...' : 'Limpar Lista'}
            </Button>
        </div>
    );
}

interface LeadDetailsProps {
    lead: LeadData;
    leadNumber: number;
}

export function LeadDetails({ lead, leadNumber }: LeadDetailsProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="text-blue-600 hover:text-blue-800 font-mono text-xs underline hover:no-underline"
            >
                LEAD-{String(leadNumber).padStart(4, '0')}
            </button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Eye size={20} />
                            Detalhes do Lead #{String(leadNumber).padStart(4, '0')}
                        </DialogTitle>
                        <DialogDescription>
                            Informações completas do visitante captadas pelo sistema
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Session Info */}
                        <div className="border rounded-lg p-4 bg-slate-50">
                            <h3 className="font-semibold text-sm mb-3 text-slate-700">Informações da Sessão</h3>
                            <dl className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <dt className="text-slate-500 text-xs">ID da Sessão</dt>
                                    <dd className="font-mono text-xs mt-1">{lead.sessionId}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500 text-xs">Início</dt>
                                    <dd className="font-medium mt-1">{new Date(lead.startedAt).toLocaleString('pt-BR')}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500 text-xs">Fim</dt>
                                    <dd className="font-medium mt-1">
                                        {lead.completedAt ? new Date(lead.completedAt).toLocaleString('pt-BR') : 'Não completou'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500 text-xs">Status</dt>
                                    <dd className="mt-1">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${lead.completedAt ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {lead.completedAt ? 'Completado' : 'Abandonado'}
                                        </span>
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* Location Info */}
                        <div className="border rounded-lg p-4 bg-blue-50">
                            <h3 className="font-semibold text-sm mb-3 text-slate-700">Localização</h3>
                            <dl className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <dt className="text-slate-500 text-xs">IP</dt>
                                    <dd className="font-mono text-xs mt-1">{lead.ip || 'Não disponível'}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500 text-xs">Cidade</dt>
                                    <dd className="font-medium mt-1">{lead.city || 'Não disponível'}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500 text-xs">Estado/Região</dt>
                                    <dd className="font-medium mt-1">{lead.region || 'Não disponível'}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500 text-xs">País</dt>
                                    <dd className="font-medium mt-1">{lead.country || 'Não disponível'}</dd>
                                </div>
                            </dl>
                        </div>

                        {/* UTM Parameters */}
                        <div className="border rounded-lg p-4 bg-purple-50">
                            <h3 className="font-semibold text-sm mb-3 text-slate-700">Parâmetros UTM</h3>
                            <dl className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <dt className="text-slate-500 text-xs">Source</dt>
                                    <dd className="font-mono text-xs mt-1">{lead.utmSource || '-'}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500 text-xs">Medium</dt>
                                    <dd className="font-mono text-xs mt-1">{lead.utmMedium || '-'}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500 text-xs">Campaign</dt>
                                    <dd className="font-mono text-xs mt-1">{lead.utmCampaign || '-'}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500 text-xs">Content</dt>
                                    <dd className="font-mono text-xs mt-1">{lead.utmContent || '-'}</dd>
                                </div>
                                <div className="col-span-2">
                                    <dt className="text-slate-500 text-xs">Term</dt>
                                    <dd className="font-mono text-xs mt-1">{lead.utmTerm || '-'}</dd>
                                </div>
                            </dl>
                        </div>

                        {/* Device Info */}
                        <div className="border rounded-lg p-4 bg-green-50">
                            <h3 className="font-semibold text-sm mb-3 text-slate-700">Dispositivo</h3>
                            <dl className="text-sm">
                                <dt className="text-slate-500 text-xs">User Agent</dt>
                                <dd className="font-mono text-xs mt-1 break-all">{lead.userAgent || 'Não disponível'}</dd>
                            </dl>
                        </div>

                        {/* Answers */}
                        <div className="border rounded-lg p-4 bg-orange-50">
                            <h3 className="font-semibold text-sm mb-3 text-slate-700">Respostas do Funil</h3>
                            <dl className="space-y-2 text-sm">
                                {Object.keys(lead.answersSnapshot).length > 0 ? (
                                    Object.entries(lead.answersSnapshot).map(([key, value]) => (
                                        <div key={key} className="border-b border-orange-200 pb-2 last:border-0">
                                            <dt className="text-slate-500 text-xs">Pergunta ID: {key}</dt>
                                            <dd className="font-medium mt-1">{JSON.stringify(value)}</dd>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-slate-400 text-xs">Nenhuma resposta registrada</p>
                                )}
                            </dl>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
