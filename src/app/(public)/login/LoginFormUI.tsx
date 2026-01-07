'use client';

import React, { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PAGES } from '@/config/public-pages.config';
import { authorClientService } from '@/services/api/client/author-client.service';
import { customerClientService } from '@/services/api/client/customer-client.service';
import { useAuthStore } from '@/services/store/auth/store';
import { type UserRole, UserType } from '@/shared/types/auth.interface';

interface LoginFormProps {
    redirectUrl: string;
}

export default function LoginForm({ redirectUrl }: LoginFormProps) {
    const router = useRouter();
    const checkAuth = useAuthStore((state) => state.checkAuth);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [userType, setUserType] = useState<UserRole>(UserType.CUSTOMER);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formData = new FormData(e.currentTarget);
            const email = formData.get('email') as string;
            const password = formData.get('password') as string;

            let authResult;
            if (userType === UserType.CUSTOMER) {
                // Аутентификация покупателя через Payload
                authResult = await customerClientService.authenticate(email, password);
            } else if (userType === UserType.AUTHOR) {
                // Аутентификация автора через Payload
                authResult = await authorClientService.authenticate(email, password);
            } else {
                setError('Неверный тип пользователя');
                return;
            }

            if (!authResult.success) {
                setError(authResult.error || 'Неверный email или пароль');
                return;
            }

            await checkAuth(); // Обновляем user в store

            // После успешного входа перенаправляем в профиль или по пути редиректа
            router.replace(redirectUrl);
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
                    <CardDescription className="text-center">
                        Выберите тип аккаунта и введите данные для входа
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs
                        defaultValue="customer"
                        className="w-full"
                        onValueChange={(value) => setUserType(value as UserRole)}
                    >
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="customer">Покупатель</TabsTrigger>
                            <TabsTrigger value="author">Автор</TabsTrigger>
                        </TabsList>

                        <TabsContent value="customer">
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
                                    {loading ? 'Вход...' : 'Войти как покупатель'}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="author">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email-author">Email</Label>
                                    <Input
                                        id="email-author"
                                        name="email"
                                        type="email"
                                        placeholder="author@email.com"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password-author">Пароль</Label>
                                    <Input
                                        id="password-author"
                                        name="password"
                                        type="password"
                                        placeholder="Пароль"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div className="text-sm text-muted-foreground">
                                    <p>Для входа используйте данные, предоставленные администратором</p>
                                </div>

                                <Button type="submit" disabled={loading} className="w-full cursor-pointer">
                                    {loading ? 'Вход...' : 'Войти как автор'}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>

                    {error && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {userType === UserType.CUSTOMER && (
                        <div className="mt-4 text-center text-sm">
                            Нет аккаунта?{' '}
                            <a href={PAGES.REGISTER} className="text-primary underline underline-offset-4">
                                Зарегистрироваться
                            </a>
                        </div>
                    )}

                    {userType === UserType.AUTHOR && (
                        <div className="mt-4 text-center text-sm text-muted-foreground">
                            Аккаунты авторов создаются администратором
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
