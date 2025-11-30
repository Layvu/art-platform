export const PRODUCTS_PER_PAGE = 4;

export const PRODUCTS_SORT_OPTIONS = [
    { value: 'default', label: 'Сортировка по умолчанию' },
    { value: 'price', label: 'Цена: по возрастанию' },
    { value: '-price', label: 'Цена: по убыванию' },
    { value: 'created_at', label: 'Сначала новые' },
    { value: '-created_at', label: 'Сначала старые' },
] as const;

export const PRODUCT_CATEGORIES = [
    { value: 'shoppers', label: 'Шоперы' },
    { value: 'clothes', label: 'Одежда' },
    { value: 'trinkets', label: 'Брелоки' },
    { value: 'postcards', label: 'Открытки' },
    { value: 'ceramics', label: 'Керамика' },
    { value: 'stickers', label: 'Стикеры' },
    { value: 'knitted', label: 'Вязанные изделия' },
] as const;
