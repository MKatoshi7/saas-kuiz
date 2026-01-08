'use client';

import React from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FAQComponent, FAQItem } from '@/types/funnel';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Sortable Item Component
function SortableFAQItem({
    item,
    index,
    onUpdate,
    onRemove
}: {
    item: FAQItem,
    index: number,
    onUpdate: (item: FAQItem) => void,
    onRemove: () => void
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const [isExpanded, setIsExpanded] = React.useState(false);

    return (
        <div ref={setNodeRef} style={style} className="bg-white rounded border border-gray-200 group mb-2">
            <div className="flex items-center gap-2 p-2 bg-gray-50 border-b border-gray-100">
                <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600">
                    <GripVertical className="w-4 h-4" />
                </div>

                <div className="flex-1 font-medium text-sm truncate">
                    {item.question || 'Nova Pergunta'}
                </div>

                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-gray-400 hover:text-blue-600 text-xs px-2"
                >
                    {isExpanded ? 'Menos' : 'Editar'}
                </button>

                <button
                    onClick={onRemove}
                    className="text-gray-400 hover:text-red-500"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
                <div className="p-3 space-y-3 bg-white">
                    <div>
                        <Label className="text-xs text-gray-500 mb-1 block">Pergunta</Label>
                        <Input
                            className="h-8 text-sm"
                            value={item.question}
                            onChange={(e) => onUpdate({ ...item, question: e.target.value })}
                            placeholder="Qual é a pergunta?"
                        />
                    </div>
                    <div>
                        <Label className="text-xs text-gray-500 mb-1 block">Resposta</Label>
                        <Textarea
                            className="text-sm min-h-[80px]"
                            value={item.answer}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onUpdate({ ...item, answer: e.target.value })}
                            placeholder="Digite a resposta aqui..."
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export function FAQProperties({ component }: { component: FAQComponent }) {
    const updateComponent = useBuilderStore((state) => state.updateComponent);

    const handleUpdate = (field: string, value: any) => {
        updateComponent(component.id, {
            ...component,
            data: { ...component.data, [field]: value },
        } as any);
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const items = component.data.items || [];

    return (
        <div className="space-y-6">
            {/* Global Settings */}
            <div className="space-y-3">
                <div>
                    <Label className="text-xs font-medium text-gray-700 mb-2 block">Largura</Label>
                    <div className="flex items-center gap-2">
                        <input
                            type="range"
                            min="50"
                            max="100"
                            step="5"
                            className="w-full"
                            value={parseInt(component.data.width || '100')}
                            onChange={(e) => handleUpdate('width', e.target.value + '%')}
                        />
                        <span className="text-xs text-gray-500">{component.data.width || '100%'}</span>
                    </div>
                </div>
            </div>

            {/* Items List */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <Label>Itens</Label>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-blue-600 hover:text-blue-700"
                        onClick={() => {
                            handleUpdate('items', [
                                ...items,
                                {
                                    id: crypto.randomUUID(),
                                    question: 'Nova Pergunta',
                                    answer: 'Resposta da pergunta...',
                                }
                            ]);
                        }}
                    >
                        + Adicionar item
                    </Button>
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event) => {
                        const { active, over } = event;
                        if (active.id !== over?.id) {
                            const oldIndex = items.findIndex((o) => o.id === active.id);
                            const newIndex = items.findIndex((o) => o.id === over?.id);
                            if (oldIndex !== -1 && newIndex !== -1) {
                                handleUpdate('items', arrayMove(items, oldIndex, newIndex));
                            }
                        }
                    }}
                >
                    <SortableContext
                        items={items.map((o) => o.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-1">
                            {items.map((item, index) => (
                                <SortableFAQItem
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    onUpdate={(newItem) => {
                                        const newItems = [...items];
                                        newItems[index] = newItem;
                                        handleUpdate('items', newItems);
                                    }}
                                    onRemove={() => {
                                        const newItems = [...items];
                                        newItems.splice(index, 1);
                                        handleUpdate('items', newItems);
                                    }}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>

            <div className="pt-4 border-t border-gray-200">
                <Label className="text-xs font-medium text-gray-700 mb-2 block">Nome da Variável (Analytics)</Label>
                <Input
                    value={component.data.variableName || ''}
                    onChange={(e) => handleUpdate('variableName', e.target.value)}
                    placeholder="ex: faq_duvidas"
                />
            </div>
        </div >
    );
}
