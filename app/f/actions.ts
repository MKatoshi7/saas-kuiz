'use server';

import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

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

export async function sendFacebookEvent(
    pixelId: string,
    accessToken: string,
    eventName: string,
    eventData: any = {},
    userData: any = {}
) {
    if (!pixelId || !accessToken) return { success: false, error: 'Missing Pixel ID or Access Token' };

    try {
        const headersList = await headers();
        const clientIp = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '0.0.0.0';
        const userAgent = headersList.get('user-agent') || '';

        const payload = {
            data: [
                {
                    event_name: eventName,
                    event_time: Math.floor(Date.now() / 1000),
                    action_source: 'website',
                    user_data: {
                        client_ip_address: clientIp,
                        client_user_agent: userAgent,
                        ...userData
                    },
                    custom_data: eventData
                }
            ]
        };

        const response = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Facebook CAPI Error:', data);
            return { success: false, error: data };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error sending Facebook event:', error);
        return { success: false, error };
    }
}
