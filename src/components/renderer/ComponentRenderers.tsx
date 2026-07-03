'use client';

import { FunnelComponentData } from '@/types/funnel'

/**
 * Wrappers que encapsulam os renderers existentes, satisfazendo o type-check
 * (cada renderer tem assinatura diferente: `block`, `component`, `data`).
 *
 * Qualquer ajuste visual deve ser feito aqui para garantir que o
 * preview e a página publicada fiquem em sincronia.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const any = (v: any) => v

// === Text ===
export function HeadlineRenderer({ component }: { component: FunnelComponentData }) {
    const C = require('./UnifiedTextRenderer').UnifiedTextRenderer as any
    return <C component={component} />
}

export function ParagraphRenderer({ component }: { component: FunnelComponentData }) {
    const C = require('./UnifiedTextRenderer').UnifiedTextRenderer as any
    return <C component={component} />
}

export function ButtonRenderer({ component }: { component: FunnelComponentData; theme?: any }) {
    const C = require('./DelayedButton').DelayedButton as any
    return <C component={component} />
}

// === Media ===
export function ImageRenderer({ component }: { component: FunnelComponentData }) {
    const data = component.data as any
    if (!data?.url) {
        return (
            <div className="rounded-2xl border-2 border-dashed border-border bg-secondary/30 aspect-video flex items-center justify-center text-muted-foreground text-sm">
                Imagem não configurada
            </div>
        )
    }
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={data.url} alt={data.alt || ''} loading="lazy" className="w-full h-auto rounded-2xl" />
    )
}

export function VideoRenderer({ component }: { component: FunnelComponentData }) {
    const data = component.data as any
    if (!data?.url) {
        return (
            <div className="rounded-2xl border-2 border-dashed border-border bg-secondary/30 aspect-video flex items-center justify-center text-muted-foreground text-sm">
                Vídeo não configurado
            </div>
        )
    }
    if (data.provider === 'youtube' || (data.url || '').includes('youtube')) {
        return (
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black">
                <iframe
                    src={data.url}
                    title={data.alt || 'Video'}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                />
            </div>
        )
    }
    return <video src={data.url} controls className="w-full h-auto rounded-2xl" preload="metadata" />
}

export function AudioPlayerPreview({ component }: { component: FunnelComponentData }) {
    const C = require('./AudioPlayer').AudioPlayer as any
    return <C component={component} />
}

// === Quiz ===
export function QuizOptionsPreview({ component }: { component: FunnelComponentData }) {
    const C = require('./QuizOptionsRenderer').QuizOptionsRenderer as any
    return <C component={component} />
}

// === Pricing ===
export function PricingPreview({ component }: { component: FunnelComponentData }) {
    const C = require('./PricingRenderer').PricingRenderer as any
    return <C component={component} />
}

// === Timer ===
export function TimerPreview({ component }: { component: FunnelComponentData }) {
    const C = require('./TimerRenderer').TimerRenderer as any
    return <C component={component} />
}

// === Argument ===
export function ArgumentPreview({ component }: { component: FunnelComponentData }) {
    const C = require('./FunnelArgumentRenderer').ArgumentRenderer as any
    return <C component={component} />
}

// === Carousel ===
export function CarouselPreview({ component }: { component: FunnelComponentData }) {
    const C = require('./CarouselRenderer').CarouselRenderer as any
    return <C component={component} />
}

// === Confetti / Notification / Social / Animated Counter ===
export function ConfettiPreview({ component }: { component: FunnelComponentData }) {
    const C = require('./ConfettiRenderer').ConfettiRenderer as any
    return <C component={component} />
}

export function NotificationPreview({ component }: { component: FunnelComponentData }) {
    const C = require('./NotificationRenderer').NotificationRenderer as any
    return <C component={component} />
}

export function SocialSharePreview({ component }: { component: FunnelComponentData }) {
    const C = require('./SocialShareRenderer').SocialShareRenderer as any
    return <C component={component} />
}

export function AnimatedCounterPreview({ component }: { component: FunnelComponentData }) {
    const C = require('./AnimatedCounterRenderer').AnimatedCounterRenderer as any
    return <C component={component} />
}

// === VSL / WhatsApp Audio ===
export function VSLPreview({ component }: { component: FunnelComponentData }) {
    const C = require('./VSLVideo').VSLVideo as any
    return <C component={component} />
}

export function WhatsAppAudioPreview({ component }: { component: FunnelComponentData }) {
    const C = require('./WhatsAppAudio').WhatsAppAudioPlayer as any
    return <C component={component} />
}

// === Spacer / Input ===
export function SpacerRenderer({ component }: { component: FunnelComponentData }) {
    const data = component.data as any
    return <div style={{ height: data?.height || 24 }} aria-hidden />
}

export function InputRenderer({ component }: { component: FunnelComponentData }) {
    const data = component.data as any
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-medium block text-foreground">
                {data?.label || 'Campo'}
                {data?.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <input
                type={data?.inputType || 'text'}
                placeholder={data?.placeholder || ''}
                disabled
                className="w-full h-11 rounded-xl border border-border bg-background px-3.5 text-sm outline-none"
            />
        </div>
    )
}
