import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        await requireAdmin();
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'system'; // system | webhook
        const page = parseInt(searchParams.get('page') || '1');
        const limit = 20;
        const skip = (page - 1) * limit;

        let logs, total;

        if (type === 'webhook') {
            [logs, total] = await Promise.all([
                prisma.webhookLog.findMany({
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' }
                }),
                prisma.webhookLog.count()
            ]);
        } else {
            [logs, total] = await Promise.all([
                prisma.systemLog.findMany({
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' }
                }),
                prisma.systemLog.count()
            ]);
        }

        return NextResponse.json({ logs, total, pages: Math.ceil(total / limit) });
    } catch (error) {
        console.error('Error listing logs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
