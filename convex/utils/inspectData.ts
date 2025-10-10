import { Polar } from '@polar-sh/sdk';
import { action, query } from '../_generated/server';

// Local type definitions for Polar SDK
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

/**
 * Inspect what data exists in the main Convex database
 */
export const inspectAllData = query({
  args: {},
  handler: async (ctx) => {
    const results: Record<string, number> = {};

    // Check Convex app tables
    results.catalog = (await ctx.db.query('catalog').collect()).length;
    results.demoTodos = (await ctx.db.query('demoTodos').collect()).length;

    return results;
  },
});

/**
 * Inspect Polar data via API
 */
export const inspectPolarData = action({
  args: {},
  handler: async (_ctx) => {
    const token = process.env.POLAR_ORGANIZATION_TOKEN;
    if (!token) {
      return { error: 'POLAR_ORGANIZATION_TOKEN not set' };
    }

    const server =
      (process.env.POLAR_SERVER as 'sandbox' | 'production') || 'sandbox';
    const polarClient = new Polar({
      accessToken: token,
      server: server,
    });

    const results: Record<string, number> = {};

    // Check customers
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
    } catch (_error) {
      results.customers = -1;
    }

    // Check products
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
    } catch (_error) {
      results.products = -1;
    }

    return results;
  },
});
