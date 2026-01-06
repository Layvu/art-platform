import { COLLECTION_SLUGS, HTTP_METHODS } from '@/shared/constants/constants';
import type { IOrderCreatePayloadData, IOrderCreateRequest, IOrderStatus } from '@/shared/types/order.interface';
import type { Order } from '@/shared/types/payload-types';

import { apiUrl } from '../api-url-builder';

import { BaseServerService } from './base-server.service';
import { payloadDataService } from './payload-data.service';

export class OrderServerService extends BaseServerService {
    // Метод для записи заказа в БД
    async createOrder(orderData: IOrderCreatePayloadData): Promise<Order> {
        const url = apiUrl.collection(COLLECTION_SLUGS.ORDERS);

        const response = await fetch(url, {
            method: HTTP_METHODS.POST,
            headers: this.getAuthHeaders(),
            body: JSON.stringify(orderData),
        });

        if (!response.ok) throw new Error('Server: Failed to create order');

        const data = await response.json();
        return data.doc || data;
    }

    // Считает сумму и делает снапшоты товаров для заказа
    async prepareOrder(customerId: number, requestData: IOrderCreateRequest): Promise<IOrderCreatePayloadData> {
        const { items: orderItems, deliveryType, address } = requestData;

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
            address,
        };

        return orderPayload;
    }

    async updateOrderStatus(orderId: number, status: IOrderStatus): Promise<void> {
        const url = apiUrl.item(COLLECTION_SLUGS.ORDERS, orderId);

        const response = await fetch(url, {
            method: HTTP_METHODS.PATCH,
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ status }),
        });

        if (!response.ok) throw new Error('Server: Failed to update order status');
    }

    async getOrderById(orderId: number): Promise<Order | null> {
        const url = apiUrl.item(COLLECTION_SLUGS.ORDERS, orderId);

        const response = await fetch(url, {
            headers: this.getAuthHeaders(),
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
