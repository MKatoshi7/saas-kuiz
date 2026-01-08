import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        await requireAdmin();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = 20;
        const skip = (page - 1) * limit;

        const [transactions, total] = await Promise.all([
            prisma.subscriptionTransaction.findMany({
                include: {
                    user: { select: { name: true, email: true } }
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.subscriptionTransaction.count()
        ]);

        return NextResponse.json({ transactions, total, pages: Math.ceil(total / limit) });
    } catch (error) {
        console.error('Error listing transactions:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
