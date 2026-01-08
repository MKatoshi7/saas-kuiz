'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Rocket, Sparkles } from 'lucide-react';
import { NewProjectDialog } from '@/components/dashboard/NewProjectDialog';
import { FunnelCard } from '@/components/dashboard/FunnelCard';
import { EmptyState } from '@/components/ui/EmptyState';

interface DashboardClientProps {
    projects: any[];
    isSubscriptionExpired?: boolean;
}

export function DashboardClient({ projects, isSubscriptionExpired }: DashboardClientProps) {
    const [dialogOpen, setDialogOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#F5F5F7] relative">
            {/* Noise Texture Overlay */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0 mix-blend-multiply"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
            </div>

            <div className="relative z-10 p-8 max-w-[1400px] mx-auto">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-[#1D1D1F] mb-2">Meus Projetos</h1>
                        <p className="text-gray-500 text-lg">Gerencie seus funis e quizzes ativos.</p>
                        {isSubscriptionExpired && (
                            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
                                <span className="w-2 h-2 rounded-full bg-red-500" />
                                Assinatura Expirada - Funcionalidades limitadas
                            </div>
                        )}
                    </div>
                    <Button
                        onClick={() => setDialogOpen(true)}
                        disabled={isSubscriptionExpired}
                        className="h-12 px-6 rounded-xl bg-black hover:bg-gray-800 text-white shadow-lg shadow-black/20 hover:shadow-black/30 hover:-translate-y-0.5 transition-all gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="font-medium">Novo Projeto</span>
                    </Button>
                </div>

                {projects.length === 0 ? (
                    <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-300 p-12">
                        <EmptyState
                            title="Nenhum projeto encontrado"
                            description="Comece criando seu primeiro funil de alta conversão e capture leads qualificados."
                            actionLabel="Criar Primeiro Projeto"
                            onAction={() => setDialogOpen(true)}
                            icon={<div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4"><Sparkles className="w-8 h-8 text-blue-600" /></div>}
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {projects.map((project: any) => (
                            <FunnelCard key={project.id} project={project} />
                        ))}
                    </div>
                )}
            </div>

            <NewProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
        </div>
    );
}
