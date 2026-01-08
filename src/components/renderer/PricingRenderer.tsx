'use client';

import React from 'react';
import { PricingComponent } from '@/types/funnel';
import { Check, Star, Zap, Shield, ArrowRight } from 'lucide-react';

interface PricingRendererProps {
    component: PricingComponent;
    onSelect: (value: string) => void;
    theme?: any;
}

export function PricingRenderer({ component, onSelect, theme }: PricingRendererProps) {
    const {
        title,
        price,
        originalPrice,
        description,
        features = [],
        buttonText,
        buttonUrl,
        variant = 'default',
        badge,
        discount,
        condition,
        recommended,
        highlightColor = '#2563EB'
    } = component.data;

    const handleAction = () => {
        if (buttonUrl) {
            window.open(buttonUrl, '_blank');
        } else {
            onSelect(`${title} - ${price}`);
        }
    };

    // --- Variant 1: Default (Classic Box) ---
    if (variant === 'default') {
        return (
            <div className={`relative p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${recommended ? 'border-blue-500 bg-blue-50/10' : 'border-gray-200 bg-white'}`}>
                {recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                        {badge || 'Recomendado'}
                    </div>
                )}
                <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                    {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-3xl font-bold text-gray-900">{price}</span>
                        {originalPrice && <span className="text-sm text-gray-400 line-through">{originalPrice}</span>}
                    </div>
                    {condition && <p className="text-xs text-gray-500 mt-1">{condition}</p>}
                </div>

                <ul className="space-y-3 mb-8">
                    {features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>

                <button
                    onClick={handleAction}
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all active:scale-95 ${recommended
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                        }`}
                >
                    {buttonText || 'Selecionar'}
                </button>
            </div>
        );
    }

    // --- Variant 2: Minimal (Clean & Typography focused) ---
    if (variant === 'minimal') {
        return (
            <div className="text-center p-8 bg-white">
                {badge && (
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full mb-4">
                        {badge}
                    </span>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
                <div className="flex items-baseline justify-center gap-2 mb-4">
                    <span className="text-4xl font-extrabold text-gray-900 tracking-tight">{price}</span>
                    {originalPrice && <span className="text-lg text-gray-400 line-through">{originalPrice}</span>}
                </div>
                {description && <p className="text-gray-500 mb-8 max-w-sm mx-auto">{description}</p>}

                <button
                    onClick={handleAction}
                    className="group flex items-center justify-center gap-2 w-full max-w-xs mx-auto py-3 px-6 bg-black text-white rounded-full font-medium transition-all hover:bg-gray-800"
                >
                    {buttonText}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                {features.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                            {features.map((feature, i) => (
                                <span key={i} className="flex items-center gap-1">
                                    <Check className="w-3 h-3 text-black" /> {feature}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- Variant 3: Cards (3D/Pop style) ---
    if (variant === 'cards') {
        return (
            <div className="bg-white rounded-3xl border-2 border-gray-900 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-wide">{title}</h3>
                        {badge && <span className="text-xs font-bold bg-yellow-400 px-2 py-0.5 border border-black rounded-sm">{badge}</span>}
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-black text-gray-900">{price}</div>
                        {originalPrice && <div className="text-xs text-gray-500 line-through font-medium">{originalPrice}</div>}
                    </div>
                </div>

                <div className="space-y-3 mb-8 border-t-2 border-dashed border-gray-200 pt-6">
                    {features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-green-100 border border-green-500 flex items-center justify-center shrink-0">
                                <Check className="w-3 h-3 text-green-600" />
                            </div>
                            <span className="font-medium text-gray-700">{feature}</span>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleAction}
                    className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all"
                    style={{ backgroundColor: highlightColor }}
                >
                    {buttonText}
                </button>
            </div>
        );
    }

    // --- Variant 4: Highlight (Dark/Premium) ---
    if (variant === 'highlight') {
        return (
            <div className="bg-gray-900 text-white rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-2xl rounded-full -mr-10 -mt-10"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-medium text-gray-300">{title}</h3>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-4xl font-bold text-white">{price}</span>
                                {originalPrice && <span className="text-lg text-gray-500 line-through">{originalPrice}</span>}
                            </div>
                        </div>
                        {badge && (
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1 rounded-lg text-xs font-medium text-white">
                                {badge}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 mb-8">
                        {features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-3 text-gray-300">
                                <Zap className="w-4 h-4 text-yellow-400 shrink-0" />
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleAction}
                        className="w-full py-3 rounded-lg font-semibold bg-white text-gray-900 hover:bg-gray-100 transition-colors"
                    >
                        {buttonText}
                    </button>

                    {condition && (
                        <p className="text-center text-xs text-gray-500 mt-4">{condition}</p>
                    )}
                </div>
            </div>
        );
    }

    // --- Variant 5: Flat (Simple List) ---
    if (variant === 'flat') {
        return (
            <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                        <h3 className="font-bold text-gray-900">{title}</h3>
                        {badge && <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-0.5 rounded-sm">{badge}</span>}
                    </div>
                    {description && <p className="text-sm text-gray-500 mb-3">{description}</p>}
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                        {features.slice(0, 3).map((feature, i) => (
                            <span key={i} className="text-xs text-gray-600 flex items-center gap-1">
                                <Check className="w-3 h-3 text-green-500" /> {feature}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col items-center gap-3 min-w-[140px]">
                    <div className="text-center">
                        {originalPrice && <div className="text-xs text-gray-400 line-through">{originalPrice}</div>}
                        <div className="text-2xl font-bold text-gray-900">{price}</div>
                    </div>
                    <button
                        onClick={handleAction}
                        className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                        style={{ backgroundColor: highlightColor }}
                    >
                        {buttonText}
                    </button>
                </div>
            </div>
        );
    }

    return null;
}
