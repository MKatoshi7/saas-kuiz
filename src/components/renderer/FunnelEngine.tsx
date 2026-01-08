'use client';

import React, { useState, lazy, Suspense } from 'react';
import { FunnelComponentData, QuizOptionComponent, ArgumentComponent } from '@/types/funnel';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Video, Clock, BarChart, TextCursorInput, Loader2, CheckCircle2, Music, AlertTriangle, Star } from 'lucide-react';
import { WhatsAppAudioPlayer } from './WhatsAppAudio';
import { QuizStepLayout } from './QuizStepLayout';
import { AudioPlayer } from '@/components/renderer/AudioPlayer';
import { useLoadingTimer } from '@/hooks/useLoadingTimer';
import { UnifiedTextRenderer } from '@/components/renderer/UnifiedTextRenderer';
import { LoadingComponentRenderer } from '@/components/renderer/LoadingComponentRenderer';
import { PricingComponent } from '@/types/funnel';
import { DelayedButton } from './DelayedButton';
import { VSLVideo } from './VSLVideo';

// Lazy load heavy components
const QuizOptionsRenderer = lazy(() => import('./QuizOptionsRenderer').then(m => ({ default: m.QuizOptionsRenderer })));
const ArgumentRenderer = lazy(() => import('./FunnelArgumentRenderer').then(m => ({ default: m.ArgumentRenderer })));
const PricingRenderer = lazy(() => import('./PricingRenderer').then(m => ({ default: m.PricingRenderer })));
const CarouselRenderer = lazy(() => import('./CarouselRenderer').then(m => ({ default: m.CarouselRenderer })));

// Skeleton loader for lazy components
function ComponentSkeleton() {
    return (
        <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
    );
}

interface Step {
    id: string;
    title: string;
    order: number;
}

interface FunnelEngineProps {
    funnelId?: string; // For tracking
    steps: Step[];
    componentsByStep: Record<string, FunnelComponentData[]>;
    onStepChange?: (stepIndex: number) => void;
    onAnswer?: (stepId: string, componentId: string, value: any) => void;
    onComplete?: () => void;
    theme?: any; // FunnelTheme from parent
    initialStepIndex?: number;
}

export function FunnelEngine({ funnelId, steps, componentsByStep, onStepChange, onAnswer, onComplete, theme, initialStepIndex = 0 }: FunnelEngineProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(initialStepIndex);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const currentStep = steps[currentStepIndex];
    const components = currentStep ? componentsByStep[currentStep.id] || [] : [];

    const handleNext = () => {
        if (currentStepIndex < steps.length - 1) {
            // 1. Start fade-out
            setIsTransitioning(true);

            // 2. Wait for fade-out to complete
            setTimeout(() => {
                // 3. Scroll to top immediately while invisible
                // We use 'auto' to jump instantly so the user doesn't see the scroll happening
                window.scrollTo({ top: 0, behavior: 'auto' });

                // 4. Change content
                const nextIndex = currentStepIndex + 1;
                setCurrentStepIndex(nextIndex);
                if (onStepChange) onStepChange(nextIndex);

                // 5. Start fade-in
                // Small delay to ensure React has rendered the new step
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        setIsTransitioning(false);
                    }, 50);
                });
            }, 300); // Match or slightly exceed CSS duration (200ms)
        } else {
            if (onComplete) onComplete();
        }
    };

    const handleJump = (targetStepId: string) => {
        const stepIndex = steps.findIndex(s => s.id === targetStepId);
        if (stepIndex !== -1) {
            // 1. Start fade-out
            setIsTransitioning(true);

            // 2. Wait for fade-out
            setTimeout(() => {
                // 3. Scroll to top immediately while invisible
                window.scrollTo({ top: 0, behavior: 'auto' });

                // 4. Change content
                setCurrentStepIndex(stepIndex);
                if (onStepChange) onStepChange(stepIndex);

                // 5. Start fade-in
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        setIsTransitioning(false);
                    }, 50);
                });
            }, 300);
        }
    };

    const handleAnswer = (componentId: string, value: any) => {
        if (currentStep && onAnswer) {
            onAnswer(currentStep.id, componentId, value);
        }
    };

    if (!currentStep) {
        return <div className="text-center p-8">Funil vazio ou inválido.</div>;
    }

    return (
        <QuizStepLayout
            progress={((currentStepIndex + 1) / steps.length) * 100}
            showBack={currentStepIndex > 0}
            theme={theme}
            onBack={() => {
                if (currentStepIndex > 0) {
                    setCurrentStepIndex(currentStepIndex - 1);
                    if (onStepChange) onStepChange(currentStepIndex - 1);
                }
            }}
        >
            <div
                className={`space-y-6 transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'
                    }`}
            >
                {components.map((component) => (
                    <PublicComponentRenderer
                        key={component.id}
                        component={component}
                        funnelId={funnelId}
                        stepId={currentStep.id}
                        onNext={handleNext}
                        onJump={handleJump}
                        onAnswer={(value) => handleAnswer(component.id, value)}
                        onComplete={onComplete}
                        theme={theme}
                    />
                ))}
            </div>
        </QuizStepLayout>
    );
}

function PublicComponentRenderer({
    component,
    funnelId,
    stepId,
    onNext,
    onJump,
    onAnswer,
    onComplete,
    theme
}: {
    component: FunnelComponentData;
    funnelId?: string;
    stepId?: string;
    onNext: () => void;
    onJump: (stepId: string) => void;
    onAnswer: (value: any) => void;
    onComplete?: () => void;
    theme?: any;
}) {
    const { type, data } = component;
    const themePrimaryColor = theme?.primaryColor || '#2563EB';

    switch (type) {
        case 'headline':
            return (
                <UnifiedTextRenderer
                    text={data.text || ''}
                    tag="h1"
                    fontSize={data.fontSize}
                    align={data.align}
                    color={data.color}
                />
            );

        case 'paragraph':
            return (
                <UnifiedTextRenderer
                    text={data.text || ''}
                    tag="div"
                    fontSize={data.fontSize}
                    align={data.align}
                    color={data.color}
                />
            );

        case 'faq':
            const faqItems = data.items || [];
            return (
                <div className="w-full flex flex-col items-center">
                    <div className="w-full" style={{ maxWidth: data.width || '100%' }}>
                        {data.headline && (
                            <div className="mb-6 text-center">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {data.headline}
                                </h3>
                            </div>
                        )}
                        <div className="space-y-3">
                            {faqItems.map((item: any, idx: number) => (
                                <details key={idx} className="bg-white border border-gray-200 rounded-lg overflow-hidden group">
                                    <summary className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 list-none">
                                        <span className="font-medium text-gray-900">{item.question}</span>
                                        <div className="transition-transform duration-200 group-open:rotate-180">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </summary>
                                    <div className="px-4 pb-4 text-gray-600 border-t border-gray-100 pt-3">
                                        {item.answer}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </div>
            );

        case 'code':
            return (
                <div dangerouslySetInnerHTML={{ __html: data.code || '' }} />
            );

        case 'button':
            // Helper function to darken color for 3D shadow
            const darkenColor = (hex: string, percent: number = 30): string => {
                // Remove # if present
                hex = hex.replace('#', '');

                // Convert to RGB
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 4), 16);
                const b = parseInt(hex.substring(4, 6), 16);

                // Darken each component
                const darken = (val: number) => Math.max(0, Math.floor(val * (1 - percent / 100)));

                // Convert back to hex
                const toHex = (val: number) => val.toString(16).padStart(2, '0');
                return `#${toHex(darken(r))}${toHex(darken(g))}${toHex(darken(b))}`;
            };

            const buttonBgColor = data.styles?.backgroundColor || themePrimaryColor;
            const buttonTextColor = data.styles?.textColor || '#FFFFFF';
            const shadow = data.styles?.shadow || 'md';
            const borderRadius = data.styles?.borderRadius || 'md';
            const size = data.styles?.size || 'md';
            const animation = data.styles?.animation || 'none';
            const animationSpeed = data.styles?.animationSpeed || 'normal';

            // Shadow styles
            const shadowStyles: Record<string, string> = {
                'none': '',
                'sm': 'shadow-sm',
                'md': 'shadow-md',
                'lg': 'shadow-lg',
                'xl': 'shadow-xl',
                '3d': `shadow-[0_6px_0_0_${darkenColor(buttonBgColor, 40)}] active:shadow-[0_2px_0_0_${darkenColor(buttonBgColor, 40)}] active:translate-y-1`,
                'glow': `shadow-[0_0_20px_${buttonBgColor}80]`,
            };

            // Border radius styles
            const borderRadiusStyles: Record<string, string> = {
                'none': 'rounded-none',
                'sm': 'rounded-sm',
                'md': 'rounded-md',
                'lg': 'rounded-lg',
                'full': 'rounded-full',
            };

            // Size styles
            const sizeStyles: Record<string, string> = {
                'sm': 'px-4 py-2 text-sm',
                'md': 'px-6 py-3 text-base',
                'lg': 'px-8 py-4 text-lg',
            };

            // Animation styles - keyframes are defined below
            const animationStyles: Record<string, string> = {
                'none': '',
                'pulse': `animate-button-pulse-${animationSpeed}`,
                'pop': `animate-button-pop-${animationSpeed}`,
                'bounce': `animate-button-bounce-${animationSpeed}`,
                'gradient': `animate-button-gradient-${animationSpeed} bg-gradient-to-r`,
            };

            // Special gradient background for gradient animation
            const gradientBg = animation === 'gradient'
                ? { backgroundImage: `linear-gradient(90deg, ${buttonBgColor}, ${darkenColor(buttonBgColor, 20)}, ${buttonBgColor})`, backgroundSize: '200% 100%' }
                : { backgroundColor: buttonBgColor };

            // 3D Effect Logic
            const is3D = shadow === '3d';
            const shadowStyle = is3D
                ? `0 4px 0 ${adjustColorBrightness(buttonBgColor, -20)}` // Darker shade for 3D side
                : shadow === 'glow'
                    ? `0 0 20px ${buttonBgColor}80`
                    : undefined;

            const transformStyle = is3D ? 'translateY(-2px)' : undefined;

            return (
                <DelayedButton
                    delay={data.delay || 0}
                    onClick={() => {
                        // Track the click
                        onAnswer(data.text || 'Clicked');

                        // Handle button actions (open url, etc)
                        if (data.action === 'open_url' && data.targetUrl) {
                            window.open(data.targetUrl, '_blank');
                            if (onComplete) onComplete();
                        } else if (data.action === 'submit_funnel') {
                            if (onComplete) onComplete();
                        } else if (data.action === 'jump_to_step' && data.targetStepId) {
                            onJump(data.targetStepId);
                        } else {
                            onNext();
                        }
                    }}
                    className={`
                        w-full font-semibold transition-all
                        ${sizeStyles[size]}
                        ${borderRadiusStyles[borderRadius]}
                        ${!is3D && shadow !== 'glow' ? shadowStyles[shadow] : ''}
                        ${animationStyles[animation]}
                        hover:opacity-90
                    `}
                    style={{
                        ...gradientBg,
                        color: buttonTextColor,
                        boxShadow: shadowStyle,
                        transform: transformStyle,
                        marginBottom: is3D ? '4px' : '0',
                    }}
                >
                    {data.text || 'Continuar'}
                </DelayedButton>
            );


        case 'quiz-option':
            return (
                <Suspense fallback={<ComponentSkeleton />}>
                    <QuizOptionsRenderer
                        component={component as QuizOptionComponent}
                        funnelId={funnelId}
                        stepId={stepId}
                        onNext={onNext}
                        onAnswer={onAnswer}
                        theme={theme}
                    />
                </Suspense>
            );

        case 'image':
            return (
                <div className="w-full flex justify-center">
                    <div
                        className="rounded-lg overflow-hidden bg-gray-100"
                        style={{ width: data.width || '100%' }}
                    >
                        {data.src ? (
                            <img src={data.src} alt={data.alt || ''} className="w-full h-auto" />
                        ) : (
                            <div className="aspect-video flex items-center justify-center text-gray-400 bg-gray-50">
                                <ImageIcon className="w-12 h-12 opacity-50" />
                            </div>
                        )}
                    </div>
                </div>
            );

        case 'vsl-video':
            return (
                <VSLVideo
                    url={data.url}
                    thumbnailUrl={data.thumbnailUrl}
                    autoPlay={data.autoPlay}
                    loop={data.loop}
                    showProgressBar={data.showProgressBar}
                    progressBarColor={data.progressBarColor}
                    playButtonText={data.playButtonText}
                    playButtonColor={data.playButtonColor}
                    restartOnClick={data.restartOnClick}
                    unmuteOnClick={data.unmuteOnClick}
                    fakeProgress={data.fakeProgress}
                    fakeProgressDuration={data.fakeProgressDuration}
                />
            );

        case 'video':
            const aspectRatio = data.aspectRatio || '16:9';
            const aspectRatioClass = {
                '16:9': 'aspect-video',
                '9:16': 'aspect-[9/16]',
                '4:3': 'aspect-[4/3]',
                '1:1': 'aspect-square',
            }[aspectRatio] || 'aspect-video';

            return (
                <div className={`w-full rounded-lg overflow-hidden bg-black shadow-lg ${aspectRatioClass} relative`}>
                    {data.url ? (
                        <iframe
                            className="absolute inset-0 w-full h-full"
                            src={data.url.replace('watch?v=', 'embed/')}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/50">
                            <Video className="w-16 h-16" />
                        </div>
                    )}
                </div>
            );

        case 'timer':
            return (
                <div className="flex justify-center gap-3 text-center py-4">
                    {['05', '00'].map((val, i) => (
                        <div key={i} className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-100 min-w-[70px]">
                            <div className="text-2xl font-bold">{val}</div>
                            <div className="text-[10px] uppercase font-medium">{i === 0 ? 'Min' : 'Seg'}</div>
                        </div>
                    ))}
                </div>
            );

        case 'progressbar':
            return (
                <div className="w-full space-y-2">
                    <div className="flex justify-between text-xs font-medium text-gray-500">
                        <span>Progresso</span>
                        <span>50%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                        <div className="bg-green-500 h-3 rounded-full" style={{ width: '50%' }}></div>
                    </div>
                </div>
            );

        case 'input':
            return (
                <div className="space-y-2">
                    {data.label && <label className="block text-sm font-medium text-gray-700">{data.label}</label>}
                    {data.inputType === 'textarea' ? (
                        <textarea
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                            placeholder={data.placeholder}
                            onChange={(e) => onAnswer(e.target.value)}
                        />
                    ) : (
                        <div className="relative">
                            <input
                                type={data.inputType || 'text'}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder={data.placeholder}
                                onChange={(e) => onAnswer(e.target.value)}
                            />
                        </div>
                    )}
                </div>
            );

        case 'slider':
            return (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-gray-700">{data.label}</label>
                        <span className="text-lg font-bold text-blue-600">
                            {data.defaultValue || data.min} {data.unit}
                        </span>
                    </div>
                    <input
                        type="range"
                        min={data.min}
                        max={data.max}
                        defaultValue={data.defaultValue || data.min}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        onChange={(e) => onAnswer(e.target.value)}
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                        <span>{data.min} {data.unit}</span>
                        <span>{data.max} {data.unit}</span>
                    </div>
                </div>
            );


        case 'audio':
            return (
                <AudioPlayer
                    audioSrc={(data as any).url || ''}
                    playerStyle={(data as any).playerStyle || 'modern'}
                    avatarSrc={(data as any).avatarUrl}
                    senderName={(data as any).senderName}
                    autoplay={(data as any).autoplay}
                />
            );

        case 'alert':
            const alertType = data.type || data.variant || 'info';
            const alertStyle = data.style || 'subtle';
            const alertAnimation = data.animation || 'none';

            const alertColors = {
                info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', icon: 'text-blue-500' },
                success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', icon: 'text-green-500' },
                warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-900', icon: 'text-yellow-500' },
                error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', icon: 'text-red-500' },
                danger: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', icon: 'text-red-500' },
            };

            const colors = alertColors[alertType as keyof typeof alertColors] || alertColors.info;

            // Animation classes
            const animationClasses = {
                none: '',
                pulse: 'animate-pulse',
                shake: 'animate-shake', // Requires custom keyframe or use standard if available
                bounce: 'animate-bounce',
            };

            // Style classes
            let styleClasses = '';
            let styleStyles: React.CSSProperties = {};

            if (alertStyle === 'solid') {
                styleClasses = `text-white rounded-lg p-4 shadow-md`;
                styleStyles = {
                    backgroundColor: data.backgroundColor || (alertType === 'info' ? '#3b82f6' : alertType === 'success' ? '#22c55e' : alertType === 'warning' ? '#eab308' : '#ef4444'),
                    borderColor: 'transparent',
                    color: '#ffffff'
                };
            } else if (alertStyle === 'outline') {
                styleClasses = `border-2 rounded-lg p-4 bg-transparent`;
                styleStyles = {
                    borderColor: data.borderColor || (alertType === 'info' ? '#3b82f6' : alertType === 'success' ? '#22c55e' : alertType === 'warning' ? '#eab308' : '#ef4444'),
                    color: data.textColor || (alertType === 'info' ? '#1e40af' : alertType === 'success' ? '#166534' : alertType === 'warning' ? '#854d0e' : '#991b1b')
                };
            } else if (alertStyle === 'left-border') {
                styleClasses = `border-l-4 rounded-r-lg p-4 ${colors.bg}`;
                styleStyles = {
                    backgroundColor: data.backgroundColor,
                    borderLeftColor: data.borderColor || (alertType === 'info' ? '#3b82f6' : alertType === 'success' ? '#22c55e' : alertType === 'warning' ? '#eab308' : '#ef4444'),
                    color: data.textColor
                };
            } else {
                // Subtle (Default)
                styleClasses = `rounded-lg border ${colors.bg} ${colors.border} p-4`;
                styleStyles = {
                    backgroundColor: data.backgroundColor,
                    borderColor: data.borderColor,
                    color: data.textColor
                };
            }

            const iconPosition = data.iconPosition || 'left';
            const isIconTop = iconPosition === 'top';

            return (
                <div
                    className={`w-full ${styleClasses} ${animationClasses[alertAnimation as keyof typeof animationClasses] || ''}`}
                    style={styleStyles}
                >
                    <div className={`flex ${isIconTop ? 'flex-col items-center text-center' : 'items-start text-left'} gap-3`}>
                        {data.icon && (
                            <span className={`${isIconTop ? 'text-4xl mb-2' : 'text-xl mt-0.5'} flex-shrink-0`}>{data.icon}</span>
                        )}
                        <div className="w-full">
                            {data.title && (
                                <h4 className={`font-bold mb-1 ${isIconTop ? 'text-lg' : 'text-base'}`} style={{ color: 'inherit' }}>
                                    {data.title}
                                </h4>
                            )}
                            <div
                                className={`font-medium text-sm md:text-base ${alertStyle === 'solid' ? 'text-white' : colors.text}`}
                                style={{ color: alertStyle === 'solid' ? '#ffffff' : data.textColor }}
                                dangerouslySetInnerHTML={{ __html: data.text || 'Texto de destaque...' }}
                            />
                        </div>
                    </div>
                </div>
            );

        case 'argument':
            return (
                <Suspense fallback={<ComponentSkeleton />}>
                    <ArgumentRenderer component={component as ArgumentComponent} />
                </Suspense>
            );

        case 'testimonial':
            return (
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex gap-1 mb-3 text-yellow-400">
                        {[...Array(data.stars || 5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                    </div>
                    <p className="text-gray-600 italic mb-4">"{data.text}"</p>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                            {data.author?.charAt(0) || 'A'}
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-900">{data.author}</div>
                            {data.role && <div className="text-xs text-gray-500">{data.role}</div>}
                        </div>
                    </div>
                </div>
            );

        case 'pricing':
            return (
                <Suspense fallback={<ComponentSkeleton />}>
                    <PricingRenderer
                        component={component as PricingComponent}
                        onSelect={(value) => {
                            onAnswer(value);
                            onNext();
                        }}
                        theme={theme}
                    />
                </Suspense>
            );

        case 'spacer':
            return (
                <div className="p-2">
                    <div className="border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-xs text-gray-400" style={{ height: `${component.data.height || 32}px` }}>
                        Espaço ({component.data.height || 32}px)
                    </div>
                </div>
            );

        case 'loading':
            return (
                <LoadingComponentRenderer
                    data={data}
                    onNext={onNext}
                    onJump={onJump}
                />
            );

        case 'carousel':
            return (
                <Suspense fallback={<ComponentSkeleton />}>
                    <CarouselRenderer
                        component={component as any}
                        onNext={onNext}
                        onJump={onJump}
                    />
                </Suspense>
            );

        case 'footer':
            const footerBg = data.backgroundColor || '#111827';
            const footerText = data.textColor || '#ffffff';

            return (
                <div
                    className="p-4 text-center mt-8"
                    style={{ backgroundColor: footerBg, color: footerText }}
                >
                    <p className="text-sm">{data.text || '© 2024 Todos os direitos reservados'}</p>
                    {data.links && data.links.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-4 mt-2 text-xs">
                            {data.links.map((link: any) => (
                                <a
                                    key={link.id}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:opacity-80 transition-opacity"
                                    style={{ color: footerText }}
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            );

        default:
            return null;
    }
}

function adjustColorBrightness(hex: string, percent: number): string {
    // Remove # if present
    hex = hex.replace(/^#/, '');

    // Handle shorthand hex (#abc -> #aabbcc)
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }

    // Parse RGB values
    const num = parseInt(hex, 16);
    let r = (num >> 16) & 255;
    let g = (num >> 8) & 255;
    let b = num & 255;

    // Adjust brightness (negative = darker, positive = lighter)
    r = Math.max(0, Math.min(255, Math.floor(r * (1 + percent / 100))));
    g = Math.max(0, Math.min(255, Math.floor(g * (1 + percent / 100))));
    b = Math.max(0, Math.min(255, Math.floor(b * (1 + percent / 100))));

    // Convert back to hex
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
