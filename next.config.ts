import type { NextConfig } from 'next';

const nextConfig = {
  reactStrictMode: false, // Disable double token requests in dev
  reactCompiler: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  experimental: {
    cssChunking: true,
    cacheComponents: true,
    turbopackFileSystemCacheForDev: true,
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
  },
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 14400, // 4 hours - Next.js 16 default (improved from 60s)
    qualities: [60, 75, 90], // Multiple quality levels for e-commerce product images
    maximumRedirects: 3, // Next.js 16 default (improved from unlimited)
    dangerouslyAllowSVG: false,
    dangerouslyAllowLocalIP: false, // Next.js 16 security restriction - blocks local IP optimization
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
