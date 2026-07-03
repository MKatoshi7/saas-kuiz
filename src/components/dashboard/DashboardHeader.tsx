import React from 'react';
import Link from 'next/link';
import { ArrowLeft, User as UserIcon, Settings, LogOut, CreditCard, Clock, Zap } from 'lucide-react';
import {
    DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/button';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getSubscriptionInfo } from '@/lib/subscription';

export async function DashboardHeader({ children }: { children?: React.ReactNode }) {
    const session = await getSession();
    if (!session) return null;

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { id: true, name: true, email: true, subscriptionStatus: true, subscriptionPlan: true, role: true },
    });

    const subInfo = await getSubscriptionInfo(session.userId);

    const getPlanBadge = () => {
        if (user?.role === 'admin') return { label: 'Admin', color: 'text-purple-600 bg-purple-50' };
        if (!subInfo || subInfo.status === 'free') {
            return {
                label: `Trial ${subInfo?.daysRemaining ?? 7}d`,
                color: 'text-amber-600 bg-amber-50'
            };
        }
        if (subInfo.status === 'expired') {
            return { label: 'Expirado', color: 'text-red-600 bg-red-50' };
        }
        if (subInfo.status === 'trial') {
            return {
                label: `Trial ${subInfo.daysRemaining}d`,
                color: 'text-amber-600 bg-amber-50'
            };
        }
        return {
            label: subInfo.plan || 'Pro',
            color: 'text-emerald-600 bg-emerald-50'
        };
    };

    const badge = getPlanBadge();

    return (
        <header className="sticky top-0 z-30 glass-strong border-b border-border/60">
            <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard" className="flex items-center gap-2 group">
                        <div className="h-8 w-8 rounded-lg bg-foreground text-background flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform">
                            K
                        </div>
                        <span className="font-semibold tracking-tight">Kuiz</span>
                    </Link>
                    {children}
                </div>

                <div className="flex items-center gap-2">
                    {user?.role === 'admin' && (
                        <Link href="/admin">
                            <Button variant="outline" size="sm" className="gap-2">
                                <ArrowLeft className="w-3.5 h-3.5" />
                                Admin
                            </Button>
                        </Link>
                    )}

                    <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${badge.color}`}>
                        <Zap className="w-3 h-3" />
                        {badge.label}
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2.5 rounded-full pl-1 pr-3 py-1 hover:bg-secondary transition-colors">
                                <Avatar name={user?.name} email={user?.email} size="sm" />
                                <div className="hidden md:flex flex-col items-start min-w-0">
                                    <span className="text-xs font-medium leading-tight truncate max-w-[120px]">
                                        {user?.name || user?.email?.split('@')[0]}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground leading-tight">
                                        {user?.subscriptionPlan || 'Free'}
                                    </span>
                                </div>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/account" className="cursor-pointer">
                                    <UserIcon className="w-4 h-4" />
                                    Perfil
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/settings" className="cursor-pointer">
                                    <Settings className="w-4 h-4" />
                                    Configurações
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/account#subscription" className="cursor-pointer">
                                    <CreditCard className="w-4 h-4" />
                                    Assinatura
                                    {subInfo && subInfo.daysRemaining !== Infinity && (
                                        <span className="ml-auto text-[10px] text-muted-foreground">
                                            {subInfo.daysRemaining}d
                                        </span>
                                    )}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/api/auth/logout" className="cursor-pointer text-red-600">
                                    <LogOut className="w-4 h-4" />
                                    Sair
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
