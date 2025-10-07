import type { IProduct } from '../types/product.interface';

export const PRODUCTS: IProduct[] = [
    {
        id: '1',
        slug: 'product-1',
        category: 'clothes',
        title: 'Product 1',
        description: 'Description 1',
        price: 100,
        author: { id: '1', name: 'John Doe', slug: 'john-doe', productsCount: 10, productCategories: ['clothes'] },
    },
    {
        id: '2',
        slug: 'product-2',
        category: 'clothes',
        title: 'Product 2',
        description: 'Description 2',
        price: 200,
        author: { id: '1', name: 'John Doe', slug: 'john-doe', productsCount: 10, productCategories: ['clothes'] },
    },
    {
        id: '3',
        slug: 'product-3',
        category: 'clothes',
        title: 'Product 3',
        description: 'Description 3',
        price: 300,
        author: { id: '1', name: 'John Doe', slug: 'john-doe', productsCount: 10, productCategories: ['clothes'] },
    },
    {
        id: '4',
        slug: 'product-4',
        category: 'clothes',
        title: 'Product 4',
        description: 'Description 4',
        price: 400,
        author: { id: '1', name: 'John Doe', slug: 'john-doe', productsCount: 10, productCategories: ['clothes'] },
    },
];
