import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ funnelId: string }> }
) {
    try {
        const { funnelId: funnelIdParam } = await params;

        // Resolve real funnel ID (could be slug or ID)
        const targetFunnel = await prisma.funnel.findFirst({
            where: {
                OR: [
                    { id: funnelIdParam },
                    { slug: funnelIdParam }
                ]
            },
            select: { id: true, status: true }
        });

        if (!targetFunnel) {
            return NextResponse.json(
                { error: "Funnel not found" },
                { status: 404 }
            );
        }

        // Update funnel status to published
        const updatedFunnel = await prisma.funnel.update({
            where: { id: targetFunnel.id },
            data: {
                status: 'published',
                publishedAt: new Date(),
                updatedAt: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            funnel: {
                id: updatedFunnel.id,
                status: updatedFunnel.status,
                publishedAt: updatedFunnel.publishedAt
            }
        });
    } catch (error) {
        console.error("Error publishing funnel:", error);
        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }
        return NextResponse.json(
            { error: "Failed to publish funnel", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
