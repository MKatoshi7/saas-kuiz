import prisma from "@/lib/prisma";
import { SettingsClient } from "./SettingsClient";
import { notFound } from "next/navigation";

export default async function SettingsPage({ params }: { params: Promise<{ funnelId: string }> }) {
    const { funnelId } = await params;

    const funnel = await prisma.funnel.findFirst({
        where: {
            OR: [
                { id: funnelId },
                { slug: funnelId }
            ]
        }
    });

    if (!funnel) notFound();

    return <SettingsClient funnel={funnel} />;
}
