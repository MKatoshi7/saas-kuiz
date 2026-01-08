'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Bold, Italic, Underline, Strikethrough, RemoveFormatting, Highlighter, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

const PRESET_COLORS = [
    '#000000', '#FFFFFF', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'
];

const HIGHLIGHT_COLORS = [
    '#FEF3C7', '#FED7AA', '#FBCFE8', '#DBEAFE', '#D1FAE5', '#FDE68A'
];

export function RichTextEditor({
    value,
    onChange,
    placeholder = 'Digite aqui...',
    className = ''
}: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showHighlightPicker, setShowHighlightPicker] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Update content when value changes from outside
    useEffect(() => {
        if (!editorRef.current || !mounted) return;

        // Only update if different to avoid cursor jumping
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
        document.execCommand(command, false, value);
        handleInput();
    };

    const applyColor = (color: string) => {
        applyFormat('foreColor', color);
        setShowColorPicker(false);
    };

    const applyHighlight = (color: string) => {
        applyFormat('hiliteColor', color);
        setShowHighlightPicker(false);
    };

    const removeFormatting = () => {
        applyFormat('removeFormat');
    };

    // Handle paste - strip all formatting and insert plain text only
    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
        handleInput();
    };

    // Handle keyboard shortcuts
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
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border border-gray-200 rounded-md bg-gray-50">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => applyFormat('bold')}
                    className="h-8 w-8 p-0"
                    title="Negrito (Ctrl+B)"
                >
                    <Bold className="w-4 h-4" />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => applyFormat('italic')}
                    className="h-8 w-8 p-0"
                    title="Itálico (Ctrl+I)"
                >
                    <Italic className="w-4 h-4" />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => applyFormat('underline')}
                    className="h-8 w-8 p-0"
                    title="Sublinhado (Ctrl+U)"
                >
                    <Underline className="w-4 h-4" />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => applyFormat('strikeThrough')}
                    className="h-8 w-8 p-0"
                    title="Tachado"
                >
                    <Strikethrough className="w-4 h-4" />
                </Button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Color Picker */}
                <div className="relative">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="h-8 w-8 p-0"
                        title="Cor do Texto"
                    >
                        <Type className="w-4 h-4" />
                    </Button>

                    {showColorPicker && (
                        <div className="absolute top-full mt-1 z-50 p-2 bg-white border border-gray-200 rounded-md shadow-lg">
                            <div className="grid grid-cols-4 gap-1">
                                {PRESET_COLORS.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                                        style={{ backgroundColor: color }}
                                        onClick={() => applyColor(color)}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Highlight Picker */}
                <div className="relative">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowHighlightPicker(!showHighlightPicker)}
                        className="h-8 w-8 p-0"
                        title="Marca-Texto"
                    >
                        <Highlighter className="w-4 h-4" />
                    </Button>

                    {showHighlightPicker && (
                        <div className="absolute top-full mt-1 z-50 p-2 bg-white border border-gray-200 rounded-md shadow-lg">
                            <div className="grid grid-cols-3 gap-1">
                                {HIGHLIGHT_COLORS.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                                        style={{ backgroundColor: color }}
                                        onClick={() => applyHighlight(color)}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFormatting}
                    className="h-8 w-8 p-0"
                    title="Remover Formatação"
                >
                    <RemoveFormatting className="w-4 h-4" />
                </Button>
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
