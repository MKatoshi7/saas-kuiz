'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, Type, ChevronDown } from 'lucide-react';
import { loadRecentColors, saveRecentColor } from './RichTextField';

const FONT_OPTIONS = [
    'Inter', 'Bebas Neue', 'Montserrat', 'Poppins', 'Oswald',
    'Raleway', 'Lato', 'Playfair Display', 'Roboto', 'Open Sans',
];

const PREDEFINED_COLORS = [
    // Neutrals
    '#111827', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#F3F4F6',
    // Brand
    '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD',
    // Success
    '#059669', '#10B981', '#34D399',
    // Warning
    '#D97706', '#F59E0B', '#FCD34D',
    // Danger
    '#DC2626', '#EF4444', '#F87171',
    // Purple
    '#7C3AED', '#8B5CF6', '#A78BFA',
    // Pink
    '#DB2777', '#EC4899', '#F472B6',
    // Teal
    '#0D9488', '#14B8A6', '#5EEAD4',
];

export interface MiniToolbarStyle {
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    align?: 'left' | 'center' | 'right';
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    letterSpacing?: number;
    lineHeight?: number;
}

interface MiniToolbarProps {
    style?: MiniToolbarStyle;
    onStyleUpdate: (s: MiniToolbarStyle) => void;
    label?: string;
    showSize?: boolean;
    showFont?: boolean;
    showSpacing?: boolean;
    recentColors?: string[];
    onColorChange?: (color: string) => void;
}

export function MiniToolbar({
    style,
    onStyleUpdate,
    label,
    showSize = true,
    showFont = true,
    showSpacing = true,
    recentColors: recentColorsProp,
    onColorChange,
}: MiniToolbarProps) {
    const [recentColors, setRecentColors] = useState<string[]>([]);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [customColor, setCustomColor] = useState(style?.color || '#111827');

    useEffect(() => {
        setRecentColors(loadRecentColors());
    }, []);

    const execOnContentEditable = useCallback((command: string, value?: string) => {
        document.execCommand(command, false, value);
    }, []);

    const applyColor = useCallback((color: string) => {
        execOnContentEditable('foreColor', color);
        onStyleUpdate({ ...style, color });
        saveRecentColor(color);
        setRecentColors(loadRecentColors());
        onColorChange?.(color);
    }, [style, onStyleUpdate, onColorChange, execOnContentEditable]);

    const allRecentColors = recentColorsProp || recentColors;

    return (
        <div className="border border-gray-200 rounded-lg p-1.5 bg-gray-50 space-y-1.5">
            {label && <div className="text-[10px] text-gray-400 font-medium px-1">{label}</div>}
            <div className="flex flex-wrap items-center gap-0.5">
                <button
                    onClick={() => execOnContentEditable('bold')}
                    onMouseDown={(e) => e.preventDefault()}
                    className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${style?.bold ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
                    title="Negrito"
                >
                    <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={() => execOnContentEditable('italic')}
                    onMouseDown={(e) => e.preventDefault()}
                    className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${style?.italic ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
                    title="Itálico"
                >
                    <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={() => execOnContentEditable('underline')}
                    onMouseDown={(e) => e.preventDefault()}
                    className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${style?.underline ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
                    title="Sublinhado"
                >
                    <Underline className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={() => execOnContentEditable('strikeThrough')}
                    onMouseDown={(e) => e.preventDefault()}
                    className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${style?.strikethrough ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
                    title="Tachado"
                >
                    <Strikethrough className="w-3.5 h-3.5" />
                </button>

                <div className="w-px h-5 bg-gray-300 mx-0.5" />

                {/* Color picker with palette */}
                <div className="relative">
                    <button
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        onMouseDown={(e) => e.preventDefault()}
                        className="flex flex-col items-center p-1 hover:bg-gray-200 rounded cursor-pointer"
                        title="Cor do Texto"
                    >
                        <Type className="w-3.5 h-3.5 text-gray-600" />
                        <div className="w-5 h-1.5 rounded-sm mt-0.5 border border-gray-300" style={{ backgroundColor: style?.color || '#111827' }} />
                    </button>

                    {showColorPicker && (
                        <div className="absolute top-10 left-0 z-50 w-64 bg-white border border-gray-200 rounded-xl shadow-xl p-3 space-y-3">
                            {/* Predefined colors */}
                            <div>
                                <div className="text-[10px] text-gray-400 font-medium mb-1.5">Cores Predefinidas</div>
                                <div className="grid grid-cols-9 gap-1.5">
                                    {PREDEFINED_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => applyColor(color)}
                                            onMouseDown={(e) => e.preventDefault()}
                                            className={`w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform ${style?.color === color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-white shadow-sm'}`}
                                            style={{ backgroundColor: color }}
                                            title={color}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Recent colors */}
                            {allRecentColors.length > 0 && (
                                <div>
                                    <div className="text-[10px] text-gray-400 font-medium mb-1.5">Últimas Cores</div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {allRecentColors.slice(0, 12).map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => applyColor(color)}
                                                onMouseDown={(e) => e.preventDefault()}
                                                className={`w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform ${style?.color === color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-white shadow-sm'}`}
                                                style={{ backgroundColor: color }}
                                                title={color}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Custom color */}
                            <div className="border-t border-gray-100 pt-2">
                                <div className="text-[10px] text-gray-400 font-medium mb-1.5">Cor Personalizada</div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={customColor}
                                        onChange={(e) => setCustomColor(e.target.value)}
                                        className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={customColor}
                                        onChange={(e) => setCustomColor(e.target.value)}
                                        className="flex-1 h-8 text-xs border border-gray-200 rounded-lg px-2 font-mono"
                                        placeholder="#000000"
                                    />
                                    <button
                                        onClick={() => applyColor(customColor)}
                                        onMouseDown={(e) => e.preventDefault()}
                                        className="h-8 px-3 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                    >
                                        Aplicar
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowColorPicker(false)}
                                className="w-full text-[10px] text-gray-400 hover:text-gray-600 text-center"
                            >
                                Fechar
                            </button>
                        </div>
                    )}
                </div>

                <div className="w-px h-5 bg-gray-300 mx-0.5" />

                {[
                    { cmd: 'justifyLeft', icon: AlignLeft, label: 'Esquerda' },
                    { cmd: 'justifyCenter', icon: AlignCenter, label: 'Centro' },
                    { cmd: 'justifyRight', icon: AlignRight, label: 'Direita' },
                ].map(({ cmd, icon: Icon, label }) => (
                    <button
                        key={cmd}
                        onClick={() => execOnContentEditable(cmd)}
                        onMouseDown={(e) => e.preventDefault()}
                        className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600"
                        title={label}
                    >
                        <Icon className="w-3.5 h-3.5" />
                    </button>
                ))}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
                {showSize && (
                    <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-500">Tam:</span>
                        <input
                            type="number"
                            min="8"
                            max="72"
                            value={style?.fontSize || 16}
                            onChange={(e) => onStyleUpdate({ ...style, fontSize: parseInt(e.target.value) || 16 })}
                            className="w-14 h-7 text-center text-xs border border-gray-200 rounded px-1"
                        />
                        <span className="text-[10px] text-gray-400">px</span>
                    </div>
                )}

                {showFont && (
                    <select
                        value={style?.fontFamily || 'Inter'}
                        onChange={(e) => onStyleUpdate({ ...style, fontFamily: e.target.value })}
                        className="h-7 text-xs border border-gray-200 rounded px-1.5 bg-white max-w-[120px]"
                    >
                        {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                )}

                <select
                    value={style?.textTransform || 'none'}
                    onChange={(e) => onStyleUpdate({ ...style, textTransform: e.target.value as any })}
                    className="h-7 text-xs border border-gray-200 rounded px-1.5 bg-white"
                >
                    <option value="none">Normal</option>
                    <option value="uppercase">MAIÚSC.</option>
                    <option value="lowercase">minúsc.</option>
                    <option value="capitalize">Capitalizar</option>
                </select>

                {showSpacing && (
                    <>
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] text-gray-500">Esp:</span>
                            <input
                                type="number"
                                min="-2"
                                max="10"
                                step="0.5"
                                value={style?.letterSpacing || 0}
                                onChange={(e) => onStyleUpdate({ ...style, letterSpacing: parseFloat(e.target.value) || 0 })}
                                className="w-12 h-7 text-center text-xs border border-gray-200 rounded px-1"
                            />
                        </div>

                        <div className="flex items-center gap-1">
                            <span className="text-[10px] text-gray-500">Alt:</span>
                            <input
                                type="number"
                                min="0.8"
                                max="3"
                                step="0.1"
                                value={style?.lineHeight || 1.5}
                                onChange={(e) => onStyleUpdate({ ...style, lineHeight: parseFloat(e.target.value) || 1.5 })}
                                className="w-12 h-7 text-center text-xs border border-gray-200 rounded px-1"
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
