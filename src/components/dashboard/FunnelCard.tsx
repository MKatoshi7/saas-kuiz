'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, Trash2, ExternalLink, Copy, TrendingUp, Eye, BarChart3 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { useFunnelStats } from "@/hooks/useFunnelStats";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface FunnelCardProps {
    project: {
        id: string;
        title: string;
        description: string | null;
        status: string;
        updatedAt: Date;
        _count: {
            sessions: number;
        };
    };
    isSubscriptionExpired?: boolean;
}

export function FunnelCard({ project, isSubscriptionExpired }: FunnelCardProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDuplicating, setIsDuplicating] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const stats = useFunnelStats(project.id);

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isSubscriptionExpired) return;
        setShowDeleteDialog(true);
    };

    const handleDelete = async () => {
        if (isSubscriptionExpired) return;
        setIsDeleting(true);

        try {
            const response = await fetch(`/api/funnels/${project.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete funnel');
            }

            toast.success('Funil deletado com sucesso!');
            router.refresh();
        } catch (error) {
            console.error('Error deleting funnel:', error);
            toast.error('Erro ao deletar funil. Tente novamente.');
            setIsDeleting(false);
        }
    };

    const handleDuplicate = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isSubscriptionExpired) return;

        setIsDuplicating(true);

        try {
            const response = await fetch(`/api/funnels/${project.id}/duplicate`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to duplicate funnel');
            }

            toast.success('Funil duplicado com sucesso!');
            router.refresh();
        } catch (error) {
            console.error('Error duplicating funnel:', error);
            toast.error('Erro ao duplicar funil. Tente novamente.');
            setIsDuplicating(false);
        }
    };

    const handleOpenEditor = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isSubscriptionExpired) {
            toast.error('Sua assinatura expirou. Renove para editar.');
            return;
        }
        router.push(`/dashboard/${project.id}/builder`);
    };

    const handlePreview = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(`/f/${project.id}`, '_blank');
    };

    return (
        <>
            <div className="group bg-white rounded-3xl border border-black/5 shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all duration-300 flex flex-col h-full overflow-hidden hover:-translate-y-1">
                {/* Card Header */}
                <div className="p-6 pb-4">
                    <div className="flex justify-between items-start mb-3">
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${project.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                            }`}>
                            {project.status === 'published' ? '🟢 Ativo' : '⚪ Rascunho'}
                        </div>
                        <button
                            onClick={handleDeleteClick}
                            disabled={isSubscriptionExpired}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 disabled:opacity-30 disabled:hover:text-gray-400 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                            title={isSubscriptionExpired ? "Assinatura expirada" : "Deletar"}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                    <h3 className="text-xl font-bold text-[#1D1D1F] mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {project.title}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2 h-10">
                        {project.description || "Sem descrição"}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="px-6 py-2 flex-1">
                    <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-100">
                        <div className="text-center">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Views</div>
                            <div className="text-lg font-bold text-[#1D1D1F]">{stats.isLoading ? '-' : stats.views}</div>
                        </div>
                        <div className="text-center border-l border-gray-100">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Leads</div>
                            <div className="text-lg font-bold text-[#1D1D1F]">{stats.isLoading ? '-' : stats.leads}</div>
                        </div>
                        <div className="text-center border-l border-gray-100">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Taxa</div>
                            <div className="text-lg font-bold text-[#1D1D1F]">{stats.isLoading ? '-' : `${stats.conversionRate}%`}</div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-2 px-2">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDistanceToNow(project.updatedAt, { addSuffix: true, locale: ptBR })}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            onClick={handleOpenEditor}
                            disabled={isSubscriptionExpired}
                            className="bg-black hover:bg-gray-800 text-white shadow-md shadow-black/10 h-9 rounded-xl text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            title={isSubscriptionExpired ? "Assinatura expirada" : "Editar"}
                        >
                            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                            Editor
                        </Button>
                        <Button
                            onClick={handlePreview}
                            variant="outline"
                            className="bg-white border-gray-200 hover:bg-gray-50 text-gray-700 h-9 rounded-xl text-xs font-medium"
                        >
                            <Eye className="w-3.5 h-3.5 mr-1.5" />
                            Preview
                        </Button>
                    </div>
                    <Button
                        onClick={handleDuplicate}
                        variant="ghost"
                        size="sm"
                        className="w-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 h-8 rounded-lg text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isDuplicating || isSubscriptionExpired}
                        title={isSubscriptionExpired ? "Assinatura expirada" : "Duplicar"}
                    >
                        <Copy className="w-3 h-3 mr-1.5" />
                        {isDuplicating ? 'Duplicando...' : 'Duplicar Projeto'}
                    </Button>
                </div>
            </div>

            <ConfirmDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={handleDelete}
                title="Deletar Funil"
                description={`Tem certeza que deseja deletar o funil "${project.title}"? Esta ação não pode ser desfeita e todos os dados serão perdidos permanentemente.`}
                confirmText="Sim, Deletar"
                cancelText="Cancelar"
                variant="danger"
                isLoading={isDeleting}
            />
        </>
    );
}
