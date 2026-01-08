'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
    User,
    Mail,
    Lock,
    CreditCard,
    Calendar,
    Crown,
    ArrowLeft,
    Loader2,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { PlanSelectionDialog } from '@/components/account/PlanSelectionDialog';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

interface UserData {
    id: string;
    email: string;
    name: string | null;
    subscriptionStatus: string | null;
    subscriptionPlan: string | null;
    subscriptionEndsAt: string | null;
}

export default function AccountPage() {
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    // Profile form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [profileLoading, setProfileLoading] = useState(false);

    // Password form state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Plan dialog state
    const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);

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
            toast.error('Erro ao carregar dados do usuário');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileLoading(true);

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Erro ao atualizar perfil');
            }

            setUser({ ...user!, ...data.user });
            toast.success('Perfil atualizado com sucesso!');
        } catch (error: any) {
            toast.error(error.message || 'Erro ao atualizar perfil');
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('As senhas não coincidem');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('A nova senha deve ter pelo menos 6 caracteres');
            return;
        }

        setPasswordLoading(true);

        try {
            const res = await fetch('/api/user/password', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Erro ao atualizar senha');
            }

            toast.success('Senha atualizada com sucesso!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            toast.error(error.message || 'Erro ao atualizar senha');
        } finally {
            setPasswordLoading(false);
        }
    };

    const getDaysRemaining = () => {
        if (!user?.subscriptionEndsAt) return null;

        const endDate = new Date(user.subscriptionEndsAt);
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    };

    const getSubscriptionStatusBadge = () => {
        const status = user?.subscriptionStatus || 'free';

        const badges = {
            free: { label: 'Gratuito', color: 'bg-slate-100 text-slate-700' },
            active: { label: 'Ativo', color: 'bg-green-100 text-green-700' },
            canceled: { label: 'Cancelado', color: 'bg-yellow-100 text-yellow-700' },
            expired: { label: 'Expirado', color: 'bg-red-100 text-red-700' },
        };

        const badge = badges[status as keyof typeof badges] || badges.free;

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
                {badge.label}
            </span>
        );
    };

    const getPlanName = () => {
        const plan = user?.subscriptionPlan;
        const plans = {
            starter: 'Starter',
            pro: 'Pro',
            enterprise: 'Enterprise',
        };
        return plan ? plans[plan as keyof typeof plans] || 'Gratuito' : 'Gratuito';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const daysRemaining = getDaysRemaining();

    return (
        <>
            <DashboardHeader />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar ao Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900">Minha Conta</h1>
                    <p className="text-slate-600 mt-2">Gerencie suas informações pessoais e assinatura</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Profile Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Informações do Perfil
                            </CardTitle>
                            <CardDescription>
                                Atualize seu nome e email
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleProfileUpdate} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome</Label>
                                    <Input
                                        id="name"
                                        type="text"
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
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={profileLoading}
                                >
                                    {profileLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            Salvar Alterações
                                        </>
                                    )}
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
                            <CardDescription>
                                Atualize sua senha de acesso
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Senha Atual</Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">Nova Senha</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
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
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={passwordLoading}
                                >
                                    {passwordLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Atualizando...
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-4 h-4 mr-2" />
                                            Atualizar Senha
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Subscription Information */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Crown className="w-5 h-5 text-yellow-600" />
                            Assinatura
                        </CardTitle>
                        <CardDescription>
                            Gerencie seu plano e assinatura
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Current Plan */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                        <CreditCard className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600">Plano Atual</p>
                                        <p className="text-lg font-semibold text-slate-900">{getPlanName()}</p>
                                    </div>
                                </div>
                                {getSubscriptionStatusBadge()}
                            </div>

                            {/* Days Remaining */}
                            {daysRemaining !== null && user?.subscriptionStatus === 'active' && (
                                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-blue-900">
                                            {daysRemaining > 0
                                                ? `${daysRemaining} ${daysRemaining === 1 ? 'dia restante' : 'dias restantes'}`
                                                : 'Sua assinatura expira hoje'
                                            }
                                        </p>
                                        <p className="text-xs text-blue-700">
                                            Expira em {new Date(user.subscriptionEndsAt!).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Expired/Canceled Warning */}
                            {(user?.subscriptionStatus === 'expired' || user?.subscriptionStatus === 'canceled') && (
                                <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-yellow-900">
                                            {user.subscriptionStatus === 'expired'
                                                ? 'Sua assinatura expirou'
                                                : 'Sua assinatura foi cancelada'
                                            }
                                        </p>
                                        <p className="text-xs text-yellow-700">
                                            Renove agora para continuar aproveitando todos os recursos
                                        </p>
                                    </div>
                                </div>
                            )}

                            <Separator />

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    variant="default"
                                    className="flex-1"
                                    onClick={() => {
                                        setIsPlanDialogOpen(true);
                                    }}
                                >
                                    <Crown className="w-4 h-4 mr-2" />
                                    {user?.subscriptionStatus === 'active' ? 'Renovar Assinatura' : 'Assinar Agora'}
                                </Button>
                                {user?.subscriptionStatus === 'active' && (
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => {
                                            setIsPlanDialogOpen(true);
                                        }}
                                    >
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        Mudar de Plano
                                    </Button>
                                )}
                            </div>

                            {/* Free Plan Info */}
                            {(!user?.subscriptionStatus || user?.subscriptionStatus === 'free') && (
                                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                                    <h4 className="font-semibold text-slate-900 mb-2">Desbloqueie Recursos Premium</h4>
                                    <ul className="space-y-1 text-sm text-slate-700 mb-4">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            Quizzes ilimitados
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            Domínio personalizado
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            Analytics avançado
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            Suporte prioritário
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <PlanSelectionDialog
                    open={isPlanDialogOpen}
                    onOpenChange={setIsPlanDialogOpen}
                    currentPlan={user?.subscriptionPlan}
                    onPlanChange={fetchUser}
                />
            </div>
        </>
    );
}
