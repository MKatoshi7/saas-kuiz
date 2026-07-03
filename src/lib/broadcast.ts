import prisma from '@/lib/prisma'

export interface SegmentFilters {
    role?: 'all' | 'user' | 'admin'
    plan?: 'all' | 'free' | 'starter' | 'pro' | 'enterprise'
    status?: 'all' | 'active' | 'expired' | 'canceled' | 'free'
}

export function buildUserWhereFromSegment(segment: SegmentFilters) {
    const where: any = {}

    if (segment.role && segment.role !== 'all') {
        where.role = segment.role
    }

    if (segment.plan && segment.plan !== 'all') {
        if (segment.plan === 'free') {
            where.subscriptionPlan = null
        } else {
            where.subscriptionPlan = segment.plan
        }
    }

    if (segment.status && segment.status !== 'all') {
        if (segment.status === 'free') {
            where.subscriptionStatus = 'free'
        } else {
            where.subscriptionStatus = segment.status
        }
    }

    return where
}

export async function countSegmentUsers(segment: SegmentFilters): Promise<number> {
    const where = buildUserWhereFromSegment(segment)
    return prisma.user.count({ where })
}

export async function listSegmentUsers(segment: SegmentFilters) {
    const where = buildUserWhereFromSegment(segment)
    return prisma.user.findMany({
        where,
        select: { id: true, email: true, name: true },
    })
}
