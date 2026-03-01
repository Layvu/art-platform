'use client';

import React, { useCallback, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { PhoneInput } from '@/components/shared/PhoneInput';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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
import { fullNameSchema, phoneSchema } from '@/shared/validations/schemas';

import { CdekWidget } from './CdekWidget';

const orderSchema = z
    .object({
        fullName: fullNameSchema,
        phone: phoneSchema,
        comment: z.string().optional(),
        deliveryType: z.string(),
        cdekData: z.any().nullable(),
    })
    .refine(
        (data) => {
            // Кастомная валидация для доставки СДЭК
            if (data.deliveryType === DELIVERY_TYPES.DELIVERY && !data.cdekData) return false;
            return true;
        },
        { message: 'Пожалуйста, выберите пункт выдачи или адрес доставки на карте', path: ['cdekData'] },
    );

export default function OrderUI({ customer }: OrderUIProps) {
    const router = useRouter();
    const { cart, clearCheckedItems } = useCartStore();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof orderSchema>>({
        resolver: zodResolver(orderSchema),
        defaultValues: {
            fullName: customer.fullName || '',
            phone: customer.phone || '',
            comment: '',
            deliveryType: DELIVERY_TYPES.PICKUP,
            cdekData: null,
        },
    });

    const handleCdekSelect = useCallback(
        (selected: IOrderCdek) => {
            form.setValue('cdekData', selected);
            form.clearErrors('cdekData');
        },
        [form],
    );

    const deliveryType = form.watch('deliveryType');
    const isDelivery = deliveryType === DELIVERY_TYPES.DELIVERY;

    // Берем только отмеченные товары из корзины
    const checkedItems = cart?.items?.filter((item) => item.checked) ?? [];

    // Извлекаем ID товаров
    const productIds = checkedItems.map((item) => {
        return isProductData(item.product) ? item.product.id : item.product;
    });

    // Загружаем товары
    const { data: products, isLoading, isError } = useProductsByIds(productIds);

    // Рассчитываем общую сумму
    const total = products
        ? checkedItems.reduce((sum, item) => {
              const productId = isProductData(item.product) ? item.product.id : item.product;
              const product = products.find((p) => p.id === productId);
              return product ? sum + item.quantity * product.price : sum;
          }, 0)
        : 0;

    const onSubmit = async (data: z.infer<typeof orderSchema>) => {
        setIsSubmitting(true);
        try {
            const { fullName, phone, cdekData, deliveryType, comment } = data;

            // Обновляем профиль пользователя, если данные изменились
            if (fullName !== customer.fullName || phone !== customer.phone) {
                await customerClientService.updateProfile({ fullName, phone });
            }

            // Подготавливаем данные заказа
            const requestOrderData: IOrderCreateRequest = {
                items: checkedItems.map((item) => ({
                    id: isProductData(item.product) ? item.product.id : item.product,
                    quantity: item.quantity,
                })),
                deliveryType: deliveryType as IDeliveryType,
                ...(isDelivery && cdekData ? { cdekData } : {}),
                comment: comment || '',
            };

            // Создаем заказ
            const result = await orderClientService.createOrder(requestOrderData);

            // Очищаем корзину (только отмеченные товары)
            clearCheckedItems();

            // Перенаправляем на страницу оплаты, в случае отсутствия ссылки - на профиль
            router.push(result.paymentUrl || PAGES.PROFILE);
        } catch (error) {
            console.error('Order creation error:', error);
            alert('Произошла ошибка при оформлении заказа');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="wrap mx-auto p-6">
            {isLoading && <div>Загрузка товаров...</div>}

            {!isLoading && isError && <div>Ошибка загрузки товаров</div>}

            {!isLoading && !isError && checkedItems.length === 0 && (
                <div className="max-w-2xl mx-auto p-6">
                    <h1 className="text-2xl font-bold mb-4">Оформление заказа</h1>
                    <p>Нет выбранных товаров для заказа.</p>
                    <Button onClick={() => router.push(PAGES.CART)} className="mt-4">
                        Вернуться в корзину
                    </Button>
                </div>
            )}

            {!isLoading && !isError && checkedItems.length > 0 && (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-10">
                        <Card className="flex flex-col gap-8 flex-1">
                            <h1 className="text-2xl font-bold mb-6">Оформление заказа</h1>

                            <div className="space-y-4">
                                <CardHeader>
                                    <CardTitle>Личные данные</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 p-0">
                                    <FormField
                                        control={form.control}
                                        name="fullName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>ФИО *</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Телефон *</FormLabel>
                                                <FormControl>
                                                    <PhoneInput {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </div>

                            {/* Способ получения */}
                            <div className="space-y-4">
                                <CardHeader>
                                    <CardTitle>Способ получения</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 p-0">
                                    <RadioGroup
                                        value={deliveryType}
                                        onValueChange={(val) => {
                                            form.setValue('deliveryType', val);
                                            if (val === DELIVERY_TYPES.PICKUP) form.setValue('cdekData', null);
                                        }}
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
                                                <Label>Выберите пункт выдачи</Label>
                                                <CdekWidget onChoose={handleCdekSelect} />
                                                {form.watch('cdekData') && (
                                                    <div className="p-3 bg-muted rounded-md text-sm">
                                                        {form.watch('cdekData').address}
                                                    </div>
                                                )}
                                                {/* Вывод кастомной ошибки Zod для cdekData */}
                                                {form.formState.errors.cdekData && (
                                                    <p className="text-sm font-medium text-destructive">
                                                        {form.formState.errors.cdekData.message as string}
                                                    </p>
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
                                    <FormField
                                        control={form.control}
                                        name="comment"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
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
                                                    <p className="text-sm text-muted-foreground">
                                                        Количество: {item.quantity}
                                                    </p>
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
                </Form>
            )}
        </div>
    );
}
