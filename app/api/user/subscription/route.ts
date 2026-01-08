import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { paymentService } from '@/lib/payment/payment-service';
import { PLANS } from '@/lib/payment/types';

export async function POST(req: NextRequest) {
    try {
        const user = await getSession();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { planId } = await req.json();

        if (!PLANS[planId]) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }

        // Create checkout session (Mock)
        // In a real app, we would pass the return URL here
        const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/account`;
        const checkout = await paymentService.createCheckoutSession(user.userId, planId, returnUrl);

        // SIMULATE WEBHOOK: Update DB immediately for the mock to work without real webhooks
        // In production with Stripe, this would happen via webhook
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        const updatedUser = await prisma.user.update({
            where: { id: user.userId },
            data: {
                subscriptionPlan: planId,
                subscriptionStatus: 'active',
                subscriptionEndsAt: expiresAt
            }
        });

        // Return the checkout URL (even if we already updated DB, to simulate the flow)
        return NextResponse.json({ success: true, url: checkout.url, user: updatedUser });
    } catch (error) {
        console.error('Error updating subscription:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
