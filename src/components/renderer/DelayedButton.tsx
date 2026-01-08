'use client';

import React, { useState, useEffect } from 'react';

interface DelayedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    delay: number; // in seconds
    children: React.ReactNode;
}

export function DelayedButton({ delay, children, ...props }: DelayedButtonProps) {
    const [isVisible, setIsVisible] = useState(delay === 0);
    const [countdown, setCountdown] = useState(Math.ceil(delay));

    useEffect(() => {
        if (delay > 0) {
            // Countdown timer
            const countdownInterval = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(countdownInterval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            // Show button after delay
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, delay * 1000);

            return () => {
                clearTimeout(timer);
                clearInterval(countdownInterval);
            };
        }
    }, [delay]);

    if (!isVisible) {
        return (
            <div className="w-full flex items-center justify-center py-3 px-6 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                <div className="flex items-center gap-3 text-gray-500">
                    <div className="relative">
                        <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold">{countdown}</span>
                        </div>
                    </div>
                    <span className="text-sm font-medium">
                        Aguarde {countdown}s para continuar...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <button {...props} className={`${props.className} animate-fade-in`}>
            {children}
        </button>
    );
}
