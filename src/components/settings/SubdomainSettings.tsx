'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import { Loader2, Globe, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SubdomainSettingsProps {
    funnelId: string;
    currentSlug: string;
}

export function SubdomainSettings({ funnelId, currentSlug }: SubdomainSettingsProps) {
    const [slug, setSlug] = useState(currentSlug);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSaveSlug = async () => {
        if (!slug) return;

        // Basic validation
        const slugRegex = /^[a-z0-9-]+$/;
        if (!slugRegex.test(slug)) {
            toast.error('O subdomínio deve conter apenas letras minúsculas, números e hífens.');
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

            if (!res.ok) throw new Error(data.error || 'Erro ao salvar subdomínio');

            toast.success('Subdomínio atualizado com sucesso!');
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Subdomínio Kuiz</CardTitle>
                <CardDescription>Escolha um endereço web gratuito para o seu quiz.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-3">
                    <Label htmlFor="subdomain">Endereço do Quiz</Label>
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Input
                                id="subdomain"
                                placeholder="meu-quiz-incrivel"
                                className="font-mono text-sm pr-32"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none select-none bg-background pl-2">
                                .kuiz.digital
                            </div>
                        </div>
                        <Button
                            onClick={handleSaveSlug}
                            disabled={isLoading || slug === currentSlug}
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Salvar
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Este será o endereço principal do seu quiz se você não configurar um domínio personalizado.
                    </p>
                </div>

                {slug !== currentSlug && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <div className="text-sm text-amber-800">
                            <p className="font-semibold mb-1">Atenção:</p>
                            <p>Alterar o subdomínio fará com que o link antigo pare de funcionar imediatamente. Certifique-se de atualizar seus anúncios e links compartilhados.</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
