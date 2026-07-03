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
    const showPercentage = data.showPercentage !== false;
    const percentageInside = data.percentageInside === true;
    const percentagePosition = data.percentagePosition || 'center';

    const HEIGHT_MAP: Record<string, string> = { sm: 'h-2', md: 'h-4', lg: 'h-6' };

    const pctLabel = `${Math.round(progress)}%`;

    const positionClass =
        percentagePosition === 'left'
            ? 'justify-start pl-3'
            : percentagePosition === 'right'
            ? 'justify-end pr-3'
            : 'justify-center';

    // ── CIRCLE ──
    if (loadingStyle === 'circle') {
        const radius = 45;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (progress / 100) * circumference;

        return (
            <div className="w-full flex flex-col items-center justify-center py-12 px-6 text-center">
                <h2
                    className="text-2xl font-bold mb-6"
                    style={{ color: textColor }}
                >
                    {progress === 100 ? (data.endTextHtml ? <span dangerouslySetInnerHTML={{ __html: data.endTextHtml }} /> : (data.endText || '')) : (data.headlineHtml ? <span dangerouslySetInnerHTML={{ __html: data.headlineHtml }} /> : (data.headline || 'Processando...'))}
                </h2>

                <div className="relative w-32 h-32">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r={radius} fill="none" stroke={trackColor} strokeWidth="8" />
                        <circle
                            cx="50" cy="50" r={radius} fill="none" stroke={barColor} strokeWidth="8"
                            strokeDasharray={circumference} strokeDashoffset={offset}
                            strokeLinecap="round"
                            style={{ filter: `drop-shadow(0 0 6px ${barColor}60)` }}
                        />
                    </svg>
                    {showPercentage && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xl font-bold" style={{ color: textColor }}>{pctLabel}</span>
                        </div>
                    )}
                </div>

                {data.subheadline && (
                    <p className="text-gray-500 mt-4 text-sm font-medium opacity-80">{data.subheadlineHtml ? <span dangerouslySetInnerHTML={{ __html: data.subheadlineHtml }} /> : data.subheadline}</p>
                )}

                <div className="mt-3 text-xs text-gray-400 h-4">{getMessage()}</div>
            </div>
        );
    }

    // ── DOTS ──
    if (loadingStyle === 'dots') {
        return (
            <div className="w-full flex flex-col items-center justify-center py-12 px-6 text-center">
                <h2
                    className="text-2xl font-bold mb-4"
                    style={{ color: textColor }}
                >
                    {progress === 100 ? (data.endTextHtml ? <span dangerouslySetInnerHTML={{ __html: data.endTextHtml }} /> : (data.endText || '')) : (data.headlineHtml ? <span dangerouslySetInnerHTML={{ __html: data.headlineHtml }} /> : (data.headline || 'Processando...'))}
                </h2>

                {data.subheadline && (
                    <p className="text-gray-500 mb-6 text-sm font-medium opacity-80">{data.subheadlineHtml ? <span dangerouslySetInnerHTML={{ __html: data.subheadlineHtml }} /> : data.subheadline}</p>
                )}

                <div className="flex gap-3 mb-4">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="w-4 h-4 rounded-full"
                            style={{
                                backgroundColor: progress > (i + 1) * 33 ? barColor : trackColor,
                                transform: progress > (i + 1) * 33 ? 'scale(1.2)' : 'scale(1)',
                                boxShadow: progress > (i + 1) * 33 ? `0 0 10px ${barColor}60` : 'none',
                            }}
                        />
                    ))}
                </div>

                {showPercentage && (
                    <div className="font-mono text-sm font-bold mb-2" style={{ color: textColor }}>
                        {pctLabel}
                    </div>
                )}

                <div className="text-xs text-gray-400 h-4">{getMessage()}</div>
            </div>
        );
    }

    // ── PULSE ──
    if (loadingStyle === 'pulse') {
        return (
            <div className="w-full flex flex-col items-center justify-center py-12 px-6 text-center">
                <h2
                    className="text-2xl font-bold mb-4"
                    style={{ color: textColor }}
                >
                    {progress === 100 ? (data.endTextHtml ? <span dangerouslySetInnerHTML={{ __html: data.endTextHtml }} /> : (data.endText || '')) : (data.headlineHtml ? <span dangerouslySetInnerHTML={{ __html: data.headlineHtml }} /> : (data.headline || 'Processando...'))}
                </h2>

                {data.subheadline && (
                    <p className="text-gray-500 mb-6 text-sm font-medium opacity-80">{data.subheadlineHtml ? <span dangerouslySetInnerHTML={{ __html: data.subheadlineHtml }} /> : data.subheadline}</p>
                )}

                <div className="relative w-full max-w-sm">
                    <div
                        className={`w-full overflow-hidden ${HEIGHT_MAP[height]} ${rounded === 'full' ? 'rounded-full' : rounded === 'md' ? 'rounded-md' : ''}`}
                        style={{ backgroundColor: trackColor }}
                    >
                        <div
                            className="h-full relative"
                            style={{
                                width: `${progress}%`,
                                backgroundColor: barColor,
                                boxShadow: `0 0 20px ${barColor}80`,
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

                    {showPercentage && percentageInside && (
                        <div
                            className={`absolute inset-0 flex items-center text-xs font-bold ${positionClass}`}
                            style={{ color: textColor }}
                        >
                            {pctLabel}
                        </div>
                    )}
                </div>

                {showPercentage && !percentageInside && (
                    <div className="mt-3 font-mono text-sm font-bold" style={{ color: textColor }}>
                        {pctLabel}
                    </div>
                )}

                <div className="mt-2 text-xs text-gray-400 h-4">{getMessage()}</div>
            </div>
        );
    }

    // ── BAR (default) ──
    return (
        <div className="w-full flex flex-col items-center justify-center py-12 px-6 text-center">
            <h2
                className="text-2xl font-bold mb-2"
                style={{ color: textColor }}
            >
                {progress === 100 ? (data.endTextHtml ? <span dangerouslySetInnerHTML={{ __html: data.endTextHtml }} /> : (data.endText || '')) : (data.headlineHtml ? <span dangerouslySetInnerHTML={{ __html: data.headlineHtml }} /> : (data.headline || 'Processando...'))}
            </h2>

            {data.subheadline && (
                <p className="text-gray-500 mb-8 text-sm font-medium opacity-80">{data.subheadlineHtml ? <span dangerouslySetInnerHTML={{ __html: data.subheadlineHtml }} /> : data.subheadline}</p>
            )}

            <div className="w-full max-w-sm">
                <div
                    className={`relative w-full overflow-hidden ${HEIGHT_MAP[height]} ${rounded === 'full' ? 'rounded-full' : rounded === 'md' ? 'rounded-md' : ''}`}
                    style={{ backgroundColor: trackColor }}
                >
                    <div
                        className="h-full relative overflow-hidden"
                        style={{
                            width: `${progress}%`,
                            backgroundColor: barColor,
                            boxShadow: `0 0 12px ${barColor}50`,
                        }}
                    >
                        <div
                            className="absolute inset-0"
                            style={{
                                background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)`,
                                animation: 'loading-shimmer 1.5s infinite',
                            }}
                        />
                    </div>

                    {showPercentage && percentageInside && (
                        <div
                            className={`absolute inset-0 flex items-center text-xs font-bold z-10 ${positionClass}`}
                            style={{ color: textColor }}
                        >
                            {pctLabel}
                        </div>
                    )}
                </div>

                {showPercentage && !percentageInside && (
                    <div className="mt-3 flex items-center justify-between">
                        <span className="font-mono text-sm font-bold" style={{ color: textColor }}>
                            {pctLabel}
                        </span>
                        <span className="text-[10px] text-gray-400">completo</span>
                    </div>
                )}
            </div>

            <div className="mt-4 text-xs text-gray-400 h-4">{getMessage()}</div>

            <style>{`
                @keyframes loading-shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
};
