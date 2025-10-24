import { Polar } from '@polar-sh/sdk';
import { components, internal } from '../_generated/api';
import { action, internalAction, internalMutation } from '../_generated/server';
import type { BetterAuthDeleteManyResponse } from '../types/convex_internals';

interface PolarCustomer {
  id: string;
  email: string;
  [key: string]: unknown;
}

interface PolarProduct {
  id: string;
  name: string;
  isArchived?: boolean;
  is_archived?: boolean;
  [key: string]: unknown;
}

interface CustomersListResponse {
  result?: {
    items?: PolarCustomer[];
  };
}

interface ProductsListResponse {
  result?: {
    items?: PolarProduct[];
  };
}

interface PageIteratorResponse {
  ok: boolean;
  value?: CustomersListResponse | ProductsListResponse;
}

export const clearDatabase = action({
  args: {},
  handler: async (ctx) => {
    const results = {
      betterAuth: {} as Record<string, number>,
      polar: {} as Record<string, number>,
      convex: {} as Record<string, number>,
    };

    try {
      const authResults = await ctx.runMutation(
        internal.utils.clearDatabase.clearBetterAuthData,
      );
      results.betterAuth = authResults;
    } catch (error) {
      throw error;
    }

    try {
      const polarComponentResults = await ctx.runAction(
        internal.utils.clearDatabase.clearPolarComponentData,
      );

      const polarApiResults = await ctx.runAction(
        internal.utils.clearDatabase.clearPolarDataInternal,
      );

      results.polar = {
        convexSubscriptions: polarComponentResults.subscriptions,
        convexCustomers: polarComponentResults.customers,
        convexProducts: polarComponentResults.products,
        apiCustomers: polarApiResults.customers ?? 0,
        apiProducts: polarApiResults.products ?? 0,
      };
    } catch (error) {
      throw error;
    }

    try {
      const convexResults = await ctx.runMutation(
        internal.utils.clearDatabase.clearConvexData,
      );
      results.convex = convexResults;
    } catch (error) {
      throw error;
    }

    return results;
  },
});

export const clearBetterAuthData = internalMutation({
  args: {},
  handler: async (
    ctx,
  ): Promise<{
    sessions: number;
    accounts: number;
    verifications: number;
    twoFactor: number;
    jwks: number;
    users: number;
    passkey: number;
    oauthAccessToken: number;
    oauthApplication: number;
    oauthConsent: number;
    rateLimit: number;
    ratelimit: number;
  }> => {
    const results = {
      sessions: 0,
      accounts: 0,
      verifications: 0,
      twoFactor: 0,
      jwks: 0,
      users: 0,
      passkey: 0,
      oauthAccessToken: 0,
      oauthApplication: 0,
      oauthConsent: 0,
      rateLimit: 0,
      ratelimit: 0,
    };

    try {
      const sessionsResult = await ctx.runMutation(
        components.betterAuth.adapter.deleteMany,
        {
          input: { model: 'session' },
          paginationOpts: { cursor: null, numItems: 1000 },
        },
      ) as BetterAuthDeleteManyResponse | null;
      results.sessions = sessionsResult?.deletedCount || 0;
    } catch {
    }

    try {
      const accountsResult = await ctx.runMutation(
        components.betterAuth.adapter.deleteMany,
        {
          input: { model: 'account' },
          paginationOpts: { cursor: null, numItems: 1000 },
        },
      ) as BetterAuthDeleteManyResponse | null;
      results.accounts = accountsResult?.deletedCount || 0;
    } catch {
    }

    try {
      const verificationsResult = await ctx.runMutation(
        components.betterAuth.adapter.deleteMany,
        {
          input: { model: 'verification' },
          paginationOpts: { cursor: null, numItems: 1000 },
        },
      ) as BetterAuthDeleteManyResponse | null;
      results.verifications = verificationsResult?.deletedCount || 0;
    } catch {
    }

    try {
      const twoFactorResult = await ctx.runMutation(
        components.betterAuth.adapter.deleteMany,
        {
          input: { model: 'twoFactor' },
          paginationOpts: { cursor: null, numItems: 1000 },
        },
      ) as BetterAuthDeleteManyResponse | null;
      results.twoFactor = twoFactorResult?.deletedCount || 0;
    } catch {
    }

    try {
      const jwksResult = await ctx.runMutation(
        components.betterAuth.adapter.deleteMany,
        {
          input: { model: 'jwks' },
          paginationOpts: { cursor: null, numItems: 1000 },
        },
      ) as BetterAuthDeleteManyResponse | null;
      results.jwks = jwksResult?.deletedCount || 0;
    } catch {
    }

    try {
      const passkeyResult = await ctx.runMutation(
        components.betterAuth.adapter.deleteMany,
        {
          input: { model: 'passkey' },
          paginationOpts: { cursor: null, numItems: 1000 },
        },
      ) as BetterAuthDeleteManyResponse | null;
      results.passkey = passkeyResult?.deletedCount || 0;
    } catch {
    }

    try {
      const oauthAccessTokenResult = await ctx.runMutation(
        components.betterAuth.adapter.deleteMany,
        {
          input: { model: 'oauthAccessToken' },
          paginationOpts: { cursor: null, numItems: 1000 },
        },
      ) as BetterAuthDeleteManyResponse | null;
      results.oauthAccessToken = oauthAccessTokenResult?.deletedCount || 0;
    } catch {
    }

    try {
      const oauthApplicationResult = await ctx.runMutation(
        components.betterAuth.adapter.deleteMany,
        {
          input: { model: 'oauthApplication' },
          paginationOpts: { cursor: null, numItems: 1000 },
        },
      ) as BetterAuthDeleteManyResponse | null;
      results.oauthApplication = oauthApplicationResult?.deletedCount || 0;
    } catch {
    }

    try {
      const oauthConsentResult = await ctx.runMutation(
        components.betterAuth.adapter.deleteMany,
        {
          input: { model: 'oauthConsent' },
          paginationOpts: { cursor: null, numItems: 1000 },
        },
      ) as BetterAuthDeleteManyResponse | null;
      results.oauthConsent = oauthConsentResult?.deletedCount || 0;
    } catch {
    }

    try {
      const rateLimitResult = await ctx.runMutation(
        components.betterAuth.adapter.deleteMany,
        {
          input: { model: 'rateLimit' },
          paginationOpts: { cursor: null, numItems: 1000 },
        },
      ) as BetterAuthDeleteManyResponse | null;
      results.rateLimit = rateLimitResult?.deletedCount || 0;
    } catch {
    }

    try {
      const ratelimitResult = await ctx.runMutation(
        components.betterAuth.adapter.deleteMany,
        {
          input: { model: 'ratelimit' },
          paginationOpts: { cursor: null, numItems: 1000 },
        },
      ) as BetterAuthDeleteManyResponse | null;
      results.ratelimit = ratelimitResult?.deletedCount || 0;
    } catch {
    }

    try {
      const usersResult = await ctx.runMutation(
        components.betterAuth.adapter.deleteMany,
        {
          input: { model: 'user' },
          paginationOpts: { cursor: null, numItems: 1000 },
        },
      ) as BetterAuthDeleteManyResponse | null;
      results.users = usersResult?.deletedCount || 0;
    } catch {
    }

    return results;
  },
});

export const clearPolarComponentData = internalAction({
  args: {},
  handler: async (ctx) => {
    const results = {
      subscriptions: 0,
      customers: 0,
      products: 0,
    };

    const subscriptions = await ctx.runQuery(
      components.polar.lib.listSubscriptions,
      { includeEnded: true },
    );
    for (const subscription of subscriptions) {
      await ctx.runMutation(components.polar.lib.deleteSubscription, {
        id: subscription.id,
      });
      results.subscriptions++;
    }

    const customers = await ctx.runQuery(components.polar.lib.listCustomers);
    for (const customer of customers) {
      await ctx.runMutation(components.polar.lib.deleteCustomer, {
        userId: customer.userId,
      });
      results.customers++;
    }

    const products = await ctx.runQuery(components.polar.lib.listProducts, {
      includeArchived: true,
    });
    for (const product of products) {
      await ctx.runMutation(components.polar.lib.deleteProduct, {
        id: product.id,
      });
      results.products++;
    }

    return results;
  },
});

export const clearPolarDataInternal = internalAction({
  args: {},
  handler: async () => {
    const results = {
      customers: 0,
      products: 0,
    };

    const token = process.env.POLAR_ORGANIZATION_TOKEN;
    if (!token) {
      throw new Error('POLAR_ORGANIZATION_TOKEN not set');
    }

    const server =
      (process.env.POLAR_SERVER as 'sandbox' | 'production') || 'sandbox';
    const polarClient = new Polar({
      accessToken: token,
      server,
    });

    try {
      const customersIter = await polarClient.customers.list({ limit: 100 });
      const customers: PolarCustomer[] = [];

      for await (const page of customersIter) {
        const typedResponse = page as unknown;
        if (typedResponse && typeof typedResponse === 'object') {
          let items: PolarCustomer[] = [];

          if ('result' in typedResponse) {
            const result = (typedResponse as { result?: { items?: PolarCustomer[] } }).result;
            items = result?.items ?? [];
          }
          else if ('ok' in typedResponse && typedResponse.ok === true && 'value' in typedResponse) {
            const pageResponse = typedResponse as PageIteratorResponse;
            const customersResponse = pageResponse.value as CustomersListResponse;
            items = customersResponse?.result?.items ?? [];
          }

          customers.push(...items);
        }
      }

      for (const customer of customers) {
        try {
          await polarClient.customers.delete({ id: customer.id });
          results.customers++;
        } catch {
        }
      }
    } catch {
    }

    try {
      const productsIter = await polarClient.products.list({ limit: 100 });
      const products: PolarProduct[] = [];

      for await (const page of productsIter) {
        const typedResponse = page as unknown;
        if (typedResponse && typeof typedResponse === 'object') {
          let items: PolarProduct[] = [];

          if ('result' in typedResponse) {
            const result = (typedResponse as { result?: { items?: PolarProduct[] } }).result;
            items = result?.items ?? [];
          }
          else if ('ok' in typedResponse && typedResponse.ok === true && 'value' in typedResponse) {
            const pageResponse = typedResponse as PageIteratorResponse;
            const productsResponse = pageResponse.value as ProductsListResponse;
            items = productsResponse?.result?.items ?? [];
          }

          products.push(...items);
        }
      }

      for (const product of products) {
        try {
          if (product.isArchived || product.is_archived) {
            continue;
          }

          await polarClient.products.update({
            id: product.id,
            productUpdate: {
              isArchived: true,
            },
          });
          results.products++;
        } catch {
        }
      }
    } catch {
    }

    return results;
  },
});

export const clearConvexData = internalMutation({
  args: {},
  handler: async (ctx) => {
    const results: Record<string, number> = {};

    const catalog = await ctx.db.query('catalog').collect();
    for (const item of catalog) {
      await ctx.db.delete(item._id);
    }
    results.catalog = catalog.length;

    const cartItems = await ctx.db.query('cartItems').collect();
    for (const item of cartItems) {
      await ctx.db.delete(item._id);
    }
    results.cartItems = cartItems.length;

    const carts = await ctx.db.query('carts').collect();
    for (const cart of carts) {
      await ctx.db.delete(cart._id);
    }
    results.carts = carts.length;

    const wishlistItems = await ctx.db.query('wishlistItems').collect();
    for (const item of wishlistItems) {
      await ctx.db.delete(item._id);
    }
    results.wishlistItems = wishlistItems.length;

    const wishlists = await ctx.db.query('wishlists').collect();
    for (const wishlist of wishlists) {
      await ctx.db.delete(wishlist._id);
    }
    results.wishlists = wishlists.length;

    const orders = await ctx.db.query('orders').collect();
    for (const order of orders) {
      await ctx.db.delete(order._id);
    }
    results.orders = orders.length;

    const rateLimits = await ctx.db.query('rateLimits').collect();
    for (const rateLimit of rateLimits) {
      await ctx.db.delete(rateLimit._id);
    }
    results.rateLimits = rateLimits.length;

    return results;
  },
});
