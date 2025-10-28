import type { IProduct } from '../types/product.interface';

export const PRODUCTS: IProduct[] = [
    {
        id: '1',
        title: 'Product 1',
        description: 'Description of a product',
        price: 100,
        category: 'shopper',
        author: {
            id: '1',
            name: 'John Doe',
            slug: '',
            productsCount: 0,
            productCategories: [],
        },
        slug: '',
    },
];
