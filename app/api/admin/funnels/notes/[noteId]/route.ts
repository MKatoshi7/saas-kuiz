import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ noteId: string }> }
) {
    try {
        await requireAdmin()
        const { noteId } = await params
        await prisma.funnelNote.delete({ where: { id: noteId } })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting funnel note:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
