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
    sortBar?: ReactNode;
}

export function FiltersBarShell({
    search,
    onSearchChange,
    searchPlaceholder = 'Поиск',
    children,
    sortBar,
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
        <div className="flex items-start gap-3 mb-6">
            <div className="flex gap-3">{children}</div>
            <SearchBar value={searchValue} onChange={handleSearchChange} placeholder={searchPlaceholder} />
            <div className="">{sortBar}</div>
        </div>
    );
}
