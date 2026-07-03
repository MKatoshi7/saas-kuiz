'use client';

import React, { useCallback } from 'react';
import { Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, Type } from 'lucide-react';

const FONT_OPTIONS = [
    'Inter', 'Arial', 'Helvetica', 'Times New Roman', 'Georgia',
    'Courier New', 'Verdana', 'Roboto', 'Open Sans', 'Lato',
    'Montserrat', 'Poppins', 'Oswald', 'Raleway', 'Nunito',
    'Source Sans Pro', 'Ubuntu', 'Playfair Display', 'Merriweather', 'PT Sans'
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
    recentColors,
    onColorChange,
}: MiniToolbarProps) {
    const execOnContentEditable = useCallback((command: string, value?: string) => {
        document.execCommand(command, false, value);
    }, []);

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

                <div className="relative">
                    <input
                        type="color"
                        value={style?.color || '#111827'}
                        onChange={(e) => {
                            execOnContentEditable('foreColor', e.target.value);
                            onColorChange?.(e.target.value);
                        }}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        title="Cor do Texto"
                    />
                    <div className="flex flex-col items-center p-1 hover:bg-gray-200 rounded cursor-pointer">
                        <Type className="w-3.5 h-3.5 text-gray-600" />
                        <div className="w-5 h-1 rounded-sm mt-0.5 border border-gray-300" style={{ backgroundColor: style?.color || '#111827' }} />
                    </div>
                </div>

                {recentColors && recentColors.length > 0 && (
                    <>
                        <div className="w-px h-5 bg-gray-300 mx-0.5" />
                        <div className="flex items-center gap-0.5">
                            {recentColors.slice(0, 6).map((color) => (
                                <button
                                    key={color}
                                    onClick={() => {
                                        execOnContentEditable('foreColor', color);
                                        onColorChange?.(color);
                                    }}
                                    onMouseDown={(e) => e.preventDefault()}
                                    className="w-4 h-4 rounded-full border border-gray-300 hover:scale-125 transition-transform"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                        </div>
                    </>
                )}

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
                        className="h-7 text-xs border border-gray-200 rounded px-1.5 bg-white max-w-[100px]"
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
