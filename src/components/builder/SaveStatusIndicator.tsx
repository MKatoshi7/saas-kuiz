'use client';

import { Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { SaveStatus } from '@/hooks/useAutoSave';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SaveStatusIndicatorProps {
    status: SaveStatus;
    lastSaved?: Date | null;
    error?: string | null;
    className?: string;
}

export function SaveStatusIndicator({
    status,
    lastSaved,
    error,
    className = ''
}: SaveStatusIndicatorProps) {
    return (
        <div className={`flex items-center gap-2 text-sm ${className}`}>
            {status === 'saving' && (
                <>
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    <span className="text-gray-600">Salvando...</span>
                </>
            )}

            {status === 'saved' && (
                <>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600">
                        {lastSaved
                            ? `Salvo ${formatDistanceToNow(lastSaved, { addSuffix: true, locale: ptBR })}`
                            : 'Salvo automaticamente'
                        }
                    </span>
                </>
            )}

            {status === 'error' && (
                <>
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-red-600" title={error || undefined}>
                        Erro ao salvar
                    </span>
                </>
            )}

            {status === 'idle' && lastSaved && (
                <>
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">
                        Salvo {formatDistanceToNow(lastSaved, { addSuffix: true, locale: ptBR })}
                    </span>
                </>
            )}
        </div>
    );
}
