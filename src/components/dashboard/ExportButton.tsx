'use client';

import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExportButtonProps {
    data: any[];
    steps: { id: string; title: string }[];
    funnelId: string;
}

export function ExportButton({ data, steps, funnelId }: ExportButtonProps) {
    const handleExport = () => {
        // Define headers
        const headers = [
            'Data/Hora',
            'Origem',
            ...steps.map(s => s.title),
            'Status',
            'Campanha',
            'Anúncio',
            'Conjunto'
        ];

        // Map data to CSV rows
        const csvRows = data.map(row => {
            const stepValues = steps.map(s => {
                const val = row.stepEvents[s.id] || '-';
                // Escape quotes if needed
                return `"${val.replace(/"/g, '""')}"`;
            });

            return [
                `"${row.startedAt}"`,
                `"${row.utmSource}"`,
                ...stepValues,
                `"${row.status}"`,
                `"${row.campaign}"`,
                `"${row.ad}"`,
                `"${row.adset}"`
            ].join(',');
        });

        // Combine headers and rows
        const csvContent = [headers.join(','), ...csvRows].join('\n');

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `funnel_export_${funnelId}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleExport}
        >
            <Download className="w-4 h-4" />
            Exportar CSV
        </Button>
    );
}
