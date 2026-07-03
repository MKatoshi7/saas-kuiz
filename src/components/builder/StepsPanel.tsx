'use client';

import React, { useState } from 'react';
import { Plus, GripVertical, Edit2, Trash2, Check, X, Copy, MoreVertical, Map as MapIcon, List, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBuilderStore } from '@/store/builderStore';
import { DndContext, closestCenter, KeyboardSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { BranchingRulesEditor } from './BranchingRulesEditor';

function SortableStepItem({
    step,
    index,
    isActive,
    onSelect,
    onEdit,
    onDuplicate,
    onDelete,
    onBranch,
    isEditing,
    editingTitle,
    setEditingTitle,
    saveEdit,
    cancelEdit
}: {
    step: any
    index: number
    isActive: boolean
    onSelect: () => void
    onEdit: () => void
    onDuplicate: () => void
    onDelete: () => void
    onBranch: () => void
    isEditing: boolean
    editingTitle: string
    setEditingTitle: (val: string) => void
    saveEdit: () => void
    cancelEdit: () => void
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: step.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors',
                isActive
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            )}
            onClick={onSelect}
            {...attributes}
            suppressHydrationWarning
        >
            {/* Drag Handle */}
            <div
                {...listeners}
                className={cn(
                    'p-0.5 cursor-grab active:cursor-grabbing rounded',
                    isActive ? 'text-background/50 hover:text-background' : 'text-muted-foreground/30 hover:text-foreground'
                )}
            >
                <GripVertical className="w-3 h-3" />
            </div>

            <span className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-mono font-semibold',
                isActive ? 'bg-background/15 text-background' : 'bg-secondary text-muted-foreground'
            )}>
                {index + 1}
            </span>

            <div className="flex-1 min-w-0">
                {isEditing ? (
                    <div className="flex gap-1 items-center" onClick={(e) => e.stopPropagation()}>
                        <Input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit();
                                if (e.key === 'Escape') cancelEdit();
                            }}
                            className="h-6 text-xs px-1.5"
                            autoFocus
                        />
                        <button onClick={saveEdit} className="p-0.5 text-emerald-500 hover:bg-emerald-50 rounded">
                            <Check className="w-3 h-3" />
                        </button>
                        <button onClick={cancelEdit} className="p-0.5 text-red-500 hover:bg-red-50 rounded">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ) : (
                    <div className="flex-1 min-w-0">
                        <span className="text-xs font-medium truncate block">
                            {step.title || `Passo ${index + 1}`}
                        </span>
                        {step.branchRules && step.branchRules.length > 0 && (
                            <div className="flex items-center gap-1 text-[10px] text-blue-500 font-medium mt-0.5">
                                <GitBranch className="w-3 h-3" />
                                {step.branchRules.length} {step.branchRules.length === 1 ? 'regra' : 'regras'}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {!isEditing && (
                <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                    <PopoverTrigger asChild>
                        <button
                            className={cn(
                                'p-0.5 rounded transition-all',
                                isActive || isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            )}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MoreVertical className="w-3 h-3" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-44 p-1" align="start" side="right">
                        <button
                            className="flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-secondary rounded w-full text-left transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMenuOpen(false);
                                onEdit();
                            }}
                        >
                            <Edit2 className="w-3 h-3" /> Renomear
                        </button>
                        <button
                            className="flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-secondary rounded w-full text-left transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMenuOpen(false);
                                onBranch();
                            }}
                        >
                            <GitBranch className="w-3 h-3" /> Branching
                        </button>
                        <button
                            className="flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-secondary rounded w-full text-left transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMenuOpen(false);
                                onDuplicate();
                            }}
                        >
                            <Copy className="w-3 h-3" /> Duplicar
                        </button>
                        <div className="h-px bg-border my-1" />
                        <button
                            className="flex items-center gap-2 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded w-full text-left transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMenuOpen(false);
                                onDelete();
                            }}
                        >
                            <Trash2 className="w-3 h-3" /> Excluir
                        </button>
                    </PopoverContent>
                </Popover>
            )}
        </div>
    );
}

export function StepsPanel() {
    const {
        steps,
        currentStepId,
        componentsByStep,
        setCurrentStep,
        addStep,
        duplicateStep,
        deleteStep,
        updateStepTitle,
        reorderSteps,
        setStepBranchRules,
        setStepDefaultNext,
    } = useBuilderStore();

    const [editingStepId, setEditingStepId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [view, setView] = useState<'list' | 'map'>('list');
    const [editingBranchStepId, setEditingBranchStepId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = steps.findIndex((s) => s.id === active.id);
        const newIndex = steps.findIndex((s) => s.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
            reorderSteps(arrayMove(steps, oldIndex, newIndex));
        }
    };

    const startEditing = (stepId: string, title: string) => {
        setEditingStepId(stepId);
        setEditingTitle(title);
    };

    const saveEdit = (stepId: string) => {
        if (editingTitle.trim()) {
            updateStepTitle(stepId, editingTitle.trim());
        }
        setEditingStepId(null);
    };

    const cancelEdit = () => {
        setEditingStepId(null);
        setEditingTitle('');
    };

    return (
        <div className="flex flex-col h-full border-r border-border/60 bg-background/50 backdrop-blur-sm">
            <div className="px-3 py-3 border-b border-border/60 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Etapas</span>
                    <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">
                        {steps.length}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="inline-flex h-6 items-center rounded-md bg-secondary/50 p-0.5">
                        <button
                            onClick={() => setView('list')}
                            className={cn(
                                'h-5 px-1.5 rounded text-[10px] font-medium transition-colors flex items-center gap-1',
                                view === 'list' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                            )}
                            title="Lista"
                        >
                            <List className="w-3 h-3" />
                        </button>
                        <button
                            onClick={() => setView('map')}
                            className={cn(
                                'h-5 px-1.5 rounded text-[10px] font-medium transition-colors flex items-center gap-1',
                                view === 'map' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                            )}
                            title="Mini-mapa"
                        >
                            <MapIcon className="w-3 h-3" />
                        </button>
                    </div>
                    <Button size="icon-sm" variant="ghost" onClick={addStep} className="h-6 w-6" title="Adicionar etapa">
                        <Plus className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                {view === 'list' ? (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={steps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-0.5">
                                {steps.map((step, index) => (
                                    <SortableStepItem
                                        key={step.id}
                                        step={step}
                                        index={index}
                                        isActive={currentStepId === step.id}
                                        onSelect={() => setCurrentStep(step.id)}
                                        onEdit={() => startEditing(step.id, step.title)}
                                        onDuplicate={() => duplicateStep(step.id)}
                                        onDelete={() => deleteStep(step.id)}
                                        onBranch={() => setEditingBranchStepId(step.id)}
                                        isEditing={editingStepId === step.id}
                                        editingTitle={editingTitle}
                                        setEditingTitle={setEditingTitle}
                                        saveEdit={() => saveEdit(step.id)}
                                        cancelEdit={cancelEdit}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                ) : (
                    <FunnelMap />
                )}

                {steps.length === 0 && (
                    <div className="text-center py-8 px-2">
                        <p className="text-xs text-muted-foreground mb-3">Nenhuma etapa criada</p>
                        <Button onClick={addStep} size="sm" variant="outline" className="w-full text-xs h-8">
                            <Plus className="w-3.5 h-3.5 mr-1.5" />
                            Nova Etapa
                        </Button>
                    </div>
                )}
            </div>

            {editingBranchStepId && (() => {
                const editingStep = steps.find(s => s.id === editingBranchStepId);
                if (!editingStep) return null;
                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto p-4 m-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold">Branching — {editingStep.title}</h3>
                                <button
                                    onClick={() => setEditingBranchStepId(null)}
                                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <BranchingRulesEditor
                                stepId={editingBranchStepId}
                                branchRules={editingStep.branchRules || []}
                                defaultNextStepId={editingStep.defaultNextStepId}
                                onUpdate={(rules) => setStepBranchRules(editingBranchStepId, rules)}
                                onDefaultNextChange={(target) => setStepDefaultNext(editingBranchStepId, target)}
                            />
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}

/**
 * Mini-mapa visual do funil (estilo Notion outline)
 */
function FunnelMap() {
    const { steps, componentsByStep, currentStepId, setCurrentStep } = useBuilderStore();

    return (
        <div className="space-y-1">
            {steps.map((step, index) => {
                const isActive = currentStepId === step.id
                const components = componentsByStep[step.id] || []
                return (
                    <div key={step.id} className="flex">
                        <div className="flex flex-col items-center mr-2 pt-2">
                            <div
                                className={cn(
                                    'h-2 w-2 rounded-full',
                                    isActive ? 'bg-foreground' : 'bg-muted-foreground/30'
                                )}
                            />
                            {index < steps.length - 1 && (
                                <div className="w-px flex-1 bg-border my-0.5" style={{ minHeight: '20px' }} />
                            )}
                        </div>
                        <button
                            onClick={() => setCurrentStep(step.id)}
                            className={cn(
                                'flex-1 text-left p-2 rounded-lg transition-colors group',
                                isActive
                                    ? 'bg-secondary'
                                    : 'hover:bg-secondary/50'
                            )}
                        >
                            <div className="flex items-center justify-between gap-1">
                                <p className={cn(
                                    'text-xs font-medium truncate',
                                    isActive ? 'text-foreground' : 'text-foreground/80'
                                )}>
                                    {step.title || `Etapa ${index + 1}`}
                                </p>
                                <div className="flex items-center gap-1.5">
                                    {step.branchRules && step.branchRules.length > 0 && (
                                        <GitBranch className="w-3 h-3 text-blue-500" />
                                    )}
                                    <span className="text-[9px] text-muted-foreground">
                                        {components.length}
                                    </span>
                                </div>
                            </div>
                            {components.length > 0 && (
                                <div className="mt-1.5 flex flex-wrap gap-0.5">
                                    {components.slice(0, 6).map((c) => (
                                        <span
                                            key={c.id}
                                            className="h-1 w-3 rounded-full bg-muted-foreground/20"
                                            title={c.type}
                                        />
                                    ))}
                                    {components.length > 6 && (
                                        <span className="text-[9px] text-muted-foreground">
                                            +{components.length - 6}
                                        </span>
                                    )}
                                </div>
                            )}
                        </button>
                    </div>
                )
            })}
        </div>
    );
}
