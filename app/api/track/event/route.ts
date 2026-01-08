import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { visitorId, stepId, stepName, action, value } = body;

        if (!visitorId) {
            return NextResponse.json(
                { error: 'visitorId is required' },
                { status: 400 }
            );
        }

        // Create event record
        await prisma.event.create({
            data: {
                sessionId: visitorId,
                stepId: stepId || null,
                eventType: action || 'answer',
                data: {
                    stepId,
                    stepName: stepName || 'Unknown',
                    value // CRITICAL: Answer text saved here
                }
            }
        });

        // IMPORTANT: Update answersSnapshot in VisitorSession
        if (stepId && value) {
            // Get current session
            const session = await prisma.visitorSession.findUnique({
                where: { id: visitorId }
            });

            if (session) {
                // Merge new answer into existing snapshot
                const currentSnapshot = (session.answersSnapshot as Record<string, any>) || {};
                const updatedSnapshot = {
                    ...currentSnapshot,
                    [stepId]: value
                };

                // Update session with new snapshot
                await prisma.visitorSession.update({
                    where: { id: visitorId },
                    data: {
                        answersSnapshot: updatedSnapshot
                    }
                });

                console.log('✅ Answer saved to snapshot:', { stepId, value });
            }
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Error tracking event:', error);
        return NextResponse.json(
            { error: 'Failed to track event' },
            { status: 500 }
        );
    }
}
