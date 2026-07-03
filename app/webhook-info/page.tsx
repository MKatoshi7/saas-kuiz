import type { Metadata } from 'next'
import { Webhook, Copy, Check, ExternalLink, ArrowRight, Code2 } from 'lucide-react'
import { CopyButton } from './CopyButton'

export const metadata: Metadata = {
    title: 'Configurar Webhook — Kuiz',
    description: 'Como receber pagamentos do Cakto, Stripe, Hotmart, Kiwify, Eduzz no Kuiz via webhook.',
}

const providers = [
    {
        id: 'cakto',
        name: 'Cakto',
        color: 'from-orange-500 to-amber-500',
        emoji: '🟧',
        steps: [
            'Acesse o painel da Cakto.',
            'Vá em "Configurações" → "Webhooks".',
            'Cole a URL do webhook acima.',
            'Selecione os eventos "purchase.approved" e "purchase.refunded".',
            'Copie o "Secret" e cole no Kuiz em /admin/webhooks → aba "Configurações" → Cakto → "Secret".',
            'Salve e faça um pagamento teste de R$ 1,00 para validar.',
        ],
    },
    {
        id: 'stripe',
        name: 'Stripe',
        color: 'from-indigo-500 to-purple-500',
        emoji: '💳',
        steps: [
            'Acesse o Dashboard do Stripe.',
            'Vá em "Developers" → "Webhooks" → "Add endpoint".',
            'Cole a URL do webhook acima.',
            'Selecione o evento "checkout.session.completed".',
            'Copie o "Signing secret" (whsec_...) e cole no Kuiz em /admin/webhooks → aba "Configurações" → Stripe → "Secret".',
        ],
    },
    {
        id: 'hotmart',
        name: 'Hotmart',
        color: 'from-orange-500 to-red-500',
        emoji: '🔥',
        steps: [
            'Acesse o painel da Hotmart.',
            'Vá em "Ferramentas" → "Webhooks (API e notificações)".',
            'Cole a URL do webhook acima.',
            'Selecione os eventos "PURCHASE_APPROVED" e "PURCHASE_REFUNDED".',
            'Copie o "Token de autenticação" e cole no Kuiz em /admin/webhooks → aba "Configurações" → Hotmart → "Secret".',
        ],
    },
    {
        id: 'kiwify',
        name: 'Kiwify',
        color: 'from-green-500 to-emerald-500',
        emoji: '🥝',
        steps: [
            'Acesse o painel da Kiwify.',
            'Vá em "Configurações" → "Webhooks".',
            'Cole a URL do webhook acima.',
            'Selecione os eventos "purchase_approved" e "purchase_refunded".',
            'Copie o "Token" e cole no Kuiz em /admin/webhooks → aba "Configurações" → Kiwify → "Secret".',
        ],
    },
    {
        id: 'eduzz',
        name: 'Eduzz',
        color: 'from-blue-500 to-cyan-500',
        emoji: '🎓',
        steps: [
            'Acesse o painel da Eduzz.',
            'Vá em "Integrações" → "Webhooks".',
            'Cole a URL do webhook acima.',
            'Selecione os eventos "Venda Aprovada" e "Venda Reembolsada".',
            'Cole o "Token" no Kuiz em /admin/webhooks → aba "Configurações" → Eduzz → "Secret".',
        ],
    },
    {
        id: 'braip',
        name: 'Braip',
        color: 'from-pink-500 to-rose-500',
        emoji: '🎯',
        steps: [
            'Acesse o painel da Braip.',
            'Vá em "Configurações" → "Webhooks".',
            'Cole a URL do webhook acima.',
            'Selecione o evento "Venda Aprovada".',
            'Cole o "Token" no Kuiz em /admin/webhooks → aba "Configurações" → Braip → "Secret".',
        ],
    },
]

export default function WebhookInfoPage() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kuiz.digital'

    return (
        <div className="min-h-screen bg-[#F5F5F7]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                        <Webhook className="w-7 h-7" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3 text-balance">
                        Configure o webhook do seu gateway
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
                        Copie a URL abaixo e cole no painel do seu gateway de pagamento.
                        O Kuiz recebe os eventos, valida a assinatura e atualiza a assinatura do usuário automaticamente.
                    </p>
                </div>

                {/* URL Box */}
                <div className="bg-foreground text-background rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-background/60 mb-2">
                        URL do Webhook Kuiz
                    </p>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-background/10 border border-background/20 rounded-2xl p-2">
                        <code className="flex-1 font-mono text-sm px-3 py-2 break-all">
                            {baseUrl}/api/webhooks/cakto
                        </code>
                        <CopyButton text={`${baseUrl}/api/webhooks/cakto`} />
                    </div>
                    <p className="text-[11px] text-background/60 mt-3 flex items-center gap-1.5">
                        <span className="h-1 w-1 rounded-full bg-background/40" />
                        Esta URL funciona com <strong>qualquer provedor</strong>. O Kuiz detecta o formato automaticamente.
                    </p>
                </div>

                {/* Manual paste */}
                <div className="bg-background border border-border/60 rounded-2xl p-6 mb-12">
                    <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        <Code2 className="w-5 h-5 text-blue-500" />
                        Não tem acesso ao painel do provedor?
                    </h2>
                    <p className="text-sm text-muted-foreground mb-3">
                        Copie o JSON de teste do webhook, acesse{' '}
                        <a href="/admin/webhooks?tab=paste" className="text-blue-500 underline">
                            /admin/webhooks → aba "Colar payload"
                        </a>
                        , cole e clique em "Processar". Funciona com qualquer formato.
                    </p>
                </div>

                {/* Provider steps */}
                <h2 className="text-2xl font-bold mb-6">Passo a passo por provedor</h2>
                <div className="space-y-4">
                    {providers.map((p) => (
                        <div
                            key={p.id}
                            className="bg-background border border-border/60 rounded-2xl overflow-hidden"
                        >
                            <div className={`h-1 bg-gradient-to-r ${p.color}`} />
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${p.color} text-white flex items-center justify-center text-base font-bold`}>
                                        {p.emoji}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">{p.name}</h3>
                                        <p className="text-[11px] text-muted-foreground font-mono">
                                            POST {baseUrl}/api/webhooks/{p.id}
                                        </p>
                                    </div>
                                </div>
                                <ol className="space-y-2.5">
                                    {p.steps.map((s, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm">
                                            <span className="h-6 w-6 shrink-0 rounded-full bg-secondary text-foreground flex items-center justify-center text-[11px] font-mono font-bold">
                                                {idx + 1}
                                            </span>
                                            <span className="text-foreground/90 pt-0.5">{s}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer CTA */}
                <div className="mt-16 text-center">
                    <a
                        href="/admin/webhooks"
                        className="inline-flex items-center gap-2 px-6 h-12 rounded-full bg-foreground text-background font-medium hover:scale-105 transition-transform"
                    >
                        Ver eventos no admin
                        <ArrowRight className="w-4 h-4" />
                    </a>
                </div>
            </div>
        </div>
    )
}
