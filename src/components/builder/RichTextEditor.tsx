'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Bold, Italic, Underline, Strikethrough, RemoveFormatting, Highlighter, Type } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

const PRESET_COLORS = [
    '#000000', '#4B5563', '#EF4444', '#F59E0B',
    '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'
];

const HIGHLIGHT_COLORS = [
    '#FEF3C7', '#FED7AA', '#FBCFE8',
    '#DBEAFE', '#D1FAE5', '#FDE68A'
];

export function RichTextEditor({
    value,
    onChange,
    placeholder = 'Digite aqui...',
    className = ''
}: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
    const [recentColors, setRecentColors] = useState<string[]>([]);

    useEffect(() => {
        setMounted(true);
        // Load recent colors
        const saved = localStorage.getItem('quizk_recent_colors');
        if (saved) {
            try {
                setRecentColors(JSON.parse(saved));
            } catch (e) {
                console.error('Error loading recent colors', e);
            }
        }
    }, []);

    useEffect(() => {
        if (!editorRef.current || !mounted) return;
        if (editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value || '';
        }
    }, [value, mounted]);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const applyFormat = (command: string, value?: string) => {
        editorRef.current?.focus();

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        // Save the selection range
        const range = selection.getRangeAt(0);

        // Apply the command
        document.execCommand(command, false, value);

        // Restore selection
        selection.removeAllRanges();
        selection.addRange(range);

        handleInput();
    };

    const applyColor = (color: string) => {
        applyFormat('foreColor', color);

        // Save to recent colors
        if (!recentColors.includes(color)) {
            const newColors = [color, ...recentColors].slice(0, 6);
            setRecentColors(newColors);
            localStorage.setItem('quizk_recent_colors', JSON.stringify(newColors));
        }
    };

    const applyHighlight = (color: string) => {
        applyFormat('hiliteColor', color);
    };

    const removeFormatting = () => {
        applyFormat('removeFormat');
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
        handleInput();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'b':
                    e.preventDefault();
                    applyFormat('bold');
                    break;
                case 'i':
                    e.preventDefault();
                    applyFormat('italic');
                    break;
                case 'u':
                    e.preventDefault();
                    applyFormat('underline');
                    break;
            }
        }
    };

    if (!mounted) {
        return <div className={className} />;
    }

    return (
        <div className="space-y-2">
            {/* Compact Toolbar */}
            <div className="flex items-center gap-0.5 p-1.5 border border-gray-200 rounded-md bg-gray-50 flex-wrap">
                {/* Bold */}
                <button
                    type="button"
                    onClick={() => applyFormat('bold')}
                    className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                    title="Negrito (Ctrl+B)"
                >
                    <Bold className="w-3.5 h-3.5" />
                </button>

                {/* Italic */}
                <button
                    type="button"
                    onClick={() => applyFormat('italic')}
                    className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                    title="Itálico (Ctrl+I)"
                >
                    <Italic className="w-3.5 h-3.5" />
                </button>

                {/* Underline */}
                <button
                    type="button"
                    onClick={() => applyFormat('underline')}
                    className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                    title="Sublinhado (Ctrl+U)"
                >
                    <Underline className="w-3.5 h-3.5" />
                </button>

                {/* Strikethrough */}
                <button
                    type="button"
                    onClick={() => applyFormat('strikeThrough')}
                    className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                    title="Tachado"
                >
                    <Strikethrough className="w-3.5 h-3.5" />
                </button>

                <div className="w-px h-4 bg-gray-300 mx-0.5" />

                {/* Text Color Popover */}
                <Popover>
                    <PopoverTrigger asChild>
                        <button
                            type="button"
                            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                            title="Cor do Texto"
                        >
                            <Type className="w-3.5 h-3.5" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3" align="start">
                        <div className="space-y-3">
                            {/* Recent Colors */}
                            {recentColors.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-medium text-gray-500 mb-1.5">Recentes</p>
                                    <div className="grid grid-cols-6 gap-1">
                                        {recentColors.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                className="w-7 h-7 rounded border border-gray-300 hover:scale-110 transition-transform"
                                                style={{ backgroundColor: color }}
                                                onClick={() => applyColor(color)}
                                                title={color}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Suggested Colors */}
                            <div>
                                <p className="text-[10px] font-medium text-gray-500 mb-1.5">Sugeridas</p>
                                <div className="grid grid-cols-4 gap-1">
                                    {PRESET_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            className="w-7 h-7 rounded border border-gray-300 hover:scale-110 transition-transform"
                                            style={{ backgroundColor: color }}
                                            onClick={() => applyColor(color)}
                                            title={color}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Custom Color */}
                            <div>
                                <p className="text-[10px] font-medium text-gray-500 mb-1.5">Personalizada</p>
                                <input
                                    type="color"
                                    onChange={(e) => applyColor(e.target.value)}
                                    className="w-full h-8 rounded border border-gray-300 cursor-pointer"
                                />
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Highlight Popover */}
                <Popover>
                    <PopoverTrigger asChild>
                        <button
                            type="button"
                            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                            title="Marca-Texto"
                        >
                            <Highlighter className="w-3.5 h-3.5" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-3" align="start">
                        <div className="space-y-2">
                            <p className="text-[10px] font-medium text-gray-500 mb-1.5">Marca-Texto</p>
                            <div className="grid grid-cols-3 gap-1">
                                {HIGHLIGHT_COLORS.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        className="w-8 h-8 rounded border border-gray-300 hover:scale-110 transition-transform"
                                        style={{ backgroundColor: color }}
                                        onClick={() => applyHighlight(color)}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                <div className="w-px h-4 bg-gray-300 mx-0.5" />

                {/* Remove Formatting */}
                <button
                    type="button"
                    onClick={removeFormatting}
                    className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                    title="Remover Formatação"
                >
                    <RemoveFormatting className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Editor */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onPaste={handlePaste}
                onKeyDown={handleKeyDown}
                className={className}
                data-placeholder={placeholder}
                suppressContentEditableWarning
                style={{
                    minHeight: '80px',
                    outline: 'none'
                }}
            />
        </div>
    );
}
