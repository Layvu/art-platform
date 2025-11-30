import type { PropsWithChildren } from 'react';

import { Header } from '@/components/shared/Header';

export default function Layout({ children }: PropsWithChildren<unknown>) {
    return (
        <>
            <Header />
            {children}
        </>
    );
}
