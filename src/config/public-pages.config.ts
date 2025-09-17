export const PAGES = {
    HOME: '/',
    AUTHORS: '/authors',
    AUTHOR: (username: string) => `/authors/${username}`,
    PRODUCTS: '/products',
    PRODUCT: (title: string) => `/products/${title}`,
    ABOUT: '/about',
};

// api.config.ts
// seo.config.ts
