'use client';

import React, { useEffect, useState } from 'react';
import { StepsPanel } from '@/components/builder/StepsPanel';
import { Toolbox } from '@/components/builder/Toolbox';
import { Canvas } from '@/components/builder/Canvas';
import { PropertiesPanel } from '@/components/builder/PropertiesPanel';
import { DesignSettingsPanel } from '@/components/builder/DesignSettingsPanel';
import { useBuilderStore } from '@/store/builderStore';
import { Button } from '@/components/ui/button';
import { Save, Undo2, Redo2, Eye, Rocket } from 'lucide-react';
import { toast } from 'sonner';
import { useAutoSave } from '@/hooks/useAutoSave';
import { SaveStatusIndicator } from '@/components/builder/SaveStatusIndicator';
import { Toolbar, ToolbarSection, ToolbarDivider } from '@/components/builder/Toolbar';
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

export default function BuilderPageClient({ funnelId }: { funnelId: string }) {
    const {
        setCurrentFunnel,
        undo,
        redo,
        historyIndex,
        saveFunnel,
        loadFunnel,
        isLoading,
        isInitialized,
        addComponent,
        reorderComponents,
        setIsDragging
    } = useBuilderStore();

    const historyData = useBuilderStore((state) => state.history);
    const history = Array.isArray(historyData) ? historyData : [];
    const currentStepId = useBuilderStore((state) => state.currentStepId);
    const componentsByStep = useBuilderStore((state) => state.componentsByStep);
    const componentsData = currentStepId ? componentsByStep[currentStepId] : [];
    const components = Array.isArray(componentsData) ? componentsData : [];

    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeType, setActiveType] = useState<ComponentType | null>(null);
    const [leftTab, setLeftTab] = useState<'steps' | 'design'>('steps');
    const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        setCurrentFunnel(funnelId);
        loadFunnel(funnelId);
    }, [funnelId, setCurrentFunnel, loadFunnel]);

    const currentFunnel = useBuilderStore((state) => state.currentFunnel);
    const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(false);

    // Auto-save setup
    const autoSave = useAutoSave({
        onSave: async () => {
            await saveFunnel();
        },
        delay: 5000,
        enabled: isAutoSaveEnabled
    });

    // Ref para rastrear se houve mudanças reais
    const hasUnsavedChanges = React.useRef(false);
    const lastSavedState = React.useRef<string>('');

    // Trigger auto-save apenas quando houver mudanças reais
    useEffect(() => {
        if (!isMounted || !isInitialized || isLoading) return;

        // Serializar estado atual
        const currentState = JSON.stringify(componentsByStep);

        // Comparar com último estado salvo
        if (lastSavedState.current !== currentState && lastSavedState.current !== '') {
            hasUnsavedChanges.current = true;
            autoSave.scheduleSave();
        }

        // Atualizar referência do último estado após primeira renderização
        if (lastSavedState.current === '') {
            lastSavedState.current = currentState;
        }
    }, [componentsByStep, isMounted, isInitialized, isLoading, autoSave]);

    // Atualizar lastSavedState após salvamento bem-sucedido
    useEffect(() => {
        if (autoSave.status === 'saved') {
            lastSavedState.current = JSON.stringify(componentsByStep);
            hasUnsavedChanges.current = false;
        }
    }, [autoSave.status, componentsByStep]);

    const handleSave = async () => {
        try {
            // Force save even if auto-save is disabled
            await saveFunnel();
            toast.success('Funil salvo com sucesso!', {
                description: 'As alterações foram salvas no banco de dados',
            });
        } catch (error) {
            toast.error('Erro ao salvar', {
                description: 'Não foi possível salvar as alterações. Tente novamente.',
            });
        }
    };

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
                const updatedComponents = newComponents.map((c, index) => ({ ...c, order: index }));
                reorderComponents(updatedComponents);
            }
        }
    };

    const error = useBuilderStore((state) => state.error);

    // Prevent hydration mismatch - don't render anything until mounted
    if (!isMounted) {
        return null;
    }

    if (error) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4 max-w-md text-center p-6 bg-white rounded-lg shadow-lg">
                    <div className="text-red-500">
                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Erro ao carregar projeto</h3>
                    <p className="text-gray-500">{error}</p>
                    <Button onClick={() => loadFunnel(funnelId)} className="bg-blue-600 hover:bg-blue-700 text-white">
                        Tentar Novamente
                    </Button>
                </div>
            </div>
        );
    }

    if (!isInitialized) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Carregando editor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#F5F5F7] relative">
            {/* Noise Texture Overlay */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0 mix-blend-multiply"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
            </div>

            {/* Toolbar */}
            <Toolbar>
                <ToolbarSection>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={undo} disabled={historyIndex <= 0} className="h-8 w-8 text-gray-500 hover:text-black hover:bg-black/5 disabled:opacity-30 rounded-lg">
                            <Undo2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={redo} disabled={historyIndex >= history.length - 1} className="h-8 w-8 text-gray-500 hover:text-black hover:bg-black/5 disabled:opacity-30 rounded-lg">
                            <Redo2 className="h-4 w-4" />
                        </Button>
                    </div>

                    <ToolbarDivider />

                    <div className="flex bg-gray-100 p-1 rounded-xl border border-black/5">
                        <button onClick={() => setLeftTab('steps')} className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${leftTab === 'steps' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
                            Conteúdo
                        </button>
                        <button onClick={() => setLeftTab('design')} className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${leftTab === 'design' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
                            Design
                        </button>
                    </div>
                </ToolbarSection>

                <ToolbarSection>
                    <div className="flex items-center bg-gray-100 rounded-xl p-1 border border-black/5">
                        <button onClick={() => setPreviewDevice('mobile')} className={`p-1.5 rounded-lg transition-all duration-200 ${previewDevice === 'mobile' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-900'}`} title="Mobile View">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </button>
                        <button onClick={() => setPreviewDevice('desktop')} className={`p-1.5 rounded-lg transition-all duration-200 ${previewDevice === 'desktop' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-900'}`} title="Desktop View">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </button>
                    </div>

                    <ToolbarDivider />

                    <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={isAutoSaveEnabled}
                                    onChange={(e) => setIsAutoSaveEnabled(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-200 rounded-full peer-checked:bg-black transition-all duration-200"></div>
                                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 peer-checked:translate-x-4 shadow-sm"></div>
                            </div>
                            <span className="font-medium group-hover:text-black transition-colors">Auto Save</span>
                        </label>
                    </div>

                    <SaveStatusIndicator status={autoSave.status} lastSaved={autoSave.lastSaved} error={autoSave.error} />

                    <ToolbarDivider />

                    <Button variant="ghost" size="sm" className="gap-2 text-gray-600 hover:text-black hover:bg-black/5" onClick={() => {
                        if (currentFunnel?.customDomain) {
                            window.open(`https://${currentFunnel.customDomain}`, '_blank');
                        } else {
                            window.open(`/f/${funnelId}`, '_blank');
                        }
                    }}>
                        <Eye className="w-4 h-4" />
                        Preview
                    </Button>

                    <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-black rounded-xl"
                        onClick={handleSave}
                        disabled={autoSave.isSaving || isLoading}
                    >
                        {autoSave.isSaving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                                <span className="font-medium">Salvando...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                <span className="font-medium">Salvar</span>
                            </>
                        )}
                    </Button>

                    <Button
                        size="sm"
                        className="gap-2 bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/20 hover:shadow-black/30 transition-all rounded-xl"
                        onClick={async () => {
                            try {
                                const response = await fetch(`/api/funnels/${funnelId}/publish`, {
                                    method: 'POST'
                                });

                                if (response.ok) {
                                    toast.success("Site publicado com sucesso!", {
                                        description: "Suas alterações agora estão visíveis publicamente.",
                                    });
                                } else {
                                    const data = await response.json();
                                    throw new Error(data.error || data.details || 'Failed to publish');
                                }
                            } catch (error) {
                                toast.error("Erro ao publicar", {
                                    description: error instanceof Error ? error.message : "Não foi possível publicar o site. Tente novamente."
                                });
                            }
                        }}
                    >
                        <Rocket className="w-4 h-4" />
                        Publicar
                    </Button>
                </ToolbarSection>
            </Toolbar>

            {/* Main Editor */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="flex-1 flex overflow-hidden relative z-10">
                    {leftTab === 'steps' ? (
                        <>
                            <StepsPanel />
                            <Toolbox />
                        </>
                    ) : (
                        <DesignSettingsPanel />
                    )}

                    <Canvas previewDevice={previewDevice} />
                    <PropertiesPanel funnelId={funnelId} />
                </div>

                <DragOverlay>
                    {activeId ? (
                        <div className="px-4 py-2 bg-white rounded-xl shadow-xl border border-black/5 opacity-90 cursor-grabbing flex items-center gap-2 backdrop-blur-sm">
                            <span className="font-medium text-black">
                                {activeType ? (activeType as any).label || `Adicionar ${activeType}` : 'Movendo...'}
                            </span>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
