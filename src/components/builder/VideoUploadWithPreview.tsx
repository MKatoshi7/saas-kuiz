'use client';

import React, { useState, useEffect } from 'react';
import { UploadCloud, X, Loader2, Play, Video } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Script from 'next/script';

interface VideoUploadWithPreviewProps {
    value: string;
    onChange: (url: string) => void;
    onUploadComplete?: (data: { url: string; publicId: string }) => void;
    label?: string;
    placeholder?: string;
    helpText?: string;
    funnelId?: string;
}

declare global {
    interface Window {
        cloudinary: any;
    }
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
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleUploadClick = async () => {
        if (!isScriptLoaded) {
            toast.loading('Carregando componente de upload...');
            return;
        }

        setIsLoading(true);

        try {
            // Fetch config
            const configRes = await fetch('/api/cloudinary/config');
            const config = await configRes.json();

            if (!config.cloudName || !config.apiKey) {
                toast.error('Erro de configuração do Cloudinary');
                setIsLoading(false);
                return;
            }

            const widget = window.cloudinary.createUploadWidget(
                {
                    cloudName: config.cloudName,
                    apiKey: config.apiKey,
                    uploadSignature: async (callback: any, params: any) => {
                        const res = await fetch('/api/cloudinary/sign', {
                            method: 'POST',
                            body: JSON.stringify({ paramsToSign: params }),
                        });
                        const data = await res.json();
                        callback(data.signature);
                    },
                    resourceType: 'video',
                    folder: funnelId ? `kuiz-uploads/${funnelId}` : 'kuiz-uploads',
                    sources: ['local', 'url', 'google_drive', 'dropbox'],
                    multiple: false,
                    maxFiles: 1,
                    clientAllowedFormats: ['mp4', 'mov', 'webm', 'avi'],
                    maxFileSize: 500 * 1024 * 1024, // 500MB limit
                    language: 'pt',
                    styles: {
                        palette: {
                            window: "#FFFFFF",
                            windowBorder: "#90A0B3",
                            tabIcon: "#0078FF",
                            menuIcons: "#5A616A",
                            textDark: "#000000",
                            textLight: "#FFFFFF",
                            link: "#0078FF",
                            action: "#FF620C",
                            inactiveTabIcon: "#0E2F5A",
                            error: "#F44235",
                            inProgress: "#0078FF",
                            complete: "#20B832",
                            sourceBg: "#E4EBF1"
                        }
                    }
                },
                (error: any, result: any) => {
                    if (!error && result && result.event === "success") {
                        console.log('Upload success:', result.info);
                        onChange(result.info.secure_url);
                        if (onUploadComplete) {
                            onUploadComplete({
                                url: result.info.secure_url,
                                publicId: result.info.public_id
                            });
                        }
                        toast.success('Vídeo enviado com sucesso!');
                    } else if (error) {
                        console.error('Widget error:', error);
                    }
                }
            );

            widget.open();
        } catch (err) {
            console.error(err);
            toast.error('Erro ao abrir o uploader');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-2">
            <Script
                src="https://upload-widget.cloudinary.com/global/all.js"
                onLoad={() => setIsScriptLoaded(true)}
                strategy="lazyOnload"
            />

            {label && (
                <label className="text-xs font-medium text-gray-700 block">{label}</label>
            )}

            <div className="flex flex-col gap-3">
                {/* Upload Zone */}
                <div
                    onClick={handleUploadClick}
                    className={`
                        w-full h-32 border-2 border-dashed flex flex-col items-center justify-center cursor-pointer
                        rounded-lg transition-all group relative overflow-hidden
                        ${value ? 'border-solid border-gray-200 bg-gray-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}
                        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                >
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                            <span className="text-xs text-gray-500 font-medium">Carregando uploader...</span>
                        </div>
                    ) : value ? (
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <Video className="w-6 h-6 text-blue-600" />
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
                            <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
                            <div className="text-center">
                                <p className="text-xs font-medium text-gray-700 group-hover:text-blue-700">Clique para enviar vídeo</p>
                                <p className="text-[10px] text-gray-400">MP4, MOV ou WebM (Max 500MB)</p>
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
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange('');
                            }}
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
