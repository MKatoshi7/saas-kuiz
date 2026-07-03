import prisma from '@/lib/prisma'
import { headers } from 'next/headers'

export type AdminActionType =
    | 'ban_funnel'
    | 'unban_funnel'
    | 'edit_user'
    | 'impersonate_user'
    | 'change_role'
    | 'change_subscription'
    | 'reset_password'
    | 'delete_funnel'
    | 'delete_user'
    | 'create_user'
    | 'system_message'
    | 'create_coupon'
    | 'update_coupon'
    | 'delete_coupon'
    | 'send_broadcast'
    | 'lgpd_export'

interface LogAdminActionParams {
    adminId: string
    action: AdminActionType
    targetUserId?: string | null
    targetFunnelId?: string | null
    details?: Record<string, any>
}

/**
 * Registra uma ação administrativa. Falhas são silenciosas (best-effort).
 */
export async function logAdminAction({
    adminId,
    action,
    targetUserId = null,
    targetFunnelId = null,
    details = {},
}: LogAdminActionParams) {
    try {
        let ipAddress: string | null = null
        let userAgent: string | null = null
        try {
            const h = await headers()
            ipAddress = h.get('x-forwarded-for') || h.get('x-real-ip') || null
            userAgent = h.get('user-agent') || null
        } catch {
            // not in a request context (e.g. script/cron)
        }

        await prisma.adminAction.create({
            data: {
                adminId,
                action,
                targetUserId,
                targetFunnelId,
                details,
                ipAddress,
                userAgent,
            },
        })
    } catch (e) {
        console.error('Failed to log admin action:', e)
    }
}
