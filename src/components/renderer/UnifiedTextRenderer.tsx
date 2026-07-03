import React from 'react';

interface TextStyle {
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

interface UnifiedTextRendererProps {
    text: string;
    textHtml?: string;
    textStyle?: TextStyle;
    tag?: 'h1' | 'h2' | 'h3' | 'p' | 'div';
    fontSize?: string;
    align?: string;
    color?: string;
    className?: string;
    fontWeight?: string;
    fontFamily?: string;
    letterSpacing?: 'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest';
    lineHeight?: 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    dropShadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    textStroke?: {
        width?: number;
        color?: string;
    };
}

export function UnifiedTextRenderer({
    text,
    textHtml,
    textStyle,
    tag = 'p',
    fontSize,
    align,
    color,
    className = '',
    fontWeight,
    fontFamily,
    letterSpacing,
    lineHeight,
    textTransform,
    dropShadow,
    textStroke
}: UnifiedTextRendererProps) {
    const Tag = tag as React.ElementType;

    // Font size mapping - atualizado com novos tamanhos
    const getFontSizeClass = () => {
        switch (fontSize) {
            // New size system (from TextToolbar)
            case 'micro':
                return 'text-[8px]';  // 8px
            case 'minusculo':
                return 'text-xs';     // 12px
            case 'small':
                return 'text-base';  // 16px (era 14px)
            case 'normal':
                return 'text-lg';    // 18px (era 16px)
            case 'medium':
                return 'text-xl';    // 20px (era 18px)
            case 'big':
                return 'text-2xl';   // 24px
            case 'bigger':
                return 'text-3xl';   // 30px (era 32px)
            case 'huge':
                return 'text-4xl';   // 36px (era 48px)

            // Legacy size system (for backwards compatibility)
            case '4xl':
                return 'text-4xl';
            case '3xl':
                return 'text-3xl';
            case '2xl':
                return 'text-2xl';
            case 'xl':
                return 'text-xl';
            case 'lg':
                return 'text-lg';
            case 'largest':
                return 'text-2xl';
            case 'larger':
                return 'text-xl';
            case 'large':
                return 'text-lg';

            default:
                return 'text-base';
        }
    };

    // Letter spacing classes
    const getLetterSpacingClass = () => {
        switch (letterSpacing) {
            case 'tighter': return 'tracking-tighter';
            case 'tight': return 'tracking-tight';
            case 'wide': return 'tracking-wide';
            case 'wider': return 'tracking-wider';
            case 'widest': return 'tracking-widest';
            default: return 'tracking-normal';
        }
    };

    // Line height classes
    const getLineHeightClass = () => {
        switch (lineHeight) {
            case 'tight': return 'leading-tight';
            case 'snug': return 'leading-snug';
            case 'relaxed': return 'leading-relaxed';
            case 'loose': return 'leading-loose';
            default: return 'leading-normal';
        }
    };

    // Text transform classes
    const getTextTransformClass = () => {
        switch (textTransform) {
            case 'uppercase': return 'uppercase';
            case 'lowercase': return 'lowercase';
            case 'capitalize': return 'capitalize';
            default: return '';
        }
    };

    const sizeClass = getFontSizeClass();
    const letterSpacingClass = getLetterSpacingClass();
    const lineHeightClass = getLineHeightClass();
    const textTransformClass = getTextTransformClass();

    // Alignment
    const alignClass = align === 'center' ? 'text-center' :
        align === 'right' ? 'text-right' :
            align === 'justify' ? 'text-justify' : 'text-left';

    // Base styling igual ao FunnelEngine
    const baseClass = tag === 'h1' ? 'font-bold text-gray-900' :
        tag === 'p' ? 'text-gray-600' : 'text-gray-700';

    // Build inline styles for advanced effects
    const buildStyles = (): React.CSSProperties => {
        const styles: React.CSSProperties = {};

        // If textStyle is provided (from MiniToolbar), use it directly
        if (textStyle) {
            if (textStyle.color) styles.color = textStyle.color;
            if (textStyle.fontSize) styles.fontSize = `${textStyle.fontSize}px`;
            if (textStyle.fontFamily) styles.fontFamily = textStyle.fontFamily;
            if (textStyle.bold) styles.fontWeight = 'bold';
            if (textStyle.italic) styles.fontStyle = 'italic';
            const decorations: string[] = [];
            if (textStyle.underline) decorations.push('underline');
            if (textStyle.strikethrough) decorations.push('line-through');
            if (decorations.length) styles.textDecoration = decorations.join(' ');
            if (textStyle.align) styles.textAlign = textStyle.align;
            if (textStyle.textTransform) styles.textTransform = textStyle.textTransform;
            if (textStyle.letterSpacing !== undefined) styles.letterSpacing = `${textStyle.letterSpacing}px`;
            if (textStyle.lineHeight) styles.lineHeight = textStyle.lineHeight;
            return styles;
        }

        // Fallback to individual props
        if (color) {
            styles.color = color;
        }

        if (fontWeight) {
            styles.fontWeight = fontWeight;
        }

        if (fontFamily) {
            styles.fontFamily = fontFamily;
        }

        // Drop shadow (hard 3D style)
        if (dropShadow && dropShadow !== 'none') {
            const shadows = {
                sm: '1px 1px 0px rgba(0, 0, 0, 0.5)',
                md: '2px 2px 0px rgba(0, 0, 0, 0.5)',
                lg: '3px 3px 0px rgba(0, 0, 0, 0.5)',
                xl: '5px 5px 0px rgba(0, 0, 0, 0.5)'
            };
            styles.textShadow = shadows[dropShadow];
        }

        // Text stroke (outline)
        if (textStroke?.width && textStroke?.color) {
            styles.WebkitTextStroke = `${textStroke.width}px ${textStroke.color}`;
            styles.paintOrder = 'stroke fill';
        }

        return styles;
    };

    // Sanitização simples: remove tags perigosas, mantém formatação básica
    const sanitizedText = (textHtml || text || '')
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '')
        .replace(/<object\b[^>]*>[\s\S]*?<\/object>/gi, '')
        .replace(/<embed\b[^>]*\/?>/gi, '')
        .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/\son\w+\s*=\s*\S+/gi, '');

    return (
        <Tag
            className={`${baseClass} ${sizeClass} ${alignClass} ${letterSpacingClass} ${lineHeightClass} ${textTransformClass} ${className}`}
            style={buildStyles()}
            dangerouslySetInnerHTML={{ __html: sanitizedText }}
        />
    );
}
