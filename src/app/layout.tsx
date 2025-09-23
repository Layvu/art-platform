import React from 'react';

import type { Metadata } from 'next';
import { Geist } from 'next/font/google';

import { ReactQueryProvider } from '@/lib/react-query';

import './globals.css';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: {
        template: '%s - Art Platform',
        default: 'Art Platform',
    },
    description: 'Веб-платформа для деятелей искусства',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ru">
            <body className={`${geistSans.variable} antialiased`}>
                <ReactQueryProvider>{children}</ReactQueryProvider>
            </body>
        </html>
    );
}
