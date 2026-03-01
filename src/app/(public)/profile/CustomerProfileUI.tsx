'use client';

import React, { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { PhoneInput } from '@/components/shared/PhoneInput';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { customerClientService } from '@/services/api/client/customer-client.service';
import type { ICustomerUpdateInput } from '@/shared/types/customer.interface';
import type { Customer } from '@/shared/types/payload-types';
import { emailSchema, fullNameSchema, phoneSchema } from '@/shared/validations/schemas';

import OrderHistory from './OrderHistory';

interface ProfileUIProps {
    customerData: Customer;
}

const profileSchema = z.object({
    fullName: fullNameSchema,
    phone: phoneSchema,
});

const securitySchema = z.object({
    email: emailSchema,
    // Здесь не проверяем сложность (только наличие), т.к. это ввод старого пароля:
    password: z.string().min(1, 'Введите текущий пароль для подтверждения'),
});

export default function CustomerProfileUI({ customerData }: ProfileUIProps) {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);

    // Формы
    const profileForm = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: { fullName: customerData.fullName || '', phone: customerData.phone || '' },
    });
    const securityForm = useForm({
        resolver: zodResolver(securitySchema),
        defaultValues: { email: customerData.email || '', password: '' },
    });

    // Обработчик обновления основных данных (без пароля)
    const onProfileSubmit = async (data: z.infer<typeof profileSchema>) => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // TODO: по хорошему формировать updated исходя из того, что изменилось, делать проверки
            // Но в целом данных мало, так что пока просто обновляем всё
            const updated: ICustomerUpdateInput = { ...data, addresses: customerData.addresses };

            const result = await customerClientService.updateProfile(updated);
            if (result.success) setSuccess('Данные успешно обновлены');
            else setError(result.error || 'Ошибка при обновлении профиля');
        } finally {
            setLoading(false);
        }
    };

    // Обработчик обновления Email (требует пароль)
    const onSecuritySubmit = async (data: z.infer<typeof securitySchema>) => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const result = await customerClientService.updateProfile(data);
            if (result.success) {
                setSuccess('Email успешно изменен.');
                securityForm.setValue('password', ''); // Очищаем пароль
            } else setError(result.error || 'Ошибка при изменении Email');
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
                            <Form {...profileForm}>
                                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={profileForm.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Телефон</FormLabel>
                                                    <FormControl>
                                                        <PhoneInput {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={profileForm.control}
                                            name="fullName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>ФИО</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <Button type="submit" disabled={loading} className="w-full">
                                        Обновить данные
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>

                        {/* Смена Email + cброс пароля */}
                        <TabsContent value="security" className="space-y-4 pb-4">
                            <Form {...securityForm}>
                                <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={securityForm.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Новый Email</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={securityForm.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Текущий пароль</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="password"
                                                            {...field}
                                                            disabled={
                                                                securityForm.watch('email') === customerData.email
                                                            }
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={loading || securityForm.watch('email') === customerData.email}
                                        className="w-full"
                                    >
                                        Обновить Email
                                    </Button>
                                </form>
                            </Form>

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
