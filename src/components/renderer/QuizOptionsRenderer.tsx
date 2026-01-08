'use client';

import React, { useState } from 'react';
import { QuizOptionComponent, QuizOptionItem, FunnelTheme } from '@/types/funnel';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface QuizOptionsRendererProps {
    component: QuizOptionComponent;
    onNext: () => void;
    onAnswer: (value: any) => void;
    funnelId?: string;
    stepId?: string;
    theme?: FunnelTheme;
}

export function QuizOptionsRenderer({ component, onNext, onAnswer, funnelId, stepId, theme }: QuizOptionsRendererProps) {
    const {
        options = [],
        allowMultiple,
        disableAutoAdvance,
        required,
        buttonStyle = 'outline',
        backgroundColor = '#ffffff',
        textColor = '#111827',
        spacing = 12,
        borderRadius = 'xl'
    } = component.data;
    const [selectedValues, setSelectedValues] = useState<string[]>([]);

    const primaryColor = theme?.primaryColor || '#2563EB';

    const handleSelect = (option: QuizOptionItem) => {
        const value = option.value || option.label;

        if (allowMultiple) {
            const newSelected = selectedValues.includes(value)
                ? selectedValues.filter(v => v !== value)
                : [...selectedValues, value];

            setSelectedValues(newSelected);
        } else {
            // Single select
            // Ensure we clear any previous selection first to avoid visual glitches
            setSelectedValues([value]);

            // Call onAnswer to trigger tracking in parent
            onAnswer(option.label);

            if (!disableAutoAdvance) {
                setTimeout(() => {
                    onNext();
                }, 200); // Fast transition
            }
        }
    };

    const handleContinue = () => {
        if (required && selectedValues.length === 0) return;
        onAnswer(selectedValues);
        onNext();
    };

    const radiusClass = {
        'sm': 'rounded-sm',
        'md': 'rounded-md',
        'lg': 'rounded-lg',
        'xl': 'rounded-xl',
        'full': 'rounded-full'
    }[borderRadius] || 'rounded-xl';

    return (
        <div className="space-y-6">
            <div
                className={cn(
                    "grid",
                    component.data.layout === 'grid' ? "grid-cols-2" : "grid-cols-1"
                )}
                style={{ gap: `${spacing}px` }}
            >
                {options.map((option) => {
                    const isSelected = selectedValues.includes(option.value || option.label);
                    const checkPosition = component.data.checkPosition || 'right';
                    const emojiPosition = component.data.emojiPosition || 'left';
                    const showCheck = component.data.showCheck !== false;
                    const showEmoji = component.data.showEmoji !== false;

                    // Determine styles based on buttonStyle and selection
                    let btnBg = backgroundColor;
                    let btnBorder = 'transparent';
                    let btnText = textColor;
                    let btnShadow = 'shadow-sm hover:shadow-md';

                    if (buttonStyle === 'outline') {
                        btnBorder = isSelected ? primaryColor : '#e5e7eb'; // gray-200
                        btnBg = isSelected ? `${primaryColor}10` : backgroundColor;
                        btnText = isSelected ? primaryColor : textColor;
                    } else if (buttonStyle === 'solid') {
                        btnBg = isSelected ? primaryColor : backgroundColor;
                        btnText = isSelected ? '#ffffff' : textColor;
                        btnBorder = 'transparent';
                    } else if (buttonStyle === 'ghost') {
                        btnBg = isSelected ? `${primaryColor}10` : 'transparent';
                        btnText = isSelected ? primaryColor : textColor;
                        btnBorder = 'transparent';
                        btnShadow = 'none';
                    } else if (buttonStyle.startsWith('shadow-')) {
                        // Handle shadow-sm, shadow-md, shadow-lg
                        btnBg = isSelected ? primaryColor : backgroundColor;
                        btnText = isSelected ? '#ffffff' : textColor;
                        btnBorder = 'transparent';
                        btnShadow = buttonStyle; // Use the class directly
                    } else if (buttonStyle === '3d') {
                        btnBg = isSelected ? primaryColor : backgroundColor;
                        btnText = isSelected ? '#ffffff' : textColor;
                        btnBorder = 'transparent';
                        // 3D effect logic
                        btnShadow = isSelected
                            ? `shadow-[0_2px_0_0_rgba(0,0,0,0.2)] translate-y-1`
                            : `shadow-[0_6px_0_0_rgba(0,0,0,0.2)] hover:shadow-[0_4px_0_0_rgba(0,0,0,0.2)] hover:translate-y-0.5`;
                    }

                    const CheckIndicator = () => (
                        <div
                            className={cn(
                                "w-6 h-6 border-2 flex items-center justify-center transition-colors flex-shrink-0",
                                allowMultiple ? "rounded-md" : "rounded-full",
                                !isSelected && "border-gray-300"
                            )}
                            style={{
                                borderColor: isSelected ? ((buttonStyle === 'solid' || buttonStyle === '3d' || buttonStyle.startsWith('shadow-')) ? 'white' : primaryColor) : undefined,
                                backgroundColor: isSelected ? ((buttonStyle === 'solid' || buttonStyle === '3d' || buttonStyle.startsWith('shadow-')) ? 'white' : primaryColor) : undefined,
                                color: isSelected ? ((buttonStyle === 'solid' || buttonStyle === '3d' || buttonStyle.startsWith('shadow-')) ? primaryColor : 'white') : undefined,
                            }}
                        >
                            {isSelected && <Check className="w-4 h-4" />}
                        </div>
                    );

                    const EmojiOrImage = () => {
                        if (option.imageSrc) {
                            return (
                                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                                    <img src={option.imageSrc} alt="" className="w-full h-full object-cover" />
                                </div>
                            );
                        }
                        if (option.emoji) {
                            return <span className="text-4xl flex-shrink-0 leading-none">{option.emoji}</span>;
                        }
                        return null;
                    };

                    return (
                        <button
                            key={option.id}
                            onClick={() => handleSelect(option)}
                            className={cn(
                                "relative w-full flex items-center gap-4 p-4 border-2 transition-all group text-left",
                                radiusClass,
                                btnShadow
                            )}
                            style={{
                                borderColor: btnBorder,
                                backgroundColor: btnBg,
                                color: btnText
                            }}
                        >
                            {/* Left Side */}
                            {checkPosition === 'left' && showCheck && <CheckIndicator />}
                            {emojiPosition === 'left' && showEmoji && <EmojiOrImage />}

                            {/* Label */}
                            <div className="flex-1">
                                <span className={cn(
                                    "font-medium block",
                                    component.data.fontSize === 'sm' ? 'text-sm' :
                                        component.data.fontSize === 'lg' ? 'text-lg' :
                                            component.data.fontSize === 'xl' ? 'text-xl' :
                                                'text-base' // Default to base (md)
                                )}>
                                    {option.label}
                                </span>
                            </div>

                            {/* Right Side */}
                            {emojiPosition === 'right' && showEmoji && <EmojiOrImage />}
                            {checkPosition === 'right' && showCheck && <CheckIndicator />}
                        </button>
                    );
                })}
            </div>

            {/* Continue Button for Manual Advance */}
            {
                (allowMultiple || disableAutoAdvance) && (
                    <button
                        onClick={handleContinue}
                        disabled={required && selectedValues.length === 0}
                        className="w-full py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all rounded-lg disabled:opacity-50"
                        style={{
                            backgroundColor: primaryColor,
                            color: 'white',
                        }}
                    >
                        Continuar
                    </button>
                )
            }
        </div >
    );
}

