'use client';

import { ReactNode } from 'react';

interface ToolbarProps {
    children: ReactNode;
    className?: string;
}

export function Toolbar({ children, className = '' }: ToolbarProps) {
    return (
        <div className={`bg-white/80 backdrop-blur-xl border-b border-black/5 px-6 py-3 flex items-center justify-between sticky top-0 z-40 ${className}`}>
            {children}
        </div>
    );
}

interface ToolbarSectionProps {
    children: ReactNode;
    className?: string;
}

export function ToolbarSection({ children, className = '' }: ToolbarSectionProps) {
    return (
        <div className={`flex items-center gap-4 ${className}`}>
            {children}
        </div>
    );
}

export function ToolbarDivider() {
    return <div className="w-px h-6 bg-black/5" />;
}
