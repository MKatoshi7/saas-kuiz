import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight,
    Type, Palette, ChevronDown, Eraser, Hash, LetterText, CaseSensitive
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
    '#000000', '#334155', '#EF4444', '#F97316', '#F59E0B', '#84CC16',
    '#10B981', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#D946EF',
];

const FONT_SIZES = [
    { value: 'micro', label: '8px' }, { value: 'minusculo', label: '12px' },
    { value: 'small', label: '16px' }, { value: 'normal', label: '18px' },
    { value: 'medium', label: '20px' }, { value: 'big', label: '24px' },
    { value: 'bigger', label: '30px' }, { value: 'huge', label: '36px' },
];

const FONT_FAMILIES = [
    'Inter', 'Arial', 'Helvetica', 'Times New Roman', 'Georgia',
    'Courier New', 'Verdana', 'Roboto', 'Open Sans', 'Lato',
    'Montserrat', 'Poppins', 'Oswald', 'Raleway', 'Nunito',
];

const FONT_WEIGHTS = [
    { value: 300, label: 'Leve' }, { value: 400, label: 'Normal' },
    { value: 500, label: 'Médio' }, { value: 600, label: 'Semi' },
    { value: 700, label: 'Negrito' }, { value: 800, label: 'Extra' },
];

function Dropdown({ trigger, children, align = 'left' }: {
    trigger: React.ReactNode; children: React.ReactNode; align?: 'left' | 'right'
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        if (open) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    return (
        <div className="relative" ref={ref}>
            <div onClick={() => setOpen(!open)}>{trigger}</div>
            {open && (
                <>
                    <div className="fixed inset-0 z-[100]" onClick={() => setOpen(false)} />
                    <div className={`absolute top-full mt-1 z-[110] bg-white border border-gray-200 rounded-lg shadow-xl p-1 min-w-[160px] animate-in fade-in slide-in-from-top-1 duration-150 ${align === 'right' ? 'right-0' : 'left-0'}`}>
                        {children}
                    </div>
                </>
            )}
        </div>
    );
}

function DropdownItem({ label, active, onClick, icon: Icon }: {
    label: string; active?: boolean; onClick: () => void; icon?: any
}) {
    return (
        <button
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md transition-colors text-left ${active ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
            {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
            <span className="truncate">{label}</span>
        </button>
    );
}

export function TextToolbar({ currentData, onUpdate, isVisible, className, anchorRef }: ToolbarProps) {
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isStrikethrough, setIsStrikethrough] = useState(false);
    const colorRef = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState({ top: 0, left: 0 });

    const theme = useBuilderStore((state) => state.theme);
    const primaryColor = theme?.primaryColor || '#2563EB';

    const checkActiveFormatting = () => {
        setIsBold(document.queryCommandState('bold'));
        setIsItalic(document.queryCommandState('italic'));
        setIsUnderline(document.queryCommandState('underline'));
        setIsStrikethrough(document.queryCommandState('strikeThrough'));
    };

    const applyFormat = (command: string) => {
        document.execCommand(command, false);
        checkActiveFormatting();
        const selection = window.getSelection();
        const editor = selection?.anchorNode?.parentElement?.closest('[contenteditable="true"]') as HTMLElement;
        if (editor) editor.dispatchEvent(new Event('input', { bubbles: true }));
    };

    const clearFormatting = () => {
        document.execCommand('removeFormat', false);
        const selection = window.getSelection();
        const editor = selection?.anchorNode?.parentElement?.closest('[contenteditable="true"]') as HTMLElement;
        if (editor) editor.dispatchEvent(new Event('input', { bubbles: true }));
    };

    const applyColor = (color: string) => {
        const selection = window.getSelection();
        const hasSelection = selection && selection.rangeCount > 0 && !selection.isCollapsed;
        if (hasSelection) {
            const editor = selection.anchorNode?.parentElement?.closest('[contenteditable="true"]') as HTMLElement;
            if (editor) editor.focus();
            document.execCommand('foreColor', false, color);
        } else {
            onUpdate('color', color);
        }
        setShowColorPicker(false);
    };

    useEffect(() => {
        const handler = () => { if (isVisible) checkActiveFormatting(); };
        document.addEventListener('selectionchange', handler);
        return () => document.removeEventListener('selectionchange', handler);
    }, [isVisible]);

    useEffect(() => {
        if (!anchorRef?.current || !isVisible) return;
        const update = () => {
            if (anchorRef.current) {
                const rect = anchorRef.current.getBoundingClientRect();
                setCoords({ top: rect.top - 8, left: rect.left });
            }
        };
        update();
        window.addEventListener('scroll', update, true);
        window.addEventListener('resize', update);
        return () => { window.removeEventListener('scroll', update, true); window.removeEventListener('resize', update); };
    }, [anchorRef, isVisible]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (colorRef.current && !colorRef.current.contains(e.target as Node)) setShowColorPicker(false);
        };
        if (showColorPicker) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showColorPicker]);

    if (!isVisible) return null;

    const currentFontSize = currentData.fontSize || 'normal';
    const currentFontFamily = currentData.fontFamily || 'Inter';
    const currentFontWeight = currentData.fontWeight || 400;
    const currentLetterSpacing = currentData.letterSpacing || 'normal';
    const currentLineHeight = currentData.lineHeight || 'normal';
    const currentTextTransform = currentData.textTransform || 'none';
    const currentAlign = currentData.align || 'left';
    const currentColor = currentData.color || '#000000';

    const toolbarContent = (
        <div
            className={`flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-lg px-2 py-1 animate-in fade-in slide-in-from-bottom-1 duration-150 ${anchorRef ? 'fixed z-[9999]' : `absolute z-[9999] ${className || '-top-12 left-0'}`}`}
            style={anchorRef ? { top: coords.top, left: coords.left, transform: 'translateY(-100%)' } : undefined}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Font Family */}
            <Dropdown
                trigger={
                    <button className="flex items-center gap-1 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 rounded max-w-[120px]">
                        <span className="truncate">{currentFontFamily}</span>
                        <ChevronDown className="w-3 h-3 shrink-0 text-gray-400" />
                    </button>
                }
            >
                <div className="max-h-[300px] overflow-y-auto">
                    {FONT_FAMILIES.map(f => (
                        <DropdownItem key={f} label={f} active={currentFontFamily === f} onClick={() => onUpdate('fontFamily', f)} />
                    ))}
                </div>
            </Dropdown>

            <div className="w-px h-5 bg-gray-200 mx-0.5" />

            {/* Font Size */}
            <Dropdown
                trigger={
                    <button className="flex items-center gap-1 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 rounded">
                        <Hash className="w-3 h-3 text-gray-400" />
                        <span>{FONT_SIZES.find(s => s.value === currentFontSize)?.label || '18px'}</span>
                        <ChevronDown className="w-3 h-3 text-gray-400" />
                    </button>
                }
            >
                {FONT_SIZES.map(s => (
                    <DropdownItem key={s.value} label={`${s.label} — ${s.value}`} active={currentFontSize === s.value} onClick={() => onUpdate('fontSize', s.value)} />
                ))}
            </Dropdown>

            <div className="w-px h-5 bg-gray-200 mx-0.5" />

            {/* Font Weight */}
            <Dropdown
                trigger={
                    <button className="flex items-center gap-1 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 rounded">
                        <span style={{ fontWeight: currentFontWeight }}>{FONT_WEIGHTS.find(w => w.value === currentFontWeight)?.label || 'Normal'}</span>
                        <ChevronDown className="w-3 h-3 text-gray-400" />
                    </button>
                }
            >
                {FONT_WEIGHTS.map(w => (
                    <DropdownItem key={w.value} label={w.label} active={currentFontWeight === w.value} onClick={() => onUpdate('fontWeight', w.value)} />
                ))}
            </Dropdown>

            <div className="w-px h-5 bg-gray-200 mx-0.5" />

            {/* Inline Formatting */}
            <div className="flex items-center">
                <button onClick={() => applyFormat('bold')} className={`p-1.5 rounded ${isBold ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`} title="Negrito"><Bold className="w-3.5 h-3.5" /></button>
                <button onClick={() => applyFormat('italic')} className={`p-1.5 rounded ${isItalic ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`} title="Itálico"><Italic className="w-3.5 h-3.5" /></button>
                <button onClick={() => applyFormat('underline')} className={`p-1.5 rounded ${isUnderline ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`} title="Sublinhado"><Underline className="w-3.5 h-3.5" /></button>
                <button onClick={() => applyFormat('strikeThrough')} className={`p-1.5 rounded ${isStrikethrough ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`} title="Tachado"><Strikethrough className="w-3.5 h-3.5" /></button>
            </div>

            <div className="w-px h-5 bg-gray-200 mx-0.5" />

            {/* Alignment */}
            <div className="flex items-center">
                {[
                    { value: 'left', icon: AlignLeft },
                    { value: 'center', icon: AlignCenter },
                    { value: 'right', icon: AlignRight },
                ].map(({ value, icon: Icon }) => (
                    <button key={value} onClick={() => onUpdate('align', value)} className={`p-1.5 rounded ${currentAlign === value ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`} title={`Alinhar ${value}`}>
                        <Icon className="w-3.5 h-3.5" />
                    </button>
                ))}
            </div>

            <div className="w-px h-5 bg-gray-200 mx-0.5" />

            {/* Text Color */}
            <div className="relative" ref={colorRef}>
                <button onClick={() => setShowColorPicker(!showColorPicker)} className="p-1.5 rounded hover:bg-gray-100" title="Cor do Texto">
                    <div className="w-4 h-4 rounded border border-gray-300 relative">
                        <div className="absolute bottom-0 left-0 right-0 h-2 rounded-b" style={{ backgroundColor: currentColor }} />
                    </div>
                </button>
                {showColorPicker && (
                    <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-gray-200 rounded-lg shadow-xl w-48 z-[120]">
                        <div className="grid grid-cols-6 gap-1 mb-2">
                            {PRESET_COLORS.map(c => (
                                <button key={c} onClick={() => applyColor(c)} className="w-6 h-6 rounded border hover:scale-110 transition-transform" style={{ backgroundColor: c, borderColor: currentColor === c ? '#3B82F6' : '#e5e7eb' }} />
                            ))}
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                            <Palette className="w-3.5 h-3.5" />
                            <span>Personalizada</span>
                            <input type="color" value={currentColor} onChange={(e) => applyColor(e.target.value)} className="ml-auto w-5 h-5 rounded border-0 cursor-pointer" />
                        </label>
                    </div>
                )}
            </div>

            <div className="w-px h-5 bg-gray-200 mx-0.5" />

            {/* Letter Spacing */}
            <Dropdown
                trigger={
                    <button className="flex items-center gap-1 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 rounded">
                        <LetterText className="w-3 h-3 text-gray-400" />
                        <ChevronDown className="w-3 h-3 text-gray-400" />
                    </button>
                }
            >
                <div className="text-[10px] text-gray-400 uppercase tracking-wider px-2.5 py-1">Espaçamento</div>
                {['tighter', 'tight', 'normal', 'wide', 'wider', 'widest'].map(v => (
                    <DropdownItem key={v} label={v} active={currentLetterSpacing === v} onClick={() => onUpdate('letterSpacing', v)} />
                ))}
            </Dropdown>

            {/* Line Height */}
            <Dropdown
                trigger={
                    <button className="flex items-center gap-1 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 rounded">
                        <CaseSensitive className="w-3 h-3 text-gray-400" />
                        <ChevronDown className="w-3 h-3 text-gray-400" />
                    </button>
                }
            >
                <div className="text-[10px] text-gray-400 uppercase tracking-wider px-2.5 py-1">Altura da Linha</div>
                {['tight', 'snug', 'normal', 'relaxed', 'loose'].map(v => (
                    <DropdownItem key={v} label={v} active={currentLineHeight === v} onClick={() => onUpdate('lineHeight', v)} />
                ))}
            </Dropdown>

            {/* Text Transform */}
            <Dropdown
                trigger={
                    <button className="flex items-center gap-1 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 rounded">
                        <Type className="w-3 h-3 text-gray-400" />
                        <ChevronDown className="w-3 h-3 text-gray-400" />
                    </button>
                }
            >
                <div className="text-[10px] text-gray-400 uppercase tracking-wider px-2.5 py-1">Transformação</div>
                {[{ value: 'none', label: 'Nenhuma' }, { value: 'uppercase', label: 'MAIÚSCULAS' }, { value: 'lowercase', label: 'minúsculas' }, { value: 'capitalize', label: 'Capitalizar' }].map(t => (
                    <DropdownItem key={t.value} label={t.label} active={currentTextTransform === t.value} onClick={() => onUpdate('textTransform', t.value)} />
                ))}
            </Dropdown>

            <div className="w-px h-5 bg-gray-200 mx-0.5" />

            {/* Clear */}
            <button onClick={clearFormatting} className="p-1.5 rounded text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Limpar Formatação">
                <Eraser className="w-3.5 h-3.5" />
            </button>
        </div>
    );

    if (anchorRef && typeof document !== 'undefined') {
        return createPortal(toolbarContent, document.body);
    }
    return toolbarContent;
}
