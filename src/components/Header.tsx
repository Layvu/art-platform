import Image from 'next/image';
import Link from 'next/link';
import { Menu } from './Menu/Menu';
import { PAGES } from '@/config/public-pages.config';

export function Header() {
    return (
        <header className="flex items-center justify-between p-4 bg-black text-white">
            <Link href={PAGES.HOME} className="flex items-center gap-2">
                <Image src="/globe.svg" alt="Art Logo" width={28} height={28} priority />
            </Link>

            <Menu />
        </header>
    );
}
