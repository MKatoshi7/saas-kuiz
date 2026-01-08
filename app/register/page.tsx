'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/ui/login-form';

export default function RegisterPage() {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (data: { email: string; password: string; name?: string }) => {
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const responseData = await res.json();

            if (!res.ok) {
                throw new Error(responseData.error || 'Erro ao criar conta');
            }

            router.push('/dashboard');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LoginForm
            mode="signup"
            onSubmit={handleSubmit}
            isLoading={loading}
            error={error}
        />
    );
}
