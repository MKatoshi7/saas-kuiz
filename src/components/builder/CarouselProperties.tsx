'use client';

import React from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, GripVertical, Image as ImageIcon, UploadCloud } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CarouselComponent } from '@/types/funnel';
import { Label } from '@/components/ui/label';

// Sortable Item Component
function SortableCarouselItem({
    item,
    index,
    onUpdate,
    onRemove
}: {
    item: { id: string; image: string; label: string; targetStepId?: string },
    index: number,
    onUpdate: (item: any) => void,
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

                <div className="w-8 h-8 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                    {item.image ? (
                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon className="w-4 h-4 m-2 text-gray-400" />
                    )}
                </div>

                <div className="flex-1 font-medium text-sm truncate">
                    {item.label || 'Opção ' + (index + 1)}
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
                        <Label className="text-xs text-gray-500 mb-1 block">Rótulo</Label>
                        <Input
                            className="h-8 text-sm"
                            value={item.label}
                            onChange={(e) => onUpdate({ ...item, label: e.target.value })}
                            placeholder="Nome da opção"
                        />
                    </div>

                    <div>
                        <Label className="text-xs text-gray-500 mb-1 block">Imagem</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors relative">
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (ev) => onUpdate({ ...item, image: ev.target?.result as string });
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                            <div className="text-gray-500 text-xs flex flex-col items-center">
                                <UploadCloud className="w-6 h-6 mb-1 text-gray-400" />
                                <span className="block font-medium text-blue-600">Clique para enviar</span>
                                ou arraste e solte
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label className="text-xs text-gray-500 mb-1 block">Destino (Opcional)</Label>
                        <Input
                            className="h-8 text-sm"
                            value={item.targetStepId || ''}
                            onChange={(e) => onUpdate({ ...item, targetStepId: e.target.value })}
                            placeholder="ID da etapa"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export function CarouselProperties({ component }: { component: CarouselComponent }) {
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

    const items = component.data.options || [];

    return (
        <div className="space-y-6">
            {/* Items List */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <Label>Opções do Carrossel</Label>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-blue-600 hover:text-blue-700"
                        onClick={() => {
                            handleUpdate('options', [
                                ...items,
                                {
                                    id: crypto.randomUUID(),
                                    label: 'Nova Opção',
                                    image: '',
                                }
                            ]);
                        }}
                    >
                        + Adicionar Opção
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
                                handleUpdate('options', arrayMove(items, oldIndex, newIndex));
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
                                <SortableCarouselItem
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    onUpdate={(newItem) => {
                                        const newItems = [...items];
                                        newItems[index] = newItem;
                                        handleUpdate('options', newItems);
                                    }}
                                    onRemove={() => {
                                        const newItems = [...items];
                                        newItems.splice(index, 1);
                                        handleUpdate('options', newItems);
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
                    placeholder="ex: carrossel_opcoes"
                />
            </div>
        </div>
    );
}
