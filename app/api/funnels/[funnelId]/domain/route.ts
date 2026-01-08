import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { promises as dns } from 'dns';

export async function POST(req: NextRequest, { params }: { params: Promise<{ funnelId: string }> }) {
    try {
        const { funnelId } = await params;
        const { domain } = await req.json();

        if (!domain) {
            return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
        }

        // Check if domain is already taken
        const existingFunnel = await prisma.funnel.findUnique({
            where: { customDomain: domain }
        });

        if (existingFunnel && existingFunnel.id !== funnelId) {
            return NextResponse.json({ error: 'Domain is already in use' }, { status: 409 });
        }

        // Check plan limits
        const funnel = await prisma.funnel.findUnique({
            where: { id: funnelId },
            include: { user: true }
        });

        if (!funnel) {
            return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
        }

        const { getPlanLimits } = await import('@/lib/limits');
        const limits = getPlanLimits(funnel.user.subscriptionPlan);

        if (!limits.customDomain) {
            return NextResponse.json(
                { error: `Seu plano atual (${funnel.user.subscriptionPlan || 'Gratuito'}) não suporta domínios personalizados. Atualize para o plano Starter ou superior.` },
                { status: 403 }
            );
        }

        const updatedFunnel = await prisma.funnel.update({
            where: { id: funnelId },
            data: { customDomain: domain }
        });

        return NextResponse.json({ success: true, funnel: updatedFunnel });
    } catch (error) {
        console.error('Error updating custom domain:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ funnelId: string }> }) {
    try {
        const { funnelId } = await params;
        const funnel = await prisma.funnel.findUnique({
            where: { id: funnelId },
            select: { customDomain: true }
        });

        if (!funnel?.customDomain) {
            return NextResponse.json({ verified: false, message: 'No domain configured' });
        }

        try {
            // Verify CNAME record
            // In production, this should match your platform's CNAME target
            const TARGET_CNAME = 'cname.quizk.com';

            const cnameRecords = await dns.resolveCname(funnel.customDomain);
            const isVerified = cnameRecords.some(record => record.includes('quizk.com') || record.includes('vercel.app')); // Allow vercel.app for testing

            return NextResponse.json({
                verified: isVerified,
                currentRecords: cnameRecords,
                expectedRecord: TARGET_CNAME
            });
        } catch (e: any) {
            console.log('DNS Lookup failed:', e.code);
            return NextResponse.json({
                verified: false,
                error: 'DNS record not found or invalid',
                details: e.code
            });
        }

    } catch (error) {
        console.error('Error verifying domain:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
