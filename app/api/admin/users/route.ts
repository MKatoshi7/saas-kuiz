import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(req: Request) {
    try {
        await requireAdmin();
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = 10;
        const skip = (page - 1) * limit;

        const where = search ? {
            OR: [
                { email: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
            ]
        } : {};

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where: where as any,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    subscriptionStatus: true,
                    subscriptionPlan: true,
                    subscriptionEndsAt: true,
                    createdAt: true,
                    _count: { select: { funnels: true } }
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.user.count({ where: where as any })
        ]);

        return NextResponse.json({ users, total, pages: Math.ceil(total / limit) });
    } catch (error) {
        console.error('Error listing users:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await requireAdmin();
        const body = await req.json();
        const { id, password, subscriptionStatus, subscriptionEndsAt, role } = body;

        if (!id) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

        const data: any = {};
        if (password) {
            data.password = await bcrypt.hash(password, 10);
        }
        if (subscriptionStatus) data.subscriptionStatus = subscriptionStatus;
        if (subscriptionEndsAt) data.subscriptionEndsAt = new Date(subscriptionEndsAt);
        if (role) data.role = role;

        const user = await prisma.user.update({
            where: { id },
            data,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
