'use client';

import React, { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PAGES } from '@/config/public-pages.config';
import { customerClientService } from '@/services/api/client/customer-client.service';
import { useAuthStore } from '@/services/store/auth/store';
import type { ICustomerCreateInput } from '@/shared/types/customer.interface';

export default function RegisterPage() {
    const router = useRouter();
    const checkAuth = useAuthStore((state) => state.checkAuth);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const userData: ICustomerCreateInput = {
            email: formData.get('email') as string,
            password: formData.get('password') as string,
            fullName: formData.get('fullName') as string,
            phone: formData.get('phone') as string,
        };

        try {
            // Вызов сервиса регистрации
            const registerResult = await customerClientService.register(userData);
            if (!registerResult.success) {
                setError(registerResult.error || 'Ошибка при регистрации');
                return;
            }

            // Автоматический логин покупателя
            const authResult = await customerClientService.authenticate(userData.email, userData.password!);

            if (!authResult.success) {
                setError('Регистрация прошла успешно, но не удалось войти. Попробуйте войти снова');
                return;
            }

            await checkAuth(); // Обновляем user в store

            router.replace(PAGES.PROFILE);
        } catch (error) {
            console.error(error);
            setError('Произошла ошибка при регистрации');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container max-w-md mx-auto p-6">
            <Card>
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-center">Создание аккаунта</CardTitle>
                    <CardDescription className="text-center">
                        Заполните форму для регистрации нового аккаунта
                    </CardDescription>
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
                                placeholder="Придумайте пароль"
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Имя</Label>
                            <Input
                                id="fullName"
                                name="fullName"
                                type="text"
                                placeholder="Ваше полное имя"
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Телефон</Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="text"
                                placeholder="+7 (XXX) XXX-XX-XX"
                                disabled={loading}
                            />
                        </div>

                        <Button type="submit" disabled={loading} className="w-full cursor-pointer">
                            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                        </Button>
                    </form>

                    {error && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="mt-4 text-center text-sm">
                        Уже есть аккаунт?{' '}
                        <a href={PAGES.LOGIN} className="text-primary underline underline-offset-4">
                            Войти
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
