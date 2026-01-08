'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

interface InlineTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    className?: string;
    style?: React.CSSProperties;
}

export function InlineTextEditor({
    value,
    onChange,
    placeholder = 'Digite aqui...',
    className = '',
    style = {}
}: InlineTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isEmpty, setIsEmpty] = useState(true);

    // Initialize content
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value || '';
            setIsEmpty(!value || value.trim() === '');
        }
    }, [value]);

    const handleInput = useCallback(() => {
        if (editorRef.current) {
            const html = editorRef.current.innerHTML;
            const text = editorRef.current.textContent || '';
            setIsEmpty(text.trim() === '');
            onChange(html);
        }
    }, [onChange]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Ctrl/Cmd + B for bold
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
            e.preventDefault();
            document.execCommand('bold', false);
            handleInput();
        }
        // Ctrl/Cmd + I for italic
        else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
            e.preventDefault();
            document.execCommand('italic', false);
            handleInput();
        }
        // Ctrl/Cmd + U for underline
        else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
            e.preventDefault();
            document.execCommand('underline', false);
            handleInput();
        }
    };

    return (
        <div className="relative">
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                className={`${className} outline-none`}
                style={{
                    ...style,
                    minHeight: '80px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                }}
                suppressContentEditableWarning
            />
            {isEmpty && (
                <div
                    className="absolute inset-0 pointer-events-none text-gray-400 p-3"
                    style={{ font: 'inherit' }}
                >
                    {placeholder}
                </div>
            )}
        </div>
    );
}

// Helper function to apply formatting via execCommand
export function applyTextFormat(command: string, value?: string) {
    // Save selection
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    // Apply format
    document.execCommand(command, false, value);
}
