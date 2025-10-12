'use client';

import AuthorCard from '@/components/AuthorCard';
import { payloadService } from '@/services/api/payload-service';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { filterAndSortAuthors } from './utils/authors';
import { Button } from '@/components/ui/button';
import { useDebounce } from 'use-debounce';
import { AUTHORS_PER_PAGE } from './constants';
import type { AuthorsSortOption, IAuthorsFilters } from '@/shared/types/author.interface';

export default function AuthorsList({
    debouncedSearch,
    filters,
    sortBy,
    page,
    onNextPage,
}: {
    debouncedSearch: string;
    filters: IAuthorsFilters;
    sortBy: AuthorsSortOption;
    page: number;
    onNextPage: () => void;
}) {
    const query = useQuery({
        queryKey: ['authors'],
        queryFn: () => payloadService.getAuthors(),
    });
   
    const authors = query.data;
    
    // Фильтрация, сортировка и пагинация
    const filteredAuthors = useMemo(() => {
        // фильтруем по debouncedSearch, что уменьшит частоту пересчётов
        return filterAndSortAuthors(authors ? authors : [], debouncedSearch, filters, sortBy);
    }, [authors, debouncedSearch, filters, sortBy]);

    const paginatedAuthors = useMemo(() => {
        return filteredAuthors.slice(0, page * AUTHORS_PER_PAGE);
    }, [filteredAuthors, page]);

    if (query.isLoading) {
        return <div>Loading...</div>;
    }
    if (query.isError) {
        return <div>Error: {query.error.message}</div>;
    }

    const hasMore = filteredAuthors.length > paginatedAuthors.length;
    console.log('hasMore: ', hasMore, filteredAuthors, paginatedAuthors);
    return (
        <>
            <div className="grid grid-cols-4 gap-6">
                {paginatedAuthors.map((author) => (
                    <AuthorCard key={author.id} {...author} />
                ))}
            </div>

            {/* Пагинация */}
            {/* TODO: вынести в отдельный компонент */}
            {hasMore && (
                <Button onClick={onNextPage} disabled={!hasMore} className="mt-4">
                    Загрузить ещё
                </Button>
            )}
        </>
    );
}
