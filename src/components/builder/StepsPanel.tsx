'use client';

import React, { useState } from 'react';
import { Plus, GripVertical, Edit2, Trash2, Check, X, Copy, MoreVertical, Link as LinkIcon, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBuilderStore } from '@/store/builderStore';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';

function SortableStepItem({
    step,
    index,
    isActive,
    onSelect,
    onEdit,
    onDuplicate,
    onDelete,
    isEditing,
    editingTitle,
    setEditingTitle,
    saveEdit,
    cancelEdit
}: {
    step: any,
    index: number,
    isActive: boolean,
    onSelect: () => void,
    onEdit: () => void,
    onDuplicate: () => void,
    onDelete: () => void,
    isEditing: boolean,
    editingTitle: string,
    setEditingTitle: (val: string) => void,
    saveEdit: () => void,
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
            className={`
                flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 group relative mb-1
                ${isActive
                    ? 'bg-white shadow-sm border border-black/5 text-black font-medium'
                    : 'hover:bg-white/50 text-gray-500 hover:text-black border border-transparent'}
                ${isMenuOpen ? 'bg-white shadow-sm' : ''}
            `}
            onClick={onSelect}
            {...attributes}
            suppressHydrationWarning
        >
            {isActive && (
                <div className="absolute left-0 top-3 bottom-3 w-1 bg-black rounded-r-full"></div>
            )}

            {/* Drag Handle */}
            <div
                {...listeners}
                className={`
                    absolute left-2 top-1/2 -translate-y-1/2 p-1 cursor-grab active:cursor-grabbing rounded text-gray-300 hover:text-black
                    ${isActive || isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                    transition-all duration-200
                `}
            >
                <GripVertical className="w-3.5 h-3.5" />
            </div>

            <div className="flex-1 min-w-0 ml-7 relative z-10">
                {isEditing ? (
                    <div className="flex gap-1.5 items-center">
                        <Input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit();
                                if (e.key === 'Escape') cancelEdit();
                            }}
                            className="h-7 text-sm px-2 py-0 bg-white border-slate-300 text-slate-900"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                saveEdit();
                            }}
                            className="p-1 hover:bg-emerald-100 rounded text-emerald-600 transition-colors"
                        >
                            <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                cancelEdit();
                            }}
                            className="p-1 hover:bg-rose-100 rounded text-rose-600 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <span className={`text-sm truncate block ${isActive ? 'text-black' : ''}`}>
                            {step.title || `Passo ${index + 1}`}
                        </span>
                    </div>
                )}
            </div>

            {!isEditing && (
                <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                    <PopoverTrigger asChild>
                        <button
                            className={`
                                p-1 rounded-md hover:bg-slate-200 text-slate-400 hover:text-cyan-600 relative z-10
                                ${isActive || isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                                transition-all duration-200
                            `}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-1" align="start" side="right">
                        <div className="flex flex-col gap-0.5">
                            <button
                                className="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-100 hover:text-cyan-600 rounded w-full text-left transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsMenuOpen(false);
                                    toast.info('Preview da etapa em breve');
                                }}
                            >
                                <LinkIcon className="w-3.5 h-3.5" />
                                Preview
                            </button>
                            <button
                                className="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-100 hover:text-cyan-600 rounded w-full text-left transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsMenuOpen(false);
                                    onEdit();
                                }}
                            >
                                <Edit2 className="w-3.5 h-3.5" />
                                Renomear
                            </button>
                            <button
                                className="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-100 hover:text-cyan-600 rounded w-full text-left transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsMenuOpen(false);
                                    onDuplicate();
                                }}
                            >
                                <Copy className="w-3.5 h-3.5" />
                                Duplicar
                            </button>
                            <button
                                className="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-100 hover:text-cyan-600 rounded w-full text-left transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsMenuOpen(false);
                                    toast.success('Modelo salvo com sucesso!');
                                }}
                            >
                                <Download className="w-3.5 h-3.5" />
                                Salvar Modelo
                            </button>
                            <div className="h-px bg-slate-200 my-0.5" />
                            <button
                                className="flex items-center gap-2 px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded w-full text-left transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsMenuOpen(false);
                                    if (confirm('Tem certeza que deseja deletar esta etapa?')) {
                                        onDelete();
                                    }
                                }}
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Excluir
                            </button>
                        </div>
                    </PopoverContent>
                </Popover>
            )}
        </div>
    );
}

export function StepsPanel() {
    const { currentStepId, setCurrentStep, addStep, updateStepTitle, duplicateStep, deleteStep, reorderSteps } = useBuilderStore();
    const stepsData = useBuilderStore((state) => state.steps);
    const steps = Array.isArray(stepsData) ? stepsData : [];
    const [editingStepId, setEditingStepId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = steps.findIndex((s) => s.id === active.id);
            const newIndex = steps.findIndex((s) => s.id === over?.id);
            if (oldIndex !== -1 && newIndex !== -1) {
                const newSteps = arrayMove(steps, oldIndex, newIndex);
                reorderSteps(newSteps);
            }
        }
    };

    const startEditing = (stepId: string, currentTitle: string) => {
        setEditingStepId(stepId);
        setEditingTitle(currentTitle);
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
        <div className="w-64 bg-[#FAFAFA] border-r border-black/5 flex flex-col h-full z-20">
            <div className="p-4 border-b border-black/5 flex items-center justify-between shrink-0">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Etapas</span>
                <Button size="icon" variant="ghost" onClick={addStep} className="h-7 w-7 hover:bg-black/5 hover:text-black rounded-lg transition-all">
                    <Plus className="w-4 h-4" />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={steps.map(s => s.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-1">
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

                {steps.length === 0 && (
                    <div className="text-center py-8 px-2">
                        <p className="text-xs text-slate-400 mb-3">Nenhuma etapa criada</p>
                        <Button onClick={addStep} size="sm" variant="outline" className="w-full text-xs h-8 border-slate-300 text-slate-600 hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-500 transition-all">
                            <Plus className="w-3.5 h-3.5 mr-1.5" />
                            Nova Etapa
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
