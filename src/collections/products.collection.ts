import type { CollectionConfig } from 'payload';

import { PRODUCT_CATEGORIES } from '@/app/(public)/products/constants';

export const ProductsCollection: CollectionConfig = {
    slug: 'products',
    labels: { singular: 'Product', plural: 'Products' },
    access: { read: () => true }, // публичный read
    fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'price', type: 'number', required: true },
        { name: 'description', type: 'textarea' },
        { name: 'image', type: 'text' }, // TODO: relationTo: 'media'
        {
            name: 'category',
            type: 'select',
            options: [...PRODUCT_CATEGORIES.map(({ value, label }) => ({ value, label }))],
            required: false,
        },
        {
            name: 'author',
            type: 'relationship',
            relationTo: 'authors', // связь с коллекцией authors
            required: true,
        },
    ],
};
