'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Lock, CreditCard, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface UserData {
    id: string;
    email: string;
    name: string | null;
    subscriptionStatus: string | null;
    subscriptionPlan: string | null;
    subscriptionEndsAt: string | null;
}

export default function AccountSettingsPage() {
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();
            if (data.user) {
                setUser(data.user);
                setName(data.user.name || '');
                setEmail(data.user.email);
            } else {
                router.push('/login');
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email }),
            });

            if (!res.ok) throw new Error('Erro ao atualizar perfil');

            toast.success('Perfil atualizado com sucesso!');
            fetchUser();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('As senhas não coincidem');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        setSaving(true);

        try {
            const res = await fetch('/api/user/password', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Erro ao atualizar senha');
            }

            toast.success('Senha atualizada com sucesso!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const getSubscriptionStatusBadge = () => {
        const status = user?.subscriptionStatus || 'free';

        const badges = {
            free: { text: 'Plano Gratuito', color: 'bg-gray-100 text-gray-700', icon: User },
            active: { text: 'Assinatura Ativa', color: 'bg-green-100 text-green-700', icon: CheckCircle },
            canceled: { text: 'Cancelada', color: 'bg-yellow-100 text-yellow-700', icon: XCircle },
            expired: { text: 'Expirada', color: 'bg-red-100 text-red-700', icon: XCircle },
        };

        const badge = badges[status as keyof typeof badges] || badges.free;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
                <Icon className="w-4 h-4" />
                {badge.text}
            </span>
        );
    };

    const getDaysRemaining = () => {
        if (!user?.subscriptionEndsAt) return null;

        const endDate = new Date(user.subscriptionEndsAt);
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays > 0 ? diffDays : 0;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Carregando...</p>
                </div>
            </div>
        );
    }

    const daysRemaining = getDaysRemaining();

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Configurações da Conta</h1>
                <p className="text-gray-600 mt-1">Gerencie suas informações pessoais e assinatura</p>
            </div>

            {/* Subscription Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                Assinatura
                            </CardTitle>
                            <CardDescription>Gerencie seu plano e assinatura</CardDescription>
                        </div>
                        {getSubscriptionStatusBadge()}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {user?.subscriptionStatus === 'active' && user?.subscriptionPlan && (
                        <>
                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                <div>
                                    <p className="font-semibold text-blue-900">
                                        Plano {user.subscriptionPlan.charAt(0).toUpperCase() + user.subscriptionPlan.slice(1)}
                                    </p>
                                    {daysRemaining !== null && (
                                        <p className="text-sm text-blue-700 flex items-center gap-2 mt-1">
                                            <Calendar className="w-4 h-4" />
                                            {daysRemaining > 0
                                                ? `${daysRemaining} dias restantes`
                                                : 'Expira hoje'}
                                        </p>
                                    )}
                                </div>
                                <Button variant="outline" className="bg-white">
                                    Renovar Assinatura
                                </Button>
                            </div>
                            {user.subscriptionEndsAt && (
                                <p className="text-sm text-gray-600">
                                    Renovação automática em: {new Date(user.subscriptionEndsAt).toLocaleDateString('pt-BR')}
                                </p>
                            )}
                        </>
                    )}

                    {user?.subscriptionStatus === 'free' && (
                        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                            <h3 className="font-semibold text-gray-900 mb-2">Upgrade para Premium</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Desbloqueie recursos ilimitados e leve seus quizzes para o próximo nível!
                            </p>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                Ver Planos
                            </Button>
                        </div>
                    )}

                    {(user?.subscriptionStatus === 'canceled' || user?.subscriptionStatus === 'expired') && (
                        <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
                            <h3 className="font-semibold text-gray-900 mb-2">Sua assinatura expirou</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Renove agora para continuar aproveitando todos os recursos premium.
                            </p>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                Renovar Agora
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Profile Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Informações do Perfil
                    </CardTitle>
                    <CardDescription>Atualize suas informações pessoais</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Seu nome completo"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                            />
                        </div>

                        <Button type="submit" disabled={saving}>
                            {saving ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        Alterar Senha
                    </CardTitle>
                    <CardDescription>Mantenha sua conta segura</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Senha Atual</Label>
                            <Input
                                id="currentPassword"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <Label htmlFor="newPassword">Nova Senha</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>

                        <Button type="submit" disabled={saving}>
                            {saving ? 'Atualizando...' : 'Atualizar Senha'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
