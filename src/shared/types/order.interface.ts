import type { Order } from '@/shared/types/payload-types';

import type { DELIVERY_TYPES } from '../constants/order.constants';

// TODO: переименовать все type из I... в T...

export type IOrderCreateInput = Omit<Order, 'id' | 'orderNumber' | 'status' | 'createdAt' | 'updatedAt'>;

export type IOrderStatus = Exclude<Order['status'], null | undefined>;
export type IDeliveryType = (typeof DELIVERY_TYPES)[keyof typeof DELIVERY_TYPES];
