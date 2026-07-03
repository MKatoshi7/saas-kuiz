import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ funnelId: string }> }
) {
    try {
        await requireAdmin()
        const { funnelId } = await params

        const notes = await prisma.funnelNote.findMany({
            where: { funnelId },
            orderBy: { createdAt: 'desc' },
            include: {
                // Não temos relation com User author direto, mas authorId é texto.
                // Listamos authors em batch:
            },
        })

        // Buscar autores
        const authorIds = Array.from(new Set(notes.map((n) => n.authorId)))
        const authors = await prisma.user.findMany({
            where: { id: { in: authorIds } },
            select: { id: true, name: true, email: true },
        })
        const authorMap = Object.fromEntries(authors.map((a) => [a.id, a]))

        return NextResponse.json({
            notes: notes.map((n) => ({
                ...n,
                author: authorMap[n.authorId] || { id: n.authorId, name: 'Admin', email: '' },
            })),
        })
    } catch (error) {
        console.error('Error listing funnel notes:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ funnelId: string }> }
) {
    try {
        const session = await getSession()
        await requireAdmin()
        const { funnelId } = await params
        const { content } = await req.json()

        if (!content || !content.trim()) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 })
        }

        const note = await prisma.funnelNote.create({
            data: {
                funnelId,
                authorId: session!.userId,
                content: content.trim(),
            },
        })

        return NextResponse.json({ note })
    } catch (error) {
        console.error('Error creating funnel note:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
