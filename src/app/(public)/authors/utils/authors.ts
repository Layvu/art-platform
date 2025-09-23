import type { AuthorsSortOption, IAuthor, IAuthorsFilters } from '@/shared/types/author.interface';
import type { ProductCategory } from '@/shared/types/product.interface';

export const filterAndSortAuthors = (
    authors: IAuthor[],
    search: string,
    filters: IAuthorsFilters,
    sortBy: AuthorsSortOption,
): IAuthor[] => {
    return authors
        .filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
        .filter((a) => filters.productCategories.every((category) => a.productCategories.includes(category)))
        .sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return 0;
                case 'products_count_asc':
                    return a.productsCount - b.productsCount;
                case 'products_count_desc':
                    return b.productsCount - a.productsCount;
                default:
                    return 0;
            }
        });
};

export function parseQueryToAuthorFilters(urlQuery: string) {
    const params = new URLSearchParams(urlQuery);

    // считываем CSV-параметр productCategories (формат "clothes,shopper")
    const rawCats = params.get('productCategories');
    const productCategories = rawCats
        ? rawCats
              .split(',')
              .map((c) => c.trim())
              .map((category) => category as ProductCategory)
        : [];

    return {
        search: params.get('search') || '',
        filters: {
            productCategories,
        },
        sortBy: params.get('sortBy') as AuthorsSortOption,
        page: Number(params.get('page')),
    };
}
