'use client';

import AuthorCard from '@/components/authors/AuthorCard';
import SearchBar from '@/components/shared/SearchBar';
import { Button } from '@/components/ui/button';
import { toAuthorsQueryParams } from '@/services/api/utils';
import { useFetchAuthors } from '@/shared/hooks/useFetchData';
import { useUpdateQueryParams } from '@/shared/hooks/useUpdateQueryParams';
import type { AuthorsQueryParams } from '@/shared/types/query-params.type';

import AuthorsFiltersBar from './AuthorFiltersBar';
//import AuthorFiltersBar from './AuthorFiltersBar';
import { AuthorForm } from './AuthorForm';

// TODO: loading и error

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

    const { hasNextPage = false, hasPrevPage = false, totalPages = 0, prevPage, nextPage, totalDocs } = data;

    return (
        <>
            <div className="max-w-6xl mx-auto p-4">
                <h1 className="text-2xl font-bold mb-6">Authors</h1>

                <AuthorForm />

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

                <div className={`grid grid-cols-4 gap-6 m-2.5 ${isPlaceholderData && 'opacity-50'}`}>
                    {authors.map((author) => (
                        <AuthorCard key={author.id} {...author} />
                    ))}
                </div>

                {authors.length === 0 ? (
                    <div>Products not found</div>
                ) : (
                    <div className="flex gap-2 mt-3">
                        {/* TODO: случай множества кликов отработать */}
                        <Button
                            onClick={() => updateQueryParams({ page: prevPage || 0 }, { resetPage: false })}
                            disabled={!hasPrevPage}
                        >
                            prev page: {page - 1}
                        </Button>
                        <Button
                            onClick={() => updateQueryParams({ page: nextPage || 2 }, { resetPage: false })}
                            disabled={!hasNextPage}
                        >
                            next page: {page + 1}
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
}

// TODO: Метатеги
