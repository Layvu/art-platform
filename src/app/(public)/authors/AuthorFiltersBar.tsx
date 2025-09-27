import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AuthorsSortOption, IAuthorFiltersBarProps } from '@/shared/types/author.interface';
import type { ProductCategory } from '@/shared/types/product.interface';

import { PRODUCT_CATEGORIES } from '../products/constants';

import { AUTHORS_SORT_OPTIONS } from './constants';

// TODO: переиспользовать, передавая категории и опции сортировки
export default function AuthorsFiltersBar({ filters, sortBy, onFilterChange, onSortChange }: IAuthorFiltersBarProps) {
    return (
        <div className="flex items-start gap-6">
            {/* Сортировка */}
            <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-gray-700">Сортировка</Label>
                <Select value={sortBy || ''} onValueChange={(value) => onSortChange(value as AuthorsSortOption)}>
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
                        const checked = filters.productCategories.includes(c.value as ProductCategory);

                        return (
                            <div key={c.value} className="flex items-center space-x-2">
                                <Checkbox
                                    checked={checked}
                                    onCheckedChange={(value) => {
                                        const updated = value
                                            ? [...filters.productCategories, c.value as ProductCategory]
                                            : filters.productCategories.filter((val) => val !== c.value);

                                        onFilterChange({ productCategories: updated });
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
        </div>
    );
}
