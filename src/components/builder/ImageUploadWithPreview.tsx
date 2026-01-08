'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ImageUploadWithPreviewProps {
    value: string;
    onChange: (url: string) => void;
    onUploadComplete?: (data: { url: string; publicId: string }) => void;
    label?: string;
    placeholder?: string;
    previewShape?: 'circle' | 'rounded' | 'square';
    previewSize?: 'sm' | 'md' | 'lg';
    helpText?: string;
    funnelId?: string;
}

export function ImageUploadWithPreview({
    value,
    onChange,
    onUploadComplete,
    label,
    placeholder = 'https://...',
    previewShape = 'rounded',
    previewSize = 'md',
    helpText,
    funnelId
}: ImageUploadWithPreviewProps) {
    const [isUploading, setIsUploading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[], fileRejections: any[], event: any) => {
        const file = acceptedFiles[0];

        if (file) {
            setIsUploading(true);
            try {
                const formData = new FormData();
                formData.append('file', file);
                if (funnelId) {
                    formData.append('funnelId', funnelId);
                }

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    onChange(data.url);
                    if (onUploadComplete) {
                        onUploadComplete({ url: data.url, publicId: data.publicId });
                    }
                    toast.success('Imagem enviada com sucesso!');
                } else {
                    const error = await response.json();
                    console.error('Upload failed:', error);
                    toast.error('Erro ao fazer upload da imagem', {
                        description: error.details || 'Tente novamente.'
                    });
                }
            } catch (error) {
                console.error('Upload error:', error);
                toast.error('Erro ao fazer upload da imagem', {
                    description: 'Verifique sua conexão e tente novamente.'
                });
            } finally {
                setIsUploading(false);
            }
        } else if (event?.dataTransfer) {
            // Handle URL drop
            const url = event.dataTransfer.getData('text/uri-list') || event.dataTransfer.getData('text/plain');
            if (url && (url.match(/\.(jpeg|jpg|gif|png|webp)/i) || url.startsWith('http'))) {
                onChange(url);
            }
        }
    }, [onChange, funnelId]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
        maxFiles: 1,
        disabled: isUploading,
    });

    const sizeClasses = {
        sm: 'w-12 h-12',
        md: 'w-16 h-16',
        lg: 'w-24 h-24',
    };

    const shapeClasses = {
        circle: 'rounded-full',
        rounded: 'rounded-lg',
        square: 'rounded-none',
    };

    return (
        <div className="space-y-2">
            {label && (
                <label className="text-xs font-medium text-gray-700 block">{label}</label>
            )}

            <div className="flex items-start gap-3">
                {/* Preview / Upload Zone */}
                <div
                    {...getRootProps()}
                    className={`
                        ${sizeClasses[previewSize]} 
                        ${shapeClasses[previewShape]}
                        border-2 border-dashed flex items-center justify-center cursor-pointer
                        overflow-hidden transition-all group relative
                        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                        ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
                        ${value ? 'border-solid border-gray-200' : ''}
                    `}
                >
                    <input {...getInputProps()} />

                    {isUploading ? (
                        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    ) : value ? (
                        <>
                            <img
                                src={value}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <UploadCloud className="w-5 h-5 text-white" />
                            </div>
                        </>
                    ) : (
                        <UploadCloud className="w-6 h-6 text-gray-400" />
                    )}
                </div>

                {/* URL Input + Remove Button */}
                <div className="flex-1 space-y-1">
                    <div className="flex gap-1">
                        <Input
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder={placeholder}
                            className="text-xs"
                        />
                        {value && (
                            <button
                                type="button"
                                onClick={() => onChange('')}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                title="Remover imagem"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    {helpText && (
                        <p className="text-[10px] text-gray-400">{helpText}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
