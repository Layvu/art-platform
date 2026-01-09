'use client';

import AuthorCard from '@/components/authors/AuthorCard';
import { Button } from '@/components/ui/button';
import { toAuthorsQueryParams } from '@/services/api/utils';
import { useFetchAuthors } from '@/shared/hooks/useFetchData';
import { useUpdateQueryParams } from '@/shared/hooks/useUpdateQueryParams';
import type { AuthorsQueryParams } from '@/shared/types/query-params.type';

import AuthorsFiltersBar from './AuthorFiltersBar';

export default function AuthorsUI({ initialParams }: { initialParams: AuthorsQueryParams }) {
    const page = Number(initialParams.page) || 1;
    const params = toAuthorsQueryParams(initialParams);

    const { data, isError, error, isPlaceholderData, isFetching } = useFetchAuthors(params);
    const authors = data?.docs;

    const updateQueryParams = useUpdateQueryParams<AuthorsQueryParams>();

    if (isError) {
        return <div>Error: {error.message}</div>;
    }
    if (isFetching) {
        return <div>Loading...</div>;
    }
    if (!authors) {
        return <div>Products not found</div>;
    }

    const { hasNextPage = false, hasPrevPage = false, prevPage, nextPage } = data;

    return (
        <>
            <div className="wrap">
                {/* <AuthorForm /> */}

                {/* Поиск, фильтры и сортировка */}
                <AuthorsFiltersBar
                    filters={{
                        category: initialParams.category,
                        search: initialParams.search,
                    }}
                    sort={initialParams.sort}
                    onFilterChange={(value) =>
                        updateQueryParams({
                            category: value.category,
                            search: value.search,
                        })
                    }
                    onSortChange={(value) => updateQueryParams({ sort: value })}
                />

                <div className={`grid grid-cols-4 gap-5 mb-10 ${isPlaceholderData && 'opacity-50'}`}>
                    {authors.map((author) => (
                        <AuthorCard key={author.id} {...author} />
                    ))}
                </div>

                {authors.length === 0 ? (
                    <div>authors not found</div>
                ) : (
                    <div className="flex gap-2 justify-center">
                        {/* TODO: случай множества кликов отработать */}
                        {prevPage && (
                            <Button
                                variant="ghost"
                                onClick={() => updateQueryParams({ page: prevPage || 0 }, { resetPage: false })}
                                disabled={!hasPrevPage}
                            >
                                {page - 1}
                            </Button>
                        )}
                        <Button variant="secondary" disabled={true}>
                            {page}
                        </Button>
                        {hasNextPage && (
                            <Button
                                variant="ghost"
                                onClick={() => updateQueryParams({ page: nextPage || 2 }, { resetPage: false })}
                            >
                                {page + 1}
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

// TODO: Метатеги
