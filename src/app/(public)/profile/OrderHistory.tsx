'use client';

import { useEffect, useMemo, useState } from 'react';

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
    const [isPaymentExpired, setIsPaymentExpired] = useState(false);
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
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-[20px] font-semibold">{order.orderNumber}</h3>
                            {canOrderBeCancelled(order) && (
                                <button
                                    onClick={() => handleCancelOrder(order.id)}
                                    className="text-[#E53E3E] bg-[#FFF5F5] px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                                >
                                    Отменить
                                </button>
                            )}
                        </div>

                        {/* Info: Дата и Доставка */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <p className="text-[#9CA3AF] text-sm mb-1">Дата заказа</p>
                                <p className="text-[#1A1A1A] font-medium">
                                    {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                                </p>
                            </div>
                            <div>
                                <p className="text-[#9CA3AF] text-sm mb-1">
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
                        <div className="flex flex-wrap gap-3 mb-8">
                            {order.items.map((item, idx) => {
                                const currentProduct = products.find((p) => p.id === item.productSnapshot.productId);
                                const mainImage =
                                    currentProduct &&
                                    currentProduct.gallery &&
                                    isImageData(currentProduct.gallery[0]?.image)
                                        ? currentProduct.gallery[0].image
                                        : '/placeholder.png';
                                return (
                                    // )
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

                        {/* Footer: Итого и Статус */}
                        <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                            <div className="flex items-baseline gap-4">
                                <span className="text-[24px] font-bold text-[#1A1A1A]">
                                    {order.total.toLocaleString('ru-RU')} ₽
                                </span>

                                {showPayLink && !isPaymentExpired && (
                                    <a href={paymentLink} target="_blank" rel="noopener noreferrer">
                                        <Button
                                            size="sm"
                                            className="bg-[#4FB0AF] hover:bg-[#3d8c8b] text-white rounded-xl px-6"
                                        >
                                            Оплатить сейчас
                                        </Button>
                                    </a>
                                )}
                            </div>

                            <div className={`px-4 py-2 rounded-xl text-sm font-medium ${getStatusStyles(status)}`}>
                                {getOrderStatusText(status)}
                            </div>
                        </div>

                        {/* Таймер оплаты (опционально внизу) */}
                        {showPayLink && !isPaymentExpired && (
                            <div className="mt-4 text-xs text-gray-400">
                                <Timer
                                    startTime={order.createdAt}
                                    durationMinutes={10}
                                    expiredText="Время на оплату истекло"
                                    onExpire={() => setIsPaymentExpired(true)}
                                />
                            </div>
                        )}
                    </Card>
                );
            })}
        </div>
        ////////////////////////////////////////////////////////////////////////////////////////////////////////

        // <div className="space-y-4">
        //     {orders.map((order) => {
        //         const status = order.status as (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS] | undefined;
        //         const paymentStatus = order.paymentStatus;
        //         const paymentLink = order.paymentLink;

        //         const showPayLink =
        //             status === ORDER_STATUS.PREPARED && paymentStatus === PAYMENT_STATUS.PENDING && !!paymentLink;

        //         return (
        //             <Card key={order.id}>
        //                 <CardHeader>
        //                     <CardTitle className="flex justify-between items-center text-base">
        //                         <span>Заказ #{order.orderNumber}</span>
        //                         {status && (
        //                             <span
        //                                 className={`text-sm font-normal px-2 py-1 rounded ${
        //                                     status === ORDER_STATUS.CANCELLED
        //                                         ? 'bg-destructive text-destructive-foreground'
        //                                         : status === ORDER_STATUS.COMPLETED
        //                                           ? 'bg-green-100 text-green-800'
        //                                           : status === ORDER_STATUS.PROCESSING
        //                                             ? 'bg-blue-100 text-blue-800'
        //                                             : 'bg-orange-100 text-orange-800'
        //                                 }`}
        //                             >
        //                                 {getOrderStatusText(status)}
        //                             </span>
        //                         )}
        //                         <p className="text-sm text-gray-500">Payment Status: {paymentStatus}</p>
        //                     </CardTitle>
        //                 </CardHeader>
        //                 <CardContent>
        //                     <div className="space-y-2 text-sm">
        //                         <p>
        //                             <strong>Дата создания заказа:</strong>{' '}
        //                             {new Date(order.createdAt).toLocaleDateString('ru-RU')}
        //                         </p>

        //                         {/* Способ получения и данные СДЭК */}
        //                         <p>
        //                             <strong>Способ получения:</strong>{' '}
        //                             {order.deliveryType === DELIVERY_TYPES.PICKUP ? 'Самовывоз' : 'Доставка СДЭК'}
        //                         </p>

        //                         {order.deliveryType === DELIVERY_TYPES.PICKUP && (
        //                             <p>
        //                                 <strong>Адрес самовывоза:</strong> {PICKUP_ADDRESS}
        //                             </p>
        //                         )}

        //                         {order.deliveryType === DELIVERY_TYPES.DELIVERY && order.cdekData && (
        //                             <>
        //                                 <p>
        //                                     <strong>Тип доставки:</strong>{' '}
        //                                     {order.cdekData.type === 'pvz' ? 'Пункт выдачи' : 'Курьер'}
        //                                 </p>
        //                                 <p>
        //                                     <strong>Адрес доставки:</strong> {order.cdekData.address}
        //                                 </p>
        //                             </>
        //                         )}

        //                         {order.trackingNumber && (
        //                             <p>
        //                                 <strong>Трек-номер СДЭК:</strong>{' '}
        //                                 {/* Для тестирования: trackingNumber: 10213627100 */}
        //                                 <a
        //                                     href={`https://www.cdek.ru/ru/tracking?order_id=${order.trackingNumber}`}
        //                                     target="_blank"
        //                                     rel="noopener noreferrer"
        //                                     className="text-blue-600 hover:underline font-mono"
        //                                 >
        //                                     {order.trackingNumber}
        //                                 </a>
        //                             </p>
        //                         )}

        //                         {order.comment && (
        //                             <p>
        //                                 <strong>Комментарий:</strong> {order.comment}
        //                             </p>
        //                         )}

        //                         {/* Товары */}
        //                         <p>
        //                             <strong>Товары:</strong>
        //                         </p>
        //                         <ul className="list-disc list-inside ml-2">
        //                             {order.items.map((item, index) => {
        //                                 const slug = slugMap[item.productSnapshot.productId];

        //                                 return (
        //                                     <li key={index}>
        //                                         {slug ? (
        //                                             <a
        //                                                 href={PAGES.PRODUCT(slug)}
        //                                                 className="text-blue-600 hover:underline"
        //                                             >
        //                                                 {item.productSnapshot.title}
        //                                             </a>
        //                                         ) : (
        //                                             <span>{item.productSnapshot.title}</span>
        //                                         )}{' '}
        //                                         - {item.quantity} шт. × {item.productSnapshot.price} руб.
        //                                     </li>
        //                                 );
        //                             })}
        //                         </ul>
        //                         <p>
        //                             <strong>Итого:</strong> {order.total} руб.
        //                         </p>
        //                     </div>

        //                     {canOrderBeCancelled(order) && (
        //                         <Button
        //                             variant="destructive"
        //                             size="sm"
        //                             onClick={() => handleCancelOrder(order.id)}
        //                             className="mt-4"
        //                         >
        //                             Отменить заказ
        //                         </Button>
        //                     )}

        //                     {showPayLink && !isPaymentExpired && (
        //                         <div className="mt-4 space-y-2">
        //                             <p className="text-sm">По истечению времени оплата будет автоматически отменена:</p>
        //                             <p className="text-sm">
        //                                 <Timer
        //                                     startTime={order.createdAt}
        //                                     durationMinutes={10}
        //                                     expiredText="Время на оплату истекло"
        //                                     onExpire={() => setIsPaymentExpired(true)}
        //                                 />
        //                             </p>
        //                             <a
        //                                 href={paymentLink}
        //                                 target="_blank"
        //                                 rel="noopener noreferrer"
        //                                 className="inline-block"
        //                             >
        //                                 <Button className="w-full">Оплатить сейчас</Button>
        //                             </a>
        //                         </div>
        //                     )}

        //                     {/* TODO: уничтожить после теста */}
        //                     {process.env.NODE_ENV === 'development' && (
        //                         <div className="mt-4 p-2 border border-dashed border-gray-400 rounded bg-gray-50">
        //                             <p className="text-xs font-mono mb-2">DEV: Webhook Simulation</p>
        //                             <div className="flex gap-2 flex-wrap">
        //                                 <Button
        //                                     variant="outline"
        //                                     onClick={() => triggerWebhook(order, 'waiting_for_capture')}
        //                                 >
        //                                     Simulate: waiting_for_capture
        //                                 </Button>
        //                                 <Button
        //                                     variant="outline"
        //                                     className="text-green-600 border-green-200"
        //                                     onClick={() => triggerWebhook(order, 'succeeded')}
        //                                 >
        //                                     Simulate: succeeded
        //                                 </Button>
        //                                 <Button
        //                                     variant="outline"
        //                                     className="text-red-600 border-red-200"
        //                                     onClick={() => triggerWebhook(order, 'canceled')}
        //                                 >
        //                                     Simulate: canceled
        //                                 </Button>
        //                             </div>
        //                         </div>
        //                     )}
        //                 </CardContent>
        //             </Card>
        //         );
        //     })}
        // </div>
    );
}
