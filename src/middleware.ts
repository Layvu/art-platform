import { NextRequest, NextResponse } from 'next/server';

import { PAGES } from './config/public-pages.config';

export function middleware( request: NextRequest) {
    // console.log('middleware');

    return NextResponse.next();
}

const protectedPath = `/${PAGES.PRODUCTS}/:path*`;

export const config = {
  //  matcher: [protectedPath],  // защищённые роуты
  matcher: ['/products/:path*'],
};

// middleware в next во многом как guard в angular
// Максимально дробить по функциям и кондишенам, так будет оптимально (до 50-60КБ вес)
