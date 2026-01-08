import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export async function hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
}

export function signToken(payload: any) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

import prisma from '@/lib/prisma';

// ... (imports mantidos)

export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) return null;

    const decoded = verifyToken(token) as { userId: string; email: string } | null;
    if (!decoded) return null;

    try {
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, role: true }
        });

        if (!user) return null;

        return { userId: user.id, email: user.email, role: user.role };
    } catch (error) {
        console.error("Error fetching user session:", error);
        return null;
    }
}

export async function setSession(userId: string, email: string) {
    const token = signToken({ userId, email });
    const cookieStore = await cookies();

    cookieStore.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    });
}

export async function clearSession() {
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
}
