import type { NextConfig } from 'next';

const getMainRemotePattern = () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    const parsedUrl = new URL(baseUrl!);
    const protocol = parsedUrl.protocol.replace(':', '') as 'http' | 'https';

    const mainPattern = {
        protocol,
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        pathname: '/**', // Разрешаем все пути на нашем сервере
    };

    return mainPattern;
};

const nextConfig: NextConfig = {
    reactStrictMode: true,

    images: {
        remotePatterns: [getMainRemotePattern()],
    },

    async headers() {
        return [
            {
                // Применяем ко всем путям ащиту от XSS и Clickjacking
                source: '/(.*)',
                headers: [
                    { key: 'X-DNS-Prefetch-Control', value: 'on' },
                    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
                    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
                ],
            },
        ];
    },
};

export default nextConfig;

// TODO: почистить зависимости в package.json перед деплоем
