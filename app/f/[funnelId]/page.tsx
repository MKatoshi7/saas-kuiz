import prisma from '@/lib/prisma';
import FunnelPageClient from './FunnelPageClient';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Script from 'next/script';

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

import { unstable_cache } from 'next/cache';

const getFunnel = unstable_cache(
    async (funnelId: string) => {
        return await prisma.funnel.findFirst({
            where: {
                OR: [
                    { id: funnelId },
                    { slug: funnelId }
                ]
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
    },
    ['funnel-data'],
    { revalidate: 60, tags: ['funnel'] }
);

export default async function FunnelPage({ params }: { params: Promise<{ funnelId: string }> }) {
    const { funnelId } = await params;

    const funnel = await getFunnel(funnelId);

    if (!funnel) {
        notFound();
    }

    // Check for subscription expiration
    const isSubscriptionExpired = funnel.user.subscriptionEndsAt && new Date(funnel.user.subscriptionEndsAt) < new Date();
    // Also check if status is explicitly 'expired' or 'canceled' if that's how logic should work, 
    // but user specifically mentioned "quando passar o dia de renovação".

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

    const marketingConfig = funnel.marketingConfig as any;
    const fbPixelId = marketingConfig?.fbPixelId;

    return (
        <>
            {fbPixelId && (
                <Script id="facebook-pixel" strategy="afterInteractive">
                    {`
                        !function(f,b,e,v,n,t,s)
                        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                        n.queue=[];t=b.createElement(e);t.async=!0;
                        t.src=v;s=b.getElementsByTagName(e)[0];
                        s.parentNode.insertBefore(t,s)}(window, document,'script',
                        'https://connect.facebook.net/en_US/fbevents.js');
                        fbq('init', '${fbPixelId}');
                        fbq('track', 'PageView');
                    `}
                </Script>
            )}
            <FunnelPageClient
                funnelId={funnel.id}
                initialSteps={steps}
                initialComponents={componentsByStep}
                themeConfig={funnel.themeConfig as any}
                marketingConfig={marketingConfig}
            />
        </>
    );
}
