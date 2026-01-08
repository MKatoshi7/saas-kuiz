import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface BackgroundImageUploadProps {
    currentUrl?: string;
    onUpload: (url: string) => void;
    funnelId: string | null;
}

export function BackgroundImageUpload({ currentUrl, onUpload, funnelId }: BackgroundImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        if (!funnelId) {
            toast.error('ID do funil não encontrado');
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('funnelId', funnelId);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const { url } = await response.json();
                onUpload(url);
                toast.success('Imagem de fundo atualizada!');
            } else {
                const error = await response.json();
                console.error('Upload failed:', error);
                toast.error('Erro ao fazer upload', {
                    description: error.details || 'Verifique as configurações do Cloudinary.'
                });
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Erro de conexão', {
                description: 'Não foi possível enviar a imagem.'
            });
        } finally {
            setIsUploading(false);
        }
    }, [onUpload, funnelId]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'] },
        maxFiles: 1,
        disabled: isUploading,
    });

    if (currentUrl) {
        return (
            <div className="space-y-3">
                <div className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50 aspect-video flex items-center justify-center">
                    <img
                        src={currentUrl}
                        alt="Background Preview"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onUpload('')}
                            className="h-8 w-8 p-0 rounded-full"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                <div {...getRootProps()} className="cursor-pointer">
                    <input {...getInputProps()} />
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2"
                        disabled={isUploading}
                    >
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                        Trocar Imagem
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <input {...getInputProps()} />
            {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    <span className="text-sm text-gray-500">Enviando...</span>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="w-10 h-10 text-gray-400" />
                    <p className="text-sm font-medium text-gray-700">
                        {isDragActive ? 'Solte a imagem aqui' : 'Arraste e solte o fundo'}
                    </p>
                    <p className="text-xs text-gray-400">ou clique para selecionar</p>
                </div>
            )}
        </div>
    );
}
