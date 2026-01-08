'use client';

import React, { useEffect, useState } from 'react';
import { StepsPanel } from '@/components/builder/StepsPanel';
import { Toolbox } from '@/components/builder/Toolbox';
import { Canvas } from '@/components/builder/Canvas';
import { PropertiesPanel } from '@/components/builder/PropertiesPanel';
import { useBuilderStore } from '@/store/builderStore';
import { Button } from '@/components/ui/button';
import { Save, Eye, Undo2, Redo2 } from 'lucide-react';
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

export default function BuilderPageClient({ funnelId }: { funnelId: string }) {
    const {
        setCurrentFunnel,
        undo,
        redo,
        historyIndex,
        saveFunnel,
        loadFunnel,
        isLoading,
        addComponent,
        reorderComponents,
        setIsDragging
    } = useBuilderStore();

    const historyData = useBuilderStore((state) => state.history);
    const history = Array.isArray(historyData) ? historyData : [];
    const componentsData = useBuilderStore((state) => state.getCurrentComponents());
    const components = Array.isArray(componentsData) ? componentsData : [];

    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeType, setActiveType] = useState<ComponentType | null>(null);
    const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    useEffect(() => {
        setCurrentFunnel(funnelId);
        loadFunnel(funnelId);
    }, [funnelId, setCurrentFunnel, loadFunnel]);

    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;

    const handleSave = async () => {
        const success = await saveFunnel();
        if (success) {
            toast.success('Funil salvo com sucesso!', {
                description: 'As alterações foram salvas no banco de dados',
            });
        } else {
            toast.warning('Salvo apenas no navegador', {
                description: 'Houve um erro ao salvar no servidor. Suas alterações estão salvas localmente.',
            });
        }
    };

    const handlePreview = () => {
        window.open(`/f/${funnelId}`, '_blank');
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

        // Handle dropping from Toolbox
        if (active.data.current?.isToolboxItem) {
            const type = active.data.current.type as ComponentType;
            // If dropped over the canvas (or any sortable item in it)
            // We just add it to the end for now, or we could calculate index
            addComponent(type);
            return;
        }

        // Handle reordering within Canvas
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

    return (
        <div className="h-screen flex flex-col">
            {/* Top Bar */}
            <header className="bg-white border-b border-gray-200 px-6 py-3 grid grid-cols-3 items-center">
                {/* Left: Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                        K
                    </div>
                    <span className="font-bold text-gray-900">Kuiz</span>
                </div>

                {/* Center: Navigation Tabs */}
                <div className="flex justify-center">
                    <nav className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`text-sm font-medium ${previewDevice === 'mobile' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                            onClick={() => setPreviewDevice('mobile')}
                        >
                            Mobile
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`text-sm font-medium ${previewDevice === 'desktop' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                            onClick={() => setPreviewDevice('desktop')}
                        >
                            Desktop
                        </Button>
                    </nav>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" className="text-gray-500 gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        Configurações
                    </Button>

                    <div className="w-px h-6 bg-gray-300 mx-2" />

                    <Button variant="outline" size="icon" onClick={handlePreview}>
                        <Eye className="w-4 h-4" />
                    </Button>

                    <Button
                        size="sm"
                        className="gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 shadow-sm transition-all"
                        onClick={handleSave}
                    >
                        <Save className="w-4 h-4" />
                        <span className="font-medium">Salvar</span>
                    </Button>
                </div>
            </header>

            {/* Main Editor Layout */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex-1 flex overflow-hidden relative">
                    {isLoading && (
                        <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center backdrop-blur-sm">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                <p className="text-sm font-medium text-gray-600">Carregando funil...</p>
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
                        <div className="p-2 bg-white rounded shadow-lg border border-blue-500 opacity-80 cursor-grabbing">
                            {activeType ? `Adicionar ${activeType}` : 'Movendo componente...'}
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
