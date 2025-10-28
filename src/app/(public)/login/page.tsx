'use client';

import React, { useState } from 'react';

import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PAGES } from '@/config/public-pages.config';

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formData = new FormData(e.currentTarget);
            const result = await signIn('credentials', {
                email: formData.get('email') as string,
                password: formData.get('password') as string,
                redirect: false,
            });

            if (result?.error) {
                setError('Неверный email или пароль');
            } else {
                router.push(PAGES.PROFILE);
            }
        } catch (error) {
            console.error(error);
            setError('Произошла ошибка при входе');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container max-w-md mx-auto p-6">
            <Card>
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-center">Вход в аккаунт</CardTitle>
                    <CardDescription className="text-center">Введите ваш email и пароль для входа</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="your@email.com"
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Пароль</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Ваш пароль"
                                required
                                disabled={loading}
                            />
                        </div>

                        <Button type="submit" disabled={loading} className="w-full cursor-pointer">
                            {loading ? 'Вход...' : 'Войти'}
                        </Button>
                    </form>

                    {error && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="mt-4 text-center text-sm">
                        Нет аккаунта?{' '}
                        <a href={PAGES.REGISTER} className="text-primary underline underline-offset-4">
                            Зарегистрироваться
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
