'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus } from 'lucide-react';

interface SortableComponentProps {
    id: string;
    children: React.ReactNode;
    isSelected?: boolean;
    onClick?: () => void;
    isOver?: boolean;
}

export function SortableComponent({ id, children, isSelected, onClick, isOver }: SortableComponentProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
        over,
        active,
    } = useSortable({ id });

    const isActiveDragging = active && active.id !== id && (over?.id === id);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        position: 'relative' as const,
        zIndex: isDragging ? 999 : 'auto',
    };

    return (
        <div className="relative group">
            {/* Drop indicator above */}
            {(isOver || isActiveDragging) && (
                <div className="absolute -top-2 left-0 right-0 h-1 bg-blue-500 rounded-full z-20 animate-fade-in-up shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
            )}

            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                onClick={(e) => {
                    if (!isDragging && onClick) {
                        onClick();
                    }
                }}
                className={`touch-none transition-all rounded-lg ${
                    isSelected
                        ? 'ring-2 ring-blue-500 z-10'
                        : 'hover:ring-1 hover:ring-blue-400/60'
                }`}
            >
                {children}
            </div>

            {/* Drop indicator below */}
            {(isOver || isActiveDragging) && (
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-blue-500 rounded-full z-20 animate-fade-in-up shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
            )}
        </div>
    );
}

/**
 * Drop zone indicator shown at end of components list
 */
export function EndDropZone({ visible }: { visible: boolean }) {
    if (!visible) return null
    return (
        <div className="h-12 border-2 border-dashed border-blue-400 rounded-xl flex items-center justify-center text-blue-500 text-sm font-medium bg-blue-50/50 my-2 animate-fade-in-up">
            <Plus className="w-4 h-4 mr-1.5" />
            Solte aqui
        </div>
    )
}
