import type { AuthorsSortOption, IAuthorFiltersBarProps } from '@/shared/types/author.interface';
import type { ProductCategory } from '@/shared/types/product.interface';

import { PRODUCT_CATEGORIES } from '../products/constants';

import { AUTHORS_SORT_OPTIONS } from './constants';

// TODO: переиспользовать, передавая категории и опции сортировки
export default function AuthorsFiltersBar({ filters, sortBy, onFilterChange, onSortChange }: IAuthorFiltersBarProps) {
    return (
        <div className="flex items-start gap-6">
            {/* Категории */}
            <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-700">Категории</span>
                <div className="flex gap-3 flex-wrap">
                    {PRODUCT_CATEGORIES.map((c) => {
                        const checked = filters.productCategories.includes(c.value as ProductCategory);

                        return (
                            <label key={c.value} className="inline-flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => {
                                        const updated = checked
                                            ? filters.productCategories.filter((val) => val !== c.value)
                                            : [...filters.productCategories, c.value as ProductCategory];

                                        onFilterChange({ productCategories: updated });
                                    }}
                                    className="h-4 w-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">{c.label}</span>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* Сортировка */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Сортировка</label>
                <select
                    value={sortBy || ''}
                    onChange={(e) => onSortChange(e.target.value ? (e.target.value as AuthorsSortOption) : null)}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                >
                    {AUTHORS_SORT_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                            {s.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
