import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  experimental: {
    ppr: "incremental",
    cssChunking: true,
    useCache: true,
    cacheLife: {
      default: {
        stale: 3600,
        revalidate: 3600,
        expire: 86400,
      },
      hours: {
        stale: 3600,
        revalidate: 3600,
        expire: 7200,
      },
    },
  },
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: false,
  },
};

export default nextConfig;
