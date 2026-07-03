'use client';

import React, { useRef, useCallback } from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    X, GripVertical, Image as ImageIcon, Settings, Trash2, Plus,
    Bold, Italic, Underline, Strikethrough,
    AlignLeft, AlignCenter, AlignRight,
    Type, CaseSensitive, LetterText, Gauge, RotateCcw
} from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArgumentComponent, ArgumentItem } from '@/types/funnel';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const FONT_OPTIONS = [
    'Inter', 'Arial', 'Helvetica', 'Times New Roman', 'Georgia',
    'Courier New', 'Verdana', 'Roboto', 'Open Sans', 'Lato',
    'Montserrat', 'Poppins', 'Oswald', 'Raleway', 'Nunito',
    'Source Sans Pro', 'Ubuntu', 'Playfair Display', 'Merriweather', 'PT Sans'
];

function MiniToolbar({
    style,
    onStyleUpdate,
    label
}: {
    style?: ArgumentItem['titleStyle'];
    onStyleUpdate: (s: any) => void;
    label: string;
}) {
    const execOnContentEditable = useCallback((command: string, value?: string) => {
        document.execCommand(command, false, value);
    }, []);

    return (
        <div className="border border-gray-200 rounded-lg p-1.5 bg-gray-50 space-y-1.5">
            <div className="text-[10px] text-gray-400 font-medium px-1">{label}</div>
            <div className="flex flex-wrap items-center gap-0.5">
                <button
                    onClick={() => execOnContentEditable('bold')}
                    onMouseDown={(e) => e.preventDefault()}
                    className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${style?.bold ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
                    title="Negrito"
                >
                    <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={() => execOnContentEditable('italic')}
                    onMouseDown={(e) => e.preventDefault()}
                    className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${style?.italic ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
                    title="Itálico"
                >
                    <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={() => execOnContentEditable('underline')}
                    onMouseDown={(e) => e.preventDefault()}
                    className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${style?.underline ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
                    title="Sublinhado"
                >
                    <Underline className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={() => execOnContentEditable('strikeThrough')}
                    onMouseDown={(e) => e.preventDefault()}
                    className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${style?.strikethrough ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
                    title="Tachado"
                >
                    <Strikethrough className="w-3.5 h-3.5" />
                </button>

                <div className="w-px h-5 bg-gray-300 mx-0.5" />

                <div className="relative">
                    <input
                        type="color"
                        value={style?.color || '#111827'}
                        onChange={(e) => {
                            execOnContentEditable('foreColor', e.target.value);
                            onStyleUpdate({ ...style, color: e.target.value });
                        }}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        title="Cor do Texto"
                    />
                    <div className="flex flex-col items-center p-1 hover:bg-gray-200 rounded cursor-pointer">
                        <Type className="w-3.5 h-3.5 text-gray-600" />
                        <div className="w-5 h-1 rounded-sm mt-0.5 border border-gray-300" style={{ backgroundColor: style?.color || '#111827' }} />
                    </div>
                </div>

                <div className="w-px h-5 bg-gray-300 mx-0.5" />

                {[
                    { cmd: 'justifyLeft', icon: AlignLeft, label: 'Esquerda' },
                    { cmd: 'justifyCenter', icon: AlignCenter, label: 'Centro' },
                    { cmd: 'justifyRight', icon: AlignRight, label: 'Direita' },
                ].map(({ cmd, icon: Icon, label }) => (
                    <button
                        key={cmd}
                        onClick={() => execOnContentEditable(cmd)}
                        onMouseDown={(e) => e.preventDefault()}
                        className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600"
                        title={label}
                    >
                        <Icon className="w-3.5 h-3.5" />
                    </button>
                ))}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
                <div className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-500">Tam:</span>
                    <input
                        type="number"
                        min="8"
                        max="72"
                        value={style?.fontSize || 16}
                        onChange={(e) => onStyleUpdate({ ...style, fontSize: parseInt(e.target.value) || 16 })}
                        className="w-14 h-7 text-center text-xs border border-gray-200 rounded px-1"
                    />
                    <span className="text-[10px] text-gray-400">px</span>
                </div>

                <select
                    value={style?.fontFamily || 'Inter'}
                    onChange={(e) => onStyleUpdate({ ...style, fontFamily: e.target.value })}
                    className="h-7 text-xs border border-gray-200 rounded px-1.5 bg-white max-w-[100px]"
                >
                    {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>

                <select
                    value={style?.textTransform || 'none'}
                    onChange={(e) => onStyleUpdate({ ...style, textTransform: e.target.value as any })}
                    className="h-7 text-xs border border-gray-200 rounded px-1.5 bg-white"
                >
                    <option value="none">Normal</option>
                    <option value="uppercase">MAIÚSC.</option>
                    <option value="lowercase">minúsc.</option>
                    <option value="capitalize">Capitalizar</option>
                </select>

                <div className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-500">Esp:</span>
                    <input
                        type="number"
                        min="-2"
                        max="10"
                        step="0.5"
                        value={style?.letterSpacing || 0}
                        onChange={(e) => onStyleUpdate({ ...style, letterSpacing: parseFloat(e.target.value) || 0 })}
                        className="w-12 h-7 text-center text-xs border border-gray-200 rounded px-1"
                    />
                </div>

                <div className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-500">Alt:</span>
                    <input
                        type="number"
                        min="0.8"
                        max="3"
                        step="0.1"
                        value={style?.lineHeight || 1.5}
                        onChange={(e) => onStyleUpdate({ ...style, lineHeight: parseFloat(e.target.value) || 1.5 })}
                        className="w-12 h-7 text-center text-xs border border-gray-200 rounded px-1"
                    />
                </div>
            </div>
        </div>
    );
}

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
    const titleRef = useRef<HTMLDivElement>(null);
    const descRef = useRef<HTMLDivElement>(null);

    const handleTitleBlur = useCallback(() => {
        if (titleRef.current) {
            const html = titleRef.current.innerHTML;
            const text = titleRef.current.innerText;
            onUpdate({ ...item, title: text, titleHtml: html });
        }
    }, [item, onUpdate]);

    const handleDescBlur = useCallback(() => {
        if (descRef.current) {
            const html = descRef.current.innerHTML;
            const text = descRef.current.innerText;
            onUpdate({ ...item, description: text, descriptionHtml: html });
        }
    }, [item, onUpdate]);

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

            {isExpanded && (
                <div className="p-4 space-y-4 bg-gray-50/50 border-t border-gray-100">
                    {/* Title with rich text toolbar */}
                    <div>
                        <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Título</Label>
                        <MiniToolbar
                            style={item.titleStyle}
                            onStyleUpdate={(s) => onUpdate({ ...item, titleStyle: s })}
                            label="Estilo do Título"
                        />
                        <div
                            ref={titleRef}
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={handleTitleBlur}
                            className="mt-2 p-3 bg-white border border-gray-200 rounded-lg text-sm min-h-[40px] outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                            style={{
                                color: item.titleStyle?.color || '#111827',
                                fontSize: item.titleStyle?.fontSize ? `${item.titleStyle.fontSize}px` : undefined,
                                fontFamily: item.titleStyle?.fontFamily,
                                fontWeight: item.titleStyle?.bold ? 'bold' : undefined,
                                fontStyle: item.titleStyle?.italic ? 'italic' : undefined,
                                textDecoration: [
                                    item.titleStyle?.underline ? 'underline' : '',
                                    item.titleStyle?.strikethrough ? 'line-through' : ''
                                ].filter(Boolean).join(' ') || undefined,
                                textAlign: item.titleStyle?.align,
                                textTransform: item.titleStyle?.textTransform,
                                letterSpacing: item.titleStyle?.letterSpacing ? `${item.titleStyle.letterSpacing}px` : undefined,
                                lineHeight: item.titleStyle?.lineHeight,
                            }}
                            dangerouslySetInnerHTML={{ __html: item.titleHtml || item.title || '' }}
                        />
                    </div>

                    {/* Description with rich text toolbar */}
                    <div>
                        <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Descrição</Label>
                        <MiniToolbar
                            style={item.descriptionStyle}
                            onStyleUpdate={(s) => onUpdate({ ...item, descriptionStyle: s })}
                            label="Estilo da Descrição"
                        />
                        <div
                            ref={descRef}
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={handleDescBlur}
                            className="mt-2 p-3 bg-white border border-gray-200 rounded-lg text-sm min-h-[80px] outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all whitespace-pre-wrap"
                            style={{
                                color: item.descriptionStyle?.color || '#374151',
                                fontSize: item.descriptionStyle?.fontSize ? `${item.descriptionStyle.fontSize}px` : undefined,
                                fontFamily: item.descriptionStyle?.fontFamily,
                                fontWeight: item.descriptionStyle?.bold ? 'bold' : undefined,
                                fontStyle: item.descriptionStyle?.italic ? 'italic' : undefined,
                                textDecoration: [
                                    item.descriptionStyle?.underline ? 'underline' : '',
                                    item.descriptionStyle?.strikethrough ? 'line-through' : ''
                                ].filter(Boolean).join(' ') || undefined,
                                textAlign: item.descriptionStyle?.align,
                                textTransform: item.descriptionStyle?.textTransform,
                                letterSpacing: item.descriptionStyle?.letterSpacing ? `${item.descriptionStyle.letterSpacing}px` : undefined,
                                lineHeight: item.descriptionStyle?.lineHeight,
                            }}
                            dangerouslySetInnerHTML={{ __html: item.descriptionHtml || item.description || '' }}
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Use Enter para quebras de linha. O texto formatado (negrito, itálico, etc) será preservado.</p>
                    </div>

                    {/* Card Style */}
                    <div>
                        <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Estilo do Card</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <span className="text-[10px] text-gray-500">Cor de Fundo</span>
                                <div className="flex items-center gap-1.5">
                                    <input
                                        type="color"
                                        value={item.cardStyle?.backgroundColor || '#ffffff'}
                                        onChange={(e) => onUpdate({ ...item, cardStyle: { ...item.cardStyle, backgroundColor: e.target.value } })}
                                        className="w-7 h-7 rounded border border-gray-200 cursor-pointer"
                                    />
                                    <span className="text-[10px] text-gray-400">{item.cardStyle?.backgroundColor || '#ffffff'}</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-500">Cor da Borda</span>
                                <div className="flex items-center gap-1.5">
                                    <input
                                        type="color"
                                        value={item.cardStyle?.borderColor || '#e5e7eb'}
                                        onChange={(e) => onUpdate({ ...item, cardStyle: { ...item.cardStyle, borderColor: e.target.value } })}
                                        className="w-7 h-7 rounded border border-gray-200 cursor-pointer"
                                    />
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-500">Raio da Borda</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="32"
                                    value={item.cardStyle?.borderRadius ?? 16}
                                    onChange={(e) => onUpdate({ ...item, cardStyle: { ...item.cardStyle, borderRadius: parseInt(e.target.value) || 16 } })}
                                    className="w-full h-7 text-xs border border-gray-200 rounded px-2"
                                />
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-500">Sombra</span>
                                <select
                                    value={item.cardStyle?.shadow || 'sm'}
                                    onChange={(e) => onUpdate({ ...item, cardStyle: { ...item.cardStyle, shadow: e.target.value as any } })}
                                    className="w-full h-7 text-xs border border-gray-200 rounded px-1.5 bg-white"
                                >
                                    <option value="none">Nenhuma</option>
                                    <option value="sm">Pequena</option>
                                    <option value="md">Média</option>
                                    <option value="lg">Grande</option>
                                    <option value="xl">Extra Grande</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Image */}
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
                        <MiniToolbar
                            style={component.data.headlineStyle}
                            onStyleUpdate={(s) => handleUpdate('headlineStyle', s)}
                            label="Estilo do Título"
                        />
                        <div
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => {
                                const target = e.currentTarget;
                                handleUpdate('headline', target.innerText);
                                handleUpdate('headlineHtml', target.innerHTML);
                            }}
                            className="p-3 bg-white border border-gray-200 rounded-lg text-sm min-h-[40px] outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                            style={{
                                color: component.data.headlineStyle?.color || component.data.headlineColor || '#2563EB',
                                fontSize: component.data.headlineStyle?.fontSize ? `${component.data.headlineStyle.fontSize}px` : undefined,
                                fontFamily: component.data.headlineStyle?.fontFamily,
                                fontWeight: component.data.headlineStyle?.bold ? 'bold' : 'bold',
                                fontStyle: component.data.headlineStyle?.italic ? 'italic' : undefined,
                                textAlign: component.data.headlineStyle?.align || 'center',
                                textTransform: component.data.headlineStyle?.textTransform,
                            }}
                            dangerouslySetInnerHTML={{ __html: component.data.headlineHtml || component.data.headline || '' }}
                        />
                    </div>

                    {/* Items List */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-gray-700">Lista de Argumentos</Label>
                            <span className="text-[10px] text-gray-400">{items.length} itens</span>
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
                                            titleHtml: `<b>Argumento ${items.length + 1}</b>`,
                                            description: 'Adicione uma descrição persuasiva aqui.',
                                            descriptionHtml: 'Adicione uma descrição persuasiva aqui.',
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

                        <div>
                            <Label className="text-xs font-medium text-gray-700 mb-2 block">Espaçamento entre Cards</Label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="range"
                                    min="0"
                                    max="24"
                                    value={component.data.gap ?? 6}
                                    onChange={(e) => handleUpdate('gap', parseInt(e.target.value))}
                                    className="flex-1 h-2 accent-blue-600"
                                />
                                <span className="text-xs text-gray-500 w-8 text-right">{component.data.gap ?? 6}</span>
                            </div>
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
                    <div className="space-y-4">
                        <div>
                            <Label className="text-xs font-semibold text-gray-700 mb-2 block">Cores Globais</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <span className="text-[10px] text-gray-500 mb-1 block">Cor do Título</span>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={component.data.headlineColor || '#2563EB'}
                                            onChange={(e) => handleUpdate('headlineColor', e.target.value)}
                                            className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
                                        />
                                        <span className="text-xs text-gray-500">{component.data.headlineColor || '#2563EB'}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-500 mb-1 block">Cor do Texto</span>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={component.data.textColor || '#3B82F6'}
                                            onChange={(e) => handleUpdate('textColor', e.target.value)}
                                            className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
                                        />
                                        <span className="text-xs text-gray-500">{component.data.textColor || '#3B82F6'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
