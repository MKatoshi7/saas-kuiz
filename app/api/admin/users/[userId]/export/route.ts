import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { getSession } from '@/lib/auth'
import { exportUserDataLGPD } from '@/lib/lgpd'
import { logAdminAction } from '@/lib/audit'

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const session = await getSession()
        await requireAdmin()
        const { userId } = await params

        const data = await exportUserDataLGPD(userId)

        await logAdminAction({
            adminId: session!.userId,
            action: 'lgpd_export',
            targetUserId: userId,
            details: { email: data.user.email },
        })

        return new NextResponse(JSON.stringify(data, null, 2), {
            status: 200,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Content-Disposition': `attachment; filename="lgpd-export-${userId}-${Date.now()}.json"`,
            },
        })
    } catch (error) {
        console.error('Error exporting LGPD data:', error)
        if (error instanceof Error && error.message === 'User not found') {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
