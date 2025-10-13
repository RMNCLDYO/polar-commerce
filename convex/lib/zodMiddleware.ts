/**
 * Zod Middleware for Convex Functions
 *
 * Provides enhanced validation using Zod schemas with better error messages
 * and more flexible validation rules than Convex's built-in validators.
 *
 * Based on: https://stack.convex.dev/wrappers-as-middleware-zod-validation
 */

import { customQuery, customMutation, customAction } from 'convex-helpers/server/customFunctions';
import { z } from 'zod';
import { query, mutation, action } from '../_generated/server';

/**
 * Zod Query Builder
 *
 * Usage:
 *   const getProductSchema = z.object({
 *     id: z.string(),
 *     includeInactive: z.boolean().optional().default(false),
 *   });
 *
 *   export const getProduct = zodQuery({
 *     args: getProductSchema,
 *     handler: async (ctx, args) => {
 *       // args is fully typed from Zod schema
 *       // args.includeInactive has default value applied
 *       return await ctx.db.get(args.id);
 *     }
 *   });
 */
export function zodQuery<TArgs extends z.ZodType, TOutput>(config: {
  args: TArgs;
  handler: (
    ctx: any,
    args: z.infer<TArgs>,
  ) => Promise<TOutput>;
}): any {
  // For custom functions with input, we need to pass args in the customQuery call
  return customQuery(
    query,
    {
      args: {},
      input: async (ctx: any, args: any): Promise<{ ctx: any; args: Record<string, any> }> => {
        // Validate and parse args with Zod
        const parsedArgs = config.args.parse(args);
        return { ctx, args: parsedArgs as Record<string, any> };
      },
    }
  )(config.handler as any);
}

/**
 * Zod Mutation Builder
 *
 * Usage:
 *   const addToCartSchema = z.object({
 *     catalogId: z.string(),
 *     quantity: z.number().int().positive(),
 *     sessionId: z.string().optional(),
 *   });
 *
 *   export const addToCart = zodMutation({
 *     args: addToCartSchema,
 *     handler: async (ctx, args) => {
 *       // Zod ensures quantity is a positive integer
 *       await ctx.db.insert('cartItems', { ... });
 *     }
 *   });
 */
export function zodMutation<TArgs extends z.ZodType, TOutput>(config: {
  args: TArgs;
  handler: (
    ctx: any,
    args: z.infer<TArgs>,
  ) => Promise<TOutput>;
}): any {
  return customMutation(
    mutation,
    {
      args: {},
      input: async (ctx: any, args: any): Promise<{ ctx: any; args: Record<string, any> }> => {
        const parsedArgs = config.args.parse(args);
        return { ctx, args: parsedArgs as Record<string, any> };
      },
    }
  )(config.handler as any);
}

/**
 * Zod Action Builder
 *
 * Usage:
 *   const checkoutSchema = z.object({
 *     sessionId: z.string().optional(),
 *     successUrl: z.string().url(),
 *     customerEmail: z.string().email().optional(),
 *   });
 *
 *   export const createCheckout = zodAction({
 *     args: checkoutSchema,
 *     handler: async (ctx, args) => {
 *       // Zod ensures successUrl is a valid URL
 *       // Zod ensures customerEmail is a valid email if provided
 *       return await polarClient.checkouts.create({ ... });
 *     }
 *   });
 */
export function zodAction<TArgs extends z.ZodType, TOutput>(config: {
  args: TArgs;
  handler: (
    ctx: any,
    args: z.infer<TArgs>,
  ) => Promise<TOutput>;
}): any {
  return customAction(
    action,
    {
      args: {},
      input: async (ctx: any, args: any): Promise<{ ctx: any; args: Record<string, any> }> => {
        const parsedArgs = config.args.parse(args);
        return { ctx, args: parsedArgs as Record<string, any> };
      },
    }
  )(config.handler as any);
}

/**
 * Common Zod schemas for reuse
 */
export const commonSchemas = {
  // Email validation
  email: z.string().email(),

  // URL validation
  url: z.string().url(),

  // Positive integer
  positiveInt: z.number().int().positive(),

  // Non-negative integer
  nonNegativeInt: z.number().int().nonnegative(),

  // Price in cents (positive integer, max $1M)
  priceInCents: z.number().int().positive().max(100000000),

  // Quantity (1-999)
  quantity: z.number().int().positive().max(999),

  // Product ID (non-empty string)
  productId: z.string().min(1),

  // Session ID (UUID format)
  sessionId: z.string().uuid().optional(),

  // ISO date string
  isoDate: z.string().datetime(),

  // Discount code (uppercase, alphanumeric, 3-20 chars)
  discountCode: z
    .string()
    .regex(/^[A-Z0-9]{3,20}$/, 'Discount code must be 3-20 uppercase alphanumeric characters'),

  // Phone number (basic validation)
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),

  // Postal code (flexible international format)
  postalCode: z.string().regex(/^[A-Z0-9\s-]{3,10}$/i, 'Invalid postal code'),

  // Country code (ISO 3166-1 alpha-2)
  countryCode: z.string().length(2).toUpperCase(),

  // Currency code (ISO 4217)
  currencyCode: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']),

  // Pagination
  pagination: z.object({
    offset: z.number().int().nonnegative().default(0),
    limit: z.number().int().positive().max(100).default(20),
  }),

  // Sort options
  sortOption: z.enum([
    'price-asc',
    'price-desc',
    'name-asc',
    'name-desc',
    'newest',
  ]),

  // Trial interval
  trialInterval: z.enum(['day', 'week', 'month', 'year']),
};

/**
 * Schema builders for common patterns
 */
export const schemaBuilders = {
  /**
   * Build a product filter schema
   */
  productFilter: () =>
    z.object({
      category: z.string().optional(),
      search: z.string().optional(),
      minPrice: z.number().positive().optional(),
      maxPrice: z.number().positive().optional(),
      sort: commonSchemas.sortOption.optional(),
      limit: z.number().int().positive().max(100).optional(),
      excludeSubscriptions: z.boolean().optional(),
    }),

  /**
   * Build a cart item schema
   */
  cartItem: () =>
    z.object({
      catalogId: commonSchemas.productId,
      quantity: commonSchemas.quantity,
      sessionId: z.string().optional(),
    }),

  /**
   * Build an address schema
   */
  address: () =>
    z.object({
      line1: z.string().max(100).optional(),
      line2: z.string().max(100).optional(),
      city: z.string().max(50).optional(),
      state: z.string().max(50).optional(),
      postalCode: commonSchemas.postalCode.optional(),
      country: commonSchemas.countryCode,
    }),

  /**
   * Build a checkout schema
   */
  checkout: () =>
    z.object({
      sessionId: z.string().optional(),
      successUrl: commonSchemas.url,
      customerEmail: commonSchemas.email.optional(),
      customerIpAddress: z.string().optional(),
      discountCode: commonSchemas.discountCode.optional(),
      allowDiscountCodes: z.boolean().optional(),
      requireBillingAddress: z.boolean().optional(),
      trialInterval: commonSchemas.trialInterval.optional(),
      trialIntervalCount: commonSchemas.positiveInt.optional(),
      isBusinessCustomer: z.boolean().optional(),
      customerBillingName: z.string().max(100).optional(),
      customerTaxId: z.string().max(50).optional(),
      customFieldData: z.record(z.string(), z.any()).optional(),
      metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
    }),
};

/**
 * Example usage schemas
 */
export const exampleSchemas = {
  // Product creation
  createProduct: z.object({
    name: z.string().min(1).max(100),
    price: commonSchemas.priceInCents,
    category: z.string().min(1).max(50),
    imageUrl: commonSchemas.url,
    description: z.string().min(1).max(500),
    inventory_qty: commonSchemas.nonNegativeInt.default(0),
    inStock: z.boolean().default(true),
  }),

  // Cart operations
  addToCart: z.object({
    catalogId: commonSchemas.productId,
    quantity: commonSchemas.quantity,
    sessionId: z.string().optional(),
  }),

  updateCartItem: z.object({
    catalogId: commonSchemas.productId,
    quantity: commonSchemas.nonNegativeInt, // Allow 0 to remove
    sessionId: z.string().optional(),
  }),

  // Order query
  getOrders: z.object({
    userId: z.string().optional(),
    status: z.enum(['succeeded', 'failed', 'pending', 'confirmed', 'expired']).optional(),
    ...commonSchemas.pagination.shape,
  }),
};
