'use client';

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { ChevronDown, Bookmark, BookmarkCheck, X } from 'lucide-react';
import { MiniToolbar, MiniToolbarStyle } from './MiniToolbar';
import { Label } from '@/components/ui/label';
import { resolveFontFamily } from '@/lib/fonts';

// ─── Presets ────────────────────────────────────────────────────────

export interface TextStylePreset {
    id: string;
    name: string;
    style: MiniToolbarStyle;
}

const DEFAULT_PRESETS: TextStylePreset[] = [
    { id: 'headline-lg', name: 'Headline Grande', style: { fontSize: 32, fontFamily: 'Inter', fontWeight: 700, bold: true, lineHeight: 1.2, letterSpacing: -0.5, textTransform: 'none' } },
    { id: 'headline-md', name: 'Headline Médio', style: { fontSize: 24, fontFamily: 'Inter', fontWeight: 700, bold: true, lineHeight: 1.3, letterSpacing: -0.3, textTransform: 'none' } },
    { id: 'subtitle', name: 'Subtítulo', style: { fontSize: 18, fontFamily: 'Inter', fontWeight: 400, lineHeight: 1.4, letterSpacing: 0, textTransform: 'none' } },
    { id: 'body', name: 'Corpo', style: { fontSize: 16, fontFamily: 'Inter', fontWeight: 400, lineHeight: 1.5, letterSpacing: 0, textTransform: 'none' } },
    { id: 'caption', name: 'Legenda', style: { fontSize: 13, fontFamily: 'Inter', fontWeight: 400, lineHeight: 1.4, letterSpacing: 0.2, textTransform: 'none' } },
    { id: 'button', name: 'Botão', style: { fontSize: 16, fontFamily: 'Inter', fontWeight: 600, lineHeight: 1, letterSpacing: 0.5, textTransform: 'uppercase' } },
    { id: 'quote', name: 'Citação', style: { fontSize: 18, fontFamily: 'Playfair Display', fontWeight: 400, italic: true, lineHeight: 1.5, letterSpacing: 0, textTransform: 'none' } },
    { id: 'hero-title', name: 'Título Hero', style: { fontSize: 40, fontFamily: 'Montserrat', fontWeight: 700, bold: true, lineHeight: 1.1, letterSpacing: -1, textTransform: 'none' } },
];

const PRESETS_KEY = 'kuiz-text-style-presets';

function loadPresets(): TextStylePreset[] {
    if (typeof window === 'undefined') return DEFAULT_PRESETS;
    try {
        const stored = localStorage.getItem(PRESETS_KEY);
        if (stored) return [...DEFAULT_PRESETS, ...JSON.parse(stored)];
    } catch {}
    return DEFAULT_PRESETS;
}

function saveCustomPresets(presets: TextStylePreset[]) {
    const customs = presets.filter(p => !DEFAULT_PRESETS.find(d => d.id === p.id));
    localStorage.setItem(PRESETS_KEY, JSON.stringify(customs));
}

// ─── Recent Colors ──────────────────────────────────────────────────

const COLORS_KEY = 'kuiz-recent-colors';
const MAX_RECENT_COLORS = 10;

export function loadRecentColors(): string[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(COLORS_KEY) || '[]');
    } catch { return []; }
}

export function saveRecentColor(color: string) {
    const colors = loadRecentColors().filter(c => c !== color);
    colors.unshift(color);
    if (colors.length > MAX_RECENT_COLORS) colors.pop();
    localStorage.setItem(COLORS_KEY, JSON.stringify(colors));
}

// ─── RichTextField Props ────────────────────────────────────────────

interface RichTextFieldProps {
    label?: string;
    value?: string;
    htmlValue?: string;
    style?: MiniToolbarStyle;
    onUpdate: (text: string, html: string, style?: MiniToolbarStyle) => void;
    minHeight?: number;
    placeholder?: string;
    className?: string;
    multiline?: boolean;
    showPresets?: boolean;
    showRecentColors?: boolean;
    compact?: boolean;
}

// ─── Component ──────────────────────────────────────────────────────

export function RichTextField({
    label,
    value,
    htmlValue,
    style,
    onUpdate,
    minHeight = 40,
    placeholder = 'Digite aqui...',
    className = '',
    multiline = true,
    showPresets = true,
    showRecentColors = true,
    compact = false,
}: RichTextFieldProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [presets, setPresets] = useState<TextStylePreset[]>(DEFAULT_PRESETS);
    const [recentColors, setRecentColors] = useState<string[]>([]);
    const [showPresetPicker, setShowPresetPicker] = useState(false);
    const [newPresetName, setNewPresetName] = useState('');
    const [isSavingPreset, setIsSavingPreset] = useState(false);

    useEffect(() => {
        setPresets(loadPresets());
        setRecentColors(loadRecentColors());
    }, []);

    const handleBlur = useCallback(() => {
        if (!ref.current) return;
        const html = ref.current.innerHTML;
        const text = ref.current.innerText;
        onUpdate(text, html);
    }, [onUpdate]);

    const handleStyleUpdate = useCallback((newStyle: MiniToolbarStyle) => {
        // Track color in recent colors
        if (newStyle.color) {
            saveRecentColor(newStyle.color);
            setRecentColors(loadRecentColors());
        }
        onUpdate(value || '', htmlValue || '', newStyle);
    }, [value, htmlValue, onUpdate]);

    const applyPreset = useCallback((preset: TextStylePreset) => {
        onUpdate(value || '', htmlValue || '', { ...style, ...preset.style });
        setShowPresetPicker(false);
    }, [value, htmlValue, style, onUpdate]);

    const saveAsPreset = useCallback(() => {
        if (!newPresetName.trim() || !style) return;
        const preset: TextStylePreset = {
            id: `custom-${Date.now()}`,
            name: newPresetName.trim(),
            style,
        };
        const updated = [...presets, preset];
        setPresets(updated);
        saveCustomPresets(updated);
        setNewPresetName('');
        setIsSavingPreset(false);
    }, [newPresetName, style, presets]);

    const deletePreset = useCallback((id: string) => {
        if (DEFAULT_PRESETS.find(p => p.id === id)) return;
        const updated = presets.filter(p => p.id !== id);
        setPresets(updated);
        saveCustomPresets(updated);
    }, [presets]);

    const insertColorToContentEditable = useCallback((color: string) => {
        requestAnimationFrame(() => {
            document.execCommand('foreColor', false, color);
        });
        saveRecentColor(color);
        setRecentColors(loadRecentColors());
    }, []);

    return (
        <div className={`space-y-1 ${className}`}>
            {label && <Label className="text-xs font-semibold text-gray-700">{label}</Label>}

            {/* Toolbar + Presets */}
            <div className="flex items-start gap-1">
                <div className="flex-1">
                    <MiniToolbar
                        style={style}
                        onStyleUpdate={handleStyleUpdate}
                        label={compact ? undefined : 'Estilo'}
                        showSize={!compact}
                        showFont={!compact}
                        showSpacing={!compact}
                    />
                </div>

                {/* Preset picker button */}
                {showPresets && (
                    <div className="relative">
                        <button
                            onClick={() => setShowPresetPicker(!showPresetPicker)}
                            className="h-8 px-2 flex items-center gap-1 text-[11px] text-gray-600 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                            title="Presets de estilo"
                        >
                            <Bookmark className="w-3.5 h-3.5" />
                            <ChevronDown className="w-3 h-3" />
                        </button>

                        {showPresetPicker && (
                            <div className="absolute top-9 right-0 z-50 w-56 bg-white border border-gray-200 rounded-xl shadow-xl p-2 space-y-1">
                                <div className="text-[10px] text-gray-400 font-medium px-2 py-1">Presets</div>
                                {presets.map(preset => (
                                    <div key={preset.id} className="flex items-center group">
                                        <button
                                            onClick={() => applyPreset(preset)}
                                            className="flex-1 text-left px-2 py-1.5 text-xs hover:bg-blue-50 rounded-lg flex items-center gap-2"
                                        >
                                            <span className="font-medium truncate">{preset.name}</span>
                                            <span className="text-[10px] text-gray-400">
                                                {preset.style.fontSize}px
                                            </span>
                                        </button>
                                        {!DEFAULT_PRESETS.find(d => d.id === preset.id) && (
                                            <button
                                                onClick={() => deletePreset(preset.id)}
                                                className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <div className="border-t border-gray-100 pt-1 mt-1">
                                    {isSavingPreset ? (
                                        <div className="flex items-center gap-1 px-1">
                                            <input
                                                type="text"
                                                value={newPresetName}
                                                onChange={(e) => setNewPresetName(e.target.value)}
                                                placeholder="Nome do preset"
                                                className="flex-1 h-7 text-xs border border-gray-200 rounded px-2"
                                                onKeyDown={(e) => e.key === 'Enter' && saveAsPreset()}
                                                autoFocus
                                            />
                                            <button onClick={saveAsPreset} className="h-7 px-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700">OK</button>
                                            <button onClick={() => setIsSavingPreset(false)} className="h-7 px-1 text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setIsSavingPreset(true)}
                                            className="w-full text-left px-2 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-2"
                                        >
                                            <BookmarkCheck className="w-3.5 h-3.5" />
                                            Salvar estilo atual como preset
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Recent Colors */}
            {showRecentColors && recentColors.length > 0 && (
                <div className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-400 mr-1">Cores:</span>
                    {recentColors.map((color) => (
                        <button
                            key={color}
                            onClick={() => insertColorToContentEditable(color)}
                            className="w-5 h-5 rounded-full border-2 border-white shadow-sm hover:scale-125 transition-transform"
                            style={{ backgroundColor: color }}
                            title={color}
                        />
                    ))}
                </div>
            )}

            {/* ContentEditable div */}
            <div
                ref={ref}
                contentEditable
                suppressContentEditableWarning
                onBlur={handleBlur}
                className="p-3 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all whitespace-pre-wrap"
                style={{
                    minHeight: `${minHeight}px`,
                    fontSize: style?.fontSize ? `${style.fontSize}px` : undefined,
                    fontFamily: resolveFontFamily(style?.fontFamily),
                    fontWeight: style?.fontWeight || (style?.bold ? 700 : undefined),
                    lineHeight: style?.lineHeight,
                    letterSpacing: style?.letterSpacing ? `${style.letterSpacing}px` : undefined,
                    textTransform: style?.textTransform as any,
                }}
                data-placeholder={placeholder}
                dangerouslySetInnerHTML={{ __html: htmlValue || value || '' }}
            />
        </div>
    );
}
