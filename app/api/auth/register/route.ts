import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, setSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { email, password, name } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email e senha são obrigatórios' },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email já cadastrado' },
                { status: 400 }
            );
        }

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: name || email.split('@')[0],
            },
        });

        await setSession(user.id, user.email);

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        });
    } catch (error: any) {
        console.error('Register error:', error);
        console.error('Error message:', error?.message);
        console.error('Error stack:', error?.stack);
        return NextResponse.json(
            { error: `Erro interno do servidor: ${error?.message || 'Desconhecido'}` },
            { status: 500 }
        );
    }
}
