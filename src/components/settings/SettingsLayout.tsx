'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Bell, CreditCard, Shield, Globe } from 'lucide-react';

interface SettingsLayoutProps {
    children?: React.ReactNode;
    defaultTab?: string;
}

export function SettingsLayout({ children, defaultTab = 'profile' }: SettingsLayoutProps) {
    const [activeTab, setActiveTab] = useState(defaultTab);

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
                <p className="text-gray-600 mt-2">Gerencie suas preferências e configurações da conta</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
                    <TabsTrigger value="profile" className="gap-2">
                        <User className="w-4 h-4" />
                        <span className="hidden sm:inline">Perfil</span>
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="gap-2">
                        <Bell className="w-4 h-4" />
                        <span className="hidden sm:inline">Notificações</span>
                    </TabsTrigger>
                    <TabsTrigger value="billing" className="gap-2">
                        <CreditCard className="w-4 h-4" />
                        <span className="hidden sm:inline">Assinatura</span>
                    </TabsTrigger>
                    <TabsTrigger value="security" className="gap-2">
                        <Shield className="w-4 h-4" />
                        <span className="hidden sm:inline">Segurança</span>
                    </TabsTrigger>
                    <TabsTrigger value="domain" className="gap-2">
                        <Globe className="w-4 h-4" />
                        <span className="hidden sm:inline">Domínio</span>
                    </TabsTrigger>
                </TabsList>

                {children}
            </Tabs>
        </div>
    );
}
