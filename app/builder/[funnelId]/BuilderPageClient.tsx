'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { StepsPanel } from '@/components/builder/StepsPanel';
import { Toolbox } from '@/components/builder/Toolbox';
import { Canvas } from '@/components/builder/Canvas';
import { PropertiesPanel } from '@/components/builder/PropertiesPanel';
import { CommandPalette } from '@/components/builder/CommandPalette';
import { useBuilderStore } from '@/store/builderStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import { SaveStatusIndicator } from '@/components/builder/SaveStatusIndicator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Save, Eye, Undo2, Redo2, Monitor, Smartphone, Search, Loader2,
    History, Bookmark, Trash2, Plus, RotateCcw, Link2, Check
} from 'lucide-react';
import { toast } from 'sonner';
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    DragStartEvent,
    DragEndEvent,
    closestCenter,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { ComponentType } from '@/types/funnel';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function BuilderPageClient({ funnelId }: { funnelId: string }) {
    const {
        setCurrentFunnel,
        undo,
        redo,
        historyIndex,
        history,
        loadFunnel,
        isLoading,
        addComponent,
        reorderComponents,
        setIsDragging,
        steps,
        componentsByStep,
        theme,
        lastActionDescription,
        snapshots,
        createSnapshot,
        restoreSnapshot,
        deleteSnapshot,
    } = useBuilderStore();

    const componentsData = useBuilderStore((state) => state.getCurrentComponents());
    const components = Array.isArray(componentsData) ? componentsData : [];

    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeType, setActiveType] = useState<ComponentType | null>(null);
    const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
    const [snapshotDialogOpen, setSnapshotDialogOpen] = useState(false);
    const [snapshotName, setSnapshotName] = useState('');
    const [copied, setCopied] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    useEffect(() => {
        setCurrentFunnel(funnelId);
        loadFunnel(funnelId);
    }, [funnelId, setCurrentFunnel, loadFunnel]);

    const buildPayload = () => ({ steps, componentsByStep, themeConfig: theme })
    const { status, lastSaved, saveNow, isSaving, error } = useAutoSave({
        data: useMemo(buildPayload, [steps, componentsByStep, theme]),
        onSave: async (payload) => {
            const res = await fetch(`/api/funnels/${funnelId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            if (!res.ok) return false
            const data = await res.json()
            if (data?.stepIdMap) {
                useBuilderStore.getState().loadFunnel(funnelId, {
                    preserveState: true,
                    stepIdMap: data.stepIdMap,
                    silent: true,
                })
            }
            return true
        },
        delay: 2500,
    })

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
                e.preventDefault()
                handleSave()
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [])

    const canUndo = historyIndex > 0
    const canRedo = historyIndex < (Array.isArray(history) ? history.length - 1 : 0)
    const undoAction = canUndo ? history[historyIndex]?.action : null
    const redoAction = canRedo ? history[historyIndex + 1]?.action : null

    const handleSave = async () => {
        const ok = await saveNow()
        if (ok) toast.success('Funil salvo!')
        else if (status === 'error') toast.error('Erro ao salvar')
    };

    const handlePreview = () => {
        window.open(`/f/${funnelId}`, '_blank');
    };

    const handleCopyLink = () => {
        const url = `${window.location.origin}/f/${funnelId}`
        navigator.clipboard.writeText(url)
        setCopied(true)
        toast.success('Link do funil copiado!')
        setTimeout(() => setCopied(false), 2000)
    }

    const handleSaveSnapshot = () => {
        if (!snapshotName.trim()) {
            toast.error('Dê um nome para a versão')
            return
        }
        createSnapshot(snapshotName.trim())
        setSnapshotName('')
        setSnapshotDialogOpen(false)
        toast.success('Versão salva!')
    }

    const handleRestoreSnapshot = (id: string, name: string) => {
        if (!confirm(`Restaurar "${name}"? Suas alterações atuais não salvas serão perdidas.`)) return
        restoreSnapshot(id)
        toast.success(`Versão "${name}" restaurada`)
    }

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveId(active.id as string);
        setIsDragging(true);
        if (active.data.current?.isToolboxItem) {
            setActiveType(active.data.current.type as ComponentType);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        setActiveType(null);
        setIsDragging(false);

        if (!over) return;

        if (active.data.current?.isToolboxItem) {
            const type = active.data.current.type as ComponentType;
            addComponent(type);
            return;
        }

        if (active.id !== over.id) {
            const oldIndex = components.findIndex((c) => c.id === active.id);
            const newIndex = components.findIndex((c) => c.id === over.id);
            if (oldIndex !== -1 && newIndex !== -1) {
                const newComponents = arrayMove(components, oldIndex, newIndex);
                reorderComponents(newComponents.map((c, i) => ({ ...c, order: i })));
            }
        }
    };

    return (
        <div className="h-screen flex flex-col bg-[#F5F5F7]">
            {/* Top Bar */}
            <header className="h-14 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 flex items-center justify-between gap-4 z-20">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-foreground text-background flex items-center justify-center font-bold text-sm shrink-0">
                        K
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">Editor de Funil</span>
                            <SaveStatusIndicator status={status} lastSaved={lastSaved} error={error} />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyLink}
                        title="Copiar link do funil"
                    >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Link2 className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline text-xs ml-1.5">{copied ? 'Copiado!' : 'Link'}</span>
                    </Button>

                    <div className="inline-flex h-9 items-center gap-0.5 rounded-lg border border-border/60 bg-secondary/40 p-1">
                        <button
                            onClick={() => setPreviewDevice('mobile')}
                            className={`h-7 px-3 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                                previewDevice === 'mobile'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Smartphone className="w-3.5 h-3.5" />
                            Mobile
                        </button>
                        <button
                            onClick={() => setPreviewDevice('desktop')}
                            className={`h-7 px-3 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                                previewDevice === 'desktop'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Monitor className="w-3.5 h-3.5" />
                            Desktop
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={undo}
                        disabled={!canUndo}
                        title={canUndo ? `Desfazer: ${undoAction || 'ação anterior'}` : 'Nada para desfazer'}
                    >
                        <Undo2 className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={redo}
                        disabled={!canRedo}
                        title={canRedo ? `Refazer: ${redoAction || 'próxima ação'}` : 'Nada para refazer'}
                    >
                        <Redo2 className="w-4 h-4" />
                    </Button>

                    {/* Versões (snapshots) */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" title="Versões salvas">
                                <History className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-72">
                            <DropdownMenuLabel className="flex items-center justify-between">
                                <span>Versões</span>
                                <button
                                    onClick={() => setSnapshotDialogOpen(true)}
                                    className="text-blue-500 hover:text-blue-600 text-xs font-medium flex items-center gap-1"
                                >
                                    <Plus className="w-3 h-3" /> Nova
                                </button>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {snapshots.length === 0 ? (
                                <p className="px-2 py-4 text-xs text-muted-foreground text-center">
                                    Nenhuma versão salva
                                </p>
                            ) : (
                                snapshots.map((s) => (
                                    <div key={s.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-secondary rounded-md group">
                                        <Bookmark className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium truncate">{s.name}</p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true, locale: ptBR })}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
                                            <button
                                                onClick={() => handleRestoreSnapshot(s.id, s.name)}
                                                className="p-1 rounded text-blue-500 hover:bg-blue-50"
                                                title="Restaurar"
                                            >
                                                <RotateCcw className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => deleteSnapshot(s.id)}
                                                className="p-1 rounded text-red-500 hover:bg-red-50"
                                                title="Deletar"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="w-px h-5 bg-border mx-1" />

                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={handlePreview}
                        title="Visualizar"
                    >
                        <Eye className="w-4 h-4" />
                    </Button>

                    <Button
                        onClick={handleSave}
                        loading={isSaving}
                        size="sm"
                        leftIcon={<Save className="w-3.5 h-3.5" />}
                    >
                        Salvar
                    </Button>
                </div>
            </header>

            <button
                onClick={() => {
                    const evt = new KeyboardEvent('keydown', { key: 'k', metaKey: true })
                    window.dispatchEvent(evt)
                }}
                className="hidden md:flex fixed bottom-6 right-6 z-30 items-center gap-2 bg-background/90 backdrop-blur-xl border border-border/60 shadow-pop rounded-full px-3.5 py-2 text-xs text-muted-foreground hover:text-foreground hover:shadow-lg transition-all"
            >
                <Search className="w-3.5 h-3.5" />
                Buscar comandos
                <kbd className="font-mono text-[10px] bg-secondary px-1.5 py-0.5 rounded">⌘K</kbd>
            </button>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex-1 flex overflow-hidden relative">
                    {isLoading && (
                        <div className="absolute inset-0 bg-background/80 z-50 flex items-center justify-center backdrop-blur-sm">
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-foreground" />
                                <p className="text-sm text-muted-foreground">Carregando funil…</p>
                            </div>
                        </div>
                    )}
                    <StepsPanel />
                    <Toolbox />
                    <Canvas previewDevice={previewDevice} />
                    <PropertiesPanel />
                </div>
                <DragOverlay>
                    {activeId ? (
                        <div className="px-3 py-2 bg-foreground text-background text-xs font-medium rounded-lg shadow-2xl cursor-grabbing">
                            {activeType ? `Adicionar ${activeType.replace('-', ' ')}` : 'Movendo…'}
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            <CommandPalette />

            <Dialog open={snapshotDialogOpen} onOpenChange={setSnapshotDialogOpen}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle>Salvar versão</DialogTitle>
                        <DialogDescription>
                            Crie um ponto na história que você pode restaurar depois.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label>Nome da versão</Label>
                        <Input
                            value={snapshotName}
                            onChange={(e) => setSnapshotName(e.target.value)}
                            placeholder="Ex: Antes de mudar o headline"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveSnapshot()
                            }}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSnapshotDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveSnapshot} disabled={!snapshotName.trim()}>
                            Salvar versão
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
