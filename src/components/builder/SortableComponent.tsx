'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableComponentProps {
    id: string;
    children: React.ReactNode;
    isSelected?: boolean;
    onClick?: () => void;
}

export function SortableComponent({ id, children, isSelected, onClick }: SortableComponentProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative' as const,
        zIndex: isDragging ? 999 : 'auto',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={(e) => {
                // Prevent drag click from triggering selection immediately if dragging
                if (!isDragging && onClick) {
                    onClick();
                }
            }}
            className={`touch-none transition-all ${isSelected ? 'ring-2 ring-blue-500 rounded z-10' : 'hover:ring-1 hover:ring-blue-400 hover:shadow-sm rounded'}`}
        >
            {children}
        </div>
    );
}
