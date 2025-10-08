import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'http', // Allow HTTP (less secure)
                hostname: 'res.cloudinary.com',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
            {
                protocol: 'https',
                hostname: 'api.digitalmarke.bdic.ng',
            },
        ],
    },
    output: 'standalone',
    webpack: (config, { isServer }) => {
        if (!isServer) {
            // Exclude Node.js-specific modules in client-side builds
            config.resolve.fallback = {
                ...config.resolve.fallback,
                net: false,
                tls: false,
                fs: false,
            };
        }
        return config;
    },
};

export default nextConfig;