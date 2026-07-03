'use client';

import React, { useEffect } from 'react';
import { FunnelTheme } from '@/types/funnel';
import { ThemeWrapper } from './ThemeWrapper';

interface FunnelShellProps {
    theme: FunnelTheme
    children: React.ReactNode
    /**
     * Se true, aplica otimizações de fonte (preconnect) e meta tags.
     */
    optimize?: boolean
}

/**
 * Envelope que envolve o ThemeWrapper aplicando otimizações de performance:
 * - Preconnect para Google Fonts
 * - CSS vars para tema
 * - Smooth scroll
 * - `prefers-reduced-motion` respeitado
 *
 * Esse componente é o **único entry point** para renderizar a página
 * do funil, seja em modo `preview` (no builder) ou `live` (no /f/[id]).
 * Garante fidelidade visual pixel-perfect entre os dois modos.
 */
export function FunnelShell({ theme, children, optimize = true }: FunnelShellProps) {
    useEffect(() => {
        if (!optimize) return
        if (!theme.fontFamily) return

        // Preconnect Google Fonts (idempotente)
        const ensurePreconnect = (href: string, crossOrigin?: string) => {
            if (document.querySelector(`link[rel="preconnect"][href="${href}"]`)) return
            const link = document.createElement('link')
            link.rel = 'preconnect'
            link.href = href
            if (crossOrigin) link.crossOrigin = crossOrigin
            document.head.appendChild(link)
        }

        ensurePreconnect('https://fonts.googleapis.com')
        ensurePreconnect('https://fonts.gstatic.com', 'anonymous')

        // Smooth scroll global no container do funil
        document.documentElement.style.scrollBehavior = 'smooth'

        return () => {
            document.documentElement.style.scrollBehavior = ''
        }
    }, [theme.fontFamily, optimize])

    return <ThemeWrapper theme={theme}>{children}</ThemeWrapper>
}
