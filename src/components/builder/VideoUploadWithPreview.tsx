'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, Loader2, Play } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface VideoUploadWithPreviewProps {
    value: string;
    onChange: (url: string) => void;
    onUploadComplete?: (data: { url: string; publicId: string }) => void;
    label?: string;
    placeholder?: string;
    helpText?: string;
    funnelId?: string;
}

export function VideoUploadWithPreview({
    value,
    onChange,
    onUploadComplete,
    label,
    placeholder = 'https://...',
    helpText,
    funnelId
}: VideoUploadWithPreviewProps) {
    const [isUploading, setIsUploading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
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
                    toast.success('Vídeo enviado com sucesso!');
                } else {
                    const error = await response.json();
                    console.error('Upload failed:', error);
                    toast.error('Erro ao fazer upload do vídeo', {
                        description: error.details || 'Tente novamente.'
                    });
                }
            } catch (error) {
                console.error('Upload error:', error);
                toast.error('Erro ao fazer upload do vídeo', {
                    description: 'Verifique sua conexão e tente novamente.'
                });
            } finally {
                setIsUploading(false);
            }
        }
    }, [onChange, funnelId, onUploadComplete]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'video/*': ['.mp4', '.mov', '.webm', '.avi'] },
        maxFiles: 1,
        disabled: isUploading,
    });

    return (
        <div className="space-y-2">
            {label && (
                <label className="text-xs font-medium text-gray-700 block">{label}</label>
            )}

            <div className="flex flex-col gap-3">
                {/* Upload Zone */}
                <div
                    {...getRootProps()}
                    className={`
                        w-full h-32 border-2 border-dashed flex flex-col items-center justify-center cursor-pointer
                        rounded-lg transition-all group relative overflow-hidden
                        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                        ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
                        ${value ? 'border-solid border-gray-200 bg-gray-50' : ''}
                    `}
                >
                    <input {...getInputProps()} />

                    {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                            <span className="text-xs text-gray-500 font-medium">Enviando vídeo...</span>
                        </div>
                    ) : value ? (
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <Play className="w-6 h-6 text-blue-600 fill-blue-600" />
                            </div>
                            <span className="text-xs text-blue-600 font-bold">Vídeo Selecionado</span>
                            <span className="text-[10px] text-gray-400 max-w-[200px] truncate">{value}</span>

                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="flex flex-col items-center gap-2">
                                    <UploadCloud className="w-6 h-6 text-white" />
                                    <span className="text-xs text-white font-medium">Trocar vídeo</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <UploadCloud className="w-8 h-8 text-gray-400" />
                            <div className="text-center">
                                <p className="text-xs font-medium text-gray-700">Arraste ou clique para enviar</p>
                                <p className="text-[10px] text-gray-400">MP4, MOV ou WebM (Max 50MB recomendado)</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* URL Input + Remove Button */}
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
                            title="Remover vídeo"
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
    );
}
