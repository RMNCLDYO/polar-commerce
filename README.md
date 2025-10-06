# AI SDK Storefront

Production-ready e-commerce platform built with Next.js 15, demonstrating experimental features (PPR, Server Components, modern caching) with real-time backend.

[![Next.js 15](https://img.shields.io/badge/Next.js-15.6.0--canary.45-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Convex](https://img.shields.io/badge/Convex-1.27.4-FF6B35?style=flat-square)](https://convex.dev)
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.3.8-7C3AED?style=flat-square)](https://better-auth.com)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

## What Is This?

Full-stack e-commerce application showcasing Next.js 15 experimental features in production. Fork of [v0 Storefront Template](https://v0.app/templates/storefront-w-nano-banana-ai-sdk-ai-gateway-XAMOoZPMUO5) by [@estebansuarez](https://github.com/estebansuarez), upgraded from Next.js 14 → 15.6 with complete backend integration.

## Core Features

### E-Commerce
- Product catalog with categories (Men's, Women's, Kids, New Arrivals)
- Real-time search and filtering
- Product detail pages with optimized images
- Shopping cart (coming soon)

### Authentication
- Email/password with verification
- GitHub OAuth
- Two-factor authentication
- Password reset
- Protected routes (/dashboard, /settings)

### Subscriptions
- 3-tier system (Free, Starter $9.99/mo, Premium $19.99/mo)
- Interactive pricing page with monthly/yearly toggle
- Automatic customer creation on signup
- Tier detection in user authentication
- Polar payment processing

### Database & Real-time
- Convex real-time database
- Live queries (no page refresh needed)
- Type-safe end-to-end TypeScript
- Bi-directional sync with Polar

### AI Features
- Virtual try-on (upload photo, see yourself in products)
- AI product photography
- Google Gemini 2.5 Flash integration

## Tech Stack

- **Next.js** 15.6.0-canary.45 (PPR, Server Components, modern caching)
- **React** 19.2.0
- **Convex** 1.27.4 (real-time database)
- **Better Auth** 1.3.8 (email + OAuth)
- **Polar SDK** 0.35.4 (subscriptions)
- **Tailwind CSS** v4
- **Vercel AI SDK** 5.0.60
- **TypeScript** 5

## Quick Start

```bash
git clone https://github.com/RMNCLDYO/aisdk-storefront.git
cd aisdk-storefront
npm install
cp .env.example .env.local

# Add environment variables to .env.local:
# - GOOGLE_GENERATIVE_AI_API_KEY
# - POLAR_ORGANIZATION_TOKEN
# - POLAR_WEBHOOK_SECRET
# - GITHUB_CLIENT_ID/SECRET
# - Convex vars (auto-added by `npx convex dev`)

# Seed data
npm run polar:seed              # Seed subscription tiers + products
# Or individually:
# npx tsx scripts/seedProducts.ts      # Physical products only
# npx tsx scripts/seedSubscriptions.ts # Subscription tiers only

# Start development (parallel frontend + backend)
npm run dev
```

Visit `https://localhost:3000` (HTTPS required for Convex WebSockets)

## Next.js 15 Features Demonstrated

### Experimental (Main Focus)
- ✅ Partial Prerendering (PPR) - Static shell + streaming
- ✅ `use cache` directive - Modern component caching
- ✅ `unstable_cacheLife()` - Custom cache profiles
- ✅ `unstable_cacheTag()` - Tag-based invalidation
- ✅ `experimental.cacheComponents` - Component-level caching
- ✅ Request Deduplication (RDC) - Auto-enabled with PPR
- ✅ Turbopack - Next-gen bundler

### Core Features
- ✅ Server Components (37% bundle reduction)
- ✅ Server Actions - `"use server"` mutations
- ✅ Middleware - Route protection
- ✅ Async Request APIs - `await params`, `await searchParams`
- ✅ Smart prefetching (hover strategy)
- ✅ Native image optimization
- ✅ Dynamic metadata generation
- ✅ ISR with time-based revalidation

## Project Structure

```
app/
├── (shop)/              # Public routes (PPR enabled)
│   ├── page.tsx         # Home
│   ├── [category]/      # Category pages
│   ├── product/[id]/    # Product details
│   ├── products/        # All products
│   └── pricing/         # Subscription pricing
├── (auth)/              # Protected routes
│   ├── dashboard/       # User dashboard with todos
│   └── settings/        # Account settings
└── (unauth)/            # Auth flows
    ├── sign-in/
    ├── sign-up/
    └── verify-2fa/

convex/
├── schema.ts            # Database schema
├── products.ts          # Product CRUD
├── productsSync.ts      # Bi-directional sync
├── polar/               # Local Polar component
├── polarCustomer.ts     # Customer management
├── userSync.ts          # Auto-create customers
├── auth.ts              # Better Auth + tier detection
├── factoryReset.ts      # Complete data reset
└── [other functions]

scripts/
├── seedAll.ts           # Seed everything
├── seedProducts.ts      # Physical products
└── seedSubscriptions.ts # Subscription tiers
```

## Key Implementation Patterns

### Modern Caching

```tsx
// lib/products.ts
import 'server-only';
import { unstable_cacheLife as cacheLife, unstable_cacheTag as cacheTag } from 'next/cache';

export async function getProducts(filters?: ProductFilters) {
  'use cache';
  cacheLife('hours');
  cacheTag('products');

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

export const experimental_ppr = true;
```

### Subscription System

```tsx
// convex/auth.ts - Auto-tier detection
export const getCurrentUser = query({
  handler: async (ctx) => {
    const user = await safeGetUser(ctx);
    if (!user) return null;

    const subscription = await polar.getCurrentSubscription(ctx, { userId: user._id });

    let tier: 'free' | 'starter' | 'premium' = 'free';
    if (subscription?.productKey?.includes('starter')) tier = 'starter';
    if (subscription?.productKey?.includes('premium')) tier = 'premium';

    return { ...user, subscription, tier, isFree, isStarter, isPremium };
  },
});

// User signup trigger - Auto-create Polar customer
export const authComponent = createClient({
  triggers: {
    user: {
      onCreate: async (ctx, authUser) => {
        await ctx.scheduler.runAfter(0, internal.userSync.onUserCreated, {
          userId: authUser._id,
          email: authUser.email,
        });
      },
    },
  },
});
```

## Scripts

```bash
# Development
npm run dev                    # Parallel frontend + backend (Turbopack)
npm run build                  # Production build
npm run lint                   # Biome linting + Convex typecheck

# Product & Subscription Management
npm run polar:seed                          # Seed subscription tiers + products
npx tsx scripts/seedProducts.ts             # Seed physical products only
npx tsx scripts/seedSubscriptions.ts        # Seed subscription tiers only
npx tsx scripts/seedAll.ts                  # Seed everything at once
npx tsx scripts/verifySeeding.ts            # Verify seeding success
npx convex run factoryReset:factoryReset    # Complete data wipe
npx convex run inspectData:inspectAll       # Debug database state
```

## Environment Variables

```env
# AI Features
GOOGLE_GENERATIVE_AI_API_KEY=your_key

# Convex Database (auto-configured by `npx convex dev`)
CONVEX_DEPLOYMENT=dev:your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://your-deployment.convex.site

# Better Auth
BETTER_AUTH_SECRET=your_secret
GITHUB_CLIENT_ID=your_github_id
GITHUB_CLIENT_SECRET=your_github_secret

# Polar Subscriptions
POLAR_ORGANIZATION_TOKEN=your_polar_token
POLAR_WEBHOOK_SECRET=your_webhook_secret
POLAR_SERVER=sandbox  # or production

# App
SITE_URL=https://localhost:3000
NEXT_PUBLIC_BASE_URL=https://localhost:3000
```

## Performance

```
Build Time:        1079ms (Turbopack)
Bundle Reduction:  37% vs client components
Static Pages:      19/19 at build time
PPR Routes:        4 (home, category, product, products)
Type Safety:       100% (zero any types)
```

## Major Upgrades

### From v0 Template
- Next.js 14 → 15.6.0-canary.45
- React 18 → 19.2.0
- Tailwind CSS v3 → v4
- Added Server Components (37% bundle reduction)
- Added PPR + modern caching
- Added Convex real-time database
- Added Better Auth (email + OAuth + 2FA)
- Added Polar subscriptions (3-tier system)
- Added AI virtual try-on

### Recent Updates
- **v0.3.1** - Fixed duplicate customer creation, downgraded better-auth to 1.3.8
- **v0.3.0** - Added subscription system with Polar integration
- **v0.2.0** - Complete backend integration (Convex + Better Auth + Polar)
- **v0.1.21** - Cache modernization with component-level caching

See [CHANGELOG.md](CHANGELOG.md) for detailed changes.

## Credits

**Original Template:** [@estebansuarez](https://github.com/estebansuarez) - DevRel at [@v0](https://v0.dev)
**Template:** [v0 Storefront](https://v0.app/templates/storefront-w-nano-banana-ai-sdk-ai-gateway-XAMOoZPMUO5)
**Next.js 15 Upgrade:** [@RMNCLDYO](https://github.com/RMNCLDYO)

## License

MIT - See [LICENSE](LICENSE)

---

⭐ **Star this repo** if it helped you learn Next.js 15!
