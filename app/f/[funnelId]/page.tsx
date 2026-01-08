import prisma from '@/lib/prisma';
import FunnelPageClient from './FunnelPageClient';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ funnelId: string }> }): Promise<Metadata> {
    const { funnelId } = await params;
    const funnel = await prisma.funnel.findFirst({
        where: {
            OR: [
                { id: funnelId },
                { slug: funnelId }
            ]
        }
    });

    if (!funnel) {
        return {
            title: 'Funnel Not Found'
        };
    }

    const themeConfig = funnel.themeConfig as any;
    const favicon = themeConfig?.favicon || '/favicon.ico';

    return {
        title: funnel.title,
        description: funnel.description || 'Participate in this interactive quiz!',
        icons: {
            icon: favicon,
        },
        openGraph: {
            title: funnel.title,
            description: funnel.description || 'Participate in this interactive quiz!',
            type: 'website',
        }
    };
}

export default async function FunnelPage({ params }: { params: Promise<{ funnelId: string }> }) {
    const { funnelId } = await params;

    const funnel = await prisma.funnel.findFirst({
        where: {
            OR: [
                { id: funnelId },
                { slug: funnelId }
            ]
        },
        include: {
            steps: {
                include: {
                    components: {
                        orderBy: { order: 'asc' }
                    }
                },
                orderBy: { order: 'asc' }
            }
        }
    });

    if (!funnel) {
        notFound();
    }

    // Transform data for the client
    const componentsByStep: Record<string, any[]> = {};
    funnel.steps.forEach((step: any) => {
        componentsByStep[step.id] = step.components.map((c: any) => ({
            id: c.id,
            type: c.type,
            order: c.order,
            data: c.data as any
        }));
    });

    const steps = funnel.steps.map((s: any) => ({
        id: s.id,
        title: s.title,
        order: s.order
    }));

    return (
        <FunnelPageClient
            funnelId={funnel.id}
            initialSteps={steps}
            initialComponents={componentsByStep}
            themeConfig={funnel.themeConfig as any}
        />
    );
}
