import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { visitorId, email, phone, name, external_id, event_source_url, action_source, isConverted } = await req.json();

        if (!visitorId) {
            return NextResponse.json(
                { error: 'visitorId is required' },
                { status: 400 }
            );
        }

        // Get current visitor data to merge
        const session = await prisma.visitorSession.findUnique({
            where: { id: visitorId }
        });

        const currentVisitorData = (session?.visitorData as any) || {};

        // Update visitor session with complete lead data
        await prisma.visitorSession.update({
            where: { id: visitorId },
            data: {
                email: email || undefined,
                phone: phone || undefined,
                name: name || undefined,
                isLead: true, // Mark as lead
                isConverted: isConverted ? true : undefined,
                completedAt: isConverted ? new Date() : undefined,
                visitorData: {
                    ...currentVisitorData,
                    // Add Facebook tracking data
                    external_id,
                    event_source_url,
                    action_source,
                    lead_captured_at: new Date().toISOString(),
                }
            }
        });

        console.log('✅ Lead saved:', {
            email: email ? '✓' : '✗',
            phone: phone ? '✓' : '✗',
            name: name ? '✓' : '✗',
            external_id: external_id ? '✓' : '✗'
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Error tracking lead:', error);
        return NextResponse.json(
            { error: 'Failed to track lead' },
            { status: 500 }
        );
    }
}
