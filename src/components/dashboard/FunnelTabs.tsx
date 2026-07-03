'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function FunnelTabs({ funnelId }: { funnelId: string }) {
    const pathname = usePathname();

    const tabs = useMemo(() => [
        { name: 'Construtor', href: `/dashboard/${funnelId}/builder` },
        { name: 'Leads', href: `/dashboard/${funnelId}/leads` },
        { name: 'Configurações', href: `/dashboard/${funnelId}/settings` },
    ], [funnelId]);

    return (
        <nav className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-xl border border-slate-200/60 backdrop-blur-sm">
            {tabs.map((tab) => {
                const isActive = pathname?.includes(tab.href);
                return (
                    <Link key={tab.href} href={tab.href}>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`text-xs font-bold px-5 py-1.5 transition-all duration-300 rounded-lg relative ${isActive
                                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                                }`}
                        >
                            {tab.name}
                        </Button>
                    </Link>
                );
            })}
        </nav>
    );
}
