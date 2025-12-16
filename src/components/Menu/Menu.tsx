'use client';

import { usePathname } from 'next/navigation';
import { match } from 'path-to-regexp';

import { useAuthStore } from '@/services/store/auth/store';

import { MENU } from './menu.data';
import { MenuItem } from './MenuItem';

export function Menu() {
    const pathName = usePathname();
    // Получаем частичные данные текущего пользователя из localStorage
    const user = useAuthStore((state) => state.user);

    // Если пользователь авторизован (user существует), то отрисовываем Profile и Logout
    // Иначе отрисовываем Login и Register
    const menuItems = MENU.filter((menuItem) => {
        if (user) {
            return !menuItem.guestOnly;
        } else {
            return !menuItem.requiresAuth;
        }
    });

    return (
        <nav className="flex gap-6">
            {menuItems.map((menuItem) => (
                <MenuItem
                    key={menuItem.name}
                    menuItem={menuItem}
                    isActive={!!match(menuItem.href, { decode: decodeURIComponent })(pathName)}
                />
            ))}
        </nav>
    );
}
