import React, { useState, useEffect } from 'react';
import { FunnelTheme } from '@/types/funnel';

interface TimerRendererProps {
    minutes: number;
    seconds: number;
    style: string;
    autoStart?: boolean;
    onComplete?: () => void;
    theme: FunnelTheme;
    isPreview?: boolean;
}

export const TimerRenderer: React.FC<TimerRendererProps> = ({
    minutes,
    seconds,
    style,
    autoStart = true,
    onComplete,
    theme,
    isPreview = false
}) => {
    const [timeLeft, setTimeLeft] = useState(minutes * 60 + seconds);
    const [isActive, setIsActive] = useState(autoStart && !isPreview);

    useEffect(() => {
        setTimeLeft(minutes * 60 + seconds);
        setIsActive(autoStart && !isPreview);
    }, [minutes, seconds, autoStart, isPreview]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && timeLeft > 0 && !isPreview) {
            interval = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime <= 1) {
                        clearInterval(interval);
                        onComplete?.();
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft, onComplete, isPreview]);

    const formatTime = (time: number) => {
        const m = Math.floor(time / 60);
        const s = time % 60;
        return {
            minutes: m.toString().padStart(2, '0'),
            seconds: s.toString().padStart(2, '0')
        };
    };

    const { minutes: displayMinutes, seconds: displaySeconds } = formatTime(timeLeft);
    const primaryColor = theme.primaryColor || '#ef4444';
    const totalSeconds = minutes * 60 + seconds;
    const progress = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;

    if (style === 'minimal') {
        return (
            <div className="flex justify-center items-center py-4">
                <div className="text-5xl font-bold font-mono tracking-wider" style={{ color: primaryColor }}>
                    {displayMinutes}:{displaySeconds}
                </div>
            </div>
        );
    }

    if (style === 'circle') {
        const radius = 40;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (progress / 100) * circumference;

        return (
            <div className="flex justify-center py-4">
                <div className="relative w-28 h-28">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r={radius} fill="none" stroke={`${primaryColor}20`} strokeWidth="6" />
                        <circle
                            cx="50" cy="50" r={radius} fill="none" stroke={primaryColor} strokeWidth="6"
                            strokeDasharray={circumference} strokeDashoffset={offset}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 4px ${primaryColor}40)` }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold font-mono" style={{ color: primaryColor }}>
                            {displayMinutes}:{displaySeconds}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    if (style === 'pill') {
        return (
            <div className="flex justify-center py-4">
                <div
                    className="flex items-center gap-1 px-6 py-3 rounded-full border-2"
                    style={{ borderColor: primaryColor, backgroundColor: `${primaryColor}08` }}
                >
                    <div className="flex items-center gap-1">
                        <span className="text-2xl font-bold font-mono tabular-nums" style={{ color: primaryColor }}>
                            {displayMinutes}
                        </span>
                        <span className="text-lg font-bold animate-pulse" style={{ color: primaryColor }}>:</span>
                        <span className="text-2xl font-bold font-mono tabular-nums" style={{ color: primaryColor }}>
                            {displaySeconds}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    if (style === 'segmented') {
        return (
            <div className="flex justify-center items-center gap-2 py-4">
                {displayMinutes.split('').map((digit, i) => (
                    <div
                        key={`m${i}`}
                        className="w-12 h-16 rounded-lg flex items-center justify-center text-2xl font-bold font-mono shadow-md"
                        style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
                    >
                        {digit}
                    </div>
                ))}
                <span className="text-2xl font-bold mx-1" style={{ color: primaryColor }}>:</span>
                {displaySeconds.split('').map((digit, i) => (
                    <div
                        key={`s${i}`}
                        className="w-12 h-16 rounded-lg flex items-center justify-center text-2xl font-bold font-mono shadow-md"
                        style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
                    >
                        {digit}
                    </div>
                ))}
            </div>
        );
    }

    if (style === 'bar') {
        return (
            <div className="flex flex-col items-center py-4 px-6">
                <div className="text-4xl font-bold font-mono mb-3" style={{ color: primaryColor }}>
                    {displayMinutes}:{displaySeconds}
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: `${primaryColor}15` }}>
                    <div
                        className="h-full rounded-full transition-all duration-1000 ease-linear"
                        style={{
                            width: `${progress}%`,
                            backgroundColor: primaryColor,
                            boxShadow: `0 0 8px ${primaryColor}50`,
                        }}
                    />
                </div>
            </div>
        );
    }

    // Default 'boxes' style
    return (
        <div className="flex justify-center gap-3 text-center py-4">
            <div
                className="p-3 rounded-lg border min-w-[70px] shadow-sm"
                style={{
                    backgroundColor: `${primaryColor}10`,
                    borderColor: `${primaryColor}30`,
                    color: primaryColor
                }}
            >
                <div className="text-2xl font-bold">{displayMinutes}</div>
                <div className="text-[10px] uppercase font-medium opacity-80">Min</div>
            </div>
            <div className="flex items-center text-2xl font-bold text-gray-300">:</div>
            <div
                className="p-3 rounded-lg border min-w-[70px] shadow-sm"
                style={{
                    backgroundColor: `${primaryColor}10`,
                    borderColor: `${primaryColor}30`,
                    color: primaryColor
                }}
            >
                <div className="text-2xl font-bold">{displaySeconds}</div>
                <div className="text-[10px] uppercase font-medium opacity-80">Seg</div>
            </div>
        </div>
    );
};
