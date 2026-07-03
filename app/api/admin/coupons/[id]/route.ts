import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { logAdminAction } from '@/lib/audit'

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession()
        await requireAdmin()
        const { id } = await params
        const body = await req.json()

        const data: any = {}
        if (typeof body.isActive === 'boolean') data.isActive = body.isActive
        if (body.description !== undefined) data.description = body.description || null
        if (body.maxUses !== undefined) data.maxUses = body.maxUses ? Number(body.maxUses) : null
        if (body.validUntil !== undefined) data.validUntil = body.validUntil ? new Date(body.validUntil) : null

        const coupon = await prisma.coupon.update({ where: { id }, data })

        await logAdminAction({
            adminId: session!.userId,
            action: 'update_coupon',
            details: { couponId: id, code: coupon.code, changes: Object.keys(data) },
        })

        return NextResponse.json({ coupon })
    } catch (error) {
        console.error('Error updating coupon:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession()
        await requireAdmin()
        const { id } = await params

        const coupon = await prisma.coupon.findUnique({ where: { id } })
        if (!coupon) {
            return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
        }

        await prisma.coupon.delete({ where: { id } })

        await logAdminAction({
            adminId: session!.userId,
            action: 'delete_coupon',
            details: { couponId: id, code: coupon.code },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting coupon:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
