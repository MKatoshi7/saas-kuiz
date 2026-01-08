import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function POST(req: Request) {
    const payload = await req.json();
    const provider = 'cakto';

    // Log the webhook
    const webhookLog = await prisma.webhookLog.create({
        data: {
            provider,
            eventType: payload.status || 'unknown',
            payload,
            status: 'processing'
        }
    });

    try {
        // Basic validation (Adjust based on real Cakto docs)
        // Assuming payload structure: { status: 'paid', customer: { email: '...' }, amount: 2990, id: '...' }

        const status = payload.status;
        const email = payload.customer?.email || payload.email;
        const amount = payload.amount; // Assuming amount is in cents or full value, need to verify. Assuming full value for now.
        const transactionId = payload.id || payload.transaction_id;

        if (status === 'paid' || status === 'approved') {
            if (!email) {
                throw new Error('Email not found in payload');
            }

            const user = await prisma.user.findUnique({ where: { email } });

            if (user) {
                // Add 30 days to current subscription end or now
                const currentEnd = user.subscriptionEndsAt && user.subscriptionEndsAt > new Date()
                    ? user.subscriptionEndsAt
                    : new Date();

                const newEnd = new Date(currentEnd);
                newEnd.setDate(newEnd.getDate() + 30);

                // Update User
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        subscriptionStatus: 'active',
                        subscriptionEndsAt: newEnd,
                        subscriptionPlan: 'pro' // Default to pro on payment
                    }
                });

                // Create Transaction Record
                await prisma.subscriptionTransaction.create({
                    data: {
                        userId: user.id,
                        amount: Number(amount),
                        status: 'paid',
                        provider,
                        transactionId: String(transactionId),
                        metadata: payload
                    }
                });

                logger.info(`Subscription renewed for ${email}`, { transactionId });
            } else {
                logger.warn(`Webhook received for unknown user: ${email}`);
            }
        }

        // Update log status
        await prisma.webhookLog.update({
            where: {
                id: webhookLog.id
            },
            data: { status: 'success' }
        });

        return NextResponse.json({ received: true });
    } catch (error) {
        logger.error('Error processing Cakto webhook', error, { payload });
        return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
    }
}
