export const PRODUCTS_PER_PAGE = 4;

export const PRODUCTS_SORT_OPTIONS = [
    { value: 'created_at', label: 'Сначала новинки' },
    { value: 'price', label: 'Цена: по возрастанию' },
    { value: '-price', label: 'Цена: по убыванию' },
] as const;

export const PRODUCT_CATEGORIES = [
    { value: 'shopper', label: 'Шоперы' },
    { value: 'clothes', label: 'Одежда' },
] as const;
