import React from 'react';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { Metadata } from 'next';
import { Geist } from 'next/font/google';

import Providers from './providers';

import './globals.css';
import '@/styles/global.scss';

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
                <Providers>
                    {children}
                    <ReactQueryDevtools />
                    {/* TODO Only for development */}
                </Providers>
            </body>
        </html>
    );
}
