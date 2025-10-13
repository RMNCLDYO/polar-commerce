/**
 * Advanced Convex Patterns - Example Usage
 *
 * This file demonstrates how to use all the advanced features:
 * - Model layer for business logic
 * - Row-Level Security (RLS)
 * - Relationship helpers
 * - Action retry wrappers
 * - CRUD utilities
 * - Zod middleware
 *
 * Use these patterns in your own queries, mutations, and actions.
 */

import { v } from 'convex/values';
import { z } from 'zod';
import { query, mutation, action } from '../_generated/server';

// Import utilities
import { todoCRUD } from '../lib/crud';
import { getCartWithItems } from '../lib/relationships';
import { withPolarRetry } from '../lib/retries';
import { rlsQuery, secureQuery } from '../lib/rlsWrappers';
import { zodQuery, zodMutation, commonSchemas } from '../lib/zodMiddleware';

// Import models
import * as CartModel from '../model/cart';
import * as CatalogModel from '../model/catalog';

// ============================================
// EXAMPLE 1: Model Layer Pattern
// ============================================

/**
 * Query using model layer
 * API function is a thin wrapper around business logic
 */
export const getProductsAdvanced = query({
  args: {
    category: v.optional(v.string()),
    sort: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Business logic is in the model
    const products = await CatalogModel.getActiveProducts(ctx, {
      category: args.category,
    });

    // Apply sorting (also in model)
    const sorted = CatalogModel.sortProducts(
      products,
      args.sort as any,
    );

    // Format for API (model helper)
    return sorted.map(CatalogModel.formatProduct);
  },
});

// ============================================
// EXAMPLE 2: Row-Level Security Pattern
// ============================================

/**
 * Query with automatic RLS filtering
 * Only returns carts the user can access
 */
export const getMyCartSecure = rlsQuery({
  args: {
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    // Find cart using model
    const cart = await CartModel.findCart(ctx, userId, args.sessionId);
    if (!cart) {return null;}

    // RLS automatically filters the result based on ownership
    return await secureQuery(ctx, 'carts', [cart]);
  },
});

// ============================================
// EXAMPLE 3: Relationship Helpers Pattern
// ============================================

/**
 * Efficiently fetch cart with all related data
 */
export const getCartWithDetails = query({
  args: {
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    const cart = await CartModel.findCart(ctx, userId, args.sessionId);
    if (!cart) {return null;}

    // Use relationship helper for efficient batch fetching
    return await getCartWithItems(ctx, cart._id);
  },
});

// ============================================
// EXAMPLE 4: Action Retry Pattern
// ============================================

/**
 * Action with automatic retry logic for external API calls
 */
export const createCheckoutWithRetry = action({
  args: {
    sessionId: v.optional(v.string()),
    successUrl: v.string(),
  },
  handler: async (_ctx, args) => {
    const { Polar } = await import('@polar-sh/sdk');

    const polarClient = new Polar({
      accessToken: process.env.POLAR_ORGANIZATION_TOKEN as string,
      server: (process.env.POLAR_SERVER as 'sandbox' | 'production') || 'sandbox',
    });

    // Wrap Polar API call with retry logic and circuit breaker
    const checkout = await withPolarRetry(
      async () => {
        return await polarClient.checkouts.create({
          products: ['product_123'],
          successUrl: args.successUrl,
        });
      },
      { maxRetries: 3 }
    );

    return {
      checkoutId: checkout.id,
      checkoutUrl: checkout.url,
    };
  },
});

// ============================================
// EXAMPLE 5: CRUD Utilities Pattern
// ============================================

/**
 * Using CRUD utilities for common operations
 */
export const createTodo = mutation({
  args: {
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {throw new Error('Not authenticated');}

    // Use CRUD utility with automatic RLS and timestamps
    return await todoCRUD.create(ctx, {
      text: args.text,
      userId: identity.subject,
      completed: false,
    });
  },
});

export const getTodos = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {return [];}

    // CRUD utility automatically applies RLS filtering
    return await todoCRUD.list(
      ctx,
      (q) => q.eq(q.field('userId'), identity.subject)
    );
  },
});

export const updateTodo = mutation({
  args: {
    id: v.id('demoTodos'),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    // CRUD utility checks permissions automatically
    await todoCRUD.update(ctx, args.id, {
      completed: args.completed,
    });
  },
});

export const deleteTodo = mutation({
  args: {
    id: v.id('demoTodos'),
  },
  handler: async (ctx, args) => {
    // CRUD utility checks permissions automatically
    await todoCRUD.delete(ctx, args.id);
  },
});

// ============================================
// EXAMPLE 6: Zod Middleware Pattern
// ============================================

/**
 * Query with Zod validation for better error messages
 */
const getProductZodSchema = z.object({
  id: z.string().min(1, 'Product ID is required'),
  includeInactive: z.boolean().optional().default(false),
});

export const getProductWithZod = zodQuery({
  args: getProductZodSchema,
  handler: async (ctx, args) => {
    // args is fully typed and validated by Zod
    // includeInactive has default value applied
    const product = await ctx.db.get(args.id as any);

    if (!product) {return null;}
    if (!args.includeInactive && !product.isActive) {return null;}

    return CatalogModel.formatProduct(product);
  },
});

/**
 * Mutation with complex Zod validation
 */
const addToCartZodSchema = z.object({
  catalogId: commonSchemas.productId,
  quantity: commonSchemas.quantity, // Ensures 1-999
  sessionId: z.string().optional(),
});

export const addToCartWithZod = zodMutation({
  args: addToCartZodSchema,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    // Get or create cart using model
    const cart = await CartModel.getOrCreateCart(ctx, userId, args.sessionId);
    if (!cart) {throw new Error('Failed to create cart');}

    // Add item using model
    await CartModel.addItemToCart(
      ctx,
      cart._id,
      args.catalogId as any,
      args.quantity,
    );

    return { success: true };
  },
});

// ============================================
// EXAMPLE 7: Combining Multiple Patterns
// ============================================

/**
 * Advanced mutation combining:
 * - Zod validation
 * - Model layer
 * - Relationship helpers
 * - RLS checks
 */
const checkoutSchema = z.object({
  sessionId: z.string().optional(),
  discountCode: commonSchemas.discountCode.optional(),
  customerEmail: commonSchemas.email.optional(),
});

export const advancedCheckout = zodMutation({
  args: checkoutSchema,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    // 1. Find cart using model
    const cart = await CartModel.findCart(ctx, userId, args.sessionId);
    if (!cart) {throw new Error('Cart not found');}

    // 2. Get cart items using relationship helper
    const cartData = await getCartWithItems(ctx, cart._id);
    if (!cartData || cartData.items.length === 0) {throw new Error('Cart is empty');}

    // 3. Validate all items have products
    const validItems = cartData.items.filter((item: any) => item.product && item.product.isActive);
    if (validItems.length !== cartData.items.length) {
      throw new Error('Some items are no longer available');
    }

    // 4. Calculate totals using model
    const { subtotal } = CartModel.calculateCartTotals(validItems);

    // 5. Apply discount if provided
    // (This would call a discount service)

    return {
      subtotal,
      itemCount: validItems.length,
      discountApplied: !!args.discountCode,
    };
  },
});

// ============================================
// EXAMPLE 8: Scheduled Function with Model
// ============================================

/**
 * Cron job that uses model layer and batch operations
 */
export const cleanupExpiredCarts = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    // Find old carts
    const oldCarts = await ctx.db
      .query('carts')
      .filter((q) => q.lt(q.field('updatedAt'), sevenDaysAgo))
      .collect();

    let cleaned = 0;

    for (const cart of oldCarts) {
      // Use model to clear cart items
      await CartModel.clearCartItems(ctx, cart._id);
      cleaned++;
    }

    return { cleaned };
  },
});
