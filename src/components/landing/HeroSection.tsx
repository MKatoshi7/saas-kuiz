'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, CirclePlay } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
    return (
        <section className="bg-gradient-to-b from-background to-muted/20 overflow-hidden relative">
            <div className="relative py-20 md:py-32 container mx-auto px-4 md:px-6">
                <div className="relative z-10 w-full">
                    <div className="md:w-1/2">
                        <div>
                            <h1 className="max-w-xl text-balance text-5xl font-bold md:text-6xl tracking-tight text-foreground">
                                Crie Quizzes Incríveis em Minutos
                            </h1>
                            <p className="text-muted-foreground my-8 max-w-2xl text-balance text-xl">
                                A plataforma mais poderosa para criar funis de quiz interativos que convertem visitantes em leads qualificados.
                            </p>

                            <div className="flex items-center gap-3">
                                <Button asChild size="lg" className="pr-4.5 rounded-3xl text-base h-12 px-6">
                                    <Link href="/register">
                                        <span className="text-nowrap">Começar Gratuitamente</span>
                                        <ChevronRight className="opacity-50 ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button key={2} asChild size="lg" variant="outline" className="pl-5 rounded-3xl text-base h-12 px-6">
                                    <Link href="#demo">
                                        <CirclePlay className="mr-2 h-4 w-4 fill-primary/25 stroke-primary" />
                                        <span className="text-nowrap">Ver Vídeo</span>
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        <div className="mt-12">
                            <p className="text-muted-foreground text-sm font-medium mb-4">Confiado por times inovadores:</p>
                            <div className="flex gap-8 grayscale opacity-60">
                                <div className="flex items-center">
                                    <img
                                        className="h-6 w-fit"
                                        src="https://html.tailus.io/blocks/customers/column.svg"
                                        alt="Column Logo"
                                        height="24"
                                        width="auto"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <img
                                        className="h-6 w-fit"
                                        src="https://html.tailus.io/blocks/customers/nvidia.svg"
                                        alt="Nvidia Logo"
                                        height="24"
                                        width="auto"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <img
                                        className="h-6 w-fit"
                                        src="https://html.tailus.io/blocks/customers/github.svg"
                                        alt="GitHub Logo"
                                        height="24"
                                        width="auto"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-16 md:absolute md:-right-[10%] md:top-20 md:mt-0 md:w-[60%] lg:w-[65%] perspective-1000">
                    <div className="relative h-full w-full">
                        <div className="bg-background rounded-xl shadow-2xl ring-1 ring-gray-900/10 relative h-full -translate-y-6 skew-x-[-6deg] -rotate-6 overflow-hidden border border-gray-200 transform-gpu transition-all hover:skew-x-0 hover:rotate-0 duration-700 ease-out origin-center">
                            <Image
                                src="https://tailark.com/_next/image?url=%2Fmist%2Ftailark.png&w=3840&q=75"
                                alt="App Screenshot"
                                width={2880}
                                height={1842}
                                className="object-cover object-top w-full h-full"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
