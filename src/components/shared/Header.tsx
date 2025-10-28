'use client';

import Image from 'next/image';
import Link from 'next/link';

import { PAGES } from '@/config/public-pages.config';

import { Menu } from '../Menu/Menu';

export function Header() {
    return (
        <header className="flex items-center justify-between p-4 bg-black text-white">
            <Link href={PAGES.HOME} className="flex items-center gap-2">
                <Image src="/globe.svg" alt="Art Logo" width={28} height={28} priority />
                <span className="text-lg font-semibold">Art Platform</span>
            </Link>

            <Menu />
        </header>
    );
}
