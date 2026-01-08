'use client';

import React, { useState } from 'react';
import { CarouselComponent } from '@/types/funnel';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CarouselRendererProps {
    component: CarouselComponent;
    onNext?: () => void;
    onJump?: (stepId: string) => void;
}

export function CarouselRenderer({ component, onNext, onJump }: CarouselRendererProps) {
    const { options = [], variableName } = component.data;
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!options.length) {
        return (
            <div className="w-full aspect-video bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200">
                <p className="text-gray-400">Adicione imagens ao carrossel</p>
            </div>
        );
    }

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? options.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === options.length - 1 ? 0 : prev + 1));
    };

    const handleSelect = (option: any) => {
        if (option.targetStepId) {
            if (onJump) {
                onJump(option.targetStepId);
            } else if (onNext) {
                onNext();
            }
        } else if (onNext) {
            onNext();
        }
    };

    return (
        <div className="relative w-full group">
            <div className="overflow-hidden rounded-xl bg-gray-900 aspect-video relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 w-full h-full"
                    >
                        {options[currentIndex].image ? (
                            <img
                                src={options[currentIndex].image}
                                alt={options[currentIndex].label || ''}
                                className="w-full h-full object-cover"
                                onClick={() => handleSelect(options[currentIndex])}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                Sem imagem
                            </div>
                        )}

                        {/* Caption/Label Overlay */}
                        {options[currentIndex].label && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-4 backdrop-blur-sm">
                                <p className="text-white text-center font-medium">
                                    {options[currentIndex].label}
                                </p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                {options.length > 1 && (
                    <>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handlePrevious();
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleNext();
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </>
                )}
            </div>

            {/* Dots Indicators */}
            {options.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    {options.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={cn(
                                "w-2 h-2 rounded-full transition-all",
                                idx === currentIndex
                                    ? "bg-blue-600 w-6"
                                    : "bg-gray-300 hover:bg-gray-400"
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
