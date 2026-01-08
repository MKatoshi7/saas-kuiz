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

    const projects = await prisma.funnel.findMany({
        where: { userId },
        include: {
            _count: {
                select: { sessions: true }
            }
        },
        orderBy: { updatedAt: 'desc' }
    });

    return (
        <>
            <DashboardHeader />
            <DashboardClient projects={projects} />
        </>
    );
}
