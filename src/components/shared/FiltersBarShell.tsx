'use client';

import { useCallback, useState } from 'react';

import { debounce } from 'lodash';
import type { ReactNode } from 'react';

import SearchBar from '../shared/SearchBar';

interface FiltersBarShellProps {
    search?: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder?: string;
    children: ReactNode;
}

export function FiltersBarShell({
    search,
    onSearchChange,
    searchPlaceholder = 'Поиск',
    children,
}: FiltersBarShellProps) {
    const [searchValue, setSearchValue] = useState(search || '');

    const debouncedSearch = useCallback(
        debounce((value: string) => onSearchChange(value), 500),
        [onSearchChange],
    );

    const handleSearchChange = (value: string) => {
        setSearchValue(value);
        debouncedSearch(value);
    };

    return (
        <div className="flex items-start gap-6 mb-9">
            <SearchBar value={searchValue} onChange={handleSearchChange} placeholder={searchPlaceholder} />

            <div className="flex gap-2">{children}</div>
        </div>
    );
}
