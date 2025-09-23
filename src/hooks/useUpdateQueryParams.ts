'use client';

import { useCallback } from 'react';

import { useRouter } from 'next/navigation';

type UpdateOptions = {
    replace?: boolean;
    resetPage?: boolean;
};

export function useUpdateQueryParams() {
    const router = useRouter();

    const updateQueryParams = useCallback(
        (updates: Record<string, string | string[] | null>, options: UpdateOptions = {}) => {
            const { replace = false, resetPage = true } = options;

            // читаем актуальные query прямо при вызове
            const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');

            // Object.entries(updates).forEach(([key, value]) => {
            //     params.delete(key);

            //     if (Array.isArray(value)) {
            //         value.forEach((v) => params.append(key, v));
            //     } else if (value !== null) {
            //         params.set(key, value);
            //     }
            // });
            Object.entries(updates).forEach(([key, value]) => {
                if (value === null || value === '') {
                    params.delete(key);
                } else if (Array.isArray(value)) {
                    params.delete(key);
                    value.forEach((v) => params.append(key, v));
                } else {
                    params.set(key, value);
                }
            });

            if (resetPage) {
                params.set('page', '1');
            }

            const qs = params.toString();
            const url = qs ? `?${qs}` : '/';

            if (replace) {
                router.replace(url);
            } else {
                router.push(url);
            }
        },
        [router],
    );

    return updateQueryParams;
}
