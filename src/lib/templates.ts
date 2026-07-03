/**
 * Templates de funis prontos.
 * Os componentes usam um formato "raw" que será convertido para
 * FunnelComponentData ao criar o funil.
 */

export interface RawComponent {
    type: string
    data: Record<string, any>
}

export interface TemplateStep {
    title: string
    slug: string
    components: RawComponent[]
}

export interface FunnelTemplate {
    id: string
    name: string
    description: string
    emoji: string
    category: 'lead-magnet' | 'sales' | 'quiz' | 'feedback' | 'vsl'
    estimatedConversion: string
    steps: TemplateStep[]
    theme: {
        primaryColor: string
        fontFamily: string
        pageBackground: string
        containerBg: string
    }
}

const TH = (primary: string) => ({
    primaryColor: primary,
    fontFamily: 'Inter',
    pageBackground: '#F5F5F7',
    containerBg: '#FFFFFF',
})

export const FUNNEL_TEMPLATES: FunnelTemplate[] = [
    {
        id: 'low-ticket-classic',
        name: 'Low Ticket Clássico',
        description: 'Quiz curto que qualifica leads para uma oferta low ticket (R$ 27-97).',
        emoji: '💸',
        category: 'sales',
        estimatedConversion: '15-25%',
        theme: TH('#10B981'),
        steps: [
            {
                title: 'Introdução',
                slug: 'intro',
                components: [
                    { type: 'heading', data: { text: 'Descubra o método em 60 segundos', level: 1, align: 'center' } },
                    { type: 'text', data: { content: 'Responda 3 perguntas rápidas e receba seu diagnóstico personalizado.', align: 'center', size: 'md' } },
                    { type: 'button', data: { text: 'Começar agora', variant: 'primary', targetStepId: 'next_step', fullWidth: true } },
                ],
            },
            {
                title: 'Pergunta 1',
                slug: 'q1',
                components: [
                    { type: 'heading', data: { text: 'Qual seu maior objetivo agora?', level: 2, align: 'center' } },
                    {
                        type: 'quiz-option',
                        data: {
                            options: [
                                { id: 'o1', label: 'Aumentar faturamento', value: 'A', emoji: '💰', points: 1, targetStepId: 'next_step' },
                                { id: 'o2', label: 'Conquistar tempo', value: 'B', emoji: '⏰', points: 2, targetStepId: 'next_step' },
                                { id: 'o3', label: 'Recomeçar do zero', value: 'C', emoji: '🚀', points: 3, targetStepId: 'next_step' },
                            ],
                        },
                    },
                ],
            },
            {
                title: 'Pergunta 2',
                slug: 'q2',
                components: [
                    { type: 'heading', data: { text: 'Há quanto tempo você busca isso?', level: 2, align: 'center' } },
                    {
                        type: 'quiz-option',
                        data: {
                            options: [
                                { id: 'o1', label: 'Menos de 3 meses', value: 'A', emoji: '🌱', points: 1, targetStepId: 'next_step' },
                                { id: 'o2', label: '3-12 meses', value: 'B', emoji: '🌿', points: 2, targetStepId: 'next_step' },
                                { id: 'o3', label: 'Mais de 1 ano', value: 'C', emoji: '🌳', points: 3, targetStepId: 'next_step' },
                            ],
                        },
                    },
                ],
            },
            {
                title: 'Captura',
                slug: 'capture',
                components: [
                    { type: 'heading', data: { text: 'Receba seu diagnóstico gratuito', level: 2, align: 'center' } },
                    { type: 'text', data: { content: 'Enviaremos o resultado + uma oferta exclusiva.', align: 'center' } },
                    {
                        type: 'form',
                        data: {
                            fields: [
                                { name: 'name', label: 'Nome', type: 'text', required: true },
                                { name: 'email', label: 'E-mail', type: 'email', required: true },
                                { name: 'phone', label: 'WhatsApp', type: 'tel', required: true },
                            ],
                            buttonText: 'Ver meu diagnóstico',
                            targetStepId: 'next_step',
                        },
                    },
                ],
            },
            {
                title: 'Resultado + Oferta',
                slug: 'result',
                components: [
                    { type: 'confetti', data: { duration: 3000 } },
                    { type: 'heading', data: { text: 'Parabéns! 🎉', level: 1, align: 'center' } },
                    { type: 'text', data: { content: 'Baseado nas suas respostas, você tem alto potencial. A oferta especial termina em breve:', align: 'center' } },
                    {
                        type: 'pricing',
                        data: {
                            title: 'Oferta Especial',
                            price: '97,00',
                            oldPrice: '297,00',
                            features: ['Acesso vitalício', 'Suporte direto', 'Garantia 7 dias'],
                            buttonText: 'Quero garantir',
                        },
                    },
                ],
            },
        ],
    },

    {
        id: 'lead-magnet-quiz',
        name: 'Lead Magnético (Quiz)',
        description: 'Quiz viral que identifica o perfil do lead e captura e-mail qualificado.',
        emoji: '🧲',
        category: 'lead-magnet',
        estimatedConversion: '30-45%',
        theme: TH('#8B5CF6'),
        steps: [
            {
                title: 'Boas-vindas',
                slug: 'welcome',
                components: [
                    { type: 'heading', data: { text: 'Qual é o seu perfil?', level: 1, align: 'center' } },
                    { type: 'text', data: { content: 'Responda 5 perguntas e descubra + ganhe um bônus exclusivo.', align: 'center' } },
                    { type: 'image', data: { url: '', alt: 'Quiz cover' } },
                    { type: 'button', data: { text: 'Iniciar quiz', variant: 'primary', targetStepId: 'next_step', fullWidth: true } },
                ],
            },
            {
                title: 'Pergunta 1/5',
                slug: 'q1',
                components: [
                    {
                        type: 'quiz-option',
                        data: {
                            question: 'Com que frequência você pratica?',
                            options: [
                                { id: 'o1', label: 'Diariamente', value: 'A', emoji: '⚡', points: 5, targetStepId: 'next_step' },
                                { id: 'o2', label: '3-5x por semana', value: 'B', emoji: '🔥', points: 4, targetStepId: 'next_step' },
                                { id: 'o3', label: '1-2x por semana', value: 'C', emoji: '🌱', points: 2, targetStepId: 'next_step' },
                                { id: 'o4', label: 'Raramente', value: 'D', emoji: '💤', points: 1, targetStepId: 'next_step' },
                            ],
                        },
                    },
                ],
            },
            {
                title: 'Captura',
                slug: 'capture',
                components: [
                    { type: 'heading', data: { text: 'Falta pouco! 🎁', level: 2, align: 'center' } },
                    { type: 'text', data: { content: 'Deixe seu e-mail e libere o resultado do seu perfil + o bônus.', align: 'center' } },
                    {
                        type: 'form',
                        data: {
                            fields: [
                                { name: 'name', label: 'Nome', type: 'text', required: true },
                                { name: 'email', label: 'E-mail', type: 'email', required: true },
                            ],
                            buttonText: 'Liberar resultado',
                            targetStepId: 'next_step',
                        },
                    },
                ],
            },
            {
                title: 'Resultado',
                slug: 'result',
                components: [
                    { type: 'confetti', data: { duration: 4000 } },
                    { type: 'heading', data: { text: 'Seu perfil: [PERSONALIDADE]', level: 1, align: 'center' } },
                    { type: 'text', data: { content: 'Enviamos o resultado completo para o seu e-mail. Compartilhe com amigos:', align: 'center' } },
                    {
                        type: 'social-share',
                        data: { title: 'Fiz o quiz e meu perfil é [PERSONALIDADE]!', platforms: ['whatsapp', 'facebook', 'twitter', 'copy'] },
                    },
                ],
            },
        ],
    },

    {
        id: 'vsl-webinar',
        name: 'VSL + Oferta',
        description: 'Página de VSL (video sales letter) com CTA para compra.',
        emoji: '🎬',
        category: 'vsl',
        estimatedConversion: '8-15%',
        theme: TH('#EF4444'),
        steps: [
            {
                title: 'VSL',
                slug: 'vsl',
                components: [
                    { type: 'heading', data: { text: 'ATENÇÃO: assista antes que saia do ar', level: 2, align: 'center' } },
                    { type: 'vsl', data: { videoUrl: '', autoplay: true, controls: false } },
                    { type: 'timer', data: { minutes: 15, label: 'Esta oferta expira em', showSeconds: true } },
                    { type: 'button', data: { text: 'QUERO APROVEITAR →', variant: 'primary', targetStepId: 'next_step', fullWidth: true, delay: 0 } },
                ],
            },
            {
                title: 'Captura',
                slug: 'capture',
                components: [
                    { type: 'heading', data: { text: 'Última chance', level: 1, align: 'center' } },
                    {
                        type: 'form',
                        data: {
                            fields: [
                                { name: 'name', label: 'Nome completo', type: 'text', required: true },
                                { name: 'email', label: 'E-mail', type: 'email', required: true },
                                { name: 'phone', label: 'WhatsApp', type: 'tel', required: true },
                            ],
                            buttonText: 'Finalizar compra',
                            targetStepId: 'next_step',
                        },
                    },
                ],
            },
            {
                title: 'Obrigado',
                slug: 'thanks',
                components: [
                    { type: 'confetti', data: { duration: 5000 } },
                    { type: 'heading', data: { text: 'Bem-vindo(a)! 🎉', level: 1, align: 'center' } },
                    { type: 'text', data: { content: 'Em breve nosso time entrará em contato via WhatsApp.', align: 'center' } },
                ],
            },
        ],
    },

    {
        id: 'feedback-nps',
        name: 'Pesquisa NPS',
        description: 'Micro-funil de 1 página para coletar feedback rápido.',
        emoji: '⭐',
        category: 'feedback',
        estimatedConversion: '50-70%',
        theme: TH('#F59E0B'),
        steps: [
            {
                title: 'Pesquisa',
                slug: 'survey',
                components: [
                    { type: 'heading', data: { text: 'Quanto você recomendaria?', level: 1, align: 'center' } },
                    { type: 'text', data: { content: 'De 0 a 10', align: 'center', size: 'sm' } },
                    {
                        type: 'quiz-option',
                        data: {
                            layout: 'horizontal',
                            options: Array.from({ length: 11 }, (_, i) => ({
                                id: `nps-${i}`,
                                label: String(i),
                                value: String(i),
                                emoji: i >= 9 ? '😍' : i >= 7 ? '🙂' : i >= 5 ? '😐' : '😞',
                                points: i,
                                targetStepId: 'next_step',
                            })),
                        },
                    },
                ],
            },
            {
                title: 'Comentário',
                slug: 'comment',
                components: [
                    { type: 'heading', data: { text: 'Nos conte o porquê', level: 2, align: 'center' } },
                    {
                        type: 'form',
                        data: {
                            fields: [
                                { name: 'name', label: 'Nome', type: 'text', required: false },
                                { name: 'email', label: 'E-mail', type: 'email', required: true },
                                { name: 'comment', label: 'Comentário', type: 'textarea', required: true },
                            ],
                            buttonText: 'Enviar feedback',
                            targetStepId: 'next_step',
                        },
                    },
                ],
            },
            {
                title: 'Obrigado',
                slug: 'thanks',
                components: [
                    { type: 'heading', data: { text: 'Obrigado pelo feedback! 💛', level: 2, align: 'center' } },
                ],
            },
        ],
    },

    {
        id: 'blank-canvas',
        name: 'Começar do zero',
        description: 'Tela em branco com 2 etapas vazias.',
        emoji: '✨',
        category: 'quiz',
        estimatedConversion: '—',
        theme: TH('#007AFF'),
        steps: [
            { title: 'Etapa 1', slug: 'step-1', components: [] },
            { title: 'Etapa 2', slug: 'step-2', components: [] },
        ],
    },
]

export function getTemplate(id: string): FunnelTemplate | undefined {
    return FUNNEL_TEMPLATES.find((t) => t.id === id)
}
