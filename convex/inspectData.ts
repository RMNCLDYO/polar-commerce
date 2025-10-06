import { query, action } from './_generated/server';
import { api } from './_generated/api';
import { Polar } from '@polar-sh/sdk';

/**
 * Inspect what data exists in the main Convex database
 */
export const inspectAllData = query({
  args: {},
  handler: async (ctx) => {
    const results: Record<string, number> = {};

    // Check Convex app tables
    results.products = (await ctx.db.query('products').collect()).length;
    results.todos = (await ctx.db.query('todos').collect()).length;

    return results;
  },
});

/**
 * Inspect Polar data via API
 */
export const inspectPolarData = action({
  args: {},
  handler: async (ctx) => {
    const server =
      (process.env.POLAR_SERVER as 'sandbox' | 'production') || 'sandbox';
    const polarClient = new Polar({
      accessToken: process.env.POLAR_ORGANIZATION_TOKEN!,
      server: server,
    });

    const results: Record<string, number> = {};

    // Check customers
    try {
      const customersIter = await polarClient.customers.list({ limit: 100 });
      const customers: any[] = [];
      for await (const page of customersIter) {
        const items = (page as any).result?.items || [];
        customers.push(...items);
      }
      results.customers = customers.length;
    } catch (error) {
      results.customers = -1;
    }

    // Check products
    try {
      const productsIter = await polarClient.products.list({ limit: 100 });
      const products: any[] = [];
      for await (const page of productsIter) {
        const items = (page as any).result?.items || [];
        products.push(...items);
      }
      results.products = products.length;
      results.productsActive = products.filter((p) => !p.isArchived).length;
      results.productsArchived = products.filter((p) => p.isArchived).length;
    } catch (error) {
      results.products = -1;
    }

    return results;
  },
});
