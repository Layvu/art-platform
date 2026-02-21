import type { Order } from '@/shared/types/payload-types';

import type { DELIVERY_TYPES, ORDER_STATUS } from '../constants/order.constants';

// TODO: переименовать все type из I... в T...

export type IOrderCreatePayloadData = Omit<Order, 'id' | 'orderNumber' | 'status' | 'createdAt' | 'updatedAt'>;

export type IOrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
export type IDeliveryType = (typeof DELIVERY_TYPES)[keyof typeof DELIVERY_TYPES];
export type IOrderItems = Exclude<Order['items'], null | undefined>;

// То, что отправляет фронт на бэк
export interface IOrderCreateRequest {
    items: {
        id: number;
        quantity: number;
    }[];
    deliveryType: IDeliveryType;
    address?: string;
}

export interface IOrderCreateResponse {
    success: boolean;
    orderId: number;
    paymentUrl?: string;
    message?: string;
}
