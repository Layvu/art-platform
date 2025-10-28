import { COLLECTION_SLUGS } from '@/services/api/api-url-builder';
import type { CollectionConfig } from 'payload';

// TODO: ниже драфт, зафиксировал идею
export const CartsCollection: CollectionConfig = {
    slug: 'carts',
    labels: { singular: 'Cart', plural: 'Carts' },
    admin: { useAsTitle: 'owner' },

    fields: [
        {
            name: 'owner',
            type: 'relationship',
            relationTo: COLLECTION_SLUGS.CUSTOMERS,
            required: true,
        },
        {
            name: 'items',
            type: 'array',
            fields: [
                { name: 'product', type: 'relationship', relationTo: COLLECTION_SLUGS.PRODUCTS, required: true },
                { name: 'quantity', type: 'number', required: true, defaultValue: 1 },
                { name: 'checked', type: 'checkbox', defaultValue: true },
            ],
        },
    ],

    access: {
        read: ({ req: { user } }) => !!user && user.role === 'admin',
        create: () => false,
        update: () => false,
        delete: ({ req: { user } }) => !!user && user.role === 'admin',
    },
};
