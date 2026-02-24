import configPromise from '@payload-config';
import { getPayload } from 'payload';

import { PAGES } from '@/config/public-pages.config';
import { COLLECTION_SLUGS, HTTP_METHODS } from '@/shared/constants/constants';
import { ORDER_STATUS } from '@/shared/constants/order.constants';
import { PAYMENT_STATUS } from '@/shared/constants/payment.constants';
import type { IOrderCreatePayloadData, IOrderCreateRequest } from '@/shared/types/order.interface';
import type { Order } from '@/shared/types/payload-types';
import type { IYookassaPaymentResponse, PaymentStatusType } from '@/shared/types/yookassa.interface';
import { isOrderFinished, isOrderInDelivery } from '@/shared/utils/orders.utils';

import { apiUrl } from '../api-url-builder';

import { BaseServerService } from './base-server.service';
import { payloadDataService } from './payload-data.service';
import { yookassaService } from './yookassa.service';

export class OrderServerService extends BaseServerService {
    async createOrderWithPayment(
        customerId: number,
        requestData: IOrderCreateRequest,
        customerEmail?: string,
    ): Promise<{ order: Order; paymentUrl?: string }> {
        // Заново пересчитываем данные заказа: запрашиваем товары, проверяем их актуальные данные и считаем общую сумму
        // Необходимо, чтобы защититься от подмены запроса со стороны клиента
        const preparedData = await this.prepareOrder(customerId, requestData);

        // Создание в БД (Status: Prepared, Payment: Pending)
        const newOrder = await this.createOrderInDb(preparedData);

        // Создание платежа в ЮКассе
        const payment = await yookassaService.createPayment({
            amount: newOrder.total,
            description: `Оплата заказа №${newOrder.orderNumber}`,
            returnUrl: apiUrl.publicPage(PAGES.PROFILE),
            metadata: { order_id: newOrder.id.toString() },
            customerEmail: customerEmail,
            items: preparedData.items.map((item) => ({
                title: item.productSnapshot.title,
                price: item.productSnapshot.price,
                quantity: item.quantity,
            })),
        });

        // Обновление paymentId и paymentLink в заказе
        await this.updateOrderField(newOrder.id, {
            paymentId: payment.id,
            paymentLink: payment.confirmation?.confirmation_url,
        });

        return {
            order: newOrder,
            paymentUrl: payment.confirmation?.confirmation_url,
        };
    }

    async captureOrderPayment(orderId: number): Promise<IYookassaPaymentResponse> {
        const order = await this.getOrderById(orderId);
        if (!order || !order.paymentId) {
            throw new Error('Заказ или ID платежа не найдены');
        }

        // Подтверждаем в ЮКассе
        const capturedPayment = await yookassaService.capturePayment(order.paymentId, order.total.toFixed(2));

        // Обновляем статус платежа в БД
        await this.updateOrderField(orderId, {
            paymentStatus: capturedPayment.status,
        });

        return capturedPayment;
    }

    async cancelOrder(orderId: number, isUserAction = false): Promise<void> {
        const order = await this.getOrderById(orderId);
        if (!order || !order.paymentId) {
            throw new Error('Заказ не найден');
        }

        // Проверяем статус заказа
        if (isUserAction) {
            if (isOrderFinished(order)) {
                throw new Error('Невозможно отменить завершенный заказ');
            }
            if (isOrderInDelivery(order)) {
                throw new Error('Невозможно отменить заказ в процессе доставки');
            }
        }

        // Отмена в ЮКассе
        await yookassaService.cancelPayment(order.paymentId);

        // Обновление в БД (Статус заказа и статус оплаты)
        await this.updateOrderField(orderId, {
            status: ORDER_STATUS.CANCELLED,
            paymentStatus: PAYMENT_STATUS.CANCELED,
        });
    }

    async processWebhookUpdate(orderId: string, yookassaStatus: string): Promise<void> {
        const payload = await getPayload({ config: configPromise });

        const paymentStatus = yookassaStatus as PaymentStatusType;

        // Здесь мы меняем только paymentStatus, а хук коллекции Orders обновит статус заказа (Status)
        // Источник правды - PaymentStatus

        await payload.update({
            collection: COLLECTION_SLUGS.ORDERS,
            id: orderId,
            data: {
                paymentStatus: paymentStatus,
            },
        });
    }

    private async createOrderInDb(orderData: IOrderCreatePayloadData): Promise<Order> {
        const url = apiUrl.collection(COLLECTION_SLUGS.ORDERS);

        const response = await fetch(url, {
            method: HTTP_METHODS.POST,
            headers: await this.getAuthHeaders(),
            body: JSON.stringify(orderData),
        });
        if (!response.ok) throw new Error('Server: Failed to create order');

        const data = await response.json();
        return data.doc || data;
    }

    private async updateOrderField(orderId: number, data: Partial<Order>): Promise<void> {
        const url = apiUrl.item(COLLECTION_SLUGS.ORDERS, orderId);

        const response = await fetch(url, {
            method: HTTP_METHODS.PATCH,
            headers: await this.getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error('Server: Failed to update order');
    }

    // Считает сумму и делает снэпшоты товаров для заказа
    async prepareOrder(customerId: number, requestData: IOrderCreateRequest): Promise<IOrderCreatePayloadData> {
        const { items: orderItems, deliveryType, cdekData, comment } = requestData;

        // Получаем данные товаров из БД
        const productIds = orderItems.map((orderItem) => orderItem.id);
        const products = await payloadDataService.getProductsByIds(productIds);

        let totalOrderSum = 0;
        const payloadItems = [];

        // Собираем items для заказа в формате снапшотов (фиксация данных на момент покупки)
        for (const orderItem of orderItems) {
            const product = products.find((product) => product.id === orderItem.id);

            if (!product) {
                throw new Error(`Товар с ID ${orderItem.id} не найден или снят с продажи`);
            }

            const productPrice = product.price;
            totalOrderSum += productPrice * orderItem.quantity;

            payloadItems.push({
                productSnapshot: {
                    productId: product.id,
                    title: product.title,
                    price: productPrice,
                },
                quantity: orderItem.quantity,
            });
        }

        // Формируем объект для создания заказа
        const orderPayload: IOrderCreatePayloadData = {
            customer: customerId,
            items: payloadItems,
            total: totalOrderSum,
            deliveryType,
            cdekData,
            comment,
        };

        return orderPayload;
    }

    async getOrderById(orderId: number): Promise<Order | null> {
        const url = apiUrl.item(COLLECTION_SLUGS.ORDERS, orderId);

        const response = await fetch(url, {
            headers: await this.getAuthHeaders(),
            cache: 'no-store', // Всегда актуальное состояние заказа
        });
        if (!response.ok) {
            return null;
        }

        const data = await response.json();

        return data;
    }
}

export const orderServerService = new OrderServerService();
