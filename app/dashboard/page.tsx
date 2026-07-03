// Force rebuild
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "./DashboardClient";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default async function DashboardPage() {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    const userId = session.userId;

    const [projects, user] = await Promise.all([
        prisma.funnel.findMany({
            where: { userId },
            include: {
                _count: {
                    select: { sessions: true }
                }
            },
            orderBy: { updatedAt: 'desc' }
        }),
        prisma.user.findUnique({
            where: { id: userId },
            select: {
                name: true,
                email: true,
                subscriptionEndsAt: true,
                subscriptionStatus: true,
                subscriptionPlan: true,
            }
        }),
    ]);

    const isSubscriptionExpired = user?.subscriptionEndsAt && new Date(user.subscriptionEndsAt) < new Date();

    return (
        <>
            <DashboardHeader />
            <DashboardClient
                projects={projects}
                isSubscriptionExpired={!!isSubscriptionExpired}
                userName={user?.name}
                userPlan={user?.subscriptionPlan || 'free'}
            />
        </>
    );
}
