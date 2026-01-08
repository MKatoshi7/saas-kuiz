import { PaymentProvider, PLANS } from './types';

class MockPaymentProvider implements PaymentProvider {
    async createCheckoutSession(userId: string, planId: string, returnUrl: string): Promise<{ url: string; sessionId: string }> {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const plan = PLANS[planId];
        if (!plan) throw new Error('Invalid plan');

        // In a real app, this would call Stripe/Paddle API
        // For now, we return a mock URL that would "process" the payment
        // We'll just redirect back to success for demo purposes
        return {
            url: `${returnUrl}?success=true&session_id=mock_session_${Date.now()}`,
            sessionId: `mock_session_${Date.now()}`
        };
    }

    async cancelSubscription(subscriptionId: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`[MockPayment] Cancelled subscription ${subscriptionId}`);
    }

    async getSubscriptionStatus(subscriptionId: string): Promise<'active' | 'canceled' | 'past_due' | 'incomplete'> {
        return 'active';
    }
}

// Singleton instance
export const paymentService = new MockPaymentProvider();
