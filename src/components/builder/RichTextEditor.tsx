'use client';

import React, { useRef, useEffect, useState } from 'react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    isBold?: boolean;
    isItalic?: boolean;
    isUnderline?: boolean;
    isStrikethrough?: boolean;
    color?: string;
    backgroundColor?: string;
    onBoldToggle?: () => void;
    onItalicToggle?: () => void;
    onUnderlineToggle?: () => void;
    onStrikethroughToggle?: () => void;
}

export function RichTextEditor({
    value,
    onChange,
    placeholder = 'Digite aqui...',
    className = '',
    isBold,
    isItalic,
    isUnderline,
    isStrikethrough,
    color,
    backgroundColor,
    onBoldToggle,
    onItalicToggle,
    onUnderlineToggle,
    onStrikethroughToggle
}: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

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

    // Handle paste - strip all formatting and insert plain text only
    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();

        // Get plain text from clipboard
        const text = e.clipboardData.getData('text/plain');

        // Insert as plain text using execCommand
        document.execCommand('insertText', false, text);

        // Trigger change
        handleInput();
    };

    // Handle keyboard shortcuts
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'b':
                    e.preventDefault();
                    applyFormat('bold');
                    onBoldToggle?.();
                    break;
                case 'i':
                    e.preventDefault();
                    applyFormat('italic');
                    onItalicToggle?.();
                    break;
                case 'u':
                    e.preventDefault();
                    applyFormat('underline');
                    onUnderlineToggle?.();
                    break;
            }
        }
    };

    // Apply formatting when toolbar buttons are clicked
    useEffect(() => {
        if (!mounted || !editorRef.current) return;

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        // Focus the editor first
        editorRef.current.focus();

        // Store the selection before applying format
        const range = selection.getRangeAt(0);

        // Apply the format
        if (isBold !== undefined) {
            applyFormat('bold');
        }
    }, [isBold]);

    useEffect(() => {
        if (!mounted || !editorRef.current) return;
        editorRef.current.focus();
        if (isItalic !== undefined) {
            applyFormat('italic');
        }
    }, [isItalic]);

    useEffect(() => {
        if (!mounted || !editorRef.current) return;
        editorRef.current.focus();
        if (isUnderline !== undefined) {
            applyFormat('underline');
        }
    }, [isUnderline]);

    useEffect(() => {
        if (!mounted || !editorRef.current) return;
        editorRef.current.focus();
        if (isStrikethrough !== undefined) {
            applyFormat('strikeThrough');
        }
    }, [isStrikethrough]);

    useEffect(() => {
        if (!mounted || !editorRef.current || !color) return;
        editorRef.current.focus();
        applyFormat('foreColor', color);
    }, [color]);

    useEffect(() => {
        if (!mounted || !editorRef.current || !backgroundColor) return;
        editorRef.current.focus();
        applyFormat('backColor', backgroundColor);
    }, [backgroundColor]);

    if (!mounted) {
        return (
            <div className={className}>
                <div className="p-3 text-gray-400">{placeholder}</div>
            </div>
        );
    }

    return (
        <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            className={className}
            suppressContentEditableWarning
            data-placeholder={placeholder}
            style={{
                minHeight: '80px',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word'
            }}
        />
    );
}
