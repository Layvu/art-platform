import { COLLECTION_SLUGS } from '@/shared/constants/constants';
import { ORDER_STATUS } from '@/shared/constants/order.constants';
import { type IOrderCreateInput, type IOrderStatus } from '@/shared/types/order.interface';
import type { Order } from '@/shared/types/payload-types';

import { ApiUrlBuilder } from './api-url-builder';

export class OrderService {
    private apiKey: string;

    constructor() {
        this.apiKey = process.env.PAYLOAD_API_KEY!;
    }

    private getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
            Authorization: `${COLLECTION_SLUGS.USERS} API-Key ${this.apiKey}`,
        };
    }

    async createOrder(orderData: IOrderCreateInput): Promise<Order> {
        const url = ApiUrlBuilder.forCollection(COLLECTION_SLUGS.ORDERS, {
            depth: 0, // получаем customers только в виде Id
        });

        const response = await fetch(url, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(orderData),
        });

        if (!response.ok) throw new Error('Failed to create order');

        const data = await response.json();
        return data.doc || data;
    }

    // TODO: жоско туду, какой baseUrl, где getAuthHeaders и api builder?
    async getOrdersByCustomer(customerId: number): Promise<Order[]> {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/orders?where[customer][equals]=${customerId}&depth=1`, {
            credentials: 'include', // Используем cookies
            cache: 'no-store',
        });

        if (!response.ok) {
            if (response.status === 403 || response.status === 401) {
                console.warn('User not authenticated or no access to orders');
                return [];
            }
            throw new Error('Failed to load orders');
        }

        const data = await response.json();
        return data.docs || [];
    }

    async updateOrderStatus(orderId: number, status: IOrderStatus): Promise<void> {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/orders/${orderId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ status }),
        });

        if (!response.ok) throw new Error('Failed to update order status');
    }

    async cancelOrder(orderId: number): Promise<void> {
        return this.updateOrderStatus(orderId, ORDER_STATUS.CANCELLED);
    }
}

export const orderService = new OrderService();
