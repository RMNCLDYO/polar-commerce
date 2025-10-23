import { Polar } from '@convex-dev/polar';
import { Polar as PolarSDK } from '@polar-sh/sdk';
import { v } from 'convex/values';
import { api, components } from './_generated/api';
import { action, internalAction, query } from './_generated/server';

export const polar = new Polar(components.polar, {
  getUserInfo: async (ctx): Promise<{ userId: string; email: string }> => {
    // @ts-ignore - TypeScript deep instantiation issue with Convex
    const user = await ctx.runQuery(api.auth.auth.getCurrentUserBasic);
    if (!user) {
      throw new Error('User not authenticated');
    }
    return {
      userId: user._id,
      email: user.email,
    };
  },
  organizationToken: process.env.POLAR_ORGANIZATION_TOKEN,
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET,
  server: (process.env.POLAR_SERVER as 'sandbox' | 'production') || 'sandbox',
});

export const {
  changeCurrentSubscription,
  cancelCurrentSubscription,
  getConfiguredProducts,
  listAllProducts,
  generateCheckoutLink,
  generateCustomerPortalUrl,
} = polar.api();

export const syncProducts = action({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    await polar.syncProducts(ctx);
    return null;
  },
});

type PolarProduct = {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
  modifiedAt?: string;
  isArchived?: boolean;
  isRecurring?: boolean;
  organizationId?: string;
  recurringInterval?: 'month' | 'year' | 'week' | 'day';
  metadata?: Record<string, unknown>;
  prices?: Array<{
    id: string;
    type: string;
    priceAmount: number;
    priceCurrency: string;
    recurringInterval?: string;
    amountType?: string;
    createdAt?: string;
    modifiedAt?: string;
    productId?: string;
    isArchived?: boolean;
  }>;
  medias?: Array<{
    id: string;
    name: string;
    publicUrl?: string;
    mimeType?: string;
    size?: number;
    sizeReadable?: string;
    createdAt?: string;
    checksumEtag?: string;
    checksumSha256Base64?: string;
    checksumSha256Hex?: string;
    isUploaded?: boolean;
    lastModifiedAt?: string;
    organizationId?: string;
    path?: string;
    storageVersion?: string | null;
    version?: string | null;
  }>;
};

export const getSubscriptionProducts = query({
  args: {},
  returns: v.record(
    v.string(),
    v.object({
      id: v.string(),
      name: v.string(),
      description: v.optional(v.union(v.string(), v.null())),
      createdAt: v.optional(v.string()),
      modifiedAt: v.optional(v.string()),
      isArchived: v.optional(v.boolean()),
      isRecurring: v.optional(v.boolean()),
      organizationId: v.optional(v.string()),
      recurringInterval: v.optional(v.union(v.literal('month'), v.literal('year'), v.literal('week'), v.literal('day'))),
      metadata: v.optional(v.record(v.string(), v.any())),
      prices: v.optional(v.array(v.object({
        id: v.string(),
        type: v.string(),
        priceAmount: v.number(),
        priceCurrency: v.string(),
        recurringInterval: v.optional(v.string()),
        amountType: v.optional(v.string()),
        createdAt: v.optional(v.string()),
        modifiedAt: v.optional(v.string()),
        productId: v.optional(v.string()),
        isArchived: v.optional(v.boolean()),
      }))),
      medias: v.optional(v.array(v.object({
        id: v.string(),
        name: v.string(),
        publicUrl: v.optional(v.string()),
        mimeType: v.optional(v.string()),
        size: v.optional(v.number()),
        sizeReadable: v.optional(v.string()),
        createdAt: v.optional(v.string()),
        checksumEtag: v.optional(v.string()),
        checksumSha256Base64: v.optional(v.string()),
        checksumSha256Hex: v.optional(v.string()),
        isUploaded: v.optional(v.boolean()),
        lastModifiedAt: v.optional(v.string()),
        organizationId: v.optional(v.string()),
        path: v.optional(v.string()),
        storageVersion: v.optional(v.union(v.string(), v.null())),
        version: v.optional(v.union(v.string(), v.null())),
      }))),
    }),
  ),
  handler: async (ctx): Promise<Record<string, PolarProduct>> => {
    const allProducts = await ctx.runQuery(api.polar.listAllProducts, {}) as unknown as PolarProduct[];

    const subscriptionProducts: Record<string, PolarProduct> = {};

    for (const product of allProducts) {
      const name = product.name.toLowerCase();

      if (name.includes('starter') && name.includes('monthly')) {
        subscriptionProducts.starterMonthly = product;
      } else if (name.includes('starter') && name.includes('yearly')) {
        subscriptionProducts.starterYearly = product;
      } else if (name.includes('premium') && name.includes('monthly')) {
        subscriptionProducts.premiumMonthly = product;
      } else if (name.includes('premium') && name.includes('yearly')) {
        subscriptionProducts.premiumYearly = product;
      }
    }

    return subscriptionProducts;
  },
});

export const archiveBundleProduct = internalAction({
  args: {
    productId: v.string(),
  },
  returns: v.null(),
  handler: async (_ctx, args) => {
    const token = process.env.POLAR_ORGANIZATION_TOKEN;
    if (!token) {
      return null;
    }

    try {
      const polarClient = new PolarSDK({
        accessToken: token,
        server:
          (process.env.POLAR_SERVER as 'sandbox' | 'production') || 'sandbox',
      });

      await polarClient.products.update({
        id: args.productId,
        productUpdate: {
          isArchived: true,
        },
      });
    } catch {
    }

    return null;
  },
});
