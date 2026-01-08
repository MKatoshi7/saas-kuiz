import React from 'react';
import Link from 'next/link';
import { UserMenu } from '@/components/dashboard/UserMenu';
import { Sparkles } from 'lucide-react';

interface DashboardHeaderProps {
    children?: React.ReactNode;
}

export function DashboardHeader({ children }: DashboardHeaderProps) {
    return (
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-black/5">
            <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-2 group">
                        <div className="relative w-8 h-8 flex items-center justify-center overflow-hidden rounded-lg bg-black text-white shadow-lg shadow-black/20 group-hover:scale-105 transition-transform duration-300">
                            <Sparkles className="w-4 h-4 relative z-10" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-semibold tracking-tight leading-none">Kuiz</span>
                            <span className="text-[10px] font-bold text-blue-600 tracking-wider uppercase leading-none mt-0.5">Maker</span>
                        </div>
                    </Link>

                    {/* Custom Navigation/Content */}
                    <div className="ml-4">
                        {children}
                    </div>
                </div>

                {/* User Menu */}
                <UserMenu />
            </div>
        </header>
    );
}
