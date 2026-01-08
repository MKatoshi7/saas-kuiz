'use client';

import React, { useEffect, ReactNode } from 'react';
import { FunnelTheme } from '@/types/funnel';

interface ThemeWrapperProps {
    theme: FunnelTheme;
    children: ReactNode;
}

export function ThemeWrapper({ theme, children }: ThemeWrapperProps) {
    // 1. Load Google Font
    useEffect(() => {
        if (theme.fontFamily) {
            console.log('🎨 Loading font:', theme.fontFamily);

            // Preconnect to Google Fonts
            const preconnect1 = document.createElement('link');
            preconnect1.rel = 'preconnect';
            preconnect1.href = 'https://fonts.googleapis.com';
            document.head.appendChild(preconnect1);

            const preconnect2 = document.createElement('link');
            preconnect2.rel = 'preconnect';
            preconnect2.href = 'https://fonts.gstatic.com';
            preconnect2.crossOrigin = 'anonymous';
            document.head.appendChild(preconnect2);

            // Load Font
            const link = document.createElement('link');
            link.href = `https://fonts.googleapis.com/css2?family=${theme.fontFamily.replace(/ /g, '+')}:wght@300;400;500;600;700&display=swap`;
            link.rel = 'stylesheet';
            document.head.appendChild(link);

            return () => {
                document.head.removeChild(link);
                document.head.removeChild(preconnect1);
                document.head.removeChild(preconnect2);
            };
        }
    }, [theme.fontFamily]);

    // 2. Define Dynamic CSS Variables
    const dynamicStyles = {
        '--primary': theme.primaryColor,
        '--font-main': theme.fontFamily,
        '--text-color': theme.textColor || '#1f2937',

        // Page Background
        '--page-bg': theme.page.type === 'image' ? `url(${theme.page.value})` : theme.page.value,

        // Container
        '--box-bg': theme.container.backgroundColor,
        '--box-opacity': theme.container.opacity ?? 1,
        '--box-blur': `${theme.container.blur || 0}px`,
        '--box-radius': theme.container.borderRadius,
        '--box-shadow': getShadowStyle(theme.container.shadow),
    } as React.CSSProperties;

    // Helper for RGB conversion if needed for opacity, but we use separate opacity var for now
    // or we can use rgba() if we had hex->rgb conversion. 
    // For simplicity, we apply opacity to the container background color if it's separate, 
    // but standard CSS opacity affects content too. 
    // To affect ONLY background, we need rgba.
    // Let's assume the user picks a color and we apply opacity to the div background via rgba or just opacity property (which affects content).
    // The blueprint said "Cor de Fundo da Box: Picker (com suporte a canal Alpha/Transparência)".
    // If the picker supports alpha, we don't need separate opacity slider.
    // But we added an opacity slider.
    // We will use a pseudo-element or background-color with opacity if possible.
    // For now, let's just use the hex color. If user wants transparency, they can use the slider which we will apply to `rgba` conversion or `opacity` style.
    // Actually, `hexToRgba` is better.

    const showContainer = theme.container.show ?? true;

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300"
            style={{
                ...dynamicStyles,
                fontFamily: 'var(--font-main), sans-serif',
                color: 'var(--text-color)',
                backgroundColor: theme.page.type === 'color' ? 'var(--page-bg)' : 'transparent'
            }}
        >
            {/* BACKGROUND IMAGE LAYER */}
            {theme.page.type === 'image' && (
                <div className="absolute inset-0 z-0">
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500"
                        style={{ backgroundImage: 'var(--page-bg)' }}
                    />
                    {/* Overlay */}
                    <div
                        className="absolute inset-0 bg-black transition-opacity duration-300"
                        style={{ opacity: theme.page.overlayOpacity || 0 }}
                    />
                </div>
            )}

            {/* Custom CSS Injection */}
            {theme.page.customCss && (
                <style dangerouslySetInnerHTML={{ __html: theme.page.customCss }} />
            )}

            {/* QUIZ CONTAINER BOX */}
            {showContainer ? (
                <div
                    className="relative z-10 w-full max-w-md transition-all duration-300"
                    style={{
                        backgroundColor: hexToRgba(theme.container.backgroundColor, theme.container.opacity ?? 1),
                        backdropFilter: `blur(var(--box-blur))`,
                        borderRadius: 'var(--box-radius)',
                        boxShadow: 'var(--box-shadow)',
                    }}
                >
                    {children}
                </div>
            ) : (
                <div className="relative z-10 w-full max-w-md">
                    {children}
                </div>
            )}
        </div>
    );
}

function getShadowStyle(shadow: string): string {
    switch (shadow) {
        case 'sm': return '0 1px 2px 0 rgb(0 0 0 / 0.05)';
        case 'md': return '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
        case 'lg': return '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)';
        case 'xl': return '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)';
        case 'none': default: return 'none';
    }
}

function hexToRgba(hex: string, alpha: number): string {
    let c: any;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length == 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + alpha + ')';
    }
    return hex;
}
