'use client';

import React, { useCallback, useState } from 'react';

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
import { DELIVERY_TYPES, PICKUP_ADDRESS } from '@/shared/constants/order.constants';
import { isProductData } from '@/shared/guards/product.guard';
import { useProductsByIds } from '@/shared/hooks/useFetchData';
import {
    type IDeliveryType,
    type IOrderCdek,
    type IOrderCreateRequest,
    type OrderUIProps,
} from '@/shared/types/order.interface';

import { CdekWidget } from './CdekWidget';

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
        cdekData: null as IOrderCdek | null,
        comment: '',
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
            <div className="max-w-2xl mx-auto p-6">
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
            cdekData: value === DELIVERY_TYPES.PICKUP ? null : prev.cdekData,
        }));
    };

    const handleCdekSelect = useCallback((selected: IOrderCdek) => {
        setFormData((prev) => ({ ...prev, cdekData: selected }));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { fullName, phone, deliveryType, cdekData, comment } = formData;

        // Валидация для СДЭК
        if (isDelivery && !cdekData) {
            alert('Пожалуйста, выберите пункт выдачи или адрес доставки на карте');
            return;
        }

        setIsSubmitting(true);

        try {
            // Обновляем профиль пользователя, если данные изменились
            if (fullName !== customer.fullName || phone !== customer.phone) {
                await customerClientService.updateProfile({
                    fullName,
                    phone,
                });
            }

            // Подготавливаем данные заказа
            const requestOrderData: IOrderCreateRequest = {
                items: checkedItems.map((item) => {
                    const productId = isProductData(item.product) ? item.product.id : item.product;
                    return { id: productId, quantity: item.quantity };
                }),
                deliveryType,
                // Добавляем cdekData только если выбран тип доставки и данные существуют
                ...(isDelivery && cdekData ? { cdekData } : {}),
                comment,
            };

            // Создаем заказ
            const result = await orderClientService.createOrder(requestOrderData);

            // Очищаем корзину (только отмеченные товары)
            clearCheckedItems();

            // Перенаправляем на страницу оплаты
            if (result.paymentUrl) {
                router.push(result.paymentUrl);
            } else {
                // Фолбек, если не удалось получить ссылку на оплату
                router.push(PAGES.PROFILE);
            }
        } catch (error) {
            console.error('Order creation error:', error);
            alert('Произошла ошибка при оформлении заказа');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isDelivery = formData.deliveryType === DELIVERY_TYPES.DELIVERY;

    return (
        <div className="wrap mx-auto p-6">
            <form onSubmit={handleSubmit} className="flex gap-10">
                {/* Данные покупателя */}
                <Card className="flex flex-col gap-8 flex-1">
                    <h1 className="text-2xl font-bold mb-6">Оформление заказа</h1>

                    <div className="space-y-4">
                        <CardHeader>
                            <CardTitle>Личные данные</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 p-0">
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
                    </div>

                    {/* Способ получения */}
                    <div className="space-y-4">
                        <CardHeader>
                            <CardTitle>Способ получения</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 p-0">
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
                                {!isDelivery && (
                                    <div className="ml-6 p-3 bg-muted rounded-md">
                                        <p className="text-sm">Адрес самовывоза: {PICKUP_ADDRESS}</p>
                                    </div>
                                )}

                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value={DELIVERY_TYPES.DELIVERY} id="delivery" />
                                    <Label htmlFor="delivery" className="cursor-pointer">
                                        Доставка СДЭК
                                    </Label>
                                </div>
                                {isDelivery && (
                                    <div className="ml-6 space-y-2">
                                        <Label>Выберите пункт выдачи или адрес доставки (СДЭК)</Label>
                                        <CdekWidget onChoose={handleCdekSelect} />
                                        {formData.cdekData && (
                                            <div className="p-3 bg-muted rounded-md">
                                                <p className="text-sm font-medium">Выбранный адрес:</p>
                                                <p className="text-sm">{formData.cdekData.address}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </RadioGroup>
                        </CardContent>
                    </div>

                    {/* Комментарий */}
                    <div className="space-y-4">
                        <CardHeader>
                            <CardTitle>Комментарий к заказу</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 p-0">
                            <div className="space-y-2">
                                <Input
                                    id="comment"
                                    value={formData.comment}
                                    onChange={(e) => handleInputChange('comment', e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </div>
                </Card>

                {/* Товары в заказе */}
                <Card className="h-fit bg-zinc-100 w-[405px]">
                    <CardHeader>
                        <CardTitle>Товары в заказе</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
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

                            <div className="flex justify-between items-center pt-3 font-bold text-lg">
                                <p>Итого:</p>
                                <p>{total.toFixed(2)} руб.</p>
                            </div>
                        </div>
                    </CardContent>

                    <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
                        {isSubmitting ? 'Оформление заказа...' : 'Завершить заказ'}
                    </Button>
                </Card>
            </form>
        </div>
    );
}
