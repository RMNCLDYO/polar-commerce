/* eslint-disable @typescript-eslint/no-explicit-any */
import { customQuery, customMutation, customAction } from 'convex-helpers/server/customFunctions';
import { z } from 'zod';
import { query, mutation, action } from '../_generated/server';

export function zodQuery<TArgs extends z.ZodType, TOutput>(config: {
  args: TArgs;
  handler: (
    ctx: any,
    args: z.infer<TArgs>,
  ) => Promise<TOutput>;
}): any {
  return customQuery(
    query,
    {
      args: {},
      input: async (ctx: any, args: any): Promise<{ ctx: any; args: Record<string, any> }> => {
        const parsedArgs = config.args.parse(args);
        return { ctx, args: parsedArgs as Record<string, any> };
      },
    }
  )(config.handler as any);
}

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

export const commonSchemas = {
  email: z.string().email(),
  url: z.string().url(),
  positiveInt: z.number().int().positive(),
  nonNegativeInt: z.number().int().nonnegative(),
  priceInCents: z.number().int().positive().max(100000000),
  quantity: z.number().int().positive().max(999),
  productId: z.string().min(1),
  sessionId: z.string().uuid().optional(),
  isoDate: z.string().datetime(),
  discountCode: z
    .string()
    .regex(/^[A-Z0-9]{3,20}$/, 'Discount code must be 3-20 uppercase alphanumeric characters'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  postalCode: z.string().regex(/^[A-Z0-9\s-]{3,10}$/i, 'Invalid postal code'),
  countryCode: z.string().length(2).toUpperCase(),
  currencyCode: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']),
  pagination: z.object({
    offset: z.number().int().nonnegative().default(0),
    limit: z.number().int().positive().max(100).default(20),
  }),
  sortOption: z.enum([
    'price-asc',
    'price-desc',
    'name-asc',
    'name-desc',
    'newest',
  ]),
  trialInterval: z.enum(['day', 'week', 'month', 'year']),
};

export const schemaBuilders = {
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

  cartItem: () =>
    z.object({
      catalogId: commonSchemas.productId,
      quantity: commonSchemas.quantity,
      sessionId: z.string().optional(),
    }),

  address: () =>
    z.object({
      line1: z.string().max(100).optional(),
      line2: z.string().max(100).optional(),
      city: z.string().max(50).optional(),
      state: z.string().max(50).optional(),
      postalCode: commonSchemas.postalCode.optional(),
      country: commonSchemas.countryCode,
    }),

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

export const exampleSchemas = {
  createProduct: z.object({
    name: z.string().min(1).max(100),
    price: commonSchemas.priceInCents,
    category: z.string().min(1).max(50),
    imageUrl: commonSchemas.url,
    description: z.string().min(1).max(500),
    inventory_qty: commonSchemas.nonNegativeInt.default(0),
    inStock: z.boolean().default(true),
  }),

  addToCart: z.object({
    catalogId: commonSchemas.productId,
    quantity: commonSchemas.quantity,
    sessionId: z.string().optional(),
  }),

  updateCartItem: z.object({
    catalogId: commonSchemas.productId,
    quantity: commonSchemas.nonNegativeInt,
    sessionId: z.string().optional(),
  }),

  getOrders: z.object({
    userId: z.string().optional(),
    status: z.enum(['succeeded', 'failed', 'pending', 'confirmed', 'expired']).optional(),
    ...commonSchemas.pagination.shape,
  }),
};
