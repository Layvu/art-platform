'use client';

import React, { useState } from 'react';

import { useSession } from 'next-auth/react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authService } from '@/services/api/auth-service';
import type { ICustomer, ICustomerAddress, ICustomerWithoutPassword } from '@/shared/types/customer.interface';

interface ProfileUIProps {
    customerData: ICustomerWithoutPassword;
}

export default function ProfileUI({ customerData }: ProfileUIProps) {
    const { data: session, status } = useSession();

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const [email, setEmail] = useState(customerData.email || '');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState(customerData.fullName || '');
    const [phone, setPhone] = useState(customerData.phone || '');
    const [addresses, setAddresses] = useState<ICustomerAddress[]>(customerData.addresses || []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // TODO: по хорошему формировать updated исходя из того, что изменилось,
        // но в целом данных мало, так что пока просто обновляем всё
        const updated: Partial<ICustomer> = {
            email,
            fullName,
            phone,
            addresses,
        };
        if (password) {
            updated.password = password;
        }

        try {
            const result = await authService.updateProfile(updated);

            if (result.success) {
                setSuccess('Профиль обновлен');
                setPassword('');
                setLoading(false);
            } else {
                setError(result.error || 'Ошибка обновления профиля');
            }
        } catch (error) {
            console.error(error);
            setError('Произошла ошибка при обновлении профиля');
        } finally {
            setLoading(false);
        }
    };

    // TODO: loading и error
    if (status === 'loading') return <div>Загрузка...</div>;
    if (!session?.user) return <div>Пожалуйста, войдите в систему</div>;

    return (
        <div className="container max-w-2xl mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Профиль пользователя</CardTitle>
                    <CardDescription>Управление вашими персональными данными и настройками аккаунта</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="profile" className="space-y-4">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="profile">Основные данные</TabsTrigger>
                            <TabsTrigger value="security">Параметры входа</TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile" className="space-y-4">
                            <form onSubmit={handleSubmit} className="space-y-4">
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

                                <Label>Ваши адреса</Label>
                                {addresses.length > 0 && (
                                    <div className="space-y-3">
                                        {addresses.map((address, index) => (
                                            <Card key={index} className="p-3">
                                                <div className="space-y-1">
                                                    <div className="font-semibold text-sm">
                                                        {address.label || `Адрес ${index + 1}`}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {address.addressLine}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {address.city}, {address.postalCode}
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}

                                <Button type="submit" disabled={loading} className="w-full">
                                    {loading ? 'Сохранение...' : 'Обновить данные'}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="security" className="space-y-4 pb-4">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
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
                                        <Label htmlFor="password">Новый пароль</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Введите новый пароль"
                                        />
                                    </div>
                                </div>

                                <Button type="submit" disabled={loading} className="w-full">
                                    {loading ? 'Сохранение...' : 'Обновить данные'}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>

                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert>
                            <AlertDescription>{success}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
