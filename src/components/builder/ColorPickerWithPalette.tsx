'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Palette } from 'lucide-react';

interface ColorPickerWithPaletteProps {
    value: string;
    onChange: (color: string) => void;
    label?: string;
}

const PRESET_COLORS = [
    '#000000', '#FFFFFF', '#334155', '#94A3B8',
    '#EF4444', '#F97316', '#F59E0B', '#84CC16',
    '#10B981', '#06B6D4', '#3B82F6', '#6366F1',
    '#8B5CF6', '#D946EF', '#F43F5E', '#2563EB'
];

const STORAGE_KEY = 'quizk_recent_colors';

export function ColorPickerWithPalette({ value, onChange, label }: ColorPickerWithPaletteProps) {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setLocalValue(newValue);
        if (/^#[0-9A-F]{6}$/i.test(newValue)) {
            onChange(newValue);
        }
    };

    return (
        <div className="space-y-3">
            {label && (
                <label className="text-xs font-medium text-gray-700 block">{label}</label>
            )}

            <div className="flex items-center gap-2">
                <div className="relative">
                    <div
                        className="w-10 h-10 rounded-lg border border-gray-200 shadow-sm"
                        style={{ backgroundColor: value }}
                    />
                    <input
                        type="color"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                </div>
                <input
                    type="text"
                    value={localValue}
                    onChange={handleHexChange}
                    className="flex-1 h-10 rounded-md border border-gray-300 px-3 text-sm font-mono uppercase focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={7}
                />
            </div>

            <div className="space-y-1.5">
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Cores Sugeridas</span>
                <div className="grid grid-cols-8 gap-1.5">
                    {PRESET_COLORS.map((color) => (
                        <button
                            key={color}
                            type="button"
                            onClick={() => onChange(color)}
                            className={`w-6 h-6 rounded-md border hover:scale-110 transition-transform ${value === color ? 'border-blue-500 ring-2 ring-blue-200 z-10' : 'border-gray-200'
                                }`}
                            style={{ backgroundColor: color }}
                            title={color}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
