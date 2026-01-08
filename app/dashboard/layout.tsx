import React from 'react';
import Link from 'next/link';
import { UserMenu } from '@/components/dashboard/UserMenu';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Main Dashboard Navbar - Removed to allow per-page customization */}


            <main>
                {children}
            </main>
        </div>
    );
}
