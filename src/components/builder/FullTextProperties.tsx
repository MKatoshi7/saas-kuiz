'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { ColorPickerWithPalette } from './ColorPickerWithPalette';
import {
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify
} from 'lucide-react';

interface FullTextPropertiesProps {
    data: any;
    onUpdate: (field: string, value: any) => void;
}

export function FullTextProperties({ data, onUpdate }: FullTextPropertiesProps) {
    const alignments = [
        { value: 'left', icon: AlignLeft, label: 'Esquerda' },
        { value: 'center', icon: AlignCenter, label: 'Centro' },
        { value: 'right', icon: AlignRight, label: 'Direita' },
        { value: 'justify', icon: AlignJustify, label: 'Justificar' }
    ];

    return (
        <div className="space-y-4 pt-4 border-t border-gray-200 mt-4">
            {/* Tamanho da Fonte */}
            <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700">Tamanho da Fonte</Label>
                <select
                    value={data.fontSize || 'normal'}
                    onChange={(e) => onUpdate('fontSize', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="micro">Micro (8px)</option>
                    <option value="minusculo">Minúsculo (12px)</option>
                    <option value="small">Pequeno (16px)</option>
                    <option value="normal">Normal (18px)</option>
                    <option value="medium">Médio (20px)</option>
                    <option value="big">Grande (24px)</option>
                    <option value="bigger">Muito Grande (30px)</option>
                    <option value="huge">Gigante (36px)</option>
                </select>
            </div>

            {/* Peso da Fonte */}
            <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700">Peso da Fonte</Label>
                <select
                    value={data.fontWeight || '400'}
                    onChange={(e) => onUpdate('fontWeight', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="300">Light (300)</option>
                    <option value="400">Normal (400)</option>
                    <option value="500">Medium (500)</option>
                    <option value="600">Semi Bold (600)</option>
                    <option value="700">Bold (700)</option>
                    <option value="800">Extra Bold (800)</option>
                    <option value="900">Black (900)</option>
                </select>
            </div>

            {/* Alinhamento */}
            <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700">Alinhamento</Label>
                <div className="flex gap-1 border border-gray-300 rounded-md p-1">
                    {alignments.map(({ value, icon: Icon, label }) => (
                        <button
                            key={value}
                            onClick={() => onUpdate('align', value)}
                            className={`flex-1 p-2 rounded transition-colors ${(data.align || 'left') === value
                                ? 'bg-blue-100 text-blue-600'
                                : 'hover:bg-gray-100'
                                }`}
                            title={label}
                        >
                            <Icon className="w-4 h-4 mx-auto" />
                        </button>
                    ))}
                </div>
            </div>


            {/* Espaçamento entre Letras */}
            <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700">Espaçamento entre Letras</Label>
                <select
                    value={data.letterSpacing || 'normal'}
                    onChange={(e) => onUpdate('letterSpacing', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="tighter">Mais Apertado</option>
                    <option value="tight">Apertado</option>
                    <option value="normal">Normal</option>
                    <option value="wide">Largo</option>
                    <option value="wider">Mais Largo</option>
                    <option value="widest">Muito Largo</option>
                </select>
            </div>

            {/* Altura da Linha */}
            <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700">Altura da Linha</Label>
                <select
                    value={data.lineHeight || 'normal'}
                    onChange={(e) => onUpdate('lineHeight', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="tight">Compacto</option>
                    <option value="snug">Ajustado</option>
                    <option value="normal">Normal</option>
                    <option value="relaxed">Relaxado</option>
                    <option value="loose">Solto</option>
                </select>
            </div>

            {/* Transformação de Texto */}
            <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700">Transformação de Texto</Label>
                <select
                    value={data.textTransform || 'none'}
                    onChange={(e) => onUpdate('textTransform', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="none">Nenhuma</option>
                    <option value="uppercase">MAIÚSCULAS</option>
                    <option value="lowercase">minúsculas</option>
                    <option value="capitalize">Capitalizar Palavras</option>
                </select>
            </div>

            {/* Sombra */}
            <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700">Sombra</Label>
                <select
                    value={data.dropShadow || 'none'}
                    onChange={(e) => onUpdate('dropShadow', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="none">Nenhuma</option>
                    <option value="sm">Pequena</option>
                    <option value="md">Média</option>
                    <option value="lg">Grande</option>
                    <option value="xl">Extra Grande</option>
                </select>
            </div>

            {/* Contorno */}
            <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700">Contorno</Label>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <Label className="text-[10px] text-gray-500 mb-1 block">Largura</Label>
                        <select
                            value={data.textStroke?.width || 0}
                            onChange={(e) =>
                                onUpdate('textStroke', {
                                    ...data.textStroke,
                                    width: Number(e.target.value)
                                })
                            }
                            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="0">Nenhum</option>
                            <option value="1">1px</option>
                            <option value="2">2px</option>
                            <option value="3">3px</option>
                            <option value="4">4px</option>
                            <option value="5">5px</option>
                        </select>
                    </div>
                    {(data.textStroke?.width || 0) > 0 && (
                        <div>
                            <Label className="text-[10px] text-gray-500 mb-1 block">Cor</Label>
                            <input
                                type="color"
                                value={data.textStroke?.color || '#000000'}
                                onChange={(e) =>
                                    onUpdate('textStroke', {
                                        ...data.textStroke,
                                        color: e.target.value
                                    })
                                }
                                className="w-full h-[30px] rounded border border-gray-300 cursor-pointer"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
