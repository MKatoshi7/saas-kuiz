'use client';

import React, { useEffect, useState } from 'react';
import { BarChartComponent } from '@/types/funnel';

interface BarChartRendererProps {
    component: BarChartComponent;
}

const DEFAULT_COLORS = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#F97316', '#84CC16', '#6366F1',
];

export function BarChartRenderer({ component }: BarChartRendererProps) {
    const {
        title,
        titleHtml,
        items = [],
        orientation = 'horizontal',
        showValues = true,
        showPercentage = true,
        barHeight = 32,
        gap = 8,
        titleColor = '#111827',
        borderRadius = 6,
    } = component.data;

    const [animated, setAnimated] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setAnimated(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const maxValue = Math.max(...items.map(item => item.value || 0), 1);

    if (orientation === 'vertical') {
        const chartHeight = 200;
        const barWidth = Math.min(60, Math.max(30, (300 / items.length) - gap));

        return (
            <div className="w-full flex flex-col items-center py-6">
                {title && (
                    <h3 className="text-lg font-bold mb-4 text-center" style={{ color: titleColor }}>
                        {titleHtml ? (
                            <span dangerouslySetInnerHTML={{ __html: titleHtml }} />
                        ) : (
                            title
                        )}
                    </h3>
                )}

                <div className="relative w-full max-w-lg">
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-gray-400 -ml-6">
                        <span>{maxValue}</span>
                        <span>{Math.round(maxValue / 2)}</span>
                        <span>0</span>
                    </div>

                    {/* Chart area */}
                    <div className="flex items-end justify-center gap-2" style={{ height: chartHeight }}>
                        {items.map((item, i) => {
                            const value = item.value || 0;
                            const height = maxValue > 0 ? (value / maxValue) * chartHeight : 0;
                            const color = item.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
                            const percentage = maxValue > 0 ? ((value / maxValue) * 100).toFixed(0) : '0';
                            const delay = i * 80;

                            return (
                                <div key={item.id} className="flex flex-col items-center" style={{ gap: 4 }}>
                                    {showValues && (
                                        <span
                                            className="text-xs font-medium text-gray-600 transition-all duration-300"
                                            style={{
                                                opacity: animated ? 1 : 0,
                                                transform: animated ? 'translateY(0)' : 'translateY(5px)',
                                                transition: `opacity 0.3s ease ${delay + 300}ms, transform 0.3s ease ${delay + 300}ms`,
                                            }}
                                        >
                                            {showPercentage ? `${percentage}%` : value}
                                        </span>
                                    )}
                                    <div
                                        className="relative overflow-hidden"
                                        style={{
                                            width: barWidth,
                                            height: animated ? Math.max(4, height) : 4,
                                            backgroundColor: '#f3f4f6',
                                            borderRadius: `${borderRadius}px ${borderRadius}px 0 0`,
                                            transition: `height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`,
                                        }}
                                    >
                                        <div
                                            className="absolute inset-0"
                                            style={{
                                                background: `linear-gradient(180deg, ${color} 0%, ${color}cc 100%)`,
                                                borderRadius: `${borderRadius}px ${borderRadius}px 0 0`,
                                                boxShadow: `0 2px 8px ${color}40`,
                                            }}
                                        />
                                    </div>
                                    <span className="text-[10px] text-gray-500 text-center max-w-[60px] truncate">
                                        {item.labelHtml ? (
                                            <span dangerouslySetInnerHTML={{ __html: item.labelHtml }} />
                                        ) : (
                                            item.label
                                        )}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // Horizontal bars
    return (
        <div className="w-full py-6">
            {title && (
                <h3 className="text-lg font-bold mb-4 text-center" style={{ color: titleColor }}>
                    {titleHtml ? (
                        <span dangerouslySetInnerHTML={{ __html: titleHtml }} />
                    ) : (
                        title
                    )}
                </h3>
            )}

            <div className="space-y-2">
                {items.map((item, i) => {
                    const value = item.value || 0;
                    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
                    const color = item.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
                    const delay = i * 100;

                    return (
                        <div
                            key={item.id}
                            className="flex items-center gap-3 transition-all duration-300"
                            style={{
                                opacity: animated ? 1 : 0,
                                transform: animated ? 'translateX(0)' : 'translateX(-10px)',
                                transition: `opacity 0.3s ease ${delay}ms, transform 0.3s ease ${delay}ms`,
                            }}
                        >
                            <span className="text-sm text-gray-700 w-24 text-right truncate flex-shrink-0">
                                {item.labelHtml ? (
                                    <span dangerouslySetInnerHTML={{ __html: item.labelHtml }} />
                                ) : (
                                    item.label
                                )}
                            </span>
                            <div
                                className="flex-1 rounded-lg overflow-hidden"
                                style={{ height: barHeight, backgroundColor: '#f3f4f6' }}
                            >
                                <div
                                    className="h-full flex items-center justify-end px-3"
                                    style={{
                                        width: animated ? `${Math.max(percentage, 2)}%` : '2%',
                                        background: `linear-gradient(90deg, ${color}cc 0%, ${color} 100%)`,
                                        borderRadius: `${borderRadius}px`,
                                        boxShadow: `0 2px 8px ${color}40`,
                                        transition: `width 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`,
                                    }}
                                >
                                    {showValues && percentage > 15 && (
                                        <span className="text-xs font-bold text-white drop-shadow-sm">
                                            {showPercentage ? `${percentage.toFixed(0)}%` : value}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {showValues && percentage <= 15 && (
                                <span className="text-xs font-medium text-gray-500 ml-1">
                                    {showPercentage ? `${percentage.toFixed(0)}%` : value}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
