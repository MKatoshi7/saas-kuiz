import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { hashPassword } from '@/lib/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
        }

        // Verify token
        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
        }

        if (decoded.type !== 'reset') {
            return NextResponse.json({ error: 'Invalid token type' }, { status: 400 });
        }

        // Hash new password
        const hashedPassword = await hashPassword(password);

        // Update user
        await prisma.user.update({
            where: { id: decoded.userId },
            data: { password: hashedPassword }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
