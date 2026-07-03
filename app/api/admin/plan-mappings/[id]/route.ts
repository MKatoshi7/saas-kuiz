import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { logAdminAction } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession()
        await requireAdmin()
        const { id } = await params
        const body = await req.json()
        const { isActive, periodDays, notes, kuizPlan } = body
        const data: any = {}
        if (typeof isActive === 'boolean') data.isActive = isActive
        if (periodDays) data.periodDays = Number(periodDays)
        if (notes !== undefined) data.notes = notes || null
        if (kuizPlan) data.kuizPlan = kuizPlan

        const mapping = await prisma.planMapping.update({ where: { id }, data })
        await logAdminAction({
            adminId: session!.userId,
            action: 'update_coupon',
            details: { type: 'plan_mapping', id, changes: Object.keys(data) },
        })
        return NextResponse.json({ mapping })
    } catch (error) {
        console.error('Update plan mapping error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession()
        await requireAdmin()
        const { id } = await params
        await prisma.planMapping.delete({ where: { id } })
        await logAdminAction({
            adminId: session!.userId,
            action: 'delete_coupon',
            details: { type: 'plan_mapping', id },
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete plan mapping error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
