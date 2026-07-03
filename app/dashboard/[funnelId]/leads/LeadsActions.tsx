'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Visitor {
    id: string;
    sessionId: string;
    startedAt: string | Date;
    completedAt: string | Date | null;
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
    referrer: string | null;
    isLead: boolean;
    isConverted: boolean;
    email: string | null;
    name: string | null;
    phone: string | null;
}

interface LeadsActionsProps {
    funnelId: string;
    visitors: Visitor[];
    steps: any[];
}

export function LeadsActions({ funnelId, visitors, steps }: LeadsActionsProps) {
    const [isClearing, setIsClearing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const handleClearLeads = async () => {
        setIsClearing(true);
        try {
            const response = await fetch(`/api/funnels/${funnelId}/leads`, { method: 'DELETE' });
            if (!response.ok) throw new Error();
            toast.success('Leads limpos com sucesso!');
            window.location.reload();
        } catch {
            toast.error('Erro ao limpar leads');
        } finally {
            setIsClearing(false);
        }
    };

    const handleExportLeads = async () => {
        setIsExporting(true);
        try {
            const baseHeaders = [
                'Lead #', 'ID Sessão', 'Data/Hora Início', 'Data/Hora Fim', 'Status',
                'Nome', 'Email', 'Telefone',
                'IP', 'Cidade', 'Região', 'País',
                'UTM Source', 'UTM Medium', 'UTM Campaign', 'UTM Content', 'UTM Term',
                'Referrer', 'User Agent',
            ];
            const stepHeaders = steps.map((step, i) => `Etapa ${i + 1}: ${step.title}`);
            const headers = [...baseHeaders, ...stepHeaders, 'System ID'];

            const rows = visitors.map((lead, i) => {
                const baseData = [
                    `LEAD-${String(i + 1).padStart(4, '0')}`,
                    lead.sessionId,
                    new Date(lead.startedAt).toLocaleString('pt-BR'),
                    lead.completedAt ? new Date(lead.completedAt).toLocaleString('pt-BR') : 'Não completou',
                    lead.completedAt ? 'Completado' : 'Abandonado',
                    lead.name || '',
                    lead.email || '',
                    lead.phone || '',
                    lead.ip || '',
                    lead.city || '',
                    lead.region || '',
                    lead.country || '',
                    lead.utmSource || '',
                    lead.utmMedium || '',
                    lead.utmCampaign || '',
                    lead.utmContent || '',
                    lead.utmTerm || '',
                    lead.referrer || '',
                    lead.userAgent || '',
                ];
                const stepAnswers = steps.map((step) => {
                    const v = lead.answersSnapshot?.[step.id]
                    return v !== undefined && v !== null && v !== '' ? String(v) : ''
                });
                return [...baseData, ...stepAnswers, lead.id];
            });

            const csv = [
                headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(','),
                ...rows.map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
            ].join('\n');

            const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `leads_${funnelId}_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success('Leads exportados!');
        } catch {
            toast.error('Erro ao exportar');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="flex gap-2">
            <Button
                variant="outline"
                onClick={handleExportLeads}
                disabled={isExporting || visitors.length === 0}
                leftIcon={isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            >
                {isExporting ? 'Exportando…' : 'Exportar todos'}
            </Button>
            <Button
                variant="destructive"
                onClick={handleClearLeads}
                disabled={isClearing || visitors.length === 0}
                leftIcon={isClearing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            >
                {isClearing ? 'Limpando…' : 'Limpar tudo'}
            </Button>
        </div>
    );
}
