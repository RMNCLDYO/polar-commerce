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
    console.log('🚨 DATABASE RESET INITIATED');
    console.log('='.repeat(60));
    console.log('This will delete ALL data from:');
    console.log('  • Better Auth (users, sessions, accounts, etc.)');
    console.log('  • Polar (customers, archived products)');
    console.log('  • Convex (catalog, carts, orders, demos)');
    console.log('='.repeat(60));

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
    console.log('\n📋 STEP 1: Deleting Better Auth data...');
    try {
      const authResults = await ctx.runMutation(
        internal.utils.clearDatabase.clearBetterAuthData,
      );
      results.betterAuth = authResults;
      console.log('✅ Better Auth data deleted');
    } catch (error) {
      console.error('❌ Error deleting Better Auth data:', error);
      throw error;
    }

    // STEP 2: Delete Polar Data from API and Convex component
    console.log('\n🐻 STEP 2: Deleting Polar data...');
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
      console.log('✅ Polar data deleted from Convex and API');
    } catch (error) {
      console.error('❌ Error deleting Polar data:', error);
      throw error;
    }

    // STEP 3: Delete Convex App Data
    console.log('\n🗄️  STEP 3: Deleting Convex app data...');
    try {
      const convexResults = await ctx.runMutation(
        internal.utils.clearDatabase.clearConvexData,
      );
      results.convex = convexResults;
      console.log('✅ Convex app data deleted');
    } catch (error) {
      console.error('❌ Error deleting Convex data:', error);
      throw error;
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('🎉 DATABASE RESET COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log('\nBetter Auth:');
    Object.entries(results.betterAuth).forEach(([table, count]) => {
      console.log(`  • ${table}: ${count} deleted`);
    });
    console.log('\nPolar:');
    Object.entries(results.polar).forEach(([type, count]) => {
      console.log(`  • ${type}: ${count} deleted`);
    });
    console.log('\nConvex:');
    Object.entries(results.convex).forEach(([table, count]) => {
      console.log(`  • ${table}: ${count} deleted`);
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
    console.log('🔐 Clearing Better Auth component data...');

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
      );
      results.sessions = sessionsResult?.deletedCount || 0;
      console.log(`  ✅ Deleted ${results.sessions} sessions`);
    } catch (_e) {
      console.log('  ⚠️  Could not delete sessions');
    }

    try {
      // Delete accounts
      const accountsResult = await ctx.runMutation(
        components.betterAuth.adapter.deleteMany,
        {
          input: { model: 'account' },
          paginationOpts: { cursor: null, numItems: 1000 },
        },
      );
      results.accounts = accountsResult?.deletedCount || 0;
      console.log(`  ✅ Deleted ${results.accounts} accounts`);
    } catch (_e) {
      console.log('  ⚠️  Could not delete accounts');
    }

    try {
      // Delete verifications
      const verificationsResult = await ctx.runMutation(
        components.betterAuth.adapter.deleteMany,
        {
          input: { model: 'verification' },
          paginationOpts: { cursor: null, numItems: 1000 },
        },
      );
      results.verifications = verificationsResult?.deletedCount || 0;
      console.log(`  ✅ Deleted ${results.verifications} verifications`);
    } catch (_e) {
      console.log('  ⚠️  Could not delete verifications');
    }

    try {
      // Delete two-factor
      const twoFactorResult = await ctx.runMutation(
        components.betterAuth.adapter.deleteMany,
        {
          input: { model: 'twoFactor' },
          paginationOpts: { cursor: null, numItems: 1000 },
        },
      );
      results.twoFactor = twoFactorResult?.deletedCount || 0;
      console.log(`  ✅ Deleted ${results.twoFactor} two-factor records`);
    } catch (_e) {
      console.log('  ⚠️  Could not delete two-factor');
    }

    try {
      // Delete jwks
      const jwksResult = await ctx.runMutation(
        components.betterAuth.adapter.deleteMany,
        {
          input: { model: 'jwks' },
          paginationOpts: { cursor: null, numItems: 1000 },
        },
      );
      results.jwks = jwksResult?.deletedCount || 0;
      console.log(`  ✅ Deleted ${results.jwks} jwks`);
    } catch (_e) {
      console.log('  ⚠️  Could not delete jwks');
    }

    try {
      // Delete users (last)
      const usersResult = await ctx.runMutation(
        components.betterAuth.adapter.deleteMany,
        {
          input: { model: 'user' },
          paginationOpts: { cursor: null, numItems: 1000 },
        },
      );
      results.users = usersResult?.deletedCount || 0;
      console.log(`  ✅ Deleted ${results.users} users`);
    } catch (_e) {
      console.log('  ⚠️  Could not delete users');
    }

    console.log('✅ Better Auth data cleared from Convex');
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
    console.log('🐻 Clearing Polar component data from Convex...');

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
    console.log(`  ✅ Deleted ${results.subscriptions} subscriptions`);

    // Delete customers
    const customers = await ctx.runQuery(components.polar.lib.listCustomers);
    for (const customer of customers) {
      await ctx.runMutation(components.polar.lib.deleteCustomer, {
        userId: customer.userId,
      });
      results.customers++;
    }
    console.log(`  ✅ Deleted ${results.customers} customers`);

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
    console.log(`  ✅ Deleted ${results.products} products`);

    console.log('✅ Polar component data cleared from Convex');
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
    console.log('🐻 Clearing Polar data...');

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
      server: server,
    });

    console.log(`  Using Polar ${server} environment`);

    // Delete all customers
    try {
      console.log('  📋 Fetching customers...');
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

      console.log(`  Found ${customers.length} customers`);

      for (const customer of customers) {
        try {
          await polarClient.customers.delete({ id: customer.id });
          results.customers++;
          console.log(`    ✅ Deleted customer: ${customer.email}`);
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          console.log(
            `    ⚠️  Could not delete customer ${customer.email}:`,
            errorMessage,
          );
        }
      }
    } catch (error) {
      console.error('  ❌ Error deleting customers:', error);
    }

    // Archive all products (Polar doesn't allow deletion, only archiving)
    try {
      console.log('  📦 Fetching products...');
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

      console.log(`  Found ${products.length} products`);

      for (const product of products) {
        try {
          // Skip if already archived
          if (product.isArchived || product.is_archived) {
            console.log(`    ⏭️  Already archived: ${product.name}`);
            continue;
          }

          await polarClient.products.update({
            id: product.id,
            productUpdate: {
              isArchived: true,
            },
          });
          results.products++;
          console.log(`    ✅ Archived product: ${product.name}`);
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          console.log(
            `    ⚠️  Could not archive product ${product.name}:`,
            errorMessage,
          );
        }
      }
    } catch (error) {
      console.error('  ❌ Error archiving products:', error);
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
    console.log('🗄️  Clearing Convex app data...');

    const results: Record<string, number> = {};

    // Delete catalog items
    const catalog = await ctx.db.query('catalog').collect();
    for (const item of catalog) {
      await ctx.db.delete(item._id);
    }
    results.catalog = catalog.length;
    console.log(`  ✅ Deleted ${catalog.length} catalog items`);

    // Delete demo todos
    const demoTodos = await ctx.db.query('demoTodos').collect();
    for (const todo of demoTodos) {
      await ctx.db.delete(todo._id);
    }
    results.demoTodos = demoTodos.length;
    console.log(`  ✅ Deleted ${demoTodos.length} demo todos`);

    // Delete cart items
    const cartItems = await ctx.db.query('cartItems').collect();
    for (const item of cartItems) {
      await ctx.db.delete(item._id);
    }
    results.cartItems = cartItems.length;
    console.log(`  ✅ Deleted ${cartItems.length} cart items`);

    // Delete carts
    const carts = await ctx.db.query('carts').collect();
    for (const cart of carts) {
      await ctx.db.delete(cart._id);
    }
    results.carts = carts.length;
    console.log(`  ✅ Deleted ${carts.length} carts`);

    // Delete orders
    const orders = await ctx.db.query('orders').collect();
    for (const order of orders) {
      await ctx.db.delete(order._id);
    }
    results.orders = orders.length;
    console.log(`  ✅ Deleted ${orders.length} orders`);

    return results;
  },
});
