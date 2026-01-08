'use client';

import React, { useState, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, X, ExternalLink } from 'lucide-react';

interface LogoUploadProps {
    logoUrl?: string;
    logoSize?: 'sm' | 'md' | 'lg';
    logoLink?: string;
    onLogoChange: (url: string) => void;
    onSizeChange: (size: 'sm' | 'md' | 'lg') => void;
    onLinkChange: (link: string) => void;
    onRemove: () => void;
}

export function LogoUpload({
    logoUrl,
    logoSize = 'md',
    logoLink,
    onLogoChange,
    onSizeChange,
    onLinkChange,
    onRemove
}: LogoUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            await convertToBase64(file);
        }
    }, []);

    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await convertToBase64(file);
        }
    }, []);

    const convertToBase64 = async (file: File) => {
        setIsUploading(true);
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            onLogoChange(base64);
            setIsUploading(false);
        };
        reader.readAsDataURL(file);
    };

    const sizeOptions = [
        { value: 'sm', label: 'Pequeno', height: 'h-12' },
        { value: 'md', label: 'Médio', height: 'h-16' },
        { value: 'lg', label: 'Grande', height: 'h-20' }
    ];

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            {!logoUrl ? (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                >
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-2">
                        Arraste uma imagem ou clique para selecionar
                    </p>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="logo-upload"
                    />
                    <label htmlFor="logo-upload">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="cursor-pointer"
                            asChild
                        >
                            <span>Escolher Imagem</span>
                        </Button>
                    </label>
                </div>
            ) : (
                <div className="space-y-3">
                    {/* Preview */}
                    <div className="relative bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                        <img
                            src={logoUrl}
                            alt="Logo preview"
                            className={`object-contain ${sizeOptions.find(s => s.value === logoSize)?.height || 'h-16'}`}
                        />
                        <button
                            onClick={onRemove}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Size Selector */}
                    <div>
                        <Label className="text-xs mb-2 block">Tamanho do Logo</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {sizeOptions.map((size) => (
                                <button
                                    key={size.value}
                                    onClick={() => onSizeChange(size.value as 'sm' | 'md' | 'lg')}
                                    className={`px-3 py-2 text-xs rounded-md border transition-colors ${logoSize === size.value
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                                        }`}
                                >
                                    {size.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Link Input */}
                    <div>
                        <Label className="text-xs mb-1.5 block flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            Link ao Clicar (Opcional)
                        </Label>
                        <Input
                            type="url"
                            placeholder="https://seusite.com"
                            value={logoLink || ''}
                            onChange={(e) => onLinkChange(e.target.value)}
                            className="text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Deixe vazio se não quiser link
                        </p>
                    </div>
                </div>
            )}

            {/* URL Input Alternative */}
            {!logoUrl && (
                <div>
                    <Label className="text-xs mb-1.5 block">Ou cole a URL da Imagem</Label>
                    <div className="flex gap-2">
                        <Input
                            type="url"
                            placeholder="https://..."
                            onChange={(e) => {
                                if (e.target.value) {
                                    onLogoChange(e.target.value);
                                }
                            }}
                            className="text-sm flex-1"
                        />
                    </div>
                </div>
            )}

            {isUploading && (
                <p className="text-xs text-blue-600 text-center">Processando imagem...</p>
            )}
        </div>
    );
}
