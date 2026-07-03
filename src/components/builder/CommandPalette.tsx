'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBuilderStore } from '@/store/builderStore';
import {
    Search,
    Plus,
    Trash2,
    Copy,
    Undo2,
    Redo2,
    Save,
    Eye,
    Type,
    MousePointer,
    Image as ImageIcon,
    Video,
    Music,
    BarChart3,
    DollarSign,
    Clock,
    Megaphone,
    Share2,
    CheckSquare,
    Sparkles,
    ArrowRight,
} from 'lucide-react';
import { ComponentType } from '@/types/funnel';

interface CommandItem {
    id: string
    label: string
    description?: string
    icon: any
    shortcut?: string
    group: 'Navegação' | 'Componentes' | 'Ações' | 'Edição'
    action: () => void
}

const COMPONENT_ICONS: Record<string, any> = {
    'headline': Type,
    'paragraph': Type,
    'image': ImageIcon,
    'video': Video,
    'audio': Music,
    'button': MousePointer,
    'quiz-option': CheckSquare,
    'pricing': DollarSign,
    'timer': Clock,
    'argument': BarChart3,
    'social-share': Share2,
    'carousel': ImageIcon,
    'notification': Megaphone,
    'confetti': Sparkles,
    'vsl-video': Video,
    'pie-chart': BarChart3,
    'bar-chart': BarChart3,
}

export function CommandPalette() {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [activeIndex, setActiveIndex] = useState(0)
    const router = useRouter()

    const {
        undo, redo, saveFunnel, addComponent,
        duplicateComponent, deleteComponent, selectedComponentId,
        currentStepId, steps
    } = useBuilderStore()

    // Toggle com ⌘K / Ctrl+K
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault()
                setOpen((o) => !o)
            }
            if (e.key === 'Escape') setOpen(false)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [])

    useEffect(() => {
        if (open) {
            setQuery('')
            setActiveIndex(0)
        }
    }, [open])

    const componentTypes: ComponentType[] = [
        'headline', 'paragraph', 'image', 'video', 'audio', 'button',
        'quiz-option', 'pricing', 'timer', 'argument', 'social-share',
        'carousel', 'notification', 'confetti', 'vsl-video',
    ]

    const items: CommandItem[] = [
        // Navegação
        {
            id: 'nav-dashboard',
            label: 'Ir para Dashboard',
            icon: ArrowRight,
            group: 'Navegação',
            action: () => { router.push('/dashboard'); setOpen(false) }
        },
        {
            id: 'nav-admin',
            label: 'Ir para Painel Admin',
            icon: ArrowRight,
            group: 'Navegação',
            action: () => { router.push('/admin'); setOpen(false) }
        },
        {
            id: 'nav-settings',
            label: 'Configurações do Funil',
            icon: ArrowRight,
            group: 'Navegação',
            action: () => { setOpen(false) }
        },
        // Ações
        {
            id: 'act-save',
            label: 'Salvar agora',
            icon: Save,
            shortcut: '⌘S',
            group: 'Ações',
            action: () => { saveFunnel(); setOpen(false) }
        },
        {
            id: 'act-preview',
            label: 'Visualizar funil',
            icon: Eye,
            group: 'Ações',
            action: () => { window.open('/f/current', '_blank'); setOpen(false) }
        },
        {
            id: 'act-undo',
            label: 'Desfazer',
            icon: Undo2,
            shortcut: '⌘Z',
            group: 'Edição',
            action: () => { undo(); setOpen(false) }
        },
        {
            id: 'act-redo',
            label: 'Refazer',
            icon: Redo2,
            shortcut: '⌘⇧Z',
            group: 'Edição',
            action: () => { redo(); setOpen(false) }
        },
        {
            id: 'act-duplicate',
            label: 'Duplicar componente selecionado',
            icon: Copy,
            shortcut: '⌘D',
            group: 'Edição',
            action: () => { if (selectedComponentId) duplicateComponent(selectedComponentId); setOpen(false) }
        },
        {
            id: 'act-delete',
            label: 'Excluir componente selecionado',
            icon: Trash2,
            shortcut: '⌫',
            group: 'Edição',
            action: () => { if (selectedComponentId) deleteComponent(selectedComponentId); setOpen(false) }
        },
        // Componentes
        ...componentTypes.map((type) => ({
            id: `add-${type}`,
            label: `Adicionar ${type.replace('-', ' ')}`,
            icon: COMPONENT_ICONS[type] || Plus,
            group: 'Componentes' as const,
            action: () => { if (currentStepId) addComponent(type); setOpen(false) }
        })),
    ]

    const filtered = items.filter((i) => {
        if (!query) return true
        return i.label.toLowerCase().includes(query.toLowerCase())
    })

    useEffect(() => {
        setActiveIndex(0)
    }, [query])

    useEffect(() => {
        if (!open) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, filtered.length - 1)) }
            if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)) }
            if (e.key === 'Enter') { e.preventDefault(); filtered[activeIndex]?.action() }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [open, activeIndex, filtered])

    if (!open) return null

    const grouped = filtered.reduce((acc, item) => {
        (acc[item.group] = acc[item.group] || []).push(item)
        return acc
    }, {} as Record<string, CommandItem[]>)

    return (
        <div
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
        >
            <div
                className="w-full max-w-xl bg-background border border-border/60 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/60">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar ações, componentes, atalhos..."
                        className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/70 outline-none"
                    />
                    <kbd className="hidden sm:inline-flex h-5 px-1.5 items-center text-[10px] font-mono text-muted-foreground bg-secondary rounded">
                        ESC
                    </kbd>
                </div>

                <div className="max-h-[50vh] overflow-y-auto p-2">
                    {filtered.length === 0 && (
                        <div className="py-12 text-center text-sm text-muted-foreground">
                            Nenhum resultado encontrado
                        </div>
                    )}
                    {Object.entries(grouped).map(([group, items]) => (
                        <div key={group} className="mb-2">
                            <p className="px-2.5 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                {group}
                            </p>
                            {items.map((item) => {
                                const globalIdx = filtered.indexOf(item)
                                const isActive = globalIdx === activeIndex
                                const Icon = item.icon
                                return (
                                    <button
                                        key={item.id}
                                        onClick={item.action}
                                        onMouseEnter={() => setActiveIndex(globalIdx)}
                                        className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm text-left transition-colors ${
                                            isActive ? 'bg-secondary' : ''
                                        }`}
                                    >
                                        <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                                        <span className="flex-1 truncate">{item.label}</span>
                                        {item.shortcut && (
                                            <kbd className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                                                {item.shortcut}
                                            </kbd>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    ))}
                </div>

                <div className="border-t border-border/60 bg-secondary/30 px-4 py-2 flex items-center justify-between text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <kbd className="font-mono">↑</kbd>
                            <kbd className="font-mono">↓</kbd> navegar
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="font-mono">↵</kbd> selecionar
                        </span>
                    </div>
                    <span>Kuiz ⌘K</span>
                </div>
            </div>
        </div>
    )
}
