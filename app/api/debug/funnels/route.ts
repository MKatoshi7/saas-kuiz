import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const funnels = await prisma.funnel.findMany({
            select: {
                id: true,
                title: true,
                slug: true,
                status: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({
            total: funnels.length,
            funnels: funnels.map(f => ({
                id: f.id,
                title: f.title,
                slug: f.slug || '(sem slug)',
                status: f.status,
                urls: {
                    byId: `https://kuiz.digital/f/${f.id}`,
                    bySlug: f.slug ? `https://kuiz.digital/${f.slug}` : 'Slug não configurado',
                    subdomain: f.slug ? `https://${f.slug}.kuiz.digital` : 'Slug não configurado'
                }
            }))
        });
    } catch (error) {
        console.error('Error fetching funnels:', error);
        return NextResponse.json({ error: 'Failed to fetch funnels' }, { status: 500 });
    }
}
