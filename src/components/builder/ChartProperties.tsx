'use client';

import React from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, Plus, GripVertical } from 'lucide-react';
import { PieChartComponent, BarChartComponent, ChartDataItem } from '@/types/funnel';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { RichTextField } from './RichTextField';

const DEFAULT_COLORS = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#F97316', '#84CC16', '#6366F1',
];

function SortableChartItem({
    item,
    index,
    onUpdate,
    onRemove,
    defaultColor,
}: {
    item: ChartDataItem;
    index: number;
    onUpdate: (item: ChartDataItem) => void;
    onRemove: () => void;
    defaultColor: string;
}) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-2 mb-2">
            <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600">
                <GripVertical className="w-4 h-4" />
            </div>

            <input
                type="color"
                value={item.color || defaultColor}
                onChange={(e) => onUpdate({ ...item, color: e.target.value })}
                className="w-7 h-7 rounded border border-gray-200 cursor-pointer flex-shrink-0"
            />

            <RichTextField
                value={item.label}
                htmlValue={(item as any).labelHtml}
                style={(item as any).labelStyle}
                onUpdate={(text, html, style) => onUpdate({ ...item, label: text, labelHtml: html, labelStyle: style })}
                placeholder="Rótulo"
                minHeight={28}
                compact
                showPresets={false}
                showRecentColors={false}
                className="flex-1 min-w-0"
            />

            <Input
                type="number"
                min="0"
                value={item.value}
                onChange={(e) => onUpdate({ ...item, value: parseInt(e.target.value) || 0 })}
                className="h-8 text-xs w-16"
            />

            <button onClick={onRemove} className="p-1 text-gray-400 hover:text-red-500">
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}

export function PieChartProperties({ component }: { component: PieChartComponent }) {
    const updateComponent = useBuilderStore((state) => state.updateComponent);
    const handleUpdate = (field: string, value: any) => {
        updateComponent(component.id, { ...component, data: { ...component.data, [field]: value } } as any);
    };

    const sensors = useSensors(useSensor(PointerSensor));
    const items = component.data.items || [];

    return (
        <div className="space-y-4">
            <div>
                <RichTextField
                    label="Título"
                    value={component.data.title}
                    htmlValue={component.data.titleHtml}
                    style={component.data.titleStyle}
                    onUpdate={(text, html, style) => {
                        handleUpdate('title', text);
                        handleUpdate('titleHtml', html);
                        handleUpdate('titleStyle', style);
                    }}
                    placeholder="Ex: Distribuição de Vendas"
                    minHeight={36}
                    compact
                />
            </div>

            <div>
                <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs font-semibold text-gray-700">Dados</Label>
                    <span className="text-[10px] text-gray-400">{items.length} itens</span>
                </div>

                <DndContext sensors={sensors} collisionDetection={closestCenter}
                    onDragEnd={(event) => {
                        const { active, over } = event;
                        if (active.id !== over?.id) {
                            const oldIndex = items.findIndex((o) => o.id === active.id);
                            const newIndex = items.findIndex((o) => o.id === over?.id);
                            if (oldIndex !== -1 && newIndex !== -1) handleUpdate('items', arrayMove(items, oldIndex, newIndex));
                        }
                    }}
                >
                    <SortableContext items={items.map((o) => o.id)} strategy={verticalListSortingStrategy}>
                        {items.map((item, index) => (
                            <SortableChartItem
                                key={item.id}
                                item={item}
                                index={index}
                                defaultColor={DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                                onUpdate={(newItem) => { const n = [...items]; n[index] = newItem; handleUpdate('items', n); }}
                                onRemove={() => { const n = [...items]; n.splice(index, 1); handleUpdate('items', n); }}
                            />
                        ))}
                    </SortableContext>
                </DndContext>

                <Button
                    variant="outline"
                    className="w-full mt-2 border-dashed border-gray-300 text-gray-500 hover:text-blue-600 hover:border-blue-300"
                    onClick={() => handleUpdate('items', [...items, { id: crypto.randomUUID(), label: `Item ${items.length + 1}`, value: 25, color: DEFAULT_COLORS[items.length % DEFAULT_COLORS.length] }])}
                >
                    <Plus className="w-4 h-4 mr-1" /> Adicionar Item
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label className="text-xs text-gray-700 mb-1 block">Tamanho</Label>
                    <select value={component.data.size || 'md'} onChange={(e) => handleUpdate('size', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs bg-white">
                        <option value="sm">Pequeno</option>
                        <option value="md">Médio</option>
                        <option value="lg">Grande</option>
                    </select>
                </div>
                <div>
                    <Label className="text-xs text-gray-700 mb-1 block">Buraco Central</Label>
                    <input type="range" min="0" max="0.8" step="0.05"
                        value={component.data.holeSize ?? 0.5}
                        onChange={(e) => handleUpdate('holeSize', parseFloat(e.target.value))}
                        className="w-full accent-blue-600" />
                </div>
            </div>

            <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs text-gray-700">
                    <input type="checkbox" checked={component.data.showLegend !== false}
                        onChange={(e) => handleUpdate('showLegend', e.target.checked)}
                        className="rounded" /> Legenda
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-700">
                    <input type="checkbox" checked={component.data.showPercentage !== false}
                        onChange={(e) => handleUpdate('showPercentage', e.target.checked)}
                        className="rounded" /> %
                </label>
            </div>
        </div>
    );
}

export function BarChartProperties({ component }: { component: BarChartComponent }) {
    const updateComponent = useBuilderStore((state) => state.updateComponent);
    const handleUpdate = (field: string, value: any) => {
        updateComponent(component.id, { ...component, data: { ...component.data, [field]: value } } as any);
    };

    const sensors = useSensors(useSensor(PointerSensor));
    const items = component.data.items || [];

    return (
        <div className="space-y-4">
            <div>
                <RichTextField
                    label="Título"
                    value={component.data.title}
                    htmlValue={component.data.titleHtml}
                    style={component.data.titleStyle}
                    onUpdate={(text, html, style) => {
                        handleUpdate('title', text);
                        handleUpdate('titleHtml', html);
                        handleUpdate('titleStyle', style);
                    }}
                    placeholder="Ex: Comparativo de Resultados"
                    minHeight={36}
                    compact
                />
            </div>

            <div>
                <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs font-semibold text-gray-700">Dados</Label>
                    <span className="text-[10px] text-gray-400">{items.length} itens</span>
                </div>

                <DndContext sensors={sensors} collisionDetection={closestCenter}
                    onDragEnd={(event) => {
                        const { active, over } = event;
                        if (active.id !== over?.id) {
                            const oldIndex = items.findIndex((o) => o.id === active.id);
                            const newIndex = items.findIndex((o) => o.id === over?.id);
                            if (oldIndex !== -1 && newIndex !== -1) handleUpdate('items', arrayMove(items, oldIndex, newIndex));
                        }
                    }}
                >
                    <SortableContext items={items.map((o) => o.id)} strategy={verticalListSortingStrategy}>
                        {items.map((item, index) => (
                            <SortableChartItem
                                key={item.id}
                                item={item}
                                index={index}
                                defaultColor={DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                                onUpdate={(newItem) => { const n = [...items]; n[index] = newItem; handleUpdate('items', n); }}
                                onRemove={() => { const n = [...items]; n.splice(index, 1); handleUpdate('items', n); }}
                            />
                        ))}
                    </SortableContext>
                </DndContext>

                <Button
                    variant="outline"
                    className="w-full mt-2 border-dashed border-gray-300 text-gray-500 hover:text-blue-600 hover:border-blue-300"
                    onClick={() => handleUpdate('items', [...items, { id: crypto.randomUUID(), label: `Item ${items.length + 1}`, value: 50, color: DEFAULT_COLORS[items.length % DEFAULT_COLORS.length] }])}
                >
                    <Plus className="w-4 h-4 mr-1" /> Adicionar Item
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label className="text-xs text-gray-700 mb-1 block">Orientação</Label>
                    <select value={component.data.orientation || 'horizontal'} onChange={(e) => handleUpdate('orientation', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs bg-white">
                        <option value="horizontal">Horizontal</option>
                        <option value="vertical">Vertical</option>
                    </select>
                </div>
                <div>
                    <Label className="text-xs text-gray-700 mb-1 block">Altura da Barra</Label>
                    <input type="number" min="16" max="80"
                        value={component.data.barHeight || 32}
                        onChange={(e) => handleUpdate('barHeight', parseInt(e.target.value) || 32)}
                        className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs" />
                </div>
            </div>

            <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs text-gray-700">
                    <input type="checkbox" checked={component.data.showValues !== false}
                        onChange={(e) => handleUpdate('showValues', e.target.checked)}
                        className="rounded" /> Valores
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-700">
                    <input type="checkbox" checked={component.data.showPercentage !== false}
                        onChange={(e) => handleUpdate('showPercentage', e.target.checked)}
                        className="rounded" /> %
                </label>
            </div>
        </div>
    );
}
