import type { PropsWithChildren } from 'react';

import AuthProvider from '@/components/AuthProvider';
import { Header } from '@/components/Header';

export default function Layout({ children }: PropsWithChildren<unknown>) {
    return (
        <AuthProvider>
            <Header />
            {children}
        </AuthProvider>
    );
}
