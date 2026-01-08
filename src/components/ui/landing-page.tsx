"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
    Menu,
    X,
    ArrowRight,
    ChevronRight,
    Sparkles,
    Zap,
    BarChart3,
    Palette,
    Shield,
    Users,
    CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

// Animation variants
const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6 },
    },
}

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
}

const itemFadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5 },
    },
}

export function LandingPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [scrollY, setScrollY] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY)
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className={`sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 ${scrollY > 50 ? "shadow-md" : ""}`}
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link href="/" className="flex items-center space-x-3">
                                <motion.div
                                    whileHover={{ rotate: 5, scale: 1.1 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                    className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg"
                                >
                                    <Sparkles className="h-5 w-5 text-white" />
                                </motion.div>
                                <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Kuiz
                                </span>
                            </Link>
                        </div>
                        <nav className="hidden md:flex gap-6">
                            <Link href="#features" className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600">
                                Recursos
                            </Link>
                            <Link href="#stats" className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600">
                                Resultados
                            </Link>
                            <Link href="#cta" className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600">
                                Começar
                            </Link>
                        </nav>
                        <div className="hidden md:flex items-center gap-3">
                            <Button variant="outline" size="sm" className="rounded-xl border-gray-300" asChild>
                                <Link href="/login">Fazer Login</Link>
                            </Button>
                            <Button size="sm" className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" asChild>
                                <Link href="/register">Começar Grátis</Link>
                            </Button>
                        </div>
                        <button className="flex md:hidden" onClick={toggleMenu}>
                            <Menu className="h-6 w-6 text-gray-700" />
                            <span className="sr-only">Toggle menu</span>
                        </button>
                    </div>
                </div>
            </motion.header>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-white md:hidden"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Link href="/" className="flex items-center space-x-3">
                                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                                        <Sparkles className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        Kuiz
                                    </span>
                                </Link>
                            </div>
                            <button onClick={toggleMenu}>
                                <X className="h-6 w-6 text-gray-700" />
                                <span className="sr-only">Close menu</span>
                            </button>
                        </div>
                    </div>
                    <motion.nav
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-3 pb-8 pt-6"
                    >
                        {["Recursos", "Resultados", "Começar"].map((item, index) => (
                            <motion.div key={index} variants={itemFadeIn}>
                                <Link
                                    href={`#${item.toLowerCase()}`}
                                    className="flex items-center justify-between rounded-xl px-4 py-3 text-lg font-medium hover:bg-blue-50 text-gray-700"
                                    onClick={toggleMenu}
                                >
                                    {item}
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </motion.div>
                        ))}
                        <motion.div variants={itemFadeIn} className="flex flex-col gap-3 pt-4">
                            <Button variant="outline" className="w-full rounded-xl border-gray-300" asChild>
                                <Link href="/login">Fazer Login</Link>
                            </Button>
                            <Button className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600" asChild>
                                <Link href="/register">Começar Grátis</Link>
                            </Button>
                        </motion.div>
                    </motion.nav>
                </motion.div>
            )}

            <main className="flex-1">
                {/* Hero Section */}
                <section className="w-full py-16 md:py-24 lg:py-32 overflow-hidden">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeIn}
                            className="flex flex-col items-center justify-center space-y-8 text-center"
                        >
                            <div className="space-y-6 w-full max-w-4xl mx-auto">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700"
                                >
                                    <Zap className="mr-2 h-4 w-4" />
                                    Plataforma de Quiz Interativo
                                </motion.div>
                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.7, delay: 0.2 }}
                                    className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-gray-900"
                                >
                                    Crie{" "}
                                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        Quizzes Incríveis
                                    </span>
                                    <br />
                                    em Minutos
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.7, delay: 0.4 }}
                                    className="mx-auto max-w-3xl text-lg md:text-xl lg:text-2xl text-gray-600 px-4"
                                >
                                    A plataforma mais poderosa para criar funis de quiz interativos que convertem visitantes em leads
                                    qualificados.
                                </motion.p>
                            </div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.6 }}
                                className="flex flex-col sm:flex-row gap-4 w-full justify-center px-4"
                            >
                                <Button size="lg" className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-base md:text-lg px-6 md:px-8 py-5 md:py-6 shadow-lg hover:shadow-xl transition-all group w-full sm:w-auto" asChild>
                                    <Link href="/register">
                                        Começar Gratuitamente
                                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                                <Button variant="outline" size="lg" className="rounded-xl text-base md:text-lg px-6 md:px-8 py-5 md:py-6 border-gray-300 w-full sm:w-auto" asChild>
                                    <Link href="/login">Fazer Login</Link>
                                </Button>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="w-full py-16 md:py-24 lg:py-32 bg-white">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
                        >
                            {[
                                {
                                    icon: <Zap className="h-8 w-8 text-blue-600" />,
                                    title: "Rápido e Fácil",
                                    description: "Crie quizzes profissionais em minutos com nosso editor visual intuitivo.",
                                    bgColor: "bg-blue-100",
                                },
                                {
                                    icon: <BarChart3 className="h-8 w-8 text-purple-600" />,
                                    title: "Analytics Poderoso",
                                    description: "Acompanhe cada interação e otimize suas conversões com dados em tempo real.",
                                    bgColor: "bg-purple-100",
                                },
                                {
                                    icon: <Palette className="h-8 w-8 text-green-600" />,
                                    title: "100% Personalizável",
                                    description: "Customize cores, fontes e layout para combinar com sua marca.",
                                    bgColor: "bg-green-100",
                                },
                                {
                                    icon: <Shield className="h-8 w-8 text-orange-600" />,
                                    title: "Seguro e Confiável",
                                    description: "Seus dados e dos seus clientes estão protegidos com criptografia de ponta.",
                                    bgColor: "bg-orange-100",
                                },
                            ].map((feature, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemFadeIn}
                                    whileHover={{ y: -10, transition: { duration: 0.3 } }}
                                    className="group relative overflow-hidden rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm transition-all hover:shadow-xl bg-white"
                                >
                                    <div className="relative space-y-4">
                                        <div className={`mb-4 inline-flex items-center justify-center w-14 h-14 rounded-xl ${feature.bgColor}`}>
                                            {feature.icon}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                                        <p className="text-gray-600 text-sm md:text-base">{feature.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* Stats Section */}
                <section id="stats" className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-br from-blue-50 to-purple-50">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-gray-900"
                            >
                                Resultados que Impressionam
                            </motion.h2>
                        </div>
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="grid gap-6 md:gap-8 sm:grid-cols-3"
                        >
                            {[
                                { value: "10K+", label: "Usuários Ativos", icon: <Users className="h-8 w-8" />, gradient: "from-blue-600 to-purple-600", iconColor: "text-blue-600" },
                                { value: "50K+", label: "Quizzes Criados", icon: <Sparkles className="h-8 w-8" />, gradient: "from-purple-600 to-pink-600", iconColor: "text-purple-600" },
                                { value: "95%", label: "Satisfação", icon: <CheckCircle2 className="h-8 w-8" />, gradient: "from-green-600 to-emerald-600", iconColor: "text-green-600" },
                            ].map((stat, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemFadeIn}
                                    whileHover={{ scale: 1.05 }}
                                    className="flex flex-col items-center justify-center rounded-2xl bg-white p-8 md:p-10 shadow-lg"
                                >
                                    <div className={`mb-4 ${stat.iconColor}`}>{stat.icon}</div>
                                    <div className={`text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                                        {stat.value}
                                    </div>
                                    <div className="text-gray-600 font-medium text-base md:text-lg">{stat.label}</div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* CTA Section */}
                <section id="cta" className="w-full py-16 md:py-24 lg:py-32 bg-white">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeIn}
                            className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 md:p-12 text-center text-white shadow-2xl"
                        >
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="text-3xl md:text-4xl font-bold mb-4"
                            >
                                Pronto para começar?
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="text-lg md:text-xl mb-8 opacity-90"
                            >
                                Junte-se a milhares de criadores que já estão convertendo mais com Kuiz
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                            >
                                <Button
                                    size="lg"
                                    className="rounded-xl bg-white text-blue-600 hover:bg-gray-100 text-base md:text-lg px-6 md:px-8 py-5 md:py-6 shadow-lg hover:shadow-xl transition-all group"
                                    asChild
                                >
                                    <Link href="/register">
                                        Criar Conta Grátis
                                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="w-full border-t bg-gray-900 text-white py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeIn}
                        className="flex flex-col items-center justify-center space-y-4 text-center"
                    >
                        <Link href="/" className="flex items-center space-x-3">
                            <motion.div
                                whileHover={{ rotate: 5, scale: 1.1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg"
                            >
                                <Sparkles className="h-5 w-5 text-white" />
                            </motion.div>
                            <span className="font-bold text-2xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Kuiz
                            </span>
                        </Link>
                        <p className="text-gray-400">© 2024 Kuiz. Todos os direitos reservados.</p>
                    </motion.div>
                </div>
            </footer>
        </div>
    )
}
