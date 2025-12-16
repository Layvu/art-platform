'use client';

import React from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/services/store/auth/store';

import type { IMenuItem } from './menu.data';

interface IMenuItemProps {
    menuItem: IMenuItem;
    isActive: boolean;
}

export function MenuItem({ menuItem, isActive }: IMenuItemProps) {
    const router = useRouter();
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = async () => {
        await logout();

        // Принудительно обновляем страницу, чтобы все компоненты перерисовались
        router.refresh();
    };

    if (menuItem.name === 'Выход') {
        return (
            <button
                onClick={handleLogout}
                className={`${isActive ? 'text-red' : 'text-black'} hover:underline cursor-pointer`}
            >
                {menuItem.name}
            </button>
        );
    }

    return (
        <Link href={menuItem.href} className={`${isActive ? 'text-red' : 'text-black'} hover:underline`}>
            {menuItem.name}
        </Link>
    );
}
