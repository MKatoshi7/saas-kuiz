import { ChevronLeft } from "lucide-react";
import { ReactNode } from "react";
import { FunnelTheme } from "@/types/funnel";

interface QuizStepLayoutProps {
    children: ReactNode;
    progress?: number;
    onBack?: () => void;
    showBack?: boolean;
    theme?: FunnelTheme;
}

export function QuizStepLayout({ children, progress = 0, onBack, showBack = true, theme }: QuizStepLayoutProps) {
    const showProgressBar = theme?.progressBar?.show ?? true;
    const progressBarColor = theme?.progressBar?.color || theme?.primaryColor || '#2563EB';
    const logoUrl = theme?.logo?.url;
    const logoHeight = theme?.logo?.height || 40;
    const isLogoSticky = theme?.logo?.isSticky;
    const isProgressBarSticky = theme?.progressBar?.isSticky;

    const headerLayout = theme?.headerLayout || 'default';

    return (
        <div className="flex flex-col min-h-[600px] font-sans text-slate-800 relative">

            {/* Progress Bar at the very top (Fixed) if stacked */}
            {headerLayout === 'stacked' && showProgressBar && (
                <>
                    <div className="fixed top-0 left-0 right-0 z-[60] w-full px-6 py-2 bg-white/95 backdrop-blur-sm border-b border-gray-100/50">
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500 ease-out"
                                style={{
                                    width: `${progress}%`,
                                    backgroundColor: progressBarColor
                                }}
                            />
                        </div>
                    </div>
                    {/* Spacer to prevent content overlap */}
                    <div className="h-[34px] w-full shrink-0" />
                </>
            )}

            {/* Logo Section */}
            {logoUrl && (
                <div className={`w-full flex justify-center py-4 px-6 bg-transparent ${isLogoSticky || headerLayout === 'stacked' ? 'sticky z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100/50' : ''}`} style={{ top: headerLayout === 'stacked' && showProgressBar ? '32px' : '0' }}>
                    <img
                        src={logoUrl}
                        alt="Logo"
                        style={{ height: `${logoHeight}px` }}
                        className="max-w-full h-auto object-contain"
                    />
                </div>
            )}

            {/* Progress Bar Section (Default Layout) */}
            {headerLayout === 'default' && showProgressBar && (
                <div className={`w-full px-6 pb-2 pt-2 ${isProgressBarSticky ? 'sticky z-40 bg-white/95 backdrop-blur-sm' : ''}`} style={{ top: isLogoSticky && logoUrl ? `${(logoHeight || 40) + 32}px` : '0' }}>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500 ease-out"
                            style={{
                                width: `${progress}%`,
                                backgroundColor: progressBarColor
                            }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Back Button & Content */}
            <div className="px-6 pb-2 pt-2 shrink-0">
                {showBack && (
                    <button onClick={onBack} className="text-gray-400 hover:text-gray-600 transition-colors -ml-2 p-2">
                        <ChevronLeft size={24} />
                    </button>
                )}
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto px-6 pt-2 pb-24">
                {children}
            </main>

        </div>
    );
}
