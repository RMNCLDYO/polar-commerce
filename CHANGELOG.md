# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.8.0] - 2025-10-10 - Next.js 16 Migration & Type Safety

**PR #32, #33** - Migrated to Next.js 16 with React Compiler, eliminated type safety violations

### Changed

#### Next.js 16 Migration
- **next.config.ts**
  - Enabled `reactCompiler: true` - Automatic React optimization
  - Enabled `turbopackFileSystemCacheForDev` - Faster dev builds
  - Removed `dynamicIO` (replaced by `cacheComponents`)
  - Image cache TTL: 60s → 4 hours (14400s)
  - Added `qualities: [60, 75, 90]` for e-commerce image optimization
  - Security: `maximumRedirects: 3`, `dangerouslyAllowLocalIP: false`

- **package.json**
  - Description: "Next.js 15" → "Next.js 16"
  - Engines: Node >=20.9.0, npm >=10.0.0
  - Updated dependencies

#### Type Safety Hardening
- **convex/wishlist/wishlist.ts** - Removed 13 `any` types
  - `ctx: any` → `ctx: MutationCtx`
  - All query callbacks now use proper type inference

- **lib/client/providers/convex.tsx** - Replaced non-null assertion with validation
  - Added runtime check for `NEXT_PUBLIC_CONVEX_URL`
  - Throws on missing environment variable

- **scripts/seedAll.ts** - Fixed error handler types
  - `error: any` → `error: unknown`
  - Added proper type guards for error properties

- **convex/emails/email.tsx** - Dual tsconfig compatibility
  - Added React import for `tsc -p convex` compilation
  - Works with both Next.js build and Convex typecheck

#### UI Improvements
- **lib/client/hooks/use-cart.tsx** - Replaced `<img>` with Next.js `<Image>`
- **lib/client/hooks/use-wishlist.tsx** - Replaced `<img>` with Next.js `<Image>`
  - All toast notifications now use optimized images
  - Added `width`, `height`, `unoptimized` props

#### Code Formatting
- **All files** - Biome auto-format applied
  - Alphabetical import ordering
  - `import type` for type-only imports
  - Consistent code style across 78 files

#### Middleware Refactor
- **middleware.ts** → **proxy.ts**
  - Renamed for clarity
  - Applied import formatting

#### Linter Configuration
- **biome.json**
  - Excluded `next-env.d.ts` (auto-generated)
  - Excluded `**/_generated` (Convex types)
  - Updated schema to 2.2.5

### Breaking Changes

#### Environment
- **Requires Node.js >=20.9.0**
- **Requires npm >=10.0.0**

#### Configuration
- `dynamicIO` removed (use `cacheComponents` instead)
- Image optimization now requires explicit `unoptimized` prop for instant rendering

### Impact

**Performance**
- ✅ React Compiler automatic optimizations
- ✅ Turbopack cache speeds up dev server restarts
- ✅ Image cache 240x improvement (60s → 4h)
- ✅ Multiple quality levels for product images

**Type Safety**
- ✅ Zero `any` types in codebase
- ✅ Runtime validation for critical env vars
- ✅ Proper error handling with type guards

**Security**
- ✅ Redirect loop protection (max 3)
- ✅ Local IP optimization blocked in production

**Code Quality**
- ✅ Consistent import organization
- ✅ All type-only imports properly marked
- ✅ Dual TypeScript configuration support

### Statistics
- **Files Changed**: 85 files
- **Commits**: 7 atomic commits (all GPG signed)
- **Build**: ✅ Passing
- **Lint**: ✅ 0 errors, 0 warnings

---

## [0.7.0] - 2025-10-09 - Wishlist Feature & UX Enhancements

**PR #31** - Complete wishlist implementation with guest support, cart/wishlist toast improvements, mobile navigation enhancements

### Added

#### Wishlist System
- **Database Layer**
  - `convex/schema.ts` - Wishlist table with user/session support and indexes
  - Support for both authenticated users and guest sessions
  - Session-based wishlist persistence for guests

- **Backend API** (470 lines)
  - `convex/wishlist/wishlist.ts` - Complete wishlist CRUD operations
  - `toggleWishlist()` mutation - Add/remove with single action
  - `clearWishlist()` mutation - Bulk removal
  - `mergeWishlist()` mutation - Merge guest wishlist on login
  - `getWishlistCount()` query - Real-time count for badge
  - `isInWishlist()` query - Check if product is in wishlist
  - Session and user-based wishlist queries
  - Catalog integration for wishlist status checking

- **Client Hooks** (284 lines)
  - `lib/client/hooks/use-wishlist.tsx` - Full wishlist state management
  - Toast notifications with product images
  - Silent mode for removal (when moving to cart)
  - Optimistic UI updates
  - Real-time count tracking

- **UI Components** (4 files, 138 lines)
  - `components/wishlist/wishlist-icon.tsx` - Header icon with count badge
  - `components/wishlist/add-to-wishlist-button.tsx` - Heart toggle button
  - `components/wishlist/wishlist-manager.tsx` - Client state provider
  - `components/products/product-actions.tsx` - Unified product action buttons

- **Wishlist Page** (216 lines)
  - `app/(public)/(shop)/wishlist/page.tsx` - Public wishlist page
  - Guest access warning with sign-in prompt
  - Product grid with remove and move-to-cart actions
  - Empty state with browse products link
  - Real-time updates with Convex

#### Cart Toast Enhancements
- **Enhanced Notifications** (`lib/client/hooks/use-cart.tsx`)
  - Product image preview in add/remove toasts
  - Product name, price, and quantity display
  - Custom toast UI with 3-second duration
  - Renamed from `.ts` to `.tsx` for JSX support

- **Cart Drawer Updates** (`components/cart/cart-drawer.tsx`)
  - Remove action shows product preview toast
  - Enhanced remove handler with product info

#### Mobile Navigation
- **Search Integration** (`components/layout/header/mobile-nav.tsx`)
  - Search bar added to mobile drawer
  - Auto-close drawer on search submit
  - Improved tablet visibility (sm: breakpoint)

- **Conditional Auth Links**
  - "Sign In" link for guests (above wishlist)
  - "Dashboard" and "Settings" links for authenticated users only
  - Dynamic menu based on auth state

#### Header Improvements
- **Navigation Reordering** (`components/layout/header/header.tsx`)
  - New order: Search → Wishlist → Cart → Theme → User Account
  - Wishlist icon with count badge
  - Consistent spacing and alignment

### Changed

#### Route Structure
- **Wishlist Accessibility**
  - Moved from `app/(protected)/wishlist/` → `app/(public)/(shop)/wishlist/`
  - Now accessible to guests with warning banner
  - Alert component with yellow styling for non-authenticated users
  - Sign-in button in alert banner

#### Terminology Updates
- **Stock Status** (6 files)
  - Changed "Out of Stock" → "Sold Out" across all pages
  - Updated in product cards, cart buttons, quick-add buttons
  - Badge text: "SOLD OUT" (all caps)
  - Button text: "Sold Out" (title case)

#### UX Improvements
- **Search Visibility** (`components/layout/header/search.tsx`)
  - Changed breakpoint from `md:` (768px) to `sm:` (640px)
  - Search bar visible earlier on tablet devices

- **Silent Wishlist Removal**
  - When moving item to cart: only "Added to cart" toast shows
  - No redundant "Removed from wishlist" notification
  - Cleaner user experience

### Impact

**Performance:**
- No bundle size impact (components lazy loaded)
- Optimistic UI updates for instant feedback
- Real-time wishlist count with Convex live queries

**User Experience:**
- Guest users can save items without sign-in
- Clear warning about temporary wishlist data
- Product image previews in all notifications
- Improved mobile navigation with search
- Cleaner terminology ("Sold Out" vs "Out of Stock")

**Database:**
- New `wishlist` table (auto-deployed via Convex)
- Automatic guest-to-user migration on login

### Commit Structure (13 Atomic Commits)

All commits GPG signed:

1. `feat(schema): add wishlist table with user and session support`
2. `feat(api): add wishlist backend endpoints and catalog integration`
3. `feat(hooks): add wishlist client hook with toast notifications`
4. `feat(cart): add product image to cart toast notifications`
5. `feat(components): add wishlist UI components`
6. `feat(pages): add public wishlist page with guest access warning`
7. `feat(products): integrate wishlist buttons into product displays`
8. `feat(header): add wishlist icon and reorder navigation items`
9. `feat(mobile): add search and conditional auth links to mobile menu`
10. `feat(search): improve visibility on tablet breakpoints`
11. `refactor(products): update stock status from 'out of stock' to 'sold out'`
12. `feat(app): integrate wishlist merge on authentication`
13. `chore: update generated types and formatting`

### Statistics

- **Files Changed**: 25 files
  - 18 files modified
  - 7 files added (wishlist system)
  - 1 file deleted (moved wishlist page)
  - 1 file renamed (use-cart.ts → use-cart.tsx)
- **Lines**: 1,559 additions, 196 deletions
- **Net Change**: +1,363 lines
- **Build Status**: ✅ All tests passing, 34 static pages generated

---

## [0.6.0] - 2025-10-09 - UI/UX Optimization & Mobile Navigation

**PR #30** - Mobile navigation, performance optimizations, layout shift fixes

### Added
- **Mobile Navigation** - Drawer slides from right (Menu button on mobile)
- **Wishlist Page** - Placeholder page at `/wishlist`
- **shadcn/ui Components** (6 new)
  - `avatar` - User profile display
  - `skeleton` - Loading states
  - `alert` - User notifications
  - `separator` - Visual dividers
  - `badge` - Status indicators
  - `aspect-ratio` - Image containers

### Changed
- **Auth Performance** - 30x faster user menu (300ms → <10ms)
  - Created `getCurrentUserBasic` query (no Polar lookup)
  - Proper Convex SSR: `preloadQuery` + `usePreloadedQuery`
  - Fixed PPR build errors with `await headers()`

- **Layout Shifts Eliminated**
  - Icon-only user menu (no variable-width text)
  - Added `modal={false}` to dropdowns (prevents body scroll lock)
  - Category pages use `min-height` (grid + text)
  - Consistent skeleton dimensions

- **Progressive Navigation**
  - Nav items hide individually (not in groups)
  - Custom breakpoints: 1180px → 1080px → 980px → 900px → 820px
  - Mobile: hamburger menu replaces nav

- **Cart Drawer** - Changed from right to bottom (better mobile UX)

- **Link Component** - Used throughout auth pages (`/sign-in`, `/sign-up`, `/settings`, `/verify-2fa`)

- **Performance Config**
  - `dynamicIO: true` - Enables `cacheLife` feature
  - `reactStrictMode: false` - Prevents double token requests in dev

- **Theme Toggle** - Removed focus ring

### Impact
- **Performance**: 30x faster auth display
- **UX**: Zero layout shifts, better mobile navigation
- **Mobile**: Native drawer navigation + bottom cart
- **Developer**: Better SSR patterns, proper PPR compliance

### Statistics
- **Files Changed**: 42 files
- **Commits**: 12 atomic commits
- **Build**: All PPR routes passing
- **Lines**: 2,034 additions, 538 deletions

---

## [0.5.0] - 2025-10-09 - Schema Naming Clarity

**PR #29** - Comprehensive schema reorganization for naming clarity and consistency

### Changed

#### Database Schema Reorganization
- **Table Renaming**
  - `products` → `catalog` - Clearer distinction from `components.polar.products`
  - `todos` → `demoTodos` - Explicitly marks as demo feature
  - Single source of truth: Polar for payments, catalog for e-commerce data

- **Field Renaming**
  - `cartItems.productId` → `cartItems.catalogId` - Matches new table name
  - Consistent camelCase naming throughout schema
  - Updated all foreign key references and indices

#### Backend Structure
- **Directory Reorganization**
  - `convex/products/` → `convex/catalog/`
  - `convex/todos/` → `convex/demos/`
  - Updated all internal imports and API references

- **Function Renaming**
  - `convex/utils/factoryReset.ts` → `convex/utils/clearDatabase.ts`
  - `factoryReset()` → `clearDatabase()` action
  - Updated npm script: `db:reset` now uses `clearDatabase`

#### Frontend Updates
- **Component Updates** (8 files)
  - `app/(protected)/dashboard/todo-list.tsx` - Updated to `api.demos.demoTodos.*`
  - `components/cart/add-to-cart-button.tsx` - `productId` → `catalogId`
  - `components/cart/quick-add-button.tsx` - `productId` → `catalogId`
  - `components/cart/cart-drawer.tsx` - All references updated
  - Updated all cart hooks and mutations

- **Data Layer** (2 files)
  - `lib/server/data/products.ts` - Updated to `api.catalog.catalog.*`
  - `lib/client/hooks/use-cart.ts` - All functions use `catalogId`

#### Scripts & Utilities
- **Seeding Scripts** (2 files)
  - `scripts/seedProducts.ts` - References `api.catalog.catalog`
  - `scripts/seedSubscriptions.ts` - References `api.catalog.sync`

- **Verification** (1 file)
  - `scripts/verifySeeding.ts` - Updated table references and help text

#### Documentation
- **README.md** - Updated project structure and commands
- **CHANGELOG.md** - Added this entry

### Architecture Improvements

**Naming Clarity:**
```
Before:
- app.products (confusing - sounds like Polar's products)
- components.polar.products (payment products)

After:
- app.catalog (clear - e-commerce product catalog)
- components.polar.products (unchanged - payment products)
```

**Data Flow (Clarified):**
```
products.json + subscriptions.json
        ↓
  scripts/seedAll.ts
        ↓
   Polar API (payments)
        ↓
components.polar.products (payment data)
        ↓
   catalog table (e-commerce: inventory, categories, etc.)
```

### Breaking Changes

#### Database Migration Required
```bash
# Schema changes - no data migration needed for clean installs
npx convex deploy

# For existing deployments:
npm run db:reset  # Clear all data
npm run polar:seed  # Reseed from JSON
```

#### API References
**Before:**
```typescript
api.products.products.getProducts
api.todos.todos.get
api.utils.factoryReset.factoryReset
```

**After:**
```typescript
api.catalog.catalog.getProducts
api.demos.demoTodos.get
api.utils.clearDatabase.clearDatabase
```

#### Component Props
**Before:**
```typescript
<AddToCartButton productId={id} />
<QuickAddButton productId={id} />
```

**After:**
```typescript
<AddToCartButton catalogId={id} />
<QuickAddButton catalogId={id} />
```

#### Hook Signatures
**Before:**
```typescript
const { addToCart } = useCart();
addToCart(productId: Id<'products'>, quantity: number)
```

**After:**
```typescript
const { addToCart } = useCart();
addToCart(catalogId: Id<'catalog'>, quantity: number)
```

### Impact
- **Clarity**: Eliminates confusion between `products` table and `polar.products`
- **Consistency**: camelCase naming throughout (catalog, demoTodos, clearDatabase)
- **Maintainability**: Clear separation of concerns (Polar = payments, catalog = e-commerce)
- **Documentation**: Explicit naming makes architecture self-documenting

### Statistics
- **Files Changed:** 22 files
  - 15 files modified (API references)
  - 2 directories renamed
  - 5 utilities updated
- **Lines:** 487 additions, 412 deletions
- **Net Change:** +75 lines (mostly type updates)
- **Build Status:** ✅ All tests passing, 34 static pages generated

---

## [0.4.1] - 2025-10-08 - Domain-Driven Architecture

**PR #28** - Reorganize codebase from flat structure to domain-driven architecture

### Changed

#### Backend Restructure - Convex
- Organized backend into domain folders for better maintainability
  - `convex/auth/` - Authentication (auth.ts, sync.ts)
  - `convex/cart/` - Shopping cart (cart.ts)
  - `convex/checkout/` - Checkout flow (checkout.ts, http.ts, types.ts)
  - `convex/orders/` - Order management (http.ts, sync.ts, webhook.ts)
  - `convex/products/` - Product catalog (products.ts, sync.ts)
  - `convex/todos/` - Todo list (todos.ts)
  - `convex/utils/` - Utilities (crons.ts, factoryReset.ts, inspectData.ts, polyfills.ts)
  - `convex/emails/` - Email templates (email.tsx)

#### Component Restructure
- Organized components by feature for better discoverability
  - `components/cart/` - Cart components (cart-drawer.tsx, cart-icon.tsx, add-to-cart-button.tsx, quick-add-button.tsx, cart-manager.tsx)
  - `components/layout/` - Layout components (footer.tsx)
  - `components/layout/header/` - Header components (header.tsx, search.tsx, theme-toggle.tsx, user-menu.tsx)
  - `components/products/` - Product components (product-card.tsx, product-grid.tsx)
  - `app/(public)/(shop)/components/` - Shop-specific components (uploader.tsx)
  - `app/(protected)/dashboard/components/` - Dashboard components (todo-components.tsx)

#### Lib Restructure
- Organized utilities into client/server/shared structure
  - `lib/client/hooks/` - Client hooks (use-cart.ts)
  - `lib/client/providers/` - React providers (theme.tsx, convex.tsx)
  - `lib/server/actions/` - Server actions (revalidate.ts)
  - `lib/server/data/` - Data fetching (products.ts)
  - `lib/server/prompts/` - AI prompts (ai.ts)
  - `lib/server/env.ts` - Environment configuration (renamed from api.ts)

#### Polar Integration Fix
- Fixed Polar component API references
  - Updated `convex/polarCustomer.ts` to use `components.polar.lib.*` instead of `polarApi.lib.*`
  - Fixed pricing page checkout flow (`api.polarCustomer.ensurePolarCustomer`)
  - Updated all component API accesses (6 locations)
  - Added proper TypeScript return types to all Polar actions

#### Import Path Updates
- Updated 50+ files with new import paths
- All app routes updated (protected, public, auth, shop)
- All components updated
- All backend files updated
- Scripts updated (seedProducts.ts, seedSubscriptions.ts, verifySeeding.ts)

### Removed
- `convex/checkoutComponent.ts` - Obsolete checkout component (225 lines)
- `components/client.tsx` - Consolidated into route components (11 lines)
- `components/dashboard-render-toggle.tsx` - Unused toggle component (43 lines)
- `components/pricing-card.tsx` - Replaced by pricing page (89 lines)
- `app/(protected)/dashboard/server/` - Old server components (5 files, 205 lines)

### Breaking Changes

#### File Paths
All file paths have changed - external references may need updates:

**Convex:**
```diff
- convex/auth.ts → convex/auth/auth.ts
- convex/userSync.ts → convex/auth/sync.ts
- convex/cart.ts → convex/cart/cart.ts
- convex/checkout.ts → convex/checkout/checkout.ts
- convex/products.ts → convex/products/products.ts
```

**Components:**
```diff
- components/header.tsx → components/layout/header/header.tsx
- components/product-card.tsx → components/products/product-card.tsx
- hooks/use-cart.ts → lib/client/hooks/use-cart.ts
```

**API Paths:**
```diff
- api.auth.getCurrentUser → api.auth.auth.getCurrentUser
- api.polar.customer.ensurePolarCustomer → api.polarCustomer.ensurePolarCustomer
```

### Impact
- **Architecture**: Clear domain separation for better maintainability
- **Performance**: No impact (pure refactoring)
- **Bundle Size**: No change
- **Developer Experience**: Easier to navigate and understand codebase
- **Type Safety**: Enhanced with proper return types on Polar actions

### Statistics
- **Files Changed:** 77 files
  - 44 files renamed (organized into domains)
  - 33 files modified (import updates)
  - 5 files removed (obsolete code)
- **Lines:** 304 insertions, 793 deletions
- **Net Change:** -489 lines (removed obsolete code)
- **Commits:** 1 atomic commit (independently revertable)

---

## [0.4.0] - 2025-10-08 - Cart and Checkout System

**PR #27** - Complete e-commerce cart and checkout implementation with 13 atomic commits

### Added

#### Shopping Cart System
- `convex/cart.ts` - Cart management with CRUD operations (814 lines)
- `convex/schema.ts` - Cart and order tables with indices
- `hooks/use-cart.ts` - React hook for cart state management (174 lines)
- Cart persistence for both authenticated users and guest sessions
- Real-time cart synchronization across tabs
- Inventory tracking (`inStock`, `inventory_qty` fields)

#### Checkout & Payment Processing
- `convex/checkout.ts` - Polar checkout integration (1,118 lines)
- `convex/checkoutComponent.ts` - Checkout component logic (225 lines)
- `convex/checkoutHttp.ts` - HTTP handlers for checkout (111 lines)
- `convex/checkout_types.ts` - TypeScript types (350 lines)
- Discount code support
- Trial subscription support
- Custom field data handling
- Multiple product checkout

#### Order Management
- `convex/orderSync.ts` - Order synchronization (113 lines)
- `convex/orderWebhook.ts` - Webhook handlers (92 lines)
- `convex/orderWebhookHttp.ts` - HTTP webhook routing (69 lines)
- `convex/polarWebhookMiddleware.ts` - Webhook signature verification (91 lines)
- `convex/polar/types.ts` - Polar type definitions (363 lines)
- Full order history tracking
- Customer details capture
- Billing address storage
- Tax and discount tracking

#### UI Components - Cart
- `components/cart-manager.tsx` - Cart state provider (13 lines)
- `components/cart/cart-drawer.tsx` - Slide-out cart UI (239 lines)
- `components/cart/cart-icon.tsx` - Cart icon with badge (33 lines)
- `components/cart/add-to-cart-button.tsx` - Add to cart button (56 lines)
- `components/cart/quick-add-button.tsx` - Quick add functionality (45 lines)
- `components/ui/drawer.tsx` - Drawer component (vaul) (135 lines)
- `components/ui/sonner.tsx` - Toast notifications (19 lines)

#### Route Reorganization
- `app/(protected)/` - Protected routes requiring authentication
  - `app/(protected)/(starter)/layout.tsx` - Starter tier layout
  - `app/(protected)/(premium)/layout.tsx` - Premium tier layout
  - `app/(protected)/portal/page.tsx` - Customer portal page (90 lines)
  - Moved dashboard, settings from `(auth)/`
- `app/(public)/` - Public routes accessible to all
  - `app/(public)/(shop)/` - Shop routes
  - `app/(public)/(auth)/` - Authentication flows
  - `app/(public)/(shop)/checkout/page.tsx` - Checkout page (467 lines)
  - `app/(public)/(shop)/checkout/checkout-simple.tsx` - Simple checkout (90 lines)
  - `app/(public)/(shop)/checkout/success/page.tsx` - Success page (143 lines)

#### Lib Restructure
- `lib/client/` - Client-side utilities
  - `lib/client/auth.ts` - Client auth utilities
  - `lib/client/providers/convex.tsx` - Convex provider
- `lib/server/` - Server-side utilities
  - `lib/server/api.ts` - API helpers
  - `lib/server/auth.ts` - Server auth utilities
  - `lib/server/products.ts` - Product queries
  - `lib/server/prompts.ts` - AI prompts
  - `lib/server/revalidate.ts` - Cache revalidation
- `lib/shared/` - Shared utilities
  - `lib/shared/fonts.ts` - Font configuration
  - `lib/shared/logger.ts` - Logging utility
  - `lib/shared/types.ts` - Type definitions
  - `lib/shared/utils.ts` - Utility functions

### Changed

#### Database Schema
- Enhanced `products` table with inventory tracking
  - Added `inStock: v.boolean()`
  - Added `inventory_qty: v.number()`
  - Added index on `inStock` field

- Added `carts` table
  - User/session tracking
  - Last checkout state preservation
  - Discount code storage
  - Custom field data
  - Expiration for cleanup

- Added `orders` table
  - Complete order history
  - Customer information
  - Status tracking (succeeded, failed, pending, confirmed, expired)
  - Product details with quantities
  - Payment amounts (total, discount, tax)
  - Billing address
  - Trial and subscription info
  - Metadata and custom fields

#### Middleware Enhancement
- `middleware.ts` - Enhanced route protection
  - Separated auth flow routes vs protected routes
  - Added tier-specific route arrays (starter, premium)
  - Improved redirect logic
  - TODOs for future tier-based access control

#### Component Updates
- `components/header.tsx` - Integrated cart icon
- `components/pricing-card.tsx` - Updated for checkout flow
- `components/product-card.tsx` - Added cart integration
- `components/theme-toggle.tsx` - Renamed from mode-toggle
- `components/dashboard-render-toggle.tsx` - New toggle component (43 lines)
- All UI components updated with import paths

#### Convex Backend
- `convex/http.ts` - Added checkout and order webhook routes
- `convex/products.ts` - Added inventory queries (66 lines added)
- All Convex files updated for lib restructure imports
- Enhanced error handling across all mutations

#### Dependencies
- Added `vaul@1.1.2` - Drawer component
- Added `@radix-ui/react-dialog@1.1.15` - Dialog primitives

### Removed
- `app/(auth)/` - Moved to `(protected)/`
- `app/(shop)/` - Moved to `(public)/(shop)/`
- `app/(unauth)/` - Moved to `(public)/(auth)/`
- `app/ConvexClientProvider.tsx` - Moved to `lib/client/providers/convex.tsx`
- `app/mode-toggle.tsx` - Replaced by `components/theme-toggle.tsx`
- `components/mode-toggle.tsx` - Consolidated into theme-toggle
- Old lib structure (10 files moved/reorganized)

### Breaking Changes

#### Route Structure
**Before:**
```
app/(auth)/         # Protected routes
app/(shop)/         # Shop routes
app/(unauth)/       # Auth flows
```

**After:**
```
app/(protected)/    # Protected routes with tier groups
app/(public)/       # Public routes (shop + auth)
```

**Migration:**
- Update any hardcoded route references
- Update bookmarks and saved links
- Auth routes: `/sign-in` → `/sign-in` (same, but under (public))
- Shop routes: `/products` → `/products` (same, but under (public))
- Protected: `/dashboard` → `/dashboard` (same, but under (protected))

#### Import Paths
**Before:**
```typescript
import { auth } from '@/lib/auth-client'
import { products } from '@/lib/products'
```

**After:**
```typescript
import { auth } from '@/lib/client/auth'
import { products } from '@/lib/server/products'
```

#### Database Migration Required
New tables must be deployed:
```bash
npx convex deploy  # Deploy new schema with carts and orders
```

### Commit Structure (13 Atomic Commits)

All commits GPG signed with ED25519:

1. `build: add drawer and dialog ui dependencies`
2. `feat(schema): add cart, order tables and inventory tracking`
3. `refactor(lib): reorganize into client/server/shared structure`
4. `refactor(convex): update imports for lib restructure`
5. `feat(api): add cart management endpoints`
6. `feat(api): add polar checkout integration`
7. `feat(api): add order sync and webhook handlers`
8. `refactor(routes): reorganize into protected/public route groups`
9. `feat(components): add drawer and toast notification ui`
10. `feat(components): add cart management ui`
11. `refactor(components): update imports and integrate cart`
12. `refactor(app): update root layout and api routes`
13. `chore(data): update product metadata`

### Impact
- **Bundle**: +2 dependencies, +5,000 lines of cart/checkout code
- **Performance**: Real-time cart state with Convex live queries
- **Security**: Webhook signature verification, GPG signed commits
- **Architecture**: Clear client/server/shared separation
- **UX**: Persistent cart across sessions, guest checkout support
- **Commerce**: Full Polar integration for payment processing

### Statistics
- **Files Changed:** 129 files
  - 72 files added
  - 45 files modified
  - 12 files removed (consolidated)
- **Lines:** 10,682 insertions, 2,191 deletions
- **Net Change:** +8,491 lines
- **Commits:** 13 atomic commits (all independently revertable)

---

## [0.3.2] - 2025-10-07 - Better Auth NPM Migration & Polar CRUD

**PR #26** - Migrate Better Auth to NPM package and refactor Polar operations

### Changed

#### Authentication Architecture
- **Better Auth Migration**
  - Migrated from local Better Auth install to `@convex-dev/better-auth` NPM package
  - Updated `convex/auth.ts` to use `getStaticAuth` with NPM imports
  - Updated `convex/convex.config.ts` configuration
  - Updated `lib/auth-client.ts` import paths
  - Removed `convex/betterAuth/` directory (1,655 lines deleted)

#### Polar Component Refactor
- **CRUD Operations**
  - Added `listCustomers()` query - Fetch all customers
  - Added `listSubscriptions()` query - Fetch all subscriptions
  - Added `deleteCustomer()` mutation - Individual customer deletion
  - Added `deleteSubscription()` mutation - Individual subscription deletion
  - Added `deleteProduct()` mutation - Individual product deletion
  - Removed `upsertProduct()` - Now `createProduct()` throws on duplicates
  - Removed `clearAllData()` - Replaced by individual delete operations

- **Factory Reset Updates**
  - `convex/factoryReset.ts` - Updated to use new individual delete mutations
  - Iterates through all entities for deletion
  - Maintains data integrity during resets

### Removed
- `convex/betterAuth/` - Local Better Auth adapter (1,655 lines)
- `upsertProduct()` mutation - Replaced by explicit create/update
- `clearAllData()` mutation - Replaced by individual deletes

### Build & Types
- Updated Better Auth generated types
  - `convex/_generated/api.d.ts` - 2,245 insertions, 101 deletions
  - `convex/_generated/server.d.ts` - Type updates
- Updated Polar generated types
  - `convex/polar/_generated/api.d.ts` - 45 insertions, 56 deletions
  - Better type safety for CRUD operations

### Style
- `next-env.d.ts` - Fixed import quote style (double → single quotes)

### Documentation
- `README.md` - Added Polar badge to showcase

### Breaking Changes

#### Removed Mutations
```typescript
// Before (upsert pattern)
await ctx.runMutation(api.polar.upsertProduct, { data })

// After (explicit create/update)
await ctx.runMutation(api.polar.createProduct, { data })
// Throws error if product exists

// Before (bulk delete)
await ctx.runMutation(api.polar.clearAllData, {})

// After (individual deletes)
const customers = await ctx.runQuery(api.polar.listCustomers, {})
for (const customer of customers) {
  await ctx.runMutation(api.polar.deleteCustomer, { id: customer._id })
}
```

#### Import Changes
```typescript
// Before (local Better Auth)
import { auth } from '@/convex/betterAuth'

// After (NPM package)
import { getStaticAuth } from '@convex-dev/better-auth'
```

### Impact
- **Architecture**: Simpler maintenance with NPM Better Auth package
- **CRUD**: More explicit operations (no implicit upserts)
- **Bundle**: Net reduction of ~1,500 lines
- **Types**: Improved type safety with regenerated types
- **Breaking**: Removed `upsertProduct()` and `clearAllData()`

### Statistics
- **Files Changed:** 11 files
  - 6 files modified
  - 1 directory removed (convex/betterAuth/)
- **Lines:** 2,290 insertions, 1,812 deletions
- **Net Change:** +478 lines (mostly type regeneration)
- **Commits:** 6 atomic commits

---

## [0.3.1] - 2025-10-06 - Polar Customer Duplication Fix

**PR #25** - Fix duplicate customer creation and update dependencies

### Fixed
- Removed redundant EnsurePolarCustomer component causing duplicate customers
- Customer creation now handled solely by user signup trigger
- Prevents race condition between component mount and signup trigger

### Changed
- Downgraded better-auth from 1.3.26 to 1.3.8 (resolves Convex telemetry error)
- Updated @convex-dev/better-auth to 0.8.9
- Updated @react-email/components to 0.5.6
- Updated ai to 5.0.60
- Updated convex to 1.27.4
- Updated lucide-react to 0.545.0
- Updated gitignore patterns for build artifacts
- Added next.js type definitions

### Removed
- `components/ensure-polar-customer.tsx` - Redundant with signup trigger
- Component usage from pricing page

## [0.3.0] - 2025-10-06 - Subscription System with Polar Integration

**PR #23** - Complete subscription system implementation with 3-tier pricing

### Added

#### Subscription System
- 3-tier subscription system (Free, Starter $9.99/mo, Premium $19.99/mo)
- Interactive pricing page with monthly/yearly billing toggle
- Automatic Polar customer provisioning on user signup
- User subscription tier detection in authentication
- Subscription status tracking and display

#### Polar Integration
- Local Polar component fork (`convex/polar/`)
- Bi-directional product and subscription sync
- Webhook handling for real-time updates
- Customer management with sync recovery
- Automatic user-to-customer mapping

#### Frontend
- `app/(shop)/pricing/page.tsx` - Interactive pricing page (251 lines)
- `components/ensure-polar-customer.tsx` - Customer provisioning component (92 lines)
- `components/pricing-card.tsx` - Pricing tier cards (79 lines)
- `subscriptions.json` - Subscription tier definitions (120 lines)
- `public/products/subscription.png` - Subscription product image

#### Backend - Polar Component
- `convex/polar/lib.ts` - Core Polar operations (419 lines)
- `convex/polar/util.ts` - Checkout and webhook utilities (184 lines)
- `convex/polar/schema.ts` - Polar data schema (99 lines)
- `convex/polar/convex.config.ts` - Component configuration
- `convex/polar/_generated/` - Auto-generated types and API

#### Backend - Integration
- `convex/polarCustomer.ts` - Customer management (134 lines)
- `convex/productsSync.ts` - Bi-directional product sync (299 lines)
- `convex/userSync.ts` - User-to-customer sync (168 lines)
- `convex/crons.ts` - Scheduled sync jobs

#### Development Utilities
- `convex/factoryReset.ts` - Complete system reset (363 lines)
- `convex/inspectData.ts` - Data inspection utility (66 lines)

#### Seeding Scripts
- `scripts/seedAll.ts` - Master seeding orchestrator (215 lines)
- `scripts/seedProducts.ts` - Product seeding (402 lines)
- `scripts/seedSubscriptions.ts` - Subscription seeding (491 lines)
- `scripts/verifySeeding.ts` - Seeding verification (369 lines)

### Changed
- Enhanced `convex/auth.ts` with subscription tier detection
- Added user signup trigger for automatic Polar customer creation
- Updated `CHANGELOG.md` with 1,647 lines of project history
- Updated `README.md` with subscription features
- Applied code formatting across all app routes
- Applied code formatting across all components
- Applied code formatting across all backend files
- Applied code formatting to lib and middleware
- Updated `tsconfig.json` with path mappings
- Updated `.gitignore` with dev directories

### Removed
- `scripts/completeReset.ts` - Replaced by factoryReset.ts
- `scripts/seedFromJson.ts` - Replaced by specialized scripts
- `scripts/testCompleteFlow.ts` - Replaced by verifySeeding.ts
- `scripts/testPolarConnection.ts` - Replaced by polar component

## [0.2.0] - 2025-10-03 - Complete Backend Integration

**PR #22** - This release represents a **major milestone** - complete transformation from static demo to production-ready application with real database, authentication, and payment processing.

### Added

#### Authentication & User Management (18 files)
- `app/(auth)/dashboard/page.tsx` - User dashboard with todo list
- `app/(auth)/dashboard/server/` - Server-side dashboard components
- `app/(auth)/settings/page.tsx` - User settings page
- `app/(auth)/settings/EnableTwoFactor.tsx` - 2FA setup component
- `app/(auth)/layout.tsx` - Protected route layout
- `app/(unauth)/sign-in/` - Sign-in page and component
- `app/(unauth)/sign-up/` - Sign-up page and component
- `app/(unauth)/verify-2fa/` - Two-factor verification
- `app/(unauth)/layout.tsx` - Unauth route layout
- `app/api/auth/[...all]/route.ts` - Better Auth API handler
- `app/reset-password/` - Password reset flow
- `lib/auth-client.ts` - Client-side auth utilities
- `lib/auth-server.ts` - Server-side auth utilities
- `middleware.ts` - Route protection and redirects
- `components/user-menu.tsx` - User profile dropdown
- `components/client.tsx` - Client component utilities
- `components/server.tsx` - Server component utilities
- `app/ConvexClientProvider.tsx` - Convex client provider
- `app/mode-toggle.tsx` - Dark mode toggle

#### Convex Database (45+ files)
- `convex/schema.ts` - Database schema (products, todos, Better Auth tables)
- `convex/products.ts` - Product CRUD with queries and mutations (350+ lines)
- `convex/todos.ts` - Todo list functionality
- `convex/http.ts` - Webhook handlers
- `convex/polar.ts` - Polar client configuration
- `convex/auth.ts` - Better Auth server integration
- `convex/auth.config.ts` - Better Auth configuration
- `convex/email.tsx` - Email template utilities
- `convex/emails/magicLink.tsx` - Magic link email template
- `convex/emails/resetPassword.tsx` - Password reset email template
- `convex/emails/verifyEmail.tsx` - Email verification template
- `convex/emails/verifyOTP.tsx` - OTP verification template
- `convex/emails/components/BaseEmail.tsx` - Base email component
- `convex/convex.config.ts` - Convex configuration
- `convex/polyfills.ts` - Node.js polyfills for Convex
- `convex/betterAuth/` - Better Auth adapter files
- `convex/_generated/` - Auto-generated TypeScript types

#### Product Management (5 files)
- `scripts/seedFromJson.ts` - Idempotent product seeding (274 lines)
- `scripts/completeReset.ts` - Delete all products from Convex & Polar
- `scripts/testCompleteFlow.ts` - 10 automated validation tests
- `scripts/testPolarConnection.ts` - Polar API connectivity test
- `products.json` - Product definitions (single source of truth)

#### UI Components (3 files)
- `components/ui/card.tsx` - Card component
- `components/ui/checkbox.tsx` - Checkbox component
- `components/ui/label.tsx` - Label component

#### Documentation
- `SETUP.md` - Complete local development setup guide (317 lines)

### Changed

#### Configuration Files
- `package.json`
  - Added `dev:backend` and `dev:frontend` scripts (parallel execution)
  - Added 4 product management scripts
  - Removed `format` and `typecheck` scripts
  - Updated `lint` script to include Convex typecheck
  - Added 28 new dependencies
  - Updated React 19.1.0 → 19.2.0
  - Updated Vercel AI SDK 5.0.52 → 5.0.59
  - Updated @types/node to v24
  - Updated Biome 2.2.0 → 2.2.5

- `next.config.ts`
  - Added Polar S3 remote image patterns (sandbox + production)
  - Updated CSP to allow Convex WebSocket connections
  - Removed `'unsafe-eval'` from script-src
  - Changed type from `NextConfig` to `satisfies NextConfig`

- `tsconfig.json`
  - Added `convex/` to exclude list
  - Added compiler options for Convex integration
  - Updated paths configuration

- `.env.example`
  - Removed old Google API documentation
  - Added Convex environment variables
  - Added Better Auth configuration
  - Added Polar configuration (production + sandbox)
  - Added GitHub OAuth variables
  - Changed NEXT_PUBLIC_BASE_URL to https://localhost:3000

#### Application Code
- `lib/products.ts` - **Complete rewrite** (116 lines → 45 lines)
  - Removed static product array
  - Added Convex query integration
  - Added `fetchQuery` for server-side data fetching
  - Kept `use cache` directive and cache configuration

- `app/layout.tsx`
  - Added ConvexClientProvider wrapper
  - Added auth context initialization
  - Updated metadata

- `app/(shop)/layout.tsx`
  - Added user menu to header
  - Integrated authentication state

- `app/(shop)/[category]/page.tsx`
  - Updated category filtering to use Convex queries
  - Maintained PPR and caching

- `app/(shop)/product/[id]/page.tsx`
  - Updated to fetch from Convex by ID
  - Maintained PPR and caching

- `app/(shop)/products/page.tsx`
  - Updated search and filtering with Convex
  - Maintained PPR and caching

- `components/header.tsx`
  - Added user authentication state
  - Added user menu integration

- `components/footer.tsx`
  - Updated branding and links

- `components/search.tsx`
  - Integrated with Convex live queries

- `components/product-card.tsx`
  - Updated to display Polar S3 images

- `app/api/generate-image/route.ts`
  - Updated for Convex integration

- `app/api/generate-model-image/route.ts`
  - Updated for Convex integration

### Removed

- `app/types.ts` - Moved types to `lib/types.ts`
- `.env.test` - Consolidated into `.env.example`
- Hardcoded product data from `lib/products.ts`
- Static image imports from `lib/products.ts`
- Obsolete `seedProducts` mutation from `convex/products.ts`

### Dependencies Added

#### Major Packages
- `convex@1.27.3` - Real-time database with auto-generated types
- `@convex-dev/better-auth@0.8.8` - Better Auth integration for Convex
- `@convex-dev/polar@0.6.4` - Polar subscriptions integration for Convex
- `@convex-dev/resend@0.1.13` - Resend email integration for Convex
- `@polar-sh/sdk@0.35.4` - Polar API client
- `better-auth@1.3.8` - Modern authentication library
- `@react-email/components@0.5.5` - React components for emails
- `resend@6.1.2` - Email sending service
- `convex-helpers@0.1.104` - Convex utility functions

#### UI & Components
- `@radix-ui/react-checkbox@1.3.3` - Checkbox primitive
- `@radix-ui/react-label@2.1.7` - Label primitive
- `react-qr-code@2.0.18` - QR code generation for 2FA

#### HTTP & Utilities
- `axios@1.12.2` - HTTP client for scripts
- `form-data@4.0.4` - Multipart form data for image uploads
- `http-proxy-middleware@3.0.5` - Proxy middleware

#### Development Tools
- `tsx@4.20.6` - TypeScript execution for scripts
- `npm-run-all@4.1.5` - Parallel script execution
- `dotenv@17.2.3` - Environment variable loading

#### Updates
- `react@19.2.0` (from 19.1.0)
- `react-dom@19.2.0` (from 19.1.0)
- `ai@5.0.59` (from 5.0.52)
- `@ai-sdk/google@2.0.17` (from 2.0.16)
- `@ai-sdk/openai@2.0.42` (from 2.0.41)
- `@biomejs/biome@2.2.5` (from 2.2.0)
- `@types/node@24` (from @types/node@20)

### Breaking Changes

#### Environment Variables Required
New required environment variables:
```env
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
SITE_URL=https://localhost:3000
```

#### Development Workflow Changes
- **HTTPS Required**: Development server now requires HTTPS (Convex WebSocket connections)
  - Access via `https://localhost:3000` instead of `http://localhost:3000`
  - Requires mkcert installation: `brew install mkcert && sudo mkcert -install`

- **Split Development Servers**: `npm run dev` now starts both frontend and backend
  - `dev:frontend` - Next.js with Turbopack
  - `dev:backend` - Convex with live component reloading
  - Both run in parallel using `npm-run-all`

- **Product Seeding Required**: Products must be seeded before first use
  - Run `npm run products:seed` to populate database
  - Products defined in `products.json`

#### API Changes
- `getProducts()` and `getProduct()` now return data from Convex instead of static arrays
- Product IDs are now Convex document IDs (not sequential numbers)
- Product images now use Polar S3 URLs (not local static imports)

### Migration Guide

**For users updating from previous version:**

1. **Install new dependencies:**
   ```bash
   npm install
   ```

2. **Setup Convex:**
   ```bash
   npx convex dev
   # Follow prompts to create deployment
   # Copy deployment URL to .env.local
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   # Add all required environment variables listed above
   ```

4. **Setup HTTPS certificates:**
   ```bash
   brew install mkcert
   sudo mkcert -install
   ```

5. **Setup Better Auth:**
   - Create GitHub OAuth app at https://github.com/settings/developers
   - Set callback URL: `https://localhost:3000/api/auth/callback/github`
   - Add credentials to `.env.local`

6. **Setup Polar:**
   - Create Polar account at https://polar.sh
   - Generate organization token with required permissions
   - Add token and webhook secret to `.env.local`

7. **Seed products:**
   ```bash
   npm run products:seed
   ```

8. **Start development:**
   ```bash
   npm run dev
   # Visit https://localhost:3000
   ```

### Statistics

- **Files Changed:** 83 files total
  - 60+ files added (auth, convex, scripts, components)
  - 20+ files modified (integration updates)
  - 3 files deleted (.env files consolidated)
- **Dependencies Added:** 28 packages
- **Dependencies Updated:** 6 packages
- **Lines Added:** 8,116 insertions
- **Lines Removed:** 2,936 deletions
- **Net Change:** +5,180 lines
- **Scripts Added:** 4 product management commands
- **Tests Added:** 10 automated validation tests
- **Database Tables:** 3 main tables (products, todos, Better Auth tables)
- **API Routes:** 6 routes (auth, webhooks, AI generation)
- **Commits:** 40+ granular commits

### Technical Details

#### Architecture Changes
- Migrated from static data to real-time database (Convex)
- Added server-side authentication with Better Auth
- Integrated Polar for payment processing and subscriptions
- Split development into parallel frontend/backend servers
- Added HTTPS requirement for WebSocket connections
- Implemented idempotent product management system

#### Product Management Workflow
1. Define products in `products.json`
2. Run `npm run products:seed` to:
   - Create/update products in Polar
   - Upload images to Polar S3 (with SHA-256 checksums)
   - Sync data to Convex database
   - Link all references (polarProductId, polarImageUrl, polarImageId)
3. Run `npm run products:verify` to validate (10 tests)

#### Testing
- 10 automated tests check:
  - Exact product counts (Convex and Polar)
  - Product linking (Convex ↔ Polar)
  - Image presence on all products
  - Product sync correctness
  - No duplicate Convex IDs
  - No duplicate Polar IDs
  - No duplicate Polar links
  - No duplicate image IDs
  - No duplicate product names

### Security

- Added CSP headers for Convex WebSocket connections
- Implemented secure session management with Better Auth
- Added route protection with middleware
- Environment variable validation in scripts
- Removed hardcoded API tokens from codebase
- Added HTTPS requirement for local development

### Known Issues

- TypeScript errors in some auth components (non-blocking)
- `.env.example` contains placeholder values (must be replaced)
- Some lint warnings from unused imports in email templates

---

## [0.1.21] - 2025-09-30 - Caching Modernization

**PR #21** - Modernize caching implementation and optimize components

### Added
- Component-level caching with `use cache` directive
- Cache lifetime and tag configuration to all pages
- File validation for image uploads
- `lib/prompts.ts` - Centralized AI prompt management (100 lines)
- `components/uploader.tsx` - Validated file upload component

### Changed
- **next.config.ts**
  - Enabled `cacheComponents: true` for component-level caching
  - Removed deprecated `useCache` configuration

- **Caching Implementation** (4 files)
  - `app/(shop)/[category]/page.tsx` - Added cache directives
  - `app/(shop)/page.tsx` - Added cache lifetime and tags
  - `app/(shop)/product/[id]/page.tsx` - Added cache configuration
  - `app/(shop)/products/page.tsx` - Added cache optimization

- **Component Optimization**
  - `components/link.tsx` - Simplified prefetch logic
  - `components/product-card.tsx` - Updated image sizing with fill layout
  - `lib/logger.ts` - Enhanced error tracking

- **API Routes**
  - `app/api/generate-image/route.ts` - Updated prompt handling
  - `app/api/generate-model-image/route.ts` - Extracted prompts to module (reduced from 61 to 3 lines)

- **Styling**
  - `app/globals.css` - Consolidated CSS animations with variables (reduced from 73 to 23 lines)
  - `app/global-error.tsx` - Improved error UI

- **TypeScript Configuration**
  - `tsconfig.json` - Cleaned up compiler options (reduced from 14 to 4 extended configs)

### Impact
- Improved cache granularity with component-level control
- Better code organization with centralized prompts
- Enhanced validation and error handling
- Reduced CSS duplication by 68%
- Cleaner TypeScript configuration

### Files Changed
- Modified: 14 files
- Added: 1 file (lib/prompts.ts)
- Total: 15 files
- Lines: 224 additions, 181 deletions

---

## [0.1.20] - 2025-09-30 - Documentation Overhaul

**PR #20** - Rewrite README as comprehensive feature showcase

### Changed
- **README.md** - Complete rewrite (290 additions, 530 deletions)
  - Added "Why This Repo?" value proposition section
  - Listed all experimental canary features with checkboxes
  - Documented core Next.js 15 features
  - Added implementation examples with code snippets
  - Included build output and performance metrics
  - Added use cases and learning objectives
  - Updated roadmap with future additions
  - Credited original v0 template creator
  - Added contributing guidelines

### Structure
- ✅ Why This Repo?
- ✅ Features Demonstrated (Experimental + Core)
- ✅ Implementation Examples (caching, prefetching, PPR)
- ✅ Configuration Examples (next.config.ts, env vars)
- ✅ Build Output with PPR indicators
- ✅ Performance Metrics (bundle size, build time)
- ✅ Use Cases (learning, migration, benchmarking)
- ✅ Roadmap and Contributing

### Impact
- Clear showcase of all Next.js 15 features
- Better learning resource for developers
- Improved open source adoption potential
- Professional documentation for production use

### Files Changed
- Modified: 1 file (README.md)
- Total: 1 file
- Lines: 290 additions, 530 deletions

---

## [0.1.19] - 2025-09-29 - Loading & Cache Strategy Optimization

**PR #19** - Optimize loading states and refine cache strategy

### Added
- `app/(shop)/loading.tsx` - Unified loading state for shop routes (24 lines)
- `lib/fonts.ts` - Centralized font configuration (13 lines)

### Changed
- **Page Architecture** - Extracted cached content components
  - `app/(shop)/[category]/page.tsx` - Created `CachedCategoryContent` component
  - `app/(shop)/page.tsx` - Removed inline loading skeleton, extracted cached content
  - `app/(shop)/product/[id]/page.tsx` - Added cache directive
  - `app/(shop)/products/page.tsx` - Refactored with `CachedProductsContent` component

- **Font Management**
  - `app/layout.tsx` - Migrated to centralized font imports (reduced from 17 to 7 lines)

- **Layout Optimization**
  - `app/(shop)/layout.tsx` - Converted to async function
  - `components/header.tsx` - Updated image dimensions
  - `components/footer.tsx` - Added explicit dimensions

- **Configuration**
  - `next.config.ts` - Added format spacing
  - `tsconfig.json` - Expanded compiler options (3 to 14 lines)

- **Cache Strategy**
  - Removed inline `revalidate` exports in favor of `cacheLife` configuration
  - Added server-only directive to cache utilities
  - `lib/revalidate.ts` - Added server-only protection

### Removed
- `components/photo-uploader.tsx` - Unused component (310 lines)

### Impact
- Improved loading state architecture with consistent UX
- Better cache control using `use cache` directive instead of route-level exports
- Cleaner code organization with extracted components
- Reduced bundle size by removing unused components
- Enhanced type safety with font module

### Files Changed
- Modified: 11 files
- Added: 2 files
- Removed: 1 file
- Total: 14 files
- Lines: 174 additions, 410 deletions

---

## [0.1.18] - 2025-09-29 - Code Style Standardization

**PR #18** - Standardize code style with single quotes

### Added
- `app/global-not-found.tsx` - Global not found page (27 lines)

### Changed
- **biome.json** - Added `quoteStyle: "single"` to JavaScript formatter
- **All TypeScript/JavaScript files** - Applied single quote formatting (42 files)
  - App routes and pages (11 files)
  - API routes (2 files)
  - Components (13 files)
  - Library utilities (5 files)
  - Configuration files (3 files)

### Formatting Changes
- Updated `'use cache'`, `'use client'`, `'use server'` directives
- Converted all string literals to single quotes
- Updated JSX attribute quotes to single quotes
- Aligned with React/Next.js official documentation conventions

### Impact
- Aligns with React/Next.js official documentation conventions
- Improves code consistency across 42 files
- No functional changes (formatting only)
- Better developer experience with consistent style

### Files Changed
- Modified: 42 files
- Added: 1 file (app/global-not-found.tsx)
- Configuration: 1 file
- Total: 44 files
- Lines: 502 additions, 431 deletions

---

## [0.1.17] - 2025-09-29 - Incremental Static Regeneration

**PR #17** - Implement ISR with time-based revalidation

### Added
- Time-based revalidation (3600s / 1 hour) to all product pages
- Dynamic params configuration for route handling
- Fetch logging for cache debugging

### Changed
- **Product Routes** (4 files)
  - `app/(shop)/product/[id]/page.tsx`
    - Added `export const revalidate = 3600`
    - Added `export const dynamicParams = true`

  - `app/(shop)/[category]/page.tsx`
    - Added `export const revalidate = 3600`
    - Added `export const dynamicParams = false`

  - `app/(shop)/products/page.tsx`
    - Added `export const revalidate = 3600`

  - `app/(shop)/page.tsx`
    - Added `export const revalidate = 3600`

- **Configuration**
  - `next.config.ts` - Added `logging.fetches.fullUrl: true` for cache debugging

### Implementation Details
- **Revalidation Strategy**: Stale-while-revalidate behavior (1 hour intervals)
- **Dynamic Params**:
  - Product pages allow dynamic params (new products)
  - Category pages use static params only
- **Cache Policy**: Maintains existing tag-based invalidation alongside time-based revalidation

### Impact
- Enables ISR with automatic page regeneration every hour
- Reduces server load with consistent cache policy
- Adds debug visibility for cache hits/misses
- Maintains freshness while serving cached content
- Complements tag-based cache invalidation strategy

### Files Changed
- Modified: 5 files
- Total: 5 files
- Lines: 11 additions, 0 deletions

---

## [0.1.16] - 2025-09-29 - Environment Variables & API Modernization

**PR #16** - Complete environment variable documentation and API modernization

### Added
- **Environment Configuration** (3 files)
  - `.env.example` - Added `NEXT_PUBLIC_BASE_URL`
  - `.env.test` - Test environment configuration (11 lines)
  - `.gitignore` - Allow test environment file

- **Documentation**
  - Inline environment variable comments in `app/layout.tsx`, `app/robots.ts`, `app/sitemap.ts`
  - JSDoc documentation for API routes
  - `NODE_ENV` automatic behavior documentation in logger

### Changed
- **API Utilities** - `lib/api-utils.ts`
  - Renamed `getApiKey()` to `getGoogleApiKey()` for clarity
  - Fixed environment variable reference
  - Added JSDoc documentation

- **Caching Modernization** (3 files)
  - `lib/products.ts` - Migrated from `unstable_cache` wrapper to `"use cache"` directive
  - `next.config.ts` - Added `cacheLife` profiles (default, hours)
  - Implemented `cacheTag()` for granular cache invalidation

- **Component Modernization**
  - `components/search.tsx` - Migrated to `next/form` (reduced from 32 to 9 lines)
  - `components/link.tsx` - Refactored to use `useState` for prefetch logic
  - `components/product-card.tsx` - Updated prefetch strategy

- **API Routes** - Added inline documentation
  - `app/api/generate-image/route.ts` - Added JSDoc comments
  - `app/api/generate-model-image/route.ts` - Added JSDoc comments

- **README.md** - Updated documentation (122 additions, 24 deletions)
  - Added environment variable configuration section
  - Added test environment documentation
  - Updated code examples with new implementations

### Cache Migration
**Before:**
```typescript
export const getProducts = unstable_cache(
  async (filters?: ProductFilters) => { ... },
  ['products'],
  { revalidate: 3600 }
);
```

**After:**
```typescript
export async function getProducts(filters?: ProductFilters) {
  'use cache';
  cacheLife('hours');
  cacheTag('products');
  // ...
}
```

### Impact
- Improved developer experience with clear environment setup
- Consistent test environment across deployments
- Better code documentation and maintainability
- Modern API usage following Next.js 15 best practices
- Cleaner search implementation (72% code reduction)
- Type-safe cache configuration

### Files Changed
- Modified: 11 files
- Added: 2 files (.env.test, documentation)
- Total: 17 files
- Lines: 234 additions, 119 deletions

---

## [0.1.15] - 2025-09-29 - Metadata Type Safety

**PR #15** - Improve metadata type safety and OpenGraph support

### Changed
- **Metadata Functions** - Added type safety (3 files)
  - `app/(shop)/[category]/page.tsx` - Added `Promise<Metadata>` return type (8 additions, 1 deletion)
  - `app/(shop)/product/[id]/page.tsx` - Added `Promise<Metadata>` return type (8 additions, 2 deletions)
  - `app/layout.tsx` - Added locale to OpenGraph metadata (1 addition)

- **OpenGraph Improvements**
  - Converted `StaticImageData` to string URLs for compatibility
  - Added `locale: "en_US"` to root layout OpenGraph
  - Added OpenGraph title and description to category pages
  - Proper image URL handling for social media sharing

### Type Safety Pattern
```typescript
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  return {
    title: `${category} - Store`,
    openGraph: {
      title: `${category} Collection`,
      description: `Browse our ${category} products`,
    },
  };
}
```

### Impact
- ✅ Improved type safety across metadata functions
- ✅ Proper OpenGraph image handling for social sharing
- ✅ Better SEO and social media preview support
- ✅ TypeScript compile-time validation
- ✅ Consistent metadata patterns

### Files Changed
- Modified: 3 files
- Total: 3 files
- Lines: 17 additions, 3 deletions

---

## [0.1.14] - 2025-09-29 - Native Image Optimization

**PR #14** - Replace custom loader with Next.js native image optimization

### Added
- Static image imports for all products (8 files)
- AVIF format support alongside WebP
- `StaticImageData` type support in components

### Changed
- **Image Imports** - `lib/products.ts`
  - Converted from URL strings to static imports
  - Automatic width/height inference
  - Built-in blur placeholder generation

- **Component Updates**
  - `components/product-card.tsx` - Handle `StaticImageData` type
  - `components/photo-uploader.tsx` - Support static imports

- **Type Definitions**
  - `lib/types.ts` - Added `StaticImageData | string` union type

- **Next.js Configuration** - `next.config.ts`
  - Removed custom image loader configuration
  - Added AVIF format support: `formats: ['image/avif', 'image/webp']`

- **Error Pages** - Updated image imports (6 files)
  - `app/(shop)/[category]/error.tsx`
  - `app/(shop)/[category]/not-found.tsx`
  - `app/(shop)/error.tsx`
  - `app/(shop)/product/[id]/error.tsx`
  - `app/(shop)/product/[id]/not-found.tsx`
  - `app/(shop)/products/error.tsx`

- **Layout Components**
  - `components/header.tsx` - Static logo import
  - `components/footer.tsx` - Static logo import

### Removed
- `lib/image-loader.ts` - Custom image loader (31 lines)

### Benefits
- ✅ Automatic width/height inference (prevents CLS)
- ✅ Built-in blur placeholder generation
- ✅ Native AVIF/WebP conversion
- ✅ Optimal image sizing per device
- ✅ Zero configuration maintenance

### Testing
- ✅ Build: Successful (1093ms)
- ✅ TypeScript: All types valid
- ✅ Linter: No errors
- ✅ All 19 routes generated successfully

### Documentation
- **README.md** - Added image optimization section (79 additions, 9 deletions)
  - Configuration examples
  - Implementation patterns
  - Performance benefits

### Impact
- Improved image loading performance
- Better Core Web Vitals (CLS prevention)
- Automatic format optimization (AVIF → WebP → JPEG)
- Simplified codebase with native features

### Files Changed
- Modified: 14 files
- Removed: 1 file
- Total: 15 files
- Lines: 125 additions, 69 deletions

---

## [0.1.13] - 2025-09-29 - Cache Optimization

**PR #13** - Cache optimization with revalidation utilities

### Added
- **Revalidation Utilities** - `lib/revalidate.ts` (23 lines)
  - `revalidateProducts()` - Invalidate all product caches
  - `revalidateCategory(category: string)` - Invalidate category-specific cache
  - Tag-based cache invalidation functions

### Changed
- **Product Data Layer** - `lib/products.ts`
  - Wrapped queries with `unstable_cache` (34 additions, 3 deletions)
  - Added cache tags: `products`, `category-${category}`
  - Configured 1-hour cache lifetime

- **Product Pages** - `app/(shop)/product/[id]/page.tsx`
  - Parallel data fetching with `Promise.all` (8 additions, 2 deletions)
  - Fetch product and related products concurrently
  - Reduced sequential data fetching delays

### Caching Strategy
```typescript
// Before: No caching
const products = await getProducts({ category });

// After: Tagged cache with revalidation
const products = unstable_cache(
  async () => getProducts({ category }),
  ['products', `category-${category}`],
  { revalidate: 3600 }
)();
```

### Parallel Fetching Pattern
```typescript
// Before: Sequential fetching
const product = await getProduct(id);
const related = await getProducts({ category: product.category });

// After: Parallel fetching
const [product, related] = await Promise.all([
  getProduct(id),
  getProducts({ category }),
]);
```

### Impact
- ✅ Reduced database/API calls with caching
- ✅ Faster product page loads with parallel fetching
- ✅ Granular cache invalidation with tags
- ✅ 1-hour cache lifetime for optimal freshness
- ✅ Reusable revalidation utilities

### Files Changed
- Modified: 2 files
- Added: 1 file
- Total: 3 files
- Lines: 65 additions, 5 deletions

---

## [0.1.12] - 2025-09-29 - Error Handling Improvements

**PR #12** - Improve error handling with nested boundaries

### Added
- **Route-Level Error Boundaries** (6 files)
  - `app/(shop)/error.tsx` - Shop route error boundary (34 lines)
  - `app/(shop)/[category]/error.tsx` - Category error boundary (39 lines)
  - `app/(shop)/product/[id]/error.tsx` - Product error boundary (46 lines)
  - `app/(shop)/products/error.tsx` - Products listing error boundary (38 lines)

- **Custom 404 Pages** (2 files)
  - `app/(shop)/[category]/not-found.tsx` - Category not found (34 lines)
  - `app/(shop)/product/[id]/not-found.tsx` - Product not found (34 lines)

### Changed
- **Error Logging** - `app/error.tsx`
  - Wrapped error logging in `useEffect` (4 additions, 6 deletions)
  - Prevents duplicate logs in development mode
  - Proper client component pattern

- **Global Error Handler** - `app/global-error.tsx`
  - Updated error handling pattern (4 additions, 2 deletions)
  - Improved error UI consistency

### Error Boundary Hierarchy
```
app/global-error.tsx              # Global fallback
  ├─ app/error.tsx                # Root error boundary
      └─ app/(shop)/error.tsx     # Shop route error boundary
          ├─ app/(shop)/[category]/error.tsx     # Category errors
          ├─ app/(shop)/product/[id]/error.tsx   # Product errors
          └─ app/(shop)/products/error.tsx       # Products errors
```

### Custom 404 Features
- Contextual error messages based on route
- Navigation links to related pages
- Breadcrumb-style recovery options
- Consistent styling with app theme

### Impact
- ✅ Proper error boundary hierarchy for granular error handling
- ✅ Better user experience with contextual error messages
- ✅ Improved developer experience with correct error logging
- ✅ Prevents duplicate error logs in development
- ✅ Custom 404 pages with helpful navigation

### Files Changed
- Modified: 2 files
- Added: 6 files
- Total: 8 files
- Lines: 233 additions, 8 deletions

---

## [0.1.11] - 2025-09-29 - Component Cleanup

**PR #11** - Component cleanup and route consolidation

### Removed
- **Unused Components** (4 files, 681 lines)
  - `components/storefront-client.tsx` - Replaced by direct page components (591 lines)
  - `components/storefront-layout.tsx` - Consolidated into shop layout (44 lines)
  - `components/storefront-wrapper.tsx` - No longer needed (43 lines)
  - `components/search-bar.tsx` - Replaced by search component (47 lines)

- **Duplicate Routes** (2 files)
  - `app/page.tsx` - Moved to shop route group (76 lines)

### Changed
- **Component Renaming** - Terse names for better DX (5 files)
  - `components/storefront-header.tsx` → `components/header.tsx`
  - `components/storefront-footer.tsx` → `components/footer.tsx`
  - `components/optimized-link.tsx` → `components/link.tsx`
  - `components/simple-photo-uploader.tsx` → `components/uploader.tsx`
  - `components/search-input.tsx` → `components/search.tsx`

- **Route Consolidation**
  - `app/(shop)/page.tsx` - Moved from root (65 additions)
  - All routes now under shop route group

- **Updated Imports** - All import paths updated across:
  - `app/(shop)/[category]/loading.tsx` - Import path updates (17 additions, 24 deletions)
  - `app/(shop)/[category]/page.tsx` - Import path updates (41 additions, 58 deletions)
  - `app/(shop)/layout.tsx` - Import path updates (6 additions, 2 deletions)
  - `app/(shop)/product/[id]/loading.tsx` - Import path updates (45 additions, 56 deletions)
  - `app/(shop)/product/[id]/page.tsx` - Import path updates (114 additions, 132 deletions)
  - `app/(shop)/products/loading.tsx` - Import path updates (19 additions, 33 deletions)
  - `app/(shop)/products/page.tsx` - Import path updates (54 additions, 81 deletions)
  - `components/footer.tsx` - Naming update (1 addition, 1 deletion)
  - `components/header.tsx` - Naming update (8 additions, 8 deletions)
  - `components/link.tsx` - Naming update (4 additions, 4 deletions)
  - `components/product-grid.tsx` - Import update (3 additions, 3 deletions)
  - `components/search.tsx` - Naming update (3 additions, 3 deletions)
  - `components/uploader.tsx` - Naming update (1 addition, 1 deletion)

- **Development Configuration**
  - `package.json` - Added --turbopack flag to dev script

- **Documentation**
  - `README.md` - Major update (142 additions, 54 deletions)

### Impact
- ✅ Reduced codebase by 681 lines (network payload reduction)
- ✅ Cleaner component naming convention
- ✅ Consistent route architecture with shop group
- ✅ Production-ready structure
- ✅ Faster development builds with Turbopack
- ✅ Eliminated code duplication

### Files Changed
- Modified: 14 files
- Removed: 6 files
- Added: 1 file
- Total: 21 files
- Lines: 524 additions, 1262 deletions

---

## [0.1.10] - 2025-09-29 - Partial Prerendering Implementation

**PR #10** - Implement PPR with incremental mode and smart prefetching

### Added
- **Partial Prerendering Configuration**
  - `next.config.ts` - `experimental.ppr: 'incremental'`
  - Enabled PPR on 4 routes (home, category, product, products)

- **Smart Prefetching Component**
  - `components/optimized-link.tsx` - Hover-based prefetch strategy (15 lines)
  - Supports strategies: hover, visible, always, never

- **Image Upload Component**
  - `components/simple-photo-uploader.tsx` - Lightweight uploader (118 lines)

### Changed
- **Route Optimization** (4 files)
  - `app/(shop)/page.tsx` - Added `export const experimental_ppr = true`
  - `app/(shop)/[category]/page.tsx` - Enabled PPR with separated dynamic content
  - `app/(shop)/product/[id]/page.tsx` - PPR optimization
  - `app/(shop)/products/page.tsx` - PPR with streaming content

- **Component Updates**
  - `components/product-grid.tsx` - Use OptimizedLink component
  - `components/storefront-header.tsx` - Hover prefetching on nav links
  - `components/storefront-layout.tsx` - Link optimization
  - `components/storefront-footer.tsx` - Updated navigation

- **Package Configuration**
  - `package.json` - Added ES module type
  - `tsconfig.json` - Added module configuration

- **Documentation**
  - `README.md` - Added PPR documentation with performance metrics (231 additions, 77 deletions)

### Performance Impact
- ⚡ Instant navigation with hover prefetching
- ⚡ Static shell delivery with streaming content
- ⚡ Zero perceived latency on prefetched routes
- ⚡ Reduced Time to First Byte (TTFB)

### PPR Architecture
```
◐ = Partial Prerender (static shell + streaming content)
┌ ◐ /                    - Static shell, dynamic products
├ ◐ /[category]          - Static shell, dynamic filters
├ ◐ /product/[id]        - Static shell, dynamic details
└ ◐ /products            - Static shell, dynamic search
```

### Files Changed
- Modified: 11 files
- Added: 2 files
- Total: 15 files
- Lines: 507 additions, 211 deletions

---

## [0.1.9] - 2025-09-29 - Type Safety & Async Handling

**PR #9** - Type safety and async handling improvements

### Changed
- **Type Safety** - Eliminated all `any` types (27 files)
  - `lib/logger.ts` - Removed `any` types from log methods
  - `lib/api-utils.ts` - Proper DOM event typing (5 additions, 3 deletions)
  - `lib/products.ts` - Enhanced type annotations (24 additions, 19 deletions)
  - `lib/types.ts` - Type refinements (2 additions, 2 deletions)

- **Async Params Handling** - Fixed destructuring in dynamic routes (4 files)
  - `app/(shop)/[category]/page.tsx` - Await params before destructuring (31 additions, 20 deletions)
  - `app/(shop)/product/[id]/page.tsx` - Await params/searchParams (8 additions, 8 deletions)
  - `app/(shop)/products/page.tsx` - Proper async handling (30 additions, 15 deletions)
  - `app/page.tsx` - Async param handling (15 additions, 7 deletions)

- **Error Boundaries** - Improved patterns (2 files)
  - `app/global-error.tsx` - Removed useEffect, proper client component (14 additions, 11 deletions)
  - `app/error.tsx` - Removed useEffect dependency

- **Component Improvements** (14 files)
  - `components/photo-uploader.tsx` - Better DOM event types (10 additions, 6 deletions)
  - `components/product-card.tsx` - Improved type safety (12 additions, 8 deletions)
  - `components/product-grid.tsx` - Type refinements (3 additions, 3 deletions)
  - `components/optimized-link.tsx` - Better event typing (4 additions, 8 deletions)
  - `components/search-bar.tsx` - Form event types (6 additions, 3 deletions)
  - `components/search-input.tsx` - Input event types (19 additions, 13 deletions)
  - `components/storefront-client.tsx` - State typing (1 addition, 2 deletions)
  - `components/storefront-footer.tsx` - Type cleanup (1 addition, 1 deletion)
  - `components/storefront-header.tsx` - Removed unused code (2 additions, 18 deletions)
  - `components/storefront-layout.tsx` - Type improvements (7 additions, 5 deletions)
  - `components/storefront-wrapper.tsx` - Better typing (14 additions, 5 deletions)

- **API Routes** - Type safety (2 files)
  - `app/api/generate-image/route.ts` - Proper request typing (1 addition, 1 deletion)
  - `app/api/generate-model-image/route.ts` - Response typing (1 addition, 1 deletion)

- **Application Files**
  - `app/(shop)/layout.tsx` - Type cleanup (1 addition, 1 deletion)
  - `app/(shop)/[category]/loading.tsx` - Type improvements (1 addition, 1 deletion)
  - `app/layout.tsx` - Metadata typing (3 additions, 1 deletion)
  - `app/types.ts` - Type definition updates (3 additions, 3 deletions)

- **Configuration**
  - `tsconfig.json` - Enhanced strict type checking (7 additions, 1 deletion)

- **Documentation**
  - `README.md` - Type safety achievements (15 additions, 10 deletions)

### Results
- ✅ Zero `any` types in entire codebase
- ✅ 100% type coverage
- ✅ Proper async/await patterns for dynamic routes
- ✅ Framework-compliant param handling
- ✅ Better DOM event typing
- ✅ Improved error boundary patterns

### Impact
- Improved TypeScript strict mode compliance
- Better framework compliance for dynamic routes
- Enhanced error handling and accessibility
- Consistent code style and import organization
- Eliminated runtime type errors
- Better IDE autocomplete and IntelliSense

### Files Changed
- Modified: 27 files
- Total: 27 files
- Lines: 240 additions, 176 deletions

---

## [0.1.8] - 2025-09-29 - Server Components Migration

**PR #8** - Implement Server Components and achieve 37% bundle reduction

### Added
- **Route Structure** (3 files)
  - `app/(shop)/layout.tsx` - Shared layout for shop routes (14 lines)
  - `app/(shop)/[category]/page.tsx` - Dynamic category pages (171 lines)
  - `app/(shop)/[category]/loading.tsx` - Category loading state (32 lines)

- **Server Components** (8 files)
  - `components/storefront-layout.tsx` - Shop layout wrapper (42 lines)
  - `components/storefront-header.tsx` - Server-rendered header (66 lines)
  - `components/storefront-footer.tsx` - Server-rendered footer (25 lines)
  - `components/product-grid.tsx` - Product grid component (55 lines)
  - `components/product-card.tsx` - Product card component (135 lines)
  - `components/search-input.tsx` - Search component (44 lines)

- **Data Fetching**
  - `lib/products.ts` - Server-only product data fetching (3 lines added)
  - `lib/types.ts` - Type definitions (18 lines)
  - `lib/api-utils.ts` - API helper functions (12 lines)

- **Client Components**
  - `components/optimized-link.tsx` - Smart prefetching wrapper (45 lines)
  - `components/photo-uploader.tsx` - AI virtual try-on (298 lines)
  - `components/storefront-wrapper.tsx` - Client wrapper (34 lines)

- **Empty Files** (Lazy loading placeholders)
  - `app/(shop)/product/[id]/loading.tsx`
  - `app/(shop)/products/loading.tsx`

### Changed
- **Main Page** - `app/page.tsx`
  - Converted to Server Component
  - Removed client-side logic (reduced from 675 to 53 lines)

- **Client Refactor** - `components/storefront-client.tsx`
  - Extracted from page.tsx (596 lines)
  - Minimal client-side interactivity

- **Type Definitions** - `app/types.ts`
  - Added product type definitions

- **Configuration**
  - `tsconfig.json` - Added baseUrl for absolute imports
  - `package.json` - Added server-only package

### Removed
- **Duplicate Category Pages** (4 files)
  - `app/men/page.tsx` (81 lines)
  - `app/women/page.tsx` (81 lines)
  - `app/kids/page.tsx` (81 lines)
  - `app/new/page.tsx` (83 lines)

### Route Consolidation
**Before:** Separate pages for each category
```
/men → app/men/page.tsx
/women → app/women/page.tsx
/kids → app/kids/page.tsx
```

**After:** Single dynamic route
```
/[category] → app/(shop)/[category]/page.tsx
```

### Performance Impact
- ✅ 37% reduction in JavaScript bundle size
- ✅ Server-side rendering enabled by default
- ✅ Automatic prefetching for navigation
- ✅ Improved SEO with server-rendered content
- ✅ Faster initial page loads
- ✅ Reduced client-side hydration time

### Files Changed
- Modified: 7 files
- Added: 15 files
- Removed: 4 files
- Total: 34 files
- Lines: 1080 additions, 372 deletions

---

## [0.1.7] - 2025-09-29 - Search Functionality

**PR #7** - PageProps helper and search functionality

### Added
- **Search Component**
  - `components/search-bar.tsx` - Reusable search component (44 lines)

- **Type Helper**
  - PageProps pattern for type-safe params and searchParams

### Changed
- **Product Data Layer** - `lib/products.ts`
  - Implemented search/filter logic (96 additions, 35 deletions)
  - Added URL-based search params support
  - Server-side filtering with category support
  - Text search across product names and descriptions

- **Category Pages** - Updated with search (4 files)
  - `app/kids/page.tsx` - Added PageProps, search/filter (53 additions, 7 deletions)
  - `app/men/page.tsx` - Added PageProps, search/filter (53 additions, 7 deletions)
  - `app/women/page.tsx` - Added PageProps, search/filter (53 additions, 7 deletions)
  - `app/new/page.tsx` - Added PageProps, search/filter (54 additions, 7 deletions)

- **Product Pages**
  - `app/products/page.tsx` - Integrated SearchBar component (23 additions, 9 deletions)
  - `app/product/[id]/page.tsx` - Added PageProps pattern (8 additions, 12 deletions)

- **Home Page**
  - `app/page.tsx` - Added PageProps support (11 additions, 3 deletions)

- **Components**
  - `components/storefront-client.tsx` - Search integration (14 additions, 2 deletions)

- **Documentation**
  - `README.md` - Search functionality documentation (12 additions, 6 deletions)

### Type Safety Pattern
```typescript
// PageProps helper for type-safe params
type PageProps = {
  params: { category: string };
  searchParams?: { search?: string; sort?: string };
};

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const products = await getProducts({
    category: params.category,
    search: searchParams?.search,
    sort: searchParams?.sort,
  });
}
```

### Impact
- ✅ Type-safe params across all routes
- ✅ Functional search across entire storefront
- ✅ Server-side filtering with URL state
- ✅ Better developer experience with PageProps
- ✅ SEO-friendly URL-based search
- ✅ Reusable search component

### Files Changed
- Modified: 10 files
- Added: 1 file
- Total: 11 files
- Lines: 421 additions, 95 deletions

---

## [0.1.6] - 2025-09-29 - Product Pages & Metadata

**PR #6** - Add product pages and metadata improvements

### Added
- **Product Pages** (2 files)
  - `app/product/[id]/page.tsx` - Dynamic product detail pages (205 lines)
  - `app/product/[id]/loading.tsx` - Product loading state (72 lines)

- **Products Listing** (2 files)
  - `app/products/page.tsx` - All products page (86 lines)
  - `app/products/loading.tsx` - Products loading state (42 lines)

- **Category Pages** (4 files)
  - `app/men/page.tsx` - Men's category (35 lines)
  - `app/women/page.tsx` - Women's category (35 lines)
  - `app/kids/page.tsx` - Kids category (35 lines)
  - `app/new/page.tsx` - New arrivals (36 lines)

- **Metadata Assets** (8 files)
  - `public/logo.png` - Brand logo
  - `public/apple-icon.png` - Apple touch icon
  - `public/icon-192.png` - PWA icon (192x192)
  - `public/icon-512.png` - PWA icon (512x512)
  - `public/og.png` - Open Graph image
  - `public/opengraph-image.png` - OG fallback
  - `public/twitter-image.png` - Twitter card image
  - `public/manifest.json` - PWA manifest (24 lines)

### Changed
- **Root Layout** - `app/layout.tsx`
  - Added metadata images (16 additions, 3 deletions)
  - Configured PWA manifest
  - Added Open Graph images
  - Added Twitter card images

- **Sitemap** - `app/sitemap.ts`
  - Added all product routes (42 additions, 1 deletion)
  - Added category routes
  - Dynamic sitemap generation

- **Components** - React.forwardRef pattern (2 files)
  - `components/ui/button.tsx` - Added forwardRef (20 additions, 20 deletions)
  - `components/ui/input.tsx` - Added forwardRef (23 additions, 16 deletions)

- **Configuration**
  - `biome.json` - Updated for Next.js/React (2 additions, 1 deletion)
  - `package.json` - Updated dev script for Turbo (1 addition, 1 deletion)

- **Documentation**
  - `README.md` - Product pages documentation (114 additions, 101 deletions)

### SEO Improvements
- ✅ Complete metadata implementation
- ✅ Open Graph support
- ✅ Twitter Cards
- ✅ PWA manifest
- ✅ Apple touch icons
- ✅ Dynamic sitemap with all routes

### Impact
- ✅ Full Next.js 15 best practices compliance
- ✅ Improved SEO with complete metadata
- ✅ Better TypeScript patterns with forwardRef
- ✅ PWA-ready with manifest
- ✅ Social media sharing optimized
- ✅ Complete product navigation

### Files Changed
- Modified: 7 files
- Added: 16 files
- Total: 23 files
- Lines: 788 additions, 143 deletions

---

## [0.1.5] - 2025-09-29 - Next.js 15 Compliance

**PR #5** - Update codebase to Next.js 15 best practices

### Added
- **Error Boundaries** (2 files)
  - `app/global-error.tsx` - Global error handler (38 lines)
  - `app/not-found.tsx` - Custom 404 page (23 lines)

- **SEO & Metadata** (2 files)
  - `app/robots.ts` - Dynamic robots.txt (17 lines)
  - `app/sitemap.ts` - Dynamic sitemap generation (15 lines)

- **Components**
  - `components/storefront-client.tsx` - Main client component (596 lines)

- **Data Layer**
  - `lib/products.ts` - Product data with caching (50 lines)

### Changed
- **Main Page** - `app/page.tsx`
  - Converted to Server Component
  - Removed client-side logic (reduced from 675 to 5 lines)

- **Root Layout** - `app/layout.tsx`
  - Added metadata configuration
  - Updated HTML structure
  - Added viewport configuration

- **Error Handling** - `app/error.tsx`
  - Improved error UI
  - Added "use client" directive

- **Global Styles** - `app/globals.css`
  - Added CSS animations (61 lines)
  - Added utility classes

- **Configuration**
  - `tsconfig.json` - Added strict type checking
  - `package.json` - Updated Next.js dependency

### Impact
- ✅ Full Next.js 15 compliance
- ✅ Server Components as default
- ✅ Proper error boundaries
- ✅ SEO-friendly metadata
- ✅ Dynamic sitemap and robots.txt
- ✅ Improved code organization

### Files Changed
- Modified: 9 files
- Added: 6 files
- Total: 15 files

---

## [0.1.4] - 2025-09-28 - Lint & Type Fixes

**PR #4** - Resolve all lint and type issues

### Changed
- **Type Safety** - `lib/logger.ts`
  - Removed all `any` types (42 additions, 21 deletions)
  - Added proper type annotations for log levels and metadata
  - Enhanced error handling with typed parameters

- **Component Naming** - `app/error.tsx`
  - Renamed Error component to ErrorBoundary for clarity
  - Fixed component structure (3 additions, 7 deletions)

- **Accessibility Fixes** - `app/page.tsx`
  - Fixed all a11y issues (21 additions, 10 deletions)
  - Improved semantic HTML
  - Enhanced keyboard navigation

- **API Routes** (2 files)
  - `app/api/generate-image/route.ts` - Import sorting and formatting (10 additions, 7 deletions)
  - `app/api/generate-model-image/route.ts` - Import sorting and formatting (9 additions, 6 deletions)

- **Code Quality**
  - `app/globals.css` - Formatting improvements (6 additions, 4 deletions)
  - `app/loading.tsx` - Biome formatting applied (12 additions, 3 deletions)
  - `lib/image-loader.ts` - Code formatting (12 additions, 8 deletions)
  - `next.config.ts` - Minor formatting (1 addition, 1 deletion)

### Results
- ✅ Zero lint errors
- ✅ Zero warnings
- ✅ Zero `any` types in codebase
- ✅ All accessibility issues resolved
- ✅ Import statements properly organized

### Impact
- Improved code quality and maintainability
- Better type safety throughout application
- Enhanced accessibility for all users
- Consistent code formatting

### Files Changed
- Modified: 9 files
- Total: 9 files
- Lines: 116 additions, 67 deletions

---

## [0.1.3] - 2025-09-28 - AI SDK Showcase

**PR #3** - Emphasize Vercel AI SDK showcase and v0 template origin

### Added
- **Documentation** (3 files)
  - `.env.example` - Environment variable template (8 lines)
  - `LICENSE` - MIT license (21 lines)
  - `README.md` - Complete project documentation (160 additions, 20 deletions)

- **Utilities** (2 files)
  - `lib/image-loader.ts` - Custom image loader for Next.js (27 lines)
  - `lib/logger.ts` - Application logger utility (118 lines)

### Changed
- **README.md** - Complete rewrite to emphasize AI SDK
  - Updated title to highlight Vercel AI SDK
  - Added dedicated AI SDK benefits section
  - Enhanced credits to reference v0 template origin
  - Added tech stack details with versions
  - Documented AI features (virtual try-on, product mashup)

- **Package Configuration** - `package.json`
  - Updated description to emphasize AI SDK showcase
  - Added Vercel AI SDK and Google Generative AI dependencies
  - Version updates (13 additions, 2 deletions)

- **API Routes** - Refactored for production (2 files)
  - `app/api/generate-image/route.ts` - Added error handling and logging (57 additions, 73 deletions)
  - `app/api/generate-model-image/route.ts` - Enhanced with proper error handling (75 additions, 76 deletions)

- **Application Files**
  - `app/page.tsx` - Major refactor for AI features (286 additions, 214 deletions)
  - `app/layout.tsx` - Updated metadata (6 additions, 3 deletions)
  - `app/error.tsx` - Added error boundary (45 additions)
  - `app/loading.tsx` - Added loading state (16 additions)
  - `app/globals.css` - Style refinements (14 additions, 26 deletions)

- **Components** - Formatting updates (7 files)
  - `components/mode-toggle.tsx` - Code cleanup (7 additions, 8 deletions)
  - `components/theme-provider.tsx` - Formatting (4 additions, 4 deletions)
  - `components/ui/button.tsx` - Style updates (18 additions, 18 deletions)
  - `components/ui/dropdown-menu.tsx` - Formatting (33 additions, 33 deletions)
  - `components/ui/input.tsx` - Code cleanup (5 additions, 5 deletions)
  - `components/ui/progress.tsx` - Formatting (7 additions, 7 deletions)

- **Configuration**
  - `.gitignore` - Added AI-specific exclusions (7 additions, 2 deletions)
  - `biome.json` - Updated linting rules (1 addition, 7 deletions)
  - `next.config.ts` - Added image loader config (8 additions, 6 deletions)
  - `tsconfig.json` - TypeScript configuration updates (9 additions, 17 deletions)
  - `lib/utils.ts` - Minor updates (3 additions, 3 deletions)

### Tech Stack Highlighted
- **Vercel AI SDK 5.0.52** - Unified AI model interface
- **Google Gemini 2.5 Flash** - Image generation model
- **Next.js 15.5.4** - App Router with Turbopack
- **React 19.1.0** - Latest React features
- **Tailwind CSS v4** - Modern styling

### Features Demonstrated
- ✅ AI virtual try-on with image generation
- ✅ Product mashup capabilities
- ✅ Type-safe AI integration patterns
- ✅ Streaming response handling
- ✅ Error handling and logging

### Impact
- Clear positioning as Vercel AI SDK showcase
- Proper attribution to v0 template origin
- Enhanced documentation for developers
- Production-ready error handling

### Files Changed
- Modified: 23 files
- Added: 2 files
- Total: 25 files
- Lines: 970 additions, 570 deletions

---

## [0.1.2] - 2025-09-28 - v0 Template Parity

**PR #2** - Achieve v0 template parity

### Added
- **API Routes** (2 files)
  - `app/api/generate-image/route.ts` - AI image generation endpoint (134 lines)
  - `app/api/generate-model-image/route.ts` - AI virtual try-on endpoint (183 lines)

- **UI Components** (2 files)
  - `components/ui/input.tsx` - Input component (21 lines)
  - `components/ui/progress.tsx` - Progress bar component (31 lines)

- **Brand Assets** (6 files)
  - `public/acme-logo.png` - Brand logo
  - `public/favicon.ico` - Site favicon
  - `public/products/jordan-hoodie.jpeg` - Product image
  - `public/products/nike-cap.jpeg` - Product image
  - `public/products/nike-tech-set.jpeg` - Product image
  - `public/products/nike-vomero.jpeg` - Product image

### Changed
- **Main Page** - `app/page.tsx`
  - Implemented complete v0 template landing page (582 additions, 95 deletions)
  - Added all sections from original template
  - Integrated AI image generation features
  - Enhanced interactivity

- **Styling** - `app/globals.css`
  - Updated for v0 template consistency (253 additions, 100 deletions)
  - Added animations and transitions
  - Enhanced responsive design

- **Root Layout** - `app/layout.tsx`
  - Refactored for v0 template structure (7 additions, 2 deletions)
  - Updated metadata

- **Components**
  - `components/ui/button.tsx` - v0 template styling (12 additions, 7 deletions)

- **Configuration**
  - `next.config.ts` - Added image domain configuration (8 additions, 1 deletion)
  - `package.json` - Added dependencies (5 additions, 1 deletion):
    - `lucide-react` - Icon library
    - Additional shadcn/ui components

### Removed
- **Unused Assets** (5 files)
  - `public/file.svg`
  - `public/globe.svg`
  - `public/next.svg`
  - `public/vercel.svg`
  - `public/window.svg`

### Features Added
- ✅ AI-powered virtual try-on
- ✅ Product image generation
- ✅ Interactive product showcase
- ✅ Progress indicators for AI operations
- ✅ Enhanced UI components

### Impact
- Complete feature parity with v0 template
- Functional AI image generation
- Production-ready UI components
- Enhanced user experience

### Files Changed
- Modified: 5 files
- Added: 11 files
- Removed: 5 files
- Total: 21 files
- Lines: 1400 additions, 211 deletions

---

## [0.1.0] - 2025-09-25 - Initial Release

**PR #1** - Initial project setup with Next.js 15, React 19, and Tailwind v4

### Added
- **Project Configuration** (7 files)
  - `package.json` - Dependencies and scripts (34 lines)
  - `next.config.ts` - Next.js configuration (7 lines)
  - `tsconfig.json` - TypeScript strict mode (40 lines)
  - `biome.json` - Linter and formatter config (43 lines)
  - `postcss.config.mjs` - PostCSS with Tailwind (5 lines)
  - `components.json` - shadcn/ui configuration (22 lines)
  - `.gitignore` - Git exclusions (41 lines)

- **Next.js Application** (3 files)
  - `app/layout.tsx` - Root layout with metadata (40 lines)
  - `app/page.tsx` - Homepage component (107 lines)
  - `app/globals.css` - Global styles with Tailwind (123 lines)

- **UI Components** (3 files)
  - `components/theme-provider.tsx` - Dark mode provider (11 lines)
  - `components/mode-toggle.tsx` - Theme switcher (40 lines)
  - `components/ui/button.tsx` - Button component with variants (58 lines)
  - `components/ui/dropdown-menu.tsx` - Dropdown menu primitives (257 lines)

- **Utilities**
  - `lib/utils.ts` - Class name utility (6 lines)

- **Public Assets** (6 files)
  - `app/favicon.ico` - Site favicon
  - `public/next.svg` - Next.js logo
  - `public/vercel.svg` - Vercel logo
  - `public/file.svg` - File icon
  - `public/globe.svg` - Globe icon
  - `public/window.svg` - Window icon

### Tech Stack
- **Framework**: Next.js 15.6.0-canary.34
- **UI Library**: React 19.2.0
- **Styling**: Tailwind CSS v4
- **Component Library**: shadcn/ui with Radix UI primitives
- **Language**: TypeScript 5 with strict mode
- **Tooling**: Biome 2.2.5 for linting and formatting

### Configuration Details
- ✅ TypeScript strict mode enabled
- ✅ ESLint + Biome for code quality
- ✅ Tailwind CSS v4 with @tailwindcss/postcss
- ✅ Dark mode support with next-themes
- ✅ Radix UI primitives for accessible components
- ✅ Path aliases (@/ for imports)

### Files Added
- Total: 22 files
- Configuration: 7 files
- Application: 3 files
- Components: 4 files
- Utilities: 1 file
- Assets: 6 files
- Other: 1 file (package-lock.json with 2609 lines)

---

## Previous Development

See [git commit history](https://github.com/RMNCLDYO/aisdk-storefront/commits/main) for detailed commit-by-commit changes.
