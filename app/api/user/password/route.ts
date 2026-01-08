import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { hashPassword, verifyPassword } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PATCH(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: 'Senha atual e nova senha são obrigatórias' },
                { status: 400 }
            );
        }

        // Get user with password
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        // Verify current password
        const isValid = await verifyPassword(currentPassword, user.password);

        if (!isValid) {
            return NextResponse.json(
                { error: 'Senha atual incorreta' },
                { status: 400 }
            );
        }

        // Hash new password
        const hashedPassword = await hashPassword(newPassword);

        // Update password
        await prisma.user.update({
            where: { id: session.userId },
            data: { password: hashedPassword },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Password update error:', error);
        return NextResponse.json(
            { error: 'Erro ao atualizar senha' },
            { status: 500 }
        );
    }
}
