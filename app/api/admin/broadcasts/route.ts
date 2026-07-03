import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { logAdminAction } from '@/lib/audit'
import { countSegmentUsers, listSegmentUsers } from '@/lib/broadcast'
import { emailService } from '@/lib/email/email-service'

export async function GET(req: Request) {
    try {
        await requireAdmin()
        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = 20
        const skip = (page - 1) * limit

        const [broadcasts, total] = await Promise.all([
            prisma.broadcast.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { author: { select: { id: true, name: true, email: true } } },
            }),
            prisma.broadcast.count(),
        ])

        return NextResponse.json({ broadcasts, total, pages: Math.ceil(total / limit) })
    } catch (error) {
        console.error('Error listing broadcasts:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getSession()
        await requireAdmin()
        const body = await req.json()
        const { subject, message, segment, action } = body

        if (!subject || !message) {
            return NextResponse.json({ error: 'subject e message são obrigatórios' }, { status: 400 })
        }

        const seg = {
            role: segment?.role || 'all',
            plan: segment?.plan || 'all',
            status: segment?.status || 'all',
        }

        // Ação: 'preview' = só conta quantos serão atingidos
        if (action === 'preview') {
            const total = await countSegmentUsers(seg)
            return NextResponse.json({ totalTargeted: total })
        }

        // Criar registro e enviar
        const total = await countSegmentUsers(seg)
        const broadcast = await prisma.broadcast.create({
            data: {
                authorId: session!.userId,
                subject,
                message,
                segmentRole: seg.role,
                segmentPlan: seg.plan,
                segmentStatus: seg.status,
                totalTargeted: total,
                status: 'sending',
            },
        })

        // Buscar usuários e enviar e-mails
        const users = await listSegmentUsers(seg)
        let sent = 0
        const errors: string[] = []

        for (const user of users) {
            try {
                await emailService.sendEmail(
                    user.email,
                    subject,
                    renderBroadcastHtml(subject, message, user.name)
                )
                sent++
            } catch (e) {
                errors.push(`${user.email}: ${e instanceof Error ? e.message : 'erro'}`)
            }
        }

        await prisma.broadcast.update({
            where: { id: broadcast.id },
            data: {
                totalSent: sent,
                status: errors.length === users.length ? 'failed' : 'sent',
                sentAt: new Date(),
            },
        })

        await logAdminAction({
            adminId: session!.userId,
            action: 'send_broadcast',
            details: {
                broadcastId: broadcast.id,
                subject,
                totalTargeted: total,
                totalSent: sent,
                errors: errors.length,
                segment: seg,
            },
        })

        return NextResponse.json({ broadcast: { ...broadcast, totalSent: sent }, errors })
    } catch (error) {
        console.error('Error sending broadcast:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

function renderBroadcastHtml(subject: string, message: string, name?: string | null): string {
    const safeMessage = message.replace(/\n/g, '<br>')
    return `
<!doctype html>
<html>
  <body style="font-family: -apple-system, system-ui, sans-serif; background:#f5f5f7; padding:40px 0;">
    <div style="max-width:560px; margin:0 auto; background:#fff; border-radius:16px; padding:40px; box-shadow:0 4px 20px rgba(0,0,0,0.05);">
      <h1 style="margin:0 0 16px; font-size:22px; color:#1d1d1f;">${escapeHtml(subject)}</h1>
      <p style="color:#6e6e73; font-size:14px; margin:0 0 24px;">Olá${name ? `, ${escapeHtml(name)}` : ''},</p>
      <div style="color:#1d1d1f; font-size:15px; line-height:1.6;">${safeMessage}</div>
      <hr style="border:none; border-top:1px solid #e5e5ea; margin:32px 0;" />
      <p style="font-size:12px; color:#86868b; text-align:center;">
        Kuiz · Enviado pela equipe
      </p>
    </div>
  </body>
</html>`
}

function escapeHtml(s: string) {
    return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}
