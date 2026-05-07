/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Optimize production builds
  compress: true,
  // Enable image optimization
  images: {
    unoptimized: true, // For Docker deployments
  },
  // Output standalone for smaller Docker image
  output: 'standalone',
};

module.exports = nextConfig;
