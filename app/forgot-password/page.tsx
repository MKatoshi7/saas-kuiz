'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Erro ao enviar email');
            }

            setIsSent(true);
            toast.success('Email de recuperação enviado!');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <Link
                    href="/login"
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para o login
                </Link>

                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Recuperar Senha</h1>
                    <p className="text-gray-500 text-sm">
                        Digite seu email para receber um link de redefinição de senha.
                    </p>
                </div>

                {isSent ? (
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Email Enviado!</h3>
                        <p className="text-sm text-gray-500">
                            Verifique sua caixa de entrada (e spam) para encontrar o link de recuperação.
                        </p>
                        <Button
                            variant="outline"
                            className="w-full mt-4"
                            onClick={() => setIsSent(false)}
                        >
                            Tentar outro email
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input
                                    type="email"
                                    placeholder="seu@email.com"
                                    className="pl-10"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                'Enviar Link de Recuperação'
                            )}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}
