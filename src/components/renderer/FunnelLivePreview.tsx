'use client';

import React, { Suspense } from 'react';
import { FunnelComponentData, PricingComponent, QuizOptionComponent, ArgumentComponent } from '@/types/funnel'
import { UnifiedTextRenderer } from './UnifiedTextRenderer'
import { DelayedButton } from './DelayedButton'
import { AudioPlayer } from '@/components/renderer/AudioPlayer'
import { QuizOptionsRenderer } from './QuizOptionsRenderer'
import { PricingRenderer } from './PricingRenderer'
import { TimerRenderer } from './TimerRenderer'
import { ArgumentRenderer } from './FunnelArgumentRenderer'
import { CarouselRenderer } from './CarouselRenderer'
import { LoadingComponentRenderer } from './LoadingComponentRenderer'
import { VSLVideo } from './VSLVideo'
import { WhatsAppAudioPlayer } from './WhatsAppAudio'
import { PieChartRenderer } from './PieChartRenderer'
import { BarChartRenderer } from './BarChartRenderer'
import { Star } from 'lucide-react'
import { sanitizeAlertText, sanitizeUrl } from '@/lib/sanitize'

function ComponentSkeleton() {
    return (
        <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
    );
}

interface FunnelLivePreviewProps {
    components: FunnelComponentData[]
    theme?: any
    mode?: 'editor' | 'live'
    onSelect?: (id: string) => void
    selectedId?: string | null
}

export function FunnelLivePreview({ components, theme, mode = 'live', onSelect, selectedId }: FunnelLivePreviewProps) {
    if (!components || components.length === 0) {
        return null
    }

    return (
        <div className="flex flex-col gap-5">
            {components.map((component) => {
                const isSelected = mode === 'editor' && selectedId === component.id
                return (
                    <div
                        key={component.id}
                        onClick={(e) => {
                            if (mode === 'editor' && onSelect) {
                                e.stopPropagation()
                                onSelect(component.id)
                            }
                        }}
                        className={mode === 'editor' ? `cursor-pointer transition-all rounded-lg ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-background' : 'hover:ring-1 hover:ring-blue-400/60'}` : ''}
                    >
                        <VisualRenderer component={component} theme={theme} />
                    </div>
                )
            })}
        </div>
    )
}

/**
 * Canonical visual renderer — matches FunnelEngine's PublicComponentRenderer exactly.
 * No interactive callbacks; visual-only for preview/editor.
 */
function VisualRenderer({ component, theme }: { component: FunnelComponentData; theme?: any }) {
    const { type, data } = component as any;
    const themePrimaryColor = theme?.primaryColor || '#2563EB';

    switch (type) {
        case 'headline':
            return (
                <UnifiedTextRenderer
                    text={data.text || ''}
                    textHtml={data.textHtml}
                    textStyle={data.textStyle}
                    tag="h1"
                    fontSize={data.fontSize}
                    align={data.align}
                    color={data.color}
                    fontFamily={data.fontFamily}
                    fontWeight={data.fontWeight}
                    letterSpacing={data.letterSpacing}
                    lineHeight={data.lineHeight}
                    textTransform={data.textTransform}
                    dropShadow={data.dropShadow}
                    textStroke={data.textStroke}
                />
            );

        case 'paragraph':
            return (
                <UnifiedTextRenderer
                    text={data.text || ''}
                    textHtml={data.textHtml}
                    textStyle={data.textStyle}
                    tag="div"
                    fontSize={data.fontSize}
                    align={data.align}
                    color={data.color}
                    fontFamily={data.fontFamily}
                    fontWeight={data.fontWeight}
                    letterSpacing={data.letterSpacing}
                    lineHeight={data.lineHeight}
                    textTransform={data.textTransform}
                    dropShadow={data.dropShadow}
                    textStroke={data.textStroke}
                />
            );

        case 'button': {
            const darkenColor = (hex: string, percent: number = 30): string => {
                hex = hex.replace('#', '');
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 4), 16);
                const b = parseInt(hex.substring(4, 6), 16);
                const darken = (val: number) => Math.max(0, Math.floor(val * (1 - percent / 100)));
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

            const shadowStyles: Record<string, string> = {
                'none': '',
                'sm': 'shadow-sm',
                'md': 'shadow-md',
                'lg': 'shadow-lg',
                'xl': 'shadow-xl',
                '3d': `shadow-[0_6px_0_0_${darkenColor(buttonBgColor, 40)}] active:shadow-[0_2px_0_0_${darkenColor(buttonBgColor, 40)}] active:translate-y-1`,
                'glow': `shadow-[0_0_20px_${buttonBgColor}80]`,
            };

            const borderRadiusStyles: Record<string, string> = {
                'none': 'rounded-none',
                'sm': 'rounded-sm',
                'md': 'rounded-md',
                'lg': 'rounded-lg',
                'full': 'rounded-full',
            };

            const sizeStyles: Record<string, string> = {
                'sm': 'px-4 py-2 text-sm',
                'md': 'px-6 py-3 text-base',
                'lg': 'px-8 py-4 text-lg',
            };

            const animationStyles: Record<string, string> = {
                'none': '',
                'pulse': `animate-button-pulse-${animationSpeed}`,
                'pop': `animate-button-pop-${animationSpeed}`,
                'bounce': `animate-button-bounce-${animationSpeed}`,
                'gradient': `animate-button-gradient-${animationSpeed} bg-gradient-to-r`,
            };

            const gradientBg = animation === 'gradient'
                ? { backgroundImage: `linear-gradient(90deg, ${buttonBgColor}, ${darkenColor(buttonBgColor, 20)}, ${buttonBgColor})`, backgroundSize: '200% 100%' }
                : { backgroundColor: buttonBgColor };

            const is3D = shadow === '3d';
            const shadowStyle = is3D
                ? `0 4px 0 ${adjustColorBrightness(buttonBgColor, -20)}`
                : shadow === 'glow'
                    ? `0 0 20px ${buttonBgColor}80`
                    : undefined;
            const transformStyle = is3D ? 'translateY(-2px)' : undefined;

            return (
                <DelayedButton
                    delay={data.delay || 0}
                    onClick={() => {}}
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
        }

        case 'image':
            return (
                <div className="w-full flex justify-center">
                    <div className="rounded-lg overflow-hidden bg-gray-100 relative" style={{ width: data.width || '100%' }}>
                        {data.src ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={data.src}
                                alt={data.alt || 'Imagem do quiz'}
                                className="w-full h-auto"
                            />
                        ) : (
                            <div className="aspect-video flex items-center justify-center text-gray-400 bg-gray-50">
                                <span className="text-4xl">🖼️</span>
                            </div>
                        )}
                    </div>
                </div>
            );

        case 'video': {
            const aspectRatio = data.aspectRatio || '16:9';
            const aspectRatioClass = ({
                '16:9': 'aspect-video',
                '9:16': 'aspect-[9/16]',
                '4:3': 'aspect-[4/3]',
                '1:1': 'aspect-square',
            } as Record<string, string>)[aspectRatio] || 'aspect-video';

            const getVideoEmbedUrl = (url: string) => {
                if (!url) return '';
                const ytMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                if (ytMatch && ytMatch[1]) {
                    return `https://www.youtube.com/embed/${ytMatch[1]}?controls=0&rel=0&modestbranding=1&showinfo=0`;
                }
                const vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/);
                if (vimeoMatch && vimeoMatch[1]) {
                    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
                }
                return url;
            };

            return (
                <div className={`w-full rounded-lg overflow-hidden bg-black shadow-lg ${aspectRatioClass} relative`}>
                    {data.url ? (
                        <iframe
                            className="absolute inset-0 w-full h-full"
                            src={getVideoEmbedUrl(data.url)}
                            title="Video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/50">
                            <span className="text-4xl">🎥</span>
                        </div>
                    )}
                </div>
            );
        }

        case 'timer':
            return (
                <TimerRenderer
                    minutes={data.minutes !== undefined ? data.minutes : 5}
                    seconds={data.seconds || 0}
                    style={data.style || 'boxes'}
                    autoStart={false}
                    onComplete={() => {}}
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
                            disabled
                        />
                    ) : (
                        <div className="relative">
                            <input
                                type={data.inputType || 'text'}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder={data.placeholder}
                                disabled
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
                    audioSrc={data.url || ''}
                    playerStyle={data.playerStyle || 'modern'}
                    avatarSrc={data.avatarUrl}
                    senderName={data.senderName}
                    audioName={data.audioName}
                    autoplay={data.autoplay}
                />
            );

        case 'alert': {
            const alertType = data.type || data.variant || 'info';
            const alertStyle = data.style || 'left-border';
            const alertAnimation = data.animation || 'none';
            const alertFontSize = data.fontSize || 'sm';
            const alertPadding = data.padding || 'normal';

            const v = {
                info: { border: '#3B82F6', bg: '#EFF6FF', text: '#1E40AF', icon: 'ℹ️' },
                success: { border: '#10B981', bg: '#ECFDF5', text: '#065F46', icon: '✅' },
                warning: { border: '#F59E0B', bg: '#FFFBEB', text: '#92400E', icon: '⚠️' },
                danger: { border: '#EF4444', bg: '#FEF2F2', text: '#991B1B', icon: '🚨' },
                error: { border: '#EF4444', bg: '#FEF2F2', text: '#991B1B', icon: '🚨' },
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

            if (alertStyle === 'left-border') {
                return (
                    <div
                        className={`w-full rounded-lg ${paddingMap[alertPadding] || paddingMap.normal} ${animationClass}`}
                        style={{ backgroundColor: bgColor, borderLeft: `3px solid ${borderColor}` }}
                    >
                        <div className="flex items-start gap-3">
                            {icon && <span className="text-base leading-none mt-0.5 shrink-0" style={{ color: textColor }}>{icon}</span>}
                            <div className="flex-1 min-w-0">
                                {title && <p className={`font-semibold leading-tight mb-0.5 ${fontSizeMap[alertFontSize] || fontSizeMap.sm}`} style={{ color: textColor }}>{title}</p>}
                                {text && <div className={`${fontSizeMap[alertFontSize] || fontSizeMap.sm} leading-relaxed opacity-80`} style={{ color: textColor }} dangerouslySetInnerHTML={{ __html: sanitizeAlertText(text) }} />}
                            </div>
                        </div>
                    </div>
                );
            }
            if (alertStyle === 'subtle') {
                return (
                    <div
                        className={`w-full rounded-lg border ${paddingMap[alertPadding] || paddingMap.normal} ${animationClass}`}
                        style={{ backgroundColor: bgColor, borderColor: `${borderColor}30` }}
                    >
                        <div className="flex items-start gap-3">
                            {icon && <span className="text-base leading-none mt-0.5 shrink-0" style={{ color: textColor }}>{icon}</span>}
                            <div className="flex-1 min-w-0">
                                {title && <p className={`font-semibold leading-tight mb-0.5 ${fontSizeMap[alertFontSize] || fontSizeMap.sm}`} style={{ color: textColor }}>{title}</p>}
                                {text && <div className={`${fontSizeMap[alertFontSize] || fontSizeMap.sm} leading-relaxed opacity-80`} style={{ color: textColor }} dangerouslySetInnerHTML={{ __html: sanitizeAlertText(text) }} />}
                            </div>
                        </div>
                    </div>
                );
            }
            if (alertStyle === 'solid') {
                return (
                    <div
                        className={`w-full rounded-lg ${paddingMap[alertPadding] || paddingMap.normal} ${animationClass}`}
                        style={{ backgroundColor: borderColor }}
                    >
                        <div className="flex items-start gap-3">
                            {icon && <span className="text-base leading-none mt-0.5 shrink-0 text-white">{icon}</span>}
                            <div className="flex-1 min-w-0">
                                {title && <p className={`font-semibold leading-tight mb-0.5 text-white ${fontSizeMap[alertFontSize] || fontSizeMap.sm}`}>{title}</p>}
                                {text && <div className={`${fontSizeMap[alertFontSize] || fontSizeMap.sm} leading-relaxed text-white/90`} dangerouslySetInnerHTML={{ __html: sanitizeAlertText(text) }} />}
                            </div>
                        </div>
                    </div>
                );
            }
            // outline
            return (
                <div
                    className={`w-full rounded-lg border-2 bg-transparent ${paddingMap[alertPadding] || paddingMap.normal} ${animationClass}`}
                    style={{ borderColor }}
                >
                    <div className="flex items-start gap-3">
                        {icon && <span className="text-base leading-none mt-0.5 shrink-0" style={{ color: borderColor }}>{icon}</span>}
                        <div className="flex-1 min-w-0">
                            {title && <p className={`font-semibold leading-tight mb-0.5 ${fontSizeMap[alertFontSize] || fontSizeMap.sm}`} style={{ color: textColor }}>{title}</p>}
                            {text && <div className={`${fontSizeMap[alertFontSize] || fontSizeMap.sm} leading-relaxed opacity-80`} style={{ color: textColor }} dangerouslySetInnerHTML={{ __html: sanitizeAlertText(text) }} />}
                        </div>
                    </div>
                </div>
            );
        }

        case 'quiz-option':
            return (
                <Suspense fallback={<ComponentSkeleton />}>
                    <QuizOptionsRenderer
                        component={component as QuizOptionComponent}
                        onNext={() => {}}
                        onAnswer={() => {}}
                        theme={theme}
                    />
                </Suspense>
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
                        {[...Array(data.stars || 5)].map((_: any, i: number) => (
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
                        onSelect={() => {}}
                        theme={theme}
                    />
                </Suspense>
            );

        case 'spacer':
            return <div style={{ height: `${(component as any).data.height || 32}px` }} className="w-full" />;

        case 'loading':
            return (
                <LoadingComponentRenderer
                    data={(component as any).data}
                    onNext={() => {}}
                    onJump={() => {}}
                />
            );

        case 'carousel':
            return (
                <Suspense fallback={<ComponentSkeleton />}>
                    <CarouselRenderer
                        component={component as any}
                        onNext={() => {}}
                        onJump={() => {}}
                    />
                </Suspense>
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

        case 'whatsapp-audio':
            return (
                <WhatsAppAudioPlayer
                    audioSrc={data.url || ''}
                    avatarSrc={data.avatarUrl}
                    senderName={data.senderName}
                />
            );

        case 'code':
            return (
                <div dangerouslySetInnerHTML={{ __html: data.code || '' }} />
            );

        case 'faq': {
            const items = data.items || [];
            return (
                <div className="w-full flex flex-col items-center">
                    <div className="w-full" style={{ maxWidth: data.width || '100%' }}>
                        {data.headline && (
                            <div className="mb-8 text-center">
                                <h3 className="text-2xl font-bold" style={{ color: '#1a1a2e' }}>{data.headline}</h3>
                            </div>
                        )}
                        <div className="space-y-3">
                            {items.map((item: any, idx: number) => (
                                <div key={idx} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50">
                                        <span className="font-medium text-gray-900">{item.question}</span>
                                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        case 'footer': {
            const footerBg = data.backgroundColor || '#111827';
            const footerText = data.textColor || '#ffffff';
            const footerLinks = data.links || [];
            const footerSocialLinks = data.socialLinks || [];
            const footerBorderColor = footerText + '15';

            const platformLabels: Record<string, string> = {
                instagram: 'Instagram', facebook: 'Facebook', twitter: 'Twitter',
                youtube: 'YouTube', linkedin: 'LinkedIn',
            };

            return (
                <div className="mt-8" style={{ backgroundColor: footerBg }}>
                    <div className="border-t" style={{ borderColor: footerBorderColor }} />
                    <div className="px-6 py-8 text-center">
                        {footerLinks.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4">
                                {footerLinks.map((link: any) => (
                                    <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                                        className="text-sm transition-colors duration-200"
                                        style={{ color: footerText }}
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                        )}
                        {footerSocialLinks.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mb-5">
                                {footerSocialLinks.map((social: any) => (
                                    <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer"
                                        className="text-xs tracking-wide uppercase transition-colors duration-200"
                                        style={{ color: footerText, opacity: 0.7 }}
                                    >
                                        {platformLabels[social.platform] || social.platform}
                                    </a>
                                ))}
                            </div>
                        )}
                        <p className="text-sm leading-relaxed" style={{ color: footerText }}>
                            {data.text || '© 2024 Todos os direitos reservados'}
                        </p>
                        <div className="mt-6">
                            <a href="https://kuiz.digital" target="_blank" rel="noopener noreferrer"
                                className="text-xs transition-colors duration-200"
                                style={{ color: footerText, opacity: 0.35 }}
                            >
                                Powered by Kuiz
                            </a>
                        </div>
                    </div>
                </div>
            );
        }

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

        default:
            return null;
    }
}

function adjustColorBrightness(hex: string, percent: number): string {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }
    const num = parseInt(hex, 16);
    let r = (num >> 16) & 255;
    let g = (num >> 8) & 255;
    let b = num & 255;
    r = Math.max(0, Math.min(255, Math.floor(r * (1 + percent / 100))));
    g = Math.max(0, Math.min(255, Math.floor(g * (1 + percent / 100))));
    b = Math.max(0, Math.min(255, Math.floor(b * (1 + percent / 100))));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
