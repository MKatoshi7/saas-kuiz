import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const MOCK_USER_ID = "user_123";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ funnelId: string }> }
) {
    try {
        const { funnelId } = await params;

        // Get the original funnel with all data
        const originalFunnel = await prisma.funnel.findUnique({
            where: { id: funnelId },
            include: {
                steps: {
                    include: {
                        components: true
                    },
                    orderBy: { order: 'asc' }
                }
            }
        });

        if (!originalFunnel) {
            return NextResponse.json(
                { error: 'Funnel not found' },
                { status: 404 }
            );
        }

        // Create duplicate funnel
        const duplicatedFunnel = await prisma.funnel.create({
            data: {
                userId: MOCK_USER_ID,
                title: `${originalFunnel.title} (Cópia)`,
                description: originalFunnel.description,
                slug: `${originalFunnel.slug}-copy-${Date.now()}`,
                status: 'draft', // Always create as draft
                themeConfig: originalFunnel.themeConfig as any,
                steps: {
                    create: originalFunnel.steps.map((step: any) => ({
                        title: step.title,
                        slug: `${step.slug}-copy`,
                        order: step.order,
                        stepType: step.stepType,
                        components: {
                            create: step.components.map((comp: any) => ({
                                type: comp.type,
                                order: comp.order,
                                data: comp.data as any
                            }))
                        }
                    }))
                }
            },
            include: {
                steps: {
                    include: {
                        components: true
                    }
                }
            }
        });

        console.log('✅ Funnel duplicated:', {
            original: originalFunnel.id,
            duplicate: duplicatedFunnel.id
        });

        return NextResponse.json({
            success: true,
            funnelId: duplicatedFunnel.id,
            message: 'Funnel duplicated successfully'
        });
    } catch (error) {
        console.error('❌ Error duplicating funnel:', error);
        return NextResponse.json(
            { error: 'Failed to duplicate funnel' },
            { status: 500 }
        );
    }
}
