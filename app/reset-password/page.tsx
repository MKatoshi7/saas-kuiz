'use client';

import { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!token) {
        return (
            <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Link Inválido</h2>
                <p className="text-gray-500 mb-6">
                    O link de recuperação de senha é inválido ou expirou.
                </p>
                <Button onClick={() => router.push('/forgot-password')} variant="outline">
                    Solicitar novo link
                </Button>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('As senhas não coincidem');
            return;
        }

        if (password.length < 6) {
            toast.error('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Erro ao redefinir senha');
            }

            setIsSuccess(true);
            toast.success('Senha redefinida com sucesso!');

            // Redirect after 3 seconds
            setTimeout(() => {
                router.push('/login');
            }, 3000);

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Senha Alterada!</h2>
                <p className="text-gray-500 mb-6">
                    Sua senha foi atualizada com sucesso. Você será redirecionado para o login em instantes.
                </p>
                <Button onClick={() => router.push('/login')} className="w-full">
                    Ir para Login
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Nova Senha</h1>
                <p className="text-gray-500 text-sm">
                    Digite sua nova senha abaixo.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                            type="password"
                            placeholder="Nova senha"
                            className="pl-10"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                            type="password"
                            placeholder="Confirmar nova senha"
                            className="pl-10"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                            Salvando...
                        </>
                    ) : (
                        'Redefinir Senha'
                    )}
                </Button>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-indigo-600" />}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}
