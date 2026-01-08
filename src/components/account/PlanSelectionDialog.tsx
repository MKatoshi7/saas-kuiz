'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Plan {
    id: string;
    name: string;
    price: string;
    features: string[];
    recommended?: boolean;
}

const PLANS: Plan[] = [
    {
        id: 'starter',
        name: 'Starter',
        price: 'R$ 29/mês',
        features: ['Até 10 Funis', '1.000 Leads/mês', 'Domínio Personalizado', 'Remoção de Branding']
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 'R$ 79/mês',
        features: ['Até 50 Funis', '10.000 Leads/mês', 'Analytics Avançado', 'Suporte Prioritário'],
        recommended: true
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 'R$ 199/mês',
        features: ['Funis Ilimitados', 'Leads Ilimitados', 'Gerente de Conta', 'SLA de 99.9%']
    }
];

interface PlanSelectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentPlan?: string | null;
    onPlanChange: () => void;
}

export function PlanSelectionDialog({ open, onOpenChange, currentPlan, onPlanChange }: PlanSelectionDialogProps) {
    const [loading, setLoading] = useState<string | null>(null);

    const handleSelectPlan = async (planId: string) => {
        setLoading(planId);
        try {
            const res = await fetch('/api/user/subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Falha ao atualizar plano');

            if (data.url) {
                // Redirect to checkout (Mock or Real)
                window.location.href = data.url;
            } else {
                toast.success('Plano atualizado com sucesso!');
                onPlanChange();
                onOpenChange(false);
            }
        } catch (error: any) {
            toast.error(error.message || 'Erro ao atualizar plano. Tente novamente.');
        } finally {
            setLoading(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Escolha seu Plano</DialogTitle>
                    <DialogDescription>
                        Selecione o plano ideal para o seu negócio
                    </DialogDescription>
                </DialogHeader>

                <div className="grid md:grid-cols-3 gap-4 py-4">
                    {PLANS.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative rounded-xl border p-6 flex flex-col ${plan.recommended
                                ? 'border-blue-600 bg-blue-50/50 shadow-lg scale-105 z-10'
                                : 'border-slate-200 bg-white hover:border-blue-300 transition-colors'
                                } ${currentPlan === plan.id ? 'ring-2 ring-blue-600 ring-offset-2' : ''}`}
                        >
                            {plan.recommended && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                    Recomendado
                                </div>
                            )}

                            <div className="mb-4">
                                <h3 className="font-bold text-lg text-slate-900">{plan.name}</h3>
                                <div className="text-2xl font-bold text-slate-900 mt-2">{plan.price}</div>
                            </div>

                            <ul className="space-y-3 mb-6 flex-1">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Button
                                className={`w-full ${plan.recommended ? 'bg-blue-600 hover:bg-blue-700' : ''
                                    }`}
                                variant={plan.recommended ? 'default' : 'outline'}
                                disabled={loading !== null || currentPlan === plan.id}
                                onClick={() => handleSelectPlan(plan.id)}
                            >
                                {loading === plan.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : currentPlan === plan.id ? (
                                    'Plano Atual'
                                ) : (
                                    'Selecionar'
                                )}
                            </Button>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
