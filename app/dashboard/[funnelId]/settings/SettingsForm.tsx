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
        slug: funnel.slug || '',
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

            {/* Subdomínio */}
            <Card>
                <CardHeader>
                    <CardTitle>Subdomínio Personalizado</CardTitle>
                    <CardDescription>Configure o endereço único do seu quiz.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="slug">Subdomínio</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="slug"
                                value={formData.slug || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                                placeholder="meu-quiz"
                                className="flex-1 font-mono"
                            />
                            <span className="text-sm text-gray-500 whitespace-nowrap">.kuiz.digital</span>
                        </div>
                        <p className="text-xs text-gray-500">
                            Apenas letras minúsculas, números e hífens. Seu quiz ficará disponível em:
                        </p>
                        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <span className="text-xs font-mono text-blue-700">
                                https://{formData.slug || 'seu-quiz'}.kuiz.digital
                            </span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t bg-slate-50/50 px-6 py-4">
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? 'Salvando...' : 'Salvar Subdomínio'}
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

                    <div className="grid gap-2 pt-4 border-t border-gray-100">
                        <Label htmlFor="custom_head">Scripts Personalizados (Head)</Label>
                        <textarea
                            id="custom_head"
                            className="w-full min-h-[120px] p-3 rounded-md border border-gray-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="<!-- Cole aqui scripts como UTMify, Hotjar, etc -->&#10;<script>...</script>"
                            value={formData.marketingConfig?.customHeadScript || ''}
                            onChange={(e) => handleUpdate('marketingConfig', { customHeadScript: e.target.value })}
                        />
                        <p className="text-xs text-gray-500">
                            Estes scripts serão injetados logo após a tag &lt;head&gt;. Ideal para UTMify, Hotjar, etc.
                        </p>
                    </div>

                    <div className="grid gap-2 pt-4 border-t border-gray-100">
                        <Label>Parâmetros UTM Padrão (Opcional)</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="utm_source" className="text-xs text-gray-500 mb-1 block">utm_source</Label>
                                <Input
                                    id="utm_source"
                                    placeholder="ex: facebook"
                                    value={formData.marketingConfig?.defaultUtmSource || ''}
                                    onChange={(e) => handleUpdate('marketingConfig', { defaultUtmSource: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="utm_medium" className="text-xs text-gray-500 mb-1 block">utm_medium</Label>
                                <Input
                                    id="utm_medium"
                                    placeholder="ex: cpc"
                                    value={formData.marketingConfig?.defaultUtmMedium || ''}
                                    onChange={(e) => handleUpdate('marketingConfig', { defaultUtmMedium: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="utm_campaign" className="text-xs text-gray-500 mb-1 block">utm_campaign</Label>
                                <Input
                                    id="utm_campaign"
                                    placeholder="ex: promocao_verao"
                                    value={formData.marketingConfig?.defaultUtmCampaign || ''}
                                    onChange={(e) => handleUpdate('marketingConfig', { defaultUtmCampaign: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="utm_content" className="text-xs text-gray-500 mb-1 block">utm_content</Label>
                                <Input
                                    id="utm_content"
                                    placeholder="ex: ad_video_01"
                                    value={formData.marketingConfig?.defaultUtmContent || ''}
                                    onChange={(e) => handleUpdate('marketingConfig', { defaultUtmContent: e.target.value })}
                                />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Estes valores serão usados se a URL não contiver parâmetros UTM.
                        </p>
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
