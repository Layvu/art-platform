import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AUTHORS_SORT_OPTIONS } from '@/shared/constants/authors.constants';
import { URL_SEPARATOR } from '@/shared/constants/constants';
import { PRODUCT_CATEGORIES } from '@/shared/constants/products.constants';
import type { AuthorsFilters, AuthorsSortOptions } from '@/shared/types/query-params.type';

import SearchBar from '../shared/SearchBar';

interface IAuthorFiltersBarProps {
    filters: AuthorsFilters;
    sort: AuthorsSortOptions;
    onFilterChange: (filters: AuthorsFilters) => void;
    onSortChange: (value: AuthorsSortOptions) => void;
}

// TODO: переиспользовать, передавая категории и опции сортировки
export default function AuthorsFiltersBar({ filters, sort, onFilterChange, onSortChange }: IAuthorFiltersBarProps) {
    return (
        <div className="flex items-start gap-6 mb-6">
            {/* Сортировка */}
            <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-gray-700">Сортировка</Label>
                <Select value={sort || ''} onValueChange={(value) => onSortChange(value as AuthorsSortOptions)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Выберите сортировку" />
                    </SelectTrigger>
                    <SelectContent>
                        {AUTHORS_SORT_OPTIONS.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                                {s.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Категории */}
            <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-700">Категории</span>
                <div className="flex gap-3 flex-wrap">
                    {PRODUCT_CATEGORIES.map((c) => {
                        // читаем состояние текущего чекбокса на основе фильтров
                        const currentCategories = filters?.category
                            ? filters.category.split(URL_SEPARATOR).filter(Boolean)
                            : [];
                        const isChecked = currentCategories.includes(c.value);

                        return (
                            <div key={c.value} className="flex items-center space-x-2">
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
                                <Label htmlFor={c.value} className="text-sm font-normal">
                                    {c.label}
                                </Label>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Поиск */}
            <SearchBar
                value={filters.search ? filters.search : ''}
                onChange={(value) => onFilterChange({ search: value })}
            />
        </div>
    );
}
