'use client';

import React from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, GripVertical, Image as ImageIcon, Settings, Trash2, Plus } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArgumentComponent, ArgumentItem } from '@/types/funnel';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Sortable Item Component
function SortableArgumentItem({
    item,
    index,
    onUpdate,
    onRemove
}: {
    item: ArgumentItem,
    index: number,
    onUpdate: (item: ArgumentItem) => void,
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
        <div ref={setNodeRef} style={style} className="bg-white rounded-lg border border-gray-200 group mb-3 overflow-hidden shadow-sm">
            <div className="flex items-center gap-3 p-3 bg-white hover:bg-gray-50 transition-colors">
                <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600">
                    <GripVertical className="w-4 h-4" />
                </div>

                <div className="flex-1 font-medium text-sm text-gray-700 truncate">
                    {item.title || `Argumento ${index + 1}`}
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Configurar"
                    >
                        <Settings className="w-4 h-4" />
                    </button>

                    <button
                        onClick={onRemove}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Remover"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
                <div className="p-4 space-y-4 bg-gray-50/50 border-t border-gray-100">
                    <div>
                        <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Título</Label>
                        <Input
                            className="h-9 text-sm bg-white"
                            value={item.title}
                            onChange={(e) => onUpdate({ ...item, title: e.target.value })}
                            placeholder="Ex: Argumento Principal"
                        />
                    </div>
                    <div>
                        <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Descrição</Label>
                        <Textarea
                            className="text-sm min-h-[80px] bg-white resize-none"
                            value={item.description}
                            onChange={(e) => onUpdate({ ...item, description: e.target.value })}
                            placeholder="Descreva este argumento em detalhes..."
                        />
                    </div>
                    <div>
                        <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Imagem Ilustrativa</Label>
                        <div className="flex items-start gap-3">
                            {item.imageSrc ? (
                                <div className="relative group/img">
                                    <img src={item.imageSrc} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-200 bg-white" />
                                    <button
                                        onClick={() => onUpdate({ ...item, imageSrc: undefined })}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover/img:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 bg-white flex items-center justify-center text-gray-400">
                                    <ImageIcon className="w-6 h-6 opacity-50" />
                                </div>
                            )}

                            <div className="flex-1">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    className="text-xs cursor-pointer file:cursor-pointer file:text-blue-600 file:font-medium file:bg-blue-50 file:border-0 file:rounded-full file:px-3 file:py-1 file:mr-3 hover:file:bg-blue-100"
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (ev) => onUpdate({ ...item, imageSrc: ev.target?.result as string });
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                                <p className="text-[10px] text-gray-500 mt-1">Recomendado: 400x300px (JPG, PNG)</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export function ArgumentProperties({ component }: { component: ArgumentComponent }) {
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
        <div className="h-full flex flex-col">
            <Tabs defaultValue="config" className="w-full">
                <TabsList className="w-full grid grid-cols-2 mb-4">
                    <TabsTrigger value="config">Configuração</TabsTrigger>
                    <TabsTrigger value="design">Design</TabsTrigger>
                </TabsList>

                <TabsContent value="config" className="space-y-6">
                    {/* Headline Section */}
                    <div className="space-y-3">
                        <Label className="text-xs font-semibold text-gray-700">Título da Seção (Opcional)</Label>
                        <Input
                            value={component.data.headline || ''}
                            onChange={(e) => handleUpdate('headline', e.target.value)}
                            placeholder="Ex: Por que escolher nosso produto?"
                            className="bg-white"
                        />
                    </div>

                    {/* Items List */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-gray-700">Lista de Argumentos</Label>
                        </div>

                        <div className="bg-gray-50/50 rounded-xl p-2 border border-gray-100 min-h-[100px]">
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
                                            <SortableArgumentItem
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

                            <Button
                                variant="outline"
                                className="w-full mt-2 border-dashed border-gray-300 text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50"
                                onClick={() => {
                                    handleUpdate('items', [
                                        ...items,
                                        {
                                            id: crypto.randomUUID(),
                                            title: `Argumento ${items.length + 1}`,
                                            description: 'Adicione uma descrição persuasiva aqui.',
                                        }
                                    ]);
                                }}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar Novo Argumento
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <div>
                            <Label className="text-xs font-medium text-gray-700 mb-2 block">Modo de Exibição</Label>
                            <select
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                value={component.data.displayMode || 'text-image'}
                                onChange={(e) => handleUpdate('displayMode', e.target.value)}
                            >
                                <option value="text-image">Texto + Imagem</option>
                                <option value="text-only">Apenas Texto</option>
                                <option value="image-only">Apenas Imagem</option>
                            </select>
                            <p className="text-[10px] text-gray-500 mt-1">Como os argumentos serão exibidos na tela.</p>
                        </div>

                        <div>
                            <Label className="text-xs font-medium text-gray-700 mb-2 block">Layout</Label>
                            <select
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                value={component.data.layout || '2-columns'}
                                onChange={(e) => handleUpdate('layout', e.target.value)}
                            >
                                <option value="2-columns">2 Colunas</option>
                                <option value="3-columns">3 Colunas</option>
                                <option value="list">Lista Vertical (1 Coluna)</option>
                            </select>
                            <p className="text-[10px] text-gray-500 mt-1">Organização dos argumentos na tela.</p>
                        </div>

                        <div>
                            <Label className="text-xs font-medium text-gray-700 mb-2 block">Posição da Imagem</Label>
                            <select
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                value={component.data.imagePosition || 'top'}
                                onChange={(e) => handleUpdate('imagePosition', e.target.value)}
                            >
                                <option value="top">Imagem Primeiro (Topo)</option>
                                <option value="bottom">Texto Primeiro (Fundo)</option>
                                <option value="side">Ao Lado (Esquerda)</option>
                                <option value="side-right">Ao Lado (Direita)</option>
                            </select>
                            <p className="text-[10px] text-gray-500 mt-1">Define a ordem de exibição da imagem e do texto.</p>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <Label className="text-xs font-medium text-gray-700 mb-2 block">Nome da Variável (Analytics)</Label>
                            <Input
                                value={component.data.variableName || ''}
                                onChange={(e) => handleUpdate('variableName', e.target.value)}
                                placeholder="ex: argumentos_venda"
                                className="bg-white"
                            />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="design" className="space-y-6">
                    <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm">
                        As opções de design avançado estarão disponíveis em breve. Por enquanto, o estilo segue o tema global do funil.
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
