import type { PropsWithChildren } from 'react';

import Footer from '@/components/shared/Footer';
import { Header } from '@/components/shared/Header';
import { MobileNav } from '@/components/shared/MobileNav';

export default function Layout({ children }: PropsWithChildren<unknown>) {
    return (
        <body>
            <Header />
            <main className="mt-2 sm:mt-0 min-h-[85vh]">{children}</main>
            <Footer />
            <MobileNav />
            <Footer />
        </body>
    );
}
