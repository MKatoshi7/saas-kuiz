import React, { useState } from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { FunnelComponentData } from '@/types/funnel';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableComponent } from './SortableComponent';
import { EmptyCanvasState } from './EmptyCanvasState';
import { useDroppable } from '@dnd-kit/core';
import { Eye } from 'lucide-react';
import { DevicePreview } from './DevicePreview';
import { ThemedCanvasPreview } from './ThemedCanvasPreview';
import { FunnelLivePreview } from '@/components/renderer/FunnelLivePreview';

export function Canvas({ previewDevice }: { previewDevice: 'mobile' | 'desktop' }) {
    // Granular selectors to prevent unnecessary re-renders
    const currentStepId = useBuilderStore((state) => state.currentStepId);
    const components = useBuilderStore((state) => {
        const componentsData = state.currentStepId ? state.componentsByStep[state.currentStepId] : [];
        return Array.isArray(componentsData) ? componentsData : [];
    });
    const selectedComponentId = useBuilderStore((state) => state.selectedComponentId);
    const setSelectedComponent = useBuilderStore((state) => state.setSelectedComponent);
    const duplicateComponent = useBuilderStore((state) => state.duplicateComponent);
    const deleteComponent = useBuilderStore((state) => state.deleteComponent);
    const theme = useBuilderStore((state) => state.theme);

    // Local: toggle entre modo edição e modo preview (live)
    const [previewMode, setPreviewMode] = useState(false)

    // Make the canvas droppable
    const { setNodeRef } = useDroppable({
        id: 'canvas-droppable',
        disabled: previewMode,
    });



    if (!currentStepId) {
        return (
            <div className="flex-1 bg-transparent p-8 overflow-y-auto flex items-center justify-center">
                <div className="text-center text-gray-400">
                    <p className="text-sm font-medium text-gray-900 mb-1">Selecione uma etapa</p>
                    <p className="text-xs">Escolha uma etapa na barra lateral para começar a editar</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-transparent relative overflow-hidden flex flex-col h-full">
            {/* Canvas Toolbar (Preview toggle) */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/40">
                <div className="inline-flex h-7 items-center gap-0.5 rounded-md bg-secondary/50 p-0.5 text-xs">
                    <button
                        onClick={() => setPreviewMode(false)}
                        className={`h-6 px-2.5 rounded text-[11px] font-medium transition-colors ${!previewMode ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Editar
                    </button>
                    <button
                        onClick={() => setPreviewMode(true)}
                        className={`h-6 px-2.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${previewMode ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <Eye className="w-3 h-3" /> Preview
                    </button>
                </div>
                {previewMode && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        Modo live — exatamente como vai aparecer publicado
                    </span>
                )}
            </div>

            {/* Canvas Content */}
            <div className="flex-1 p-8 overflow-hidden flex justify-center items-center">
                <div
                    ref={setNodeRef}
                    className="w-full h-full flex justify-center items-center"
                >
                    {previewMode ? (
                        <DevicePreview device={previewDevice}>
                            <ThemedCanvasPreview>
                                <FunnelLivePreview
                                    components={components}
                                    theme={theme}
                                    mode="live"
                                />
                            </ThemedCanvasPreview>
                        </DevicePreview>
                    ) : (
                        <DevicePreview device={previewDevice}>
                            <ThemedCanvasPreview>
                            <SortableContext
                                items={components.map(c => c.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {components.length === 0 ? (
                                    <EmptyCanvasState />
                                ) : (
                                    <div className="min-h-[500px] pb-20">
                                        {components.map((component) => (
                                            <SortableComponent
                                                key={component.id}
                                                id={component.id}
                                                isSelected={selectedComponentId === component.id}
                                                onClick={() => setSelectedComponent(component.id)}
                                            >
                                                <ComponentRenderer
                                                    component={component}
                                                    isSelected={selectedComponentId === component.id}
                                                    onClick={() => setSelectedComponent(component.id)}
                                                    onDuplicate={() => duplicateComponent(component.id)}
                                                    onDelete={async () => {
                                                        const componentData = component.data as any;
                                                        if (componentData.publicId) {
                                                            try {
                                                                await fetch('/api/upload/delete', {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({ publicId: componentData.publicId }),
                                                                })
                                                            } catch (error) {
                                                                console.error('Failed to delete asset from Cloudinary:', error)
                                                            }
                                                        }
                                                        deleteComponent(component.id)
                                                    }}
                                                />
                                            </SortableComponent>
                                        ))}
                                    </div>
                                )}
                            </SortableContext>
                        </ThemedCanvasPreview>
                    </DevicePreview>
                    )}
                </div>
            </div>
        </div>
    );
}

import { ComponentControls } from './ComponentControls';

const ComponentRenderer = React.memo(function ComponentRenderer({
    component,
    isSelected,
    onClick,
    onDuplicate,
    onDelete,
}: {
    component: FunnelComponentData;
    isSelected: boolean;
    onClick: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
}) {
    const contentRef = React.useRef<HTMLDivElement>(null);

    return (
        <div className="relative group">
            <ComponentControls
                anchorRef={contentRef as React.RefObject<HTMLElement>}
                isVisible={isSelected}
                onEdit={onClick}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
            />

            <div
                className={`cursor-pointer rounded transition-all ${isSelected ? 'ring-2 ring-black bg-black/5' : 'hover:ring-1 hover:ring-black/10'}`}
                onClick={onClick}
                ref={contentRef}
            >
                <FunnelLivePreview
                    components={[component]}
                    mode="editor"
                    selectedId={isSelected ? component.id : null}
                    onSelect={onClick}
                />
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    return prevProps.component.id === nextProps.component.id &&
        prevProps.isSelected === nextProps.isSelected &&
        JSON.stringify(prevProps.component.data) === JSON.stringify(nextProps.component.data);
});



