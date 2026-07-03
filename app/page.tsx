'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
    Sparkles, Zap, BarChart3, Shield, ArrowRight,
    CheckCircle, Users, TrendingUp, Star, Menu, X,
    Palette, Gauge, Lock, Globe, MousePointer, Smartphone,
    Layers, Play, Share2, MessageSquare, Layout, Target,
    Facebook, Instagram, Mail, Check, ChevronDown, Quote,
    ArrowUpRight, Clock, Webhook, Code2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const faqItems = [
    {
        q: 'Preciso saber programar para usar o Kuiz?',
        a: 'Absolutamente não. O editor é 100% visual: arraste, solte, customize. Você só precisa saber o que quer — e nosso sistema cuida da parte técnica.'
    },
    {
        q: 'Como recebo pagamento das minhas vendas?',
        a: 'Você recebe direto. O Kuiz é a ferramenta que captura o lead. A venda pode ser processada por gateways como Cakto, Stripe, Hotmart, Kiwify ou Eduzz — você integra o que já usa. Os webhooks atualizam sua assinatura automaticamente.'
    },
    {
        q: 'Posso usar meu próprio domínio?',
        a: 'Sim, a partir do plano Pro. Você aponta o CNAME e o certificado SSL é provisionado automaticamente. Sua URL fica tipo quiz.seusite.com.'
    },
    {
        q: 'Os dados são LGPD-compliant?',
        a: 'Sim. Servimos no Brasil (PostgreSQL gerenciado), criptografia em trânsito e em repouso, e os dados são processados apenas para o fim declarado. Seus leads, suas regras.'
    },
    {
        q: 'Posso cancelar a qualquer momento?',
        a: 'Sim, sem multa. Você mantém acesso até o fim do ciclo pago. Os funis continuam no ar (com marca Kuiz) até você deletar ou reativar.'
    },
    {
        q: 'Como o Kuiz se compara com Typeform, Leadpages ou SurveyMonkey?',
        a: 'Somos focados em conversão, não só coleta. Recursos nativos de pixel, UTMs, webhooks e otimização mobile-first que as outras cobram caro ou não têm.'
    },
]

const steps = [
    {
        n: '01',
        title: 'Escolha um template',
        description: 'Mais de 5 templates otimizados: low-ticket, lead magnético, VSL, NPS. Pronto em 1 minuto.',
        icon: Sparkles,
    },
    {
        n: '02',
        title: 'Customize visualmente',
        description: 'Editor drag & drop. Mude cores, textos, imagens. Preview em tempo real, exatamente como vai ao ar.',
        icon: Palette,
    },
    {
        n: '03',
        title: 'Conecte seus pixels',
        description: 'Facebook, Google, TikTok, UTMs. Adicione o webhook do gateway de pagamento em 1 clique.',
        icon: Code2,
    },
    {
        n: '04',
        title: 'Publique e colete leads',
        description: 'URL personalizada, domínio próprio, analytics em tempo real. Leads vão direto pro seu CRM ou planilha.',
        icon: TrendingUp,
    },
]

const integrations = [
    { name: 'Cakto', color: 'bg-orange-100 text-orange-600', emoji: '🟧' },
    { name: 'Stripe', color: 'bg-indigo-100 text-indigo-600', emoji: '💳' },
    { name: 'Hotmart', color: 'bg-orange-100 text-orange-700', emoji: '🔥' },
    { name: 'Kiwify', color: 'bg-green-100 text-green-600', emoji: '🥝' },
    { name: 'Eduzz', color: 'bg-blue-100 text-blue-600', emoji: '🎓' },
    { name: 'Facebook', color: 'bg-blue-100 text-blue-700', emoji: 'f' },
    { name: 'Google Ads', color: 'bg-yellow-100 text-yellow-600', emoji: 'G' },
    { name: 'TikTok', color: 'bg-pink-100 text-pink-600', emoji: '♪' },
    { name: 'Webhook', color: 'bg-emerald-100 text-emerald-600', emoji: '⚡' },
    { name: 'Mailchimp', color: 'bg-yellow-100 text-yellow-700', emoji: '🐵' },
    { name: 'Zapier', color: 'bg-orange-100 text-orange-600', emoji: '⚡' },
    { name: 'WhatsApp', color: 'bg-green-100 text-green-600', emoji: '📱' },
]

const logos = ['Hotmart', 'Cakto', 'Kiwify', 'Eduzz', 'Stripe', 'Braip']

export default function FuturisticLandingPage() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const heroRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        const handleMouseMove = (e: MouseEvent) => {
            if (heroRef.current) {
                const { left, top, width, height } = heroRef.current.getBoundingClientRect();
                const x = (e.clientX - left) / width - 0.5;
                const y = (e.clientY - top) / height - 0.5;
                setMousePosition({ x, y });
            }
        };
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] overflow-x-hidden selection:bg-blue-500/20 font-sans">
            {/* Noise texture overlay */}
            <div
                className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-multiply"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />

            {/* Navigation */}
            <nav
                className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
                    isScrolled
                        ? 'bg-white/70 backdrop-blur-xl border-b border-black/5'
                        : 'bg-transparent'
                }`}
            >
                <div className="max-w-[1400px] mx-auto px-6">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="relative w-8 h-8 flex items-center justify-center overflow-hidden rounded-lg bg-black text-white shadow-lg shadow-black/20 group-hover:scale-105 transition-transform duration-300">
                                <Sparkles className="w-4 h-4 relative z-10" />
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>
                            <span className="text-lg font-semibold tracking-tight">Kuiz</span>
                        </Link>

                        <div className="hidden md:flex items-center gap-8">
                            {['Recursos', 'Como funciona', 'Integrações', 'Preços', 'FAQ'].map((item) => {
                                const id = item.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ /g, '-')
                                return (
                                    <Link
                                        key={item}
                                        href={`#${id}`}
                                        className="text-sm font-medium text-gray-600 hover:text-black transition-colors relative group"
                                    >
                                        {item}
                                        <span className="absolute -bottom-1 left-0 w-0 h-px bg-black transition-all duration-300 group-hover:w-full" />
                                    </Link>
                                )
                            })}
                        </div>

                        <div className="hidden md:flex items-center gap-3">
                            <Link
                                href="/login"
                                className="text-sm font-medium text-gray-600 hover:text-black transition-colors px-3"
                            >
                                Entrar
                            </Link>
                            <Link
                                href="/register"
                                className="group relative px-5 py-2 bg-black text-white text-sm font-medium rounded-full overflow-hidden shadow-lg shadow-black/10 hover:shadow-black/20 transition-all"
                            >
                                <span className="relative z-10 group-hover:text-white transition-colors">
                                    Começar Grátis
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </Link>
                        </div>

                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-black/5"
                            aria-label="Menu"
                        >
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>

                    {/* Mobile menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-black/5 shadow-xl p-4 animate-fade-in-up">
                            <div className="flex flex-col gap-1">
                                {['Recursos', 'Como funciona', 'Integrações', 'Preços', 'FAQ'].map((item) => (
                                    <Link
                                        key={item}
                                        href={`#${item.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ /g, '-')}`}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-secondary"
                                    >
                                        {item}
                                    </Link>
                                ))}
                                <div className="border-t border-border/60 my-2" />
                                <Link href="/login" className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-secondary">
                                    Entrar
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-3 py-2.5 rounded-lg text-sm font-medium bg-black text-white text-center"
                                >
                                    Começar Grátis
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* HERO */}
            <section ref={heroRef} className="relative pt-32 pb-20 px-6 overflow-hidden">
                {/* Soft background blobs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl" />
                    <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-purple-400/10 blur-3xl" />
                </div>

                <div className="max-w-[1400px] mx-auto relative">
                    <div className="flex flex-col items-center text-center mb-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-black/5 shadow-sm mb-8 animate-fade-in-up hover:scale-105 transition-transform cursor-default">
                            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-xs font-medium text-gray-600 tracking-wide uppercase">
                                Novo · Templates com IA
                            </span>
                        </div>

                        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.95] mb-6 animate-fade-in-up">
                            Crie quizzes que
                            <br />
                            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                vendem por você.
                            </span>
                        </h1>

                        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up font-light">
                            Funis interativos com aparência de app, prontos em minutos.
                            Capture leads qualificados, dispare pixels e venda mais — sem tocar em código.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-3 animate-fade-in-up mb-8">
                            <Link
                                href="/register"
                                className="group h-12 px-8 rounded-full bg-black text-white font-medium flex items-center gap-2 hover:scale-105 transition-transform duration-300 shadow-xl shadow-black/20 hover:shadow-black/30"
                            >
                                Criar meu primeiro quiz
                                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                            <Link
                                href="/f/demo"
                                target="_blank"
                                className="h-12 px-8 rounded-full bg-white border border-black/5 text-black font-medium flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
                            >
                                <Play size={14} fill="currentColor" />
                                Ver demo ao vivo
                            </Link>
                        </div>

                        {/* Prova social inline */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground animate-fade-in-up">
                            <div className="flex -space-x-2">
                                {['#007AFF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'].map((c, i) => (
                                    <div
                                        key={i}
                                        className="h-7 w-7 rounded-full ring-2 ring-white"
                                        style={{ background: `linear-gradient(135deg, ${c}, ${c}cc)` }}
                                    />
                                ))}
                            </div>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                ))}
                                <span className="ml-1 font-medium text-foreground">4.9</span>
                                <span className="hidden sm:inline">— usado por times no Brasil todo</span>
                            </div>
                        </div>
                    </div>

                    {/* 3D Mockup */}
                    <div className="relative max-w-5xl mx-auto animate-fade-in-up">
                        <div
                            className="relative bg-white rounded-2xl shadow-2xl border border-black/5 overflow-hidden transition-transform duration-100 ease-out"
                            style={{
                                transform: `rotateX(${mousePosition.y * -3}deg) rotateY(${mousePosition.x * 3}deg)`,
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                            }}
                        >
                            <div className="h-12 bg-[#F5F5F7]/80 backdrop-blur-md border-b border-black/5 flex items-center px-4 gap-4 sticky top-0 z-20">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-inner" />
                                    <div className="w-3 h-3 rounded-full bg-[#FEBC2E] shadow-inner" />
                                    <div className="w-3 h-3 rounded-full bg-[#28C840] shadow-inner" />
                                </div>
                                <div className="flex-1 flex justify-center">
                                    <div className="bg-white/50 h-7 w-64 rounded-md shadow-sm flex items-center justify-center text-xs text-gray-400 gap-2 border border-black/5">
                                        <Lock size={10} />
                                        kuiz.digital/demo
                                    </div>
                                </div>
                            </div>

                            <div className="flex h-[600px]">
                                <div className="w-64 border-r border-black/5 bg-[#FAFAFA] p-4 hidden md:block">
                                    <div className="flex items-center gap-2 mb-8 px-2">
                                        <div className="w-6 h-6 bg-black rounded flex items-center justify-center shadow-md">
                                            <Sparkles size={12} className="text-white" />
                                        </div>
                                        <span className="font-bold text-sm">Kuiz Builder</span>
                                    </div>
                                    <div className="space-y-1">
                                        {[
                                            { name: 'Visão Geral', active: false },
                                            { name: 'Editor Visual', active: true },
                                            { name: 'Design & Tema', active: false },
                                            { name: 'Integrações', active: false },
                                            { name: 'Configurações', active: false },
                                        ].map((item) => (
                                            <div
                                                key={item.name}
                                                className={`px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                                                    item.active
                                                        ? 'bg-white shadow-sm text-black ring-1 ring-black/5'
                                                        : 'text-gray-500 hover:bg-black/5 hover:text-black'
                                                }`}
                                            >
                                                {item.name}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-8">
                                        <div className="text-xs font-semibold text-gray-400 px-2 mb-2 uppercase tracking-wider">
                                            Componentes
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { icon: Layout, label: 'Texto' },
                                                { icon: MousePointer, label: 'Botão' },
                                                { icon: MessageSquare, label: 'Input' },
                                                { icon: Share2, label: 'Social' },
                                            ].map((comp) => (
                                                <div
                                                    key={comp.label}
                                                    className="flex flex-col items-center justify-center p-3 bg-white border border-black/5 rounded-lg hover:border-blue-500/50 hover:shadow-md hover:-translate-y-0.5 cursor-grab active:cursor-grabbing transition-all group"
                                                >
                                                    <comp.icon size={16} className="text-gray-600 mb-1 group-hover:text-blue-500 transition-colors" />
                                                    <span className="text-[10px] text-gray-500 group-hover:text-gray-700">{comp.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 bg-[#F0F2F5] p-8 flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />
                                    <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-black/5 p-8 z-10 transform transition-transform hover:scale-[1.01] duration-500">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                                            <Sparkles className="text-white" />
                                        </div>
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                                                Pergunta 1 de 3
                                            </span>
                                            <span className="text-xs text-gray-400 font-mono">33%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-100 rounded-full mb-6 overflow-hidden">
                                            <div className="h-full w-1/3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2 tracking-tight">Qual seu maior desafio hoje?</h3>
                                        <p className="text-gray-500 mb-6">Selecione a opção que melhor descreve seu momento.</p>
                                        <div className="space-y-3">
                                            {[
                                                { icon: '🚀', text: 'Escalar minhas vendas', active: true },
                                                { icon: '💡', text: 'Validar uma ideia', active: false },
                                                { icon: '🎓', text: 'Educar minha audiência', active: false },
                                            ].map((opt, i) => (
                                                <div
                                                    key={i}
                                                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                                                        opt.active
                                                            ? 'border-blue-500 bg-blue-50/30 shadow-sm'
                                                            : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xl group-hover:scale-110 transition-transform duration-300">
                                                            {opt.icon}
                                                        </span>
                                                        <span className={`font-medium ${opt.active ? 'text-blue-700' : 'text-gray-700'}`}>
                                                            {opt.text}
                                                        </span>
                                                    </div>
                                                    {opt.active && <CheckCircle size={18} className="text-blue-500" />}
                                                </div>
                                            ))}
                                        </div>
                                        <button className="w-full mt-6 py-3.5 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0">
                                            Continuar
                                        </button>
                                    </div>

                                    <div className="absolute top-20 right-10 bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-xl border border-black/5 animate-float z-20">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-xs font-bold">98% Conclusão</span>
                                        </div>
                                    </div>

                                    <div className="absolute bottom-20 left-10 bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-xl border border-black/5 animate-float z-20" style={{ animationDelay: '2s' }}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                FB
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-gray-500">Pixel Ativo</div>
                                                <div className="text-xs font-bold">Evento Disparado</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* TRUST BAR */}
            <section className="py-12 px-6 bg-white border-y border-border/60">
                <div className="max-w-[1400px] mx-auto">
                    <p className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-6">
                        Integra com os gateways e ferramentas que você já usa
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
                        {logos.map((l) => (
                            <span
                                key={l}
                                className="text-xl font-bold tracking-tight text-muted-foreground/50 hover:text-foreground transition-colors"
                            >
                                {l}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* BENTO RECURSOS */}
            <section id="recursos" className="py-32 px-6 bg-white">
                <div className="max-w-[1400px] mx-auto">
                    <div className="mb-16 max-w-2xl">
                        <Badge variant="default" className="mb-4">Recursos</Badge>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-balance">
                            Tudo que você precisa.
                            <br />
                            <span className="text-gray-400">Nada que você não precise.</span>
                        </h2>
                        <p className="text-lg text-gray-500 text-balance">
                            Recursos poderosos embrulhados em uma interface linda.
                            Para times de marketing que exigem performance.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Visual Builder */}
                        <div className="md:col-span-2 bg-gradient-to-br from-[#F5F5F7] to-white rounded-3xl p-8 md:p-12 relative overflow-hidden group min-h-[400px] border border-border/60 hover:shadow-2xl transition-all duration-500">
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center mb-6 shadow-lg shadow-black/20">
                                    <Palette />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">Editor Visual Drag & Drop</h3>
                                <p className="text-gray-500 max-w-md text-base mb-6">
                                    Arraste, solte e personalize cada pixel. Preview em tempo real —
                                    exatamente como vai ao ar.
                                </p>
                                <ul className="space-y-2">
                                    {['20+ componentes prontos', 'Preview mobile/desktop em tempo real', 'Temas salvos e reutilizáveis', 'Undo/Redo + versionamento'].map((item) => (
                                        <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                                            <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="absolute right-0 bottom-0 w-2/3 h-2/3 bg-gradient-to-tl from-blue-100/50 to-transparent rounded-tl-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute right-10 bottom-10 transform translate-y-20 group-hover:translate-y-0 transition-transform duration-500 hidden md:block">
                                <div className="bg-white p-4 rounded-2xl shadow-xl border border-black/5 w-64">
                                    <div className="flex gap-2 mb-4">
                                        <div className="w-8 h-8 rounded bg-blue-100" />
                                        <div className="w-8 h-8 rounded bg-purple-100" />
                                        <div className="w-8 h-8 rounded bg-emerald-100" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-8 bg-blue-50 rounded-lg border border-blue-100 w-full" />
                                        <div className="h-8 bg-gray-50 rounded-lg w-full" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Analytics */}
                        <div className="bg-black text-white rounded-3xl p-8 md:p-10 relative overflow-hidden group min-h-[400px] border border-black hover:shadow-2xl hover:shadow-black/20 transition-all duration-500">
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div>
                                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 backdrop-blur-md border border-white/10">
                                        <BarChart3 />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3">Analytics em tempo real</h3>
                                    <p className="text-gray-400">
                                        Heatmap de retenção, funil de conversão, atribuição de UTMs.
                                        Tudo para você escalar o que funciona.
                                    </p>
                                </div>
                                <div className="mt-8">
                                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                                        <span>Conversão</span>
                                        <span className="text-emerald-400 font-semibold">+127%</span>
                                    </div>
                                    <div className="flex items-end gap-1.5 h-32">
                                        {[40, 70, 45, 90, 65, 85, 95, 100, 80, 92].map((h, i) => (
                                            <div
                                                key={i}
                                                className="flex-1 bg-white/20 rounded-t-md hover:bg-white/40 transition-colors"
                                                style={{ height: `${h}%` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Webhook + UTMs */}
                        <div className="bg-[#F5F5F7] rounded-3xl p-8 relative overflow-hidden group border border-border/60 hover:shadow-xl transition-all duration-500">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                                <Webhook />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Webhooks nativos</h3>
                            <p className="text-gray-500 text-sm mb-4">
                                Receba eventos de Cakto, Stripe, Hotmart, Kiwify. Atualização automática de assinatura.
                            </p>
                            <Link
                                href="/admin/webhooks"
                                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
                            >
                                Ver no admin
                                <ArrowUpRight className="w-3 h-3" />
                            </Link>
                        </div>

                        {/* Performance */}
                        <div className="bg-[#F5F5F7] rounded-3xl p-8 relative overflow-hidden group border border-border/60 hover:shadow-xl transition-all duration-500">
                            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                                <Gauge />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Ultra rápido</h3>
                            <p className="text-gray-500 text-sm">
                                Core Web Vitals otimizados. Carregamento <span className="font-mono text-foreground">&lt; 1s</span> mobile.
                            </p>
                        </div>

                        {/* LGPD */}
                        <div className="bg-[#F5F5F7] rounded-3xl p-8 relative overflow-hidden group border border-border/60 hover:shadow-xl transition-all duration-500">
                            <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center mb-4">
                                <Shield />
                            </div>
                            <h3 className="text-xl font-bold mb-2">LGPD-compliant</h3>
                            <p className="text-gray-500 text-sm">
                                Servidores no Brasil. Criptografia ponta a ponta. Seus leads, suas regras.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* COMO FUNCIONA */}
            <section id="como-funciona" className="py-32 px-6 bg-[#F5F5F7]">
                <div className="max-w-[1400px] mx-auto">
                    <div className="mb-16 max-w-2xl">
                        <Badge variant="default" className="mb-4">Como funciona</Badge>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-balance">
                            Do zero ao primeiro lead
                            <br />
                            <span className="text-gray-400">em menos de 10 minutos.</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {steps.map((step, idx) => {
                            const Icon = step.icon
                            return (
                                <div
                                    key={step.n}
                                    className="relative bg-background border border-border/60 rounded-2xl p-6 hover:shadow-pop hover:-translate-y-0.5 transition-all group"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-5xl font-bold text-muted-foreground/20 group-hover:text-foreground/40 transition-colors">
                                            {step.n}
                                        </span>
                                        <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-foreground group-hover:bg-foreground group-hover:text-background transition-colors">
                                            <Icon className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold mb-1.5">{step.title}</h3>
                                    <p className="text-sm text-muted-foreground text-balance">{step.description}</p>
                                    {idx < steps.length - 1 && (
                                        <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 text-muted-foreground/30">
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* DEPOIMENTOS */}
            <section className="py-32 px-6 bg-white">
                <div className="max-w-[1400px] mx-auto">
                    <div className="mb-16 max-w-2xl">
                        <Badge variant="default" className="mb-4">Quem usa, recomenda</Badge>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
                            Times que escalam
                            <br />
                            <span className="text-gray-400">com o Kuiz.</span>
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {[
                            {
                                quote: 'Triplicou nossa taxa de conversão em 30 dias. A edição visual é absurdamente rápida.',
                                author: 'Marina S.',
                                role: 'Head de Growth · Agência',
                                rating: 5,
                            },
                            {
                                quote: 'Configuramos o webhook do Cakto em 5 minutos. Assinaturas se renovam sozinhas.',
                                author: 'Rafael T.',
                                role: 'Co-founder · SaaS',
                                rating: 5,
                            },
                            {
                                quote: 'Migrei do Typeform e economizo R$ 800/mês. Sem contar a flexibilidade.',
                                author: 'Júlia P.',
                                role: 'Infoprodutora',
                                rating: 5,
                            },
                        ].map((t) => (
                            <Card key={t.author} className="hover:shadow-pop hover:-translate-y-0.5 transition-all">
                                <CardContent className="p-6 space-y-4">
                                    <Quote className="w-6 h-6 text-muted-foreground/30" />
                                    <p className="text-sm leading-relaxed text-balance">"{t.quote}"</p>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: t.rating }).map((_, i) => (
                                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-3 pt-3 border-t border-border/60">
                                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                            {t.author[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">{t.author}</p>
                                            <p className="text-[11px] text-muted-foreground">{t.role}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* INTEGRAÇÕES */}
            <section id="integracoes" className="py-32 px-6 bg-[#F5F5F7]">
                <div className="max-w-[1400px] mx-auto">
                    <div className="mb-16 max-w-2xl">
                        <Badge variant="default" className="mb-4">Integrações</Badge>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-balance">
                            Conecta com tudo
                            <br />
                            <span className="text-gray-400">que você já usa.</span>
                        </h2>
                        <p className="text-lg text-gray-500 text-balance">
                            Pagamentos, e-mail marketing, analytics, CRM. Se tem webhook, conecta.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {integrations.map((i) => (
                            <div
                                key={i.name}
                                className="group bg-background border border-border/60 rounded-2xl p-4 flex flex-col items-center text-center hover:shadow-pop hover:-translate-y-0.5 transition-all"
                            >
                                <div
                                    className={`h-12 w-12 rounded-2xl ${i.color} flex items-center justify-center text-lg font-bold mb-2 group-hover:scale-110 transition-transform`}
                                >
                                    {i.emoji}
                                </div>
                                <p className="text-xs font-semibold">{i.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PREÇOS */}
            <section id="precos" className="py-32 px-6 bg-white">
                <div className="max-w-[1400px] mx-auto">
                    <div className="text-center mb-16">
                        <Badge variant="default" className="mb-4">Preços</Badge>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-balance">
                            Planos simples e transparentes.
                        </h2>
                        <p className="text-lg text-gray-500 mb-8">
                            Comece grátis. Faça upgrade quando crescer.
                        </p>

                        <div className="inline-flex items-center p-1 bg-white rounded-full border border-black/5 shadow-sm">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === 'monthly' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:text-black'}`}
                            >
                                Mensal
                            </button>
                            <button
                                onClick={() => setBillingCycle('yearly')}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:text-black'}`}
                            >
                                Anual
                                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">-20%</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto">
                        {/* Free */}
                        <Card hover className="flex flex-col">
                            <CardContent className="p-7 flex-1 flex flex-col">
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold mb-1.5">Starter</h3>
                                    <p className="text-sm text-muted-foreground">Para quem está começando.</p>
                                </div>
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold">R$ 0</span>
                                        <span className="text-muted-foreground">/mês</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Grátis para sempre</p>
                                </div>
                                <ul className="space-y-3 mb-6 flex-1">
                                    {['3 funis ativos', '100 respostas/mês', 'Analytics básico', 'Domínio kuiz.digital', 'Suporte por email'].map((feature) => (
                                        <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                                            <Check size={16} className="text-foreground mt-0.5 shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/register" className="w-full py-3 rounded-xl border border-border bg-background text-foreground font-medium hover:bg-secondary transition-colors text-center">
                                    Começar Grátis
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Pro — destaque */}
                        <div className="bg-foreground text-background rounded-2xl p-7 shadow-2xl flex flex-col relative overflow-hidden scale-[1.02] border border-foreground">
                            <div className="absolute top-0 right-0 bg-gradient-to-bl from-blue-600 to-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl tracking-wider">
                                POPULAR
                            </div>
                            <div className="mb-6">
                                <h3 className="text-xl font-bold mb-1.5">Pro</h3>
                                <p className="text-sm text-background/70">Para criadores em crescimento.</p>
                            </div>
                            <div className="mb-6">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold">
                                        R$ {billingCycle === 'monthly' ? '97' : '77'}
                                    </span>
                                    <span className="text-background/70">/mês</span>
                                </div>
                                <p className="text-xs text-background/50 mt-1">
                                    Cobrado {billingCycle === 'monthly' ? 'mensalmente' : `anualmente (R$ ${billingCycle === 'yearly' ? '924' : '0'}/ano)`}
                                </p>
                            </div>
                            <ul className="space-y-3 mb-6 flex-1">
                                {['Funis ilimitados', '10.000 respostas/mês', 'Analytics avançado + heatmap', 'Domínio personalizado + SSL', 'Remoção da marca Kuiz', 'Pixels + webhooks', 'Exportação de leads (CSV)'].map((feature) => (
                                    <li key={feature} className="flex items-start gap-2 text-sm text-background/90">
                                        <Check size={16} className="text-blue-400 mt-0.5 shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Link href="/register" className="w-full py-3 rounded-xl bg-background text-foreground font-medium hover:bg-background/90 transition-colors text-center shadow-lg shadow-white/10">
                                Começar Teste Grátis
                            </Link>
                        </div>

                        {/* Enterprise */}
                        <Card hover className="flex flex-col">
                            <CardContent className="p-7 flex-1 flex flex-col">
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold mb-1.5">Enterprise</h3>
                                    <p className="text-sm text-muted-foreground">Para agências e times.</p>
                                </div>
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold">
                                            R$ {billingCycle === 'monthly' ? '297' : '237'}
                                        </span>
                                        <span className="text-muted-foreground">/mês</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Cobrado {billingCycle === 'monthly' ? 'mensalmente' : 'anualmente'}</p>
                                </div>
                                <ul className="space-y-3 mb-6 flex-1">
                                    {['Tudo do plano Pro', 'Respostas ilimitadas', 'Múltiplos usuários (até 10)', 'API de acesso', 'White-label (sua marca)', 'Suporte prioritário', 'Onboarding 1-on-1'].map((feature) => (
                                        <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                                            <Check size={16} className="text-foreground mt-0.5 shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/register" className="w-full py-3 rounded-xl border border-border bg-background text-foreground font-medium hover:bg-secondary transition-colors text-center">
                                    Falar com Vendas
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="py-32 px-6 bg-[#F5F5F7]">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-12 text-center">
                        <Badge variant="default" className="mb-4">FAQ</Badge>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-balance">
                            Perguntas frequentes.
                        </h2>
                    </div>
                    <div className="space-y-2">
                        {faqItems.map((item, idx) => {
                            const isOpen = openFaq === idx
                            return (
                                <div
                                    key={idx}
                                    className="bg-background border border-border/60 rounded-2xl overflow-hidden transition-all"
                                >
                                    <button
                                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                                        className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-secondary/30 transition-colors"
                                    >
                                        <span className="font-semibold text-sm md:text-base">{item.q}</span>
                                        <ChevronDown
                                            className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                        />
                                    </button>
                                    {isOpen && (
                                        <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed animate-fade-in-up">
                                            {item.a}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* CTA FINAL */}
            <section className="py-32 px-6 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-3xl" />
                </div>
                <div className="max-w-4xl mx-auto text-center relative">
                    <Badge variant="default" className="mb-6">Comece grátis</Badge>
                    <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-balance">
                        Pronto para decolar?
                    </h2>
                    <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto text-balance">
                        Crie seu primeiro quiz em 10 minutos. Sem cartão, sem risco, sem letra miúda.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            href="/register"
                            className="group h-14 px-10 rounded-full bg-foreground text-background text-base font-medium flex items-center gap-2 hover:scale-105 transition-transform shadow-2xl shadow-foreground/20"
                        >
                            Criar conta grátis
                            <ArrowRight className="group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                        <Link
                            href="/login"
                            className="h-14 px-10 rounded-full bg-background border border-border text-foreground text-base font-medium hover:bg-secondary transition-colors"
                        >
                            Já tenho conta
                        </Link>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-6 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-500" /> Sem cartão</span>
                        <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-500" /> Cancele quando quiser</span>
                        <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-500" /> Suporte em português</span>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-16 px-6 border-t border-border/60 bg-white">
                <div className="max-w-[1400px] mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
                        <div className="col-span-2">
                            <Link href="/" className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center text-background">
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <span className="text-lg font-semibold">Kuiz</span>
                            </Link>
                            <p className="text-sm text-muted-foreground max-w-xs">
                                Crie quizzes que vendem por você. Captura, converte, integra.
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Produto</p>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="#recursos" className="text-foreground/80 hover:text-foreground">Recursos</Link></li>
                                <li><Link href="#precos" className="text-foreground/80 hover:text-foreground">Preços</Link></li>
                                <li><Link href="#integracoes" className="text-foreground/80 hover:text-foreground">Integrações</Link></li>
                                <li><Link href="#como-funciona" className="text-foreground/80 hover:text-foreground">Como funciona</Link></li>
                            </ul>
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Empresa</p>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="#" className="text-foreground/80 hover:text-foreground">Sobre</Link></li>
                                <li><Link href="#" className="text-foreground/80 hover:text-foreground">Blog</Link></li>
                                <li><Link href="#" className="text-foreground/80 hover:text-foreground">Contato</Link></li>
                            </ul>
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Legal</p>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="#" className="text-foreground/80 hover:text-foreground">Privacidade</Link></li>
                                <li><Link href="#" className="text-foreground/80 hover:text-foreground">Termos</Link></li>
                                <li><Link href="#" className="text-foreground/80 hover:text-foreground">LGPD</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-border/60 text-xs text-muted-foreground">
                        <p>© {new Date().getFullYear()} Kuiz Inc. Todos os direitos reservados.</p>
                        <p className="flex items-center gap-1.5">
                            Feito com <span className="text-red-500">♥</span> no Brasil
                        </p>
                    </div>
                </div>
            </footer>

            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
                .perspective-1000 {
                    perspective: 1000px;
                }
            `}</style>
        </div>
    );
}
