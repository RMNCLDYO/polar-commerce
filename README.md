# AI SDK Storefront

**Production-grade Next.js 16 e-commerce platform** demonstrating real-world integration of Cache Components, Turbopack, React Compiler, and modern full-stack architecture with Convex + Better Auth + Polar.

[![Next.js 16](https://img.shields.io/badge/Next.js-16.0.0--canary.0-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React 19.2](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Convex](https://img.shields.io/badge/Convex-1.27.5-FF6B35?style=flat-square)](https://convex.dev)
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.3.27-7C3AED?style=flat-square)](https://better-auth.com)
[![Polar](https://img.shields.io/badge/Polar-0.35.4-007ACC?style=flat-square)](https://polar.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

> **157 files** · **~18K lines of code** · **100% TypeScript** · **100% Next.js 16 compliant** · **Zero deprecated APIs**

## What's Inside

A complete e-commerce platform showcasing Next.js 16's latest features in production:

- **Authentication** - Better Auth (email/password, GitHub OAuth, 2FA, magic links)
- **Database** - Convex (real-time, type-safe, auto-generated API)
- **Payments** - Polar (subscriptions + one-time purchases + customer portal)
- **Frontend** - Next.js 16 (Cache Components, Turbopack, React Compiler, View Transitions)
- **UI** - shadcn/ui + Tailwind CSS v4
- **AI** - Vercel AI SDK + Google Gemini (virtual try-on)

## Quick Start

```bash
git clone https://github.com/RMNCLDYO/aisdk-storefront.git
cd aisdk-storefront
npm install
cp .env.example .env.local
# Add required environment variables (see below)
npm run polar:seed          # Seed products + subscriptions
npm run dev                 # Start dev server
# Open https://localhost:3000
```

## Why This Exists

**This is not a tutorial.** It's a production-ready codebase demonstrating how modern web technologies work together at scale:

- **Next.js 16 (Canary)** - Cache Components, Turbopack File System Caching, React Compiler, Enhanced Routing
- **React 19.2** - View Transitions, Server Components, useEffectEvent, Activity component
- **Convex** - Real-time database with webhooks, type-safe client, server functions
- **Better Auth** - Modern auth with built-in 2FA, social login, session management
- **Polar** - Payment processing with subscriptions and customer portals

Shows the **complete picture**: auth flows, real-time updates, payment processing, inventory management, webhooks, caching strategies, and security—all in one codebase.

## Next.js 16 Features (Stable & Experimental)

### ✅ Stable Features

| Feature | Implementation | Files |
|---------|---------------|-------|
| **React Compiler** | Auto-memoization with `babel-plugin-react-compiler@1.0.0` | `next.config.ts` |
| **Turbopack** | Default bundler with 2-5× faster builds | All builds |
| **Enhanced Routing** | Layout deduplication, incremental prefetching | `components/link.tsx` |
| **Async Params** | `await params`, `await searchParams` | 51 route files |
| **Server Components** | 37% bundle reduction, data preloading | 85% of components |
| **Server Actions** | Type-safe mutations with validation | `lib/server/` |

### 🧪 Experimental Features

| Feature | Implementation | Status |
|---------|---------------|--------|
| **Cache Components** | `'use cache'`, `cacheLife()`, `cacheTag()` | `experimental.cacheComponents: true` |
| **Custom cacheLife Profiles** | `default`, `max`, `hours`, `days` | `next.config.ts` |
| **Turbopack FS Caching** | Persistent dev cache across restarts | `experimental.turbopackFileSystemCacheForDev: true` |
| **New Caching APIs** | `revalidateTag(tag, profile)`, `updateTag()`, `refresh()` | `lib/server/actions/` |

### 📊 Build Statistics

```
✓ 35 routes generated
✓ 24 routes with Partial Prerendering (PPR)
✓ Static shell + dynamic streaming
✓ Custom cache profiles active (1h-1y revalidation)
✓ Compiled in 3.4s with Turbopack
```

## React 19.2 Features

### View Transitions

Browser-native page transition animations:

```typescript
// Custom hook with fallback
export function useViewTransition() {
  const startViewTransition = useCallback((callback: () => void) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => callback());
    } else {
      callback(); // Graceful degradation
    }
  }, []);
  return { startViewTransition };
}
```

**CSS animations defined for 13 routes** with fade-in, slide-up, and scale effects.

### Server Components

- **51 async route files** with proper `await params` and `await searchParams`
- **Data preloading** with `preloadQuery` for optimal performance
- **27 client components** clearly marked with `'use client'`
- **5 server-only modules** protected with `'server-only'` package

## Architecture Deep Dive

### Frontend Layer (Next.js 16)

```
app/
├── (protected)/              # Auth-required routes (proxy.ts middleware)
│   ├── dashboard/            # Real-time todos with Convex live queries
│   ├── settings/             # Account management + 2FA setup
│   └── portal/               # Polar customer billing portal
├── (public)/
│   ├── (shop)/               # E-commerce with PPR (24 routes)
│   │   ├── page.tsx          # Homepage (PPR: 1h revalidate, 2h expire)
│   │   ├── [category]/       # Dynamic categories (PPR: 1d revalidate, 1y expire)
│   │   ├── products/         # Product grid with filters
│   │   ├── product/[id]/     # Product detail with AI try-on
│   │   ├── pricing/          # Subscription tiers
│   │   ├── checkout/         # Multi-product checkout
│   │   └── wishlist/         # Guest + authenticated wishlist
│   └── (auth)/               # Better Auth flows
│       ├── sign-in/          # Email + OAuth + magic link
│       ├── sign-up/          # Registration with email verification
│       ├── verify-2fa/       # TOTP authentication
│       └── reset-password/   # Password reset flow

components/
├── cart/                     # Real-time cart with optimistic updates
│   ├── cart-drawer.tsx       # Drawer with live Convex queries
│   └── cart-button.tsx       # Badge with real-time count
├── layout/
│   ├── header/               # Navigation with user menu
│   │   ├── header.tsx        # Server component with auth preload
│   │   └── user-menu.tsx     # Client component with tier display
│   └── footer/               # Footer with links
├── link.tsx                  # Custom Link with 4 prefetch strategies
│   # 'hover' | 'visible' | 'always' | 'never'
└── products/                 # Product UI components

lib/
├── server/                   # Server-only code (protected)
│   ├── auth.ts               # Server-side auth utilities
│   ├── actions/
│   │   └── revalidate.ts     # New Next.js 16 caching APIs
│   └── data/
│       └── products.ts       # Cache Components with 'use cache'
├── client/                   # Client-side code
│   ├── auth.ts               # Client auth utilities
│   └── hooks/
│       ├── use-cart.tsx      # Real-time cart with auto-merge
│       ├── use-wishlist.tsx  # Wishlist with localStorage
│       └── use-view-transition.tsx  # React 19.2 View Transitions
└── shared/                   # Isomorphic utilities
    ├── utils.ts              # Shared utilities
    └── logger.ts             # Environment-aware logging
```

### Backend Layer (Convex)

```
convex/
├── schema.ts                 # Type-safe schema with comprehensive docs
│   # 7 tables: catalog, carts, cartItems, wishlists,
│   #           wishlistItems, orders, demoTodos
├── auth/
│   ├── auth.ts               # Better Auth integration with lifecycle hooks
│   └── sync.ts               # Auto-sync users to Polar on signup
├── cart/
│   └── cart.ts               # Real-time cart (guest + authenticated)
│   # - Guest cart with sessionId + auto-merge on auth
│   # - Inventory validation before adding items
│   # - Price snapshots at time of adding
├── catalog/
│   ├── catalog.ts            # Product queries with filters
│   └── sync.ts               # Bidirectional Polar sync
├── checkout/
│   ├── checkout.ts           # Comprehensive Polar checkout
│   │   # - IP tracking for fraud prevention
│   │   # - Business customer support (tax ID, billing address)
│   │   # - Trial periods and subscription upgrades
│   │   # - Custom field data (order notes)
│   │   # - Multi-product bundling (Polar limitation workaround)
│   └── http.ts               # HTTP endpoint with IP extraction
├── orders/
│   ├── sync.ts               # Order creation and fulfillment
│   ├── webhook.ts            # Polar webhook handlers
│   └── http.ts               # Order API endpoints
├── polar/                    # Polar component (extended API)
│   ├── schema.ts             # Polar-specific tables
│   └── lib.ts                # Polar utilities
├── utils/
│   ├── cors.ts               # CORS configuration
│   ├── logger.ts             # Structured logging
│   ├── validation.ts         # Type-safe validators
│   ├── crons.ts              # Scheduled tasks (orphaned customer sync)
│   └── polyfills.ts          # Environment polyfills
├── emails/                   # React email templates
│   ├── verifyEmail.tsx       # Email verification
│   ├── resetPassword.tsx     # Password reset
│   ├── magicLink.tsx         # Magic link authentication
│   └── verifyOTP.tsx         # 2FA OTP
└── http.ts                   # HTTP router with webhook handlers
```

### Data Layer (Seeding & Verification)

```
scripts/
├── seedAll.ts                # Master orchestration (218 lines)
│   # 1. Seed subscriptions → 2. Seed products → 3. Verify
├── seedProducts.ts           # Product seeding (461 lines)
│   # - S3 image uploads via Polar
│   # - SHA-256 checksum verification
│   # - Convex database sync
├── seedSubscriptions.ts      # Subscription seeding (507 lines)
│   # - Monthly + yearly variants
│   # - Polar + Convex catalog sync
├── verifySeeding.ts          # Comprehensive verification (415 lines)
│   # 5 checks: Polar products, Convex tables, subscriptions,
│   #           data consistency, order linking
├── logger.ts                 # Structured logging with ANSI colors
├── types.ts                  # Type definitions for all scripts
└── tsconfig.json             # Separate TypeScript config for Node.js
```

## Configuration Files

### next.config.ts - Complete Next.js 16 Setup

```typescript
const nextConfig = {
  reactCompiler: true,  // React Compiler (stable)

  experimental: {
    cacheComponents: true,  // Cache Components (PPR integration)
    turbopackFileSystemCacheForDev: true,  // Faster dev restarts

    // Custom cache profiles for revalidateTag(tag, profile)
    cacheLife: {
      default: { stale: 3600, revalidate: 3600, expire: 86400 },
      max: { stale: Infinity, revalidate: 86400, expire: Infinity },
      hours: { stale: 3600, revalidate: 3600, expire: 7200 },
      days: { stale: 86400, revalidate: 86400, expire: 604800 },
    },
  },

  images: {
    minimumCacheTTL: 14400,  // 4 hours (Next.js 16 default)
    qualities: [60, 75, 90],  // E-commerce product images
    maximumRedirects: 3,  // Security: prevent redirect loops
    dangerouslyAllowLocalIP: false,  // Security: block local IPs
    remotePatterns: [/* Polar S3 buckets */],
  },

  async headers() {
    return [/* Comprehensive security headers */];
  },
} satisfies NextConfig;
```

### tsconfig.json - Strict TypeScript

```json
{
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "bundler",  // Next.js 16 recommended
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true  // Safe array access
  },
  "exclude": ["node_modules", "scripts"]
}
```

### proxy.ts - Middleware (Renamed from middleware.ts)

```typescript
// Next.js 16 deprecates middleware.ts → proxy.ts
export default async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  // Redirect authenticated users away from auth pages
  if (isAuthFlowRoute && sessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protect routes requiring authentication
  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}
```

## Key Integrations

### Convex Real-Time Database

**What it provides:**
- Type-safe client/server functions
- Real-time subscriptions (no polling)
- Automatic type generation from schema
- Webhook handling with components

**Implementation highlights:**
```typescript
// Server function (Convex mutation)
export const addToCart = mutation({
  args: { catalogId: v.id('catalog'), quantity: v.number() },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.catalogId);
    validateQuantity(args.quantity, product.inventory_qty);
    // ... insert cart item
  },
});

// Client component (real-time query)
export function CartDrawer() {
  const cart = useQuery(api.cart.cart.getCart);
  // Automatically updates when cart changes
}
```

### Better Auth Integration

**Features:**
- Convex adapter for native integration
- Auto-sync users to Polar on signup
- Lifecycle hooks (onCreate, onDelete)
- 2FA with QR code generation
- Magic link authentication
- GitHub OAuth

**User flow:**
1. User signs up → Better Auth creates user in Convex
2. Lifecycle hook triggers → Create Polar customer
3. Link guest orders to new user account
4. Assign FREE tier (default)

### Polar Payment Integration

**Checkout features:**
- IP address tracking (fraud prevention + tax calculation)
- Business customer support (tax ID, billing address)
- Discount codes (pre-applied or customer-entered)
- Trial periods with configurable intervals
- Subscription upgrades from existing plans
- Custom field data (order notes, special instructions)
- Multi-product bundling (workaround for Polar limitation)

**Webhook events handled:**
```typescript
polar.registerRoutes(http, {
  onSubscriptionCreated: async (ctx, event) => {
    // Update user tier in auth context
  },
  onSubscriptionUpdated: async (ctx, event) => {
    // Handle plan changes, cancellations
  },
  onProductCreated: async (ctx, event) => {
    // Auto-sync to Convex catalog
  },
});
```

## Caching Strategy

### Cache Components (Experimental)

```typescript
// lib/server/data/products.ts
import { unstable_cacheLife as cacheLife, unstable_cacheTag as cacheTag } from 'next/cache';

export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
  'use cache';  // Cache Components directive
  cacheLife('hours');  // Use custom profile from next.config
  cacheTag('products');  // Tag for granular revalidation

  const products = await fetchQuery(api.catalog.catalog.getProducts, { /* ... */ });
  return products;
}
```

### New Caching APIs

```typescript
// Server Action with read-your-writes semantics
'use server';
import { updateTag } from 'next/cache';

export async function updateProduct(id: string, data: ProductData) {
  await db.products.update(id, data);
  updateTag('products');  // Immediate cache refresh
}

// Server Action with stale-while-revalidate
'use server';
import { revalidateTag } from 'next/cache';

export async function revalidateProducts() {
  revalidateTag('products', 'max');  // Background revalidation
}

// Server Action for uncached data
'use server';
import { refresh } from 'next/cache';

export async function markNotificationRead(id: string) {
  await db.notifications.update(id);
  refresh();  // Refresh uncached notification count
}
```

### Custom Link Component

```typescript
// components/link.tsx
type LinkProps = {
  prefetchStrategy?: 'hover' | 'visible' | 'always' | 'never';
};

export function Link({ prefetchStrategy = 'visible', ...props }: LinkProps) {
  // 'visible' - prefetch when link enters viewport (default)
  // 'hover' - prefetch on mouse enter
  // 'always' - prefetch immediately on page load
  // 'never' - disable prefetching

  const prefetchValue = /* ... calculate based on strategy ... */;
  return <NextLink {...props} prefetch={prefetchValue} />;
}
```

**Benefits:**
- Layout deduplication (download shared layouts once)
- Incremental prefetching (only fetch missing parts)
- Smart cancellation (when link leaves viewport)
- Hover optimization (prioritize on mouse enter)

## Environment Variables

```env
# Convex (auto-configured by npx convex dev)
CONVEX_DEPLOYMENT=dev:your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://your-deployment.convex.site

# Better Auth
BETTER_AUTH_SECRET=your_secret_key_min_32_chars
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_secret

# Polar Payments
POLAR_ORGANIZATION_TOKEN=polar_pat_your_token
POLAR_WEBHOOK_SECRET=whsec_your_webhook_secret
POLAR_SERVER=sandbox  # or 'production'

# AI Features (optional)
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key

# Application
SITE_URL=https://localhost:3000
NEXT_PUBLIC_BASE_URL=https://localhost:3000
```

## Commands

```bash
# Development
npm run dev                   # Start dev server (frontend + backend)
npm run dev:frontend          # Next.js only (port 3000)
npm run dev:backend           # Convex only (with type checking)

# Production
npm run build                 # Production build with Turbopack
npm run start                 # Start production server
npm run generate              # Generate Convex types once

# Database
npm run polar:seed            # Seed products + subscriptions
npm run polar:seed-products   # Seed products only
npm run polar:seed-subscriptions  # Seed subscriptions only
npm run polar:verify-seed     # Verify seeding integrity
npm run db:reset              # Clear database (⚠️  destructive)

# Code Quality
npm run lint                  # Biome check + Convex TypeScript
npm run format                # Biome format --write
npm run clean                 # Clean build artifacts + reinstall
```

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Next.js | 16.0.0-canary.0 | React framework with App Router |
| **React** | React | 19.2.0 | UI library with Server Components |
| **Database** | Convex | 1.27.5 | Real-time database with type-safe API |
| **Auth** | Better Auth | 1.3.27 | Authentication with 2FA + OAuth |
| **Payments** | Polar SDK | 0.35.4 | Payment processing + subscriptions |
| **UI Components** | shadcn/ui | Latest | Radix UI + Tailwind components |
| **Styling** | Tailwind CSS | 4.0 | Utility-first CSS framework |
| **Linter** | Biome | 2.2.5 | Fast linter/formatter (replaces ESLint) |
| **AI SDK** | Vercel AI SDK | 5.0.64 | AI integration framework |
| **AI Model** | Google Gemini | 2.0 Flash | Generative AI for virtual try-on |
| **TypeScript** | TypeScript | 5.0+ | Type safety |
| **Runtime** | Node.js | 20.9+ | JavaScript runtime (LTS) |

## Features

### Authentication & Authorization
- ✅ Email/password authentication
- ✅ GitHub OAuth integration
- ✅ Magic link authentication
- ✅ Two-factor authentication (TOTP)
- ✅ Email verification flow
- ✅ Password reset flow
- ✅ Route protection with middleware
- ✅ Tier-based access control

### E-Commerce
- ✅ Product catalog with categories
- ✅ Real-time inventory management
- ✅ Shopping cart (guest + authenticated)
- ✅ Wishlist with guest support
- ✅ Multi-product checkout
- ✅ Subscription management (3 tiers: Free, Starter, Premium)
- ✅ One-time purchases
- ✅ Order history
- ✅ Customer billing portal

### Real-Time Features
- ✅ Live cart updates across tabs
- ✅ Real-time inventory sync
- ✅ Live order status updates
- ✅ No polling required (Convex subscriptions)

### Advanced Features
- ✅ AI virtual try-on (Google Gemini)
- ✅ IP-based fraud prevention
- ✅ Business customer support (tax ID, billing address)
- ✅ Trial periods for subscriptions
- ✅ Discount codes
- ✅ Custom checkout fields (order notes)
- ✅ Guest cart auto-merge on authentication
- ✅ Webhook-driven order processing

### Developer Experience
- ✅ 100% TypeScript with strict mode
- ✅ Auto-generated types from Convex schema
- ✅ Hot module replacement (Turbopack)
- ✅ File system caching for faster restarts
- ✅ Comprehensive seeding scripts
- ✅ Verification tooling with 5 integrity checks
- ✅ Structured logging (development + production)
- ✅ Type-safe validation utilities

## Important Notes

### Multi-Product Checkout Workaround

**The situation:** Polar doesn't natively support shopping carts (multi-product checkout) yet.

**Our implementation:**
1. Cart state managed in Convex (real-time sync)
2. On checkout, bundle multiple products into a single Polar product
3. Store original cart items in checkout metadata
4. Reconstruct full order from metadata post-payment

**Code reference:** `convex/checkout/checkout.ts` - `createBundleProduct()`

**Status:** Working solution, but not production-ideal. Will be replaced when Polar adds native cart support.

### Experimental APIs

This codebase uses Next.js 16 canary and experimental features:

| API | Status | Stability |
|-----|--------|-----------|
| `reactCompiler` | **Stable** | ✅ Promoted from experimental |
| `experimental.cacheComponents` | **Experimental** | May change before stable |
| `experimental.turbopackFileSystemCacheForDev` | **Beta** | Nearing stability |
| `unstable_cacheLife()` | **Unstable** | API subject to change |
| `unstable_cacheTag()` | **Unstable** | API subject to change |
| `updateTag()` | **New** | Beta API |
| `refresh()` | **New** | Beta API |

**Production use:** Test thoroughly. APIs may change before Next.js 16 stable release.

### Breaking Changes from Next.js 15

If migrating from Next.js 15:

1. **Middleware renamed:** `middleware.ts` → `proxy.ts` (deprecation warning)
2. **Async params required:** All `params` and `searchParams` must be awaited
3. **Async dynamic APIs:** `cookies()`, `headers()`, `draftMode()` must be awaited
4. **Image defaults changed:** `minimumCacheTTL` now 4 hours (was 60s)
5. **`revalidateTag()` signature:** Now requires second argument (cacheLife profile)
6. **Removed `experimental.ppr`:** Integrated into `experimental.cacheComponents`
7. **Removed `next lint`:** Use Biome or ESLint directly

All changes implemented in this codebase.

## Project Statistics

- **Total files:** 157 (146 TypeScript files)
- **Lines of code:** ~18,000 TypeScript
- **Routes:** 35 (24 with Partial Prerendering)
- **Components:** 34 files, 2,234 lines
- **Backend functions:** 38 Convex files, 7,848 lines
- **Scripts:** 7 seeding/verification files, 1,869 lines
- **Type safety:** 100% (zero `any` types except intentional suppressions)
- **Next.js 16 compliance:** 100% (zero deprecated APIs)
- **Build time:** ~3.4 seconds (Turbopack)

## Security Headers

Configured in `next.config.ts`:

```typescript
{
  'Content-Security-Policy': '...',  // XSS protection
  'X-Frame-Options': 'DENY',  // Clickjacking protection
  'X-Content-Type-Options': 'nosniff',  // MIME type sniffing protection
  'Referrer-Policy': 'strict-origin-when-cross-origin',  // Referrer control
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',  // Feature control
}
```

## Credits

- **Original v0 template:** [@estebansuarez](https://github.com/estebansuarez) - [v0 Storefront](https://v0.app/templates/storefront-w-nano-banana-ai-sdk-ai-gateway-XAMOoZPMUO5)
- **Next.js Team:** For Next.js 16 and experimental features
- **Convex Team:** For real-time database and component ecosystem
- **Better Auth Team:** For modern authentication solution
- **Polar Team:** For developer-friendly payments

## License

[MIT](LICENSE) - Use at your own risk. This is a demonstration codebase showcasing experimental features.

---

**Built with Next.js 16 · Convex · Better Auth · Polar**
*Production-grade e-commerce architecture for modern web applications*
