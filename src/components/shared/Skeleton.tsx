import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/shared/utils/tailwind';

interface ProductsLoaderProps {
    showHeader?: boolean;
    productsCount?: number;
    columnsCount?: number;
}

export function ProductsLoader({ showHeader = true, productsCount = 12, columnsCount = 4 }: ProductsLoaderProps) {
    return (
        <div className="wrap">
            {showHeader && <ProductsHeaderLoader />}
            <ProductsGridLoader productsCount={productsCount} columnsCount={columnsCount} />
        </div>
    );
}

// Лоадер для хедера с фильтрами
function ProductsHeaderLoader() {
    return (
        <div className="mb-8">
            <Skeleton className="h-8 w-32 mb-8" />

            <div className="flex gap-3 flex-row">
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-28" />

                <Skeleton className="h-10 w-full" />

                <Skeleton className="h-10 w-36" />
            </div>
        </div>
    );
}

function ProductsGridLoader({ productsCount = 16, columnsCount }: { productsCount: number; columnsCount: number }) {
    const gridColsClass =
        {
            2: 'grid-cols-1 sm:grid-cols-2',
            3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
            4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
            5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
            6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
        }[columnsCount] || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

    return (
        <div className="flex flex-col">
            <div className={cn('grid gap-6 auto-rows-fr', gridColsClass)}>
                {Array.from({ length: productsCount }).map((_, index) => (
                    <ProductCardLoader key={index} />
                ))}
            </div>

            <PaginationLoader />
        </div>
    );
}

// Лоадер для карточки товара
function ProductCardLoader() {
    return (
        <div className="col-span-1">
            <div className="p-0 h-fit overflow-hidden rounded-lg bg-card">
                <div className="relative w-full aspect-square overflow-hidden">
                    <Skeleton className="w-full h-full" />
                </div>
            </div>
        </div>
    );
}

// Лоадер для пагинации
function PaginationLoader() {
    return (
        <div className="flex gap-2 justify-center items-center mt-8">
            <Skeleton className="h-10 w-10 rounded" />

            {Array.from({ length: 5 }).map((_, idx) => (
                <Skeleton key={idx} className="h-10 w-10 rounded" />
            ))}

            <Skeleton className="h-10 w-10 rounded" />
        </div>
    );
}

// Альтернативный вариант - компактный лоадер (без фильтров)
export function CompactProductsLoader({ productsCount = 8, columnsCount = 4 }: ProductsLoaderProps) {
    const gridColsClass =
        {
            2: 'grid-cols-1 sm:grid-cols-2',
            3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
            4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
            5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
        }[columnsCount] || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

    return (
        <div className="wrap flex flex-col">
            <div className={cn('grid gap-6 auto-rows-fr', gridColsClass)}>
                {Array.from({ length: productsCount }).map((_, index) => (
                    <ProductCardLoader key={index} />
                ))}
            </div>
            <PaginationLoader />
        </div>
    );
}

// Skeleton для отдельных элементов (для более гибкого использования)
export const ProductsSkeleton = {
    Card: ProductCardLoader,

    FiltersBar: () => (
        <div className="flex flex-wrap gap-3 items-center">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-36" />
        </div>
    ),

    SearchAndSort: () => (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <Skeleton className="h-10 w-full sm:w-80" />
            <Skeleton className="h-10 w-40" />
        </div>
    ),
};

