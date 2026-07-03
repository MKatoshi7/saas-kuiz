'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Calendar, Trash2, ExternalLink, Copy, Eye, BarChart3,
    MoreHorizontal, Settings, Globe
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState } from 'react';
import { useFunnelStats } from '@/hooks/useFunnelStats';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
    DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface FunnelCardProps {
    project: {
        id: string;
        title: string;
        description: string | null;
        slug: string;
        customDomain: string | null;
        status: string;
        isBanned?: boolean;
        updatedAt: Date;
        _count: {
            sessions: number;
        };
    };
    isSubscriptionExpired?: boolean;
    layout?: 'grid' | 'list';
}

export function FunnelCard({ project, isSubscriptionExpired, layout = 'grid' }: FunnelCardProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDuplicating, setIsDuplicating] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const stats = useFunnelStats(project.id);

    const handleDelete = async () => {
        if (isSubscriptionExpired) return;
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/funnels/${project.id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete funnel');
            toast.success('Funil deletado com sucesso!');
            router.refresh();
        } catch (error) {
            console.error('Error deleting funnel:', error);
            toast.error('Erro ao deletar funil. Tente novamente.');
            setIsDeleting(false);
        }
    };

    const handleDuplicate = async (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        if (isSubscriptionExpired) return;
        setIsDuplicating(true);
        try {
            const response = await fetch(`/api/funnels/${project.id}/duplicate`, { method: 'POST' });
            if (!response.ok) throw new Error('Failed to duplicate funnel');
            toast.success('Funil duplicado com sucesso!');
            router.refresh();
        } catch (error) {
            console.error('Error duplicating funnel:', error);
            toast.error('Erro ao duplicar funil.');
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

    const isPublished = project.status === 'published';

    if (layout === 'list') {
        return (
            <>
                <Card hover className="group">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-sm font-semibold truncate">{project.title}</h3>
                                {project.isBanned ? (
                                    <Badge variant="destructive" size="sm" dot>Banido</Badge>
                                ) : isPublished ? (
                                    <Badge variant="success" size="sm" dot>Publicado</Badge>
                                ) : (
                                    <Badge variant="secondary" size="sm" dot>Rascunho</Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                                <span className="font-mono">/{project.slug}</span>
                                <span>·</span>
                                <span>{project._count.sessions} sessões</span>
                                <span>·</span>
                                <span>{formatDistanceToNow(project.updatedAt, { addSuffix: true, locale: ptBR })}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon-sm" onClick={handlePreview}><Eye className="w-4 h-4" /></Button>
                            <Button size="sm" onClick={handleOpenEditor} disabled={isSubscriptionExpired}>
                                Editar
                            </Button>
                            <CardActionsMenu
                                onDuplicate={handleDuplicate}
                                onDelete={() => setShowDeleteDialog(true)}
                                isDuplicating={isDuplicating}
                                isSubscriptionExpired={isSubscriptionExpired}
                                router={router}
                                project={project}
                            />
                        </div>
                    </CardContent>
                </Card>
                <ConfirmDialog
                    open={showDeleteDialog}
                    onOpenChange={setShowDeleteDialog}
                    onConfirm={handleDelete}
                    title="Deletar Funil"
                    description={`Tem certeza que deseja deletar "${project.title}"? Esta ação não pode ser desfeita.`}
                    confirmText="Sim, deletar"
                    cancelText="Cancelar"
                    variant="danger"
                    isLoading={isDeleting}
                />
            </>
        )
    }

    return (
        <>
            <Card hover className="group flex flex-col h-full overflow-hidden">
                {/* Thumbnail gradient bar (preview-like) */}
                <div className={cn(
                    'h-1.5 w-full',
                    project.isBanned ? 'bg-red-500' :
                    isPublished ? 'bg-emerald-500' : 'bg-amber-500'
                )} />

                <CardContent className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                            {project.isBanned ? (
                                <Badge variant="destructive" size="sm" dot>Banido</Badge>
                            ) : isPublished ? (
                                <Badge variant="success" size="sm" dot>Publicado</Badge>
                            ) : (
                                <Badge variant="secondary" size="sm" dot>Rascunho</Badge>
                            )}
                            {project.customDomain && (
                                <Badge variant="outline" size="sm">
                                    <Globe className="w-2.5 h-2.5" />
                                </Badge>
                            )}
                        </div>

                        <CardActionsMenu
                            onDuplicate={handleDuplicate}
                            onDelete={() => setShowDeleteDialog(true)}
                            isDuplicating={isDuplicating}
                            isSubscriptionExpired={isSubscriptionExpired}
                            router={router}
                            project={project}
                        />
                    </div>

                    <h3 className="text-base font-semibold text-foreground mb-1 line-clamp-1">
                        {project.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4 min-h-[2rem]">
                        {project.description || "Sem descrição"}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-t border-border/60">
                        <div className="text-center">
                            <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Sessões</p>
                            <p className="text-sm font-semibold">
                                {stats.isLoading ? '—' : stats.views.toLocaleString('pt-BR')}
                            </p>
                        </div>
                        <div className="text-center border-x border-border/60">
                            <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Leads</p>
                            <p className="text-sm font-semibold">
                                {stats.isLoading ? '—' : stats.leads.toLocaleString('pt-BR')}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Conversão</p>
                            <p className="text-sm font-semibold">
                                {stats.isLoading ? '—' : `${stats.conversionRate}%`}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-3 mb-3">
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(project.updatedAt, { addSuffix: true, locale: ptBR })}
                    </div>

                    <div className="mt-auto flex gap-2">
                        <Button
                            onClick={handleOpenEditor}
                            disabled={isSubscriptionExpired}
                            size="sm"
                            className="flex-1"
                            leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                        >
                            Abrir Editor
                        </Button>
                        <Button
                            onClick={handlePreview}
                            variant="outline"
                            size="icon-sm"
                            title="Visualizar"
                        >
                            <Eye className="w-4 h-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <ConfirmDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={handleDelete}
                title="Deletar Funil"
                description={`Tem certeza que deseja deletar "${project.title}"? Esta ação não pode ser desfeita.`}
                confirmText="Sim, deletar"
                cancelText="Cancelar"
                variant="danger"
                isLoading={isDeleting}
            />
        </>
    );
}

function CardActionsMenu({
    onDuplicate, onDelete, isDuplicating, isSubscriptionExpired, router, project
}: {
    onDuplicate: (e?: React.MouseEvent) => void
    onDelete: () => void
    isDuplicating: boolean
    isSubscriptionExpired?: boolean
    router: any
    project: any
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    onClick={(e) => e.stopPropagation()}
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                >
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/dashboard/${project.id}/builder`)}>
                    <ExternalLink className="w-3.5 h-3.5" /> Abrir editor
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(`/f/${project.id}`, '_blank')}>
                    <Eye className="w-3.5 h-3.5" /> Visualizar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/dashboard/${project.id}`)}>
                    <BarChart3 className="w-3.5 h-3.5" /> Analytics
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate} disabled={isDuplicating}>
                    <Copy className="w-3.5 h-3.5" /> {isDuplicating ? 'Duplicando…' : 'Duplicar'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/dashboard/${project.id}/settings`)}>
                    <Settings className="w-3.5 h-3.5" /> Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={onDelete}
                    className="text-red-600 focus:text-red-600"
                    disabled={isSubscriptionExpired}
                >
                    <Trash2 className="w-3.5 h-3.5" /> Deletar
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
