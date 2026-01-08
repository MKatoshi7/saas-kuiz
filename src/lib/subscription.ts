import prisma from '@/lib/prisma';

export async function checkSubscription(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionStatus: true, subscriptionEndsAt: true, role: true }
    });

    if (!user) return false;
    if (user.role === 'admin') return true; // Admins always have access

    // If status is active, check date
    if (user.subscriptionStatus === 'active') {
        if (!user.subscriptionEndsAt) return true; // Lifetime or bug, allow access
        return new Date() <= user.subscriptionEndsAt;
    }

    // Free tier logic (if any)
    if (user.subscriptionStatus === 'free') {
        // Implement free tier limits here if needed
        return true;
    }

    return false;
}
