'use client';

import { usePathname } from 'next/navigation';
import { MenuItem } from './MenuItem';
import { MENU } from './menu.data';
import { match } from 'path-to-regexp';

export function Menu() {
    const pathName = usePathname();

    return (
        <nav className="flex gap-6 ">
            {MENU.map((menuItem) => (
                <MenuItem key={menuItem.name} menuItem={menuItem} isActive={!!match(menuItem.href)(pathName)} />
            ))}
        </nav>
    );
}
