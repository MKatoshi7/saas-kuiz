'use client';

import React from 'react';
import { ArgumentComponent } from '@/types/funnel';
import { Image as ImageIcon } from 'lucide-react';

interface ArgumentRendererProps {
    component: ArgumentComponent;
}

const SHADOW_MAP: Record<string, string> = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
};

function buildTextStyle(style?: Record<string, any>, fallbackColor?: string): React.CSSProperties {
    if (!style) return {};
    const s: React.CSSProperties = {};
    if (style.color) s.color = style.color;
    else if (fallbackColor) s.color = fallbackColor;
    if (style.fontSize) s.fontSize = `${style.fontSize}px`;
    if (style.fontFamily) s.fontFamily = style.fontFamily;
    if (style.bold) s.fontWeight = 'bold';
    if (style.italic) s.fontStyle = 'italic';
    const decorations: string[] = [];
    if (style.underline) decorations.push('underline');
    if (style.strikethrough) decorations.push('line-through');
    if (decorations.length) s.textDecoration = decorations.join(' ');
    if (style.align) s.textAlign = style.align;
    if (style.textTransform) s.textTransform = style.textTransform;
    if (style.letterSpacing !== undefined) s.letterSpacing = `${style.letterSpacing}px`;
    if (style.lineHeight) s.lineHeight = style.lineHeight;
    return s;
}

export function ArgumentRenderer({ component }: ArgumentRendererProps) {
    const {
        items = [],
        layout = '2-columns',
        headline,
        headlineHtml,
        headlineStyle,
        imagePosition = 'top',
        headlineColor,
        textColor,
        gap = 6,
    } = component.data;
    const displayMode = (component.data.displayMode || 'text-image') as string;

    const gridClass = layout === '3-columns' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
        layout === '2-columns' ? 'grid-cols-1 sm:grid-cols-2' :
            'grid-cols-1';

    const headlineStyles = buildTextStyle(headlineStyle, headlineColor || '#2563EB');

    return (
        <div className="w-full">
            {headline && (
                <div className="mb-8 text-center">
                    <h2
                        className="text-2xl font-bold inline-block relative"
                        style={headlineStyles}
                    >
                        <span dangerouslySetInnerHTML={{ __html: headlineHtml || headline || '' }} />
                        {headlineStyle?.align !== 'left' && headlineStyle?.align !== 'right' && (
                            <div className="absolute -bottom-2 left-0 w-full h-1 bg-blue-100 rounded-full" style={{ opacity: 0.5 }} />
                        )}
                    </h2>
                </div>
            )}

            <div className={`grid gap-${gap} ${gridClass}`}>
                {items.map((item) => {
                    if (displayMode === 'text-only' && !item.title && !item.description) return null;
                    if (displayMode === 'image-only' && !item.imageSrc) return null;

                    const isHorizontal = imagePosition === 'side' || imagePosition === 'side-right';
                    const isReverse = imagePosition === 'bottom' || imagePosition === 'side-right';

                    const containerClasses = isHorizontal
                        ? `flex ${isReverse ? 'flex-row-reverse' : 'flex-row'} items-center text-left gap-4`
                        : `flex flex-col ${isReverse ? 'flex-col-reverse' : 'flex-col'} items-center text-center`;

                    const imageClasses = isHorizontal
                        ? 'w-32 h-32 flex-shrink-0'
                        : 'w-full aspect-[4/3]';

                    const textClasses = isHorizontal
                        ? 'flex-1 min-w-0'
                        : 'w-full';

                    const shadowClass = SHADOW_MAP[item.cardStyle?.shadow || 'sm'] || 'shadow-sm';

                    return (
                        <div
                            key={item.id}
                            className={`rounded-2xl border p-6 transition-all hover:shadow-md ${shadowClass} ${containerClasses}`}
                            style={{
                                backgroundColor: item.cardStyle?.backgroundColor || '#ffffff',
                                borderColor: item.cardStyle?.borderColor || '#f3f4f6',
                                borderWidth: item.cardStyle?.borderWidth ? `${item.cardStyle.borderWidth}px` : undefined,
                                borderRadius: item.cardStyle?.borderRadius !== undefined ? `${item.cardStyle.borderRadius}px` : undefined,
                            }}
                        >
                            {displayMode !== 'text-only' && (
                                <div className={`${imageClasses} ${isReverse && !isHorizontal ? 'mt-auto pt-4' : 'pb-4'}`}>
                                    {item.imageSrc ? (
                                        <div className="w-full h-full rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                                            <img
                                                src={item.imageSrc}
                                                alt={item.title || ''}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full h-full rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 gap-2 p-2 min-h-[100px]">
                                            <ImageIcon className="w-8 h-8 opacity-50" />
                                            {!isHorizontal && <span className="text-xs font-medium">Adicione uma imagem</span>}
                                        </div>
                                    )}
                                </div>
                            )}

                            {displayMode !== 'image-only' && (
                                <div className={`${textClasses} ${!isHorizontal && displayMode !== 'image-only' ? 'text-center' : ''}`}>
                                    {item.title && (
                                        <h3
                                            className="text-lg font-bold mb-2 break-words"
                                            style={buildTextStyle(item.titleStyle, headlineColor || '#111827')}
                                        >
                                            {item.titleHtml ? (
                                                <span dangerouslySetInnerHTML={{ __html: item.titleHtml }} />
                                            ) : (
                                                item.title
                                            )}
                                        </h3>
                                    )}
                                    {item.description && (
                                        <div
                                            className="font-medium leading-relaxed break-words whitespace-pre-wrap"
                                            style={buildTextStyle(item.descriptionStyle, textColor || '#3B82F6')}
                                        >
                                            {item.descriptionHtml ? (
                                                <span dangerouslySetInnerHTML={{ __html: item.descriptionHtml }} />
                                            ) : (
                                                item.description
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
