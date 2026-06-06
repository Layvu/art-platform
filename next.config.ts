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

const csp = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api-maps.yandex.ru https://yastatic.net https://*.yandex.ru https://*.yandex.net;
  connect-src 'self' https://api-maps.yandex.ru https://yastatic.net https://*.yandex.ru https://*.yandex.net https://*.yandex.com;
  img-src 'self' data: blob: https: https://*.yandex.ru https://*.yandex.net https://*.yandex.com;
  style-src 'self' 'unsafe-inline' https://yastatic.net https://*.yandex.ru https://*.yandex.net;
  frame-src 'self' https://api-maps.yandex.ru https://*.yandex.ru;
  worker-src 'self' blob:;
  font-src 'self' data: https://yastatic.net https://*.yandex.net;
`
  .replace(/\s{2,}/g, ' ')
  .trim();
  
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
                    { key: 'Content-Security-Policy', value: csp },
                ],
            },
        ];
    },
};

export default nextConfig;

// TODO: почистить зависимости в package.json перед деплоем
