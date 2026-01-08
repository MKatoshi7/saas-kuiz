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

    // Helper to generate pattern CSS
    const getPatternStyle = () => {
        if (theme.page.type !== 'pattern') return {};

        const color = theme.page.patternColor || '#000000';
        const opacity = 0.1; // Fixed opacity for pattern elements
        const bg = theme.page.backgroundColor || '#ffffff';

        // Convert hex to rgba for pattern elements
        const rgba = (hex: string, alpha: number) => {
            // Simple hex to rgba conversion for pattern
            let r = 0, g = 0, b = 0;
            if (hex.length === 4) {
                r = parseInt(hex[1] + hex[1], 16);
                g = parseInt(hex[2] + hex[2], 16);
                b = parseInt(hex[3] + hex[3], 16);
            } else if (hex.length === 7) {
                r = parseInt(hex.slice(1, 3), 16);
                g = parseInt(hex.slice(3, 5), 16);
                b = parseInt(hex.slice(5, 7), 16);
            }
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        const c = rgba(color, opacity);

        switch (theme.page.patternName) {
            case 'grid':
                return {
                    backgroundColor: bg,
                    backgroundImage: `linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px)`,
                    backgroundSize: '20px 20px'
                };
            case 'dots':
                return {
                    backgroundColor: bg,
                    backgroundImage: `radial-gradient(${c} 1px, transparent 1px)`,
                    backgroundSize: '20px 20px'
                };
            case 'diagonal':
                return {
                    backgroundColor: bg,
                    backgroundImage: `repeating-linear-gradient(45deg, ${c}, ${c} 1px, transparent 1px, transparent 10px)`
                };
            case 'squares':
                return {
                    backgroundColor: bg,
                    backgroundImage: `linear-gradient(45deg, ${c} 25%, transparent 25%, transparent 75%, ${c} 75%, ${c}), linear-gradient(45deg, ${c} 25%, transparent 25%, transparent 75%, ${c} 75%, ${c})`,
                    backgroundPosition: '0 0, 10px 10px',
                    backgroundSize: '20px 20px'
                };
            case 'cross':
                return {
                    backgroundColor: bg,
                    backgroundImage: `radial-gradient(circle, transparent 20%, ${bg} 20%, ${bg} 80%, transparent 80%, transparent), radial-gradient(circle, transparent 20%, ${bg} 20%, ${bg} 80%, transparent 80%, transparent) 25px 25px, linear-gradient(${c} 2px, transparent 2px) 0 -1px, linear-gradient(90deg, ${c} 2px, transparent 2px) -1px 0`,
                    backgroundSize: '50px 50px, 50px 50px, 25px 25px, 25px 25px'
                };
            case 'waves':
                return {
                    backgroundColor: bg,
                    backgroundImage: `repeating-radial-gradient(circle at 0 0, transparent 0, ${bg} 10px), repeating-linear-gradient(${c}, ${c})`
                };
            case 'noise':
                return {
                    backgroundColor: bg,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E")`
                };
            default:
                return { backgroundColor: bg };
        }
    };

    const patternStyle = getPatternStyle();

    // 2. Define Dynamic CSS Variables
    const dynamicStyles = {
        '--primary': theme.primaryColor,
        '--font-main': theme.fontFamily,
        '--text-color': theme.textColor || '#1f2937',

        // Page Background
        '--page-bg': theme.page.type === 'image' ? `url(${theme.page.value})` : theme.page.type === 'pattern' ? patternStyle.backgroundColor : theme.page.value,

        // Container
        '--box-bg': theme.container.backgroundColor,
        '--box-bg-rgb': hexToRgbValues(theme.container.backgroundColor),
        '--box-opacity': theme.container.opacity ?? 1,
        '--box-blur': `${theme.container.blur || 0}px`,
        '--box-radius': theme.container.borderRadius,
        '--box-shadow': getShadowStyle(theme.container.shadow),
        '--box-border-width': `${theme.container.borderWidth || 0}px`,
        '--box-border-color': theme.container.borderColor || 'transparent',
        '--box-border-style': theme.container.borderStyle || 'solid',
        '--backdrop-filter': theme.container.backdropFilter !== 'none' && theme.container.backdropFilter
            ? theme.container.backdropFilter.replace('blur-', 'blur(').replace('sm', '4px').replace('md', '8px').replace('lg', '12px') + ')'
            : `blur(${theme.container.blur || 0}px)`,
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
                ...patternStyle, // Apply pattern styles directly to container
                fontFamily: 'var(--font-main), sans-serif',
                color: 'var(--text-color)',
                backgroundColor: theme.page.type === 'color' ? 'var(--page-bg)' : theme.page.type === 'pattern' ? patternStyle.backgroundColor : 'transparent'
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
                        backdropFilter: 'var(--backdrop-filter)',
                        borderRadius: 'var(--box-radius)',
                        boxShadow: 'var(--box-shadow)',
                        borderWidth: 'var(--box-border-width)',
                        borderColor: 'var(--box-border-color)',
                        borderStyle: 'var(--box-border-style)',
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
        case 'neon-green': return '0 0 10px #22c55e, 0 0 20px #22c55e40';
        case 'neon-blue': return '0 0 10px #3b82f6, 0 0 20px #3b82f640';
        case 'neon-purple': return '0 0 10px #a855f7, 0 0 20px #a855f740';
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

function hexToRgbValues(hex: string = '#000000') {
    let c: any;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length == 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',');
    }
    return '0,0,0';
}
