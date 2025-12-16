'use client';

import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PAGES } from '@/config/public-pages.config';
import { orderService } from '@/services/api/order-service';
import { getOrderStatusText, ORDER_STATUS } from '@/shared/constants/order.constants';
import { useProductSlugs } from '@/shared/hooks/useFetchData';
import type { Order } from '@/shared/types/payload-types';

interface OrderHistoryProps {
    customerId: number;
}

export default function OrderHistory({ customerId }: OrderHistoryProps) {
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
                const customerOrders = await orderService.getOrdersByCustomer(customerId);
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
        await orderService.cancelOrder(orderId);
        // Обновляем список заказов
        setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: ORDER_STATUS.CANCELLED } : order)));
    };

    if (loading) return <div>Загрузка заказов...</div>;

    if (orders.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">У вас пока нет заказов</p>
                <Button onClick={() => (window.location.href = PAGES.PRODUCTS)} className="mt-4">
                    Перейти к покупкам
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {orders.map((order) => {
                const status = order.status as (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS] | undefined;

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
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <p>
                                    <strong>Дата:</strong> {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                                </p>
                                <p>
                                    <strong>Способ получения:</strong>{' '}
                                    {order.deliveryType === 'pickup' ? 'Самовывоз' : 'Доставка'}
                                </p>
                                <p>
                                    <strong>Адрес:</strong> {order.address}
                                </p>
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

                            {status === ORDER_STATUS.PROCESSING && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleCancelOrder(order.id)}
                                    className="mt-4"
                                >
                                    Отменить заказ
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
