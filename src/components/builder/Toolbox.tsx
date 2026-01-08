'use client';

import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ComponentType } from '@/types/funnel';
import {
    Type,
    AlignLeft,
    MousePointerClick,
    Image as ImageIcon,
    Video,
    Timer,
    TextCursorInput,
    Loader2,
    Music,
    Sliders,
    MessageSquareQuote,
    MoveVertical,
    GalleryHorizontal,
    LayoutList,
    ChevronDown,
    ChevronRight
} from 'lucide-react';

interface ToolItem {
    type: ComponentType;
    label: string;
    icon: React.ReactNode;
}

interface Category {
    name: string;
    icon: React.ReactNode;
    items: ToolItem[];
}

const categories: Category[] = [
    {
        name: 'Texto',
        icon: <Type className="w-4 h-4" />,
        items: [
            {
                type: 'headline',
                label: 'Título',
                icon: <Type className="w-4 h-4" />
            },
            {
                type: 'paragraph',
                label: 'Parágrafo',
                icon: <AlignLeft className="w-4 h-4" />
            },
            {
                type: 'alert',
                label: 'Destaque',
                icon: <MessageSquareQuote className="w-4 h-4" />
            },
            {
                type: 'argument',
                label: 'Argumentos',
                icon: <MessageSquareQuote className="w-4 h-4" />
            },
            {
                type: 'faq',
                label: 'FAQ',
                icon: <LayoutList className="w-4 h-4" />
            },
            {
                type: 'footer',
                label: 'Rodapé',
                icon: <LayoutList className="w-4 h-4" />
            }
        ]
    },
    {
        name: 'Mídia',
        icon: <ImageIcon className="w-4 h-4" />,
        items: [
            {
                type: 'image',
                label: 'Imagem',
                icon: <ImageIcon className="w-4 h-4" />
            },
            {
                type: 'video',
                label: 'Vídeo',
                icon: <Video className="w-4 h-4" />
            },
            {
                type: 'carousel',
                label: 'Carrosel',
                icon: <GalleryHorizontal className="w-4 h-4" />
            },
            {
                type: 'testimonial',
                label: 'Depoimentos',
                icon: <MessageSquareQuote className="w-4 h-4" />
            },
            {
                type: 'audio',
                label: 'Áudio',
                icon: <Music className="w-4 h-4" />
            }
        ]
    },
    {
        name: 'Ação',
        icon: <MousePointerClick className="w-4 h-4" />,
        items: [
            {
                type: 'button',
                label: 'Botão',
                icon: <MousePointerClick className="w-4 h-4" />
            },
            {
                type: 'quiz-option',
                label: 'Opções',
                icon: <LayoutList className="w-4 h-4" />
            },
            {
                type: 'input',
                label: 'Input',
                icon: <TextCursorInput className="w-4 h-4" />
            },
            {
                type: 'slider',
                label: 'Slider',
                icon: <Sliders className="w-4 h-4" />
            },
            {
                type: 'timer',
                label: 'Timer',
                icon: <Timer className="w-4 h-4" />
            },
            {
                type: 'loading',
                label: 'Carregamento',
                icon: <Loader2 className="w-4 h-4" />
            },
            {
                type: 'spacer',
                label: 'Espaço',
                icon: <MoveVertical className="w-4 h-4" />
            }
        ]
    }
];

function DraggableToolboxItem({ type, label, icon }: ToolItem) {
    const { attributes, listeners, setNodeRef } = useDraggable({
        id: `toolbox-${type}`,
        data: {
            type,
            label,
            isToolboxItem: true
        }
    });

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className="flex flex-col items-center justify-center p-3 bg-white border border-black/5 rounded-xl hover:shadow-md hover:-translate-y-0.5 cursor-grab active:cursor-grabbing transition-all group h-20"
            suppressHydrationWarning
        >
            <div className="text-gray-400 group-hover:text-black transition-colors mb-2">
                {icon}
            </div>
            <span className="text-[10px] font-medium text-gray-500 group-hover:text-black text-center leading-tight">
                {label}
            </span>
        </div>
    );
}

function CategorySection({ category }: { category: Category }) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="mb-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-2 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-black transition-colors mb-1"
            >
                <div className="flex items-center gap-2">
                    {category.icon}
                    <span>{category.name}</span>
                </div>
                {isOpen ? (
                    <ChevronDown className="w-3 h-3" />
                ) : (
                    <ChevronRight className="w-3 h-3" />
                )}
            </button>

            {isOpen && (
                <div className="grid grid-cols-2 gap-1.5 mt-1.5 px-1">
                    {category.items.map((item, index) => (
                        <DraggableToolboxItem
                            key={`${item.type}-${index}`}
                            type={item.type}
                            label={item.label}
                            icon={item.icon}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export function Toolbox() {
    return (
        <div className="w-64 bg-[#FAFAFA] border-r border-black/5 p-4 overflow-y-auto">
            <div className="mb-4">
                <h3 className="text-xs font-bold text-gray-900 px-2 mb-2 hidden">
                    Componentes
                </h3>
            </div>

            {categories.map((category) => (
                <CategorySection key={category.name} category={category} />
            ))}
        </div>
    );
}
