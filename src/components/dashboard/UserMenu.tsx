'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserCircle, LogOut, ChevronDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface User {
    id: string;
    email: string;
    name: string | null;
}

export function UserMenu() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();
            if (data.user) {
                setUser(data.user);
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-sm text-slate-600">
                <UserCircle className="w-5 h-5" />
                <span>Carregando...</span>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const displayName = user.name || user.email.split('@')[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2.5 text-sm hover:bg-slate-50 rounded-lg transition-all duration-200 group">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                        <div className="relative w-8 h-8 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <div className="hidden md:flex flex-col items-start">
                        <span className="font-semibold text-slate-900">{displayName}</span>
                        <span className="text-xs text-slate-500">{user.email}</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-500 transition-colors" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="flex flex-col items-start px-2 py-1.5">
                    <span className="font-medium">{displayName}</span>
                    <span className="text-xs text-slate-500">{user.email}</span>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/dashboard/account')} className="cursor-pointer">
                    <UserCircle className="w-4 h-4 mr-2" />
                    Minha Conta
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
