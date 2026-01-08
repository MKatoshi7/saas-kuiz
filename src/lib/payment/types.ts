
export interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    currency: string;
    features: string[];
}

export interface PaymentProvider {
    createCheckoutSession(userId: string, planId: string, returnUrl: string): Promise<{ url: string; sessionId: string }>;
    cancelSubscription(subscriptionId: string): Promise<void>;
    getSubscriptionStatus(subscriptionId: string): Promise<'active' | 'canceled' | 'past_due' | 'incomplete'>;
}

export const PLANS: Record<string, SubscriptionPlan> = {
    starter: {
        id: 'starter',
        name: 'Starter',
        price: 29,
        currency: 'BRL',
        features: ['10 Funnels', '1,000 Leads', 'Custom Domain']
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        price: 79,
        currency: 'BRL',
        features: ['50 Funnels', '10,000 Leads', 'Priority Support']
    },
    enterprise: {
        id: 'enterprise',
        name: 'Enterprise',
        price: 199,
        currency: 'BRL',
        features: ['Unlimited Funnels', 'Unlimited Leads', 'Dedicated Support']
    }
};
