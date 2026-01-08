'use client';

import React, { use, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

export default function ProjectLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ funnelId: string }>;
}) {
    const pathname = usePathname();
    const { funnelId } = use(params);

    // Memoize tabs to prevent re-creation on every render
    const tabs = useMemo(() => [
        { name: 'Construtor', href: `/dashboard/${funnelId}/builder` },
        { name: 'Leads', href: `/dashboard/${funnelId}/leads` },
        { name: 'Configurações', href: `/dashboard/${funnelId}/settings` },
    ], [funnelId]);

    // Don't render until we have funnelId
    if (!funnelId) {
        return <div className="flex h-screen items-center justify-center">Carregando...</div>;
    }

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            <DashboardHeader>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
                        <Link href="/dashboard" className="text-slate-500 hover:text-cyan-500 transition-colors group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        </Link>
                        <h1 className="font-bold text-sm text-slate-900">Quiz Editor</h1>
                    </div>

                    <nav className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
                        {tabs.map((tab) => {
                            const isActive = pathname?.includes(tab.href);
                            return (
                                <Link key={tab.href} href={tab.href}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`text-xs font-semibold transition-all duration-200 rounded-md relative overflow-hidden ${isActive
                                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                                            }`}
                                    >
                                        {isActive && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                        )}
                                        {tab.name}
                                    </Button>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </DashboardHeader>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden relative">
                {children}
            </main>
        </div>
    );
}
