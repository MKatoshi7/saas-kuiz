// Force rebuild
import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { FunnelTabs } from '@/components/dashboard/FunnelTabs';

export default async function ProjectLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ funnelId: string }>;
}) {
    const { funnelId } = await params;

    // Don't render until we have funnelId
    if (!funnelId) {
        return <div className="flex h-screen items-center justify-center">Carregando...</div>;
    }

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            <DashboardHeader>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 border-l border-slate-200 pl-4 ml-2">
                        <Link href="/dashboard" className="text-slate-500 hover:text-cyan-500 transition-colors group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        </Link>
                        <h1 className="font-bold text-sm text-slate-900">Quiz Editor</h1>
                    </div>

                    <div className="flex-1 flex justify-center">
                        <FunnelTabs funnelId={funnelId} />
                    </div>
                </div>
            </DashboardHeader>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden relative">
                {children}
            </main>
        </div>
    );
}

