import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidateTag } from 'next/cache';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ funnelId: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { funnelId } = await params;

        // Get the original funnel with all data
        const originalFunnel = await prisma.funnel.findUnique({
            where: {
                id: funnelId,
                userId: session.userId // Ensure user owns the funnel
            },
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

        // Create duplicate funnel using transaction to handle references
        const duplicatedFunnel = await prisma.$transaction(async (tx: any) => {
            // 1. Create the base funnel
            const newFunnel = await tx.funnel.create({
                data: {
                    userId: session.userId,
                    title: `${originalFunnel.title} (Cópia)`,
                    description: originalFunnel.description,
                    slug: `${originalFunnel.slug}-copy-${Date.now()}`,
                    status: 'draft',
                    themeConfig: originalFunnel.themeConfig as any,
                }
            });

            // Map to store oldStepId -> newStepId
            const stepIdMap = new Map<string, string>();

            // 2. Create steps first (without components) to generate IDs
            for (const step of originalFunnel.steps) {
                const newStep = await tx.funnelStep.create({
                    data: {
                        funnelId: newFunnel.id,
                        title: step.title,
                        slug: `${step.slug}-${Date.now()}`,
                        order: step.order,
                        stepType: step.stepType,
                    }
                });
                stepIdMap.set(step.id, newStep.id);
            }

            // 3. Create components with updated references
            for (const step of originalFunnel.steps) {
                const newStepId = stepIdMap.get(step.id);
                if (!newStepId) continue;

                const componentsToCreate = step.components.map((comp: any) => {
                    const componentData = { ...comp.data };

                    // Fix references in component data
                    if (componentData.targetStepId && stepIdMap.has(componentData.targetStepId)) {
                        componentData.targetStepId = stepIdMap.get(componentData.targetStepId);
                    }
                    if (componentData.nextStepId && stepIdMap.has(componentData.nextStepId)) {
                        componentData.nextStepId = stepIdMap.get(componentData.nextStepId);
                    }
                    if (componentData.options && Array.isArray(componentData.options)) {
                        componentData.options = componentData.options.map((opt: any) => {
                            if (opt.targetStepId && stepIdMap.has(opt.targetStepId)) {
                                return { ...opt, targetStepId: stepIdMap.get(opt.targetStepId) };
                            }
                            return opt;
                        });
                    }

                    return {
                        stepId: newStepId,
                        type: comp.type,
                        order: comp.order,
                        data: componentData
                    };
                });

                if (componentsToCreate.length > 0) {
                    await tx.funnelComponent.createMany({
                        data: componentsToCreate
                    });
                }
            }

            return newFunnel;
        });

        console.log('✅ Funnel duplicated:', {
            original: originalFunnel.id,
            duplicate: duplicatedFunnel.id
        });

        revalidateTag('funnels', 'max');
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
