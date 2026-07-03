'use client';

import React, { useEffect, useState } from 'react';
import { PieChartComponent } from '@/types/funnel';

interface PieChartRendererProps {
    component: PieChartComponent;
}

const DEFAULT_COLORS = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#F97316', '#84CC16', '#6366F1',
];

export function PieChartRenderer({ component }: PieChartRendererProps) {
    const {
        title,
        items = [],
        showLegend = true,
        showPercentage = true,
        size = 'md',
        holeSize = 0.5,
        titleColor = '#111827',
    } = component.data;

    const [animated, setAnimated] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setAnimated(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const total = items.reduce((sum, item) => sum + (item.value || 0), 0);

    const sizeMap = { sm: 160, md: 220, lg: 300 };
    const svgSize = sizeMap[size] || 220;
    const cx = svgSize / 2;
    const cy = svgSize / 2;
    const radius = svgSize / 2 - 10;
    const innerRadius = radius * holeSize;

    // Build pie segments with animation
    let currentAngle = -Math.PI / 2;
    const segments = items.map((item, i) => {
        const value = item.value || 0;
        const angle = total > 0 ? (value / total) * Math.PI * 2 : 0;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        currentAngle = endAngle;

        const largeArc = angle > Math.PI ? 1 : 0;

        const x1 = cx + radius * Math.cos(startAngle);
        const y1 = cy + radius * Math.sin(startAngle);
        const x2 = cx + radius * Math.cos(endAngle);
        const y2 = cy + radius * Math.sin(endAngle);

        const ix1 = cx + innerRadius * Math.cos(startAngle);
        const iy1 = cy + innerRadius * Math.sin(startAngle);
        const ix2 = cx + innerRadius * Math.cos(endAngle);
        const iy2 = cy + innerRadius * Math.sin(endAngle);

        const path = [
            `M ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
            `L ${ix2} ${iy2}`,
            `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1}`,
            'Z'
        ].join(' ');

        return {
            path,
            color: item.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
            label: item.label,
            value,
            percentage: total > 0 ? ((value / total) * 100).toFixed(1) : '0',
            delay: i * 100,
        };
    });

    return (
        <div className="w-full flex flex-col items-center py-6">
            {title && (
                <h3 className="text-lg font-bold mb-4 text-center" style={{ color: titleColor }}>
                    {title}
                </h3>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                    <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
                        <defs>
                            {segments.map((seg, i) => (
                                <linearGradient key={`grad-${i}`} id={`pie-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor={seg.color} stopOpacity="1" />
                                    <stop offset="100%" stopColor={seg.color} stopOpacity="0.7" />
                                </linearGradient>
                            ))}
                        </defs>
                        {segments.map((seg, i) => (
                            <path
                                key={i}
                                d={seg.path}
                                fill={`url(#pie-grad-${i})`}
                                className="transition-all duration-300 hover:opacity-80 hover:scale-105"
                                style={{
                                    filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))',
                                    transformOrigin: `${cx}px ${cy}px`,
                                    opacity: animated ? 1 : 0,
                                    transform: animated ? 'scale(1)' : 'scale(0.8)',
                                    transition: `opacity 0.5s ease ${seg.delay}ms, transform 0.5s ease ${seg.delay}ms`,
                                }}
                            />
                        ))}
                        {/* Center text */}
                        <text x={cx} y={cy - 8} textAnchor="middle" className="text-2xl font-bold fill-gray-800">
                            {total}
                        </text>
                        <text x={cx} y={cy + 12} textAnchor="middle" className="text-xs fill-gray-400">
                            Total
                        </text>
                    </svg>
                </div>

                {showLegend && (
                    <div className="flex flex-col gap-2">
                        {segments.map((seg, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2 text-sm transition-all duration-300"
                                style={{
                                    opacity: animated ? 1 : 0,
                                    transform: animated ? 'translateX(0)' : 'translateX(10px)',
                                    transition: `opacity 0.3s ease ${seg.delay + 200}ms, transform 0.3s ease ${seg.delay + 200}ms`,
                                }}
                            >
                                <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: seg.color }} />
                                <span className="text-gray-700">{seg.label}</span>
                                {showPercentage && (
                                    <span className="text-gray-400 font-mono text-xs">{seg.percentage}%</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
