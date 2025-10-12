import React from 'react';

import type { Metadata } from 'next';
import { Geist } from 'next/font/google';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import './globals.css';
import Providers from './providers';

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
