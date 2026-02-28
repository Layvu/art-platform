'use client';

import React, { Suspense, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PAGES } from '@/config/public-pages.config';
import { customerClientService } from '@/services/api/client/customer-client.service';

/**
 * Страница, адрес которой приходит в письме для сброса пароля.
 * На сервере проверяет токен, позволяет пользователю ввести новый пароль и отображает результат
 */
function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(!token ? 'error' : 'idle');
    const [message, setMessage] = useState(!token ? 'Токен не найден. Запросите ссылку на сброс пароля снова.' : '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        setStatus('loading');
        setMessage('');

        const result = await customerClientService.resetPassword(token, password);
        if (result.success) {
            setStatus('success');
            setMessage('Ваш пароль был успешно обновлен.');
        } else {
            setStatus('error');
            setMessage(result.error || 'Ошибка при изменении пароля.');
        }
    };

    return (
        <Card className="max-w-md mx-auto mt-10">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">Установка нового пароля</CardTitle>
                <CardDescription className="text-center">
                    {status === 'success' && 'Операция успешно завершена'}
                    {status === 'error' && !token && 'Ошибка доступа'}
                    {status !== 'success' && token && 'Придумайте и введите новый пароль для вашего аккаунта'}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {status === 'success' ? (
                    <>
                        <Alert>
                            <AlertDescription>{message}</AlertDescription>
                        </Alert>
                        <Button onClick={() => router.push(PAGES.LOGIN)} className="w-full">
                            Войти с новым паролем
                        </Button>
                    </>
                ) : status === 'error' && !token ? (
                    <Alert variant="destructive">
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Новый пароль</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={status === 'loading'}
                                required
                            />
                        </div>
                        <Button type="submit" disabled={status === 'loading'} className="w-full">
                            {status === 'loading' ? 'Сохранение...' : 'Сохранить пароль'}
                        </Button>

                        {status === 'error' && (
                            <Alert variant="destructive">
                                <AlertDescription>{message}</AlertDescription>
                            </Alert>
                        )}
                    </form>
                )}
            </CardContent>
        </Card>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="text-center mt-10">Загрузка...</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}
