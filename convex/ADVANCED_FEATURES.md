# Advanced Convex Features Guide

This document explains all the advanced Convex patterns and utilities implemented in this codebase, following 2025 best practices.

## Table of Contents

1. [Model Layer](#model-layer)
2. [Row-Level Security (RLS)](#row-level-security)
3. [Relationship Helpers](#relationship-helpers)
4. [Action Retry Wrappers](#action-retry-wrappers)
5. [CRUD Utilities](#crud-utilities)
6. [Zod Middleware](#zod-middleware)
7. [Scheduled Cleanup](#scheduled-cleanup)
8. [Performance Optimizations](#performance-optimizations)

---

## Model Layer

**Location**: `convex/model/`

### What is it?

The model layer separates business logic from API definitions. Your query/mutation/action functions should be thin wrappers that call model functions.

### Why use it?

- **Reusability**: Share logic across multiple API functions
- **Testability**: Easier to test business logic independently
- **Maintainability**: Changes to business logic don't affect API surface
- **Best Practice**: Recommended by Convex official docs

### Example

```typescript
// convex/model/cart.ts
export async function addItemToCart(
  ctx: MutationCtx,
  cartId: Id<'carts'>,
  catalogId: Id<'catalog'>,
  quantity: number,
) {
  // All business logic here
  const product = await ctx.db.get(catalogId);
  validateQuantity(quantity, product.inventory_qty, product.name);
  // ... more logic
}

// convex/cart/cart.ts (thin API wrapper)
export const addToCart = mutation({
  args: { catalogId: v.id('catalog'), quantity: v.number() },
  handler: async (ctx, args) => {
    const cart = await getOrCreateCart(ctx, ...);
    await CartModel.addItemToCart(ctx, cart._id, args.catalogId, args.quantity);
    return { success: true };
  }
});
```

### Available Models

- `model/cart.ts` - Cart operations
- `model/catalog.ts` - Product management
- `model/checkout.ts` - Order processing
- `model/wishlist.ts` - Wishlist operations

---

## Row-Level Security (RLS)

**Location**: `convex/lib/rls.ts`, `convex/lib/rlsWrappers.ts`

### What is it?

Fine-grained access control that checks permissions at the document level. Rules are defined per table and operation type (read, write, modify).

### Why use it?

- **Security**: Automatically enforces who can access what
- **Centralized**: All access rules in one place
- **Type-safe**: TypeScript ensures rules are correct
- **Best Practice**: Industry standard for multi-tenant apps

### Example

```typescript
// Define rules in rls.ts
export async function rlsRules(ctx) {
  return {
    carts: {
      read: async (cart) => {
        // User can only read their own cart
        return userId === cart.userId;
      },
      modify: async (cart) => {
        // User can only modify their own cart
        return userId === cart.userId;
      }
    }
  };
}

// Use RLS wrappers in your queries
export const getMyCart = rlsQuery({
  args: { sessionId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // RLS automatically filters results
    return await ctx.db.query('carts').first();
  }
});
```

### RLS Helpers

- `canRead(ctx, table, doc)` - Check if user can read a document
- `canWrite(ctx, table, doc)` - Check if user can create a document
- `canModify(ctx, table, doc)` - Check if user can update/delete a document
- `filterReadable(ctx, table, docs)` - Filter array to only readable docs
- `secureInsert()`, `secureUpdate()`, `secureDelete()` - CRUD with RLS

---

## Relationship Helpers

**Location**: `convex/lib/relationships.ts`

### What is it?

Utilities for efficiently fetching related documents. Based on `convex-helpers` patterns.

### Why use it?

- **Performance**: Batch fetches instead of N+1 queries
- **DRY**: Reusable relationship patterns
- **Type-safe**: Maintains TypeScript types through relationships

### Example

```typescript
import { getAll } from 'convex-helpers/server/relationships';
import { getCartWithItems } from '../lib/relationships';

// Instead of this (N+1 queries):
const items = await ctx.db.query('cartItems').collect();
for (const item of items) {
  const product = await ctx.db.get(item.catalogId); // N queries!
}

// Do this (1 + 1 queries):
const items = await ctx.db.query('cartItems').collect();
const products = await getAll(ctx.db, items.map(i => i.catalogId)); // 1 batch query!

// Or even better, use the helper:
const { cart, items } = await getCartWithItems(ctx, cartId);
```

### Available Helpers

- `getCartWithItems(ctx, cartId)` - Cart + items + products
- `getWishlistWithItems(ctx, wishlistId)` - Wishlist + items + products
- `batchGetProducts(ctx, productIds)` - Batch fetch products
- `getRelatedProducts(ctx, productId, limit)` - "You might also like"
- `isInCart(ctx, userId, sessionId, productId)` - Quick check
- `isInWishlist(ctx, userId, sessionId, productId)` - Quick check

---

## Action Retry Wrappers

**Location**: `convex/lib/retries.ts`

### What is it?

Automatic retry logic for actions that call external APIs (like Polar), with exponential backoff and circuit breakers.

### Why use it?

- **Reliability**: Handle transient failures automatically
- **Best Practice**: Essential for production external API calls
- **Circuit Breaker**: Prevents cascading failures

### Example

```typescript
import { withRetry, withPolarRetry, polarCircuitBreaker } from '../lib/retries';

// Basic retry
const result = await withRetry(
  async () => await externalAPI.call(),
  { maxRetries: 3, initialDelayMs: 1000 }
);

// Polar-specific retry (includes circuit breaker)
const checkout = await withPolarRetry(
  async () => await polarClient.checkouts.create(data),
  { maxRetries: 3 }
);

// Circuit breaker prevents too many failures
// After 5 failures in 1 minute, circuit opens and rejects immediately
```

### Configuration

```typescript
{
  maxRetries: 3,              // Max retry attempts
  initialDelayMs: 1000,       // First retry delay
  maxDelayMs: 10000,          // Max delay cap
  backoffMultiplier: 2,       // Exponential factor
  retryableErrors: [          // Which errors to retry
    'ECONNREFUSED',
    'ETIMEDOUT',
    '429', '500', '502', '503', '504'
  ]
}
```

---

## CRUD Utilities

**Location**: `convex/lib/crud.ts`

### What is it?

Generic create, read, update, delete operations with automatic RLS, timestamps, and soft delete support.

### Why use it?

- **DRY**: Don't repeat CRUD boilerplate
- **Consistent**: Same patterns across all tables
- **Feature-rich**: RLS, timestamps, soft delete built-in

### Example

```typescript
import { createCRUD } from '../lib/crud';

// Create CRUD instance for a table
const todoCRUD = createCRUD({
  table: 'demoTodos',
  enableRLS: true,
  enableSoftDelete: false,
});

// Use CRUD operations
export const createTodo = mutation({
  handler: async (ctx, args) => {
    return await todoCRUD.create(ctx, {
      text: args.text,
      userId: userId,
      completed: false,
    });
  }
});

export const getTodo = query({
  handler: async (ctx, args) => {
    return await todoCRUD.read(ctx, args.id);
  }
});

export const updateTodo = mutation({
  handler: async (ctx, args) => {
    await todoCRUD.update(ctx, args.id, { completed: true });
  }
});

export const deleteTodo = mutation({
  handler: async (ctx, args) => {
    await todoCRUD.delete(ctx, args.id);
  }
});
```

### CRUD Methods

- `create(ctx, data)` - Create with timestamps + RLS check
- `read(ctx, id)` - Read with RLS check + soft delete filter
- `list(ctx, filter?, limit?)` - List with RLS filtering
- `update(ctx, id, updates)` - Update with RLS check
- `delete(ctx, id)` - Delete (soft or hard) with RLS check
- `permanentDelete(ctx, id)` - Hard delete soft-deleted docs
- `restore(ctx, id)` - Restore soft-deleted docs
- `count(ctx, filter?)` - Count matching docs
- `exists(ctx, id)` - Check if doc exists

---

## Zod Middleware

**Location**: `convex/lib/zodMiddleware.ts`

### What is it?

Enhanced validation using Zod schemas with better error messages and more flexible validation rules than Convex's built-in validators.

### Why use it?

- **Better Errors**: Zod provides detailed validation errors
- **More Validators**: Email, URL, regex, custom validation
- **Transformations**: Apply defaults, parse dates, etc.
- **Type Inference**: Full TypeScript support

### Example

```typescript
import { zodQuery, zodMutation, commonSchemas } from '../lib/zodMiddleware';
import { z } from 'zod';

// Define schema
const addToCartSchema = z.object({
  catalogId: commonSchemas.productId,
  quantity: commonSchemas.quantity, // Ensures 1-999
  sessionId: z.string().optional(),
  notes: z.string().max(500).optional().default(''),
});

// Use in mutation
export const addToCart = zodMutation({
  args: addToCartSchema,
  handler: async (ctx, args) => {
    // args.quantity is guaranteed to be 1-999
    // args.notes has default value '' if not provided
    // Zod gives helpful error if validation fails
  }
});
```

### Common Schemas

All available in `commonSchemas`:

- `email` - Valid email address
- `url` - Valid URL
- `positiveInt` - Positive integer
- `priceInCents` - Price (positive, max $1M)
- `quantity` - 1-999
- `discountCode` - Uppercase alphanumeric, 3-20 chars
- `phone` - International phone format
- `postalCode` - International postal code
- `countryCode` - ISO 3166-1 alpha-2
- `currencyCode` - USD, EUR, GBP, etc.
- `sortOption` - price-asc, name-desc, etc.
- `trialInterval` - day, week, month, year

### Schema Builders

- `productFilter()` - Complete product filtering schema
- `cartItem()` - Cart item with validation
- `address()` - Full address with country
- `checkout()` - Complete checkout schema

---

## Scheduled Cleanup

**Location**: `convex/utils/crons.ts`, `convex/cart/cleanup.ts`, `convex/catalog/cleanup.ts`

### What is it?

Automated database maintenance tasks that run on a schedule to keep your database clean and performant.

### Active Cron Jobs

1. **Daily at 2 AM UTC**: Clean expired guest carts
   - Removes carts past their expiration date
   - Deletes all associated cart items

2. **Weekly (Monday 3 AM)**: Clean abandoned carts
   - Removes empty carts not updated in 7+ days
   - Helps keep database size down

3. **Weekly (Monday 4 AM)**: Archive old bundles
   - Marks bundle products as inactive after 30 days
   - Preserves order history while cleaning catalog

### Add Your Own

```typescript
// In utils/crons.ts
crons.daily(
  'my cleanup job',
  { hourUTC: 5, minuteUTC: 0 },
  internal.myModule.myCleanupFunction
);
```

---

## Performance Optimizations

### Index Usage

✅ **Now**: All queries use indexes
```typescript
.query('carts')
.withIndex('userId', q => q.eq('userId', userId))
```

❌ **Before**: Slow full-table scans
```typescript
.query('carts')
.filter(q => q.eq(q.field('userId'), userId))
```

### Return Value Validation

All functions now have `returns` validators for:
- Type safety
- Runtime validation
- Better error messages
- Security (prevents data leaks)

### Batch Operations

Use relationship helpers instead of N+1 queries:

```typescript
// Bad: N+1 queries
for (const item of items) {
  const product = await ctx.db.get(item.catalogId);
}

// Good: 1 batch query
const products = await getAll(ctx.db, items.map(i => i.catalogId));
```

---

## Usage Examples

See `convex/examples/advancedPatterns.ts` for complete working examples of:

1. Model layer pattern
2. RLS queries
3. Relationship helpers
4. Action retries
5. CRUD utilities
6. Zod validation
7. Combining multiple patterns
8. Scheduled functions

---

## Migration Guide

### From Old Pattern

```typescript
// OLD: Everything in one file
export const addToCart = mutation({
  args: { catalogId: v.id('catalog'), quantity: v.number() },
  handler: async (ctx, args) => {
    // 50 lines of business logic here...
    const product = await ctx.db.get(args.catalogId);
    // validation...
    // inventory checks...
    // cart logic...
  }
});
```

### To New Pattern

```typescript
// NEW: Separated concerns

// convex/model/cart.ts - Business logic
export async function addItemToCart(ctx, cartId, catalogId, quantity) {
  // All business logic here
}

// convex/cart/cart.ts - Thin API wrapper
export const addToCart = mutation({
  args: { catalogId: v.id('catalog'), quantity: v.number() },
  returns: vSuccessResponse,
  handler: async (ctx, args) => {
    const cart = await CartModel.getOrCreateCart(ctx, ...);
    await CartModel.addItemToCart(ctx, cart._id, args.catalogId, args.quantity);
    return { success: true };
  }
});
```

---

## Best Practices Summary

1. ✅ Use model layer for business logic
2. ✅ Apply RLS to user-facing queries
3. ✅ Use relationship helpers for batch fetches
4. ✅ Wrap external API calls with retry logic
5. ✅ Use CRUD utilities for common operations
6. ✅ Validate complex inputs with Zod
7. ✅ Add return value validators to all functions
8. ✅ Use indexes, never filter on full table scans
9. ✅ Schedule cleanup jobs for database hygiene
10. ✅ Keep API functions thin, logic in models

---

## Resources

- [Convex Best Practices](https://docs.convex.dev/understanding/best-practices/)
- [convex-helpers GitHub](https://github.com/get-convex/convex-helpers)
- [Row-Level Security](https://stack.convex.dev/row-level-security)
- [Zod Documentation](https://zod.dev/)
- [Relationship Helpers](https://stack.convex.dev/functional-relationships-helpers)
