'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
                        <Label htmlFor="fb_token">Facebook Access Token (API de Conversões)</Label>
                        <Input
                            id="fb_token"
                            type="password"
                            placeholder="Ex: EAAB..."
                            value={formData.marketingConfig?.fbAccessToken || ''}
                            onChange={(e) => handleUpdate('marketingConfig', { fbAccessToken: e.target.value })}
                        />
                        <p className="text-xs text-gray-500">
                            Necessário para enviar eventos via servidor (CAPI) para maior precisão.
                        </p>
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
