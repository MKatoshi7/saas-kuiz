'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import { Loader2, Globe, AlertTriangle, Copy, Check, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SubdomainSettingsProps {
    funnelId: string;
    currentSlug: string;
}

export function SubdomainSettings({ funnelId, currentSlug }: SubdomainSettingsProps) {
    const [slug, setSlug] = useState(currentSlug);
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const router = useRouter();

    const fullUrl = `https://kuiz.digital/${slug}`;

    const handleSaveSlug = async () => {
        if (!slug) return;

        // Basic validation
        const slugRegex = /^[a-z0-9-]+$/;
        if (!slugRegex.test(slug)) {
            toast.error('O slug deve conter apenas letras minúsculas, números e hífens.');
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`/api/funnels/${funnelId}/settings`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Erro ao salvar slug');

            toast.success('Slug atualizado com sucesso!', {
                description: `Seu quiz agora está em: kuiz.digital/${slug}`
            });
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(fullUrl);
            setCopied(true);
            toast.success('Link copiado!');
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error('Erro ao copiar link');
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Link do Quiz
                </CardTitle>
                <CardDescription>Configure o endereço personalizado do seu quiz</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Preview do Link Atual */}
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-blue-900 mb-1">Seu quiz está disponível em:</p>
                            <a
                                href={fullUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-mono text-blue-700 hover:text-blue-900 underline break-all flex items-center gap-1"
                            >
                                {fullUrl}
                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            </a>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopy}
                            className="flex-shrink-0"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Copiado
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copiar
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Campo de Edição */}
                <div className="space-y-3">
                    <Label htmlFor="subdomain">Personalizar Slug</Label>
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none select-none">
                                kuiz.digital/
                            </div>
                            <Input
                                id="subdomain"
                                placeholder="meu-quiz"
                                className="font-mono text-sm pl-28"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                            />
                        </div>
                        <Button
                            onClick={handleSaveSlug}
                            disabled={isLoading || slug === currentSlug || !slug}
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Salvar
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Use apenas letras minúsculas, números e hífens (ex: meu-quiz-incrivel)
                    </p>
                </div>

                {slug !== currentSlug && slug && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <div className="text-sm text-amber-800">
                            <p className="font-semibold mb-1">Atenção:</p>
                            <p className="mb-2">O novo link será: <span className="font-mono font-bold">kuiz.digital/{slug}</span></p>
                            <p>Alterar o slug fará com que o link antigo pare de funcionar imediatamente. Certifique-se de atualizar seus anúncios e links compartilhados.</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
