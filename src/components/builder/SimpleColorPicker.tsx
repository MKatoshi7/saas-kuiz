'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Palette, X } from 'lucide-react';

interface SimpleColorPickerProps {
    value: string;
    onChange: (color: string) => void;
}

const PRESET_COLORS = [
    '#000000', '#FFFFFF', '#334155', '#94A3B8',
    '#EF4444', '#F97316', '#F59E0B', '#84CC16',
    '#10B981', '#06B6D4', '#3B82F6', '#6366F1',
    '#8B5CF6', '#D946EF', '#F43F5E', '#2563EB'
];

const STORAGE_KEY = 'quizk_recent_colors';

export function SimpleColorPicker({ value, onChange }: SimpleColorPickerProps) {
    const [localValue, setLocalValue] = useState(value);
    const [recentColors, setRecentColors] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setRecentColors(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse recent colors", e);
            }
        }
    }, []);

    // Close popover when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popoverRef.current &&
                buttonRef.current &&
                !popoverRef.current.contains(event.target as Node) &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setLocalValue(newValue);
        if (/^#[0-9A-F]{6}$/i.test(newValue)) {
            onChange(newValue);
            addToRecent(newValue);
        }
    };

    const handleColorChange = (color: string) => {
        onChange(color);
        setLocalValue(color);
        addToRecent(color);
        setIsOpen(false);
    };

    const addToRecent = (color: string) => {
        if (!recentColors.includes(color)) {
            const newColors = [color, ...recentColors].slice(0, 8);
            setRecentColors(newColors);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newColors));
        }
    };

    return (
        <div className="flex items-center gap-2 relative">
            {/* Color Box Button - Opens Popover */}
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-9 h-9 rounded-md border-2 border-gray-300 shadow-sm hover:border-gray-400 transition-colors relative group flex-shrink-0"
                style={{ backgroundColor: value }}
                title="Escolher cor"
            >
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Palette className="w-4 h-4 text-white drop-shadow-lg" style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))' }} />
                </div>
            </button>

            {/* Hex Input */}
            <input
                type="text"
                value={localValue}
                onChange={handleHexChange}
                className="flex-1 h-9 rounded-md border border-gray-300 px-3 text-sm font-mono uppercase focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={7}
                placeholder="#000000"
            />

            {/* Popover */}
            {isOpen && (
                <div
                    ref={popoverRef}
                    className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                        <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                            <Palette className="w-3.5 h-3.5" />
                            Escolher Cor
                        </h4>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Recent Colors */}
                        {recentColors.length > 0 && (
                            <div className="space-y-2">
                                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                                    Recentes
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {recentColors.map((color, i) => (
                                        <button
                                            key={`recent-${i}`}
                                            type="button"
                                            onClick={() => handleColorChange(color)}
                                            className={`w-8 h-8 rounded-md border-2 hover:scale-110 transition-all flex items-center justify-center ${value === color
                                                    ? 'border-blue-500 ring-2 ring-blue-200 scale-105'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            style={{ backgroundColor: color }}
                                            title={color}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Suggested Colors */}
                        <div className="space-y-2">
                            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                                Sugeridas
                            </span>
                            <div className="grid grid-cols-8 gap-1.5">
                                {PRESET_COLORS.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => handleColorChange(color)}
                                        className={`w-7 h-7 rounded-md border-2 hover:scale-110 transition-all ${value === color
                                                ? 'border-blue-500 ring-2 ring-blue-200 scale-105'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Custom Color Picker */}
                        <div className="space-y-2">
                            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                                Personalizada
                            </span>
                            <div className="relative">
                                <input
                                    type="color"
                                    value={value}
                                    onChange={(e) => {
                                        handleColorChange(e.target.value);
                                    }}
                                    className="w-full h-10 rounded-md cursor-pointer border-2 border-gray-200"
                                    style={{ padding: '2px' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
