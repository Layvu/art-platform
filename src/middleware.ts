import { NextRequest, NextResponse } from 'next/server';

import { PAGES } from './config/public-pages.config';

export function middleware(request: NextRequest) {
    // console.log('middleware');

    return NextResponse.next();
}

export const config = {
    matcher: [PAGES.PRODUCTS + '/:path*'], // защищённые роуты
};

// middleware в next во многом как guard в angular
// Максимально дробить по функциям и кондишенам, так будет оптимально (до 50-60КБ вес)
