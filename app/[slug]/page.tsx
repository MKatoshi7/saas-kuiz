import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

export default async function SlugRedirect({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Buscar o funnel pelo slug
    const funnel = await prisma.funnel.findFirst({
        where: { slug },
        select: { id: true, slug: true }
    });

    // Se encontrar, redireciona para a rota do funnel
    if (funnel) {
        redirect(`/f/${funnel.slug}`);
    }

    // Se não encontrar, retorna 404
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
                <p className="text-gray-600">Quiz não encontrado</p>
            </div>
        </div>
    );
}
