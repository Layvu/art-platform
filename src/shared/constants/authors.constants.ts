export const AUTHORS_PER_PAGE = 4;

export const AUTHORS_SORT_OPTIONS = [
    { value: 'created_at', label: 'Сначала новые авторы' },
    { value: 'products_count', label: 'Количество товаров: по возрастанию' },
    { value: '-products_count', label: 'Количество товаров: по убыванию' },
] as const;
