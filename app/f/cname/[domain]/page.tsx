import prisma from '@/lib/prisma';
import FunnelPageClient from '../../[funnelId]/FunnelPageClient';
import { notFound } from 'next/navigation';

export default async function CustomDomainPage({ params }: { params: Promise<{ domain: string }> }) {
    const { domain } = await params;

    // Remove port if present
    const hostname = domain.split(':')[0];

    let slug: string | null = null;

    // Check for subdomain
    if (hostname.endsWith('.kuiz.digital')) {
        slug = hostname.replace('.kuiz.digital', '');
    } else if (hostname.endsWith('.localhost')) {
        slug = hostname.replace('.localhost', '');
    } else {
        // It's a custom domain
        const funnelByDomain = await prisma.funnel.findUnique({
            where: {
                customDomain: hostname
            }
        });

        if (funnelByDomain) {
            slug = funnelByDomain.slug;
        }
    }

    if (!slug) {
        return notFound();
    }

    const funnel = await prisma.funnel.findUnique({
        where: {
            slug: slug
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
        return notFound();
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
