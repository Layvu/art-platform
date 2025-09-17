import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    reactStrictMode: true,
    images: {
        // TODO: удалить - для тестирования. Для загрузки картинок нужно разрешать хост - в данном случае фотки с товаров Ленты :)
        domains: ['cdn.lentochka.lenta.com'],
    },
};

export default nextConfig;

// TODO: почистить зависимости в package.json перед деплоем
