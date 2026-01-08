'use client';



import React from 'react';
import { ArgumentComponent } from '@/types/funnel';
import { Image as ImageIcon } from 'lucide-react';

interface ArgumentRendererProps {
    component: ArgumentComponent;
}

export function ArgumentRenderer({ component }: ArgumentRendererProps) {
    const {
        items = [],
        displayMode = 'text-image',
        layout = '2-columns',
        headline,
        imagePosition = 'top',
        headlineColor,
        textColor
    } = component.data;

    // Layout grid classes
    const gridClass = layout === '3-columns' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
        layout === '2-columns' ? 'grid-cols-1 md:grid-cols-2' :
            'grid-cols-1';

    return (
        <div className="w-full">
            {/* Optional Headline */}
            {headline && (
                <div className="mb-8 text-center">
                    <h2
                        className="text-2xl font-bold inline-block relative"
                        style={{ color: headlineColor || '#2563EB' }} // Default blue-600
                    >
                        {headline}
                        <div className="absolute -bottom-2 left-0 w-full h-1 bg-blue-100 rounded-full" style={{ opacity: 0.5 }}></div>
                    </h2>
                </div>
            )}

            <div className={`grid gap-6 ${gridClass}`}>
                {items.map((item) => {
                    // Skip if no content to show
                    if (displayMode === 'text-only' && !item.title && !item.description) return null;
                    if (displayMode === 'image-only' && !item.imageSrc) return null;

                    // Determine layout classes based on imagePosition
                    const isHorizontal = imagePosition === 'side' || imagePosition === 'side-right';
                    const isReverse = imagePosition === 'bottom' || imagePosition === 'side-right';

                    const containerClasses = isHorizontal
                        ? `flex ${isReverse ? 'flex-row-reverse' : 'flex-row'} items-center text-left gap-4`
                        : `flex flex-col ${isReverse ? 'flex-col-reverse' : 'flex-col'} items-center text-center h-full`;

                    const imageClasses = isHorizontal
                        ? 'w-32 h-32 flex-shrink-0'
                        : 'w-full aspect-[4/3] mt-auto';

                    const textClasses = isHorizontal
                        ? 'flex-1'
                        : 'w-full mb-4';

                    return (
                        <div
                            key={item.id}
                            className={`bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all ${containerClasses}`}
                        >
                            {/* Image Section */}
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
                                        <div className="w-full h-full rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 gap-2 p-2">
                                            <ImageIcon className="w-8 h-8 opacity-50" />
                                            {!isHorizontal && <span className="text-xs font-medium">Adicione uma imagem</span>}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Text Content */}
                            {displayMode !== 'image-only' && (
                                <div className={textClasses}>
                                    {item.title && (
                                        <h3
                                            className="text-lg font-bold mb-2"
                                            style={{ color: headlineColor || '#111827' }} // Default gray-900
                                        >
                                            {item.title}
                                        </h3>
                                    )}
                                    {item.description && (
                                        <p
                                            className="font-medium leading-relaxed"
                                            style={{ color: textColor || '#3B82F6' }} // Default blue-500
                                        >
                                            {item.description}
                                        </p>
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
