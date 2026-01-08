import React from 'react';

interface UnifiedTextRendererProps {
    text: string;
    tag?: 'h1' | 'h2' | 'h3' | 'p' | 'div';
    fontSize?: string;
    align?: string;
    color?: string;
    className?: string;
    fontWeight?: string;
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
    fontWeight,
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

        if (color) {
            styles.color = color;
        }

        if (fontWeight) {
            styles.fontWeight = fontWeight;
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

    return (
        <Tag
            className={`${baseClass} ${sizeClass} ${alignClass} ${letterSpacingClass} ${lineHeightClass} ${textTransformClass} ${className}`}
            style={buildStyles()}
            dangerouslySetInnerHTML={{ __html: text || '' }}
        />
    );
}
