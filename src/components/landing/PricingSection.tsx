'use client'

import * as React from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";

type BillingCycle = 'monthly' | 'annually';

interface Feature {
    name: string;
    isIncluded: boolean;
    tooltip?: string;
}

interface PriceTier {
    id: string;
    name: string;
    description: string;
    priceMonthly: number;
    priceAnnually: number;
    isPopular: boolean;
    buttonLabel: string;
    features: Feature[];
}

interface PricingComponentProps extends React.HTMLAttributes<HTMLDivElement> {
    plans: [PriceTier, PriceTier, PriceTier];
    billingCycle: BillingCycle;
    onCycleChange: (cycle: BillingCycle) => void;
    onPlanSelect: (planId: string, cycle: BillingCycle) => void;
}

const FeatureItem: React.FC<{ feature: Feature }> = ({ feature }) => {
    const Icon = feature.isIncluded ? Check : X;
    const iconColor = feature.isIncluded ? "text-primary" : "text-muted-foreground";

    return (
        <li className="flex items-start space-x-3 py-2">
            <Icon className={cn("h-4 w-4 flex-shrink-0 mt-0.5", iconColor)} aria-hidden="true" />
            <span className={cn("text-sm", feature.isIncluded ? "text-foreground" : "text-muted-foreground")}>
                {feature.name}
            </span>
        </li>
    );
};

const PricingComponent: React.FC<PricingComponentProps> = ({
    plans,
    billingCycle,
    onCycleChange,
    onPlanSelect,
    className,
    ...props
}) => {
    if (plans.length !== 3) {
        return null;
    }

    const CycleToggle = (
        <div className="flex justify-center mb-10 mt-2">
            <ToggleGroup
                type="single"
                value={billingCycle}
                onValueChange={(value) => {
                    if (value && (value === 'monthly' || value === 'annually')) {
                        onCycleChange(value);
                    }
                }}
                aria-label="Selecione o ciclo de cobrança"
                className="border rounded-full p-1 bg-muted/50 dark:bg-muted/30"
            >
                <ToggleGroupItem
                    value="monthly"
                    aria-label="Cobrança Mensal"
                    className="px-6 py-1.5 text-sm font-medium rounded-full transition-colors"
                >
                    Mensal
                </ToggleGroupItem>
                <ToggleGroupItem
                    value="annually"
                    aria-label="Cobrança Anual"
                    className="px-6 py-1.5 text-sm font-medium rounded-full transition-colors relative"
                >
                    Anual
                    <span className="absolute -top-3 -right-2 text-[10px] font-bold text-white bg-green-500 px-1.5 py-0.5 rounded-full whitespace-nowrap shadow-sm">
                        -20%
                    </span>
                </ToggleGroupItem>
            </ToggleGroup>
        </div>
    );

    const PricingCards = (
        <div className="grid gap-8 md:grid-cols-3 md:gap-6 lg:gap-8">
            {plans.map((plan) => {
                const isFeatured = plan.isPopular;
                const currentPrice = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceAnnually;
                const priceSuffix = billingCycle === 'monthly' ? '/mês' : '/ano';

                return (
                    <Card
                        key={plan.id}
                        className={cn(
                            "flex flex-col transition-all duration-300 shadow-md hover:shadow-lg rounded-3xl border-muted",
                            isFeatured && "ring-2 ring-primary shadow-xl transform md:scale-[1.02] hover:scale-[1.04]"
                        )}
                    >
                        <CardHeader className="p-6 pb-4">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                                {isFeatured && (
                                    <span className="text-xs font-semibold px-3 py-1 bg-primary text-primary-foreground rounded-full">
                                        Mais Popular
                                    </span>
                                )}
                            </div>
                            <CardDescription className="text-sm mt-1">{plan.description}</CardDescription>
                            <div className="mt-4">
                                <p className="text-4xl font-extrabold text-foreground">
                                    R$ {currentPrice}
                                    <span className="text-base font-normal text-muted-foreground ml-1">{priceSuffix}</span>
                                </p>
                                {billingCycle === 'annually' && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Faturado anualmente (R$ {plan.priceAnnually})
                                    </p>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow p-6 pt-0">
                            <h4 className="text-sm font-semibold mb-2 mt-4 text-foreground/80">Recursos:</h4>
                            <ul className="list-none space-y-0">
                                {plan.features.slice(0, 5).map((feature) => (
                                    <FeatureItem key={feature.name} feature={feature} />
                                ))}
                                {plan.features.length > 5 && (
                                    <li className="text-sm text-muted-foreground mt-2">
                                        + {plan.features.length - 5} outros recursos
                                    </li>
                                )}
                            </ul>
                        </CardContent>
                        <CardFooter className="p-6 pt-0">
                            <Button
                                onClick={() => onPlanSelect(plan.id, billingCycle)}
                                className={cn(
                                    "w-full transition-all duration-200 rounded-3xl",
                                    isFeatured
                                        ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                                        : "bg-muted text-foreground hover:bg-muted/80 border border-input"
                                )}
                                size="lg"
                            >
                                {plan.buttonLabel}
                            </Button>
                        </CardFooter>
                    </Card>
                );
            })}
        </div>
    );

    return (
        <div className={cn("w-full py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", className)} {...props}>
            <header className="text-center mb-10">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                    Escolha o plano ideal para você
                </h2>
                <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
                    Escale seu negócio com recursos projetados para crescimento, desde startups até grandes empresas.
                </p>
            </header>

            {CycleToggle}

            <section aria-labelledby="pricing-plans">
                {PricingCards}
            </section>
        </div>
    );
};

const examplePlans: [PriceTier, PriceTier, PriceTier] = [
    {
        id: 'starter',
        name: 'Inicial',
        description: 'Perfeito para quem está começando.',
        priceMonthly: 49,
        priceAnnually: 470,
        isPopular: false,
        buttonLabel: 'Começar Grátis',
        features: [
            { name: '1 Projeto', isIncluded: true },
            { name: 'Analytics Básico', isIncluded: true },
            { name: 'Suporte por Email', isIncluded: true },
            { name: '10.000 Visualizações', isIncluded: true },
            { name: 'Domínio Personalizado', isIncluded: false },
            { name: 'Remover Branding', isIncluded: false },
        ],
    },
    {
        id: 'pro',
        name: 'Profissional',
        description: 'Tudo que você precisa para crescer.',
        priceMonthly: 99,
        priceAnnually: 950,
        isPopular: true,
        buttonLabel: 'Escolher Profissional',
        features: [
            { name: 'Projetos Ilimitados', isIncluded: true },
            { name: 'Analytics Avançado', isIncluded: true },
            { name: 'Suporte Prioritário', isIncluded: true },
            { name: '100.000 Visualizações', isIncluded: true },
            { name: 'Domínio Personalizado', isIncluded: true },
            { name: 'Remover Branding', isIncluded: true },
        ],
    },
    {
        id: 'enterprise',
        name: 'Empresarial',
        description: 'Para grandes volumes e necessidades específicas.',
        priceMonthly: 299,
        priceAnnually: 2870,
        isPopular: false,
        buttonLabel: 'Falar com Vendas',
        features: [
            { name: 'Tudo do Profissional', isIncluded: true },
            { name: 'Visualizações Ilimitadas', isIncluded: true },
            { name: 'Gerente de Conta Dedicado', isIncluded: true },
            { name: 'SLA e Garantia de Uptime', isIncluded: true },
            { name: 'SSO', isIncluded: true },
            { name: 'API Personalizada', isIncluded: true },
        ],
    },
];

export function PricingSection() {
    const [cycle, setCycle] = React.useState<BillingCycle>('monthly');

    const handleCycleChange = (newCycle: BillingCycle) => {
        setCycle(newCycle);
    };

    const handlePlanSelect = (planId: string, currentCycle: BillingCycle) => {
        console.log(`User selected plan: ${planId} with cycle: ${currentCycle}`);
    };

    return (
        <section id="pricing" className="bg-background">
            <PricingComponent
                plans={examplePlans}
                billingCycle={cycle}
                onCycleChange={handleCycleChange}
                onPlanSelect={handlePlanSelect}
            />
        </section>
    );
}
