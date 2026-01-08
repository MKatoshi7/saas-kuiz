import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    Heading1, Heading2, Type, AlignLeft, AlignCenter, AlignRight, Palette, ChevronDown, Check, Highlighter
} from "lucide-react";
import { useBuilderStore } from '@/store/builderStore';

interface ToolbarProps {
    currentData: any;
    onUpdate: (key: string, value: any) => void;
    isVisible: boolean;
    className?: string;
    anchorRef?: React.RefObject<HTMLElement>;
}

const PRESET_COLORS = [
    '#000000', '#FFFFFF', '#334155', '#94A3B8',
    '#EF4444', '#F97316', '#F59E0B', '#84CC16',
    '#10B981', '#06B6D4', '#3B82F6', '#6366F1',
    '#8B5CF6', '#D946EF', '#F43F5E', '#881337'
];

const HIGHLIGHT_COLORS = [
    '#FEF3C7', '#FED7AA', '#FBCFE8',
    '#DBEAFE', '#D1FAE5', '#FDE68A',
    'transparent'
];

const STORAGE_KEY = 'quizk_recent_colors';

export function TextToolbar({ currentData, onUpdate, isVisible, className, anchorRef }: ToolbarProps) {
    const [showPalette, setShowPalette] = useState(false);
    const [recentColors, setRecentColors] = useState<string[]>([]);
    const paletteRef = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState({ top: 0, left: 0 });

    // Get theme primary color
    const theme = useBuilderStore((state) => state.theme);
    const primaryColor = theme?.primaryColor || '#2563EB';

    // Load recent colors and listen for storage changes
    useEffect(() => {
        const loadColors = () => {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    setRecentColors(JSON.parse(saved));
                } catch (e) {
                    console.error("Failed to parse recent colors", e);
                }
            }
        };

        loadColors();

        // Listen for storage changes from other components
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) {
                loadColors();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Handle click outside to close palette
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (paletteRef.current && !paletteRef.current.contains(event.target as Node)) {
                setShowPalette(false);
            }
        };

        if (showPalette) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showPalette]);

    // Update position if anchorRef is provided
    useEffect(() => {
        if (!anchorRef?.current || !isVisible) return;

        const updatePosition = () => {
            if (anchorRef.current) {
                const rect = anchorRef.current.getBoundingClientRect();
                setCoords({
                    top: rect.top - 8, // 8px padding above
                    left: rect.left
                });
            }
        };

        updatePosition();
        // Capture phase to handle all scrolling in parent containers
        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);

        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [anchorRef, isVisible]);

    if (!isVisible) return null;

    const handleColorChange = (color: string) => {
        // Check if there is a text selection within the editor
        const selection = window.getSelection();
        const hasSelection = selection && selection.rangeCount > 0 && !selection.isCollapsed;

        if (hasSelection) {
            // Apply color to selected text
            // Ensure we are focusing the editor before applying
            const editor = selection.anchorNode?.parentElement?.closest('[contenteditable="true"]') as HTMLElement;
            if (editor) {
                editor.focus();
                document.execCommand('foreColor', false, color);
            } else {
                document.execCommand('foreColor', false, color);
            }
        } else {
            // No selection, apply to entire component
            onUpdate('color', color);
        }

        // Add to recent colors if not already present
        if (!recentColors.includes(color)) {
            const newColors = [color, ...recentColors].slice(0, 6);
            setRecentColors(newColors);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newColors));
        }
        // Close palette after selection
        setShowPalette(false);
    };

    const handleHighlightChange = (color: string) => {
        const selection = window.getSelection();
        const hasSelection = selection && selection.rangeCount > 0 && !selection.isCollapsed;

        if (hasSelection) {
            const editor = selection.anchorNode?.parentElement?.closest('[contenteditable="true"]') as HTMLElement;
            if (editor) {
                editor.focus();
            }
            document.execCommand('hiliteColor', false, color);
        } else {
            document.execCommand('hiliteColor', false, color);
        }
        setShowPalette(false);
    };

    const currentColor = currentData.color || '#000000';

    const toolbarContent = (
        <div
            className={`flex flex-col items-start gap-1 bg-slate-900 text-white p-1.5 rounded-lg shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200 border border-slate-700 pointer-events-auto ${anchorRef ? 'fixed z-[9999]' : `absolute z-[9999] ${className || '-top-16 left-0'}`
                }`}
            style={anchorRef ? {
                top: coords.top,
                left: coords.left,
                transform: 'translateY(-100%)'
            } : undefined}
        >

            <div className="flex items-center gap-2">
                {/* Tag Selector */}
                <div className="flex bg-slate-800 rounded overflow-hidden">
                    <button
                        onClick={(e) => { e.stopPropagation(); onUpdate('tag', 'h1'); }}
                        className={`p-1.5 hover:bg-slate-700 ${currentData.tag === 'h1' ? 'text-blue-400 bg-slate-700' : 'text-gray-400'}`}
                        title="Título Principal (H1)"
                    >
                        <Heading1 size={16} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onUpdate('tag', 'h2'); }}
                        className={`p-1.5 hover:bg-slate-700 ${currentData.tag === 'h2' ? 'text-blue-400 bg-slate-700' : 'text-gray-400'}`}
                        title="Subtítulo (H2)"
                    >
                        <Heading2 size={16} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onUpdate('tag', 'p'); }}
                        className={`p-1.5 hover:bg-slate-700 ${currentData.tag === 'p' ? 'text-blue-400 bg-slate-700' : 'text-gray-400'}`}
                        title="Parágrafo (P)"
                    >
                        <Type size={16} />
                    </button>
                </div>

                <div className="w-px h-5 bg-slate-700"></div>

                {/* Alignment */}
                <div className="flex bg-slate-800 rounded overflow-hidden">
                    <button
                        onClick={(e) => { e.stopPropagation(); onUpdate('align', 'left'); }}
                        className={`p-1.5 hover:bg-slate-700 ${currentData.align === 'left' ? 'text-blue-400 bg-slate-700' : 'text-gray-400'}`}
                    >
                        <AlignLeft size={16} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onUpdate('align', 'center'); }}
                        className={`p-1.5 hover:bg-slate-700 ${currentData.align === 'center' ? 'text-blue-400 bg-slate-700' : 'text-gray-400'}`}
                    >
                        <AlignCenter size={16} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onUpdate('align', 'right'); }}
                        className={`p-1.5 hover:bg-slate-700 ${currentData.align === 'right' ? 'text-blue-400 bg-slate-700' : 'text-gray-400'}`}
                    >
                        <AlignRight size={16} />
                    </button>
                </div>

                <div className="w-px h-5 bg-slate-700"></div>

                {/* Color & Palette Trigger */}
                <div className="relative" ref={paletteRef}>
                    <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => { e.stopPropagation(); setShowPalette(!showPalette); }}
                        className="flex items-center gap-1 p-1 hover:bg-slate-800 rounded"
                        title="Cor do Texto"
                    >
                        <div
                            className="w-5 h-5 rounded border-2 border-white/30"
                            style={{ backgroundColor: currentColor }}
                        ></div>
                        <ChevronDown size={12} className={`text-gray-400 transition-transform ${showPalette ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Enhanced Color Palette Popover */}
                    {showPalette && (
                        <div className="absolute top-full left-0 mt-2 p-3 bg-slate-800 rounded-lg shadow-xl border border-slate-700 w-56 z-[110]">

                            {/* Theme Primary Color (Quick Access) */}
                            <div className="mb-3">
                                <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">
                                    Cor Principal do Tema
                                </div>
                                <button
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={(e) => { e.stopPropagation(); handleColorChange(primaryColor); }}
                                    className={`w-full flex items-center gap-2 p-2 rounded-md transition-colors ${currentColor === primaryColor ? 'bg-slate-700' : 'hover:bg-slate-700/50'
                                        }`}
                                >
                                    <div
                                        className="w-6 h-6 rounded border border-white/20"
                                        style={{ backgroundColor: primaryColor }}
                                    ></div>
                                    <span className="text-xs font-mono text-gray-300">{primaryColor}</span>
                                    {currentColor === primaryColor && <Check size={14} className="ml-auto text-green-400" />}
                                </button>
                            </div>

                            {/* Recent Colors */}
                            {recentColors.length > 0 && (
                                <div className="mb-3">
                                    <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">
                                        Cores Recentes
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {recentColors.map((color, i) => (
                                            <button
                                                key={`recent-${i}`}
                                                onMouseDown={(e) => e.preventDefault()}
                                                onClick={(e) => { e.stopPropagation(); handleColorChange(color); }}
                                                className={`w-7 h-7 rounded border-2 hover:scale-110 transition-transform flex items-center justify-center ${currentColor === color ? 'border-white ring-1 ring-blue-400' : 'border-white/10'
                                                    }`}
                                                style={{ backgroundColor: color }}
                                                title={color}
                                            >
                                                {currentColor === color && (
                                                    <Check size={12} className={color === '#FFFFFF' || color === '#ffffff' ? 'text-black' : 'text-white'} />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Preset Colors */}
                            <div className="mb-3">
                                <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">
                                    Paleta Padrão
                                </div>
                                <div className="grid grid-cols-8 gap-1">
                                    {PRESET_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={(e) => { e.stopPropagation(); handleColorChange(color); }}
                                            className={`w-6 h-6 rounded border-2 hover:scale-110 transition-transform flex items-center justify-center ${currentColor === color ? 'border-white ring-1 ring-blue-400' : 'border-white/10'
                                                }`}
                                            style={{ backgroundColor: color }}
                                            title={color}
                                        >
                                            {currentColor === color && (
                                                <Check size={10} className={color === '#FFFFFF' || color === '#ffffff' ? 'text-black' : 'text-white'} />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>


                            {/* Highlight Colors */}
                            <div className="mb-3">
                                <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">
                                    Realce (Grifar)
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {HIGHLIGHT_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={(e) => { e.stopPropagation(); handleHighlightChange(color); }}
                                            className={`w-6 h-6 rounded border-2 hover:scale-110 transition-transform flex items-center justify-center border-white/10`}
                                            style={{ backgroundColor: color === 'transparent' ? 'transparent' : color }}
                                            title={color === 'transparent' ? 'Remover Realce' : color}
                                        >
                                            {color === 'transparent' && (
                                                <div className="w-full h-px bg-red-500 rotate-45 transform" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Color Picker */}
                            <div className="pt-2 border-t border-slate-700">
                                <label className="flex items-center gap-2 cursor-pointer hover:text-blue-400 text-xs text-gray-300 group">
                                    <Palette size={14} className="text-gray-400 group-hover:text-blue-400" />
                                    <span>Escolher cor personalizada...</span>
                                    <input
                                        type="color"
                                        value={currentColor}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => handleColorChange(e.target.value)}
                                        className="ml-auto w-6 h-6 rounded border-0 cursor-pointer"
                                    />
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Size Selector (Compact Row) */}
            <div className="w-full pt-1 border-t border-slate-800 mt-1 flex justify-between items-center px-1">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Tamanho</span>
                <select
                    value={currentData.fontSize || 'normal'}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onUpdate('fontSize', e.target.value)}
                    className="bg-transparent text-xs font-medium text-white border-none focus:ring-0 cursor-pointer hover:text-blue-400 py-0 pr-0 text-right"
                >
                    <option value="small" className="bg-slate-800">Pequeno</option>
                    <option value="normal" className="bg-slate-800">Normal</option>
                    <option value="medium" className="bg-slate-800">Médio</option>
                    <option value="big" className="bg-slate-800">Grande</option>
                    <option value="bigger" className="bg-slate-800">Muito Grande</option>
                    <option value="huge" className="bg-slate-800">Gigante</option>
                </select>
            </div>

            {/* NEW: Letter Spacing */}
            <div className="w-full pt-1 border-t border-slate-800 mt-1 flex justify-between items-center px-1">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Espaçamento</span>
                <select
                    value={currentData.letterSpacing || 'normal'}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onUpdate('letterSpacing', e.target.value)}
                    className="bg-transparent text-xs font-medium text-white border-none focus:ring-0 cursor-pointer hover:text-blue-400 py-0 pr-0 text-right"
                >
                    <option value="tighter" className="bg-slate-800">Mais Apertado</option>
                    <option value="tight" className="bg-slate-800">Apertado</option>
                    <option value="normal" className="bg-slate-800">Normal</option>
                    <option value="wide" className="bg-slate-800">Largo</option>
                    <option value="wider" className="bg-slate-800">Mais Largo</option>
                    <option value="widest" className="bg-slate-800">Muito Largo</option>
                </select>
            </div>

            {/* NEW: Line Height */}
            <div className="w-full pt-1 border-t border-slate-800 mt-1 flex justify-between items-center px-1">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Altura da Linha</span>
                <select
                    value={currentData.lineHeight || 'normal'}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onUpdate('lineHeight', e.target.value)}
                    className="bg-transparent text-xs font-medium text-white border-none focus:ring-0 cursor-pointer hover:text-blue-400 py-0 pr-0 text-right"
                >
                    <option value="tight" className="bg-slate-800">Compacto</option>
                    <option value="snug" className="bg-slate-800">Ajustado</option>
                    <option value="normal" className="bg-slate-800">Normal</option>
                    <option value="relaxed" className="bg-slate-800">Relaxado</option>
                    <option value="loose" className="bg-slate-800">Solto</option>
                </select>
            </div>

            {/* NEW: Text Transform */}
            <div className="w-full pt-1 border-t border-slate-800 mt-1 flex justify-between items-center px-1">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Transformação</span>
                <select
                    value={currentData.textTransform || 'none'}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onUpdate('textTransform', e.target.value)}
                    className="bg-transparent text-xs font-medium text-white border-none focus:ring-0 cursor-pointer hover:text-blue-400 py-0 pr-0 text-right"
                >
                    <option value="none" className="bg-slate-800">Nenhuma</option>
                    <option value="uppercase" className="bg-slate-800">MAIÚSCULAS</option>
                    <option value="lowercase" className="bg-slate-800">minúsculas</option>
                    <option value="capitalize" className="bg-slate-800">Capitalizar</option>
                </select>
            </div>

            {/* NEW: Drop Shadow */}
            <div className="w-full pt-1 border-t border-slate-800 mt-1 flex justify-between items-center px-1">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Sombra</span>
                <select
                    value={currentData.dropShadow || 'none'}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onUpdate('dropShadow', e.target.value)}
                    className="bg-transparent text-xs font-medium text-white border-none focus:ring-0 cursor-pointer hover:text-blue-400 py-0 pr-0 text-right"
                >
                    <option value="none" className="bg-slate-800">Nenhuma</option>
                    <option value="sm" className="bg-slate-800">Pequena</option>
                    <option value="md" className="bg-slate-800">Média</option>
                    <option value="lg" className="bg-slate-800">Grande</option>
                    <option value="xl" className="bg-slate-800">Extra Grande</option>
                </select>
            </div>

            {/* NEW: Text Stroke (Contorno) */}
            <div className="w-full pt-1 border-t border-slate-800 mt-1 px-1">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2 block">Contorno</span>

                {/* Stroke Width */}
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] text-gray-400">Largura</span>
                    <select
                        value={currentData.textStroke?.width || 0}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => onUpdate('textStroke', {
                            ...currentData.textStroke,
                            width: Number(e.target.value)
                        })}
                        className="bg-transparent text-xs font-medium text-white border-none focus:ring-0 cursor-pointer hover:text-blue-400 py-0 pr-0 text-right"
                    >
                        <option value="0" className="bg-slate-800">Nenhum</option>
                        <option value="1" className="bg-slate-800">1px</option>
                        <option value="2" className="bg-slate-800">2px</option>
                        <option value="3" className="bg-slate-800">3px</option>
                        <option value="4" className="bg-slate-800">4px</option>
                        <option value="5" className="bg-slate-800">5px</option>
                    </select>
                </div>

                {/* Stroke Color */}
                {(currentData.textStroke?.width || 0) > 0 && (
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] text-gray-400">Cor</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const input = document.createElement('input');
                                input.type = 'color';
                                input.value = currentData.textStroke?.color || '#000000';
                                input.onchange = (evt) => {
                                    const target = evt.target as HTMLInputElement;
                                    onUpdate('textStroke', {
                                        ...currentData.textStroke,
                                        color: target.value
                                    });
                                };
                                input.click();
                            }}
                            className="flex items-center gap-1 px-2 py-0.5 hover:bg-slate-700 rounded"
                        >
                            <div
                                className="w-4 h-4 rounded border border-white/30"
                                style={{ backgroundColor: currentData.textStroke?.color || '#000000' }}
                            />
                            <span className="text-[9px] font-mono text-gray-300">
                                {currentData.textStroke?.color || '#000000'}
                            </span>
                        </button>
                    </div>
                )}
            </div>

        </div >
    );

    if (anchorRef && typeof document !== 'undefined') {
        return createPortal(toolbarContent, document.body);
    }

    return toolbarContent;
}
