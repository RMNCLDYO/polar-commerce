import { Polar } from '@polar-sh/sdk';
import { v } from 'convex/values';
import { action, query } from '../_generated/server';

interface PolarCustomer {
  id: string;
  email: string;
  [key: string]: unknown;
}

interface PolarProduct {
  id: string;
  name: string;
  isArchived?: boolean;
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

export const inspectAllData = query({
  args: {},
  returns: v.record(v.string(), v.number()),
  handler: async (ctx) => {
    const results: Record<string, number> = {};

    results.catalog = (await ctx.db.query('catalog').collect()).length;
    results.carts = (await ctx.db.query('carts').collect()).length;
    results.cartItems = (await ctx.db.query('cartItems').collect()).length;
    results.wishlists = (await ctx.db.query('wishlists').collect()).length;
    results.wishlistItems = (await ctx.db.query('wishlistItems').collect()).length;
    results.orders = (await ctx.db.query('orders').collect()).length;
    results.rateLimits = (await ctx.db.query('rateLimits').collect()).length;

    return results;
  },
});

export const inspectPolarData = action({
  args: {},
  returns: v.union(
    v.record(v.string(), v.number()),
    v.object({ error: v.string() }),
  ),
  handler: async () => {
    const token = process.env.POLAR_ORGANIZATION_TOKEN;
    if (!token) {
      return { error: 'POLAR_ORGANIZATION_TOKEN not set' };
    }

    const server =
      (process.env.POLAR_SERVER as 'sandbox' | 'production') || 'sandbox';
    const polarClient = new Polar({
      accessToken: token,
      server,
    });

    const results: Record<string, number> = {};

    try {
      const customersIter = await polarClient.customers.list({ limit: 100 });
      const customers: PolarCustomer[] = [];
      for await (const page of customersIter) {
        const resp = page as unknown as PageIteratorResponse;
        if (resp.ok && resp.value) {
          const items =
            (resp.value as CustomersListResponse).result?.items || [];
          customers.push(...items);
        }
      }
      results.customers = customers.length;
    } catch {
      results.customers = -1;
    }

    try {
      const productsIter = await polarClient.products.list({ limit: 100 });
      const products: PolarProduct[] = [];
      for await (const page of productsIter) {
        const resp = page as unknown as PageIteratorResponse;
        if (resp.ok && resp.value) {
          const items =
            (resp.value as ProductsListResponse).result?.items || [];
          products.push(...items);
        }
      }
      results.products = products.length;
      results.productsActive = products.filter((p) => !p.isArchived).length;
      results.productsArchived = products.filter((p) => p.isArchived).length;
    } catch {
      results.products = -1;
    }

    return results;
  },
});
