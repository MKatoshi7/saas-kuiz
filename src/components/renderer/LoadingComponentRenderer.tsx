import React from 'react';
import { useLoadingTimer } from '@/hooks/useLoadingTimer';

interface LoadingComponentRendererProps {
    data: any;
    onNext: () => void;
    onJump: (stepId: string) => void;
}

export const LoadingComponentRenderer: React.FC<LoadingComponentRendererProps> = ({ data, onNext, onJump }) => {
    // Mapa de Alturas da Barra
    const HEIGHT_MAP: Record<string, string> = {
        sm: 'h-2',
        md: 'h-4',
        lg: 'h-6',
    };

    const progress = useLoadingTimer(data.duration || 3000, () => {
        if (data.actionType === 'open_url' && data.targetUrl) {
            window.location.href = data.targetUrl;
        } else if (data.actionType === 'jump_to_step' && data.nextStepId) {
            onJump(data.nextStepId);
        } else {
            onNext();
        }
    });

    // Mensagens dinâmicas baseadas no progresso
    const getMessage = () => {
        if (data.messages && data.messages.length > 0) {
            const step = 100 / data.messages.length;
            const index = Math.min(
                Math.floor(progress / step),
                data.messages.length - 1
            );
            return data.messages[index];
        }

        // Mensagens padrão se não houver customização
        if (progress < 30) return "Conectando ao servidor...";
        if (progress < 70) return "Verificando compatibilidade...";
        if (progress < 100) return "Gerando plano personalizado...";
        return "Pronto!";
    };

    const barColor = data.barColor || '#22c55e';
    const trackColor = data.trackColor || '#e2e8f0';
    const textColor = data.textColor || '#1e293b';
    const height = data.height || 'md';
    const rounded = data.rounded || 'full';

    return (
        <div className="w-full flex flex-col items-center justify-center py-10 px-6 text-center animate-in fade-in duration-500">
            {/* Textos Superiores */}
            <h2
                className="text-2xl font-bold mb-2 transition-all duration-300"
                style={{ color: textColor }}
            >
                {progress === 100 && data.endText ? data.endText : (data.headline || 'Processando...')}
            </h2>

            {data.subheadline && (
                <p className="text-gray-500 mb-8 text-sm font-medium opacity-80">
                    {data.subheadline}
                </p>
            )}

            {/* A Barra de Progresso */}
            <div
                className={`w-full overflow-hidden shadow-inner ${HEIGHT_MAP[height]} ${rounded === 'full' ? 'rounded-full' : rounded === 'md' ? 'rounded-md' : ''
                    } `}
                style={{ backgroundColor: trackColor }}
            >
                {/* O Preenchimento Animado */}
                <div
                    className="h-full transition-all ease-linear duration-100"
                    style={{
                        width: `${progress}% `,
                        backgroundColor: barColor,
                        boxShadow: `0 0 10px ${barColor} 40`
                    }}
                />
            </div>

            {/* Porcentagem */}
            {data.showPercentage !== false && (
                <div className="mt-3 font-mono text-sm font-bold text-gray-400">
                    {Math.round(progress)}%
                </div>
            )}

            {/* Mensagens Dinâmicas */}
            <div className="mt-2 text-xs text-gray-400 h-4 transition-all duration-300">
                {getMessage()}
            </div>
        </div>
    );
};
