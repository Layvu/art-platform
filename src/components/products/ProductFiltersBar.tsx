import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { URL_SEPARATOR } from '@/shared/constants/constants';
import { PRODUCT_CATEGORIES,PRODUCTS_SORT_OPTIONS } from '@/shared/constants/products.constants';
import type { ProductsFilters, ProductsSortOptions } from '@/shared/types/query-params.type';

interface IProductFiltersBarProps {
    filters: ProductsFilters;
    sort: ProductsSortOptions;
    onFilterChange: (filters: ProductsFilters) => void;
    onSortChange: (value: ProductsSortOptions) => void;
}

// TODO: переиспользовать, передавая категории и опции сортировки
export default function ProductFiltersBar({ filters, sort, onFilterChange, onSortChange }: IProductFiltersBarProps) {
    return (
        <div className="flex items-start gap-6">
            {/* Категории */}
            <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-gray-700">Категории</Label>
                {PRODUCT_CATEGORIES.map((c) => {
                    // читаем состояние текущего чекбокса на основе фильтров
                    const currentCategories = filters?.category
                        ? filters.category.split(URL_SEPARATOR).filter(Boolean)
                        : [];
                    const isChecked = currentCategories.includes(c.value);

                    return (
                        <div key={c.value}>
                            <Label className="flex items-center gap-2">
                                <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                        const current = filters?.category?.split(URL_SEPARATOR).filter(Boolean) ?? [];
                                        const newCategories = checked
                                            ? [...new Set([...current, c.value])] // добавляем
                                            : current.filter((v) => v !== c.value); // удаляем

                                        onFilterChange({
                                            ...filters,
                                            category: newCategories.length
                                                ? newCategories.join(URL_SEPARATOR)
                                                : undefined, // чтобы убрать параметр из URL
                                        });
                                    }}
                                />
                                {c.label}
                            </Label>
                        </div>
                    );
                })}

                {/* 
                <Select
                    value={filters?.category || 'all'}
                    onValueChange={(value) =>
                        onFilterChange({
                            category: value === 'all' ? undefined : (value as ProductCategory),
                        })
                    }
                >
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Все категории" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Все категории</SelectItem>
                        {PRODUCT_CATEGORIES.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                                {c.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select> */}
            </div>

            {/* Сортировка */}
            <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-gray-700">Сортировка</Label>
                <Select
                    value={sort || 'default'}
                    onValueChange={(value) =>
                        onSortChange(value === 'default' ? undefined : (value as ProductsSortOptions))
                    }
                >
                    <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="Сортировка по умолчанию" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="default">Сортировка по умолчанию</SelectItem>
                        {PRODUCTS_SORT_OPTIONS.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                                {s.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {/* TODO кнопочку приделать чтобы не отправлять кучу запросов на сервер */}
            {/* Поиск */}
            <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-gray-700">Поиск</Label>
                <Input
                    className="max-w-[320px]"
                    placeholder="Поиск..."
                    value={filters?.search ?? ''}
                    onChange={(e) => onFilterChange({search:e.target.value})}
                />
            </div>
        </div>
    );
}
