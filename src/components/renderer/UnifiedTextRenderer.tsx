import React from 'react';

interface UnifiedTextRendererProps {
    text: string;
    tag?: 'h1' | 'h2' | 'h3' | 'p' | 'div';
    fontSize?: string;
    align?: string;
    color?: string;
    className?: string;
    // Phase 1 Enhancements
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
    tag = 'p',
    fontSize,
    align,
    color,
    className = '',
    letterSpacing,
    lineHeight,
    textTransform,
    dropShadow,
    textStroke
}: UnifiedTextRendererProps) {
    const Tag = tag as React.ElementType;

    // Font size mapping - supports all TextToolbar size options
    const getFontSizeClass = () => {
        switch (fontSize) {
            // New size system (from TextToolbar)
            case 'small':
                return 'text-sm';
            case 'normal':
                return 'text-base';
            case 'medium':
                return 'text-lg';
            case 'big':
                return 'text-xl';
            case 'bigger':
                return 'text-2xl';
            case 'huge':
                return 'text-4xl';

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

        if (color) {
            styles.color = color;
        }

        // Drop shadow
        if (dropShadow && dropShadow !== 'none') {
            const shadows = {
                sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
                md: '0 2px 4px rgba(0, 0, 0, 0.1)',
                lg: '0 4px 6px rgba(0, 0, 0, 0.15)',
                xl: '0 8px 12px rgba(0, 0, 0, 0.2)'
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

    return (
        <Tag
            className={`${baseClass} ${sizeClass} ${alignClass} ${letterSpacingClass} ${lineHeightClass} ${textTransformClass} ${className}`}
            style={buildStyles()}
            dangerouslySetInnerHTML={{ __html: text || '' }}
        />
    );
}
