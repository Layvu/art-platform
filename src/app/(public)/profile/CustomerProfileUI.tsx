'use client';

import React, { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { customerClientService } from '@/services/api/client/customer-client.service';
import type { ICustomerAddress, ICustomerUpdateInput } from '@/shared/types/customer.interface';
import type { Customer } from '@/shared/types/payload-types';

import OrderHistory from './OrderHistory';

interface ProfileUIProps {
    customerData: Customer;
}

export default function CustomerProfileUI({ customerData }: ProfileUIProps) {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);

    // TODO: общий стейт для формы

    // Стейты профиля
    const [fullName, setFullName] = useState(customerData.fullName || '');
    const [phone, setPhone] = useState(customerData.phone || '');
    const [addresses] = useState<ICustomerAddress[]>(customerData.addresses || []);

    // Стейты кредов
    const [email, setEmail] = useState(customerData.email || '');
    const [password, setPassword] = useState('');

    // Обработчик обновления основных данных (без пароля)
    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // TODO: по хорошему формировать updated исходя из того, что изменилось, делать проверки
        // Но в целом данных мало, так что пока просто обновляем всё
        const updated: ICustomerUpdateInput = { fullName, phone, addresses };

        try {
            const result = await customerClientService.updateProfile(updated);
            if (result.success) {
                setSuccess('Данные успешно обновлены');
            } else {
                setError(result.error || 'Ошибка при обновлении профиля');
            }
        } finally {
            setLoading(false);
        }
    };

    // Обработчик обновления Email (требует пароль)
    const handleSecuritySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const updated = { email, password };

        try {
            const result = await customerClientService.updateProfile(updated);
            if (result.success) {
                setSuccess('Email успешно изменен.');
                setPassword('');
            } else {
                setError(result.error || 'Ошибка при изменении Email');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async () => {
        setResetLoading(true);
        setError('');
        setSuccess('');

        try {
            const result = await customerClientService.requestPasswordReset(customerData.email);
            if (result.success) {
                setSuccess('Ссылка для изменения пароля отправлена на вашу почту. Проверьте входящие или спам.');
            } else {
                setError(result.error || 'Ошибка при запросе смены пароля');
            }
        } finally {
            setResetLoading(false);
        }
    };

    // TODO: loading и error компоненты

    return (
        <div className="wrap mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Профиль пользователя</CardTitle>
                    <CardDescription>Управление вашими персональными данными и настройками аккаунта</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="orders" className="space-y-4">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="orders">Мои заказы</TabsTrigger>
                            <TabsTrigger value="profile">Основные данные</TabsTrigger>
                            <TabsTrigger value="security">Параметры входа</TabsTrigger>
                        </TabsList>

                        <TabsContent value="orders" className="space-y-4">
                            <OrderHistory customerId={customerData.id} />
                        </TabsContent>

                        {/* Основные данные (без Email) */}
                        <TabsContent value="profile" className="space-y-4">
                            <form onSubmit={handleProfileSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Телефон</Label>
                                        <Input
                                            id="phone"
                                            type="text"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+7 (XXX) XXX-XX-XX"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">ФИО</Label>
                                        <Input
                                            id="fullName"
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Иванов Иван Иванович"
                                            required
                                        />
                                    </div>
                                </div>
                                <Button type="submit" disabled={loading} className="w-full">
                                    {loading ? 'Сохранение...' : 'Обновить данные'}
                                </Button>
                            </form>
                        </TabsContent>

                        {/* Смена Email + cброс пароля */}
                        <TabsContent value="security" className="space-y-4 pb-4">
                            <form onSubmit={handleSecuritySubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Новый Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Текущий пароль (для подтверждения)</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Введите пароль"
                                            disabled={email === customerData.email}
                                            required={email !== customerData.email}
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={loading || email === customerData.email}
                                    className="w-full"
                                >
                                    {loading ? 'Сохранение...' : 'Обновить Email'}
                                </Button>
                            </form>

                            <div className="mt-8 pt-6 border-t">
                                <h3 className="text-lg font-medium mb-2">Смена пароля</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    В целях безопасности смена пароля производится через подтверждение по электронной
                                    почте. Мы отправим специальную ссылку на ваш текущий email.
                                </p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handlePasswordReset}
                                    disabled={resetLoading}
                                    className="w-full md:w-auto"
                                >
                                    {resetLoading ? 'Отправка...' : 'Отправить ссылку для смены пароля'}
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>

                    {error && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {success && (
                        <Alert className="mt-4">
                            <AlertDescription>{success}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
