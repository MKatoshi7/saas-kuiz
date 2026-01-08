import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { emailService } from '@/lib/email/email-service';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            // Return success even if user not found to prevent enumeration
            return NextResponse.json({ success: true });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user.id, email: user.email, type: 'reset' },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

        await emailService.sendEmail(
            email,
            'Redefinição de Senha - Quizk',
            `<p>Olá, ${user.name || 'Usuário'}</p>
             <p>Você solicitou a redefinição de sua senha. Clique no link abaixo para criar uma nova senha:</p>
             <p><a href="${resetLink}">${resetLink}</a></p>
             <p>Se você não solicitou isso, ignore este email.</p>`
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
