import type { PropsWithChildren } from 'react';

import { Header } from '@/components/Header';

export default function Layout({ children }: PropsWithChildren<unknown>) {
    return (
        <div>
            <Header />
            {children}
        </div>
    );
}
