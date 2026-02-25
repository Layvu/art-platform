'use client';

import { useEffect, useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PAGES } from '@/config/public-pages.config';
import { orderClientService } from '@/services/api/client/order-client.service';
import { DELIVERY_TYPES, getOrderStatusText, ORDER_STATUS, PICKUP_ADDRESS } from '@/shared/constants/order.constants';
import { PAYMENT_STATUS } from '@/shared/constants/payment.constants';
import { useProductSlugs } from '@/shared/hooks/useFetchData';
import type { Order } from '@/shared/types/payload-types';
import type { IYookassaPaymentResponse, IYookassaWebhookEvent } from '@/shared/types/yookassa.interface';
import { canOrderBeCancelled } from '@/shared/utils/orders.utils';

interface OrderHistoryProps {
    customerId: number;
}

export default function OrderHistory({ customerId }: OrderHistoryProps) {
    const router = useRouter();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    // Собираем все уникальные productId из всех заказов
    // TODO: возможно лишнее, они же и так сгруппированые
    const allProductIds = useMemo(() => {
        return orders
            .flatMap((order) => order.items.map((item) => item.productSnapshot.productId))
            .filter((id, index, self) => self.indexOf(id) === index); // Уникальные ID
    }, [orders]);

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

    // TODO: уничтожить после деплоя. Мусор, для тестирования // // // // // // // // // // // // // // // // //
    const triggerWebhook = async (order: Order, eventType: 'waiting_for_capture' | 'succeeded' | 'canceled') => {
        if (!order.paymentId) return alert('No payment ID');

        const mockBody: IYookassaWebhookEvent = {
            type: 'notification',
            event: `payment.${eventType}`,
            object: {
                id: order.paymentId,
                status: eventType,
                paid: eventType !== 'canceled',
                amount: { value: order.total.toFixed(2), currency: 'RUB' },
                metadata: { order_id: order.id },
                created_at: new Date().toISOString(),
            } as unknown as IYookassaPaymentResponse,
        };

        try {
            const res = await fetch('/api/webhooks/yookassa', {
                method: 'POST',
                body: JSON.stringify(mockBody),
            });
            if (res.ok) {
                alert(`Webhook ${eventType} sent!`);
                setTimeout(() => window.location.reload(), 500);
            } else {
                alert('Webhook failed');
            }
        } catch (e) {
            console.error(e);
        }
    };
    // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //

    return (
        <div className="space-y-4">
            {orders.map((order) => {
                const status = order.status as (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS] | undefined;
                const paymentStatus = order.paymentStatus;
                const paymentLink = order.paymentLink;

                const showPayLink =
                    status === ORDER_STATUS.PREPARED && paymentStatus === PAYMENT_STATUS.PENDING && !!paymentLink;

                return (
                    <Card key={order.id}>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center text-base">
                                <span>Заказ #{order.orderNumber}</span>
                                {status && (
                                    <span
                                        className={`text-sm font-normal px-2 py-1 rounded ${
                                            status === ORDER_STATUS.CANCELLED
                                                ? 'bg-destructive text-destructive-foreground'
                                                : status === ORDER_STATUS.COMPLETED
                                                  ? 'bg-green-100 text-green-800'
                                                  : status === ORDER_STATUS.PROCESSING
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-orange-100 text-orange-800'
                                        }`}
                                    >
                                        {getOrderStatusText(status)}
                                    </span>
                                )}
                                <p className="text-sm text-gray-500">Payment Status: {paymentStatus}</p>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <p>
                                    <strong>Дата создания заказа:</strong>{' '}
                                    {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                                </p>

                                {/* Способ получения и данные СДЭК */}
                                <p>
                                    <strong>Способ получения:</strong>{' '}
                                    {order.deliveryType === DELIVERY_TYPES.PICKUP ? 'Самовывоз' : 'Доставка СДЭК'}
                                </p>

                                {order.deliveryType === DELIVERY_TYPES.PICKUP && (
                                    <p>
                                        <strong>Адрес самовывоза:</strong> {PICKUP_ADDRESS}
                                    </p>
                                )}

                                {order.deliveryType === DELIVERY_TYPES.DELIVERY && order.cdekData && (
                                    <>
                                        <p>
                                            <strong>Тип доставки:</strong>{' '}
                                            {order.cdekData.type === 'pvz' ? 'Пункт выдачи' : 'Курьер'}
                                        </p>
                                        <p>
                                            <strong>Адрес доставки:</strong> {order.cdekData.address}
                                        </p>
                                    </>
                                )}

                                {order.trackingNumber && (
                                    <p>
                                        <strong>Трек-номер СДЭК:</strong> {/* Пример trackingNumber: 10213627100 */}
                                        <a
                                            href={`https://www.cdek.ru/ru/tracking?order_id=${order.trackingNumber}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline font-mono"
                                        >
                                            {order.trackingNumber}
                                        </a>
                                    </p>
                                )}

                                {order.comment && (
                                    <p>
                                        <strong>Комментарий:</strong> {order.comment}
                                    </p>
                                )}

                                {/* Товары */}
                                <p>
                                    <strong>Товары:</strong>
                                </p>
                                <ul className="list-disc list-inside ml-2">
                                    {order.items.map((item, index) => {
                                        const slug = slugMap[item.productSnapshot.productId];

                                        return (
                                            <li key={index}>
                                                {slug ? (
                                                    <a
                                                        href={PAGES.PRODUCT(slug)}
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        {item.productSnapshot.title}
                                                    </a>
                                                ) : (
                                                    <span>{item.productSnapshot.title}</span>
                                                )}{' '}
                                                - {item.quantity} шт. × {item.productSnapshot.price} руб.
                                            </li>
                                        );
                                    })}
                                </ul>
                                <p>
                                    <strong>Итого:</strong> {order.total} руб.
                                </p>
                            </div>

                            {canOrderBeCancelled(order) && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleCancelOrder(order.id)}
                                    className="mt-4"
                                >
                                    Отменить заказ
                                </Button>
                            )}

                            {showPayLink && (
                                <div className="mt-4">
                                    <a
                                        href={paymentLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block"
                                    >
                                        <Button className="w-full">Оплатить сейчас</Button>
                                    </a>
                                </div>
                            )}

                            {/* TODO: уничтожить после теста */}
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
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
