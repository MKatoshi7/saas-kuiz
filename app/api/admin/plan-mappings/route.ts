import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { logAdminAction } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        await requireAdmin()
        const mappings = await prisma.planMapping.findMany({
            orderBy: [{ provider: 'asc' }, { createdAt: 'desc' }],
        })
        return NextResponse.json({ mappings })
    } catch (error) {
        console.error('List plan mappings error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getSession()
        await requireAdmin()
        const body = await req.json()
        const {
            provider, externalProductId, externalProductName,
            kuizPlan, periodDays = 30, amount, currency = 'BRL', notes,
        } = body

        if (!provider || !externalProductId || !kuizPlan) {
            return NextResponse.json(
                { error: 'provider, externalProductId e kuizPlan são obrigatórios' },
                { status: 400 }
            )
        }
        if (!['starter', 'pro', 'enterprise'].includes(kuizPlan)) {
            return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })
        }

        const mapping = await prisma.planMapping.create({
            data: {
                provider,
                externalProductId: String(externalProductId),
                externalProductName: externalProductName || null,
                kuizPlan,
                periodDays: Number(periodDays) || 30,
                amount: amount ? Number(amount) : null,
                currency,
                notes: notes || null,
                createdBy: session!.userId,
            },
        })

        await logAdminAction({
            adminId: session!.userId,
            action: 'create_coupon', // reusing general admin log
            details: { type: 'plan_mapping', id: mapping.id, provider, product: externalProductId, plan: kuizPlan },
        })

        return NextResponse.json({ mapping })
    } catch (error: any) {
        if (error?.code === 'P2002') {
            return NextResponse.json({ error: 'Já existe mapping para este provider+productId' }, { status: 409 })
        }
        console.error('Create plan mapping error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
