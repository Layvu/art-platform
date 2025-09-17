import type { CollectionConfig } from 'payload';

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
            name: 'author',
            type: 'relationship',
            relationTo: 'authors', // связь с коллекцией authors
            required: true,
        },
    ],
};
