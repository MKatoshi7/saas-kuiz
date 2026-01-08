import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ funnelId: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { funnelId: funnelIdParam } = await params;

        const whereClause: any = {
            OR: [
                { id: funnelIdParam },
                { slug: funnelIdParam }
            ]
        };

        // If not admin, restrict to own funnels
        if (session.role !== 'admin') {
            whereClause.userId = session.userId;
        }

        const funnel = await prisma.funnel.findFirst({
            where: whereClause,
            include: {
                steps: {
                    include: {
                        components: true,
                    },
                    orderBy: {
                        order: 'asc',
                    },
                },
            },
        });

        if (!funnel) {
            return NextResponse.json(
                { error: "Funnel not found or access denied" },
                { status: 404 }
            );
        }

        return NextResponse.json(funnel);
    } catch (error) {
        console.error("Error fetching funnel:", error);
        return NextResponse.json(
            { error: "Failed to fetch funnel" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ funnelId: string }> }
) {
    const startTime = performance.now();

    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { funnelId: funnelIdParam } = await params;
        const body = await request.json();
        const { steps, componentsByStep, themeConfig } = body;

        const whereClause: any = {
            OR: [
                { id: funnelIdParam },
                { slug: funnelIdParam }
            ]
        };

        if (session.role !== 'admin') {
            whereClause.userId = session.userId;
        }

        // Resolve real funnel ID
        const targetFunnel = await prisma.funnel.findFirst({
            where: whereClause,
            select: {
                id: true,
                steps: {
                    select: {
                        id: true,
                        order: true,
                        title: true,
                        components: {
                            select: {
                                id: true,
                                type: true,
                                order: true,
                                data: true
                            }
                        }
                    }
                }
            }
        });

        if (!targetFunnel) {
            return NextResponse.json(
                { error: "Funnel not found or access denied" },
                { status: 404 }
            );
        }

        const funnelId = targetFunnel.id;

        // OPTIMIZED: Use UPSERT strategy instead of DELETE ALL + CREATE ALL
        const stepIdMap = await prisma.$transaction(async (tx: any) => {
            const map = new Map<string, string>();

            // Get existing steps for comparison
            const existingSteps = targetFunnel.steps;
            const existingStepIds = new Set(existingSteps.map((s: any) => s.id));
            const incomingStepIds = new Set(steps.map((s: any) => s.id));

            // 1. First DELETE steps that were removed to free up order positions
            const stepsToDelete = existingSteps
                .filter((s: any) => !incomingStepIds.has(s.id))
                .map((s: any) => s.id);

            if (stepsToDelete.length > 0) {
                // Components will be deleted via CASCADE
                await tx.funnelStep.deleteMany({
                    where: { id: { in: stepsToDelete } }
                });
            }

            // 2. UPSERT steps sequentially to avoid order conflicts
            for (let index = 0; index < steps.length; index++) {
                const step = steps[index];
                const isExisting = existingStepIds.has(step.id);

                if (isExisting) {
                    // UPDATE existing step
                    const updated = await tx.funnelStep.update({
                        where: { id: step.id },
                        data: {
                            title: step.title,
                            order: index
                        }
                    });
                    map.set(step.id, updated.id);
                } else {
                    // CREATE new step
                    const created = await tx.funnelStep.create({
                        data: {
                            funnelId,
                            title: step.title,
                            slug: `step-${Date.now()}-${index}`,
                            order: index,
                            stepType: 'question',
                        },
                    });
                    map.set(step.id, created.id);
                }
            }

            // 3. BATCH UPSERT components for each step
            for (const step of steps) {
                const newStepId = map.get(step.id);
                if (!newStepId) continue;

                const stepComponents = componentsByStep[step.id] || [];
                const existingStep = existingSteps.find((s: any) => s.id === step.id);
                const existingComponents = existingStep?.components || [];
                const existingCompIds = new Set(existingComponents.map((c: any) => c.id));
                const incomingCompIds = new Set(stepComponents.map((c: any) => c.id));

                // Components to create (new ones)
                const componentsToCreate = stepComponents
                    .filter((c: any) => !existingCompIds.has(c.id))
                    .map((comp: any, index: number) => {
                        const componentData = { ...comp.data };

                        // Fix references
                        if (componentData.targetStepId && map.has(componentData.targetStepId)) {
                            componentData.targetStepId = map.get(componentData.targetStepId);
                        }

                        if (componentData.options && Array.isArray(componentData.options)) {
                            componentData.options = componentData.options.map((opt: any) => {
                                if (opt.targetStepId && map.has(opt.targetStepId)) {
                                    return { ...opt, targetStepId: map.get(opt.targetStepId) };
                                }
                                return opt;
                            });
                        }

                        return {
                            stepId: newStepId,
                            type: comp.type,
                            order: stepComponents.findIndex((c: any) => c.id === comp.id),
                            data: componentData,
                        };
                    });

                // Components to update (existing ones)
                const updatePromises = stepComponents
                    .filter((c: any) => existingCompIds.has(c.id))
                    .map(async (comp: any) => {
                        const componentData = { ...comp.data };

                        // Fix references
                        if (componentData.targetStepId && map.has(componentData.targetStepId)) {
                            componentData.targetStepId = map.get(componentData.targetStepId);
                        }

                        if (componentData.options && Array.isArray(componentData.options)) {
                            componentData.options = componentData.options.map((opt: any) => {
                                if (opt.targetStepId && map.has(opt.targetStepId)) {
                                    return { ...opt, targetStepId: map.get(opt.targetStepId) };
                                }
                                return opt;
                            });
                        }

                        return tx.funnelComponent.update({
                            where: { id: comp.id },
                            data: {
                                type: comp.type,
                                order: stepComponents.findIndex((c: any) => c.id === comp.id),
                                data: componentData,
                            }
                        });
                    });

                // Components to delete (removed ones)
                const componentsToDelete = existingComponents
                    .filter((c: any) => !incomingCompIds.has(c.id))
                    .map((c: any) => c.id);

                // Execute all operations in parallel
                await Promise.all([
                    ...updatePromises,
                    componentsToCreate.length > 0
                        ? tx.funnelComponent.createMany({ data: componentsToCreate })
                        : Promise.resolve(),
                    componentsToDelete.length > 0
                        ? tx.funnelComponent.deleteMany({ where: { id: { in: componentsToDelete } } })
                        : Promise.resolve()
                ]);
            }

            // 4. Update funnel timestamp and theme
            await tx.funnel.update({
                where: { id: funnelId },
                data: {
                    updatedAt: new Date(),
                    themeConfig: themeConfig || undefined
                },
            });

            return map;
        }, {
            maxWait: 3000,
            timeout: 10000 // Reduced from 20s since UPSERT is much faster
        });

        // Convert Map to object for JSON
        const idMap: Record<string, string> = {};
        stepIdMap.forEach((value: any, key: any) => {
            idMap[key] = value;
        });

        const duration = performance.now() - startTime;
        console.log(`✅ Funnel saved in ${duration.toFixed(0)}ms`);

        return NextResponse.json({ success: true, stepIdMap: idMap, duration });
    } catch (error) {
        const duration = performance.now() - startTime;
        console.error(`❌ Error saving funnel after ${duration.toFixed(0)}ms:`, error);

        if (error instanceof Error) {
            console.error("❌ Error message:", error.message);
            console.error("❌ Error stack:", error.stack);
        }

        return NextResponse.json(
            { error: "Failed to save funnel", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ funnelId: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { funnelId } = await params;

        // Verify ownership or admin
        const whereClause: any = { id: funnelId };
        if (session.role !== 'admin') {
            whereClause.userId = session.userId;
        }

        const funnel = await prisma.funnel.findFirst({ where: whereClause });

        if (!funnel) {
            return NextResponse.json({ error: "Funnel not found or access denied" }, { status: 404 });
        }

        // Delete all related data with cascade
        await prisma.$transaction([
            // Delete events related to this funnel's sessions
            prisma.event.deleteMany({
                where: {
                    session: {
                        funnelId: funnelId
                    }
                }
            }),
            // Delete visitor sessions
            prisma.visitorSession.deleteMany({
                where: { funnelId: funnelId }
            }),
            // Delete components (cascade from steps)
            prisma.funnelComponent.deleteMany({
                where: {
                    step: {
                        funnelId: funnelId
                    }
                }
            }),
            // Delete steps
            prisma.funnelStep.deleteMany({
                where: { funnelId: funnelId }
            }),
            // Finally delete the funnel itself
            prisma.funnel.delete({
                where: { id: funnelId }
            })
        ]);

        console.log('✅ Funnel deleted successfully:', funnelId);

        return NextResponse.json({
            success: true,
            message: 'Funnel deleted successfully'
        });
    } catch (error) {
        console.error('❌ Error deleting funnel:', error);
        return NextResponse.json(
            { error: 'Failed to delete funnel' },
            { status: 500 }
        );
    }
}
