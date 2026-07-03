import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';

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
        const session = await getSession();
        await requireAdmin();
        const body = await req.json();
        const { id, password, subscriptionStatus, subscriptionEndsAt, role, subscriptionPlan } = body;

        if (!id) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

        const before = await prisma.user.findUnique({ where: { id } });
        if (!before) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const data: any = {};
        const changes: Record<string, { from: any; to: any }> = {}

        if (password) {
            data.password = await bcrypt.hash(password, 10);
            changes.password = { from: '***', to: '*** (changed)' };
        }
        if (subscriptionStatus && subscriptionStatus !== before.subscriptionStatus) {
            data.subscriptionStatus = subscriptionStatus;
            changes.subscriptionStatus = { from: before.subscriptionStatus, to: subscriptionStatus };
        }
        if (subscriptionPlan && subscriptionPlan !== before.subscriptionPlan) {
            data.subscriptionPlan = subscriptionPlan;
            changes.subscriptionPlan = { from: before.subscriptionPlan, to: subscriptionPlan };
        }
        if (subscriptionEndsAt) {
            const newDate = new Date(subscriptionEndsAt);
            if (!before.subscriptionEndsAt || newDate.getTime() !== before.subscriptionEndsAt.getTime()) {
                data.subscriptionEndsAt = newDate;
                changes.subscriptionEndsAt = { from: before.subscriptionEndsAt, to: newDate };
            }
        }
        if (role && role !== before.role) {
            data.role = role;
            changes.role = { from: before.role, to: role };
        }

        const user = await prisma.user.update({
            where: { id },
            data,
        });

        if (Object.keys(changes).length > 0 && session) {
            await logAdminAction({
                adminId: session.userId,
                action: 'edit_user',
                targetUserId: id,
                details: { changes, email: before.email },
            })
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
