import prisma from '@/lib/prisma';
import FunnelPageClient from './FunnelPageClient';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Script from 'next/script';
import { sanitizeHeadScript, extractScriptContent } from '@/lib/sanitize';
import { FunnelBlockedScreen } from '@/components/renderer/FunnelBlockedScreen';
import { unstable_cache } from 'next/cache';

// ISR: revalida a cada 60s. Mutations devem chamar `revalidateTag('funnels')`.
export const revalidate = 60
export const dynamicParams = true

// Nota: NÃO exportamos `metadata` static aqui — geramos tudo dinamicamente
// via `generateMetadata` abaixo. O `theme-color` é injetado via <meta> no
// FunnelShell/FunnelPageClient quando relevante.

const getFunnelMetadata = unstable_cache(
    async (funnelId: string) => {
        return prisma.funnel.findFirst({
            where: { OR: [{ id: funnelId }, { slug: funnelId }] },
            select: {
                id: true,
                title: true,
                description: true,
                customDomain: true,
                isBanned: true,
                themeConfig: true,
                marketingConfig: true,
            },
        })
    },
    ['funnel-metadata'],
    { revalidate: 60, tags: ['funnels'] }
)

const getFunnelFull = unstable_cache(
    async (funnelId: string) => {
        return prisma.funnel.findFirst({
            where: { OR: [{ id: funnelId }, { slug: funnelId }] },
            include: {
                user: {
                    select: {
                        subscriptionEndsAt: true,
                        subscriptionStatus: true,
                    },
                },
                steps: {
                    include: {
                        components: {
                            orderBy: { order: 'asc' },
                        },
                    },
                    orderBy: { order: 'asc' },
                },
            },
        })
    },
    ['funnel-full'],
    { revalidate: 60, tags: ['funnels'] }
)

export async function generateMetadata({ params }: { params: Promise<{ funnelId: string }> }): Promise<Metadata> {
    const { funnelId } = await params;
    const funnel = await getFunnelMetadata(funnelId);

    if (!funnel) {
        return {
            title: 'Funil não encontrado',
            robots: { index: false, follow: false },
        };
    }

    const themeConfig = funnel.themeConfig as any;
    const marketingConfig = funnel.marketingConfig as any;
    const favicon = themeConfig?.favicon || '/favicon.ico';

    return {
        title: marketingConfig?.seoTitle || funnel.title,
        description: marketingConfig?.seoDescription || funnel.description || 'Participe deste quiz interativo!',
        icons: { icon: favicon },
        openGraph: {
            title: marketingConfig?.seoTitle || funnel.title,
            description: marketingConfig?.seoDescription || funnel.description || 'Participe deste quiz interativo!',
            type: 'website',
            images: marketingConfig?.seoImage ? [marketingConfig.seoImage] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: marketingConfig?.seoTitle || funnel.title,
            description: marketingConfig?.seoDescription || funnel.description,
            images: marketingConfig?.seoImage ? [marketingConfig.seoImage] : [],
        },
        alternates: funnel.customDomain ? { canonical: `https://${funnel.customDomain}` } : undefined,
        robots: funnel.isBanned ? { index: false, follow: false } : undefined,
    }
}

export default async function FunnelPage({ params }: { params: Promise<{ funnelId: string }> }) {
    const { funnelId } = await params;

    const funnel = await getFunnelFull(funnelId);

    if (!funnel) {
        notFound();
    }

    // Verificar assinatura
    const isSubscriptionExpired = funnel.user.subscriptionEndsAt && new Date(funnel.user.subscriptionEndsAt) < new Date();

    if (isSubscriptionExpired) {
        return (
            <FunnelBlockedScreen
                variant="warning"
                title="Serviço Suspenso"
                message="Este conteúdo está temporariamente indisponível devido a pendências na assinatura do proprietário."
                footer="Entre em contato com o administrador do site."
            />
        );
    }

    if (funnel.isBanned) {
        return (
            <FunnelBlockedScreen
                variant="danger"
                title="Acesso Indisponível"
                message="Este conteúdo foi suspenso temporariamente pela plataforma."
                reason={funnel.banReason || undefined}
                footer="Dúvidas? Entre em contato com o suporte."
            />
        );
    }

    // Transformar dados para o client
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
    const safeCustomScript = sanitizeHeadScript(marketingConfig?.customHeadScript);
    const customScriptContent = extractScriptContent(safeCustomScript);

    return (
        <>
            {/* Preconnect para origens externas críticas */}
            <>
                <link rel="preconnect" href="https://res.cloudinary.com" />
                <link rel="dns-prefetch" href="https://connect.facebook.net" />
            </>

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

            {marketingConfig?.gtmId && (
                <Script id="google-tag-manager" strategy="afterInteractive">
                    {`
                        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                        })(window,document,'script','dataLayer','${marketingConfig.gtmId}');
                    `}
                </Script>
            )}

            {customScriptContent ? (
                <Script id="kuiz-custom-head" strategy="afterInteractive">
                    {customScriptContent}
                </Script>
            ) : safeCustomScript ? (
                <div dangerouslySetInnerHTML={{ __html: safeCustomScript }} />
            ) : null}

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
