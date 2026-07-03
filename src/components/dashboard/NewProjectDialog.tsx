'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Template {
    id: string
    name: string
    description: string
    emoji: string
    category: string
    estimatedConversion: string
    steps: any[]
    theme: any
}

interface NewProjectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function NewProjectDialog({ open, onOpenChange }: NewProjectDialogProps) {
    const router = useRouter();
    const [step, setStep] = useState<'template' | 'details'>('template')
    const [templates, setTemplates] = useState<Template[]>([])
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const [loadingTemplates, setLoadingTemplates] = useState(false)

    useEffect(() => {
        if (!open) {
            setStep('template')
            setSelectedTemplate(null)
            setTitle('')
            setDescription('')
            return
        }
        setLoadingTemplates(true)
        fetch('/api/funnels/templates')
            .then((r) => r.json())
            .then((data) => {
                setTemplates(data.templates || [])
                // pré-seleciona o "do zero" pra ficar mais rápido
                const blank = data.templates?.find((t: Template) => t.id === 'blank-canvas')
                if (blank) setSelectedTemplate(blank)
            })
            .catch(() => toast.error('Erro ao carregar templates'))
            .finally(() => setLoadingTemplates(false))
    }, [open])

    const handleCreate = async () => {
        if (!title.trim()) {
            toast.error('Insira um nome para o projeto')
            return
        }
        setLoading(true)
        try {
            const res = await fetch('/api/funnels/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    templateId: selectedTemplate?.id === 'blank-canvas' ? undefined : selectedTemplate?.id,
                }),
            })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Erro ao criar projeto')
            }
            const data = await res.json()
            toast.success('Projeto criado!')
            onOpenChange(false)
            router.push(`/dashboard/${data.funnel.id}/builder`)
            router.refresh()
        } catch (e: any) {
            toast.error(e.message || 'Erro ao criar projeto')
        } finally {
            setLoading(false)
        }
    }

    const handleBlankCreate = async () => {
        if (!title.trim()) {
            toast.error('Insira um nome para o projeto')
            return
        }
        setLoading(true)
        try {
            const res = await fetch('/api/funnels/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description }),
            })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Erro')
            }
            const data = await res.json()
            toast.success('Projeto criado!')
            onOpenChange(false)
            router.push(`/dashboard/${data.funnel.id}/builder`)
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[640px]">
                {step === 'template' && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-blue-500" />
                                Escolha um template
                            </DialogTitle>
                            <DialogDescription>
                                Comece com um modelo otimizado ou crie do zero.
                            </DialogDescription>
                        </DialogHeader>

                        {loadingTemplates ? (
                            <div className="py-12 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto p-1">
                                {templates.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setSelectedTemplate(t)}
                                        className={cn(
                                            'text-left p-4 rounded-xl border transition-all group',
                                            selectedTemplate?.id === t.id
                                                ? 'border-foreground bg-foreground text-background'
                                                : 'border-border hover:border-foreground/30 hover:bg-secondary/50'
                                        )}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <span className="text-2xl">{t.emoji}</span>
                                            {t.id !== 'blank-canvas' && (
                                                <Badge
                                                    variant="secondary"
                                                    size="sm"
                                                    className={selectedTemplate?.id === t.id ? 'bg-background/20 text-background' : ''}
                                                >
                                                    {t.estimatedConversion}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className={cn(
                                            'font-semibold text-sm mb-0.5',
                                            selectedTemplate?.id === t.id ? 'text-background' : 'text-foreground'
                                        )}>
                                            {t.name}
                                        </p>
                                        <p className={cn(
                                            'text-xs',
                                            selectedTemplate?.id === t.id ? 'text-background/70' : 'text-muted-foreground'
                                        )}>
                                            {t.description}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}

                        <DialogFooter>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                            <Button
                                onClick={() => setStep('details')}
                                disabled={!selectedTemplate}
                                rightIcon={<ChevronRight className="w-4 h-4" />}
                            >
                                Continuar
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {step === 'details' && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Detalhes do projeto</DialogTitle>
                            <DialogDescription>
                                {selectedTemplate && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <span>{selectedTemplate.emoji}</span>
                                        Baseado em <strong>{selectedTemplate.name}</strong>
                                    </span>
                                )}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 mt-2">
                            <div className="space-y-2">
                                <Label htmlFor="title">Nome do Projeto *</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Ex: Quiz de Emagrecimento"
                                    autoFocus
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descrição (Opcional)</Label>
                                <Input
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Breve descrição do objetivo..."
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setStep('template')}>
                                ← Voltar
                            </Button>
                            <Button
                                onClick={handleCreate}
                                loading={loading}
                                disabled={!title.trim()}
                                rightIcon={!loading && <ArrowRight className="w-4 h-4" />}
                            >
                                Criar e abrir editor
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
