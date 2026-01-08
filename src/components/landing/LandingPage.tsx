"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
    Menu,
    X,
    ChevronRight,
    Mail,
    MapPin,
    Instagram,
    Twitter,
    Linkedin,
    Sparkles,
    Zap,
    Palette,
    LineChart,
    ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { HeroSection } from "./HeroSection"
import { PricingSection } from "./PricingSection"

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
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            {/* Header */}
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${scrollY > 50 ? "shadow-md" : ""}`}
            >
                <div className="container flex h-16 items-center justify-between border-x border-muted px-4 md:px-6">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center space-x-3">
                            <motion.div
                                whileHover={{ rotate: 5, scale: 1.1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center"
                            >
                                <Sparkles className="h-5 w-5 text-primary-foreground" />
                            </motion.div>
                            <span className="font-bold text-xl">Kuiz</span>
                        </Link>
                    </div>
                    <nav className="hidden md:flex gap-6">
                        <Link href="#features" className="text-sm font-medium transition-colors hover:text-primary">
                            Recursos
                        </Link>
                        <Link href="#stats" className="text-sm font-medium transition-colors hover:text-primary">
                            Resultados
                        </Link>
                        <Link href="#pricing" className="text-sm font-medium transition-colors hover:text-primary">
                            Preços
                        </Link>
                        <Link href="#testimonials" className="text-sm font-medium transition-colors hover:text-primary">
                            Depoimentos
                        </Link>
                        <Link href="#contact" className="text-sm font-medium transition-colors hover:text-primary">
                            Contato
                        </Link>
                    </nav>
                    <div className="hidden md:flex items-center gap-3">
                        <Button variant="ghost" size="sm" className="rounded-full" asChild>
                            <Link href="/login">Fazer Login</Link>
                        </Button>
                        <Button size="sm" className="rounded-full" asChild>
                            <Link href="/register">Começar Gratuitamente</Link>
                        </Button>
                    </div>
                    <button className="flex md:hidden" onClick={toggleMenu}>
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Toggle menu</span>
                    </button>
                </div>
            </motion.header>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-background md:hidden"
                >
                    <div className="container flex h-16 items-center justify-between px-4">
                        <div className="flex items-center gap-3">
                            <Link href="/" className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                                    <Sparkles className="h-5 w-5 text-primary-foreground" />
                                </div>
                                <span className="font-bold text-xl">Kuiz</span>
                            </Link>
                        </div>
                        <button onClick={toggleMenu}>
                            <X className="h-6 w-6" />
                            <span className="sr-only">Close menu</span>
                        </button>
                    </div>
                    <motion.nav
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="container grid gap-3 pb-8 pt-6 px-4"
                    >
                        {[
                            { name: "Recursos", href: "#features" },
                            { name: "Resultados", href: "#stats" },
                            { name: "Preços", href: "#pricing" },
                            { name: "Depoimentos", href: "#testimonials" },
                            { name: "Contato", href: "#contact" }
                        ].map((item, index) => (
                            <motion.div key={index} variants={itemFadeIn}>
                                <Link
                                    href={item.href}
                                    className="flex items-center justify-between rounded-xl px-3 py-2 text-lg font-medium hover:bg-accent"
                                    onClick={toggleMenu}
                                >
                                    {item.name}
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </motion.div>
                        ))}
                        <motion.div variants={itemFadeIn} className="flex flex-col gap-3 pt-4">
                            <Button variant="outline" className="w-full rounded-full" asChild>
                                <Link href="/login">Fazer Login</Link>
                            </Button>
                            <Button className="w-full rounded-full" asChild>
                                <Link href="/register">Começar Gratuitamente</Link>
                            </Button>
                        </motion.div>
                    </motion.nav>
                </motion.div>
            )}

            <main className="flex-1">
                {/* Hero Section */}
                <HeroSection />

                {/* Stats Section (Replaces Clients) */}
                <section id="stats" className="w-full py-12 md:py-16 lg:py-20 bg-muted/30">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeIn}
                        className="container px-4 md:px-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            <div className="p-6 rounded-2xl bg-background shadow-sm border">
                                <h3 className="text-4xl font-bold text-primary mb-2">10K+</h3>
                                <p className="text-muted-foreground font-medium">Usuários Ativos</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-background shadow-sm border">
                                <h3 className="text-4xl font-bold text-primary mb-2">50K+</h3>
                                <p className="text-muted-foreground font-medium">Quizzes Criados</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-background shadow-sm border">
                                <h3 className="text-4xl font-bold text-primary mb-2">95%</h3>
                                <p className="text-muted-foreground font-medium">Satisfação</p>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* Features Section (Replaces Services) */}
                <section id="features" className="w-full py-12 md:py-24 lg:py-32">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeIn}
                        className="container px-4 md:px-6"
                    >
                        <div className="flex flex-col items-center justify-center space-y-4 text-center py-10">
                            <div className="space-y-3">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="inline-block rounded-full bg-muted px-3 py-1 text-sm font-medium"
                                >
                                    Recursos
                                </motion.div>
                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
                                >
                                    Tudo que você precisa
                                </motion.h2>
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.3 }}
                                    className="mx-auto max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
                                >
                                    Ferramentas poderosas para criar, gerenciar e otimizar seus quizzes.
                                </motion.p>
                            </div>
                        </div>
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-2 lg:grid-cols-4"
                        >
                            {[
                                {
                                    icon: <Zap className="h-10 w-10 text-primary" />,
                                    title: "Rápido e Fácil",
                                    description:
                                        "Crie quizzes profissionais em minutos com nosso editor visual intuitivo.",
                                },
                                {
                                    icon: <LineChart className="h-10 w-10 text-primary" />,
                                    title: "Analytics Poderoso",
                                    description:
                                        "Acompanhe cada interação e otimize suas conversões com dados em tempo real.",
                                },
                                {
                                    icon: <Palette className="h-10 w-10 text-primary" />,
                                    title: "100% Personalizável",
                                    description:
                                        "Customize cores, fontes e layout para combinar perfeitamente com sua marca.",
                                },
                                {
                                    icon: <ShieldCheck className="h-10 w-10 text-primary" />,
                                    title: "Seguro e Confiável",
                                    description: "Seus dados e dos seus clientes estão protegidos com criptografia de ponta.",
                                },
                            ].map((feature, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemFadeIn}
                                    whileHover={{ y: -10, transition: { duration: 0.3 } }}
                                    className="group relative overflow-hidden rounded-3xl border p-6 shadow-sm transition-all hover:shadow-md bg-background h-full"
                                >
                                    <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-all duration-300"></div>
                                    <div className="relative space-y-4">
                                        <div className="mb-4 bg-primary/10 w-fit p-3 rounded-2xl">{feature.icon}</div>
                                        <h3 className="text-xl font-bold">{feature.title}</h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </section>

                {/* Pricing Section */}
                <PricingSection />

                {/* Testimonials */}
                <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-muted/20">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeIn}
                        className="container px-4 md:px-6"
                    >
                        <div className="flex flex-col items-center justify-center space-y-4 text-center py-10">
                            <div className="space-y-3">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="inline-block rounded-full bg-background px-3 py-1 text-sm border shadow-sm"
                                >
                                    Depoimentos
                                </motion.div>
                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
                                >
                                    O que nossos clientes dizem
                                </motion.h2>
                            </div>
                        </div>
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-2"
                        >
                            {[
                                {
                                    quote:
                                        "O Kuiz transformou a maneira como capturamos leads. A taxa de conversão dobrou desde que começamos a usar.",
                                    author: "Mariana Silva",
                                    company: "CEO, MarketingDigital",
                                },
                                {
                                    quote:
                                        "A facilidade de uso é impressionante. Consegui criar um quiz complexo em menos de uma hora.",
                                    author: "Carlos Eduardo",
                                    company: "Diretor de Vendas, TechSol",
                                },
                                {
                                    quote:
                                        "O suporte é fantástico e as ferramentas de analytics me dão insights valiosos sobre meu público.",
                                    author: "Fernanda Costa",
                                    company: "Gerente de Produto, Inova",
                                },
                                {
                                    quote:
                                        "Recomendo para qualquer empresa que queira engajar sua audiência de forma inteligente.",
                                    author: "Ricardo Alves",
                                    company: "Fundador, StartGrowth",
                                },
                            ].map((testimonial, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemFadeIn}
                                    whileHover={{ y: -5 }}
                                    className="flex flex-col justify-between rounded-3xl border bg-background p-8 shadow-sm"
                                >
                                    <div>
                                        <div className="flex gap-0.5 text-yellow-500 mb-4">
                                            {[...Array(5)].map((_, i) => (
                                                <svg
                                                    key={i}
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 24 24"
                                                    fill="currentColor"
                                                    className="h-5 w-5"
                                                >
                                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <blockquote className="text-lg font-medium leading-relaxed text-foreground/90">"{testimonial.quote}"</blockquote>
                                    </div>
                                    <div className="mt-6 flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {testimonial.author.charAt(0)}
                                        </div>
                                        <div className="ml-4">
                                            <p className="font-medium">{testimonial.author}</p>
                                            <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </section>

                {/* Contact Section */}
                <section id="contact" className="w-full py-12 md:py-24 lg:py-32">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeIn}
                        className="container grid items-center gap-8 px-4 md:px-6 lg:grid-cols-2"
                    >
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-4"
                        >
                            <div className="inline-block rounded-full bg-muted px-3 py-1 text-sm font-medium">Contato</div>
                            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Vamos conversar?</h2>
                            <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                                Pronto para começar seu próximo projeto? Entre em contato conosco para discutir como podemos ajudar.
                            </p>
                            <div className="mt-8 space-y-6">
                                <motion.div whileHover={{ x: 5 }} className="flex items-start gap-4">
                                    <div className="rounded-2xl bg-primary/10 p-3">
                                        <MapPin className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-lg">Nossa Localização</h3>
                                        <p className="text-muted-foreground">São Paulo, SP - Brasil</p>
                                    </div>
                                </motion.div>
                                <motion.div whileHover={{ x: 5 }} className="flex items-start gap-4">
                                    <div className="rounded-2xl bg-primary/10 p-3">
                                        <Mail className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-lg">Email</h3>
                                        <p className="text-muted-foreground">contato@kuiz.com.br</p>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="rounded-3xl border bg-background p-8 shadow-lg"
                        >
                            <h3 className="text-xl font-bold mb-2">Envie uma mensagem</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                Preencha o formulário abaixo e entraremos em contato em breve.
                            </p>
                            <form className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <label htmlFor="first-name" className="text-sm font-medium">Nome</label>
                                        <Input id="first-name" placeholder="Seu nome" className="rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="last-name" className="text-sm font-medium">Sobrenome</label>
                                        <Input id="last-name" placeholder="Seu sobrenome" className="rounded-xl" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                                    <Input id="email" type="email" placeholder="seu@email.com" className="rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-medium">Mensagem</label>
                                    <Textarea id="message" placeholder="Como podemos ajudar?" className="min-h-[120px] rounded-xl" />
                                </div>
                                <Button type="submit" className="w-full rounded-xl h-12 text-base">
                                    Enviar Mensagem
                                </Button>
                            </form>
                        </motion.div>
                    </motion.div>
                </section>
            </main>

            {/* Footer */}
            <footer className="w-full border-t bg-muted/10">
                <div className="container grid gap-8 px-4 py-12 md:px-6 lg:grid-cols-4">
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                                <Sparkles className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <span className="font-bold text-xl">Kuiz</span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            A plataforma mais poderosa para criar funis de quiz interativos que convertem.
                        </p>
                        <div className="flex space-x-4">
                            {[
                                { icon: <Instagram className="h-5 w-5" />, label: "Instagram" },
                                { icon: <Twitter className="h-5 w-5" />, label: "Twitter" },
                                { icon: <Linkedin className="h-5 w-5" />, label: "LinkedIn" },
                            ].map((social, index) => (
                                <Link key={index} href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                    {social.icon}
                                    <span className="sr-only">{social.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Produto</h3>
                        <nav className="flex flex-col space-y-2 text-sm">
                            <Link href="#" className="text-muted-foreground hover:text-foreground">Recursos</Link>
                            <Link href="#" className="text-muted-foreground hover:text-foreground">Preços</Link>
                            <Link href="#" className="text-muted-foreground hover:text-foreground">Casos de Uso</Link>
                            <Link href="#" className="text-muted-foreground hover:text-foreground">Atualizações</Link>
                        </nav>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Empresa</h3>
                        <nav className="flex flex-col space-y-2 text-sm">
                            <Link href="#" className="text-muted-foreground hover:text-foreground">Sobre Nós</Link>
                            <Link href="#" className="text-muted-foreground hover:text-foreground">Carreiras</Link>
                            <Link href="#" className="text-muted-foreground hover:text-foreground">Blog</Link>
                            <Link href="#" className="text-muted-foreground hover:text-foreground">Contato</Link>
                        </nav>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Legal</h3>
                        <nav className="flex flex-col space-y-2 text-sm">
                            <Link href="#" className="text-muted-foreground hover:text-foreground">Privacidade</Link>
                            <Link href="#" className="text-muted-foreground hover:text-foreground">Termos de Uso</Link>
                            <Link href="#" className="text-muted-foreground hover:text-foreground">Cookies</Link>
                        </nav>
                    </div>
                </div>
                <div className="border-t">
                    <div className="container flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
                        <p className="text-sm text-muted-foreground">
                            &copy; {new Date().getFullYear()} Kuiz. Todos os direitos reservados.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
