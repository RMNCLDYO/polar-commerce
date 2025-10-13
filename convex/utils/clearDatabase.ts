/**
 * Clear Database - Complete System Cleanup
 *
 * This action performs a complete database reset by:
 * 1. Deleting all Better Auth data (sessions, accounts, users, etc.)
 * 2. Deleting all Polar data from both Convex and Polar API
 * 3. Deleting all Convex app data (catalog, carts, orders, demos)
 *
 * Polar component deletion approach:
 * - Uses list queries to get all records:
 *   - components.polar.lib.listSubscriptions({ includeEnded: true })
 *   - components.polar.lib.listCustomers()
 *   - components.polar.lib.listProducts({ includeArchived: true })
 * - Then calls individual delete mutations:
 *   - components.polar.lib.deleteSubscription({ id })
 *   - components.polar.lib.deleteCustomer({ userId })
 *   - components.polar.lib.deleteProduct({ id })
 *
 * This keeps the Polar fork minimal - consistent CRUD operations following
 * the existing listProducts pattern, no special bulk delete functions.
 *
 * WARNING: THIS IS IRREVERSIBLE!
 */

import { Polar } from '@polar-sh/sdk';
import { components, internal } from '../_generated/api';
import { action, internalAction, internalMutation } from '../_generated/server';
import type { BetterAuthDeleteManyResponse } from '../types/convex_internals';
import { logger } from './logger';

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

/**
 * Clear Database - Complete System Cleanup
 * This will delete EVERYTHING from Better Auth, Polar, and Convex
 */
export const clearDatabase = action({
  args: {},
  handler: async (ctx) => {
    logger.info('🚨 DATABASE RESET INITIATED');
    logger.info('='.repeat(60));
    logger.info('This will delete ALL data from:');
    logger.info('  • Better Auth (users, sessions, accounts, etc.)');
    logger.info('  • Polar (customers, archived products)');
    logger.info('  • Convex (catalog, carts, orders, demos)');
    logger.info('='.repeat(60));

    const results = {
      betterAuth: {} as {
        sessions: number;
        accounts: number;
        verifications: number;
        twoFactor: number;
        jwks: number;
        users: number;
      },
      polar: {} as Record<string, number>,
      convex: {} as Record<string, number>,
    };

    // STEP 1: Delete Better Auth Data
    logger.info('\n📋 STEP 1: Deleting Better Auth data...');
    try {
      const authResults = await ctx.runMutation(
        internal.utils.clearDatabase.clearBetterAuthData,
      );
      results.betterAuth = authResults;
      logger.info('✅ Better Auth data deleted');
    } catch (error) {
      logger.error('❌ Error deleting Better Auth data:', error);
      throw error;
    }

    // STEP 2: Delete Polar Data from API and Convex component
    logger.info('\n🐻 STEP 2: Deleting Polar data...');
    try {
      // Delete from Polar component in Convex first
      const polarComponentResults = await ctx.runAction(
        internal.utils.clearDatabase.clearPolarComponentData,
      );

      // Delete from Polar API
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
      logger.info('✅ Polar data deleted from Convex and API');
    } catch (error) {
      logger.error('❌ Error deleting Polar data:', error);
      throw error;
    }

    // STEP 3: Delete Convex App Data
    logger.info('\n🗄️  STEP 3: Deleting Convex app data...');
    try {
      const convexResults = await ctx.runMutation(
        internal.utils.clearDatabase.clearConvexData,
      );
      results.convex = convexResults;
      logger.info('✅ Convex app data deleted');
    } catch (error) {
      logger.error('❌ Error deleting Convex data:', error);
      throw error;
    }

    logger.info(`\n${'='.repeat(60)}`);
    logger.info('🎉 DATABASE RESET COMPLETE!');
    logger.info('='.repeat(60));
    logger.info('\n📊 Summary:');
    logger.info('\nBetter Auth:');
    Object.entries(results.betterAuth).forEach(([table, count]) => {
      logger.info(`  • ${table}: ${count} deleted`);
    });
    logger.info('\nPolar:');
    Object.entries(results.polar).forEach(([type, count]) => {
      logger.info(`  • ${type}: ${count} deleted`);
    });
    logger.info('\nConvex:');
    Object.entries(results.convex).forEach(([table, count]) => {
      logger.info(`  • ${table}: ${count} deleted`);
    });

    return results;
  },
});

/**
 * Clear Better Auth component data using component's adapter
 */
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
  }> => {
    logger.info('🔐 Clearing Better Auth component data...');

    const results = {
      sessions: 0,
      accounts: 0,
      verifications: 0,
      twoFactor: 0,
      jwks: 0,
      users: 0,
    };

    // Delete using Better Auth component's adapter
    try {
      // Delete sessions
      const sessionsResult = await ctx.runMutation(
        components.betterAuth.adapter.deleteMany,
        {
          input: { model: 'session' },
          paginationOpts: { cursor: null, numItems: 1000 },
        },
      ) as BetterAuthDeleteManyResponse | null;
      results.sessions = sessionsResult?.deletedCount || 0;
      logger.info(`  ✅ Deleted ${results.sessions} sessions`);
    } catch {
      logger.info('  ⚠️  Could not delete sessions');
    }

    try {
      // Delete accounts
      const accountsResult = await ctx.runMutation(
        components.betterAuth.adapter.deleteMany,
        {
          input: { model: 'account' },
          paginationOpts: { cursor: null, numItems: 1000 },
        },
      ) as BetterAuthDeleteManyResponse | null;
      results.accounts = accountsResult?.deletedCount || 0;
      logger.info(`  ✅ Deleted ${results.accounts} accounts`);
    } catch {
      logger.info('  ⚠️  Could not delete accounts');
    }

    try {
      // Delete verifications
      const verificationsResult = await ctx.runMutation(
        components.betterAuth.adapter.deleteMany,
        {
          input: { model: 'verification' },
          paginationOpts: { cursor: null, numItems: 1000 },
        },
      ) as BetterAuthDeleteManyResponse | null;
      results.verifications = verificationsResult?.deletedCount || 0;
      logger.info(`  ✅ Deleted ${results.verifications} verifications`);
    } catch {
      logger.info('  ⚠️  Could not delete verifications');
    }

    try {
      // Delete two-factor
      const twoFactorResult = await ctx.runMutation(
        components.betterAuth.adapter.deleteMany,
        {
          input: { model: 'twoFactor' },
          paginationOpts: { cursor: null, numItems: 1000 },
        },
      ) as BetterAuthDeleteManyResponse | null;
      results.twoFactor = twoFactorResult?.deletedCount || 0;
      logger.info(`  ✅ Deleted ${results.twoFactor} two-factor records`);
    } catch {
      logger.info('  ⚠️  Could not delete two-factor');
    }

    try {
      // Delete jwks
      const jwksResult = await ctx.runMutation(
        components.betterAuth.adapter.deleteMany,
        {
          input: { model: 'jwks' },
          paginationOpts: { cursor: null, numItems: 1000 },
        },
      ) as BetterAuthDeleteManyResponse | null;
      results.jwks = jwksResult?.deletedCount || 0;
      logger.info(`  ✅ Deleted ${results.jwks} jwks`);
    } catch {
      logger.info('  ⚠️  Could not delete jwks');
    }

    try {
      // Delete users (last)
      const usersResult = await ctx.runMutation(
        components.betterAuth.adapter.deleteMany,
        {
          input: { model: 'user' },
          paginationOpts: { cursor: null, numItems: 1000 },
        },
      ) as BetterAuthDeleteManyResponse | null;
      results.users = usersResult?.deletedCount || 0;
      logger.info(`  ✅ Deleted ${results.users} users`);
    } catch {
      logger.info('  ⚠️  Could not delete users');
    }

    logger.info('✅ Better Auth data cleared from Convex');
    return results;
  },
});

/**
 * Clear Polar component data from Convex
 * Uses list queries + individual delete mutations from the Polar component
 */
export const clearPolarComponentData = internalAction({
  args: {},
  handler: async (ctx) => {
    logger.info('🐻 Clearing Polar component data from Convex...');

    const results = {
      subscriptions: 0,
      customers: 0,
      products: 0,
    };

    // Delete subscriptions first (they reference customers and products)
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
    logger.info(`  ✅ Deleted ${results.subscriptions} subscriptions`);

    // Delete customers
    const customers = await ctx.runQuery(components.polar.lib.listCustomers);
    for (const customer of customers) {
      await ctx.runMutation(components.polar.lib.deleteCustomer, {
        userId: customer.userId,
      });
      results.customers++;
    }
    logger.info(`  ✅ Deleted ${results.customers} customers`);

    // Delete products
    const products = await ctx.runQuery(components.polar.lib.listProducts, {
      includeArchived: true,
    });
    for (const product of products) {
      await ctx.runMutation(components.polar.lib.deleteProduct, {
        id: product.id,
      });
      results.products++;
    }
    logger.info(`  ✅ Deleted ${results.products} products`);

    logger.info('✅ Polar component data cleared from Convex');
    return results;
  },
});

/**
 * Clear all Polar data (customers and products)
 * This uses the Polar SDK to delete from Polar's API
 */
export const clearPolarDataInternal = internalAction({
  args: {},
  handler: async () => {
    logger.info('🐻 Clearing Polar data...');

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

    logger.info(`  Using Polar ${server} environment`);

    // Delete all customers
    try {
      logger.info('  📋 Fetching customers...');
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

      logger.info(`  Found ${customers.length} customers`);

      for (const customer of customers) {
        try {
          await polarClient.customers.delete({ id: customer.id });
          results.customers++;
          logger.info(`    ✅ Deleted customer: ${customer.email}`);
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          logger.info(
            `    ⚠️  Could not delete customer ${customer.email}:`,
            errorMessage,
          );
        }
      }
    } catch (error) {
      logger.error('  ❌ Error deleting customers:', error);
    }

    // Archive all products (Polar doesn't allow deletion, only archiving)
    try {
      logger.info('  📦 Fetching products...');
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

      logger.info(`  Found ${products.length} products`);

      for (const product of products) {
        try {
          // Skip if already archived
          if (product.isArchived || product.is_archived) {
            logger.info(`    ⏭️  Already archived: ${product.name}`);
            continue;
          }

          await polarClient.products.update({
            id: product.id,
            productUpdate: {
              isArchived: true,
            },
          });
          results.products++;
          logger.info(`    ✅ Archived product: ${product.name}`);
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          logger.info(
            `    ⚠️  Could not archive product ${product.name}:`,
            errorMessage,
          );
        }
      }
    } catch (error) {
      logger.error('  ❌ Error archiving products:', error);
    }

    return results;
  },
});

/**
 * Clear all Convex app data (products and todos)
 */
export const clearConvexData = internalMutation({
  args: {},
  handler: async (ctx) => {
    logger.info('🗄️  Clearing Convex app data...');

    const results: Record<string, number> = {};

    // Delete catalog items
    const catalog = await ctx.db.query('catalog').collect();
    for (const item of catalog) {
      await ctx.db.delete(item._id);
    }
    results.catalog = catalog.length;
    logger.info(`  ✅ Deleted ${catalog.length} catalog items`);

    // Delete demo todos
    const demoTodos = await ctx.db.query('demoTodos').collect();
    for (const todo of demoTodos) {
      await ctx.db.delete(todo._id);
    }
    results.demoTodos = demoTodos.length;
    logger.info(`  ✅ Deleted ${demoTodos.length} demo todos`);

    // Delete cart items
    const cartItems = await ctx.db.query('cartItems').collect();
    for (const item of cartItems) {
      await ctx.db.delete(item._id);
    }
    results.cartItems = cartItems.length;
    logger.info(`  ✅ Deleted ${cartItems.length} cart items`);

    // Delete carts
    const carts = await ctx.db.query('carts').collect();
    for (const cart of carts) {
      await ctx.db.delete(cart._id);
    }
    results.carts = carts.length;
    logger.info(`  ✅ Deleted ${carts.length} carts`);

    // Delete orders
    const orders = await ctx.db.query('orders').collect();
    for (const order of orders) {
      await ctx.db.delete(order._id);
    }
    results.orders = orders.length;
    logger.info(`  ✅ Deleted ${orders.length} orders`);

    return results;
  },
});
