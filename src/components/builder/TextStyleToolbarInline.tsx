'use client';

import React, { useRef, useCallback } from 'react';
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
    Plus
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface TextStyleToolbarInlineProps {
    data: any;
    onUpdate: (field: string, value: any) => void;
    editorRef: React.RefObject<HTMLDivElement>;
    showAlignment?: boolean;
    showFontSize?: boolean;
    showLetterSpacing?: boolean;
    showLineHeight?: boolean;
    showTextTransform?: boolean;
    showFontFamily?: boolean;
}

export function TextStyleToolbarInline({
    data,
    onUpdate,
    editorRef,
    showAlignment = true,
    showFontSize = true,
    showLetterSpacing = false,
    showLineHeight = false,
    showTextTransform = false,
    showFontFamily = false
}: TextStyleToolbarInlineProps) {

    const fontSize = data.fontSizePixels || 16;

    const execCommand = useCallback((command: string, value?: string) => {
        if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand(command, false, value);

            // Trigger update to save changes
            if (editorRef.current) {
                const event = new Event('input', { bubbles: true });
                editorRef.current.dispatchEvent(event);
            }
        }
    }, [editorRef]);

    const alignments = [
        { value: 'left', icon: AlignLeft, label: 'Esquerda', command: 'justifyLeft' },
        { value: 'center', icon: AlignCenter, label: 'Centro', command: 'justifyCenter' },
        { value: 'right', icon: AlignRight, label: 'Direita', command: 'justifyRight' },
        { value: 'justify', icon: AlignJustify, label: 'Justificar', command: 'justifyFull' }
    ];

    return (
        <div className="space-y-3">
            {/* Main Toolbar - Formatting */}
            <div className="border border-gray-300 rounded-lg p-2 bg-gray-50">
                <div className="flex flex-wrap items-center gap-1">
                    {/* Bold */}
                    <button
                        onClick={() => execCommand('bold')}
                        onMouseDown={(e) => e.preventDefault()}
                        className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
                        title="Negrito (Ctrl+B)"
                    >
                        <Bold className="w-4 h-4" />
                    </button>

                    {/* Italic */}
                    <button
                        onClick={() => execCommand('italic')}
                        onMouseDown={(e) => e.preventDefault()}
                        className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
                        title="Itálico (Ctrl+I)"
                    >
                        <Italic className="w-4 h-4" />
                    </button>

                    {/* Underline */}
                    <button
                        onClick={() => execCommand('underline')}
                        onMouseDown={(e) => e.preventDefault()}
                        className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
                        title="Sublinhado (Ctrl+U)"
                    >
                        <Underline className="w-4 h-4" />
                    </button>

                    {/* Strikethrough */}
                    <button
                        onClick={() => execCommand('strikeThrough')}
                        onMouseDown={(e) => e.preventDefault()}
                        className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
                        title="Tachado"
                    >
                        <Strikethrough className="w-4 h-4" />
                    </button>

                    <div className="w-px h-6 bg-gray-300 mx-1" />

                    {/* Text Color */}
                    <div className="relative">
                        <input
                            type="color"
                            value={data.color || '#000000'}
                            onChange={(e) => {
                                execCommand('foreColor', e.target.value);
                                onUpdate('color', e.target.value);
                            }}
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                            title="Cor do Texto"
                        />
                        <div className="flex flex-col items-center p-1 hover:bg-gray-200 rounded cursor-pointer">
                            <Type className="w-4 h-4 text-gray-700" />
                            <div
                                className="w-6 h-1.5 rounded-sm mt-0.5 border border-gray-300"
                                style={{ backgroundColor: data.color || '#000000' }}
                            />
                        </div>
                    </div>

                    {/* Background Color */}
                    <div className="relative">
                        <input
                            type="color"
                            value={data.backgroundColor || '#ffffff'}
                            onChange={(e) => {
                                execCommand('backColor', e.target.value);
                                onUpdate('backgroundColor', e.target.value);
                            }}
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                            title="Cor de Fundo"
                        />
                        <div className="flex items-center justify-center p-2 hover:bg-gray-200 rounded cursor-pointer">
                            <div
                                className="w-4 h-4 rounded border border-gray-300"
                                style={{ backgroundColor: data.backgroundColor || '#ffffff' }}
                            />
                        </div>
                    </div>

                    {showAlignment && (
                        <>
                            <div className="w-px h-6 bg-gray-300 mx-1" />

                            {/* Alignment Buttons */}
                            {alignments.map(({ value, icon: Icon, label, command }) => (
                                <button
                                    key={value}
                                    onClick={() => {
                                        execCommand(command);
                                        onUpdate('align', value);
                                    }}
                                    onMouseDown={(e) => e.preventDefault()}
                                    className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
                                    title={label}
                                >
                                    <Icon className="w-4 h-4" />
                                </button>
                            ))}
                        </>
                    )}
                </div>
            </div>

            {/* Font Size */}
            {showFontSize && (
                <div>
                    <Label className="text-xs text-gray-700 mb-2 block">
                        Tamanho da Fonte
                    </Label>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                const newSize = Math.max(8, fontSize - 2);
                                execCommand('fontSize', '7');
                                onUpdate('fontSizePixels', newSize);
                            }}
                            className="p-1.5 rounded border border-gray-300 hover:bg-gray-100 transition-colors"
                        >
                            <Minus className="w-3 h-3 text-gray-600" />
                        </button>
                        <Input
                            type="number"
                            min="8"
                            max="120"
                            value={fontSize}
                            onChange={(e) => onUpdate('fontSizePixels', parseInt(e.target.value) || 16)}
                            className="h-9 text-center text-sm w-16 px-2"
                        />
                        <span className="text-xs text-gray-500">px</span>
                        <button
                            onClick={() => {
                                const newSize = Math.min(120, fontSize + 2);
                                onUpdate('fontSizePixels', newSize);
                            }}
                            className="p-1.5 rounded border border-gray-300 hover:bg-gray-100 transition-colors"
                        >
                            <Plus className="w-3 h-3 text-gray-600" />
                        </button>
                        <input
                            type="range"
                            min="8"
                            max="120"
                            value={fontSize}
                            onChange={(e) => onUpdate('fontSizePixels', parseInt(e.target.value))}
                            className="flex-1 h-2 accent-blue-600"
                        />
                    </div>
                </div>
            )}

            {/* Font Family */}
            {showFontFamily && (
                <div>
                    <Label className="text-xs text-gray-700 mb-2 block">
                        Fonte
                    </Label>
                    <select
                        value={data.fontFamily || 'Inter'}
                        onChange={(e) => {
                            execCommand('fontName', e.target.value);
                            onUpdate('fontFamily', e.target.value);
                        }}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="Inter">Inter</option>
                        <option value="Arial">Arial</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Lato">Lato</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Poppins">Poppins</option>
                    </select>
                </div>
            )}

            {/* Line Height */}
            {showLineHeight && (
                <div>
                    <Label className="text-xs text-gray-700 mb-2 block">
                        Altura da Linha
                    </Label>
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            min="0.8"
                            max="3"
                            step="0.1"
                            value={data.lineHeight || 1.5}
                            onChange={(e) => onUpdate('lineHeight', parseFloat(e.target.value) || 1.5)}
                            className="h-8 text-sm"
                        />
                        <input
                            type="range"
                            min="0.8"
                            max="3"
                            step="0.1"
                            value={data.lineHeight || 1.5}
                            onChange={(e) => onUpdate('lineHeight', parseFloat(e.target.value))}
                            className="flex-1 h-2 accent-blue-600"
                        />
                    </div>
                </div>
            )}

            {/* Letter Spacing */}
            {showLetterSpacing && (
                <div>
                    <Label className="text-xs text-gray-700 mb-2 block">
                        Espaçamento entre Letras
                    </Label>
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            min="-2"
                            max="10"
                            step="0.1"
                            value={data.letterSpacing || 0}
                            onChange={(e) => onUpdate('letterSpacing', parseFloat(e.target.value) || 0)}
                            className="h-8 text-sm w-20"
                        />
                        <span className="text-xs text-gray-500">px</span>
                        <input
                            type="range"
                            min="-2"
                            max="10"
                            step="0.1"
                            value={data.letterSpacing || 0}
                            onChange={(e) => onUpdate('letterSpacing', parseFloat(e.target.value))}
                            className="flex-1 h-2 accent-blue-600"
                        />
                    </div>
                </div>
            )}

            {/* Text Transform */}
            {showTextTransform && (
                <div>
                    <Label className="text-xs text-gray-700 mb-2 block">
                        Transformação
                    </Label>
                    <select
                        value={data.textTransform || 'none'}
                        onChange={(e) => onUpdate('textTransform', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="none">Normal</option>
                        <option value="uppercase">MAIÚSCULAS</option>
                        <option value="lowercase">minúsculas</option>
                        <option value="capitalize">Capitalizar</option>
                    </select>
                </div>
            )}
        </div>
    );
}
