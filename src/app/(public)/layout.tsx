import type { PropsWithChildren } from 'react';

import Footer from '@/components/shared/Footer';
import { Header } from '@/components/shared/Header';
import { MobileNav } from '@/components/shared/MobileNav';

export default function Layout({ children }: PropsWithChildren<unknown>) {
    return (
        <body>
            <Header />
            <main className="pb-20 sm:pb-0 mt-2 sm:mt-0 px-2 sm:px-0">{children}</main>
            <Footer />
            <MobileNav />
        </body>
    );
}
