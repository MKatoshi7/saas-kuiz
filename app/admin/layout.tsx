'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Filter,
    CreditCard,
    ScrollText,
    LogOut,
    Sparkles,
    Menu,
    X,
    Activity,
    ChevronRight,
    Tag,
    Send,
    Webhook,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';

const navItems = [
    { href: '/admin', label: 'Visão Geral', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Usuários', icon: Users },
    { href: '/admin/funnels', label: 'Funis', icon: Filter },
    { href: '/admin/coupons', label: 'Cupons', icon: Tag },
    { href: '/admin/broadcasts', label: 'Broadcast', icon: Send },
    { href: '/admin/webhooks', label: 'Webhooks', icon: Webhook },
    { href: '/admin/finance', label: 'Financeiro', icon: CreditCard },
    { href: '/admin/audit', label: 'Audit Log', icon: Activity },
    { href: '/admin/logs', label: 'Logs do Sistema', icon: ScrollText },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminShell>{children}</AdminShell>
    );
}

function AdminShell({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    return (
        <div className="min-h-screen bg-[#F5F5F7] text-foreground font-sans antialiased">
            <div className="relative z-10 flex min-h-screen">
                <aside className="hidden md:flex w-72 flex-col fixed h-screen border-r border-border/60 bg-background/80 backdrop-blur-xl">
                    <SidebarContent />
                </aside>

                {/* Mobile Top Bar */}
                <div className="md:hidden fixed top-0 left-0 right-0 h-14 glass-strong border-b border-border/60 flex items-center justify-between px-4 z-50">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-foreground rounded-lg flex items-center justify-center text-background">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <span className="font-semibold">Kuiz Admin</span>
                    </div>
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="h-9 w-9 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors"
                        aria-label="Abrir menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>

                {/* Mobile Drawer */}
                {mobileOpen && (
                    <>
                        <div
                            className="md:hidden fixed inset-0 bg-black/40 z-50 animate-fade-in-up"
                            onClick={() => setMobileOpen(false)}
                        />
                        <aside className="md:hidden fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-background z-50 animate-fade-in-up shadow-2xl">
                            <div className="flex items-center justify-between p-5 border-b border-border/60">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 bg-foreground rounded-lg flex items-center justify-center text-background">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <span className="font-semibold">Kuiz Admin</span>
                                </div>
                                <button
                                    onClick={() => setMobileOpen(false)}
                                    className="h-9 w-9 rounded-lg hover:bg-secondary flex items-center justify-center"
                                    aria-label="Fechar menu"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <SidebarContent />
                        </aside>
                    </>
                )}

                <main className="flex-1 md:ml-72 p-6 md:p-10 pt-20 md:pt-10 overflow-x-hidden">
                    <div className="max-w-7xl mx-auto">{children}</div>
                </main>
            </div>
        </div>
    );
}

function SidebarContent() {
    const pathname = usePathname();

    return (
        <>
            <div className="p-6">
                <Link href="/admin" className="flex items-center gap-3 group">
                    <div className="h-10 w-10 bg-foreground rounded-xl flex items-center justify-center text-background shadow-sm group-hover:scale-105 transition-transform">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="font-semibold text-base tracking-tight">Kuiz Admin</h1>
                        <p className="text-[11px] text-muted-foreground">Painel de Controle</p>
                    </div>
                </Link>
            </div>

            <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive =
                        item.href === '/admin'
                            ? pathname === '/admin'
                            : pathname.startsWith(item.href);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                                isActive
                                    ? 'bg-foreground text-background shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                            )}
                        >
                            <Icon
                                className={cn(
                                    'h-4 w-4 transition-colors',
                                    isActive ? 'text-background' : 'text-muted-foreground group-hover:text-foreground'
                                )}
                            />
                            <span className="flex-1">{item.label}</span>
                            {isActive && <ChevronRight className="h-3.5 w-3.5" />}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-3 border-t border-border/60">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    Voltar ao App
                </Link>
            </div>
        </>
    );
}
