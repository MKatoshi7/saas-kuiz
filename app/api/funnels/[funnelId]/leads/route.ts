import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ funnelId: string }> }
) {
    try {
        const { funnelId } = await params;

        // Delete all visitor sessions and events for this funnel
        await prisma.$transaction([
            // First delete all events associated with sessions of this funnel
            prisma.event.deleteMany({
                where: {
                    session: {
                        funnelId: funnelId
                    }
                }
            }),
            // Then delete all visitor sessions
            prisma.visitorSession.deleteMany({
                where: {
                    funnelId: funnelId
                }
            })
        ]);

        return NextResponse.json({ success: true, message: 'Todos os leads foram removidos com sucesso' });
    } catch (error) {
        console.error('Error clearing leads:', error);
        return NextResponse.json(
            { error: 'Falha ao limpar os leads' },
            { status: 500 }
        );
    }
}
