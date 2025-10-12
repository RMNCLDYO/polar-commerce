# AISDK Storefront - Convex Backend Architecture

## Overview

This Convex backend powers an e-commerce storefront with subscription billing, combining product catalog management with integrated payment processing through Polar.

## Table of Contents

- [Schema Organization](#schema-organization)
- [Components vs App Tables](#components-vs-app-tables)
- [Data Flow](#data-flow)
- [Table Reference](#table-reference)
- [Key Concepts](#key-concepts)

## Schema Organization

### Components (External Dependencies)

These are isolated npm packages with their own schemas:

| Component | Purpose | Tables |
|-----------|---------|--------|
| `@convex-dev/better-auth` | User authentication | `betterAuth_*` |
| `@convex-dev/resend` | Email service | `resend_*` |
| `@convex-dev/polar` | Payment & billing | `components.polar.*` |

**Important:** Component tables are **read-only** from your app. You cannot modify their schemas or add custom fields.

### App Tables (Your Domain Logic)

| Table | Purpose | Location |
|-------|---------|----------|
| `catalog` | Product/subscription catalog | `/catalog/` |
| `carts` | Shopping cart sessions | `/cart/` |
| `cartItems` | Cart line items | `/cart/` |
| `orders` | Order history | `/orders/` |
| `demoTodos` | Demo CRUD feature | `/demos/` |

## Components vs App Tables

### Why Not Use Polar's Products Table?

The Polar component's `products` table is designed for subscription billing and lacks e-commerce fields:

**Polar's schema:**
```typescript
products: {
  name, description, prices, medias,
  recurringInterval, isRecurring, isArchived
  // ❌ No inventory tracking
  // ❌ No category filtering
  // ❌ No stock management
}
```

**Our catalog schema:**
```typescript
catalog: {
  // Polar fields
  name, description, price, polarProductId,
  polarImageUrl, polarImageId,

  // E-commerce additions
  category,        // "MEN", "WOMEN", "ACCESSORIES", "subscription"
  inventory_qty,   // Track available stock
  inStock,         // Quick availability check
  imageUrl,        // Fallback image
  isActive,        // Soft delete
}
```

## Data Flow

### Seeding (Initial Setup)

```
┌─────────────────────────────┐
│ data/products.json          │  Physical products (Nike shoes, etc.)
│ data/subscriptions.json     │  Subscription plans (Starter, Premium)
└─────────┬───────────────────┘
          │
          ↓
┌─────────────────────────────┐
│ scripts/seedAll.ts          │  Orchestrates seeding
│ ├─ seedProducts.ts          │  Seeds physical products
│ └─ seedSubscriptions.ts     │  Seeds subscriptions
└─────────┬───────────────────┘
          │
          ↓
┌─────────────────────────────┐
│ Polar API                   │  Source of truth for billing
└─────────┬───────────────────┘
          │
          ↓ (webhooks)
┌─────────────────────────────┐
│ components.polar.products   │  Polar's internal table
└─────────┬───────────────────┘
          │
          ↓ (sync + augment)
┌─────────────────────────────┐
│ catalog table (app)         │  Adds inventory, categories, etc.
└─────────────────────────────┘
```

### Runtime (Customer Flow)

```
┌─────────────────────────────┐
│ Customer browses store      │
└─────────┬───────────────────┘
          │
          ↓ (queries catalog)
┌─────────────────────────────┐
│ catalog table               │  Filter by category, search, etc.
└─────────┬───────────────────┘
          │
          ↓ (adds to cart)
┌─────────────────────────────┐
│ carts + cartItems           │  References catalog._id
└─────────┬───────────────────┘
          │
          ↓ (checkout)
┌─────────────────────────────┐
│ catalog.polarProductId      │  Used to create Polar checkout
└─────────┬───────────────────┘
          │
          ↓ (payment)
┌─────────────────────────────┐
│ Polar API                   │  Processes payment
└─────────┬───────────────────┘
          │
          ↓ (webhook)
┌─────────────────────────────┐
│ orders table                │  Order history saved
└─────────────────────────────┘
```

## Table Reference

### catalog

**Purpose:** Unified product and subscription catalog with e-commerce features.

**Key Fields:**
- `polarProductId` - Links to Polar for checkout
- `category` - "MEN", "WOMEN", "ACCESSORIES", "subscription"
- `inventory_qty` - Available stock (0 for subscriptions)
- `inStock` - Quick availability flag
- `isActive` - Soft delete flag

**Indexes:**
- `polarProductId` - Fast lookups during checkout
- `category` - Filter products by type
- `isActive` - Show only active products
- `inStock` - Filter available items

### carts

**Purpose:** Shopping cart sessions for both authenticated and guest users.

**Key Fields:**
- `userId` - Authenticated user (optional)
- `sessionId` - Guest identifier (optional)
- `lastCheckoutId` - Most recent Polar checkout
- `lastCheckoutUrl` - Link to checkout page
- `expiresAt` - Cleanup abandoned carts

**Indexes:**
- `userId` - Find user's cart
- `sessionId` - Find guest cart
- `expiresAt` - Cleanup cron job

### cartItems

**Purpose:** Line items in shopping carts.

**Key Fields:**
- `cartId` - Parent cart reference
- `catalogId` - Product reference (changed from productId!)
- `quantity` - Item count
- `price` - Snapshot price when added

**Indexes:**
- `cartId` - Get all items in cart
- `cartId_catalogId` - Check if item already in cart

### orders

**Purpose:** Order history and fulfillment tracking.

**Key Fields:**
- `userId` - Customer (optional for guests)
- `email` - For guest orders and linking
- `checkoutId` - Polar checkout session
- `customerId` - Polar customer ID
- `status` - "succeeded", "failed", "pending", etc.
- `products` - Snapshot of ordered items

**Indexes:**
- `userId` - User's order history
- `email` - Link guest orders
- `checkoutId` - Polar webhook lookups
- `customerId` - Polar customer orders

### demoTodos

**Purpose:** Example CRUD feature for demonstrations.

**Note:** Safe to remove in production if not needed.

## Key Concepts

### 1. Catalog as Single Source of Truth

The `catalog` table is your app's view of all sellable items:
- Physical products with inventory
- Subscription plans without inventory
- Augmented with e-commerce fields Polar doesn't provide

### 2. Polar Product ID Linking

Every catalog item has a `polarProductId` that links it to Polar for:
- Checkout processing
- Payment handling
- Subscription management

### 3. Cart Items Reference Catalog

Changed from `productId` → `catalogId` for clarity:
```typescript
// OLD (confusing)
cartItems: {
  productId: v.id('products')  // Which products table?
}

// NEW (clear)
cartItems: {
  catalogId: v.id('catalog')   // Obviously the catalog table
}
```

### 4. Component Isolation

You **cannot**:
- ❌ Modify component schemas
- ❌ Add fields to component tables
- ❌ Access component tables directly in queries

You **can**:
- ✅ Call component APIs
- ✅ Store component IDs in your tables
- ✅ React to component webhooks

## Directory Structure

```
convex/
├── schema.ts                 # Main schema definition
├── README.md                 # This file
│
├── catalog/                  # Product/subscription catalog
│   ├── catalog.ts           # CRUD operations
│   └── sync.ts              # Polar sync logic
│
├── cart/                     # Shopping cart
│   └── cart.ts              # Cart management
│
├── orders/                   # Order processing
│   ├── sync.ts              # Order syncing
│   ├── webhook.ts           # Polar webhooks
│   └── http.ts              # HTTP handlers
│
├── checkout/                 # Checkout flow
│   ├── checkout.ts          # Checkout logic
│   ├── types.ts             # Type definitions
│   └── http.ts              # HTTP handlers
│
├── demos/                    # Demo features
│   └── demoTodos.ts         # Example CRUD
│
└── polar/                    # Polar component (npm)
    ├── schema.ts            # Component schema (don't edit)
    └── types.ts             # Polar types
```

## Common Operations

### Query Products by Category

```typescript
const products = await ctx.db
  .query('catalog')
  .withIndex('category', (q) => q.eq('category', 'MEN'))
  .filter((q) => q.eq(q.field('isActive'), true))
  .collect();
```

### Add Item to Cart

```typescript
await ctx.db.insert('cartItems', {
  cartId: cart._id,
  catalogId: productId,  // Note: catalogId not productId!
  quantity: 1,
  price: product.price,
  addedAt: Date.now(),
  updatedAt: Date.now(),
});
```

### Link to Polar for Checkout

```typescript
const product = await ctx.db.get(catalogId);
const checkoutUrl = await polar.generateCheckoutLink(ctx, {
  productId: product.polarProductId,  // Use Polar's ID
  // ... other checkout params
});
```

## Migration Notes

### Recent Changes

**Products → Catalog** (camelCase convention):
- Table: `products` → `catalog`
- Directory: `convex/products/` → `convex/catalog/`
- Files: `products.ts` → `catalog.ts`

**CartItems Field**:
- Field: `productId` → `catalogId`
- Index: `cartId_productId` → `cartId_catalogId`

**Todos → DemoTodos**:
- Table: `todos` → `demoTodos`
- Directory: `convex/todos/` → `convex/demos/`
- Files: `todos.ts` → `demoTodos.ts`

## Questions?

- **Why separate catalog from Polar?** → Need inventory, categories, and custom fields
- **Why not use components for store?** → Components are for reusable packages, not core app logic
- **Can I add fields to catalog?** → Yes! It's your app table, fully customizable

## Environment Variables

### Required

- `POLAR_ORGANIZATION_TOKEN` - Your Polar API organization token
- `POLAR_WEBHOOK_SECRET` - Secret for webhook signature verification
- `POLAR_SERVER` - Environment: `'sandbox'` or `'production'`
- `SITE_URL` - Your application's URL (e.g., `https://yourdomain.com`)
- `CONVEX_SITE_URL` - Your Convex deployment URL
- `GITHUB_CLIENT_ID` - GitHub OAuth client ID (for social auth)
- `GITHUB_CLIENT_SECRET` - GitHub OAuth client secret
- `SLACK_CLIENT_ID` - Slack OAuth client ID (optional)
- `SLACK_CLIENT_SECRET` - Slack OAuth client secret (optional)

### Optional

- `NODE_ENV` - `'production'` or `'development'` (affects logging)

## Performance Considerations

### Database Indexes
- Cart queries use indexes on `userId` and `sessionId` - O(log n) performance
- Product queries are cache-friendly via `isActive` index
- Composite indexes on `cartId_catalogId` prevent duplicate items

### Webhook Processing
- All webhook processing is async and non-blocking
- Customer/product/subscription sync happens in background
- Failed webhooks can be replayed from Polar dashboard

### Caching Strategy
- Convex handles query caching automatically
- Product catalog queries are highly cacheable
- Use `isActive` and `inStock` filters for optimal cache hits

## Troubleshooting

### Cart Not Found

**Symptoms:** User's cart appears empty or throws "Cart not found" error

**Solutions:**
1. Check userId/sessionId matches between frontend and backend
2. Verify cart hasn't expired (30 day TTL for guest carts)
3. Ensure proper auth context is passed to queries
4. Check browser local storage for session ID persistence

### Checkout Fails

**Symptoms:** Checkout creation fails or returns error

**Common Causes:**
1. **Missing Polar Product ID** - Verify all products have `polarProductId` linked
2. **Invalid API Key** - Check `POLAR_ORGANIZATION_TOKEN` is valid and not expired
3. **Archived Products** - Ensure products are not archived in Polar dashboard
4. **Inventory Issues** - Check product has `inStock: true` and `inventory_qty > 0`

**Debug Steps:**
```typescript
// Check product has Polar linkage
const product = await ctx.db.get(productId);
console.log(product.polarProductId); // Should not be undefined

// Verify Polar product exists
const polarProduct = await ctx.runQuery(
  components.polar.lib.getProduct,
  { id: product.polarProductId }
);
console.log(polarProduct.isArchived); // Should be false
```

### Webhook Not Firing

**Symptoms:** Changes in Polar not reflected in Convex

**Solutions:**
1. Verify webhook URL in Polar dashboard: `https://your-deployment.convex.site/polar/events`
2. Check `POLAR_WEBHOOK_SECRET` matches between Polar and Convex
3. Ensure webhook events are enabled in Polar:
   - `customer.created`, `customer.updated`, `customer.deleted`
   - `product.created`, `product.updated`
   - `subscription.created`, `subscription.updated`
4. Check Convex logs for webhook signature validation errors

### User Not Synced to Polar

**Symptoms:** User exists in Convex but not in Polar

**Solutions:**
1. Wait for webhook to fire (usually instant, can take up to 60s)
2. Manually sync using: `await ctx.runAction(api.polarCustomer.ensurePolarCustomer, { userId, email })`
3. Check user creation triggers in `convex/auth/auth.ts`
4. Run orphaned customer sync: `await ctx.runAction(internal.auth.sync.syncOrphanedCustomers, {})`

### Type Errors in Development

**Symptoms:** TypeScript errors in Convex functions

**Solutions:**
1. Regenerate Convex types: `npx convex dev` (regenerates `_generated/`)
2. Check `convex/tsconfig.json` is using correct compiler options
3. Verify all `v.*` validators match actual data types
4. Run `tsc -p convex` to check for type errors in isolation

## Security Best Practices

### API Key Management
- ❌ Never commit `.env.local` to git
- ✅ Use environment variables for all secrets
- ✅ Rotate API keys periodically (every 90 days)
- ✅ Use separate keys for sandbox vs production

### CORS Configuration
- ❌ Never use wildcard `*` for `Access-Control-Allow-Origin`
- ✅ Explicitly whitelist your domains in `convex/utils/cors.ts`
- ✅ Use `credentials: 'include'` for authenticated requests
- ✅ Validate origin headers on all HTTP endpoints

### Input Validation
- ✅ Validate all user inputs with `convex/utils/validation.ts`
- ✅ Use Convex validators (`v.*`) for runtime type checking
- ✅ Sanitize email addresses before storage
- ✅ Check inventory quantities are positive integers

## Resources

- [Convex Docs](https://docs.convex.dev)
- [Polar Convex Component](https://github.com/polarsh/polar-convex)
- [Better Auth](https://www.better-auth.com)
- [Next.js 16 Documentation](https://nextjs.org/docs)
