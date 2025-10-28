'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { match } from 'path-to-regexp';

import { MENU } from './menu.data';
import { MenuItem } from './MenuItem';

export function Menu() {
    const pathName = usePathname();
    const { data: session } = useSession();

    // Если пользователь авторизован (session существует), то отрисовываем Profile и Logout
    // Иначе отрисовываем Login и Register
    const menuItems = MENU.filter((menuItem) => {
        if (session) {
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
