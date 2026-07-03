'use client';

import React, { useState, useMemo } from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, GripVertical, Image as ImageIcon, Wand2, Search } from 'lucide-react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FunnelComponentData, QuizOptionComponent, QuizOptionItem } from '@/types/funnel';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColorPicker } from './ColorPicker';
import { suggestEmojiFromText, searchEmojiPT_BR, getPopularEmojiCategories } from '@/lib/emoji-suggest';
import { cn } from '@/lib/utils';

// Sortable Item Component
function SortableOptionItem({
    option,
    index,
    onUpdate,
    onRemove,
    steps
}: {
    option: QuizOptionItem,
    index: number,
    onUpdate: (opt: QuizOptionItem) => void,
    onRemove: () => void,
    steps: any[]
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: option.id });

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

                {/* Image/Emoji Picker with Tabs */}
                <Popover>
                    <PopoverTrigger asChild>
                        <button className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-white border border-gray-200 rounded cursor-pointer hover:bg-gray-50 text-lg overflow-hidden">
                            {option.imageSrc ? (
                                <img src={option.imageSrc} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xl">{option.emoji || '😀'}</span>
                            )}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" side="right">
                        <Tabs defaultValue={option.imageSrc ? 'image' : option.emoji ? 'emoji' : 'suggest'} className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="suggest" className="text-[10px]">🤖 Sugerir</TabsTrigger>
                                <TabsTrigger value="emoji">🎨 Emoji</TabsTrigger>
                                <TabsTrigger value="image">🖼️</TabsTrigger>
                                <TabsTrigger value="none">⭕</TabsTrigger>
                            </TabsList>

                            {/* Aba Sugerir - busca PT-BR + automática */}
                            <TabsContent value="suggest" className="p-2">
                                <EmojiSuggestTab
                                    option={option}
                                    onUpdate={onUpdate}
                                />
                            </TabsContent>

                            <TabsContent value="emoji" className="p-2">
                                <EmojiPicker
                                    onEmojiClick={(emojiData: EmojiClickData) => {
                                        onUpdate({ ...option, emoji: emojiData.emoji, imageSrc: undefined });
                                    }}
                                    width="100%"
                                    height={300}
                                    skinTonesDisabled
                                    previewConfig={{ showPreview: false }}
                                    searchPlaceholder="Buscar em inglês..."
                                />
                            </TabsContent>

                            <TabsContent value="image" className="p-4 space-y-3">
                                <div>
                                    <Label className="text-xs mb-2 block">Upload de Imagem</Label>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (ev) => onUpdate({ ...option, imageSrc: ev.target?.result as string, emoji: undefined });
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                    {option.imageSrc && (
                                        <div className="mt-2">
                                            <img
                                                src={option.imageSrc}
                                                alt="Preview"
                                                className="w-16 h-16 object-cover rounded border border-gray-200"
                                            />
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="none" className="p-4 text-center">
                                <div className="flex flex-col items-center gap-3 py-6">
                                    <div className="w-16 h-16 rounded-full border-4 border-gray-300 flex items-center justify-center">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <circle cx="12" cy="12" r="10" strokeWidth="2" />
                                        </svg>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <p className="font-medium mb-1">Círculo com Check</p>
                                        <p className="text-xs text-gray-500">
                                            Aparece um círculo vazio que vira check ao clicar
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => onUpdate({ ...option, emoji: undefined, imageSrc: undefined })}
                                        variant="outline"
                                        size="sm"
                                    >
                                        Aplicar
                                    </Button>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </PopoverContent>
                </Popover>

                {/* Text Edit Popover */}
                <Popover>
                    <PopoverTrigger asChild>
                        <button className="flex-1 h-8 px-2 text-left text-sm border border-gray-200 rounded hover:border-blue-400 hover:bg-blue-50 truncate transition-colors">
                            {option.label || <span className="text-gray-400 italic">Sem texto...</span>}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3" side="top">
                        <div className="space-y-2">
                            <Label className="text-xs font-medium">Texto da Opção</Label>
                            <Input
                                value={option.label}
                                onChange={(e) => onUpdate({ ...option, label: e.target.value })}
                                className="h-8 text-sm"
                                placeholder="Digite o texto da opção..."
                                autoFocus
                            />
                        </div>
                    </PopoverContent>
                </Popover>

                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-gray-400 hover:text-blue-600 text-xs px-2"
                >
                    {isExpanded ? 'Menos' : 'Mais'}
                </button>

                <button
                    onClick={onRemove}
                    className="text-gray-400 hover:text-red-500"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Expanded Details */}
            {
                isExpanded && (
                    <div className="p-2 grid grid-cols-3 gap-2 text-xs bg-white">
                        <div>
                            <Label className="text-[10px] text-gray-500">Pontos</Label>
                            <Input
                                type="number"
                                className="h-7 text-xs"
                                value={option.points || 0}
                                onChange={(e) => onUpdate({ ...option, points: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div>
                            <Label className="text-[10px] text-gray-500">Valor</Label>
                            <Input
                                className="h-7 text-xs"
                                value={option.value || ''}
                                onChange={(e) => onUpdate({ ...option, value: e.target.value })}
                                placeholder="Valor"
                            />
                        </div>
                        <div>
                            <Label className="text-[10px] text-gray-500">Destino</Label>
                            <select
                                className="w-full h-7 text-xs border border-gray-300 rounded px-1"
                                value={option.targetStepId || 'next_step'}
                                onChange={(e) => onUpdate({ ...option, targetStepId: e.target.value })}
                            >
                                <option value="next_step">Próxima</option>
                                {steps.map(step => (
                                    <option key={step.id} value={step.id}>
                                        {step.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

export function QuizOptionProperties({ component }: { component: QuizOptionComponent }) {
    const updateComponent = useBuilderStore((state) => state.updateComponent);
    const steps = useBuilderStore((state) => state.steps);

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

    const options = component.data.options || [];

    return (
        <div className="space-y-6">
            {/* Options List */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <Label>Opções</Label>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-blue-600 hover:text-blue-700"
                        onClick={() => {
                            const nextValue = String.fromCharCode(65 + options.length);
                            handleUpdate('options', [
                                ...options,
                                {
                                    id: crypto.randomUUID(),
                                    label: `Opção ${options.length + 1}`,
                                    value: nextValue,
                                    emoji: '📝',
                                    points: 0,
                                    targetStepId: 'next_step'
                                }
                            ]);
                        }}
                    >
                        + Adicionar
                    </Button>
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event) => {
                        const { active, over } = event;
                        if (active.id !== over?.id) {
                            const oldIndex = options.findIndex((o) => o.id === active.id);
                            const newIndex = options.findIndex((o) => o.id === over?.id);
                            if (oldIndex !== -1 && newIndex !== -1) {
                                handleUpdate('options', arrayMove(options, oldIndex, newIndex));
                            }
                        }
                    }}
                >
                    <SortableContext
                        items={options.map((o) => o.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-1">
                            {options.map((option, index) => (
                                <SortableOptionItem
                                    key={option.id}
                                    option={option}
                                    index={index}
                                    steps={steps}
                                    onUpdate={(newOption) => {
                                        const newOptions = [...options];
                                        newOptions[index] = newOption;
                                        handleUpdate('options', newOptions);
                                    }}
                                    onRemove={() => {
                                        const newOptions = [...options];
                                        newOptions.splice(index, 1);
                                        handleUpdate('options', newOptions);
                                    }}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>

            {/* Global Settings */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isRequired"
                            checked={component.data.required}
                            onChange={(e) => handleUpdate('required', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor="isRequired" className="font-normal text-xs">Obrigatório</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="allowMultiple"
                            checked={component.data.allowMultiple}
                            onChange={(e) => handleUpdate('allowMultiple', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor="allowMultiple" className="font-normal text-xs">Múltipla escolha</Label>
                    </div>
                </div>

                <div className="flex items-start gap-2">
                    <input
                        type="checkbox"
                        id="disableAutoAdvance"
                        checked={component.data.disableAutoAdvance}
                        onChange={(e) => handleUpdate('disableAutoAdvance', e.target.checked)}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                        <Label htmlFor="disableAutoAdvance" className="font-normal block text-xs">Não avançar auto.</Label>
                        <p className="text-[10px] text-gray-500">Requer clique no botão para seguir</p>
                    </div>
                </div>
            </div>

            {/* Layout Settings */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
                <Label className="text-xs font-semibold text-gray-900">Layout & Estilo</Label>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <Label className="text-[10px] text-gray-500 mb-1 block">Colunas</Label>
                        <Select
                            value={component.data.layout === 'grid' ? 'grid' : 'list'}
                            onValueChange={(val) => handleUpdate('layout', val)}
                        >
                            <SelectTrigger className="h-7 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="list">1 Coluna</SelectItem>
                                <SelectItem value="grid">2 Colunas</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className="text-[10px] text-gray-500 mb-1 block">Check</Label>
                        <Select
                            value={component.data.checkPosition || 'right'}
                            onValueChange={(val) => handleUpdate('checkPosition', val)}
                        >
                            <SelectTrigger className="h-7 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="left">Esquerda</SelectItem>
                                <SelectItem value="right">Direita</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className="text-[10px] text-gray-500 mb-1 block">Emoji</Label>
                        <Select
                            value={component.data.emojiPosition || 'left'}
                            onValueChange={(val) => handleUpdate('emojiPosition', val)}
                        >
                            <SelectTrigger className="h-7 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="left">Esquerda</SelectItem>
                                <SelectItem value="right">Direita</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <Label className="text-[10px] text-gray-500 mb-1 block">Tamanho da Fonte</Label>
                        <Select
                            value={component.data.fontSize || 'md'}
                            onValueChange={(val) => handleUpdate('fontSize', val)}
                        >
                            <SelectTrigger className="h-7 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sm">Pequeno</SelectItem>
                                <SelectItem value="md">Médio</SelectItem>
                                <SelectItem value="lg">Grande</SelectItem>
                                <SelectItem value="xl">Extra Grande</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="showCheck"
                            checked={component.data.showCheck !== false}
                            onChange={(e) => handleUpdate('showCheck', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor="showCheck" className="font-normal text-xs">Ícone Check</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="showEmoji"
                            checked={component.data.showEmoji !== false}
                            onChange={(e) => handleUpdate('showEmoji', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor="showEmoji" className="font-normal text-xs">Emoji/Img</Label>
                    </div>
                </div>
            </div>

            {/* Button Design Settings */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
                <Label className="text-xs font-semibold text-gray-900">Design do Botão</Label>

                <div>
                    <Label className="text-[10px] text-gray-500 mb-1 block">Estilo</Label>
                    <Select
                        value={component.data.buttonStyle || 'outline'}
                        onValueChange={(val) => handleUpdate('buttonStyle', val)}
                    >
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="outline">Borda (Outline)</SelectItem>
                            <SelectItem value="solid">Sólido (Flat)</SelectItem>
                            <SelectItem value="shadow-sm">Sólido (Sombra Peq.)</SelectItem>
                            <SelectItem value="shadow-md">Sólido (Sombra Méd.)</SelectItem>
                            <SelectItem value="shadow-lg">Sólido (Sombra Gr.)</SelectItem>
                            <SelectItem value="3d">3D (Sombra Dura)</SelectItem>
                            <SelectItem value="ghost">Transparente (Ghost)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <ColorPicker
                        label="Cor de Fundo"
                        value={component.data.backgroundColor || '#ffffff'}
                        onChange={(color) => handleUpdate('backgroundColor', color)}
                    />
                    <ColorPicker
                        label="Cor do Texto"
                        value={component.data.textColor || '#111827'}
                        onChange={(color) => handleUpdate('textColor', color)}
                        align="right"
                    />
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <Label className="text-[10px] text-gray-500 mb-1 block">Arredondamento</Label>
                        <Select
                            value={component.data.borderRadius || 'xl'}
                            onValueChange={(val) => handleUpdate('borderRadius', val)}
                        >
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Quadrado</SelectItem>
                                <SelectItem value="sm">Pequeno</SelectItem>
                                <SelectItem value="md">Médio</SelectItem>
                                <SelectItem value="lg">Grande</SelectItem>
                                <SelectItem value="xl">Extra Grande</SelectItem>
                                <SelectItem value="full">Redondo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className="text-[10px] text-gray-500 mb-1 block">Espaçamento (px)</Label>
                        <Input
                            type="number"
                            value={component.data.spacing || 12}
                            onChange={(e) => handleUpdate('spacing', parseInt(e.target.value))}
                            className="h-8 text-xs"
                            min={0}
                            max={100}
                        />
                    </div>
                </div>
            </div>

            {/* Variable Name */}
            <div className="pt-4 border-t border-gray-200">
                <Label className="text-xs mb-1 block">Nome da Variável (Analytics)</Label>
                <Input
                    value={component.data.variableName || ''}
                    onChange={(e) => handleUpdate('variableName', e.target.value)}
                    placeholder="ex: objetivo_usuario"
                    className="h-8 text-sm"
                />
            </div>
        </div>
    );
}

/**
 * Aba de sugestão de emoji com busca PT-BR e emoji automático do texto.
 */
function EmojiSuggestTab({ option, onUpdate }: { option: QuizOptionItem; onUpdate: (opt: QuizOptionItem) => void }) {
    const [searchQuery, setSearchQuery] = useState('');
    const popularCategories = useMemo(() => getPopularEmojiCategories(), []);

    const suggestedEmoji = useMemo(() => {
        if (!option.label) return null;
        return suggestEmojiFromText(option.label);
    }, [option.label]);

    const searchResults = useMemo(() => {
        if (!searchQuery || searchQuery.length < 2) return [];
        return searchEmojiPT_BR(searchQuery);
    }, [searchQuery]);

    const handleAutoSuggest = () => {
        if (suggestedEmoji) {
            onUpdate({ ...option, emoji: suggestedEmoji, imageSrc: undefined });
        }
    };

    return (
        <div className="space-y-3 max-h-[340px] overflow-y-auto">
            {/* Sugestão automática baseada no texto */}
            {option.label && (
                <div className="p-2 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Wand2 className="w-3.5 h-3.5 text-blue-500" />
                            <span className="text-xs text-blue-700 font-medium">
                                {suggestedEmoji ? (
                                    <>Sugerido: <span className="text-lg ml-1">{suggestedEmoji}</span></>
                                ) : (
                                    'Digite algo para sugerir um emoji'
                                )}
                            </span>
                        </div>
                        {suggestedEmoji && (
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 text-[10px] text-blue-600 hover:text-blue-700"
                                onClick={handleAutoSuggest}
                            >
                                Aplicar
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Busca PT-BR */}
            <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar emoji em português..."
                    className="h-8 text-xs pl-8"
                    autoFocus
                />
            </div>

            {/* Resultados da busca */}
            {searchResults.length > 0 && (
                <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 px-1">
                        Resultados para &quot;{searchQuery}&quot;
                    </p>
                    <div className="grid grid-cols-8 gap-1">
                        {searchResults.map(({ emoji, label }) => (
                            <button
                                key={emoji + label}
                                onClick={() => onUpdate({ ...option, emoji, imageSrc: undefined })}
                                className={cn(
                                    'w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-lg transition-colors',
                                    option.emoji === emoji && 'bg-blue-100 ring-2 ring-blue-400'
                                )}
                                title={label}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Emojis populares (quando não está buscando) */}
            {(!searchQuery || searchQuery.length < 2) && popularCategories.map((category) => (
                <div key={category.label}>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 px-1">
                        {category.label}
                    </p>
                    <div className="grid grid-cols-8 gap-1">
                        {category.emojis.map((emoji) => (
                            <button
                                key={emoji}
                                onClick={() => onUpdate({ ...option, emoji, imageSrc: undefined })}
                                className={cn(
                                    'w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-lg transition-colors',
                                    option.emoji === emoji && 'bg-blue-100 ring-2 ring-blue-400'
                                )}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
