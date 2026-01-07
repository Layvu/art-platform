'use client';

import React, { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PAGES } from '@/config/public-pages.config';
import { customerClientService } from '@/services/api/client/customer-client.service';
import { orderClientService } from '@/services/api/client/order-client.service';
import { useCartStore } from '@/services/store/cart/store';
import { DELIVERY_TYPES } from '@/shared/constants/order.constants';
import { isProductData } from '@/shared/guards/product.guard';
import { useProductsByIds } from '@/shared/hooks/useFetchData';
import { type IDeliveryType, type IOrderCreateRequest } from '@/shared/types/order.interface';
import type { Customer } from '@/shared/types/payload-types';

interface OrderUIProps {
    customer: Customer;
}

const PICKUP_ADDRESS = 'Екатеринбург, ул. Добролюбова, д. 2Б';

export default function OrderUI({ customer }: OrderUIProps) {
    const router = useRouter();
    const { cart, clearCheckedItems } = useCartStore();

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Берем только отмеченные товары из корзины
    const checkedItems = cart?.items?.filter((item) => item.checked) ?? [];

    // Извлекаем ID товаров
    const productIds = checkedItems.map((item) => {
        return isProductData(item.product) ? item.product.id : item.product;
    });

    // Загружаем товары
    const { data: products, isLoading, isError } = useProductsByIds(productIds);

    // Состояние формы
    const [formData, setFormData] = useState({
        fullName: customer.fullName || '',
        phone: customer.phone || '',
        deliveryType: DELIVERY_TYPES.PICKUP as IDeliveryType,
        address: '',
    });

    // Рассчитываем общую сумму
    const total = products
        ? checkedItems.reduce((sum, item) => {
              const productId = isProductData(item.product) ? item.product.id : item.product;
              const product = products.find((p) => p.id === productId);
              return product ? sum + item.quantity * product.price : sum;
          }, 0)
        : 0;

    if (isLoading) {
        return <div>Загрузка товаров...</div>;
    }

    if (isError || !products) {
        return <div>Ошибка загрузки товаров</div>;
    }

    if (checkedItems.length === 0) {
        return (
            <div className="container max-w-2xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-4">Оформление заказа</h1>
                <p>Нет выбранных товаров для заказа.</p>
                <Button onClick={() => router.push(PAGES.CART)} className="mt-4">
                    Вернуться в корзину
                </Button>
            </div>
        );
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleDeliveryTypeChange = (value: IDeliveryType) => {
        setFormData((prev) => ({
            ...prev,
            deliveryType: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Обновляем профиль пользователя, если данные изменились
            if (formData.fullName !== customer.fullName || formData.phone !== customer.phone) {
                await customerClientService.updateProfile({
                    fullName: formData.fullName,
                    phone: formData.phone,
                });
            }

            // Подготавливаем данные заказа
            const requestOrderData: IOrderCreateRequest = {
                items: checkedItems.map((item) => {
                    const productId = isProductData(item.product) ? item.product.id : item.product;
                    return {
                        id: productId,
                        quantity: item.quantity,
                    };
                }),
                deliveryType: formData.deliveryType,
                address: formData.deliveryType === DELIVERY_TYPES.DELIVERY ? formData.address : PICKUP_ADDRESS,
            };

            // Создаем заказ
            await orderClientService.createOrder(requestOrderData);

            // Очищаем корзину (только отмеченные товары)
            clearCheckedItems();

            // Перенаправляем в профиль
            router.push(PAGES.PROFILE);
        } catch (error) {
            console.error('Order creation error:', error);
            alert('Произошла ошибка при оформлении заказа');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isDelivery = formData.deliveryType === DELIVERY_TYPES.DELIVERY;

    return (
        <div className="container max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Оформление заказа</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Данные покупателя */}
                <Card>
                    <CardHeader>
                        <CardTitle>Данные для заказа</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">ФИО *</Label>
                            <Input
                                id="fullName"
                                value={formData.fullName}
                                onChange={(e) => handleInputChange('fullName', e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Телефон *</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Способ получения */}
                <Card>
                    <CardHeader>
                        <CardTitle>Способ получения</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup
                            value={formData.deliveryType}
                            onValueChange={handleDeliveryTypeChange}
                            className="space-y-3"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value={DELIVERY_TYPES.PICKUP} id="pickup" />
                                <Label htmlFor="pickup" className="cursor-pointer">
                                    Самовывоз
                                </Label>
                            </div>
                            {formData.deliveryType === DELIVERY_TYPES.PICKUP && (
                                <div className="ml-6 p-3 bg-muted rounded-md">
                                    <p className="text-sm">Адрес самовывоза: {PICKUP_ADDRESS}</p>
                                </div>
                            )}

                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value={DELIVERY_TYPES.DELIVERY} id="delivery" />
                                <Label htmlFor="delivery" className="cursor-pointer">
                                    Доставка
                                </Label>
                            </div>
                            {isDelivery && (
                                <div className="ml-6 space-y-2">
                                    <Label htmlFor="address">Адрес доставки *</Label>
                                    <Input
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                        placeholder="Введите полный адрес доставки"
                                        required={isDelivery}
                                    />
                                </div>
                            )}
                        </RadioGroup>
                    </CardContent>
                </Card>

                {/* Товары в заказе */}
                <Card>
                    <CardHeader>
                        <CardTitle>Товары в заказе</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {checkedItems.map((item) => {
                                const productId = isProductData(item.product) ? item.product.id : item.product;
                                const product = products.find((p) => p.id === productId);

                                return (
                                    <div
                                        key={item.id ?? productId}
                                        className="flex justify-between items-center py-3 border-b"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium">{product?.title}</p>
                                            <p className="text-sm text-muted-foreground">Количество: {item.quantity}</p>
                                        </div>
                                        <p className="font-medium whitespace-nowrap">
                                            {product ? (product.price * item.quantity).toFixed(2) : 'N/A'} руб.
                                        </p>
                                    </div>
                                );
                            })}

                            <div className="flex justify-between items-center pt-3 border-t font-bold text-lg">
                                <p>Итого:</p>
                                <p>{total.toFixed(2)} руб.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
                    {isSubmitting ? 'Оформление заказа...' : 'Завершить заказ'}
                </Button>
            </form>
        </div>
    );
}
