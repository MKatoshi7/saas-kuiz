import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        await requireAdmin()
        const { userId } = await params

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                subscriptionStatus: true,
                subscriptionPlan: true,
                subscriptionEndsAt: true,
                createdAt: true,
                _count: { select: { funnels: true, transactions: true } },
            },
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const funnels = await prisma.funnel.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                slug: true,
                status: true,
                isBanned: true,
                createdAt: true,
                _count: { select: { sessions: true } },
            },
        })

        return NextResponse.json({ user, funnels })
    } catch (error) {
        console.error('Error fetching user:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
