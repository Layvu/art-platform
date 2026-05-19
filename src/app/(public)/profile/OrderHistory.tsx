'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Timer } from '@/components/shared/Timer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PAGES } from '@/config/public-pages.config';
import { orderClientService } from '@/services/api/client/order-client.service';
import { DELIVERY_TYPES, getOrderStatusText, ORDER_STATUS, PICKUP_ADDRESS } from '@/shared/constants/order.constants';
import { PAYMENT_STATUS } from '@/shared/constants/payment.constants';
import { isImageData } from '@/shared/guards/image.guard';
import { useProductsByIds, useProductSlugs } from '@/shared/hooks/useFetchData';
import type { Order } from '@/shared/types/payload-types';
import type { IYookassaPaymentResponse, IYookassaWebhookEvent } from '@/shared/types/yookassa.interface';
import { canOrderBeCancelled } from '@/shared/utils/orders.utils';

interface OrderHistoryProps {
    customerId: number;
}

export default function OrderHistory({ customerId }: OrderHistoryProps) {
    const router = useRouter();

    const [orders, setOrders] = useState<Order[]>([]);
    const [expiredOrders, setExpiredOrders] = useState<Record<number, boolean>>({});
    const [loading, setLoading] = useState(true);

    // Собираем все уникальные productId из всех заказов
    // TODO: возможно лишнее, они же и так сгруппированые
    const allProductIds = useMemo(() => {
        return orders
            .flatMap((order) => order.items.map((item) => item.productSnapshot.productId))
            .filter((id, index, self) => self.indexOf(id) === index); // Уникальные ID
    }, [orders]);

    const {
        data: products,
        isLoading: isProductLoading,
        isError: isProductError,
        error: productError,
    } = useProductsByIds(allProductIds);

    // Загружаем slug для всех productId
    const { slugMap } = useProductSlugs(allProductIds);

    useEffect(() => {
        const loadOrders = async () => {
            try {
                setLoading(true);
                const customerOrders = await orderClientService.getOrdersByCustomer(customerId);
                setOrders(customerOrders);
            } catch (error) {
                console.error('Failed to load orders', error);
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, [customerId]);

    const handleCancelOrder = async (orderId: number) => {
        await orderClientService.cancelOrder(orderId);
        // Обновляем список заказов в UI
        setOrders((prev) =>
            prev.map((order) => (order.id === orderId ? { ...order, status: ORDER_STATUS.CANCELLED } : order)),
        );
    };

    const handleExpire = useCallback((orderId: number) => {
        setExpiredOrders((prev) => ({ ...prev, [orderId]: true }));
    }, []);

    if (loading) return <div>Загрузка заказов...</div>;

    if (orders.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">У вас пока нет заказов</p>
                <Button onClick={() => router.push(PAGES.PRODUCTS)} className="mt-4">
                    Перейти к покупкам
                </Button>
            </div>
        );
    }
    console.log(orders);

    return (
        <div className="space-y-6">
            {orders.map((order) => {
                const status = order.status as (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
                const paymentStatus = order.paymentStatus;
                const paymentLink = order.paymentLink;

                const showPayLink =
                    status === ORDER_STATUS.PREPARED && paymentStatus === PAYMENT_STATUS.PENDING && !!paymentLink;

                const getStatusStyles = (status: string) => {
                    switch (status) {
                        case ORDER_STATUS.COMPLETED:
                            return 'bg-[#F0F9E8] text-[#71B542]';
                        case ORDER_STATUS.CANCELLED:
                            return 'bg-red-50 text-red-600';
                        default:
                            return 'bg-[#F3F4F6] text-[#4B5563]';
                    }
                };

                return (
                    <Card key={order.id}>
                        {/* Header: Номер и кнопка отмены */}
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-semibold">{order.orderNumber}</h3>
                            {canOrderBeCancelled(order) && (
                                <button
                                    onClick={() => handleCancelOrder(order.id)}
                                    className="text-[#E53E3E] bg-[#FFF5F5] px-4 py-1.5 rounded-lg text-base font-medium hover:bg-red-100 transition-colors"
                                >
                                    Отменить
                                </button>
                            )}
                        </div>

                        {/* Info: Дата и Доставка */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-2">
                            <div>
                                <p className="text-[#9CA3AF] text-base mb-1">Дата заказа</p>
                                <p className="text-[#1A1A1A] font-medium">
                                    {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                                </p>
                            </div>
                            <div className="md:col-span-4">
                                <p className="text-[#9CA3AF] text-base mb-1">
                                    {order.deliveryType === DELIVERY_TYPES.PICKUP
                                        ? 'Самовывоз'
                                        : 'Доставка СДЭК, курьер'}
                                </p>
                                <p className="font-medium leading-tight">
                                    {order.deliveryType === DELIVERY_TYPES.PICKUP
                                        ? PICKUP_ADDRESS
                                        : order.cdekData?.address || 'Адрес не указан'}
                                </p>
                            </div>
                        </div>
                        {/* Product Images */}
                        <div className="flex flex-wrap mb-4 gap-2">
                            {order.items.map((item, idx) => {
                                const currentProduct = products.find((p) => p.id === item.productSnapshot.productId);
                                const mainImage =
                                    currentProduct &&
                                    currentProduct.gallery &&
                                    isImageData(currentProduct.gallery[0]?.image)
                                        ? currentProduct.gallery[0].image
                                        : '/placeholder.png';
                                return (
                                    <Link
                                        href={PAGES.PRODUCT(slugMap[item.productSnapshot.productId] || '')}
                                        key={idx}
                                        className="relative w-20 h-20 rounded-xl overflow-hidden cursor-pointer"
                                    >
                                        <Image
                                            src={
                                                isImageData(mainImage) && mainImage.url
                                                    ? mainImage.url
                                                    : (mainImage as string)
                                            }
                                            alt={item.productSnapshot.title}
                                            fill
                                            className="object-cover"
                                        />
                                        <Badge className="absolute bottom-1 left-1" variant="secondary">
                                            {item.quantity} шт
                                        </Badge>
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                            <div className="flex items-baseline gap-4">
                                <span className="text-[24px] font-bold text-[#1A1A1A]">
                                    {order.total.toLocaleString('ru-RU')} ₽
                                </span>
                                {showPayLink && !expiredOrders[order.id] && (
                                    <a href={paymentLink} target="_blank" rel="noopener noreferrer">
                                        <Button
                                            size="sm"
                                            className="bg-[#4FB0AF] hover:bg-[#3d8c8b] text-white rounded-lg px-6"
                                        >
                                            Оплатить
                                        </Button>
                                    </a>
                                )}
                            </div>

                            <div className={`px-4 py-2 rounded-xl text-base ${getStatusStyles(status)}`}>
                                {showPayLink && !expiredOrders[order.id] ? (
                                    <>
                                        Ожидает оплаты{' '}
                                        <Timer
                                            startTime={order.createdAt}
                                            durationMinutes={10}
                                            expiredText=""
                                            onExpire={() => handleExpire(order.id)}
                                            className={`text-base ${getStatusStyles(status)}`}
                                        />
                                    </>
                                ) : (
                                    getOrderStatusText(status)
                                )}
                            </div>
                        </div>

                        {/* TODO: уничтожить после теста */}
                        {/*
                                                
                            {process.env.NODE_ENV === 'development' && (
                                <div className="mt-4 p-2 border border-dashed border-gray-400 rounded bg-gray-50">
                                    <p className="text-xs font-mono mb-2">DEV: Webhook Simulation</p>
                                    <div className="flex gap-2 flex-wrap">
                                        <Button
                                            variant="outline"
                                            onClick={() => triggerWebhook(order, 'waiting_for_capture')}
                                        >
                                            Simulate: waiting_for_capture
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="text-green-600 border-green-200"
                                            onClick={() => triggerWebhook(order, 'succeeded')}
                                        >
                                            Simulate: succeeded
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="text-red-600 border-red-200"
                                            onClick={() => triggerWebhook(order, 'canceled')}
                                        >
                                            Simulate: canceled
                                        </Button>
                                    </div>
                                </div>
                            )}

        */}
                    </Card>
                );
            })}
        </div>
    );
}
