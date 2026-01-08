'use client';

import React from 'react';
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Type,
    Minus,
    Plus,
    RemoveFormatting,
    Check,
    ChevronDown
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface TextStyleToolbarProps {
    data: any;
    onUpdate: (field: string, value: any) => void;
    showAlignment?: boolean;
    showFontSize?: boolean;
    showLetterSpacing?: boolean;
    showLineHeight?: boolean;
    showTextTransform?: boolean;
    showFontFamily?: boolean;
}

export function TextStyleToolbar({
    data,
    onUpdate,
    showAlignment = true,
    showFontSize = true,
    showLetterSpacing = false,
    showLineHeight = false,
    showTextTransform = false,
    showFontFamily = false
}: TextStyleToolbarProps) {
    // Safety check for data
    if (!data) {
        return null;
    }

    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showBgColorPicker, setShowBgColorPicker] = useState(false);
    const [recentColors, setRecentColors] = useState<string[]>([]);
    const colorPickerRef = useRef<HTMLDivElement>(null);
    const bgColorPickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const saved = localStorage.getItem('quizk_recent_colors');
        if (saved) {
            try {
                setRecentColors(JSON.parse(saved));
            } catch (e) {
                console.error('Error parsing recent colors', e);
            }
        }

        // Click outside to close
        const handleClickOutside = (event: MouseEvent) => {
            if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
                setShowColorPicker(false);
            }
            if (bgColorPickerRef.current && !bgColorPickerRef.current.contains(event.target as Node)) {
                setShowBgColorPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleColorSelect = (color: string) => {
        onUpdate('color', color);
        if (!recentColors.includes(color)) {
            const newColors = [color, ...recentColors].slice(0, 8); // Keep last 8
            setRecentColors(newColors);
            localStorage.setItem('quizk_recent_colors', JSON.stringify(newColors));
        }
        setShowColorPicker(false);
    };

    const handleBgColorSelect = (color: string) => {
        onUpdate('backgroundColor', color);
        if (color !== 'transparent' && !recentColors.includes(color)) {
            const newColors = [color, ...recentColors].slice(0, 8); // Keep last 8
            setRecentColors(newColors);
            localStorage.setItem('quizk_recent_colors', JSON.stringify(newColors));
        }
        setShowBgColorPicker(false);
    };

    const presetColors = [
        '#000000', '#4B5563', '#9CA3AF', '#FFFFFF',
        '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
        '#6366F1', '#8B5CF6', '#EC4899'
    ];

    // Tamanho de fonte em pixels
    const fontSize = data.fontSizePixels || 16;

    const alignments = [
        { value: 'left', icon: AlignLeft, label: 'Esquerda' },
        { value: 'center', icon: AlignCenter, label: 'Centro' },
        { value: 'right', icon: AlignRight, label: 'Direita' },
        { value: 'justify', icon: AlignJustify, label: 'Justificar' }
    ];

    return (
        <div className="space-y-3">
            {/* Main Toolbar - Formatting */}
            <div className="border border-gray-300 rounded-lg p-2 bg-gray-50">
                <div className="flex flex-wrap items-center gap-1">
                    {/* Bold */}
                    <button
                        onClick={() => onUpdate('bold', !data.bold)}
                        className={`p-2 rounded hover:bg-gray-200 transition-colors ${data.bold ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
                            }`}
                        title="Negrito (Ctrl+B)"
                    >
                        <Bold className="w-4 h-4" />
                    </button>

                    {/* Italic */}
                    <button
                        onClick={() => onUpdate('italic', !data.italic)}
                        className={`p-2 rounded hover:bg-gray-200 transition-colors ${data.italic ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
                            }`}
                        title="Itálico (Ctrl+I)"
                    >
                        <Italic className="w-4 h-4" />
                    </button>

                    {/* Underline */}
                    <button
                        onClick={() => onUpdate('underline', !data.underline)}
                        className={`p-2 rounded hover:bg-gray-200 transition-colors ${data.underline ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
                            }`}
                        title="Sublinhado (Ctrl+U)"
                    >
                        <Underline className="w-4 h-4" />
                    </button>

                    {/* Strikethrough */}
                    <button
                        onClick={() => onUpdate('strikethrough', !data.strikethrough)}
                        className={`p-2 rounded hover:bg-gray-200 transition-colors ${data.strikethrough ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
                            }`}
                        title="Tachado"
                    >
                        <Strikethrough className="w-4 h-4" />
                    </button>

                    <div className="w-px h-6 bg-gray-300 mx-1" />

                    {/* Font Size Dropdown */}
                    {showFontSize && (
                        <select
                            value={data.fontSize || 'medium'}
                            onChange={(e) => onUpdate('fontSize', e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            title="Tamanho"
                        >
                            <option value="small">Pequeno</option>
                            <option value="normal">Normal</option>
                            <option value="medium">Médio</option>
                            <option value="big">Grande</option>
                            <option value="bigger">Muito Grande</option>
                            <option value="huge">Gigante</option>
                        </select>
                    )}

                    <div className="w-px h-6 bg-gray-300 mx-1" />

                    {/* Text Color with Palette */}
                    <div className="relative" ref={colorPickerRef}>
                        <button
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            className="flex flex-col items-center p-1 hover:bg-gray-200 rounded cursor-pointer relative"
                            title="Cor do Texto"
                        >
                            <Type className="w-4 h-4 text-gray-700" />
                            <div
                                className="w-6 h-1.5 rounded-sm mt-0.5 border border-gray-300"
                                style={{ backgroundColor: data.color || '#000000' }}
                            />
                        </button>

                        {showColorPicker && (
                            <div className="absolute top-full right-0 mt-2 p-3 bg-white rounded-lg shadow-xl border border-gray-200 w-48 z-50 origin-top-right">
                                <div className="mb-2">
                                    <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Recentes</div>
                                    <div className="flex flex-wrap gap-1">
                                        {recentColors.length > 0 ? recentColors.map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => handleColorSelect(c)}
                                                className="w-5 h-5 rounded border border-gray-200 hover:scale-110 transition-transform"
                                                style={{ backgroundColor: c }}
                                                title={c}
                                            />
                                        )) : (
                                            <span className="text-xs text-gray-400 italic">Nenhuma cor recente</span>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-2">
                                    <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Padrão</div>
                                    <div className="flex flex-wrap gap-1">
                                        {presetColors.map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => handleColorSelect(c)}
                                                className="w-5 h-5 rounded border border-gray-200 hover:scale-110 transition-transform"
                                                style={{ backgroundColor: c }}
                                                title={c}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded border border-gray-200" style={{ backgroundColor: data.color || '#000000' }} />
                                        <input
                                            type="text"
                                            value={data.color || '#000000'}
                                            onChange={(e) => onUpdate('color', e.target.value)}
                                            className="flex-1 text-xs border border-gray-300 rounded px-1 py-1"
                                        />
                                        <input
                                            type="color"
                                            value={data.color || '#000000'}
                                            onChange={(e) => handleColorSelect(e.target.value)}
                                            className="w-6 h-6 p-0 border-0 rounded cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Background Color with Palette */}
                    <div className="relative" ref={bgColorPickerRef}>
                        <button
                            onClick={() => setShowBgColorPicker(!showBgColorPicker)}
                            className="flex items-center justify-center p-2 hover:bg-gray-200 rounded cursor-pointer relative"
                            title="Cor de Fundo"
                        >
                            <div
                                className="w-4 h-4 rounded border border-gray-300"
                                style={{ backgroundColor: data.backgroundColor || '#ffffff' }}
                            />
                        </button>

                        {showBgColorPicker && (
                            <div className="absolute top-full right-0 mt-2 p-3 bg-white rounded-lg shadow-xl border border-gray-200 w-48 z-50 origin-top-right">
                                <div className="mb-2">
                                    <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Recentes</div>
                                    <div className="flex flex-wrap gap-1">
                                        {recentColors.length > 0 ? recentColors.map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => handleBgColorSelect(c)}
                                                className="w-5 h-5 rounded border border-gray-200 hover:scale-110 transition-transform"
                                                style={{ backgroundColor: c }}
                                                title={c}
                                            />
                                        )) : (
                                            <span className="text-xs text-gray-400 italic">Nenhuma cor recente</span>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-2">
                                    <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Padrão</div>
                                    <div className="flex flex-wrap gap-1">
                                        <button
                                            onClick={() => handleBgColorSelect('transparent')}
                                            className="w-5 h-5 rounded border border-gray-200 hover:scale-110 transition-transform bg-white flex items-center justify-center"
                                            title="Transparente"
                                        >
                                            <div className="w-full h-[1px] bg-red-500 rotate-45" />
                                        </button>
                                        {presetColors.map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => handleBgColorSelect(c)}
                                                className="w-5 h-5 rounded border border-gray-200 hover:scale-110 transition-transform"
                                                style={{ backgroundColor: c }}
                                                title={c}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded border border-gray-200" style={{ backgroundColor: data.backgroundColor || '#ffffff' }} />
                                        <input
                                            type="text"
                                            value={data.backgroundColor || '#ffffff'}
                                            onChange={(e) => onUpdate('backgroundColor', e.target.value)}
                                            className="flex-1 text-xs border border-gray-300 rounded px-1 py-1"
                                        />
                                        <input
                                            type="color"
                                            value={data.backgroundColor || '#ffffff'}
                                            onChange={(e) => handleBgColorSelect(e.target.value)}
                                            className="w-6 h-6 p-0 border-0 rounded cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {showAlignment && (
                        <>
                            <div className="w-px h-6 bg-gray-300 mx-1" />

                            {/* Alignment Buttons */}
                            {alignments.map(({ value, icon: Icon, label }) => (
                                <button
                                    key={value}
                                    onClick={() => onUpdate('align', value)}
                                    className={`p-2 rounded hover:bg-gray-200 transition-colors ${data.align === value ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
                                        }`}
                                    title={label}
                                >
                                    <Icon className="w-4 h-4" />
                                </button>
                            ))}
                        </>
                    )}

                    <div className="w-px h-6 bg-gray-300 mx-1" />

                    {/* Clear Formatting */}
                    <button
                        onClick={() => {
                            onUpdate('bold', false);
                            onUpdate('italic', false);
                            onUpdate('underline', false);
                            onUpdate('strikethrough', false);
                            onUpdate('color', '#000000');
                            onUpdate('backgroundColor', 'transparent');
                            onUpdate('fontSize', 'medium');
                            onUpdate('fontSizePixels', 16);
                            onUpdate('align', 'left');
                        }}
                        className="p-2 rounded hover:bg-gray-200 transition-colors text-red-600 hover:bg-red-50"
                        title="Limpar Formatação"
                    >
                        <RemoveFormatting className="w-4 h-4" />
                    </button>
                </div>
            </div>


        </div>
    );
}
