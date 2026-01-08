import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PATCH(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const { name, email } = await request.json();

        // Check if email is already taken by another user
        if (email !== session.email) {
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });

            if (existingUser && existingUser.id !== session.userId) {
                return NextResponse.json(
                    { error: 'Este email já está em uso' },
                    { status: 400 }
                );
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.userId },
            data: {
                name: name || null,
                email,
            },
            select: {
                id: true,
                email: true,
                name: true,
            },
        });

        return NextResponse.json({ user: updatedUser });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json(
            { error: 'Erro ao atualizar perfil' },
            { status: 500 }
        );
    }
}
