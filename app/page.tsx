'use client';
// Force refresh

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
    Sparkles, Zap, BarChart3, Shield, ArrowRight,
    CheckCircle, Users, TrendingUp, Star, Menu, X,
    Palette, Gauge, Lock, Globe, MousePointer2, Smartphone,
    Layers, Play, Share2, MessageSquare, Layout, Target,
    Facebook, Instagram, Mail, Check
} from 'lucide-react';

export default function FuturisticLandingPage() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const heroRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

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
            {/* Noise Texture Overlay */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-multiply"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
            </div>

            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${isScrolled
                ? 'bg-white/70 backdrop-blur-xl border-b border-black/5'
                : 'bg-transparent'
                }`}>
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
                            {['Recursos', 'Integrações', 'Preços'].map((item) => (
                                <Link key={item} href={`#${item.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`} className="text-sm font-medium text-gray-600 hover:text-black transition-colors relative group">
                                    {item}
                                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-black transition-all duration-300 group-hover:w-full" />
                                </Link>
                            ))}
                        </div>

                        <div className="hidden md:flex items-center gap-4">
                            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
                                Entrar
                            </Link>
                            <Link href="/register" className="group relative px-5 py-2 bg-black text-white text-sm font-medium rounded-full overflow-hidden shadow-lg shadow-black/10 hover:shadow-black/20 transition-all">
                                <span className="relative z-10 group-hover:text-white transition-colors">Começar Grátis</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </Link>
                        </div>

                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section ref={heroRef} className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex flex-col items-center text-center mb-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-black/5 shadow-sm mb-8 animate-fade-in-up hover:scale-105 transition-transform cursor-default">
                            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                            <span className="text-xs font-medium text-gray-600 tracking-wide uppercase">Novo Kuiz 2.0</span>
                        </div>

                        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.95] mb-8 animate-fade-in-up animation-delay-200 text-transparent bg-clip-text bg-gradient-to-b from-black via-gray-800 to-gray-500 drop-shadow-sm">
                            O futuro da
                            <br />
                            geração de leads.
                        </h1>

                        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up animation-delay-400 font-light">
                            Crie quizzes interativos que parecem mágica.
                            Engaje visitantes, capture dados valiosos e converta leads com
                            uma elegância incomparável.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up animation-delay-600">
                            <Link href="/register" className="h-12 px-8 rounded-full bg-black text-white font-medium flex items-center gap-2 hover:scale-105 transition-transform duration-300 shadow-xl shadow-black/20 hover:shadow-black/30">
                                Criar Quiz Grátis
                                <ArrowRight size={16} />
                            </Link>
                            <button className="h-12 px-8 rounded-full bg-white border border-black/5 text-black font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md">
                                <Play size={14} fill="currentColor" />
                                Ver Demonstração
                            </button>
                        </div>
                    </div>

                    {/* 3D Mockup Container */}
                    <div className="relative max-w-5xl mx-auto perspective-1000 animate-fade-in-up animation-delay-800">
                        <div
                            className="relative bg-white rounded-2xl shadow-2xl border border-black/5 overflow-hidden transition-transform duration-100 ease-out"
                            style={{
                                transform: `rotateX(${mousePosition.y * -3}deg) rotateY(${mousePosition.x * 3}deg)`,
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
                            }}
                        >
                            {/* Browser Header */}
                            <div className="h-12 bg-[#F5F5F7]/80 backdrop-blur-md border-b border-black/5 flex items-center px-4 gap-4 sticky top-0 z-20">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-inner" />
                                    <div className="w-3 h-3 rounded-full bg-[#FEBC2E] shadow-inner" />
                                    <div className="w-3 h-3 rounded-full bg-[#28C840] shadow-inner" />
                                </div>
                                <div className="flex-1 flex justify-center">
                                    <div className="bg-white/50 h-7 w-64 rounded-md shadow-sm flex items-center justify-center text-xs text-gray-400 gap-2 border border-black/5">
                                        <Lock size={10} />
                                        kuiz.app/demo
                                    </div>
                                </div>
                            </div>

                            {/* App Interface */}
                            <div className="flex h-[600px]">
                                {/* Sidebar */}
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
                                            { name: 'Configurações', active: false }
                                        ].map((item) => (
                                            <div key={item.name} className={`px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${item.active ? 'bg-white shadow-sm text-black ring-1 ring-black/5' : 'text-gray-500 hover:bg-black/5 hover:text-black'}`}>
                                                {item.name}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8">
                                        <div className="text-xs font-semibold text-gray-400 px-2 mb-2 uppercase tracking-wider">Componentes</div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { icon: Layout, label: 'Texto' },
                                                { icon: MousePointer2, label: 'Botão' },
                                                { icon: MessageSquare, label: 'Input' },
                                                { icon: Share2, label: 'Social' }
                                            ].map((comp) => (
                                                <div key={comp.label} className="flex flex-col items-center justify-center p-3 bg-white border border-black/5 rounded-lg hover:border-blue-500/50 hover:shadow-md hover:-translate-y-0.5 cursor-grab active:cursor-grabbing transition-all group">
                                                    <comp.icon size={16} className="text-gray-600 mb-1 group-hover:text-blue-500 transition-colors" />
                                                    <span className="text-[10px] text-gray-500 group-hover:text-gray-700">{comp.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Main Canvas */}
                                <div className="flex-1 bg-[#F0F2F5] p-8 flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />

                                    {/* Quiz Card */}
                                    <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-black/5 p-8 z-10 transform transition-transform hover:scale-[1.01] duration-500">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                                            <Sparkles className="text-white" />
                                        </div>

                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Pergunta 1 de 3</span>
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
                                                { icon: '🎓', text: 'Educar minha audiência', active: false }
                                            ].map((opt, i) => (
                                                <div key={i} className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${opt.active ? 'border-blue-500 bg-blue-50/30 shadow-sm' : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'}`}>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xl group-hover:scale-110 transition-transform duration-300">{opt.icon}</span>
                                                        <span className={`font-medium ${opt.active ? 'text-blue-700' : 'text-gray-700'}`}>{opt.text}</span>
                                                    </div>
                                                    {opt.active && <CheckCircle size={18} className="text-blue-500" />}
                                                </div>
                                            ))}
                                        </div>

                                        <button className="w-full mt-6 py-3.5 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0">
                                            Continuar
                                        </button>
                                    </div>

                                    {/* Floating Elements */}
                                    <div className="absolute top-20 right-10 bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-xl border border-black/5 animate-float z-20">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-xs font-bold">98% Taxa de Conclusão</span>
                                        </div>
                                    </div>

                                    <div className="absolute bottom-20 left-10 bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-xl border border-black/5 animate-float animation-delay-2000 z-20">
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

            {/* Bento Grid Features */}
            <section id="recursos" className="py-32 px-6 bg-white">
                <div className="max-w-[1400px] mx-auto">
                    <div className="mb-20 max-w-2xl">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                            Tudo que você precisa.
                            <br />
                            <span className="text-gray-400">Nada que você não precise.</span>
                        </h2>
                        <p className="text-xl text-gray-500">
                            Recursos poderosos embrulhados em uma interface linda.
                            Projetado para times de marketing modernos que exigem performance.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-min">
                        {/* Visual Builder Card */}
                        <div className="md:col-span-2 bg-[#F5F5F7] rounded-3xl p-8 md:p-12 relative overflow-hidden group min-h-[400px] hover:shadow-2xl transition-shadow duration-500">
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center mb-6 shadow-lg shadow-black/20">
                                    <Palette />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Editor Visual Drag & Drop</h3>
                                <p className="text-gray-500 max-w-md text-lg">
                                    Arraste, solte e personalize cada pixel. Nosso construtor visual
                                    dá a você controle total sem escrever uma única linha de código.
                                </p>
                                <ul className="mt-6 space-y-2">
                                    {['Componentes prontos', 'Preview em tempo real', 'Design responsivo automático'].map(item => (
                                        <li key={item} className="flex items-center gap-2 text-gray-600">
                                            <CheckCircle size={16} className="text-green-500" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="absolute right-0 bottom-0 w-2/3 h-2/3 bg-gradient-to-tl from-blue-100 to-transparent rounded-tl-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute right-10 bottom-10 transform translate-y-20 group-hover:translate-y-0 transition-transform duration-500 hidden md:block">
                                <div className="bg-white p-4 rounded-2xl shadow-xl border border-black/5 w-64">
                                    <div className="flex gap-2 mb-4">
                                        <div className="w-8 h-8 rounded bg-blue-100" />
                                        <div className="w-8 h-8 rounded bg-purple-100" />
                                        <div className="w-8 h-8 rounded bg-green-100" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-8 bg-blue-50 rounded-lg border border-blue-100 w-full" />
                                        <div className="h-8 bg-gray-50 rounded-lg w-full" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Analytics Card */}
                        <div className="bg-black text-white rounded-3xl p-8 md:p-12 relative overflow-hidden group min-h-[400px] hover:shadow-2xl hover:shadow-black/20 transition-shadow duration-500">
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div>
                                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 backdrop-blur-md border border-white/10">
                                        <BarChart3 />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4">Analytics em Tempo Real</h3>
                                    <p className="text-gray-400">
                                        Acompanhe performance ao vivo. Insights profundos sobre o comportamento do usuário.
                                    </p>
                                </div>
                                <div className="mt-8">
                                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                                        <span>Visitas</span>
                                        <span className="text-green-400">+127%</span>
                                    </div>
                                    <div className="flex items-end gap-2 h-32">
                                        {[40, 70, 45, 90, 65, 85, 95].map((h, i) => (
                                            <div key={i} className="flex-1 bg-white/20 rounded-t-lg hover:bg-blue-500 transition-colors duration-300" style={{ height: `${h}%` }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Integration Card */}
                        <div className="bg-[#F5F5F7] rounded-3xl p-8 relative overflow-hidden group hover:shadow-xl transition-shadow duration-500">
                            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                                <Target />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Integração com Ads</h3>
                            <p className="text-gray-500 text-sm mb-4">Conecte seu Pixel do Facebook, Google Ads e TikTok em segundos. Rastreamento de eventos automático.</p>
                            <div className="flex gap-2">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-sm"><Facebook size={16} /></div>
                                <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center text-white shadow-sm"><Instagram size={16} /></div>
                                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white shadow-sm"><Mail size={16} /></div>
                            </div>
                        </div>

                        {/* Performance Card */}
                        <div className="bg-[#F5F5F7] rounded-3xl p-8 relative overflow-hidden group hover:shadow-xl transition-shadow duration-500">
                            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                                <Zap />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Ultra Rápido</h3>
                            <p className="text-gray-500 text-sm">Otimizado para Core Web Vitals. Carregamento instantâneo para maximizar conversões mobile.</p>
                        </div>

                        {/* Security Card */}
                        <div className="bg-[#F5F5F7] rounded-3xl p-8 relative overflow-hidden group hover:shadow-xl transition-shadow duration-500">
                            <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center mb-4">
                                <Shield />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Segurança Enterprise</h3>
                            <p className="text-gray-500 text-sm">LGPD compliant. Criptografia de ponta a ponta para todos os dados coletados.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Components Showcase */}
            <section className="py-20 bg-black text-white overflow-hidden">
                <div className="max-w-[1400px] mx-auto px-6 mb-12">
                    <h2 className="text-3xl font-bold">Componentes Poderosos</h2>
                </div>
                <div className="flex gap-8 animate-marquee whitespace-nowrap px-6">
                    {[
                        { icon: MessageSquare, label: 'Múltipla Escolha' },
                        { icon: Smartphone, label: 'Responsivo' },
                        { icon: Share2, label: 'Social Share' },
                        { icon: BarChart3, label: 'Enquetes' },
                        { icon: Star, label: 'Avaliações' },
                        { icon: Layers, label: 'Popups' },
                        { icon: Palette, label: 'Temas' },
                        { icon: Globe, label: 'Domínio Próprio' },
                        { icon: Lock, label: 'SSL Grátis' },
                        { icon: Zap, label: 'Carregamento Rápido' }
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 bg-white/10 px-6 py-4 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
                            <item.icon className="text-blue-400" />
                            <span className="text-lg font-medium">{item.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Pricing Section */}
            <section id="precos" className="py-32 px-6 bg-[#F5F5F7]">
                <div className="max-w-[1400px] mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                            Planos simples e transparentes.
                        </h2>
                        <p className="text-xl text-gray-500 mb-8">
                            Comece grátis e escale conforme seu crescimento.
                        </p>

                        {/* Billing Toggle */}
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
                                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">-20%</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Starter Plan */}
                        <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col">
                            <div className="mb-8">
                                <h3 className="text-xl font-bold mb-2">Starter</h3>
                                <p className="text-gray-500 text-sm">Para quem está começando.</p>
                            </div>
                            <div className="mb-8">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold">R$ 0</span>
                                    <span className="text-gray-500">/mês</span>
                                </div>
                                <p className="text-sm text-gray-400 mt-2">Grátis para sempre</p>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                {[
                                    '1 Quiz ativo',
                                    '100 respostas/mês',
                                    'Analytics básico',
                                    'Domínio kuiz.app',
                                    'Suporte por email'
                                ].map((feature) => (
                                    <li key={feature} className="flex items-center gap-3 text-sm text-gray-600">
                                        <Check size={16} className="text-black" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Link href="/register" className="w-full py-3 rounded-xl border border-black/10 text-black font-medium hover:bg-gray-50 transition-colors text-center">
                                Começar Grátis
                            </Link>
                        </div>

                        {/* Pro Plan */}
                        <div className="bg-black text-white rounded-3xl p-8 border border-black/5 shadow-2xl hover:scale-105 transition-transform duration-300 flex flex-col relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-gradient-to-bl from-blue-600 to-purple-600 text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
                                POPULAR
                            </div>
                            <div className="mb-8">
                                <h3 className="text-xl font-bold mb-2">Pro</h3>
                                <p className="text-gray-400 text-sm">Para criadores em crescimento.</p>
                            </div>
                            <div className="mb-8">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold">R$ {billingCycle === 'monthly' ? '49' : '39'}</span>
                                    <span className="text-gray-400">/mês</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">Cobrado {billingCycle === 'monthly' ? 'mensalmente' : 'anualmente'}</p>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                {[
                                    'Quizzes ilimitados',
                                    '5.000 respostas/mês',
                                    'Analytics avançado',
                                    'Domínio personalizado',
                                    'Remoção da marca Kuiz',
                                    'Integração com Pixel',
                                    'Exportação de leads'
                                ].map((feature) => (
                                    <li key={feature} className="flex items-center gap-3 text-sm text-gray-300">
                                        <Check size={16} className="text-blue-400" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Link href="/register" className="w-full py-3 rounded-xl bg-white text-black font-medium hover:bg-gray-100 transition-colors text-center shadow-lg shadow-white/10">
                                Começar Teste Grátis
                            </Link>
                        </div>

                        {/* Business Plan */}
                        <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col">
                            <div className="mb-8">
                                <h3 className="text-xl font-bold mb-2">Business</h3>
                                <p className="text-gray-500 text-sm">Para agências e times.</p>
                            </div>
                            <div className="mb-8">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold">R$ {billingCycle === 'monthly' ? '149' : '119'}</span>
                                    <span className="text-gray-500">/mês</span>
                                </div>
                                <p className="text-sm text-gray-400 mt-2">Cobrado {billingCycle === 'monthly' ? 'mensalmente' : 'anualmente'}</p>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                {[
                                    'Tudo do plano Pro',
                                    '50.000 respostas/mês',
                                    'Múltiplos usuários',
                                    'API de acesso',
                                    'Webhooks',
                                    'Suporte prioritário',
                                    'Onboarding dedicado'
                                ].map((feature) => (
                                    <li key={feature} className="flex items-center gap-3 text-sm text-gray-600">
                                        <Check size={16} className="text-black" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Link href="/register" className="w-full py-3 rounded-xl border border-black/10 text-black font-medium hover:bg-gray-50 transition-colors text-center">
                                Falar com Vendas
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8">
                        Pronto para decolar?
                    </h2>
                    <p className="text-xl text-gray-500 mb-12 max-w-xl mx-auto">
                        Junte-se a mais de 10.000 criadores construindo o futuro do conteúdo interativo.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/register" className="h-14 px-10 rounded-full bg-black text-white text-lg font-medium flex items-center gap-2 hover:scale-105 transition-transform shadow-2xl shadow-black/20">
                            Começar Agora Grátis
                            <ArrowRight />
                        </Link>
                    </div>
                    <p className="mt-6 text-sm text-gray-400">
                        Sem cartão de crédito • Cancelamento a qualquer momento
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-gray-100 bg-white">
                <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-black rounded-md flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-white" />
                        </div>
                        <span className="font-semibold">Kuiz</span>
                    </div>
                    <div className="flex gap-8 text-sm text-gray-500">
                        <Link href="#" className="hover:text-black transition-colors">Privacidade</Link>
                        <Link href="#" className="hover:text-black transition-colors">Termos</Link>
                        <Link href="#" className="hover:text-black transition-colors">Twitter</Link>
                        <Link href="#" className="hover:text-black transition-colors">Instagram</Link>
                    </div>
                    <p className="text-sm text-gray-400">© 2024 Kuiz Inc. Todos os direitos reservados.</p>
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
