import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // NEXT_PUBLIC_BASE_URL is used for sitemap URL generation
  // Falls back to production URL if not set in environment
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || 'https://aisdk-storefront.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
