import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        await requireAdmin()
        const configs = await prisma.webhookConfig.findMany({
            orderBy: { provider: 'asc' },
        })
        // Mascarar o secret
        const safe = configs.map((c) => ({
            ...c,
            secret: c.secret ? `${c.secret.slice(0, 4)}...${c.secret.slice(-4)}` : null,
            secretLength: c.secret?.length || 0,
        }))
        return NextResponse.json({ configs: safe })
    } catch (error) {
        console.error('List webhook configs error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        await requireAdmin()
        const body = await req.json()
        const { provider, secret, isActive = true, description, acceptedEvents = [] } = body
        if (!provider) {
            return NextResponse.json({ error: 'provider obrigatório' }, { status: 400 })
        }
        const config = await prisma.webhookConfig.upsert({
            where: { provider },
            create: { provider, secret: secret || null, isActive, description: description || null, acceptedEvents },
            update: {
                ...(secret !== undefined ? { secret: secret || null } : {}),
                isActive,
                ...(description !== undefined ? { description: description || null } : {}),
                acceptedEvents,
            },
        })
        return NextResponse.json({
            config: {
                ...config,
                secret: config.secret ? `${config.secret.slice(0, 4)}...${config.secret.slice(-4)}` : null,
            },
        })
    } catch (error) {
        console.error('Upsert webhook config error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
