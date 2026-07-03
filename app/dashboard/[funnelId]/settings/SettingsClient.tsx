'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Settings, Globe, Share2, Code2, Megaphone, AlertTriangle,
    Save, Copy, Check, ExternalLink, Tag, Trash2, ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const SECTIONS: ReadonlyArray<{ id: string; label: string; icon: any; danger?: boolean }> = [
    { id: 'general', label: 'Geral', icon: Settings },
    { id: 'domain', label: 'Domínio & URL', icon: Globe },
    { id: 'tracking', label: 'Rastreamento', icon: Share2 },
    { id: 'seo', label: 'SEO & Meta', icon: Tag },
    { id: 'integrations', label: 'Integrações', icon: Code2 },
    { id: 'danger', label: 'Zona de Perigo', icon: AlertTriangle, danger: true },
]

type SectionId = 'general' | 'domain' | 'tracking' | 'seo' | 'integrations' | 'danger'

export function SettingsClient({ funnel }: { funnel: any }) {
    const router = useRouter();
    const [section, setSection] = useState<SectionId>('general')
    const [saving, setSaving] = useState(false)
    const [copied, setCopied] = useState<'url' | 'slug' | null>(null)

    const [formData, setFormData] = useState({
        title: funnel.title || '',
        slug: funnel.slug || '',
        description: funnel.description || '',
        customDomain: funnel.customDomain || '',
        marketingConfig: funnel.marketingConfig || {},
    })

    // Dirty state (alterações não salvas)
    const [initial, setInitial] = useState(formData)
    const isDirty = useMemo(() => JSON.stringify(formData) !== JSON.stringify(initial), [formData, initial])

    const copyToClipboard = (text: string, kind: 'url' | 'slug') => {
        navigator.clipboard.writeText(text)
        setCopied(kind)
        toast.success('Copiado!')
        setTimeout(() => setCopied(null), 2000)
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch(`/api/funnels/${funnel.id}/settings`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })
            if (!res.ok) throw new Error()
            toast.success('Configurações salvas!')
            setInitial(formData)
            router.refresh()
        } catch {
            toast.error('Erro ao salvar')
        } finally {
            setSaving(false)
        }
    }

    const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${formData.slug}`

    return (
        <div className="h-full overflow-y-auto bg-[#F5F5F7]">
            {/* Header */}
            <div className="sticky top-0 z-10 glass-strong border-b border-border/60">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="icon-sm">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div>
                            <p className="text-xs text-muted-foreground">Configurações</p>
                            <h1 className="text-base font-semibold">{formData.title}</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isDirty && (
                            <Badge variant="warning" dot>Alterações não salvas</Badge>
                        )}
                        <Button
                            onClick={handleSave}
                            loading={saving}
                            disabled={!isDirty}
                            leftIcon={<Save className="w-3.5 h-3.5" />}
                        >
                            Salvar
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-[220px,1fr] gap-6">
                    {/* Sidebar nav */}
                    <nav className="space-y-0.5 md:sticky md:top-20 md:self-start">
                        {SECTIONS.map((s) => {
                            const Icon = s.icon
                            const isActive = section === s.id
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => setSection(s.id as SectionId)}
                                    className={cn(
                                        'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors text-left',
                                        isActive
                                            ? s.danger
                                                ? 'bg-red-50 text-red-700'
                                                : 'bg-foreground text-background'
                                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    {s.label}
                                </button>
                            )
                        })}
                    </nav>

                    {/* Content */}
                    <div className="space-y-6">
                        {section === 'general' && (
                            <SettingsCard
                                title="Identidade do Funil"
                                description="Título e descrição que aparecem para os visitantes."
                            >
                                <div className="space-y-4">
                                    <Field label="Título">
                                        <Input
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="Ex: Quiz de Emagrecimento"
                                        />
                                    </Field>
                                    <Field label="Descrição" hint="Aparece em Open Graph e previews de redes sociais.">
                                        <Textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={3}
                                            placeholder="Uma breve descrição do seu quiz..."
                                        />
                                    </Field>
                                </div>
                            </SettingsCard>
                        )}

                        {section === 'domain' && (
                            <SettingsCard
                                title="URL & Domínio"
                                description="Como os visitantes acessam seu funil."
                            >
                                <div className="space-y-4">
                                    <Field label="Slug (URL pública)">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 flex items-center gap-0 bg-secondary/50 rounded-xl border border-border px-3 h-10">
                                                <span className="text-sm text-muted-foreground font-mono">kuiz.digital/</span>
                                                <input
                                                    value={formData.slug}
                                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                                                    className="flex-1 bg-transparent text-sm font-mono outline-none"
                                                />
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => copyToClipboard(publicUrl, 'url')}
                                                title="Copiar URL"
                                            >
                                                {copied === 'url' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </Field>
                                    <Field label="Domínio customizado" hint="Ex: quiz.seusite.com (requer plano Pro+).">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 flex items-center gap-0 bg-secondary/50 rounded-xl border border-border px-3 h-10">
                                                <span className="text-sm text-muted-foreground">https://</span>
                                                <input
                                                    value={formData.customDomain}
                                                    onChange={(e) => setFormData({ ...formData, customDomain: e.target.value.toLowerCase() })}
                                                    placeholder="quiz.seusite.com"
                                                    className="flex-1 bg-transparent text-sm font-mono outline-none"
                                                />
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1.5">
                                            Aponte o CNAME do seu domínio para <code className="font-mono text-foreground">cname.kuiz.digital</code>.
                                        </p>
                                    </Field>
                                    <div className="flex items-center gap-2 pt-2">
                                        <Link href={`/f/${funnel.id}`} target="_blank">
                                            <Button variant="outline" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                                                Testar URL
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </SettingsCard>
                        )}

                        {section === 'tracking' && (
                            <SettingsCard
                                title="Pixels & Rastreamento"
                                description="Facebook Pixel, Google Tag Manager e scripts customizados."
                            >
                                <div className="space-y-5">
                                    <Field label="Facebook Pixel ID">
                                        <Input
                                            placeholder="1234567890"
                                            value={formData.marketingConfig?.fbPixelId || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                marketingConfig: { ...formData.marketingConfig, fbPixelId: e.target.value }
                                            })}
                                        />
                                    </Field>
                                    <Field label="Facebook Access Token (CAPI)" hint="Necessário para enviar eventos via servidor.">
                                        <Input
                                            type="password"
                                            placeholder="EAAB..."
                                            value={formData.marketingConfig?.fbAccessToken || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                marketingConfig: { ...formData.marketingConfig, fbAccessToken: e.target.value }
                                            })}
                                        />
                                    </Field>
                                    <Field label="Google Tag Manager">
                                        <Input
                                            placeholder="GTM-XXXXXX"
                                            value={formData.marketingConfig?.gtmId || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                marketingConfig: { ...formData.marketingConfig, gtmId: e.target.value }
                                            })}
                                        />
                                    </Field>
                                    <div className="pt-4 border-t border-border/60">
                                        <Field label="Scripts customizados (head)" hint="UTMify, Hotjar, Microsoft Clarity, etc.">
                                            <Textarea
                                                className="font-mono text-xs"
                                                rows={6}
                                                placeholder="<!-- Cole aqui seus scripts -->"
                                                value={formData.marketingConfig?.customHeadScript || ''}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    marketingConfig: { ...formData.marketingConfig, customHeadScript: e.target.value }
                                                })}
                                            />
                                        </Field>
                                    </div>
                                    <div className="pt-4 border-t border-border/60">
                                        <Label className="mb-2 block">UTMs padrão (opcional)</Label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {(['defaultUtmSource', 'defaultUtmMedium', 'defaultUtmCampaign', 'defaultUtmContent'] as const).map((utm) => (
                                                <Field key={utm} label={utm.replace('defaultUtm', '')}>
                                                    <Input
                                                        placeholder={utm.replace('defaultUtm', 'ex: ')}
                                                        value={(formData.marketingConfig as any)?.[utm] || ''}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            marketingConfig: { ...formData.marketingConfig, [utm]: e.target.value }
                                                        })}
                                                    />
                                                </Field>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </SettingsCard>
                        )}

                        {section === 'seo' && (
                            <SettingsCard
                                title="SEO & Meta Tags"
                                description="Customize como a página aparece em redes sociais e no Google."
                            >
                                <div className="space-y-4">
                                    <Field label="Título SEO (og:title)">
                                        <Input
                                            value={formData.marketingConfig?.seoTitle || formData.title}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                marketingConfig: { ...formData.marketingConfig, seoTitle: e.target.value }
                                            })}
                                        />
                                    </Field>
                                    <Field label="Descrição SEO (og:description)">
                                        <Textarea
                                            value={formData.marketingConfig?.seoDescription || formData.description}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                marketingConfig: { ...formData.marketingConfig, seoDescription: e.target.value }
                                            })}
                                            rows={2}
                                        />
                                    </Field>
                                    <Field label="Favicon URL">
                                        <Input
                                            placeholder="https://..."
                                            value={formData.marketingConfig?.favicon || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                marketingConfig: { ...formData.marketingConfig, favicon: e.target.value }
                                            })}
                                        />
                                    </Field>
                                </div>
                            </SettingsCard>
                        )}

                        {section === 'integrations' && (
                            <SettingsCard
                                title="Integrações"
                                description="Conecte seu funil a ferramentas externas."
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                        { name: 'Mailchimp', emoji: '🐵', status: 'available' },
                                        { name: 'ConvertKit', emoji: '🥬', status: 'available' },
                                        { name: 'ActiveCampaign', emoji: '📣', status: 'available' },
                                        { name: 'Hotmart', emoji: '🛒', status: 'available' },
                                        { name: 'Kiwify', emoji: '🥝', status: 'available' },
                                        { name: 'Zapier', emoji: '⚡', status: 'available' },
                                    ].map((i) => (
                                        <div key={i.name} className="flex items-center justify-between p-3 rounded-xl border border-border/60 hover:border-foreground/30 transition-colors">
                                            <div className="flex items-center gap-2.5">
                                                <span className="text-xl">{i.emoji}</span>
                                                <span className="text-sm font-medium">{i.name}</span>
                                            </div>
                                            <Button size="sm" variant="outline">Conectar</Button>
                                        </div>
                                    ))}
                                </div>
                            </SettingsCard>
                        )}

                        {section === 'danger' && (
                            <Card className="border-red-200 bg-red-50/30">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-red-700">Zona de Perigo</CardTitle>
                            <CardDescription>Ações irreversíveis. Proceda com cuidado.</CardDescription>
                        </div>
                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <DangerAction
                                        title="Excluir funil permanentemente"
                                        description="Todos os dados, leads e estatísticas serão perdidos para sempre."
                                        action={
                                            <Button variant="destructive" leftIcon={<Trash2 className="w-3.5 h-3.5" />}>
                                                Excluir funil
                                            </Button>
                                        }
                                    />
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function SettingsCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <Label className="text-sm">{label}</Label>
            {children}
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
    )
}

function DangerAction({ title, description, action }: { title: string; description: string; action: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-background border border-red-200/60">
            <div>
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
            {action}
        </div>
    )
}
