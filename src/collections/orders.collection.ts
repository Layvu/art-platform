import { COLLECTION_SLUGS } from '@/services/api/api-url-builder';
import type { CollectionConfig } from 'payload';

// TODO: ниже драфт, зафиксировал идею
export const OrdersCollection: CollectionConfig = {
    slug: 'orders',
    labels: { singular: 'Order', plural: 'Orders' },
    admin: { useAsTitle: 'orderNumber' },

    fields: [
        { name: 'orderNumber', type: 'text', unique: true, admin: { readOnly: true } },
        {
            name: 'customer',
            type: 'relationship',
            relationTo: COLLECTION_SLUGS.CUSTOMERS,
            required: true,
        },
        {
            name: 'items',
            type: 'array',
            fields: [
                { name: 'productSnapshot', type: 'json', required: true },
                { name: 'quantity', type: 'number', required: true },
            ],
        },
        {
            name: 'deliveryType',
            type: 'select',
            options: [
                { value: 'pickup', label: 'Самовывоз' },
                { value: 'delivery', label: 'Доставка' },
            ],
            defaultValue: 'pickup',
        },
        { name: 'address', type: 'text' },
        {
            name: 'status',
            type: 'select',
            options: [
                { value: 'processing', label: 'В обработке' },
                { value: 'assembled', label: 'Собран' },
                { value: 'sent', label: 'Отправлен' },
                { value: 'delivered', label: 'Доставлен' },
                { value: 'completed', label: 'Выполнен' },
                { value: 'cancelled', label: 'Отменён' },
            ],
            defaultValue: 'processing',
        },
        { name: 'total', type: 'number', required: true },
    ],

    access: {
        read: ({ req: { user } }) => !!user && user.role === 'admin',
        create: () => false,
        update: ({ req: { user } }) => !!user && user.role === 'admin',
        delete: ({ req: { user } }) => !!user && user.role === 'admin',
    },
};
