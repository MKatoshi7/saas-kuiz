import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ funnelId: string }> }
) {
    try {
        const { funnelId: funnelIdParam } = await params;
        const body = await request.json();
        const { slug, title, description } = body;

        // Resolve real funnel ID
        const targetFunnel = await prisma.funnel.findFirst({
            where: {
                OR: [
                    { id: funnelIdParam },
                    { slug: funnelIdParam }
                ]
            },
            select: { id: true }
        });

        if (!targetFunnel) {
            return NextResponse.json(
                { error: "Funnel not found" },
                { status: 404 }
            );
        }

        const funnelId = targetFunnel.id;

        // Check if slug is already taken (if slug is being updated)
        if (slug) {
            const existingFunnel = await prisma.funnel.findFirst({
                where: {
                    slug: slug,
                    id: { not: funnelId }
                }
            });

            if (existingFunnel) {
                return NextResponse.json(
                    { error: "Este subdomínio já está em uso. Por favor, escolha outro." },
                    { status: 400 }
                );
            }
        }

        // Update funnel
        const updatedFunnel = await prisma.funnel.update({
            where: { id: funnelId },
            data: {
                ...(slug && { slug }),
                ...(title && { title }),
                ...(description && { description }),
                ...(body.theme && { theme: body.theme }),
                ...(body.themeConfig && { themeConfig: body.themeConfig }),
                ...(body.marketingConfig && { marketingConfig: body.marketingConfig }),
            }
        });

        return NextResponse.json({ success: true, funnel: updatedFunnel });
    } catch (error) {
        console.error("Error updating funnel settings:", error);
        return NextResponse.json(
            { error: "Failed to update funnel settings" },
            { status: 500 }
        );
    }
}
