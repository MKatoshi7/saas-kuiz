'use client';

import React from 'react';
import { useLoadingTimer } from '@/hooks/useLoadingTimer';

interface LoadingComponentRendererProps {
    data: any;
    onNext: () => void;
    onJump: (stepId: string) => void;
}

export const LoadingComponentRenderer: React.FC<LoadingComponentRendererProps> = ({ data, onNext, onJump }) => {
    const progress = useLoadingTimer(data.duration || 3000, () => {
        if (data.actionType === 'none') return;
        if (data.actionType === 'open_url' && data.targetUrl) {
            window.location.href = data.targetUrl;
        } else if (data.actionType === 'jump_to_step' && data.nextStepId) {
            onJump(data.nextStepId);
        } else {
            onNext();
        }
    });

    const getMessage = () => {
        if (data.messages && data.messages.length > 0) {
            const step = 100 / data.messages.length;
            const index = Math.min(Math.floor(progress / step), data.messages.length - 1);
            return data.messages[index];
        }
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
    const loadingStyle = data.loadingStyle || 'bar';

    const HEIGHT_MAP: Record<string, string> = { sm: 'h-2', md: 'h-4', lg: 'h-6' };

    if (loadingStyle === 'circle') {
        const radius = 45;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (progress / 100) * circumference;

        return (
            <div className="w-full flex flex-col items-center justify-center py-12 px-6 text-center animate-in fade-in duration-500">
                <h2
                    className="text-2xl font-bold mb-6 transition-all duration-300"
                    style={{ color: textColor }}
                >
                    {progress === 100 && data.endText ? data.endText : (data.headline || 'Processando...')}
                </h2>

                <div className="relative w-32 h-32">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r={radius} fill="none" stroke={trackColor} strokeWidth="8" />
                        <circle
                            cx="50" cy="50" r={radius} fill="none" stroke={barColor} strokeWidth="8"
                            strokeDasharray={circumference} strokeDashoffset={offset}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 0.1s linear', filter: `drop-shadow(0 0 6px ${barColor}60)` }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold" style={{ color: textColor }}>{Math.round(progress)}%</span>
                    </div>
                </div>

                {data.subheadline && (
                    <p className="text-gray-500 mt-4 text-sm font-medium opacity-80">{data.subheadline}</p>
                )}

                <div className="mt-3 text-xs text-gray-400 h-4 transition-all duration-300">{getMessage()}</div>
            </div>
        );
    }

    if (loadingStyle === 'dots') {
        return (
            <div className="w-full flex flex-col items-center justify-center py-12 px-6 text-center animate-in fade-in duration-500">
                <h2
                    className="text-2xl font-bold mb-4 transition-all duration-300"
                    style={{ color: textColor }}
                >
                    {progress === 100 && data.endText ? data.endText : (data.headline || 'Processando...')}
                </h2>

                {data.subheadline && (
                    <p className="text-gray-500 mb-6 text-sm font-medium opacity-80">{data.subheadline}</p>
                )}

                <div className="flex gap-3 mb-4">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="w-4 h-4 rounded-full transition-all duration-300"
                            style={{
                                backgroundColor: progress > (i + 1) * 33 ? barColor : trackColor,
                                transform: progress > (i + 1) * 33 ? 'scale(1.2)' : 'scale(1)',
                                boxShadow: progress > (i + 1) * 33 ? `0 0 10px ${barColor}60` : 'none',
                            }}
                        />
                    ))}
                </div>

                {data.showPercentage !== false && (
                    <div className="font-mono text-sm font-bold mb-2" style={{ color: textColor }}>
                        {Math.round(progress)}%
                    </div>
                )}

                <div className="text-xs text-gray-400 h-4 transition-all duration-300">{getMessage()}</div>
            </div>
        );
    }

    if (loadingStyle === 'pulse') {
        return (
            <div className="w-full flex flex-col items-center justify-center py-12 px-6 text-center animate-in fade-in duration-500">
                <h2
                    className="text-2xl font-bold mb-4 transition-all duration-300"
                    style={{ color: textColor }}
                >
                    {progress === 100 && data.endText ? data.endText : (data.headline || 'Processando...')}
                </h2>

                {data.subheadline && (
                    <p className="text-gray-500 mb-6 text-sm font-medium opacity-80">{data.subheadline}</p>
                )}

                <div className="relative w-48 h-2 rounded-full overflow-hidden" style={{ backgroundColor: trackColor }}>
                    <div
                        className="absolute inset-0 rounded-full"
                        style={{
                            width: `${progress}%`,
                            backgroundColor: barColor,
                            boxShadow: `0 0 20px ${barColor}80`,
                            transition: 'width 0.1s linear',
                        }}
                    />
                    <div
                        className="absolute inset-0 rounded-full animate-pulse"
                        style={{
                            width: `${progress}%`,
                            backgroundColor: `${barColor}40`,
                        }}
                    />
                </div>

                {data.showPercentage !== false && (
                    <div className="mt-3 font-mono text-sm font-bold" style={{ color: textColor }}>
                        {Math.round(progress)}%
                    </div>
                )}

                <div className="mt-2 text-xs text-gray-400 h-4 transition-all duration-300">{getMessage()}</div>
            </div>
        );
    }

    // Default 'bar' style (improved)
    return (
        <div className="w-full flex flex-col items-center justify-center py-12 px-6 text-center animate-in fade-in duration-500">
            <h2
                className="text-2xl font-bold mb-2 transition-all duration-300"
                style={{ color: textColor }}
            >
                {progress === 100 && data.endText ? data.endText : (data.headline || 'Processando...')}
            </h2>

            {data.subheadline && (
                <p className="text-gray-500 mb-8 text-sm font-medium opacity-80">{data.subheadline}</p>
            )}

            <div className="w-full max-w-sm">
                <div
                    className={`w-full overflow-hidden ${HEIGHT_MAP[height]} ${rounded === 'full' ? 'rounded-full' : rounded === 'md' ? 'rounded-md' : ''}`}
                    style={{ backgroundColor: trackColor, boxShadow: `inset 0 1px 3px ${trackColor}` }}
                >
                    <div
                        className="h-full relative overflow-hidden"
                        style={{
                            width: `${progress}%`,
                            backgroundColor: barColor,
                            boxShadow: `0 0 12px ${barColor}50`,
                            transition: 'width 0.1s linear',
                        }}
                    >
                        <div
                            className="absolute inset-0"
                            style={{
                                background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)`,
                                animation: 'shimmer 1.5s infinite',
                            }}
                        />
                    </div>
                </div>

                {data.showPercentage !== false && (
                    <div className="mt-3 flex items-center justify-between">
                        <span className="font-mono text-sm font-bold" style={{ color: textColor }}>
                            {Math.round(progress)}%
                        </span>
                        <span className="text-[10px] text-gray-400">completo</span>
                    </div>
                )}
            </div>

            <div className="mt-4 text-xs text-gray-400 h-4 transition-all duration-300">{getMessage()}</div>

            <style jsx>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
};
