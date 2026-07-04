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
import Image from 'next/image';
import { sanitizeAlertText, sanitizeUrl } from '@/lib/sanitize';
import { TimerRenderer } from './TimerRenderer';
import { SocialProofRenderer } from './SocialProofRenderer';
import { WhatsAppButtonRenderer } from './WhatsAppButtonRenderer';
import { OfferRenderer } from './OfferRenderer';

// Lazy load heavy components
const QuizOptionsRenderer = lazy(() => import('./QuizOptionsRenderer').then(m => ({ default: m.QuizOptionsRenderer })));
const ArgumentRenderer = lazy(() => import('./FunnelArgumentRenderer').then(m => ({ default: m.ArgumentRenderer })));
const PricingRenderer = lazy(() => import('./PricingRenderer').then(m => ({ default: m.PricingRenderer })));
const CarouselRenderer = lazy(() => import('./CarouselRenderer').then(m => ({ default: m.CarouselRenderer })));
const PieChartRenderer = lazy(() => import('./PieChartRenderer').then(m => ({ default: m.PieChartRenderer })));
const BarChartRenderer = lazy(() => import('./BarChartRenderer').then(m => ({ default: m.BarChartRenderer })));

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
    branchRules?: Array<{
        id: string;
        condition: { field: string; op: string; value?: string };
        targetStepId: string;
        label?: string;
    }>;
    defaultNextStepId?: string;
}

function evaluateBranchRules(
    branchRules: Array<{ condition: { field: string; op: string; value?: string }; targetStepId: string }>,
    answers: Record<string, any>,
    defaultNextStepId?: string
): string | null {
    if (!branchRules || branchRules.length === 0) return null;

    for (const rule of branchRules) {
        const answer = answers[rule.condition.field];
        let matches = false;

        switch (rule.condition.op) {
            case 'equals':
                matches = String(answer ?? '').toLowerCase() === String(rule.condition.value ?? '').toLowerCase();
                break;
            case 'not_equals':
                matches = String(answer ?? '').toLowerCase() !== String(rule.condition.value ?? '').toLowerCase();
                break;
            case 'contains':
                matches = String(answer ?? '').toLowerCase().includes(String(rule.condition.value ?? '').toLowerCase());
                break;
            case 'greater_than':
                matches = Number(answer) > Number(rule.condition.value);
                break;
            case 'less_than':
                matches = Number(answer) < Number(rule.condition.value);
                break;
            case 'is_empty':
                matches = !answer || String(answer).trim() === '';
                break;
            case 'is_not_empty':
                matches = !!answer && String(answer).trim() !== '';
                break;
        }

        if (matches) {
            return rule.targetStepId;
        }
    }

    return defaultNextStepId || null;
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
    answers?: Record<string, any>; // Respostas para variáveis dinâmicas
}

export function FunnelEngine({ funnelId, steps, componentsByStep, onStepChange, onAnswer, onComplete, theme, initialStepIndex = 0, answers = {} }: FunnelEngineProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(initialStepIndex);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const currentStep = steps[currentStepIndex];
    const components = currentStep ? componentsByStep[currentStep.id] || [] : [];

    // Interpola variáveis {variableName} no texto usando respostas anteriores
    const interpolateText = (text: string): string => {
        if (!text || !answers) return text;
        return text.replace(/\{([^}]+)\}/g, (match, varName) => {
            const trimmed = varName.trim();
            // Busca direta pelo nome da variável
            if (answers[trimmed] !== undefined) {
                return String(answers[trimmed]);
            }
            // Busca por stepId (fallback)
            const step = steps.find(s => s.id === trimmed || s.title.toLowerCase() === trimmed.toLowerCase());
            if (step && answers[step.id] !== undefined) {
                return String(answers[step.id]);
            }
            // Retorna o match original se não encontrar
            return match;
        });
    };

    const handleNext = () => {
        if (currentStepIndex < steps.length - 1) {
            // 1. Start fade-out
            setIsTransitioning(true);

            // 2. Wait for fade-out to complete
            setTimeout(() => {
                // 3. Check branching rules before advancing
                const currentStepData = steps[currentStepIndex];
                if (currentStepData?.branchRules && currentStepData.branchRules.length > 0) {
                    const targetStepId = evaluateBranchRules(
                        currentStepData.branchRules,
                        answers || {},
                        currentStepData.defaultNextStepId
                    );
                    if (targetStepId) {
                        const targetIndex = steps.findIndex(s => s.id === targetStepId);
                        if (targetIndex !== -1 && targetIndex !== currentStepIndex) {
                            window.scrollTo({ top: 0, behavior: 'auto' });
                            setCurrentStepIndex(targetIndex);
                            if (onStepChange) onStepChange(targetIndex);
                            requestAnimationFrame(() => {
                                setTimeout(() => {
                                    setIsTransitioning(false);
                                }, 50);
                            });
                            return;
                        }
                    }
                }

                // 4. Scroll to top immediately while invisible
                // We use 'auto' to jump instantly so the user doesn't see the scroll happening
                window.scrollTo({ top: 0, behavior: 'auto' });

                // 5. Change content
                const nextIndex = currentStepIndex + 1;
                setCurrentStepIndex(nextIndex);
                if (onStepChange) onStepChange(nextIndex);

                // 6. Start fade-in
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
                className={`space-y-4 transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'
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
                        interpolateText={interpolateText}
                    />
                ))}
            </div>
        </QuizStepLayout>
    );
}

function FaqAccordion({ items, headline, width, backgroundColor, borderColor }: { items: any[]; headline?: string; width?: string; backgroundColor?: string; borderColor?: string }) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = (idx: number) => {
        setOpenIndex(prev => (prev === idx ? null : idx));
    };

    return (
        <div className="w-full flex flex-col items-center">
            <div className="w-full" style={{ maxWidth: width || '100%' }}>
                {headline && (
                    <div className="mb-8 text-center">
                        <h3
                            className="text-2xl font-bold"
                            style={{ color: '#1a1a2e' }}
                        >
                            {headline}
                        </h3>
                    </div>
                )}
                <div className="space-y-3">
                    {items.map((item: any, idx: number) => {
                        const isOpen = openIndex === idx;
                        return (
                            <div
                                key={idx}
                                className="rounded-xl overflow-hidden transition-all duration-200"
                                style={{
                                    background: backgroundColor || 'transparent',
                                    border: `1px solid ${borderColor || '#e5e7eb'}`,
                                }}
                            >
                                <button
                                    onClick={() => toggle(idx)}
                                    className="w-full px-6 py-4 flex items-center justify-between text-left transition-colors duration-200"
                                    style={{
                                        background: isOpen
                                            ? (backgroundColor || 'rgba(249,250,251,0.6)')
                                            : 'transparent',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isOpen) e.currentTarget.style.background = 'rgba(249,250,251,0.5)';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isOpen) e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    <span className="font-semibold text-[15px] pr-4" style={{ color: '#1a1a2e' }}>
                                        <span dangerouslySetInnerHTML={{ __html: item.questionHtml || item.question }} />
                                    </span>
                                    <span
                                        className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full transition-all duration-300"
                                        style={{
                                            background: isOpen ? (borderColor || '#2563eb') : 'transparent',
                                            border: `2px solid ${isOpen ? (borderColor || '#2563eb') : (borderColor || '#d1d5db')}`,
                                            transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                                        }}
                                    >
                                        <svg
                                            width="12"
                                            height="12"
                                            viewBox="0 0 12 12"
                                            fill="none"
                                            className="transition-colors duration-300"
                                        >
                                            <path
                                                d="M6 1v10M1 6h10"
                                                stroke={isOpen ? '#ffffff' : (borderColor || '#6b7280')}
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    </span>
                                </button>
                                <div
                                    className="overflow-hidden transition-all duration-300 ease-in-out"
                                    style={{
                                        maxHeight: isOpen ? '500px' : '0px',
                                        opacity: isOpen ? 1 : 0,
                                    }}
                                >
                                    <div
                                        className="px-6 pb-5 text-[15px] leading-relaxed"
                                        style={{
                                            color: '#4b5563',
                                            borderTop: `1px solid ${borderColor || '#f3f4f6'}`,
                                            paddingTop: '14px',
                                        }}
                                    >
                                        <span dangerouslySetInnerHTML={{ __html: item.answerHtml || item.answer }} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
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
    theme,
    interpolateText
}: {
    component: FunnelComponentData;
    funnelId?: string;
    stepId?: string;
    onNext: () => void;
    onJump: (stepId: string) => void;
    onAnswer: (value: any) => void;
    onComplete?: () => void;
    theme?: any;
    interpolateText?: (text: string) => string;
}) {
    const { type, data } = component;
    const themePrimaryColor = theme?.primaryColor || '#2563EB';

    switch (type) {
        case 'headline':
            return (
                <UnifiedTextRenderer
                    text={interpolateText ? interpolateText(data.text || '') : (data.text || '')}
                    textHtml={data.textHtml}
                    textStyle={data.textStyle}
                    tag="h1"
                    fontSize={data.fontSize}
                    align={data.align}
                    color={data.color}
                    fontFamily={(data as any).fontFamily}
                    fontWeight={(data as any).fontWeight}
                    letterSpacing={(data as any).letterSpacing}
                    lineHeight={(data as any).lineHeight}
                    textTransform={(data as any).textTransform}
                    dropShadow={(data as any).dropShadow}
                    textStroke={(data as any).textStroke}
                />
            );

        case 'paragraph':
            return (
                <UnifiedTextRenderer
                    text={interpolateText ? interpolateText(data.text || '') : (data.text || '')}
                    textHtml={data.textHtml}
                    textStyle={data.textStyle}
                    tag="div"
                    fontSize={data.fontSize}
                    align={data.align}
                    color={data.color}
                    fontFamily={(data as any).fontFamily}
                    fontWeight={(data as any).fontWeight}
                    letterSpacing={(data as any).letterSpacing}
                    lineHeight={(data as any).lineHeight}
                    textTransform={(data as any).textTransform}
                    dropShadow={(data as any).dropShadow}
                    textStroke={(data as any).textStroke}
                />
            );

        case 'faq':
            return (
                <FaqAccordion
                    items={data.items || []}
                    headline={data.headline}
                    width={data.width}
                    backgroundColor={data.backgroundColor}
                    borderColor={data.borderColor}
                />
            );


        case 'code':
            const sanitizedCode = data.code || '';
            return (
                <div dangerouslySetInnerHTML={{ __html: sanitizedCode }} />
            );

        case 'loading':
            return (
                <LoadingComponentRenderer
                    data={data}
                    onNext={onNext || (() => { })}
                    onJump={onJump || (() => { })}
                />
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
                    {data.textHtml ? (
                        <span dangerouslySetInnerHTML={{ __html: interpolateText ? interpolateText(data.textHtml) : data.textHtml }} />
                    ) : (
                        interpolateText ? interpolateText(data.text || 'Continuar') : (data.text || 'Continuar')
                    )}
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
                        className="rounded-lg overflow-hidden bg-gray-100 relative"
                        style={{ width: data.width || '100%' }}
                    >
                        {data.src ? (
                            <Image
                                src={data.src}
                                alt={data.alt || 'Imagem do quiz'}
                                width={0}
                                height={0}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                style={{ width: '100%', height: 'auto' }}
                                className="w-full h-auto"
                            />
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
                <div className="relative">
                    {/* Under Construction Badge */}
                    <div className="absolute top-2 right-2 bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 rounded shadow-sm z-50 pointer-events-none">
                        EM CONSTRUÇÃO
                    </div>
                    <VSLVideo
                        url={data.url}
                        thumbnailUrl={data.thumbnailUrl}
                        autoPlay={data.autoPlay}
                        loop={data.loop}
                        showProgressBar={data.showProgressBar}
                        progressBarColor={data.progressBarColor}
                        playButtonText={data.playButtonText}
                        playButtonTextHtml={data.playButtonTextHtml}
                        playButtonColor={data.playButtonColor}
                        restartOnClick={data.restartOnClick}
                        unmuteOnClick={data.unmuteOnClick}
                        fakeProgress={data.fakeProgress}
                        fakeProgressDuration={data.fakeProgressDuration}
                    />
                </div>
            );

        case 'video':
            const aspectRatio = data.aspectRatio || '16:9';
            const aspectRatioClass = {
                '16:9': 'aspect-video',
                '9:16': 'aspect-[9/16]',
                '4:3': 'aspect-[4/3]',
                '1:1': 'aspect-square',
            }[aspectRatio] || 'aspect-video';

            const getVideoEmbedUrl = (url: string) => {
                if (!url) return '';
                // YouTube
                const ytMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                if (ytMatch && ytMatch[1]) {
                    // controls=0 hides player controls
                    // rel=0 hides related videos
                    // modestbranding=1 reduces branding
                    return `https://www.youtube.com/embed/${ytMatch[1]}?controls=0&rel=0&modestbranding=1&showinfo=0`;
                }
                // Vimeo
                const vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/);
                if (vimeoMatch && vimeoMatch[1]) {
                    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
                }
                return url;
            };

            return (
                <div className={`w-full rounded-lg overflow-hidden bg-black shadow-lg ${aspectRatioClass} relative group`}>
                    {data.url ? (
                        <>
                            <iframe
                                className="absolute inset-0 w-full h-full"
                                src={getVideoEmbedUrl(data.url)}
                                title="Video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                            {/* Note: With controls=0, clicking the video toggles play/pause natively for YouTube */}
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/50">
                            <Video className="w-16 h-16" />
                        </div>
                    )}
                </div>
            );

        case 'timer':
            return (
                <TimerRenderer
                    minutes={data.minutes !== undefined ? data.minutes : 5}
                    seconds={data.seconds || 0}
                    style={data.style || 'boxes'}
                    autoStart={data.autoStart !== false}
                    onComplete={() => {
                        if (data.onComplete === 'goto_step' && data.targetStepId) {
                            onJump(data.targetStepId);
                        }
                    }}
                    theme={theme}
                />
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
                            onBlur={(e) => onAnswer(e.target.value)}
                            onChange={(e) => onAnswer(e.target.value)}
                        />
                    ) : (
                        <div className="relative">
                            <input
                                type={data.inputType || 'text'}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder={data.placeholder}
                                onBlur={(e) => onAnswer(e.target.value)}
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
                <div className="relative">
                    <AudioPlayer
                        audioSrc={(data as any).url || ''}
                        playerStyle={(data as any).playerStyle || 'modern'}
                        avatarSrc={(data as any).avatarUrl}
                        senderName={(data as any).senderName}
                        audioName={(data as any).audioName}
                        autoplay={(data as any).autoplay}
                    />
                </div>
            );

        case 'alert': {
            const alertType = data.type || data.variant || 'info';
            const alertStyle = data.style || 'left-border';
            const alertAnimation = data.animation || 'none';
            const alertFontSize = data.fontSize || 'sm';
            const alertPadding = data.padding || 'normal';

            const v = {
                info: {
                    border: '#3B82F6', bg: '#EFF6FF', text: '#1E40AF', icon: 'ℹ️',
                },
                success: {
                    border: '#10B981', bg: '#ECFDF5', text: '#065F46', icon: '✅',
                },
                warning: {
                    border: '#F59E0B', bg: '#FFFBEB', text: '#92400E', icon: '⚠️',
                },
                danger: {
                    border: '#EF4444', bg: '#FEF2F2', text: '#991B1B', icon: '🚨',
                },
                error: {
                    border: '#EF4444', bg: '#FEF2F2', text: '#991B1B', icon: '🚨',
                },
            }[alertType as string] || { border: '#3B82F6', bg: '#EFF6FF', text: '#1E40AF', icon: 'ℹ️' };

            const icon = data.icon || v.icon;
            const title = data.title || '';
            const text = data.text || '';

            const fontSizeMap: Record<string, string> = {
                xs: 'text-xs', sm: 'text-sm', md: 'text-base', lg: 'text-lg', xl: 'text-xl',
            };
            const paddingMap: Record<string, string> = {
                sm: 'px-3 py-2', normal: 'px-4 py-3', lg: 'px-5 py-4',
            };

            const bgColor = data.backgroundColor || v.bg;
            const borderColor = data.borderColor || v.border;
            const textColor = data.textColor || v.text;

            const animationClass = alertAnimation === 'pulse' ? 'animate-pulse' : '';

            // Estilo: left-border (padrão minimalista)
            if (alertStyle === 'left-border') {
                return (
                    <div
                        className={`w-full rounded-lg ${paddingMap[alertPadding] || paddingMap.normal} ${animationClass}`}
                        style={{
                            backgroundColor: bgColor,
                            borderLeft: `3px solid ${borderColor}`,
                        }}
                    >
                        <div className="flex items-start gap-3">
                            {icon && (
                                <span className={`text-base leading-none mt-0.5 shrink-0`} style={{ color: textColor }}>
                                    {icon}
                                </span>
                            )}
                             <div className="flex-1 min-w-0">
                                {title && (
                                    <p className={`font-semibold leading-tight mb-0.5 ${fontSizeMap[alertFontSize] || fontSizeMap.sm}`}
                                       style={{ color: textColor }}>
                                        {data.titleHtml ? <span dangerouslySetInnerHTML={{ __html: interpolateText ? interpolateText(data.titleHtml) : data.titleHtml }} /> : (interpolateText ? interpolateText(title) : title)}
                                    </p>
                                )}
                                {text && (
                                    <div className={`${fontSizeMap[alertFontSize] || fontSizeMap.sm} leading-relaxed opacity-80`}
                                         style={{ color: textColor }}
                                         dangerouslySetInnerHTML={{ __html: sanitizeAlertText(interpolateText ? interpolateText(text) : text) }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                );
            }

            // Estilo: subtle
            if (alertStyle === 'subtle') {
                return (
                    <div
                        className={`w-full rounded-lg border ${paddingMap[alertPadding] || paddingMap.normal} ${animationClass}`}
                        style={{
                            backgroundColor: bgColor,
                            borderColor: `${borderColor}30`,
                        }}
                    >
                        <div className="flex items-start gap-3">
                            {icon && (
                                <span className="text-base leading-none mt-0.5 shrink-0" style={{ color: textColor }}>
                                    {icon}
                                </span>
                            )}
                             <div className="flex-1 min-w-0">
                                {title && (
                                    <p className={`font-semibold leading-tight mb-0.5 ${fontSizeMap[alertFontSize] || fontSizeMap.sm}`}
                                       style={{ color: textColor }}>
                                        {data.titleHtml ? <span dangerouslySetInnerHTML={{ __html: interpolateText ? interpolateText(data.titleHtml) : data.titleHtml }} /> : (interpolateText ? interpolateText(title) : title)}
                                    </p>
                                )}
                                {text && (
                                    <div className={`${fontSizeMap[alertFontSize] || fontSizeMap.sm} leading-relaxed opacity-80`}
                                         style={{ color: textColor }}
                                         dangerouslySetInnerHTML={{ __html: sanitizeAlertText(interpolateText ? interpolateText(text) : text) }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                );
            }

            // Estilo: solid
            if (alertStyle === 'solid') {
                return (
                    <div
                        className={`w-full rounded-lg ${paddingMap[alertPadding] || paddingMap.normal} ${animationClass}`}
                        style={{ backgroundColor: borderColor }}
                    >
                        <div className="flex items-start gap-3">
                            {icon && (
                                <span className="text-base leading-none mt-0.5 shrink-0 text-white">
                                    {icon}
                                </span>
                            )}
                            <div className="flex-1 min-w-0">
                                {title && (
                                    <p className={`font-semibold leading-tight mb-0.5 text-white ${fontSizeMap[alertFontSize] || fontSizeMap.sm}`}>
                                        {data.titleHtml ? <span dangerouslySetInnerHTML={{ __html: interpolateText ? interpolateText(data.titleHtml) : data.titleHtml }} /> : (interpolateText ? interpolateText(title) : title)}
                                    </p>
                                )}
                                {text && (
                                    <div className={`${fontSizeMap[alertFontSize] || fontSizeMap.sm} leading-relaxed text-white/90`}
                                         dangerouslySetInnerHTML={{ __html: sanitizeAlertText(interpolateText ? interpolateText(text) : text) }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                );
            }

            // Estilo: outline
            return (
                <div
                    className={`w-full rounded-lg border-2 bg-transparent ${paddingMap[alertPadding] || paddingMap.normal} ${animationClass}`}
                    style={{ borderColor: borderColor }}
                >
                    <div className="flex items-start gap-3">
                        {icon && (
                            <span className="text-base leading-none mt-0.5 shrink-0" style={{ color: borderColor }}>
                                {icon}
                            </span>
                        )}
                        <div className="flex-1 min-w-0">
                                {title && (
                                    <p className={`font-semibold leading-tight mb-0.5 ${fontSizeMap[alertFontSize] || fontSizeMap.sm}`}
                                       style={{ color: textColor }}>
                                        {data.titleHtml ? <span dangerouslySetInnerHTML={{ __html: interpolateText ? interpolateText(data.titleHtml) : data.titleHtml }} /> : (interpolateText ? interpolateText(title) : title)}
                                    </p>
                                )}
                            {text && (
                                <div className={`${fontSizeMap[alertFontSize] || fontSizeMap.sm} leading-relaxed opacity-80`}
                                     style={{ color: textColor }}
                                     dangerouslySetInnerHTML={{ __html: sanitizeAlertText(interpolateText ? interpolateText(text) : text) }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            );
        }

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
                    <p className="text-gray-600 italic mb-4">
                        &ldquo;{data.textHtml ? <span dangerouslySetInnerHTML={{ __html: data.textHtml }} /> : data.text}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                            {data.author?.charAt(0) || 'A'}
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-900">
                                {data.authorHtml ? <span dangerouslySetInnerHTML={{ __html: data.authorHtml }} /> : data.author}
                            </div>
                            {data.role && <div className="text-xs text-gray-500">
                                {data.roleHtml ? <span dangerouslySetInnerHTML={{ __html: data.roleHtml }} /> : data.role}
                            </div>}
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
            return <div style={{ height: `${component.data.height || 32}px` }} className="w-full" />;

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
            const footerLinks = data.links || [];
            const footerSocialLinks = data.socialLinks || [];
            const footerBorderColor = footerText + '15';

            const platformLabels: Record<string, string> = {
                instagram: 'Instagram',
                facebook: 'Facebook',
                twitter: 'Twitter',
                youtube: 'YouTube',
                linkedin: 'LinkedIn',
            };

            return (
                <div
                    className="mt-8"
                    style={{ backgroundColor: footerBg }}
                >
                    <div
                        className="border-t"
                        style={{ borderColor: footerBorderColor }}
                    />
                    <div className="px-6 py-8 text-center">
                        {footerLinks.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4">
                                {footerLinks.map((link: any) => (
                                    <a
                                        key={link.id}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm transition-colors duration-200"
                                        style={{ color: footerText }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.textDecoration = 'underline';
                                            e.currentTarget.style.textUnderlineOffset = '3px';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.textDecoration = 'none';
                                        }}
                                    >
                                        {link.labelHtml ? (
                                            <span dangerouslySetInnerHTML={{ __html: link.labelHtml }} />
                                        ) : (
                                            link.label
                                        )}
                                    </a>
                                ))}
                            </div>
                        )}

                        {footerSocialLinks.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mb-5">
                                {footerSocialLinks.map((social: any) => (
                                    <a
                                        key={social.id}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs tracking-wide uppercase transition-colors duration-200"
                                        style={{ color: footerText, opacity: 0.7 }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.opacity = '1';
                                            e.currentTarget.style.textDecoration = 'underline';
                                            e.currentTarget.style.textUnderlineOffset = '3px';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.opacity = '0.7';
                                            e.currentTarget.style.textDecoration = 'none';
                                        }}
                                    >
                                        {platformLabels[social.platform] || social.platform}
                                    </a>
                                ))}
                            </div>
                        )}

                        <p
                            className="text-sm leading-relaxed"
                            style={{ color: footerText }}
                        >
                            <span dangerouslySetInnerHTML={{ __html: data.textHtml || data.text || '© 2024 Todos os direitos reservados' }} />
                        </p>

                        <div className="mt-6">
                            <a
                                href="https://kuiz.digital"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs transition-colors duration-200"
                                style={{ color: footerText, opacity: 0.35 }}
                                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.6'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.35'; }}
                            >
                                Powered by Kuiz
                            </a>
                        </div>
                    </div>
                </div>
            );

        case 'pie-chart':
            return (
                <Suspense fallback={<ComponentSkeleton />}>
                    <PieChartRenderer component={component as any} />
                </Suspense>
            );

        case 'bar-chart':
            return (
                <Suspense fallback={<ComponentSkeleton />}>
                    <BarChartRenderer component={component as any} />
                </Suspense>
            );

        case 'social-proof':
            return (
                <SocialProofRenderer
                    style={data.style || 'viewing'}
                    text={data.text || ''}
                    number={data.number || 47}
                    min={data.min || 20}
                    max={data.max || 80}
                    interval={data.interval || 5}
                    icon={data.icon}
                    backgroundColor={data.backgroundColor}
                    textColor={data.textColor}
                    borderRadius={data.borderRadius}
                    textHtml={data.textHtml}
                />
            );

        case 'whatsapp-button':
            return (
                <WhatsAppButtonRenderer
                    phoneNumber={data.phoneNumber || ''}
                    message={data.message || 'Olá! Vim pelo quiz.'}
                    buttonText={data.buttonText || 'Falar no WhatsApp'}
                    buttonColor={data.buttonColor || '#25D366'}
                    textColor={data.textColor || '#FFFFFF'}
                    style={data.style || 'default'}
                    position={data.position}
                    borderRadius={data.borderRadius}
                    icon={data.icon}
                    textHtml={data.textHtml}
                />
            );

        case 'offer':
            return (
                <OfferRenderer
                    layout={data.layout}
                    microTitle={data.microTitle}
                    microTitleHtml={data.microTitleHtml}
                    microTitleStyle={data.microTitleStyle}
                    microTitleColor={data.microTitleColor}
                    productName={data.productName}
                    productNameHtml={data.productNameHtml}
                    productNameStyle={data.productNameStyle}
                    price={data.price}
                    priceHtml={data.priceHtml}
                    priceStyle={data.priceStyle}
                    originalPrice={data.originalPrice}
                    originalPriceStyle={data.originalPriceStyle}
                    subtitle={data.subtitle}
                    subtitleHtml={data.subtitleHtml}
                    subtitleStyle={data.subtitleStyle}
                    ctaText={data.ctaText}
                    ctaTextHtml={data.ctaTextHtml}
                    ctaTextStyle={data.ctaTextStyle}
                    ctaUrl={data.ctaUrl}
                    ctaColor={data.ctaColor}
                    ctaTextColor={data.ctaTextColor}
                    backgroundColor={data.backgroundColor}
                    borderColor={data.borderColor}
                    borderRadius={data.borderRadius}
                    accentColor={data.accentColor}
                />
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
