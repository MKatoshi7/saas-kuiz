import prisma from '@/lib/prisma'

export interface LGPDExport {
    user: {
        id: string
        name: string | null
        email: string
        role: string
        createdAt: Date
        subscriptionStatus: string | null
        subscriptionPlan: string | null
    }
    funnels: Array<{
        id: string
        title: string
        slug: string
        status: string
        isBanned: boolean
        createdAt: Date
        steps: number
    }>
    transactions: Array<{
        id: string
        amount: number
        status: string
        provider: string
        createdAt: Date
    }>
    leads: Array<{
        sessionId: string
        funnelTitle: string
        email: string | null
        name: string | null
        phone: string | null
        isLead: boolean
        isConverted: boolean
        startedAt: Date
        completedAt: Date | null
    }>
    adminActions: Array<{
        action: string
        createdAt: Date
    }>
}

/**
 * Exporta todos os dados de um usuário (LGPD/GDPR Art. 15).
 * Retorna um payload JSON-serializável.
 */
export async function exportUserDataLGPD(userId: string): Promise<LGPDExport> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            subscriptionStatus: true,
            subscriptionPlan: true,
        },
    })

    if (!user) {
        throw new Error('User not found')
    }

    const [funnels, transactions, adminActions, sessions] = await Promise.all([
        prisma.funnel.findMany({
            where: { userId },
            select: {
                id: true,
                title: true,
                slug: true,
                status: true,
                isBanned: true,
                createdAt: true,
                _count: { select: { steps: true } },
            },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.subscriptionTransaction.findMany({
            where: { userId },
            select: {
                id: true,
                amount: true,
                status: true,
                provider: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.adminAction.findMany({
            where: {
                OR: [{ adminId: userId }, { targetUserId: userId }],
            },
            select: { action: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 200,
        }),
        prisma.visitorSession.findMany({
            where: {
                funnel: { userId },
                OR: [{ isLead: true }, { isConverted: true }],
            },
            select: {
                sessionId: true,
                email: true,
                name: true,
                phone: true,
                isLead: true,
                isConverted: true,
                startedAt: true,
                completedAt: true,
                funnel: { select: { title: true } },
            },
            orderBy: { startedAt: 'desc' },
            take: 1000,
        }),
    ])

    return {
        user,
        funnels: funnels.map((f) => ({
            id: f.id,
            title: f.title,
            slug: f.slug,
            status: f.status,
            isBanned: f.isBanned,
            createdAt: f.createdAt,
            steps: f._count.steps,
        })),
        transactions,
        leads: sessions.map((s) => ({
            sessionId: s.sessionId,
            funnelTitle: s.funnel.title,
            email: s.email,
            name: s.name,
            phone: s.phone,
            isLead: s.isLead,
            isConverted: s.isConverted,
            startedAt: s.startedAt,
            completedAt: s.completedAt,
        })),
        adminActions,
    }
}
