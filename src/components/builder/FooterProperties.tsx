'use client';

import React from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { FooterComponent } from '@/types/funnel';

export function FooterProperties({ component }: { component: FooterComponent }) {
    const updateComponent = useBuilderStore((state) => state.updateComponent);

    const handleUpdate = (field: string, value: any) => {
        updateComponent(component.id, {
            ...component,
            data: { ...component.data, [field]: value },
        } as any);
    };

    const links = component.data.links || [];

    const addLink = () => {
        const newLink = {
            id: crypto.randomUUID(),
            label: 'Novo Link',
            url: '#'
        };
        handleUpdate('links', [...links, newLink]);
    };

    const updateLink = (id: string, field: string, value: string) => {
        const newLinks = links.map(link =>
            link.id === id ? { ...link, [field]: value } : link
        );
        handleUpdate('links', newLinks);
    };

    const removeLink = (id: string) => {
        const newLinks = links.filter(link => link.id !== id);
        handleUpdate('links', newLinks);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label>Texto de Copyright</Label>
                <Input
                    value={component.data.text || ''}
                    onChange={(e) => handleUpdate('text', e.target.value)}
                    placeholder="© 2024 Sua Empresa"
                />
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label>Links do Rodapé</Label>
                    <Button variant="ghost" size="sm" onClick={addLink} className="h-6 w-6 p-0">
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>

                <div className="space-y-2">
                    {links.map((link) => (
                        <div key={link.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded border border-gray-100">
                            <div className="flex-1 space-y-2">
                                <Input
                                    value={link.label}
                                    onChange={(e) => updateLink(link.id, 'label', e.target.value)}
                                    placeholder="Nome do Link"
                                    className="h-7 text-xs"
                                />
                                <Input
                                    value={link.url}
                                    onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                                    placeholder="URL (https://...)"
                                    className="h-7 text-xs"
                                />
                            </div>
                            <button
                                onClick={() => removeLink(link.id)}
                                className="text-gray-400 hover:text-red-500 p-1"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                    {links.length === 0 && (
                        <p className="text-xs text-gray-400 text-center py-2">
                            Nenhum link adicionado
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label>Cores</Label>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <Label className="text-xs text-gray-500">Fundo</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="color"
                                value={component.data.backgroundColor || '#111827'}
                                onChange={(e) => handleUpdate('backgroundColor', e.target.value)}
                                className="w-8 h-8 p-0 border-0"
                            />
                            <span className="text-xs text-gray-500 font-mono">
                                {component.data.backgroundColor || '#111827'}
                            </span>
                        </div>
                    </div>
                    <div>
                        <Label className="text-xs text-gray-500">Texto</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="color"
                                value={component.data.textColor || '#ffffff'}
                                onChange={(e) => handleUpdate('textColor', e.target.value)}
                                className="w-8 h-8 p-0 border-0"
                            />
                            <span className="text-xs text-gray-500 font-mono">
                                {component.data.textColor || '#ffffff'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
