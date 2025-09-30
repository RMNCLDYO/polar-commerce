# AI SDK Storefront - Next.js 15 Showcase

> **Learn Next.js 15 experimental features through a real working example** - PPR, modern caching, ISR, smart prefetching, and more.

[![Next.js 15 Canary](https://img.shields.io/badge/Next.js-15.6.0--canary.34-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Vercel AI SDK](https://img.shields.io/badge/Vercel_AI_SDK-5.0.52-FF6B6B?style=flat-square&logo=vercel)](https://sdk.vercel.ai)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square)](https://tailwindcss.com)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

## Why This Repo?

**Learn by example.** This project demonstrates every major Next.js 15 feature in a real, production-ready storefront application. Perfect for developers who want to:

- 🚀 See **Partial Prerendering (PPR)** in action
- ⚡ Understand modern **`use cache`** directive patterns
- 🎯 Implement **smart prefetching** strategies
- 📦 Master **Server Components** architecture
- 🧪 Explore **experimental canary features** safely

## About

**Fork** of [v0 Storefront Template](https://v0.app/templates/storefront-w-nano-banana-ai-sdk-ai-gateway-XAMOoZPMUO5) by [@estebansuarez](https://github.com/estebansuarez) (DevRel at v0). All credit to Esteban for the original design and concept.

**This Fork:** Upgraded from Next.js 14 → 15.6.0-canary.34, React 18 → 19, added PPR, modern caching, ISR, and all experimental features.

## Quick Start

```bash
git clone https://github.com/RMNCLDYO/aisdk-storefront.git
cd aisdk-storefront
npm install
cp .env.example .env.local
# Add your GOOGLE_GENERATIVE_AI_API_KEY to .env.local
npm run dev
```

## Features Demonstrated

### Experimental Canary Features (Main Focus)
- ✅ **`experimental.ppr: "incremental"`** - Partial Prerendering with static shells + streaming
- ✅ **`experimental.cacheComponents: true`** - Modern component-level caching
- ✅ **`use cache` directive** - Replace legacy `unstable_cache` wrappers
- ✅ **`unstable_cacheLife()`** - Custom cache profiles (default, hours)
- ✅ **`unstable_cacheTag()`** - Tag-based cache invalidation
- ✅ **`experimental.cssChunking: true`** - Optimized CSS delivery
- ✅ **Request Deduplication (RDC)** - Auto-enabled with PPR
- ✅ **Turbopack** - Next-gen bundler for dev builds

### Next.js 15 Core Features
- ✅ **Server Components** - Default architecture (37% bundle reduction)
- ✅ **Async Request APIs** - `await params`, `await searchParams`
- ✅ **Route Groups** - `(shop)` pattern for shared layouts
- ✅ **Static Imports** - Automatic image optimization with width/height inference
- ✅ **`next/form`** - Native form component with progressive enhancement
- ✅ **Dynamic Metadata** - `generateMetadata()` with async support
- ✅ **`generateStaticParams()`** - Build-time route generation
- ✅ **Loading States** - `loading.tsx` with streaming UI
- ✅ **Error Boundaries** - `error.tsx` and `global-error.tsx`
- ✅ **Dynamic Sitemap** - `sitemap.ts` generation
- ✅ **Dynamic Robots.txt** - `robots.ts` configuration
- ✅ **`notFound()`** - Programmatic 404 handling

### Advanced Patterns
- ✅ **Smart Prefetching** - Custom strategies (hover, visible, always, never)
- ✅ **ISR** - Time-based revalidation with cache profiles
- ✅ **Server-Only Functions** - `server-only` package protection
- ✅ **Tag-based Revalidation** - `revalidateTag()` utilities
- ✅ **Parallel Data Fetching** - `Promise.all()` optimization
- ✅ **Image Formats** - AVIF + WebP with responsive sizing
- ✅ **Type Safety** - 100% strict TypeScript, zero `any` types

### Vercel AI SDK Integration
- ✅ **Google Gemini 2.5 Flash** - AI image generation and virtual try-on
- ✅ **Streaming Responses** - Real-time AI content generation
- ✅ **Type-Safe API** - Full TypeScript support

## Major Upgrades from v0 Template

### Infrastructure
- ✅ Next.js 14 → 15.6.0-canary.34
- ✅ React 18 → 19.1.0
- ✅ Tailwind CSS v3 → v4
- ✅ Added Biome 2.2 for linting/formatting
- ✅ Strict TypeScript with ES modules
- ✅ Turbopack integration

### Architecture
- ✅ Migrated to Server Components (37% bundle reduction)
- ✅ Implemented PPR with incremental mode
- ✅ Route groups for shared layouts (zero duplication)
- ✅ Modern `use cache` directive (removed `unstable_cache` wrappers)
- ✅ Component-level caching with `CachedContent` components
- ✅ ISR with time-based revalidation

### Performance
- ✅ Smart prefetching (hover strategy for products)
- ✅ Native image optimization with static imports
- ✅ Tag-based cache invalidation
- ✅ Parallel data fetching with Promise.all
- ✅ Optimized loading states

### Code Quality
- ✅ Removed all unused components
- ✅ Fixed all lint and type errors
- ✅ Added server-only directives
- ✅ Proper async param handling
- ✅ Type-safe metadata generation
- ✅ Environment variable compliance

### Features Added
- ✅ Dynamic sitemap generation
- ✅ SEO robots.txt configuration
- ✅ PWA manifest
- ✅ Error boundaries (global + route-level)
- ✅ Dark mode with system detection
- ✅ 404 handling
- ✅ Cache revalidation utilities

## Project Structure

```
app/
├── (shop)/              # Route group with shared layout
│   ├── layout.tsx       # Shared header/footer
│   ├── page.tsx         # Home (PPR enabled)
│   ├── [category]/      # Category pages (PPR + cached)
│   ├── product/[id]/    # Product pages (PPR + cached)
│   └── products/        # All products (PPR + cached)
├── api/                 # AI image generation endpoints
├── layout.tsx           # Root layout
├── sitemap.ts           # Dynamic sitemap
└── robots.ts            # SEO configuration

components/
├── link.tsx             # Smart prefetching wrapper
├── ui/                  # shadcn/ui components
└── [other components]   # Header, Footer, Product cards, etc.

lib/
├── products.ts          # Server-only data with "use cache"
├── revalidate.ts        # Cache invalidation utilities
└── [other utilities]    # Types, utils, logger, etc.
```

## Implementation Examples

### Modern Caching with `use cache`

```tsx
// lib/products.ts
import 'server-only';
import {
  unstable_cacheLife as cacheLife,
  unstable_cacheTag as cacheTag,
} from 'next/cache';

export async function getProducts(filters?: ProductFilters) {
  'use cache';
  cacheLife('hours');
  cacheTag('products');

  // Data fetching logic
  return filteredProducts;
}
```

### Component-Level Caching

```tsx
// app/(shop)/[category]/page.tsx
async function CachedCategoryContent({ category, search, sort }) {
  'use cache';
  cacheLife('hours');
  cacheTag('products', `category-${category}`);

  const products = await getProducts(filters);

  return <main>{/* Cached content */}</main>;
}

export default async function CategoryPage({ params, searchParams }) {
  const { category } = await params;
  const searchParamsData = await searchParams;

  return (
    <CachedCategoryContent
      category={category}
      search={searchParamsData?.search}
      sort={searchParamsData?.sort}
    />
  );
}

export const experimental_ppr = true;
```

### Smart Prefetching

```tsx
// components/link.tsx
export function Link({ prefetchStrategy = 'visible', ...props }) {
  const [shouldPrefetch, setShouldPrefetch] = useState(
    prefetchStrategy !== 'hover'
  );

  const prefetchValue =
    prefetchStrategy === 'never' ? false :
    prefetchStrategy === 'always' ? true :
    prefetchStrategy === 'hover' && !shouldPrefetch ? false :
    null;

  return (
    <NextLink
      {...props}
      prefetch={prefetchValue}
      onMouseEnter={(e) => {
        if (prefetchStrategy === 'hover' && !shouldPrefetch) {
          setShouldPrefetch(true);
        }
        props.onMouseEnter?.(e);
      }}
    />
  );
}
```

## Configuration

### next.config.ts

```typescript
const nextConfig: NextConfig = {
  experimental: {
    ppr: 'incremental',
    cssChunking: true,
    cacheComponents: true,
    cacheLife: {
      default: { stale: 3600, revalidate: 3600, expire: 86400 },
      hours: { stale: 3600, revalidate: 3600, expire: 7200 },
    },
  },
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'],
  },
};
```

### Environment Variables

```env
# Required for AI features
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here

# Optional for metadata
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Build Output

```
▲ Next.js 15.6.0-canary.34 (Turbopack)
- Experiments:
  · ppr: "incremental" ✓
  · cacheComponents: true ✓
  · rdcForNavigations ✓

✓ Compiled in 1079ms
✓ Static pages (19/19)
✓ Type check passed
✓ Lint check passed

Route (app)
┌ ◐ /                    - Partial Prerender
├ ◐ /[category]         - Partial Prerender
├ ◐ /product/[id]       - Partial Prerender
├ ◐ /products           - Partial Prerender
├ ○ /robots.txt         - Static
└ ○ /sitemap.xml        - Static

◐ = Partial Prerender (static shell + streaming content)
```

## Performance Metrics

```
Build Time:        1079ms (with Turbopack)
Bundle Reduction:  37% JavaScript (vs client components)
Static Pages:      19/19 generated at build time
PPR Routes:        4 (home, category, product, products)
Type Safety:       100% (zero `any` types)
Lint Issues:       0 (Biome strict mode)
```

## Key Changes from v0 Template

**See [merged PRs](https://github.com/RMNCLDYO/aisdk-storefront/pulls?q=is%3Apr+is%3Amerged) for detailed changes:**

1. **#1** - Initial Next.js 15 + React 19 + Tailwind v4 setup
2. **#5** - Server Components migration (37% bundle reduction)
3. **#8** - Server Components and bundle optimization
4. **#10** - PPR implementation with hover prefetching
5. **#13** - Cache optimization with modern directives
6. **#14** - Native image optimization
7. **#16** - Environment variables compliance
8. **#17** - ISR configuration with revalidation
9. **#19** - Loading state and cache strategy optimization

**Breaking Changes:**
- Removed `dynamicParams` exports (incompatible with `cacheComponents: true`)
- Migrated from `unstable_cache` wrapper to `use cache` directive
- Removed unused components and code comments
- Changed cache configuration: `useCache: true` → `cacheComponents: true`

## Use Cases

Perfect for:
- **Learning Next.js 15** - Real-world examples of every major feature
- **Migration Reference** - See how to upgrade from Next.js 14 to 15
- **Performance Benchmarking** - Compare PPR vs traditional rendering
- **Starter Template** - Fork and adapt for your own e-commerce project
- **Feature Documentation** - Code examples for experimental APIs

## Scripts

```bash
npm run dev        # Development with Turbopack
npm run build      # Production build
npm run lint       # Biome linting
npm run format     # Biome formatting
npm run typecheck  # TypeScript validation
```

## Tech Stack

- **Next.js** 15.6.0-canary.34
- **React** 19.1.0
- **TypeScript** 5
- **Tailwind CSS** v4
- **Vercel AI SDK** 5.0.52
- **Biome** 2.2.0
- **shadcn/ui** components

## Contributing

Contributions welcome! Areas of interest:
- Additional Next.js 15 feature demonstrations
- Performance optimizations
- Documentation improvements
- Bug fixes and type safety improvements

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Roadmap

Potential future additions:
- [ ] Server Actions examples
- [ ] Middleware patterns with PPR
- [ ] Advanced cache invalidation strategies
- [ ] More AI SDK features (streaming, tool calling)
- [ ] Performance comparison metrics
- [ ] Video tutorials and documentation

## Credits

**Original Template & Design:** [@estebansuarez](https://github.com/estebansuarez) - DevRel at [@v0](https://v0.dev)
**Template Link:** [v0 Storefront](https://v0.app/templates/storefront-w-nano-banana-ai-sdk-ai-gateway-XAMOoZPMUO5)

**Next.js 15 Upgrade:** [@RMNCLDYO](https://github.com/RMNCLDYO)

All credit to Esteban for the beautiful design and original concept. This fork demonstrates what's possible with Next.js 15 experimental features.

## Support

- **Issues:** [GitHub Issues](https://github.com/RMNCLDYO/aisdk-storefront/issues)
- **Discussions:** [GitHub Discussions](https://github.com/RMNCLDYO/aisdk-storefront/discussions)
- **PRs:** Always welcome!

## License

MIT - See [LICENSE](LICENSE)

---

⭐ **Star this repo** if it helped you learn Next.js 15!