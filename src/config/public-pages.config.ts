export const PAGES = {
    HOME: '/',
    AUTHORS: '/authors',
    AUTHOR: (username: string) => `/authors/${username}`,
    PRODUCTS: '/products',
    PRODUCT: (title: string) => `/products/${title}`,
    ABOUT: '/about',
    LOGIN: '/login',
    REGISTER: '/register',
    PROFILE: '/profile',
};

// api.config.ts
// seo.config.ts
