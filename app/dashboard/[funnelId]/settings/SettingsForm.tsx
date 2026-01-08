'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploadWithPreview } from "@/components/builder/ImageUploadWithPreview";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

interface SettingsFormProps {
    funnel: any;
}

export function SettingsForm({ funnel }: SettingsFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: funnel.title || '',
        themeConfig: funnel.themeConfig || {},
        marketingConfig: funnel.marketingConfig || {},
        theme: funnel.theme || { bgColor: '#ffffff', primaryColor: '#2563EB' }
    });

    const handleUpdate = (section: string, data: any) => {
        setFormData(prev => ({
            ...prev,
            [section]: { ...prev[section as keyof typeof prev], ...data }
        }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/funnels/${funnel.id}/settings`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to update settings');

            toast.success('Configurações salvas com sucesso!');
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar configurações');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Site Identity */}
            <Card>
                <CardHeader>
                    <CardTitle>Identidade do Site</CardTitle>
                    <CardDescription>Configure o título e elementos visuais do seu quiz.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="site_title">Título do Site</Label>
                        <Input
                            id="site_title"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Digite o título do seu quiz"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Logo</Label>
                        <ImageUploadWithPreview
                            value={formData.themeConfig?.logo || ''}
                            onChange={(url) => handleUpdate('themeConfig', { logo: url })}
                            label="Upload do Logo"
                            helpText="Recomendado: 180x42px - PNG ou SVG Transparente"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Favicon</Label>
                        <ImageUploadWithPreview
                            value={formData.themeConfig?.favicon || ''}
                            onChange={(url) => handleUpdate('themeConfig', { favicon: url })}
                            label="Upload do Favicon"
                            helpText="Recomendado: 32x32px - Formato ICO, PNG ou SVG"
                            previewSize="sm"
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="powered_by"
                                    checked={formData.themeConfig?.showPoweredBy !== false}
                                    onChange={(e) => handleUpdate('themeConfig', { showPoweredBy: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <Label htmlFor="powered_by" className="text-sm font-medium cursor-pointer">
                                    Feito pelo DeskRumor
                                </Label>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t bg-slate-50/50 px-6 py-4">
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                </CardFooter>
            </Card>

            {/* Colors and Appearance */}
            <Card>
                <CardHeader>
                    <CardTitle>Cores e Aparência</CardTitle>
                    <CardDescription>Personalize as cores do seu quiz.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-3">
                        <Label htmlFor="progress_color">Cor da Barra de Progresso</Label>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Input
                                    type="color"
                                    id="progress_color"
                                    value={formData.theme?.primaryColor || '#2563eb'}
                                    onChange={(e) => handleUpdate('theme', { primaryColor: e.target.value })}
                                    className="w-16 h-10 border-2 border-gray-300 rounded cursor-pointer p-1"
                                />
                            </div>
                            <Input
                                type="text"
                                value={formData.theme?.primaryColor || '#2563eb'}
                                onChange={(e) => handleUpdate('theme', { primaryColor: e.target.value })}
                                className="flex-1 font-mono text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label>Pré-visualização da Barra de Progresso</Label>
                        <div className="border border-slate-200 rounded-lg p-4 bg-white">
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-300"
                                    style={{
                                        width: '65%',
                                        backgroundColor: formData.theme?.primaryColor || '#2563eb'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-3">
                        <Label htmlFor="bg_color">Cor de fundo do quiz</Label>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Input
                                    type="color"
                                    id="bg_color"
                                    value={formData.theme?.bgColor || '#ffffff'}
                                    onChange={(e) => handleUpdate('theme', { bgColor: e.target.value })}
                                    className="w-16 h-10 border-2 border-gray-300 rounded cursor-pointer p-1"
                                />
                            </div>
                            <Input
                                type="text"
                                value={formData.theme?.bgColor || '#ffffff'}
                                onChange={(e) => handleUpdate('theme', { bgColor: e.target.value })}
                                className="flex-1 font-mono text-sm"
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t bg-slate-50/50 px-6 py-4">
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                </CardFooter>
            </Card>

            {/* Tracking & Pixels */}
            <Card>
                <CardHeader>
                    <CardTitle>Rastreamento (Pixels)</CardTitle>
                    <CardDescription>Adicione scripts de rastreamento como Facebook Pixel e Google Analytics.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="fb_pixel">Facebook Pixel ID</Label>
                        <Input
                            id="fb_pixel"
                            placeholder="Ex: 1234567890"
                            value={formData.marketingConfig?.fbPixelId || ''}
                            onChange={(e) => handleUpdate('marketingConfig', { fbPixelId: e.target.value })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="gtm">Google Tag Manager (GTM)</Label>
                        <Input
                            id="gtm"
                            placeholder="Ex: GTM-XXXXXX"
                            value={formData.marketingConfig?.gtmId || ''}
                            onChange={(e) => handleUpdate('marketingConfig', { gtmId: e.target.value })}
                        />
                    </div>
                </CardContent>
                <CardFooter className="border-t bg-slate-50/50 px-6 py-4">
                    <Button variant="outline" onClick={handleSave} disabled={isLoading}>
                        {isLoading ? 'Salvando...' : 'Salvar Rastreamento'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
