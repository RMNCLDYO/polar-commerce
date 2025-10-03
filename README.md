# AI SDK Storefront - Next.js 15 Showcase

> **Learn Next.js 15 experimental features through a real working example** - PPR, modern caching, ISR, smart prefetching, and more.

[![Next.js 15 Canary](https://img.shields.io/badge/Next.js-15.6.0--canary.34-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Vercel AI SDK](https://img.shields.io/badge/Vercel_AI_SDK-5.0.59-FF6B6B?style=flat-square&logo=vercel)](https://sdk.vercel.ai)
[![Convex](https://img.shields.io/badge/Convex-1.27.3-FF6B35?style=flat-square)](https://convex.dev)
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.3.8-7C3AED?style=flat-square)](https://better-auth.com)
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

**This Fork:** Upgraded from Next.js 14 → 15.6.0-canary.34, React 18 → 19.2, added PPR, modern caching, ISR, and all experimental features. Fully integrated with Convex real-time database, Better Auth, and Polar subscriptions - **a complete production-ready e-commerce platform**.

## 🚀 Platform Capabilities

This is a **fully functional e-commerce platform** showcasing Next.js 15 experimental features with real backend infrastructure:

### 🛍️ E-Commerce Features
- **Product Catalog** - Browse products by category (Men's, Women's, Kids, New Arrivals)
- **Search & Filter** - Real-time search across product names, descriptions, and categories
- **Product Details** - Individual product pages with images, pricing, and descriptions
- **Dynamic Images** - Product images served from Polar S3 with Next.js optimization

### 🔐 User Authentication
- **Email/Password** - Secure authentication with email verification
- **OAuth Login** - GitHub social authentication
- **Two-Factor Auth** - Optional 2FA with QR code setup
- **Password Reset** - Email-based password recovery
- **Protected Routes** - Dashboard and settings require authentication
- **User Profile** - Account management and settings

### 💳 Payment & Subscriptions
- **Polar Integration** - Full payment and subscription processing
- **Product Sync** - Automatic synchronization between Convex and Polar
- **Webhook Events** - Real-time event processing for product/subscription updates
- **Multi-Environment** - Support for both sandbox and production

### 🗄️ Database & Real-time
- **Convex Backend** - Real-time database with auto-generated types
- **Live Queries** - Data updates without page refresh
- **Type Safety** - End-to-end TypeScript from database to UI
- **Server-Side Caching** - Optimized performance with `use cache` directive

### 🤖 AI-Powered Features
- **Virtual Try-On** - Upload a photo and see yourself wearing products
- **Product Imaging** - AI-generated product photography
- **Google Gemini** - Powered by Gemini 2.5 Flash for fast, high-quality generation

### 📦 Product Management
- **JSON-Based** - Define products in `products.json`
- **Automated Seeding** - One command to populate database and Polar
- **Image Upload** - Automatic upload to Polar S3 with checksums
- **Idempotent** - Updates existing products instead of duplicating
- **Testing Suite** - 10 automated tests validate integrity

### 🛠️ Developer Experience
- **Parallel Dev Servers** - Frontend (Next.js) and Backend (Convex) run simultaneously
- **HTTPS Development** - WebSocket support with self-signed certificates
- **Type Generation** - Auto-generated types from Convex schema
- **CLI Tools** - Product management, testing, and debugging commands
- **Hot Reload** - Instant updates for both frontend and backend code

**See [CHANGELOG.md](CHANGELOG.md) for detailed changes and migration guide.**

## Quick Start

```bash
git clone https://github.com/RMNCLDYO/aisdk-storefront.git
cd aisdk-storefront
npm install
cp .env.example .env.local

# Configure environment variables
# Add your API keys to .env.local:
# - GOOGLE_GENERATIVE_AI_API_KEY
# - POLAR_ORGANIZATION_TOKEN
# - POLAR_WEBHOOK_SECRET
# - GITHUB_CLIENT_ID/SECRET (for auth)

# Seed products from JSON
npm run products:seed

# Start development
npm run dev
```

Visit `https://localhost:3000` (HTTPS required for Convex WebSockets)

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

### Product Management System
- ✅ **JSON-based Seeding** - Define products in `products.json`, seed with one command
- ✅ **Idempotent Operations** - Updates existing products instead of duplicating
- ✅ **Polar Integration** - Automatic sync to Polar for subscriptions/payments
- ✅ **Image Upload** - Automatic upload to Polar S3 with checksums
- ✅ **Comprehensive Testing** - 10 automated tests (uniqueness, sync, images)
- ✅ **CLI Commands** - `products:seed`, `products:reset`, `products:verify`

### Database & Backend
- ✅ **Convex Real-time Database** - Server-side database with live queries
- ✅ **Better Auth** - Email/password + OAuth (GitHub) authentication
- ✅ **Polar Subscriptions** - Payment processing and subscription management
- ✅ **Webhook Handling** - Polar event processing for real-time sync
- ✅ **Type-Safe API** - Auto-generated types from Convex schema

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
- ✅ Convex real-time database integration
- ✅ Better Auth (email + OAuth)
- ✅ Polar subscription system
- ✅ Product management with JSON seeding
- ✅ Automated testing suite (10 tests)

## Project Structure

```
app/
├── (shop)/              # Route group with shared layout
│   ├── layout.tsx       # Shared header/footer
│   ├── page.tsx         # Home (PPR enabled)
│   ├── [category]/      # Category pages (PPR + cached)
│   ├── product/[id]/    # Product pages (PPR + cached)
│   └── products/        # All products (PPR + cached)
├── (auth)/              # Authentication routes (sign-in, sign-up)
├── api/                 # AI image generation endpoints
├── layout.tsx           # Root layout
├── sitemap.ts           # Dynamic sitemap
└── robots.ts            # SEO configuration

convex/
├── schema.ts            # Database schema definition
├── products.ts          # Product CRUD operations
├── polar.ts             # Polar client configuration
├── http.ts              # Webhook handlers
├── auth.ts              # Better Auth integration
└── [other functions]    # Todos, etc.

scripts/
├── seedFromJson.ts      # Seed products from JSON (idempotent)
├── completeReset.ts     # Reset all products
├── testCompleteFlow.ts  # 10 automated tests
└── testPolarConnection.ts # Polar API test

components/
├── link.tsx             # Smart prefetching wrapper
├── ui/                  # shadcn/ui components
└── [other components]   # Header, Footer, Product cards, etc.

lib/
├── products.ts          # Server-only data with "use cache"
├── revalidate.ts        # Cache invalidation utilities
├── auth-client.ts       # Client-side auth utilities
├── auth-server.ts       # Server-side auth utilities
└── [other utilities]    # Types, utils, logger, etc.

products.json            # Product definitions for seeding
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

### Product Management with Convex & Polar

```tsx
// convex/schema.ts
export default defineSchema({
  products: defineTable({
    name: v.string(),
    price: v.number(),
    category: v.string(),
    imageUrl: v.string(),
    description: v.string(),
    polarProductId: v.optional(v.string()),
    polarImageUrl: v.optional(v.string()),
    polarImageId: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("category", ["category"])
    .index("polarProductId", ["polarProductId"]),
});
```

```typescript
// scripts/seedFromJson.ts - Idempotent seeding
// 1. Reads products.json
// 2. Checks if products exist in Polar/Convex by name
// 3. Updates if exists, creates if new
// 4. Uploads images to Polar S3
// 5. Links everything together

// Usage:
// npm run products:seed    # Seed/update from JSON
// npm run products:reset   # Delete all products
// npm run products:verify  # Run 10 validation tests
```

```json
// products.json
[
  {
    "name": "Nike ZoomX Vomero Plus",
    "price": 18000,
    "category": "running-shoes",
    "imageUrl": "/products/nike-vomero.jpeg",
    "description": "Premium running shoes with ZoomX foam technology"
  }
]
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
};
```

### Environment Variables

```env
# AI Features
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here

# Convex Database
CONVEX_DEPLOYMENT=dev:your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://your-deployment.convex.site

# Better Auth
BETTER_AUTH_URL=https://localhost:3000
BETTER_AUTH_SECRET=your_secret_here
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Polar Subscriptions
POLAR_ORGANIZATION_TOKEN=your_polar_org_token
POLAR_WEBHOOK_SECRET=your_polar_webhook_secret
POLAR_SERVER=sandbox  # or production

# App Configuration
NEXT_PUBLIC_BASE_URL=https://localhost:3000
SITE_URL=https://localhost:3000
```

See [SETUP.md](SETUP.md) for detailed setup instructions.

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
# Development
npm run dev                    # Development with Turbopack
npm run build                  # Production build
npm run lint                   # Biome linting
npm run format                 # Biome formatting

# Product Management
npm run products:seed          # Seed/update products from products.json (idempotent)
npm run products:reset         # Delete all products from Convex and Polar
npm run products:verify        # Run 10 validation tests
npm run polar:test-connection  # Test Polar API connection
```

## Tech Stack

- **Next.js** 15.6.0-canary.34
- **React** 19.2.0
- **TypeScript** 5
- **Tailwind CSS** v4
- **Vercel AI SDK** 5.0.59
- **Convex** 1.27.3 - Real-time database with type-safe queries
- **Better Auth** 1.3.8 - Modern authentication (email + OAuth)
- **Polar SDK** 0.35.4 - Subscription and payment processing
- **Biome** 2.2.5
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