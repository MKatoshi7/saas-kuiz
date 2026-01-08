'use server';

import prisma from '@/lib/prisma';

export async function saveFunnelAnswer(sessionId: string, funnelId: string, stepId: string, componentId: string, value: any) {
    if (!sessionId || !funnelId) return;

    try {
        // Find or create session
        let session = await prisma.visitorSession.findUnique({
            where: { id: sessionId }
        });

        if (!session) {
            session = await prisma.visitorSession.create({
                data: {
                    id: sessionId,
                    sessionId: sessionId,
                    funnelId,
                    startedAt: new Date(),
                    answersSnapshot: {}
                }
            });
        }

        // Update answers
        const currentAnswers = (session.answersSnapshot as Record<string, any>) || {};

        // We store answers by stepId for easier aggregation, or componentId if needed.
        // Let's store by stepId for the table view.
        // If multiple components in one step, we might need a better structure, 
        // but for now let's assume one main answer per step or merge them.

        const updatedAnswers = {
            ...currentAnswers,
            [stepId]: value // Store simple value for the step
        };

        await prisma.visitorSession.update({
            where: { id: sessionId },
            data: {
                answersSnapshot: updatedAnswers,
                lastSeenAt: new Date()
            }
        });

        return { success: true };
    } catch (error) {
        console.error('Error saving answer:', error);
        return { success: false, error };
    }
}

export async function completeFunnelSession(sessionId: string) {
    if (!sessionId) return;

    try {
        await prisma.visitorSession.update({
            where: { id: sessionId },
            data: {
                completedAt: new Date(),
                isConverted: true // Assume completion = conversion for now
            }
        });
    } catch (error) {
        console.error('Error completing session:', error);
    }
}
