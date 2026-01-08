'use client';

import React, { useState, useCallback } from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, Type, Layout, Image as ImageIcon, Box, BarChart2, ImageIcon as LogoIcon, UploadCloud, X, Loader2, Sparkles } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useDropzone } from 'react-dropzone';
import { BackgroundImageUpload } from './BackgroundImageUpload';
import { ColorPickerWithPalette } from './ColorPickerWithPalette';
import { SimpleColorPicker } from './SimpleColorPicker';

export function DesignSettingsPanel() {
    const { theme, updateTheme, currentFunnelId } = useBuilderStore();
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);

    const handleThemeUpdate = (section: 'page' | 'container', field: string, value: any) => {
        updateTheme({
            [section]: {
                ...theme[section],
                [field]: value
            }
        });
    };

    // Logo upload with drag-and-drop
    const onLogoDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        if (!currentFunnelId) {
            alert('Erro: ID do funil não encontrado.');
            return;
        }

        setIsUploadingLogo(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('funnelId', currentFunnelId);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                updateTheme({
                    logo: {
                        url: data.url,
                        publicId: data.publicId,
                        size: theme.logo?.size || 'md',
                        height: theme.logo?.height,
                        link: theme.logo?.link
                    }
                });
            } else {
                console.error('Upload failed');
                alert('Falha ao fazer upload da imagem. Tente novamente.');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Erro ao fazer upload. Verifique sua conexão.');
        } finally {
            setIsUploadingLogo(false);
        }
    }, [theme.logo, updateTheme, currentFunnelId]);

    const { getRootProps: getLogoRootProps, getInputProps: getLogoInputProps, isDragActive: isLogoDragActive } = useDropzone({
        onDrop: onLogoDrop,
        accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'] },
        maxFiles: 1,
        disabled: isUploadingLogo,
    });

    return (
        <div className="w-80 bg-white/80 backdrop-blur-xl border-r border-black/5 overflow-y-auto h-full flex flex-col z-20">
            <div className="p-4 border-b border-black/5 sticky top-0 bg-white/80 backdrop-blur-xl z-10">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Design & Aparência
                </h3>
                <p className="text-xs text-gray-400 mt-1">Personalize o visual do seu funil</p>
            </div>

            <div className="flex-1 p-4 space-y-6">

                <details className="group" open>
                    <summary className="flex items-center justify-between cursor-pointer list-none font-medium text-sm text-gray-900 pb-2 border-b border-gray-100">
                        <span className="flex items-center gap-2"><Type className="w-4 h-4 text-gray-500" /> Estilos Globais</span>
                        <span className="transition group-open:rotate-180">▼</span>
                    </summary>
                    <div className="pt-4 space-y-4">
                        <div>
                            <Label className="text-xs mb-1.5 block">Fonte Principal</Label>
                            <select
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                value={theme.fontFamily}
                                onChange={(e) => updateTheme({ fontFamily: e.target.value })}
                            >
                                <option value="Inter">Inter</option>
                                <option value="Roboto">Roboto</option>
                                <option value="Open Sans">Open Sans</option>
                                <option value="Lato">Lato</option>
                                <option value="Montserrat">Montserrat</option>
                                <option value="Oswald">Oswald</option>
                                <option value="Source Sans Pro">Source Sans Pro</option>
                                <option value="Slabo 27px">Slabo 27px</option>
                                <option value="Raleway">Raleway</option>
                                <option value="PT Sans">PT Sans</option>
                                <option value="Merriweather">Merriweather</option>
                                <option value="Roboto Condensed">Roboto Condensed</option>
                                <option value="Noto Sans">Noto Sans</option>
                                <option value="Ubuntu">Ubuntu</option>
                                <option value="Mukta">Mukta</option>
                                <option value="Playfair Display">Playfair Display</option>
                                <option value="Poppins">Poppins</option>
                                <option value="Nunito">Nunito</option>
                                <option value="Rubik">Rubik</option>
                                <option value="Lora">Lora</option>
                                <option value="Work Sans">Work Sans</option>
                            </select>
                        </div>

                        <ColorPickerWithPalette
                            label="Cor Primária (Botões)"
                            value={theme.primaryColor}
                            onChange={(color) => updateTheme({ primaryColor: color })}
                        />

                        <ColorPickerWithPalette
                            label="Cor do Texto"
                            value={theme.textColor || '#1f2937'}
                            onChange={(color) => updateTheme({ textColor: color })}
                        />
                    </div>
                </details>

                {/* 2. Background */}
                <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer list-none font-medium text-sm text-gray-900 pb-2 border-b border-gray-100">
                        <span className="flex items-center gap-2"><ImageIcon className="w-4 h-4 text-gray-500" /> Fundo da Página</span>
                        <span className="transition group-open:rotate-180">▼</span>
                    </summary>
                    <div className="pt-4 space-y-4">
                        <Tabs defaultValue={theme.page.type} onValueChange={(val) => handleThemeUpdate('page', 'type', val)}>
                            <TabsList className="w-full grid grid-cols-3">
                                <TabsTrigger value="color">Cor</TabsTrigger>
                                <TabsTrigger value="image">Imagem</TabsTrigger>
                                <TabsTrigger value="pattern">Padrão</TabsTrigger>
                            </TabsList>

                            <TabsContent value="color" className="pt-2">
                                <Label className="text-xs mb-1.5 block">Cor de Fundo</Label>
                                <SimpleColorPicker
                                    value={theme.page.type === 'color' ? theme.page.value : '#ffffff'}
                                    onChange={(color) => handleThemeUpdate('page', 'value', color)}
                                />
                            </TabsContent>

                            <TabsContent value="image" className="pt-2 space-y-3">
                                {/* Background Image Upload */}
                                <BackgroundImageUpload
                                    currentUrl={theme.page.type === 'image' ? theme.page.value : ''}
                                    onUpload={(url) => handleThemeUpdate('page', 'value', url)}
                                    onUploadComplete={(data) => {
                                        handleThemeUpdate('page', 'value', data.url);
                                        handleThemeUpdate('page', 'publicId', data.publicId);
                                    }}
                                    funnelId={currentFunnelId}
                                />

                                <div>
                                    <Label className="text-xs mb-1.5 block">URL da Imagem (Opcional)</Label>
                                    <Input
                                        value={theme.page.type === 'image' ? theme.page.value : ''}
                                        onChange={(e) => handleThemeUpdate('page', 'value', e.target.value)}
                                        placeholder="https://..."
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs mb-1.5 block flex justify-between">
                                        <span>Opacidade da Máscara (Overlay)</span>
                                        <span>{Math.round((theme.page.overlayOpacity || 0) * 100)}%</span>
                                    </Label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={theme.page.overlayOpacity || 0}
                                        onChange={(e) => handleThemeUpdate('page', 'overlayOpacity', parseFloat(e.target.value))}
                                        className="w-full"
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="pattern" className="pt-2 space-y-3">
                                <div>
                                    <Label className="text-xs mb-1.5 block">Tipo de Padrão</Label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                        value={theme.page.patternName || 'grid'}
                                        onChange={(e) => handleThemeUpdate('page', 'patternName', e.target.value)}
                                    >
                                        <option value="grid">Grade (Grid)</option>
                                        <option value="dots">Pontos (Dots)</option>
                                        <option value="diagonal">Linhas Diagonais</option>
                                        <option value="squares">Quadrados</option>
                                        <option value="cross">Cruzes</option>
                                        <option value="waves">Ondas</option>
                                        <option value="noise">Ruído (Noise)</option>
                                    </select>
                                </div>

                                <div>
                                    <Label className="text-xs mb-1.5 block">Cor do Padrão</Label>
                                    <SimpleColorPicker
                                        value={theme.page.patternColor || '#000000'}
                                        onChange={(color) => handleThemeUpdate('page', 'patternColor', color)}
                                    />
                                </div>

                                <div>
                                    <Label className="text-xs mb-1.5 block">Cor de Fundo (Base)</Label>
                                    <SimpleColorPicker
                                        value={theme.page.backgroundColor || '#ffffff'}
                                        onChange={(color) => handleThemeUpdate('page', 'backgroundColor', color)}
                                    />
                                </div>
                            </TabsContent>
                        </Tabs>

                        <div>
                            <Label className="text-xs mb-1.5 block">CSS Personalizado</Label>
                            <textarea
                                className="w-full p-2 text-xs font-mono border border-gray-300 rounded-md min-h-[80px]"
                                placeholder=".page-bg { ... }"
                                value={theme.page.customCss || ''}
                                onChange={(e) => handleThemeUpdate('page', 'customCss', e.target.value)}
                            />
                        </div>
                    </div>
                </details>

                {/* 3. Progress Bar Configuration */}
                <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer list-none font-medium text-sm text-gray-900 pb-2 border-b border-gray-100">
                        <span className="flex items-center gap-2"><BarChart2 className="w-4 h-4 text-gray-500" /> Barra de Progresso</span>
                        <span className="transition group-open:rotate-180">▼</span>
                    </summary>
                    <div className="pt-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs">Mostrar Barra de Progresso</Label>
                            <Checkbox
                                checked={theme.progressBar?.show ?? true}
                                onCheckedChange={(checked) => updateTheme({
                                    progressBar: {
                                        ...theme.progressBar,
                                        show: checked as boolean,
                                        color: theme.progressBar?.color || theme.primaryColor
                                    }
                                })}
                            />
                        </div>

                        <div>
                            <Label className="text-xs mb-1.5 block">Layout do Cabeçalho</Label>
                            <select
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                value={theme.headerLayout || 'default'}
                                onChange={(e) => updateTheme({ headerLayout: e.target.value as any })}
                            >
                                <option value="default">Padrão (Logo acima da Barra)</option>
                                <option value="stacked">Barra no Topo (Fixo) + Logo abaixo</option>
                            </select>
                            <p className="text-[10px] text-gray-400 mt-1">
                                No modo "Barra no Topo", a barra fica colada no topo da tela e o logo aparece logo abaixo.
                            </p>
                        </div>

                        {(theme.progressBar?.show ?? true) && (
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-xs mb-1.5 block">Cor da Barra</Label>
                                    <SimpleColorPicker
                                        value={theme.progressBar?.color || theme.primaryColor}
                                        onChange={(color) => updateTheme({
                                            progressBar: {
                                                ...theme.progressBar,
                                                show: theme.progressBar?.show ?? true,
                                                color: color
                                            }
                                        })}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs">Fixar no Topo</Label>
                                    <Checkbox
                                        checked={theme.progressBar?.isSticky || false}
                                        onCheckedChange={(checked) => updateTheme({
                                            progressBar: {
                                                ...theme.progressBar,
                                                show: theme.progressBar?.show ?? true,
                                                isSticky: checked as boolean
                                            }
                                        })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </details>

                {/* 4. Logo Configuration */}
                <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer list-none font-medium text-sm text-gray-900 pb-2 border-b border-gray-100">
                        <span className="flex items-center gap-2"><ImageIcon className="w-4 h-4 text-gray-500" /> Logotipo</span>
                        <span className="transition group-open:rotate-180">▼</span>
                    </summary>
                    <div className="pt-4 space-y-4">
                        {/* Drag & Drop Zone */}
                        {!theme.logo?.url ? (
                            <div
                                {...getLogoRootProps()}
                                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                                    ${isLogoDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                                    ${isUploadingLogo ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <input {...getLogoInputProps()} />
                                {isUploadingLogo ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                        <span className="text-sm text-gray-500">Enviando...</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <UploadCloud className="w-10 h-10 text-gray-400" />
                                        <p className="text-sm font-medium text-gray-700">
                                            {isLogoDragActive ? 'Solte a imagem aqui' : 'Arraste e solte seu logo'}
                                        </p>
                                        <p className="text-xs text-gray-400">ou clique para selecionar</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Logo Preview with Remove */}
                                <div className="relative">
                                    <Label className="text-xs mb-1.5 block">Logo Atual</Label>
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center relative group">
                                        <img
                                            src={theme.logo?.url}
                                            alt="Logo"
                                            style={{ height: `${theme.logo?.height || 40}px` }}
                                            className="max-w-full h-auto object-contain"
                                        />
                                        <button
                                            onClick={() => updateTheme({ logo: { url: '', size: 'md' } })}
                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                            title="Remover logo"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Height Slider */}
                                <div>
                                    <Label className="text-xs mb-1.5 block flex justify-between">
                                        <span>Altura do Logo</span>
                                        <span>{theme.logo?.height || 40}px</span>
                                    </Label>
                                    <input
                                        type="range"
                                        min="20"
                                        max="100"
                                        step="5"
                                        value={theme.logo?.height || 40}
                                        onChange={(e) => updateTheme({
                                            logo: {
                                                url: theme.logo?.url || 'https://via.placeholder.com/150',
                                                size: theme.logo?.size || 'md',
                                                height: parseInt(e.target.value),
                                                link: theme.logo?.link,
                                                isSticky: theme.logo?.isSticky
                                            }
                                        })}
                                        className="w-full"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label className="text-xs">Fixar no Topo</Label>
                                    <Checkbox
                                        checked={theme.logo?.isSticky || false}
                                        onCheckedChange={(checked) => updateTheme({
                                            logo: {
                                                url: theme.logo?.url || '',
                                                size: theme.logo?.size || 'md',
                                                height: theme.logo?.height,
                                                link: theme.logo?.link,
                                                isSticky: checked as boolean
                                            }
                                        })}
                                    />
                                </div>

                                {/* Change Logo Button */}
                                <div {...getLogoRootProps()} className="cursor-pointer">
                                    <input {...getLogoInputProps()} />
                                    <button
                                        type="button"
                                        disabled={isUploadingLogo}
                                        className="w-full py-2 px-4 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {isUploadingLogo ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <UploadCloud className="w-4 h-4" />
                                        )}
                                        Trocar Logo
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Manual URL Input (collapsed) */}
                        <details className="text-xs">
                            <summary className="text-gray-400 cursor-pointer hover:text-gray-600">Ou use uma URL</summary>
                            <div className="mt-2">
                                <Input
                                    value={theme.logo?.url || ''}
                                    onChange={(e) => updateTheme({
                                        logo: {
                                            url: e.target.value,
                                            size: theme.logo?.size || 'md',
                                            height: theme.logo?.height,
                                            link: theme.logo?.link,
                                            isSticky: theme.logo?.isSticky
                                        }
                                    })}
                                    placeholder="https://..."
                                    className="text-xs"
                                />
                            </div>
                        </details>

                        <p className="text-[10px] text-gray-400 mt-1">O logo aparecerá acima da barra de progresso</p>
                    </div>
                </details>

                {/* 5. Quiz Container */}
                <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer list-none font-medium text-sm text-gray-900 pb-2 border-b border-gray-100">
                        <span className="flex items-center gap-2"><Box className="w-4 h-4 text-gray-500" /> Caixa do Quiz</span>
                        <span className="transition group-open:rotate-180">▼</span>
                    </summary>
                    <div className="pt-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs">Mostrar Box do Conteúdo</Label>
                            <Checkbox
                                checked={theme.container.show ?? true}
                                onCheckedChange={(checked) => handleThemeUpdate('container', 'show', checked as boolean)}
                            />
                        </div>

                        <div>
                            <Label className="text-xs mb-1.5 block">Cor de Fundo</Label>
                            <SimpleColorPicker
                                value={theme.container.backgroundColor}
                                onChange={(color) => handleThemeUpdate('container', 'backgroundColor', color)}
                            />
                        </div>

                        <div>
                            <Label className="text-xs mb-1.5 block flex justify-between">
                                <span>Opacidade do Fundo</span>
                                <span>{Math.round((theme.container.opacity || 1) * 100)}%</span>
                            </Label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={theme.container.opacity ?? 1}
                                onChange={(e) => handleThemeUpdate('container', 'opacity', parseFloat(e.target.value))}
                                className="w-full"
                            />
                        </div>

                        <div>
                            <Label className="text-xs mb-1.5 block flex justify-between">
                                <span>Desfoque (Glassmorphism)</span>
                                <span>{theme.container.blur || 0}px</span>
                            </Label>
                            <input
                                type="range"
                                min="0"
                                max="20"
                                step="1"
                                value={theme.container.blur || 0}
                                onChange={(e) => handleThemeUpdate('container', 'blur', parseInt(e.target.value))}
                                className="w-full"
                            />
                        </div>

                        <div>
                            <Label className="text-xs mb-1.5 block">Arredondamento (Border Radius)</Label>
                            <select
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                value={theme.container.borderRadius}
                                onChange={(e) => handleThemeUpdate('container', 'borderRadius', e.target.value)}
                            >
                                <option value="0px">Quadrado (0px)</option>
                                <option value="8px">Pequeno (8px)</option>
                                <option value="16px">Médio (16px)</option>
                                <option value="24px">Grande (24px)</option>
                                <option value="9999px">Redondo (Full)</option>
                            </select>
                        </div>

                        <div>
                            <Label className="text-xs mb-1.5 block">Sombra</Label>
                            <select
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                value={theme.container.shadow}
                                onChange={(e) => handleThemeUpdate('container', 'shadow', e.target.value)}
                            >
                                <option value="none">Nenhuma</option>
                                <option value="sm">Suave</option>
                                <option value="md">Média</option>
                                <option value="lg">Forte</option>
                                <option value="xl">Muito Forte</option>
                                <option value="neon-green">Neon Verde</option>
                                <option value="neon-blue">Neon Azul</option>
                                <option value="neon-purple">Neon Roxo</option>
                            </select>
                        </div>

                        <div className="pt-4 border-t border-gray-100 space-y-4">
                            <Label className="text-xs font-bold text-gray-900 uppercase tracking-wider">Bordas e Efeitos</Label>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label className="text-xs mb-1.5 block">Espessura da Borda</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            min="0"
                                            max="10"
                                            value={theme.container.borderWidth || 0}
                                            onChange={(e) => handleThemeUpdate('container', 'borderWidth', parseInt(e.target.value))}
                                            className="h-9"
                                        />
                                        <span className="text-xs text-gray-500">px</span>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-xs mb-1.5 block">Estilo da Borda</Label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-9"
                                        value={theme.container.borderStyle || 'solid'}
                                        onChange={(e) => handleThemeUpdate('container', 'borderStyle', e.target.value)}
                                    >
                                        <option value="solid">Sólida</option>
                                        <option value="dashed">Tracejada</option>
                                        <option value="dotted">Pontilhada</option>
                                        <option value="double">Dupla</option>
                                        <option value="glow">Brilhante</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <Label className="text-xs mb-1.5 block">Cor da Borda</Label>
                                <SimpleColorPicker
                                    value={theme.container.borderColor || '#e5e7eb'}
                                    onChange={(color) => handleThemeUpdate('container', 'borderColor', color)}
                                />
                            </div>

                            <div>
                                <Label className="text-xs mb-1.5 block">Efeito Vidro (Backdrop Blur)</Label>
                                <select
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    value={theme.container.backdropFilter || 'none'}
                                    onChange={(e) => handleThemeUpdate('container', 'backdropFilter', e.target.value)}
                                >
                                    <option value="none">Nenhum</option>
                                    <option value="blur-sm">Leve (Sm)</option>
                                    <option value="blur-md">Médio (Md)</option>
                                    <option value="blur-lg">Forte (Lg)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </details>
            </div >
        </div >
    );
}
