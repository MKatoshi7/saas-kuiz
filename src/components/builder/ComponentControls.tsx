import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { GripHorizontal, Edit2, Copy, Trash2 } from 'lucide-react';

interface ComponentControlsProps {
    anchorRef: React.RefObject<HTMLElement>;
    isVisible: boolean;
    onEdit: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
}

export function ComponentControls({ anchorRef, isVisible, onEdit, onDuplicate, onDelete }: ComponentControlsProps) {
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

    useEffect(() => {
        if (!anchorRef?.current || !isVisible) return;

        const updatePosition = () => {
            if (anchorRef.current) {
                const rect = anchorRef.current.getBoundingClientRect();
                setCoords({
                    top: rect.top,
                    left: rect.right, // Align to right edge
                    width: rect.width
                });
            }
        };

        updatePosition();
        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);

        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [anchorRef, isVisible]);

    if (!isVisible) return null;

    const menu = (
        <div
            className="fixed z-[9998] flex items-center gap-0.5 px-1.5 py-1 bg-black rounded-t-lg shadow-lg animate-in fade-in zoom-in-95 duration-100"
            style={{
                top: coords.top,
                left: coords.left,
                transform: 'translate(-100%, -100%)', // Move up and left to sit on top-right corner
                marginTop: '-4px' // Small gap
            }}
        >
            {/* Drag Handle */}
            <div className="text-white hover:text-white/90 cursor-grab p-1">
                <GripHorizontal className="w-3 h-3" />
            </div>

            <div className="w-px h-3 bg-white/30 mx-0.5" />

            {/* Edit */}
            <button
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="text-white hover:text-white/90 p-1 hover:bg-white/20 rounded transition-colors"
                title="Editar"
            >
                <Edit2 className="w-3 h-3" />
            </button>

            {/* Duplicate */}
            <button
                onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                className="text-white hover:text-white/90 p-1 hover:bg-white/20 rounded transition-colors"
                title="Duplicar"
            >
                <Copy className="w-3 h-3" />
            </button>

            {/* Delete */}
            <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="text-white hover:text-white/90 p-1 hover:bg-red-500 rounded transition-colors"
                title="Excluir"
            >
                <Trash2 className="w-3 h-3" />
            </button>
        </div>
    );

    if (typeof document !== 'undefined') {
        return createPortal(menu, document.body);
    }

    return null;
}
