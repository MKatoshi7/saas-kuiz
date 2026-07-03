import prisma from '@/lib/prisma';
import { PLAN_LIMITS } from '@/lib/limits';

export async function checkSubscription(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            subscriptionStatus: true,
            subscriptionEndsAt: true,
            subscriptionPlan: true,
            createdAt: true,
            role: true
        }
    });

    if (!user) return false;
    if (user.role === 'admin') return true;

    // If status is active, check date
    if (user.subscriptionStatus === 'active') {
        if (!user.subscriptionEndsAt) return true;
        return new Date() <= user.subscriptionEndsAt;
    }

    // Free tier: 7-day trial from registration
    if (user.subscriptionStatus === 'free') {
        const limits = PLAN_LIMITS.free;
        const trialEnd = new Date(user.createdAt);
        trialEnd.setDate(trialEnd.getDate() + limits.trialDays);
        return new Date() <= trialEnd;
    }

    return false;
}

export async function getSubscriptionInfo(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            subscriptionStatus: true,
            subscriptionEndsAt: true,
            subscriptionPlan: true,
            createdAt: true,
            role: true
        }
    });

    if (!user) return null;

    if (user.role === 'admin') {
        return {
            status: 'active',
            plan: 'admin',
            daysRemaining: Infinity,
            isTrial: false,
            trialEndsAt: null,
        };
    }

    if (user.subscriptionStatus === 'active' && user.subscriptionEndsAt) {
        const now = new Date();
        const endsAt = new Date(user.subscriptionEndsAt);
        const daysRemaining = Math.max(0, Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        return {
            status: 'active',
            plan: user.subscriptionPlan || 'starter',
            daysRemaining,
            isTrial: false,
            trialEndsAt: null,
        };
    }

    // Free trial
    if (user.subscriptionStatus === 'free') {
        const limits = PLAN_LIMITS.free;
        const trialEnd = new Date(user.createdAt);
        trialEnd.setDate(trialEnd.getDate() + limits.trialDays);
        const now = new Date();
        const daysRemaining = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        const isExpired = now > trialEnd;

        return {
            status: isExpired ? 'expired' : 'trial',
            plan: 'free',
            daysRemaining,
            isTrial: !isExpired,
            trialEndsAt: trialEnd,
        };
    }

    return {
        status: user.subscriptionStatus || 'free',
        plan: user.subscriptionPlan || 'free',
        daysRemaining: 0,
        isTrial: false,
        trialEndsAt: null,
    };
}
