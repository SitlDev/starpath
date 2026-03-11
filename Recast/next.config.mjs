/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.youtube.com',
            },
            {
                protocol: 'https',
                hostname: '**.ytimg.com',
            },
        ],
    },
};

export default nextConfig;
