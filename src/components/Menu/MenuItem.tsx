'use client';

import React from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/services/store/auth/store';

import CartButton from './CartButton';
import type { IMenuItem } from './menu.data';

export interface IMenuItemProps {
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

    if (menuItem.name === 'Корзина') {
        return <CartButton menuItem={menuItem} isActive={isActive} />;
    }

    return (
        <Link href={menuItem.href} className={`${isActive ? 'text-red' : 'text-zinc-900'} hover:underline`}>
            {menuItem.name}
        </Link>
    );
}
