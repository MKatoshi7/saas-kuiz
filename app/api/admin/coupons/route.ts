import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { logAdminAction } from '@/lib/audit'

export async function GET(req: Request) {
    try {
        await requireAdmin()
        const { searchParams } = new URL(req.url)
        const search = searchParams.get('search') || ''
        const page = parseInt(searchParams.get('page') || '1')
        const limit = 20
        const skip = (page - 1) * limit

        const where = search ? {
            OR: [
                { code: { contains: search, mode: 'insensitive' as const } },
                { description: { contains: search, mode: 'insensitive' as const } },
            ],
        } : {}

        const [coupons, total] = await Promise.all([
            prisma.coupon.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.coupon.count({ where }),
        ])

        return NextResponse.json({ coupons, total, pages: Math.ceil(total / limit) })
    } catch (error) {
        console.error('Error listing coupons:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getSession()
        await requireAdmin()
        const body = await req.json()
        const {
            code,
            description,
            discountType,
            discountValue,
            maxUses,
            validUntil,
            applicablePlans,
            isActive = true,
        } = body

        if (!code || !discountType || discountValue == null) {
            return NextResponse.json({ error: 'Campos obrigatórios: code, discountType, discountValue' }, { status: 400 })
        }
        if (!['percent', 'fixed'].includes(discountType)) {
            return NextResponse.json({ error: 'discountType inválido' }, { status: 400 })
        }
        if (discountType === 'percent' && (discountValue <= 0 || discountValue > 100)) {
            return NextResponse.json({ error: 'Percentual deve estar entre 1 e 100' }, { status: 400 })
        }

        const normalizedCode = code.toUpperCase().trim()
        const existing = await prisma.coupon.findUnique({ where: { code: normalizedCode } })
        if (existing) {
            return NextResponse.json({ error: 'Código de cupom já existe' }, { status: 409 })
        }

        const coupon = await prisma.coupon.create({
            data: {
                code: normalizedCode,
                description: description || null,
                discountType,
                discountValue: Number(discountValue),
                maxUses: maxUses ? Number(maxUses) : null,
                validUntil: validUntil ? new Date(validUntil) : null,
                applicablePlans: applicablePlans && applicablePlans.length ? applicablePlans.join(',') : null,
                isActive: !!isActive,
                createdBy: session!.userId,
            },
        })

        await logAdminAction({
            adminId: session!.userId,
            action: 'create_coupon',
            details: { couponId: coupon.id, code: coupon.code, discountType, discountValue },
        })

        return NextResponse.json({ coupon })
    } catch (error) {
        console.error('Error creating coupon:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
