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
};

export default nextConfig;

// TODO: почистить зависимости в package.json перед деплоем
