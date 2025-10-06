import { Polar } from '@convex-dev/polar';
import { action, query } from './_generated/server';
import { api, components } from './_generated/api';

export const polar = new Polar(components.polar, {
  // Required: provide a function the component can use to get the current user's ID and email
  getUserInfo: async (ctx): Promise<{ userId: string; email: string }> => {
    // @ts-ignore - Type instantiation is excessively deep (known Convex issue)
    const user = await ctx.runQuery(api.auth.getCurrentUser);
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

// Export API functions from the Polar client
export const {
  changeCurrentSubscription,
  cancelCurrentSubscription,
  listAllProducts,
  generateCheckoutLink,
  generateCustomerPortalUrl,
} = polar.api();

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
  handler: async (ctx) => {
    const allProducts = await ctx.runQuery(api.polar.listAllProducts, {});

    // Filter for subscription products and map them by tier and billing cycle
    const subscriptionProducts: Record<string, any> = {};

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
