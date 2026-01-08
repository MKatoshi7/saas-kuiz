'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from 'sonner';
import { Loader2, CheckCircle2, XCircle, Globe } from 'lucide-react';

interface CustomDomainSettingsProps {
    funnelId: string;
    initialDomain?: string | null;
    currentSlug: string;
}

export function CustomDomainSettings({ funnelId, initialDomain, currentSlug }: CustomDomainSettingsProps) {
    const [domain, setDomain] = useState(initialDomain || '');
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState<{ verified: boolean; message?: string } | null>(null);

    const handleSaveDomain = async () => {
        if (!domain) return;

        setIsLoading(true);
        try {
            const res = await fetch(`/api/funnels/${funnelId}/domain`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Erro ao salvar domínio');

            toast.success('Domínio salvo com sucesso!');
            setVerificationResult(null); // Reset verification on new save
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyDomain = async () => {
        setIsVerifying(true);
        try {
            const res = await fetch(`/api/funnels/${funnelId}/domain`);
            const data = await res.json();

            if (data.verified) {
                setVerificationResult({ verified: true });
                toast.success('Domínio verificado e ativo!');
            } else {
                const message = data.error || data.message || 'Registros DNS não encontrados ou incorretos.';
                setVerificationResult({ verified: false, message });
                toast.error(message);
            }
        } catch (error) {
            toast.error('Erro ao verificar domínio');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Domínio Personalizado</CardTitle>
                <CardDescription>Configure seu próprio domínio para este quiz.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Current Domain Display */}
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                            <Globe className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-blue-900">Domínio Atual</p>
                            <p className="text-sm text-blue-700 font-mono">quizk.com/f/{currentSlug}</p>
                        </div>
                    </div>
                </div>

                {/* Add Custom Domain */}
                <div className="space-y-3">
                    <Label htmlFor="custom_domain">Seu Domínio Personalizado</Label>
                    <div className="flex gap-2">
                        <Input
                            id="custom_domain"
                            placeholder="Ex: quiz.seudominio.com.br"
                            className="font-mono text-sm"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                        />
                        <Button
                            className="whitespace-nowrap"
                            onClick={handleSaveDomain}
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Adicionar Domínio
                        </Button>
                    </div>
                    <p className="text-xs text-slate-500">
                        Você pode usar um subdomínio (recomendado) ou seu domínio raiz.
                    </p>
                </div>

                {domain && (
                    <>
                        <Separator />

                        {/* DNS Configuration Instructions */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                                    <span className="text-xs font-bold text-purple-600">1</span>
                                </div>
                                <h4 className="font-semibold text-sm text-slate-900">Configure os registros DNS</h4>
                            </div>

                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
                                <p className="text-sm text-slate-700 font-medium">
                                    Adicione um registro CNAME no seu provedor de DNS:
                                </p>

                                <div className="bg-white border border-slate-200 rounded-md p-3">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-200">
                                                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Tipo</th>
                                                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Nome</th>
                                                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Valor</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="py-2 px-3">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-mono font-semibold">
                                                        CNAME
                                                    </span>
                                                </td>
                                                <td className="py-2 px-3 font-mono text-slate-700">
                                                    {domain.split('.').length > 2 ? domain.split('.')[0] : '@'}
                                                </td>
                                                <td className="py-2 px-3 font-mono text-slate-700">quizk.com</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex gap-3">
                                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <div className="text-xs text-amber-800">
                                        <p className="font-semibold mb-1">Importante:</p>
                                        <p>A propagação do DNS pode levar de 5 minutos a 48 horas. Aguarde a propagação completa antes de verificar.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Verification Step */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                                    <span className="text-xs font-bold text-purple-600">2</span>
                                </div>
                                <h4 className="font-semibold text-sm text-slate-900">Verifique a configuração</h4>
                            </div>

                            <Button
                                variant={verificationResult?.verified ? "default" : "outline"}
                                className={`w-full ${verificationResult?.verified ? 'bg-green-600 hover:bg-green-700' : ''}`}
                                onClick={handleVerifyDomain}
                                disabled={isVerifying || verificationResult?.verified}
                            >
                                {isVerifying ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : verificationResult?.verified ? (
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                ) : (
                                    <Globe className="w-4 h-4 mr-2" />
                                )}
                                {verificationResult?.verified ? 'Domínio Verificado' : 'Verificar Domínio Agora'}
                            </Button>

                            {verificationResult && !verificationResult.verified && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-sm text-red-700">
                                    <XCircle className="w-4 h-4 flex-shrink-0" />
                                    {verificationResult.message}
                                </div>
                            )}
                        </div>

                        {/* SSL Certificate Info */}
                        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                            <div className="flex gap-3">
                                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                                <div className="text-sm text-green-800">
                                    <p className="font-semibold mb-1">Certificado SSL Gratuito</p>
                                    <p>Após a verificação, um certificado SSL será automaticamente provisionado para seu domínio, garantindo conexão segura (HTTPS).</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
