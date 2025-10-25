import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  reactCompiler: true,
  typedRoutes: true,
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
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
      stale: 604800,
      revalidate: 86400,
      expire: 2592000,
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
    // E-commerce specific profiles
    products: {
      stale: 1800,        // 30 minutes - serve stale product data
      revalidate: 900,    // 15 minutes - revalidate in background
      expire: 3600,       // 1 hour - max stale age
    },
    inventory: {
      stale: 300,         // 5 minutes - inventory changes frequently
      revalidate: 60,     // 1 minute - quick revalidation
      expire: 600,        // 10 minutes - expire quickly
    },
    catalog: {
      stale: 7200,        // 2 hours - catalog rarely changes
      revalidate: 3600,   // 1 hour - revalidate
      expire: 86400,      // 1 day - expire
    },
    pricing: {
      stale: 600,         // 10 minutes - prices can change
      revalidate: 300,    // 5 minutes - revalidate often
      expire: 1800,       // 30 minutes - expire
    },
  },
  experimental: {
    cssChunking: true,
    turbopackFileSystemCacheForDev: true,
    turbopackFileSystemCacheForBuild: true,
    typedEnv: true,
    inlineCss: true,
    viewTransition: true,
    staticGenerationRetryCount: 3,
    staticGenerationMaxConcurrency: 8,
    staticGenerationMinPagesPerWorker: 25,
  },
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
          },
        },
      };
    }
    return config;
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
};

export default nextConfig;
