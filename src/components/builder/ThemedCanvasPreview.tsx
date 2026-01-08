import React from 'react';
import { FunnelTheme } from '@/types/funnel';
import { useBuilderStore } from '@/store/builderStore';

interface ThemedCanvasPreviewProps {
    children: React.ReactNode;
}

export function ThemedCanvasPreview({ children }: ThemedCanvasPreviewProps) {
    const theme = useBuilderStore((state) => state.theme);

    // Helper to convert hex to rgba
    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const showContainer = theme.container?.show ?? true;
    const showProgressBar = theme.progressBar?.show ?? true;
    const progressBarColor = theme.progressBar?.color || theme.primaryColor || '#2563EB';
    const logoUrl = theme.logo?.url;
    const logoHeight = theme.logo?.height || 40;

    // Dynamic styles based on theme
    const dynamicStyles = React.useMemo(() => ({
        '--font-main': theme.fontFamily || 'Inter',
        '--text-color': theme.textColor || '#1f2937',
        '--primary-color': theme.primaryColor || '#2563EB',
        '--page-bg': theme.page.type === 'color' ? theme.page.value : `url(${theme.page.value})`,
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
            };
            return shadowMap[theme.container.shadow || 'xl'] || shadowMap.xl;
        })(),
    } as React.CSSProperties), [theme]);

    return (
        <div
            className="min-h-full w-full flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300"
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

            {/* QUIZ CONTAINER BOX */}
            {showContainer ? (
                <div
                    className="relative z-10 w-full flex flex-col min-h-[600px] transition-all duration-300"
                    style={{
                        backgroundColor: hexToRgba(theme.container.backgroundColor, theme.container.opacity ?? 1),
                        backdropFilter: `blur(var(--box-blur))`,
                        borderRadius: 'var(--box-radius)',
                        boxShadow: 'var(--box-shadow)',
                    }}
                >
                    {/* Top Bar (Matches QuizStepLayout) */}
                    <div className="flex flex-col">
                        {/* Progress Bar at the very top if stacked */}
                        {theme.headerLayout === 'stacked' && showProgressBar && (
                            <>
                                <div className="fixed top-0 left-0 right-0 z-[60] w-full px-6 py-2 bg-white/95 backdrop-blur-sm border-b border-gray-100/50">
                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500 ease-out"
                                            style={{
                                                width: '50%',
                                                backgroundColor: progressBarColor
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
                                <div className="fixed top-0 left-0 right-0 z-[60] w-full px-6 py-2 bg-white/95 backdrop-blur-sm border-b border-gray-100/50">
                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500 ease-out"
                                            style={{
                                                width: '50%',
                                                backgroundColor: progressBarColor
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
