import type { NextConfig } from 'next';

const nextConfig = {
  reactStrictMode: true,
  reactCompiler: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  cacheComponents: true,
  cacheLife: {
    default: {
      stale: 3600,
      revalidate: 3600,
      expire: 86400,
    },
    max: {
      stale: Infinity,
      revalidate: 86400,
      expire: Infinity,
    },
    hours: {
      stale: 3600,
      revalidate: 3600,
      expire: 7200,
    },
    days: {
      stale: 86400,
      revalidate: 86400,
      expire: 604800,
    },
  },
  experimental: {
    cssChunking: true,
    turbopackFileSystemCacheForDev: true,
  },
  turbopack: {
    root: __dirname,
  },
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 14400,
    qualities: [60, 75, 90],
    maximumRedirects: 3,
    dangerouslyAllowSVG: false,
    dangerouslyAllowLocalIP: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'polar-public-sandbox-files.s3.amazonaws.com',
        pathname: '/product_media/**',
      },
      {
        protocol: 'https',
        hostname: 'polar-public-production-files.s3.amazonaws.com',
        pathname: '/product_media/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://generativelanguage.googleapis.com https://*.convex.cloud https://*.convex.site wss://*.convex.cloud wss://*.convex.site",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
} satisfies NextConfig;

export default nextConfig;
