import { Polar } from '@convex-dev/polar';
import { Polar as PolarSDK } from '@polar-sh/sdk';
import { v } from 'convex/values';
import { api, components } from './_generated/api';
import { action, internalAction, query } from './_generated/server';
import { logger } from './utils/logger';

export const polar = new Polar(components.polar, {
  // Required: provide a function the component can use to get the current user's ID and email
  getUserInfo: async (ctx): Promise<{ userId: string; email: string }> => {
    // biome-ignore lint/suspicious/noTsIgnore: @ts-ignore needed for dual tsconfig compatibility
    // @ts-ignore - Type instantiation depth issue (Next.js build only, not tsc -p convex)
    const user = await ctx.runQuery(api.auth.auth.getCurrentUser);
    if (!user) {
      throw new Error('User not authenticated');
    }
    return {
      userId: user._id,
      email: user.email,
    };
  },
  // Polar configuration from environment variables
  organizationToken: process.env.POLAR_ORGANIZATION_TOKEN,
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET,
  server: (process.env.POLAR_SERVER as 'sandbox' | 'production') || 'sandbox',
});

// Export API functions from the Polar client component
export const {
  // Subscription management
  changeCurrentSubscription,
  cancelCurrentSubscription,

  // Product management
  getConfiguredProducts,
  listAllProducts,

  // Checkout and portal
  generateCheckoutLink,
  generateCustomerPortalUrl,
} = polar.api();

// Note: getCurrentSubscription and listUserSubscriptions are available via the component's lib
// Use them like: await ctx.runQuery(components.polar.lib.getCurrentSubscription, { userId })
// Or: await ctx.runQuery(components.polar.lib.listUserSubscriptions, { userId })

// Sync products from Polar to Convex
// This should be run after creating products in Polar dashboard
// to sync them to your Convex database
export const syncProducts = action({
  args: {},
  handler: async (ctx) => {
    await polar.syncProducts(ctx);
  },
});

// Dynamically fetch subscription products from Polar
// Matches products by name to subscription tiers
export const getSubscriptionProducts = query({
  args: {},
  handler: async (
    ctx,
  ): Promise<Record<string, { id: string; [key: string]: unknown }>> => {
    const allProducts = await ctx.runQuery(api.polar.listAllProducts, {});

    // Filter for subscription products and map them by tier and billing cycle
    const subscriptionProducts: Record<string, (typeof allProducts)[number]> =
      {};

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

/**
 * Archive a bundle product after successful checkout
 * Internal action called by order webhook
 */
export const archiveBundleProduct = internalAction({
  args: {
    productId: v.string(),
  },
  handler: async (_ctx, args) => {
    logger.info('[Polar] Archiving bundle product:', args.productId);

    const token = process.env.POLAR_ORGANIZATION_TOKEN;
    if (!token) {
      logger.error('[Polar] POLAR_ORGANIZATION_TOKEN not set');
      return;
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

      logger.info('[Polar] Bundle product archived');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      logger.error('[Polar] Failed to archive bundle product:', errorMessage);
    }
  },
});
