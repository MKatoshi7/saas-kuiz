import React, { useState, useEffect, useRef } from 'react';

export interface AnimatedCounterData {
    start?: number;
    end: number;
    duration?: number; // in milliseconds
    decimals?: number;
    prefix?: string;
    suffix?: string;
    separator?: string; // thousands separator
    formatAsCurrency?: boolean;
    currency?: string;
    fontSize?: 'small' | 'normal' | 'medium' | 'big' | 'bigger' | 'huge';
    align?: 'left' | 'center' | 'right';
    color?: string;
    fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
    animateOnScroll?: boolean;
}

interface AnimatedCounterRendererProps {
    data: AnimatedCounterData;
    className?: string;
}

export function AnimatedCounterRenderer({ data, className = '' }: AnimatedCounterRendererProps) {
    const {
        start = 0,
        end,
        duration = 2000,
        decimals = 0,
        prefix = '',
        suffix = '',
        separator = ',',
        formatAsCurrency = false,
        currency = 'BRL',
        fontSize = 'big',
        align = 'center',
        color = '#111827',
        fontWeight = 'bold',
        animateOnScroll = true
    } = data;

    const [count, setCount] = useState(start);
    const [hasAnimated, setHasAnimated] = useState(false);
    const counterRef = useRef<HTMLDivElement>(null);

    // Intersection Observer for scroll animation
    useEffect(() => {
        if (!animateOnScroll) {
            startAnimation();
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasAnimated) {
                        startAnimation();
                        setHasAnimated(true);
                    }
                });
            },
            { threshold: 0.5 }
        );

        if (counterRef.current) {
            observer.observe(counterRef.current);
        }

        return () => {
            if (counterRef.current) {
                observer.unobserve(counterRef.current);
            }
        };
    }, [animateOnScroll, hasAnimated]);

    const startAnimation = () => {
        const startTime = Date.now();
        const difference = end - start;

        const animate = () => {
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (easeOutExpo)
            const easeOutExpo = (t: number) => {
                return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
            };

            const currentCount = start + difference * easeOutExpo(progress);
            setCount(currentCount);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };

        requestAnimationFrame(animate);
    };

    // Format number with separators
    const formatNumber = (num: number): string => {
        const fixed = num.toFixed(decimals);
        const parts = fixed.split('.');

        // Add thousands separator
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);

        return parts.join('.');
    };

    // Format as currency
    const formatCurrency = (num: number): string => {
        if (currency === 'BRL') {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(num);
        } else if (currency === 'USD') {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(num);
        } else if (currency === 'EUR') {
            return new Intl.NumberFormat('de-DE', {
                style: 'currency',
                currency: 'EUR'
            }).format(num);
        }
        return formatNumber(num);
    };

    // Get display value
    const getDisplayValue = (): string => {
        const formattedNumber = formatAsCurrency
            ? formatCurrency(count)
            : formatNumber(count);

        return `${prefix}${formattedNumber}${suffix}`;
    };

    // Get font size class
    const getFontSizeClass = (): string => {
        switch (fontSize) {
            case 'small':
                return 'text-2xl';
            case 'normal':
                return 'text-3xl';
            case 'medium':
                return 'text-4xl';
            case 'big':
                return 'text-5xl';
            case 'bigger':
                return 'text-6xl';
            case 'huge':
                return 'text-7xl';
            default:
                return 'text-5xl';
        }
    };

    // Get alignment class
    const getAlignClass = (): string => {
        switch (align) {
            case 'left':
                return 'text-left';
            case 'right':
                return 'text-right';
            default:
                return 'text-center';
        }
    };

    // Get font weight class
    const getFontWeightClass = (): string => {
        switch (fontWeight) {
            case 'normal':
                return 'font-normal';
            case 'medium':
                return 'font-medium';
            case 'semibold':
                return 'font-semibold';
            case 'bold':
                return 'font-bold';
            default:
                return 'font-bold';
        }
    };

    return (
        <div
            ref={counterRef}
            className={`animated-counter-component ${getAlignClass()} ${className}`}
        >
            <div
                className={`
                    ${getFontSizeClass()}
                    ${getFontWeightClass()}
                    tabular-nums
                    transition-all duration-300
                `}
                style={{ color }}
            >
                {getDisplayValue()}
            </div>
        </div>
    );
}

export default AnimatedCounterRenderer;
