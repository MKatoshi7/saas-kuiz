import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, setSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        console.log('Login attempt for:', email);

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email e senha são obrigatórios' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            console.log('User not found:', email);
            return NextResponse.json(
                { error: 'Credenciais inválidas' },
                { status: 401 }
            );
        }

        console.log('User found, verifying password...');
        const isValid = await verifyPassword(password, user.password);
        console.log('Password valid:', isValid);

        if (!isValid) {
            return NextResponse.json(
                { error: 'Credenciais inválidas' },
                { status: 401 }
            );
        }

        await setSession(user.id, user.email);

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
