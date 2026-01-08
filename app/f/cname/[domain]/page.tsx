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
            user: {
                select: {
                    subscriptionEndsAt: true,
                    subscriptionStatus: true
                }
            },
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

    // Check for subscription expiration
    const isSubscriptionExpired = funnel.user.subscriptionEndsAt && new Date(funnel.user.subscriptionEndsAt) < new Date();

    if (isSubscriptionExpired) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-orange-100">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Serviço Suspenso</h1>
                    <p className="text-gray-600 mb-6">
                        Este conteúdo está temporariamente indisponível devido a pendências na assinatura do proprietário.
                    </p>
                    <div className="text-xs text-gray-400 border-t pt-4">
                        Entre em contato com o administrador do site.
                    </div>
                </div>
            </div>
        );
    }

    if (funnel.isBanned) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-red-100">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Indisponível</h1>
                    <p className="text-gray-600 mb-6">
                        Este conteúdo foi suspenso temporariamente pela plataforma.
                        {funnel.banReason && (
                            <span className="block mt-4 text-sm bg-red-50 text-red-800 p-3 rounded-lg border border-red-100 font-medium">
                                Motivo: {funnel.banReason}
                            </span>
                        )}
                    </p>
                    <div className="text-xs text-gray-400 border-t pt-4">
                        Dúvidas? Entre em contato com o suporte.
                    </div>
                </div>
            </div>
        );
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
