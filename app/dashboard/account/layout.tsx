import React from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

export default function AccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <DashboardHeader />
            {children}
        </>
    );
}
