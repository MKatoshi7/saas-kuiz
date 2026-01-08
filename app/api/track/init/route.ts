import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log('🔵 /api/track/init called with body:', body);

        const { funnelId, utm_source, utm_medium, utm_campaign, utm_term, utm_content, referrer, userAgent, visitorData } = body;

        if (!funnelId) {
            console.error('❌ funnelId is missing!');
            return NextResponse.json(
                { error: 'funnelId is required' },
                { status: 400 }
            );
        }

        console.log('🔵 Creating session for funnel:', funnelId);

        // Generate a unique session ID  
        const sessionId = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        // Extract Geo/IP data from headers (Vercel/Next.js specific)
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || 'Unknown';
        const city = req.headers.get('x-vercel-ip-city') || null;
        const region = req.headers.get('x-vercel-ip-country-region') || null;
        const country = req.headers.get('x-vercel-ip-country') || null;

        // Merge with client-provided visitorData if any
        const finalVisitorData = {
            ...(visitorData || {}),
            city: city || visitorData?.city,
            region: region || visitorData?.region,
            country: country || visitorData?.country,
            ip: ip || visitorData?.ip,
        };

        // Create new visitor session with all tracking data
        const session = await prisma.visitorSession.create({
            data: {
                funnelId,
                sessionId,
                utmSource: utm_source || null,
                utmMedium: utm_medium || null,
                utmCampaign: utm_campaign || null,
                utmTerm: utm_term || null,
                utmContent: utm_content || null,
                referrer: referrer || null,
                userAgent: userAgent || null,
                ipAddress: ip !== 'Unknown' ? ip : null,
                country: country || visitorData?.country || null,
                visitorData: finalVisitorData, // Stores fbc, fbp, city, region, country, ip
            }
        });

        console.log('✅ New visitor session created:', {
            id: session.id,
            funnelId: session.funnelId,
            utmSource: utm_source,
            city: visitorData?.city,
            fbc: visitorData?.fbc ? '✓' : '✗',
            fbp: visitorData?.fbp ? '✓' : '✗',
        });

        return NextResponse.json({ visitorId: session.id });
    } catch (error) {
        console.error('❌ Error initializing visitor session:', error);
        return NextResponse.json(
            { error: 'Failed to initialize session' },
            { status: 500 }
        );
    }
}
