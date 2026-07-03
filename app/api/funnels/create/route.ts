import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { FUNNEL_TEMPLATES, getTemplate } from '@/lib/templates'
import { getPlanLimits } from '@/lib/limits'

export async function GET() {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }
        return NextResponse.json({ templates: FUNNEL_TEMPLATES })
    } catch (e) {
        return NextResponse.json({ error: 'Erro' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const body = await request.json()
        const { title, description, templateId } = body

        if (!title) {
            return NextResponse.json({ error: 'Título é obrigatório' }, { status: 400 })
        }

        // Plano/limite
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            include: { _count: { select: { funnels: true } } },
        })
        if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

        const limits = getPlanLimits(user.subscriptionPlan)
        if (user._count.funnels >= limits.funnels) {
            return NextResponse.json(
                { error: `Limite de funis atingido para o plano ${user.subscriptionPlan || 'Gratuito'}.` },
                { status: 403 }
            )
        }

        const template = templateId ? getTemplate(templateId) : null
        if (templateId && !template) {
            return NextResponse.json({ error: 'Template não encontrado' }, { status: 404 })
        }

        // Slug
        const baseSlug = title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '')
        const slug = `${baseSlug || 'funnel'}-${Date.now()}`

        // Steps do template (ou 1 step em branco)
        const tplSteps = template?.steps ?? [
            { title: 'Início', slug: 'inicio', components: [] as any[] },
        ]

        const funnel = await prisma.funnel.create({
            data: {
                title,
                description: description || null,
                slug,
                userId: session.userId,
                status: 'draft',
                themeConfig: template
                    ? {
                          primaryColor: template.theme.primaryColor,
                          fontFamily: template.theme.fontFamily,
                          page: { type: 'color', value: template.theme.pageBackground },
                          container: {
                              show: true,
                              backgroundColor: template.theme.containerBg,
                              borderRadius: '24px',
                              shadow: 'xl',
                              opacity: 100,
                              blur: 0,
                          },
                          logo: { url: '', size: 'md', height: 60, link: '', isSticky: false },
                          progressBar: { show: true, color: template.theme.primaryColor, isSticky: false },
                      }
                    : {
                          primaryColor: '#007AFF',
                          textColor: '#1F2937',
                          fontFamily: 'Inter',
                          page: { type: 'color', value: '#FFFFFF' },
                          container: {
                              show: true,
                              backgroundColor: '#FFFFFF',
                              borderRadius: '16px',
                              shadow: 'lg',
                              opacity: 100,
                              blur: 0,
                          },
                          logo: { url: '', size: 'md', height: 60, link: '', isSticky: false },
                          progressBar: { show: true, color: '#007AFF', isSticky: false },
                      },
                steps: {
                    create: tplSteps.map((s, index) => ({
                        title: s.title,
                        slug: s.slug,
                        order: index,
                        components: {
                            create: (s.components || []).map((c, cIndex) => ({
                                type: c.type,
                                order: cIndex,
                                data: c.data as any,
                            })),
                        },
                    })),
                },
            },
            include: { steps: { include: { components: true } } },
        })

        return NextResponse.json({ funnel })
    } catch (error) {
        console.error('Create funnel from template error:', error)
        return NextResponse.json({ error: 'Erro ao criar projeto' }, { status: 500 })
    }
}
