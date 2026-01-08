import React, { useRef } from "react";
import { cn } from "@/lib/utils";
import { TAG_STYLES, SIZE_STYLES, ALIGN_STYLES } from "@/utils/text-styles";

interface TextBlockProps {
    data: {
        text?: string;
        tag?: keyof typeof TAG_STYLES;
        fontSize?: keyof typeof SIZE_STYLES;
        fontSizePixels?: number;
        align?: keyof typeof ALIGN_STYLES;
        color?: string;
        backgroundColor?: string;
        bold?: boolean;
        italic?: boolean;
        underline?: boolean;
        strikethrough?: boolean;
        letterSpacing?: number;
        lineHeight?: number;
        textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
        fontFamily?: string;
    };
    isEditing?: boolean;
    onUpdate?: (newData: any) => void;
}

export function TextBlock({ data, isEditing = false, onUpdate }: TextBlockProps) {
    const textRef = useRef<HTMLElement>(null);

    const Tag = (data.tag || 'p') as React.ElementType;

    const sizeKey = (data.fontSize as keyof typeof SIZE_STYLES) || 'normal';
    const alignKey = (data.align as keyof typeof ALIGN_STYLES) || 'left';

    const handleBlur = () => {
        if (onUpdate && textRef.current) {
            onUpdate({
                ...data,
                text: textRef.current.innerText
            });
        }
    };

    // Build inline styles
    const inlineStyles: React.CSSProperties = {};

    if (data.color) inlineStyles.color = data.color;
    if (data.backgroundColor) inlineStyles.backgroundColor = data.backgroundColor;
    if (data.fontSizePixels) inlineStyles.fontSize = `${data.fontSizePixels}px`;
    if (data.letterSpacing !== undefined) inlineStyles.letterSpacing = `${data.letterSpacing}px`;
    if (data.lineHeight) inlineStyles.lineHeight = data.lineHeight.toString();
    if (data.textTransform) inlineStyles.textTransform = data.textTransform;
    if (data.fontFamily) inlineStyles.fontFamily = data.fontFamily;

    return (
        <Tag
            ref={textRef}
            className={cn(
                "w-full outline-none focus:ring-2 focus:ring-blue-500/20 rounded px-1 transition-all",
                TAG_STYLES[data.tag || 'p'],
                !data.fontSizePixels && SIZE_STYLES[sizeKey],
                ALIGN_STYLES[alignKey],
                data.bold && "font-bold",
                data.italic && "italic",
                data.underline && "underline",
                data.strikethrough && "line-through"
            )}
            style={inlineStyles}
            dangerouslySetInnerHTML={{ __html: data.text || "Clique para editar..." }}
        />
    );
}
