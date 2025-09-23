import type { IProduct, IProductsFilters, ProductCategory, ProductsSortOption } from '@/shared/types/product.interface';

export const filterAndSortProducts = (
    products: IProduct[],
    search: string,
    filters: IProductsFilters,
    sortBy: ProductsSortOption,
): IProduct[] => {
    return products
        .filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
        .filter((p) => (filters.category ? p.category === filters.category : true))
        .filter((p) => (filters.author ? p.author.name === filters.author : true))
        .sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return 0;
                case 'price_asc':
                    return a.price - b.price;
                case 'price_desc':
                    return b.price - a.price;
                default:
                    return 0;
            }
        });
};

export function parseQueryToProductFilters(urlQuery: string) {
    const params = new URLSearchParams(urlQuery);

    return {
        search: params.get('search') || '',
        filters: {
            category: params.get('category') as ProductCategory,
            author: params.get('author'),
        } as IProductsFilters,
        sortBy: params.get('sortBy') as ProductsSortOption,
        page: Number(params.get('page')),
    };
}
