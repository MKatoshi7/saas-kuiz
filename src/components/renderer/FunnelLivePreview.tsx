'use client';

import { FunnelComponentData } from '@/types/funnel'
import {
    HeadlineRenderer,
    ParagraphRenderer,
    ButtonRenderer,
    ImageRenderer,
    VideoRenderer,
    AudioPlayerPreview,
    QuizOptionsPreview,
    PricingPreview,
    TimerPreview,
    ArgumentPreview,
    CarouselPreview,
    ConfettiPreview,
    NotificationPreview,
    SocialSharePreview,
    AnimatedCounterPreview,
    VSLPreview,
    WhatsAppAudioPreview,
    SpacerRenderer,
    InputRenderer,
} from './ComponentRenderers'
import { TextBlock } from '@/components/builder/TextBlock'
import { PieChartRenderer } from './PieChartRenderer'
import { BarChartRenderer } from './BarChartRenderer'

interface FunnelLivePreviewProps {
    components: FunnelComponentData[]
    theme?: any
    mode?: 'editor' | 'live'
    onSelect?: (id: string) => void
    selectedId?: string | null
}

/**
 * Renderer canônico de um step do funil.
 *
 * Garante que o **mesmo componente** é renderizado:
 * - Na página publicada (`/f/[id]`)
 * - No preview "live" do builder (sem controles)
 * - No editor (com contornos de seleção)
 */
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
                        {renderComponent(component, theme)}
                    </div>
                )
            })}
        </div>
    )
}

function renderComponent(component: FunnelComponentData, theme?: any) {
    const type = component.type as string

    switch (type) {
        case 'headline':
            return <HeadlineRenderer key={component.id} component={component} />
        case 'paragraph':
            return <ParagraphRenderer key={component.id} component={component} />
        case 'button':
            return <ButtonRenderer key={component.id} component={component} theme={theme} />
        case 'image':
            return <ImageRenderer key={component.id} component={component} />
        case 'video':
            return <VideoRenderer key={component.id} component={component} />
        case 'audio':
            return <AudioPlayerPreview key={component.id} component={component} />
        case 'quiz-option':
            return <QuizOptionsPreview key={component.id} component={component} />
        case 'pricing':
            return <PricingPreview key={component.id} component={component} />
        case 'timer':
            return <TimerPreview key={component.id} component={component} />
        case 'argument':
            return <ArgumentPreview key={component.id} component={component} />
        case 'carousel':
            return <CarouselPreview key={component.id} component={component} />
        case 'confetti':
            return <ConfettiPreview key={component.id} component={component} />
        case 'notification':
            return <NotificationPreview key={component.id} component={component} />
        case 'social-share':
            return <SocialSharePreview key={component.id} component={component} />
        case 'animated-counter':
            return <AnimatedCounterPreview key={component.id} component={component} />
        case 'vsl-video':
            return <VSLPreview key={component.id} component={component} />
        case 'whatsapp-audio':
            return <WhatsAppAudioPreview key={component.id} component={component} />
        case 'spacer':
            return <SpacerRenderer key={component.id} component={component} />
        case 'input':
            return <InputRenderer key={component.id} component={component} />
        case 'pie-chart':
            return <PieChartRenderer key={component.id} component={component as any} />
        case 'bar-chart':
            return <BarChartRenderer key={component.id} component={component as any} />
        default:
            return <TextBlock key={component.id} data={component.data as any} />
    }
}
