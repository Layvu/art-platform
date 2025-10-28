import type { PropsWithChildren } from 'react';

import AuthProvider from '@/components/AuthProvider';
import { Header } from '@/components/shared/Header';

export default function Layout({ children }: PropsWithChildren<unknown>) {
    return (
        <AuthProvider>
            <Header />
            {children}
        </AuthProvider>
    );
}
