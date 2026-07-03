import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        await requireAdmin();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = 30;
        const skip = (page - 1) * limit;
        const adminId = searchParams.get('adminId') || undefined;
        const action = searchParams.get('action') || undefined;

        const where: any = {}
        if (adminId) where.adminId = adminId
        if (action) where.action = action

        const [actions, total] = await Promise.all([
            prisma.adminAction.findMany({
                where,
                include: {
                    admin: { select: { id: true, name: true, email: true } },
                    targetUser: { select: { id: true, name: true, email: true } },
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.adminAction.count({ where }),
        ])

        return NextResponse.json({
            actions,
            total,
            pages: Math.ceil(total / limit),
        })
    } catch (error) {
        console.error('Error listing admin actions:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
