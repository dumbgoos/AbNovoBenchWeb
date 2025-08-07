/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // Configure image domains and cache behavior
  images: {
    domains: ['ext.same-assets.com'],
    formats: ['image/avif', 'image/webp'],
    // Disable image optimization for external images to avoid hydration issues
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ext.same-assets.com',
        pathname: '**',
      },
    ],
  },
  // Ensure consistent async/await transforms
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "*.same-app.com"],
    },
    appDir: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  trailingSlash: false,
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
