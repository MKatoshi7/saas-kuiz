import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

// This is a placeholder for the actual Stripe Webhook handler
// In a real application, you would verify the Stripe signature here
export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const signature = (await headers()).get('stripe-signature');

        if (!signature) {
            // In dev/mock mode, we might not have a signature, but in prod it's required
            console.warn('No stripe-signature header found');
        }

        // Parse the event (in reality, use stripe.webhooks.constructEvent)
        const event = JSON.parse(body);

        console.log(`[Webhook] Received event: ${event.type}`);

        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                await handleCheckoutSessionCompleted(session);
                break;
            case 'customer.subscription.updated':
                const subscription = event.data.object;
                await handleSubscriptionUpdated(subscription);
                break;
            case 'customer.subscription.deleted':
                const deletedSubscription = event.data.object;
                await handleSubscriptionDeleted(deletedSubscription);
                break;
            default:
                console.log(`[Webhook] Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('[Webhook] Error processing request:', error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 });
    }
}

async function handleCheckoutSessionCompleted(session: any) {
    // Logic to fulfill the order
    const userId = session.client_reference_id;
    const planId = session.metadata?.planId;

    if (userId && planId) {
        console.log(`[Webhook] Fulfilling order for user ${userId}, plan ${planId}`);
        // Update user subscription in DB
        await prisma.user.update({
            where: { id: userId },
            data: {
                subscriptionPlan: planId,
                subscriptionStatus: 'active',
                subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 days
            }
        });
    }
}

async function handleSubscriptionUpdated(subscription: any) {
    // Logic to update subscription status
    console.log(`[Webhook] Subscription updated: ${subscription.id}`);
}

async function handleSubscriptionDeleted(subscription: any) {
    // Logic to handle cancellation
    console.log(`[Webhook] Subscription deleted: ${subscription.id}`);
    // You might want to revert the user to 'free' plan here
}
