'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Crown, Zap } from 'lucide-react';

interface BillingSettingsProps {
    subscription: {
        status: string | null;
        plan: string | null;
        endsAt: Date | null;
    };
}

export function BillingSettings({ subscription }: BillingSettingsProps) {
    const plans = [
        {
            name: 'Starter',
            price: 'R$ 49',
            period: '/mês',
            features: [
                '5 funis ativos',
                '1.000 leads/mês',
                'Domínio customizado',
                'Suporte por email',
            ],
            current: subscription.plan === 'starter',
        },
        {
            name: 'Pro',
            price: 'R$ 99',
            period: '/mês',
            features: [
                '20 funis ativos',
                '10.000 leads/mês',
                'Domínio customizado',
                'Suporte prioritário',
                'Analytics avançado',
            ],
            current: subscription.plan === 'pro',
            popular: true,
        },
        {
            name: 'Enterprise',
            price: 'R$ 299',
            period: '/mês',
            features: [
                'Funis ilimitados',
                'Leads ilimitados',
                'Múltiplos domínios',
                'Suporte 24/7',
                'Analytics avançado',
                'White label',
            ],
            current: subscription.plan === 'enterprise',
        },
    ];

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Plano Atual</CardTitle>
                    <CardDescription>Gerencie sua assinatura</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold capitalize">{subscription.plan || 'Free'}</p>
                            <p className="text-sm text-gray-600">
                                Status: <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                                    {subscription.status || 'Inativo'}
                                </Badge>
                            </p>
                        </div>
                        {subscription.status === 'active' && (
                            <Button variant="outline">Gerenciar Assinatura</Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div>
                <h3 className="text-xl font-semibold mb-4">Planos Disponíveis</h3>
                <div className="grid md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <Card key={plan.name} className={`relative ${plan.popular ? 'border-blue-500 shadow-lg' : ''}`}>
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <Badge className="bg-blue-500">
                                        <Crown className="w-3 h-3 mr-1" />
                                        Popular
                                    </Badge>
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {plan.name}
                                    {plan.current && <Badge variant="secondary">Atual</Badge>}
                                </CardTitle>
                                <div className="mt-4">
                                    <span className="text-3xl font-bold">{plan.price}</span>
                                    <span className="text-gray-600">{plan.period}</span>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ul className="space-y-2">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                            <span className="text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button
                                    className="w-full"
                                    variant={plan.current ? 'outline' : 'default'}
                                    disabled={plan.current}
                                >
                                    {plan.current ? 'Plano Atual' : 'Fazer Upgrade'}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
