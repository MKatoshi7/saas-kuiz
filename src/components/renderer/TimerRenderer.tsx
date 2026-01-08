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
    const primaryColor = theme.primaryColor || '#ef4444'; // Default to red if no theme color

    if (style === 'minimal') {
        return (
            <div className="flex justify-center items-center py-4">
                <div className="text-4xl font-bold font-mono tracking-wider" style={{ color: primaryColor }}>
                    {displayMinutes}:{displaySeconds}
                </div>
            </div>
        );
    }

    if (style === 'circle') {
        return (
            <div className="flex justify-center py-4">
                <div
                    className="w-24 h-24 rounded-full flex items-center justify-center border-4 text-2xl font-bold shadow-lg"
                    style={{
                        borderColor: primaryColor,
                        color: primaryColor,
                        backgroundColor: `${primaryColor}10`
                    }}
                >
                    {displayMinutes}:{displaySeconds}
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
                    backgroundColor: `${primaryColor}10`, // 10% opacity
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
