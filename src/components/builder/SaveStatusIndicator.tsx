'use client';

import { Loader2, CheckCircle2, AlertCircle, Circle, Cloud } from 'lucide-react';
import { SaveStatus } from '@/hooks/useAutoSave';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface SaveStatusIndicatorProps {
    status: SaveStatus;
    lastSaved?: Date | null;
    error?: string | null;
    className?: string;
}

const statusMap: Record<SaveStatus, { label: (d?: Date | null) => string; className: string; icon: (d?: Date | null) => React.ReactNode }> = {
    idle: {
        label: (d) => d ? `Salvo ${formatDistanceToNow(d, { addSuffix: true, locale: ptBR })}` : 'Sem alterações',
        className: 'text-muted-foreground',
        icon: () => <Cloud className="w-3.5 h-3.5" />,
    },
    dirty: {
        label: () => 'Alterações não salvas...',
        className: 'text-amber-600',
        icon: () => <Circle className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse-soft" />,
    },
    saving: {
        label: () => 'Salvando...',
        className: 'text-blue-600',
        icon: () => <Loader2 className="w-3.5 h-3.5 animate-spin" />,
    },
    saved: {
        label: (d) => d ? `Salvo ${formatDistanceToNow(d, { addSuffix: true, locale: ptBR })}` : 'Salvo',
        className: 'text-emerald-600',
        icon: () => <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    error: {
        label: () => 'Erro ao salvar',
        className: 'text-red-600',
        icon: () => <AlertCircle className="w-3.5 h-3.5" />,
    },
}

export function SaveStatusIndicator({
    status,
    lastSaved,
    error,
    className = ''
}: SaveStatusIndicatorProps) {
    const cfg = statusMap[status]
    return (
        <div
            className={cn(
                'inline-flex items-center gap-1.5 text-xs font-medium transition-colors',
                cfg.className,
                className
            )}
            title={error || undefined}
        >
            {cfg.icon(lastSaved)}
            <span>{cfg.label(lastSaved)}</span>
        </div>
    )
}
