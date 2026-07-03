'use client';

import { Type, MousePointer, HelpCircle, UploadCloud, Sparkles } from 'lucide-react'
import { useBuilderStore } from '@/store/builderStore'
import type { ComponentType } from '@/types/funnel'

export function EmptyCanvasState() {
    const { addComponent, currentStepId } = useBuilderStore()

    const cards: Array<{
        icon: any
        title: string
        description: string
        type: ComponentType
        color: string
    }> = [
        {
            icon: Type,
            title: 'Comece com texto',
            description: 'Título + descrição para apresentar o funil',
            type: 'headline',
            color: 'bg-blue-50 text-blue-600',
        },
        {
            icon: HelpCircle,
            title: 'Adicione uma pergunta',
            description: 'Quiz-option para capturar respostas',
            type: 'quiz-option',
            color: 'bg-purple-50 text-purple-600',
        },
        {
            icon: MousePointer,
            title: 'Botão de ação',
            description: 'CTA para próxima etapa ou link externo',
            type: 'button',
            color: 'bg-emerald-50 text-emerald-600',
        },
    ]

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 py-12 animate-fade-in-up">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl blur-2xl opacity-20" />
                <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-8 h-8 text-white" />
                </div>
            </div>
            <h3 className="text-lg font-semibold text-foreground">Comece sua etapa</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm text-balance">
                Escolha um dos atalhos abaixo ou arraste componentes da barra lateral
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 w-full max-w-2xl">
                {cards.map((card) => {
                    const Icon = card.icon
                    return (
                        <button
                            key={card.type}
                            onClick={() => currentStepId && addComponent(card.type)}
                            className="group bg-background border border-border/60 rounded-2xl p-4 text-left hover:border-foreground/30 hover:shadow-pop hover:-translate-y-0.5 transition-all"
                        >
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${card.color} group-hover:scale-110 transition-transform`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <p className="text-sm font-semibold text-foreground">{card.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{card.description}</p>
                        </button>
                    )
                })}
            </div>

            <p className="text-[11px] text-muted-foreground mt-6 flex items-center gap-1.5">
                <UploadCloud className="w-3 h-3" />
                Ou arraste da barra à esquerda
            </p>
        </div>
    )
}
