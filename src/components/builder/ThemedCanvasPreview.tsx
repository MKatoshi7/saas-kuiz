import React from 'react';
import { FunnelTheme } from '@/types/funnel';
import { useBuilderStore } from '@/store/builderStore';

interface ThemedCanvasPreviewProps {
    children: React.ReactNode;
}

export function ThemedCanvasPreview({ children }: ThemedCanvasPreviewProps) {
    const theme = useBuilderStore((state) => state.theme);

    // Helper to convert hex to rgba
    const hexToRgba = (hex: string = '#000000', alpha: number) => {
        let r = 0, g = 0, b = 0;

        // Handle short hex #RGB
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

    const hexToRgbValues = (hex: string = '#000000') => {
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
        return `${r}, ${g}, ${b}`;
    };

    const showContainer = theme.container?.show ?? true;
    const showProgressBar = theme.progressBar?.show ?? true;
    const progressBarColor = theme.progressBar?.color || theme.primaryColor || '#2563EB';
    const logoUrl = theme.logo?.url;
    const logoHeight = theme.logo?.height || 40;

    // Helper to generate pattern CSS
    const getPatternStyle = () => {
        if (theme.page.type !== 'pattern') return {};

        const color = theme.page.patternColor || '#000000';
        const opacity = 0.1; // Fixed opacity for pattern elements
        const bg = theme.page.backgroundColor || '#ffffff';

        // Convert hex to rgba for pattern elements
        const rgba = (hex: string, alpha: number) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
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

    // Dynamic styles based on theme
    const dynamicStyles = React.useMemo(() => ({
        '--font-main': theme.fontFamily || 'Inter',
        '--text-color': theme.textColor || '#1f2937',
        '--primary-color': theme.primaryColor || '#2563EB',
        '--page-bg': theme.page.type === 'color' ? theme.page.value : theme.page.type === 'image' ? `url(${theme.page.value})` : patternStyle.backgroundColor,
        '--box-blur': `${theme.container.blur || 0}px`,
        '--box-radius': theme.container.borderRadius || '16px',
        '--box-shadow': (() => {
            const shadowMap: Record<string, string> = {
                none: 'none',
                sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
                'neon-green': '0 0 10px #22c55e, 0 0 20px #22c55e40',
                'neon-blue': '0 0 10px #3b82f6, 0 0 20px #3b82f640',
                'neon-purple': '0 0 10px #a855f7, 0 0 20px #a855f740',
            };
            return shadowMap[theme.container.shadow || 'xl'] || shadowMap.xl;
        })(),
        '--box-border-width': `${theme.container.borderWidth || 0}px`,
        '--box-border-color': theme.container.borderColor || 'transparent',
        '--box-border-style': theme.container.borderStyle || 'solid',
        '--backdrop-filter': theme.container.backdropFilter !== 'none' && theme.container.backdropFilter
            ? theme.container.backdropFilter.replace('blur-', 'blur(').replace('sm', '4px').replace('md', '8px').replace('lg', '12px') + ')'
            : `blur(${theme.container.blur || 0}px)`,
        '--box-bg': theme.container.backgroundColor,
        '--box-bg-rgb': hexToRgbValues(theme.container.backgroundColor),
        '--box-opacity': theme.container.opacity ?? 1,
    } as React.CSSProperties), [theme, patternStyle]);

    return (
        <div
            className="min-h-full w-full flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300"
            style={{
                ...dynamicStyles,
                ...patternStyle, // Apply pattern styles directly to container
                fontFamily: 'var(--font-main), sans-serif',
                color: 'var(--text-color)',
                // If it's a pattern, backgroundColor is handled by patternStyle
                backgroundColor: theme.page.type === 'color' ? 'var(--page-bg)' : theme.page.type === 'pattern' ? patternStyle.backgroundColor : 'transparent'
            }}
        >
            {/* Custom CSS Injection */}
            {theme.page.customCss && (
                <style dangerouslySetInnerHTML={{ __html: theme.page.customCss }} />
            )}

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

            {/* QUIZ CONTAINER BOX */}
            {showContainer ? (
                <div
                    className="relative z-10 w-full flex flex-col min-h-[600px] transition-all duration-300"
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
                    {/* Top Bar (Matches QuizStepLayout) */}
                    <div className="flex flex-col">
                        {/* Progress Bar at the very top if stacked */}
                        {theme.headerLayout === 'stacked' && showProgressBar && (
                            <>
                                <div
                                    className="fixed top-0 left-0 right-0 z-[60] w-full px-6 py-2 backdrop-blur-md transition-colors duration-300"
                                    style={{
                                        backgroundColor: hexToRgba(theme.container.backgroundColor, 0.95),
                                    }}
                                >
                                    <div className="w-full h-1.5 bg-gray-200/20 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(0,0,0,0.2)]"
                                            style={{
                                                width: '50%',
                                                backgroundColor: progressBarColor,
                                                boxShadow: `0 0 8px ${progressBarColor}`
                                            }}
                                        />
                                    </div>
                                </div>
                                {/* Spacer */}
                                <div className="h-[34px] w-full shrink-0" />
                            </>
                        )}

                        <div className="px-6 pb-2 pt-4">
                            {/* Logo */}
                            {logoUrl && (
                                <div className="flex justify-center mb-4">
                                    <img
                                        src={logoUrl}
                                        alt="Logo"
                                        style={{ height: `${logoHeight}px` }}
                                        className="max-w-full h-auto object-contain"
                                    />
                                </div>
                            )}

                            {/* Progress Bar (Default Layout) */}
                            {theme.headerLayout !== 'stacked' && showProgressBar && (
                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
                                    <div
                                        className="h-full rounded-full transition-all duration-500 ease-out"
                                        style={{
                                            width: '50%',
                                            backgroundColor: progressBarColor
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content (Matches QuizStepLayout) */}
                    <main className="flex-1 overflow-y-auto px-6 pt-8 pb-24">
                        {children}
                    </main>
                </div>
            ) : (
                <div className="relative z-10 w-full">
                    {/* Top Bar without container box */}
                    <div className="flex flex-col">
                        {/* Progress Bar at the very top if stacked */}
                        {theme.headerLayout === 'stacked' && showProgressBar && (
                            <>
                                <div
                                    className="fixed top-0 left-0 right-0 z-[60] w-full px-6 py-2 backdrop-blur-md transition-colors duration-300"
                                    style={{
                                        backgroundColor: theme.page.type === 'color' ? hexToRgba(theme.page.value, 0.95) : 'rgba(255,255,255,0.95)',
                                    }}
                                >
                                    <div className="w-full h-1.5 bg-gray-200/20 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(0,0,0,0.2)]"
                                            style={{
                                                width: '50%',
                                                backgroundColor: progressBarColor,
                                                boxShadow: `0 0 8px ${progressBarColor}`
                                            }}
                                        />
                                    </div>
                                </div>
                                {/* Spacer */}
                                <div className="h-[34px] w-full shrink-0" />
                            </>
                        )}

                        <div className="px-6 pb-2 pt-4">
                            {/* Logo */}
                            {logoUrl && (
                                <div className="flex justify-center mb-4">
                                    <img
                                        src={logoUrl}
                                        alt="Logo"
                                        style={{ height: `${logoHeight}px` }}
                                        className="max-w-full h-auto object-contain"
                                    />
                                </div>
                            )}

                            {/* Progress Bar (Default Layout) */}
                            {theme.headerLayout !== 'stacked' && showProgressBar && (
                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
                                    <div
                                        className="h-full rounded-full transition-all duration-500 ease-out"
                                        style={{
                                            width: '50%',
                                            backgroundColor: progressBarColor
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <main className="flex-1 overflow-y-auto px-6 pt-8 pb-24">
                        {children}
                    </main>
                </div>
            )}
        </div>
    );
}
