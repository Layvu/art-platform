import React, { Suspense } from 'react';

import { PAGES } from '@/config/public-pages.config';

import LoginFormUI from './LoginFormUI';

interface LoginPageProps {
    searchParams: Promise<{ redirect?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
    const params = await searchParams;
    const redirectUrl = params.redirect || PAGES.PROFILE;

    return (
        <Suspense fallback={<div>Загрузка...</div>}>
            <LoginFormUI redirectUrl={redirectUrl} />
        </Suspense>
    );
}
