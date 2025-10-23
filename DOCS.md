# Polar Commerce - Technical Documentation

Detailed implementation guide for Next.js 16 canary, React 19, Convex, Better Auth, and Polar integration.

## Table of Contents

- [Next.js 16 Features](#nextjs-16-features)
- [React 19 Features](#react-19-features)
- [Architecture](#architecture)
- [Key Integrations](#key-integrations)
- [Caching Strategy](#caching-strategy)
- [Configuration](#configuration)
- [Environment Variables](#environment-variables)
- [Commands](#commands)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Testing](#testing)
- [Security](#security)

## Next.js 16 Features

### Stable Features

| Feature | Implementation | Files |
|---------|---------------|-------|
| **React Compiler** | Auto-memoization with `babel-plugin-react-compiler@1.0.0` | `next.config.ts` |
| **Turbopack** | Default bundler with 2-5× faster builds | All builds |
| **Enhanced Routing** | Layout deduplication, incremental prefetching | `components/link.tsx` |
| **Async Params** | `await params`, `await searchParams` | 51 route files |
| **Server Components** | 37% bundle reduction, data preloading | 85% of components |
| **Server Actions** | Type-safe mutations with validation | `lib/server/` |

### Experimental Features

| Feature | Implementation | Status |
|---------|---------------|--------|
| **Cache Components** | `'use cache'`, `cacheLife()`, `cacheTag()` | `experimental.cacheComponents: true` |
| **Custom cacheLife Profiles** | `default`, `max`, `hours`, `days` | `next.config.ts` |
| **Turbopack FS Caching** | Persistent dev cache across restarts | `experimental.turbopackFileSystemCacheForDev: true` |
| **New Caching APIs** | `revalidateTag(tag, profile)`, `updateTag()`, `refresh()` | `lib/server/actions/` |

### Build Statistics

```
✓ 35 routes generated
✓ 24 routes with Partial Prerendering (PPR)
✓ Static shell + dynamic streaming
✓ Custom cache profiles active (1h-1y revalidation)
✓ Compiled in 3.9s with Turbopack (10s total build time)
```

### Breaking Changes from Next.js 15

1. **Middleware renamed:** `middleware.ts` → `proxy.ts` (deprecation warning)
2. **Async params required:** All `params` and `searchParams` must be awaited
3. **Async dynamic APIs:** `cookies()`, `headers()`, `draftMode()` must be awaited
4. **Image defaults changed:** `minimumCacheTTL` now 4 hours (was 60s)
5. **`revalidateTag()` signature:** Now requires second argument (cacheLife profile)
6. **Removed `experimental.ppr`:** Integrated into `experimental.cacheComponents`
7. **Removed `next lint`:** Use ESLint directly (`npm run lint`)

## React 19 Features

### View Transitions

Browser-native page transition animations with forward-compatible component wrapper:

```typescript
// Forward-compatible wrapper (components/view-transition.tsx)
<ViewTransition name="product-detail" className="px-8 py-12">
  <ProductContent />
</ViewTransition>

// Renders with viewTransitionName for browser API
// Easy migration when React's <ViewTransition> becomes stable
```

**Benefits:**
- Clean, declarative API with type-safe props
- Shared element transitions between routes
- Automatic animations for matching view transition names
- Easy future migration to React's native `<ViewTransition>` component

**Used on 4+ pages** including product details, checkout, pricing, and home page.

### useEffectEvent

Separates "event" logic from Effects to prevent unnecessary re-runs:

```typescript
// Before: theme changes cause chat room to reconnect
useEffect(() => {
  const connection = createConnection(roomId);
  connection.on('connected', () => {
    showNotification('Connected!', theme); // theme triggers re-run
  });
  connection.connect();
}, [roomId, theme]); // ❌ theme causes reconnection

// After: only roomId changes cause reconnection
const onConnected = useEffectEvent(() => {
  showNotification('Connected!', theme); // always sees latest theme
});

useEffect(() => {
  const connection = createConnection(roomId);
  connection.on('connected', onConnected);
  connection.connect();
}, [roomId]); // ✅ Effect Events aren't dependencies
```

**Used in 4 files:** `use-cart.tsx`, `use-wishlist.tsx`, `EnableTwoFactor.tsx` (consistent session management patterns)

### Activity Component

Pre-renders hidden parts of the app for instant navigation:

```tsx
<Activity mode={preloadCheckout ? 'visible' : 'hidden'}>
  <CheckoutPreloader />
</Activity>
```

**Benefits:**
- Loads checkout data/CSS/images in background
- Zero impact on visible page performance
- Makes navigation feel instant

**Implementation:** Shop layout pre-renders checkout when cart has items

### Performance Tracks

Chrome DevTools now shows React-specific performance tracks:

1. **Open Chrome DevTools** → Performance tab
2. **Record profile** while using the app
3. **Look for custom tracks:**
   - **Scheduler ⚛** - What React is working on by priority (blocking vs transition)
   - **Components ⚛** - Which components are rendering/running effects

**See:** [React Performance Tracks docs](https://react.dev/reference/dev-tools/react-performance-tracks)

### Server Components

- **51 async route files** with proper `await params` and `await searchParams`
- **Data preloading** with `preloadQuery` for optimal performance
- **27 client components** clearly marked with `'use client'`
- **5 server-only modules** protected with `'server-only'` package

## Architecture

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
├── view-transition.tsx       # React 19.2 View Transitions wrapper
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
│       ├── use-cart.tsx      # Real-time cart with useEffectEvent
│       └── use-wishlist.tsx  # Wishlist with useEffectEvent
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
│   ├── sync.ts               # Auto-sync users to Polar on signup
│   └── cleanup.ts            # Stale account cleanup cron
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
│   ├── crons.ts              # Scheduled tasks
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

## Configuration

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
npm run db:reset              # Clear database (⚠️  destructive)

# Testing
npm run test                  # Run tests in watch mode
npm run test:ui               # Run tests with Vitest UI
npm run test:coverage         # Generate coverage report
npm run test:ci               # Run tests in CI mode

# Code Quality
npm run lint                  # ESLint + Convex TypeScript
npm run format                # ESLint auto-fix
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
| **Testing** | Vitest | 3.2.4 | Unit testing with React Testing Library |
| **Linter** | ESLint | 9.37.0 | Security, a11y, and React Compiler rules |
| **AI SDK** | Vercel AI SDK | 5.0.68 | AI integration framework |
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
- ✅ Unit testing with Vitest and React Testing Library
- ✅ Code coverage reporting with @vitest/coverage-v8
- ✅ Enhanced ESLint with security, accessibility, and import plugins
- ✅ React Compiler-powered lint rules
- ✅ Hot module replacement (Turbopack)
- ✅ File system caching for faster restarts
- ✅ Comprehensive seeding scripts
- ✅ Verification tooling with 5 integrity checks
- ✅ Structured logging (development + production)

## Testing

### Vitest Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: ['node_modules/', 'dist/', '.next/', 'convex/_generated/'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

### Test Suite

- **Unit Tests:** Core utilities and shared logic
  - `lib/shared/utils.test.ts` - Utility function tests
  - `app/error.test.tsx` - Error boundary component tests
- **Testing Library:** React Testing Library for component testing
- **Coverage:** V8 coverage with HTML reports
- **Environment:** happy-dom for fast DOM simulation

### ESLint Configuration

Enhanced with security and accessibility:

```javascript
// eslint.config.js
export default [
  // React Compiler rules (stable)
  reactCompiler.configs.recommended,

  // Security scanning
  pluginSecurity.configs.recommended,

  // Accessibility checks
  pluginJsxA11y.flatConfigs.recommended,

  // Import organization
  pluginImport.flatConfigs.recommended,

  // React Hooks rules (Next.js 16)
  { plugins: { 'react-hooks': pluginReactHooks } }
];
```

## Security

### Security Headers

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

### Authentication Security

- HTTPS-only cookies in production
- Session validation on every protected route
- Rate limiting on auth endpoints (Better Auth built-in)
- Email verification required before login
- TOTP-based 2FA with QR code generation

## Technical Challenges

### The Product Bundling Workaround

Polar doesn't support multi-product checkout. The implementation:

1. Cart state lives in Convex (real-time sync across sessions)
2. At checkout, bundle all cart items into a single Polar product
3. Store original cart composition in checkout metadata
4. Reconstruct the full order from metadata after payment

**See:** `convex/checkout/checkout.ts:createBundleProduct()`

**Open questions:**
- When to delete bundled products? (after purchase? cart expiration? never for analytics?)
- Can similar carts reuse bundles to reduce API calls?
- How to handle per-item tax calculation before bundling?
- Atomic inventory checks before bundle creation
- Partial refund logic (unbundling individual items)

### Experimental APIs

This codebase uses Next.js 16 canary features:

| API | Status | Notes |
|-----|--------|-------|
| `reactCompiler` | Stable | Promoted from experimental in Next.js 16 |
| `experimental.cacheComponents` | Experimental | May change before stable release |
| `experimental.turbopackFileSystemCacheForDev` | Beta | Persistent dev cache across restarts |
| `unstable_cacheLife()` | Unstable | Custom cache profile configuration |
| `unstable_cacheTag()` | Unstable | Granular cache invalidation |
| `updateTag()` | New | Immediate cache refresh (read-your-writes) |
| `refresh()` | New | Refresh uncached data |

These APIs may change before Next.js 16 stable release.
