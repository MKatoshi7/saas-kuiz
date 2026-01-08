'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Lock, Shield } from 'lucide-react';

export function SecuritySettings() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast.error('As senhas não coincidem');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/user/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to change password');
            }

            toast.success('Senha alterada com sucesso!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            toast.error(error.message || 'Erro ao alterar senha');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        <CardTitle>Alterar Senha</CardTitle>
                    </div>
                    <CardDescription>Mantenha sua conta segura com uma senha forte</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="current-password">Senha Atual</Label>
                        <Input
                            id="current-password"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Digite sua senha atual"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="new-password">Nova Senha</Label>
                        <Input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Digite sua nova senha"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirme sua nova senha"
                        />
                    </div>

                    <Button
                        onClick={handleChangePassword}
                        disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
                        className="w-full sm:w-auto"
                    >
                        <Lock className="w-4 h-4 mr-2" />
                        {isLoading ? 'Alterando...' : 'Alterar Senha'}
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Sessões Ativas</CardTitle>
                    <CardDescription>Gerencie os dispositivos conectados à sua conta</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium">Navegador Atual</p>
                                <p className="text-sm text-gray-600">Última atividade: Agora</p>
                            </div>
                            <Badge variant="secondary">Ativo</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
