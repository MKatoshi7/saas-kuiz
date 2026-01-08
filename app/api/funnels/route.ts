import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const formData = await request.formData();
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;

        if (!title) {
            return NextResponse.json(
                { error: 'Título é obrigatório' },
                { status: 400 }
            );
        }

        // Check plan limits
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            include: { _count: { select: { funnels: true } } }
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        const { getPlanLimits } = await import('@/lib/limits');
        const limits = getPlanLimits(user.subscriptionPlan);

        if (user._count.funnels >= limits.funnels) {
            return NextResponse.json(
                { error: `Limite de funis atingido para o plano ${user.subscriptionPlan || 'Gratuito'}. Atualize seu plano para criar mais.` },
                { status: 403 }
            );
        }

        const slug = title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');

        const newFunnel = await prisma.funnel.create({
            data: {
                title,
                description: description || null,
                slug: `${slug}-${Date.now()}`,
                userId: session.userId,
                status: 'draft',
                steps: {
                    create: [
                        {
                            title: 'Início',
                            slug: 'inicio',
                            order: 0,
                            components: { create: [] },
                        },
                    ],
                },
            },
        });

        return NextResponse.json(newFunnel);
    } catch (error) {
        console.error('Create funnel error:', error);
        return NextResponse.json(
            { error: 'Erro ao criar projeto' },
            { status: 500 }
        );
    }
}
