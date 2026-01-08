import React from 'react';
import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import { LayoutDashboard, Users, Filter, CreditCard, ScrollText, LogOut, Sparkles, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await requireAdmin();

    return (
        <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans selection:bg-blue-500/20">
            {/* Noise Texture */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0 mix-blend-multiply"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
            </div>

            <div className="relative z-10 flex min-h-screen">
                {/* Sidebar Desktop */}
                <aside className="hidden md:flex w-72 flex-col fixed h-screen border-r border-black/5 bg-white/50 backdrop-blur-xl">
                    <div className="p-8">
                        <Link href="/admin" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-lg shadow-black/10 group-hover:scale-105 transition-transform duration-300">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="font-bold text-lg tracking-tight">Kuiz Admin</h1>
                                <p className="text-xs text-gray-500">Painel de Controle</p>
                            </div>
                        </Link>
                    </div>

                    <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                        <NavItem href="/admin" icon={<LayoutDashboard size={20} />} label="Visão Geral" />
                        <NavItem href="/admin/users" icon={<Users size={20} />} label="Usuários" />
                        <NavItem href="/admin/funnels" icon={<Filter size={20} />} label="Funis" />
                        <NavItem href="/admin/finance" icon={<CreditCard size={20} />} label="Financeiro" />
                        <NavItem href="/admin/logs" icon={<ScrollText size={20} />} label="Logs do Sistema" />
                    </nav>

                    <div className="p-6 border-t border-black/5">
                        <Link href="/dashboard">
                            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-black/5 transition-colors">
                                <LogOut size={18} />
                                Voltar ao App
                            </button>
                        </Link>
                    </div>
                </aside>

                {/* Mobile Header */}
                <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-black/5 flex items-center justify-between px-6 z-50">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <span className="font-bold">Admin</span>
                    </div>
                    <Button variant="ghost" size="icon">
                        <Menu className="w-6 h-6" />
                    </Button>
                </div>

                {/* Main Content */}
                <main className="flex-1 md:ml-72 p-6 md:p-12 pt-24 md:pt-12 overflow-x-hidden">
                    <div className="max-w-7xl mx-auto animate-fade-in-up">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-gray-600 hover:text-black hover:bg-white hover:shadow-sm hover:ring-1 hover:ring-black/5 transition-all duration-200 group"
        >
            <span className="text-gray-400 group-hover:text-black transition-colors">{icon}</span>
            {label}
        </Link>
    );
}
