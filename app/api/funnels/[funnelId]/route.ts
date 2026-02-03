import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

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
                        components: {
                            orderBy: {
                                order: 'asc',
                            },
                        },
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

        // OPTIMIZED: Use UPSERT strategy with batched operations
        const stepIdMap = await prisma.$transaction(async (tx: any) => {
            const map = new Map<string, string>();

            // Get existing steps for comparison
            const existingSteps = targetFunnel.steps;
            const existingStepIds = new Set(existingSteps.map((s: any) => s.id));
            const incomingStepIds = new Set(steps.map((s: any) => s.id));

            // 1. First DELETE steps that were removed
            const stepsToDelete = existingSteps
                .filter((s: any) => !incomingStepIds.has(s.id))
                .map((s: any) => s.id);

            if (stepsToDelete.length > 0) {
                await tx.funnelStep.deleteMany({
                    where: { id: { in: stepsToDelete } }
                });
            }

            // 2. UPSERT steps sequentially
            for (let index = 0; index < steps.length; index++) {
                const step = steps[index];
                const isExisting = existingStepIds.has(step.id);

                if (isExisting) {
                    const updated = await tx.funnelStep.update({
                        where: { id: step.id },
                        data: { title: step.title, order: index }
                    });
                    map.set(step.id, updated.id);
                } else {
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

            // 3. Process components for all steps
            for (const step of steps) {
                const newStepId = map.get(step.id);
                if (!newStepId) continue;

                const stepComponents = componentsByStep[step.id] || [];
                const existingStep = existingSteps.find((s: any) => s.id === step.id);
                const existingComponents = existingStep?.components || [];
                // SIMPLIFIED STRATEGY: Delete all components and recreate them
                // This guarantees order and prevents ID mismatches or ghost components

                // 1. Delete all existing components for this step
                if (existingComponents.length > 0) {
                    await tx.funnelComponent.deleteMany({
                        where: { stepId: newStepId }
                    });
                }

                // 2. Recreate all components in the correct order
                if (stepComponents.length > 0) {
                    const componentsToCreate = stepComponents.map((comp: any, index: number) => {
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
                            order: index, // Guaranteed correct index
                            data: componentData,
                            // We don't preserve the ID here to avoid conflicts, 
                            // the frontend will reload and get the new IDs
                        };
                    });

                    await tx.funnelComponent.createMany({
                        data: componentsToCreate
                    });
                }
            }


            // 4. Update funnel timestamp
            await tx.funnel.update({
                where: { id: funnelId },
                data: {
                    updatedAt: new Date(),
                    themeConfig: themeConfig || undefined
                },
            });

            return map;
        }, {
            maxWait: 10000,
            timeout: 30000 // Increased to 30s
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

        // Delete all images from Cloudinary for this funnel
        try {
            const { v2: cloudinary } = await import('cloudinary');

            cloudinary.config({
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET,
            });

            // Delete all images in the funnel's folder
            const folderPath = `kuiz-uploads/${funnelId}`;

            try {
                // List all resources in the folder
                const resources = await cloudinary.api.resources({
                    type: 'upload',
                    prefix: folderPath,
                    max_results: 500, // Cloudinary limit
                });

                // Delete each resource
                if (resources.resources && resources.resources.length > 0) {
                    const publicIds = resources.resources.map((resource: any) => resource.public_id);

                    // Delete in batches of 100 (Cloudinary limit)
                    for (let i = 0; i < publicIds.length; i += 100) {
                        const batch = publicIds.slice(i, i + 100);
                        await cloudinary.api.delete_resources(batch);
                    }

                    console.log(`✅ Deleted ${publicIds.length} images from Cloudinary for funnel ${funnelId}`);
                }

                // Try to delete the folder itself
                try {
                    await cloudinary.api.delete_folder(folderPath);
                    console.log(`✅ Deleted Cloudinary folder: ${folderPath}`);
                } catch (folderError) {
                    // Folder might not exist or might not be empty, that's okay
                    console.log(`ℹ️ Could not delete folder ${folderPath}:`, folderError);
                }
            } catch (cloudinaryError) {
                // Log but don't fail the deletion if Cloudinary fails
                console.warn('⚠️ Error deleting Cloudinary resources:', cloudinaryError);
            }
        } catch (importError) {
            console.warn('⚠️ Cloudinary not configured or import failed:', importError);
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
