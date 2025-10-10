import { Polar as PolarSDK } from '@polar-sh/sdk';
import { v } from 'convex/values';
import { api, components, internal } from '../_generated/api';
import { action, internalAction } from '../_generated/server';

// Local type definitions for Polar SDK
interface PolarCustomer {
  id: string;
  email: string;
  emailVerified?: boolean;
  name?: string | null;
  externalId?: string | null;
  avatarUrl?: string | null;
  billingAddress?: {
    line1?: string | null;
    line2?: string | null;
    postalCode?: string | null;
    city?: string | null;
    state?: string | null;
    country: string;
  } | null;
  taxId?: string[] | null;
  createdAt: string;
  modifiedAt?: string | null;
  deletedAt?: string | null;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

interface CustomersListResponse {
  result?: {
    items?: PolarCustomer[];
  };
}

interface PageIteratorResponse {
  ok: boolean;
  value?: CustomersListResponse;
}

/**
 * Auto-sync user to Polar when they sign up
 * This is called automatically via Better Auth hooks
 */
export const onUserCreated = internalAction({
  args: {
    userId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (
    ctx,
    { userId, email, name },
  ): Promise<{
    success: boolean;
    customerId?: string;
    linkedOrders?: number;
    error?: string;
  }> => {
    console.log(`🆕 New user created: ${email}`);

    try {
      // 1. Ensure Polar customer exists
      const result = await ctx.runAction(
        // biome-ignore lint/suspicious/noTsIgnore: Type instantiation depth requires @ts-ignore for dual tsconfig
        // @ts-ignore - Type instantiation depth issue with Convex generated types (tsc -p convex only)
        api.polarCustomer.ensurePolarCustomer,
        {
          userId,
          email,
          name,
        },
      );

      console.log(`✅ Polar customer ready for ${email} (${result.source})`);

      // 2. Link any existing guest orders to this user
      const orderLinkResult = await ctx.runMutation(
        internal.orders.sync.linkOrdersToUser,
        {
          userId,
          email,
        },
      );

      if (orderLinkResult.linkedOrders > 0) {
        console.log(
          `✅ Linked ${orderLinkResult.linkedOrders} guest orders to user ${email}`,
        );
      }

      // 3. User starts on free tier by default
      // No subscription needed - tier detection handles this
      console.log(`✅ User ${email} assigned to FREE tier (default)`);

      return {
        success: true,
        customerId: result.customerId,
        linkedOrders: orderLinkResult.linkedOrders,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Failed to sync user ${email}:`, error);
      // Don't throw - user account still created, they can checkout later
      return { success: false, error: errorMessage };
    }
  },
});

/**
 * Sync all existing users to Polar
 * Useful for backfilling or fixing orphaned accounts
 */
export const syncAllUsers = action({
  args: {},
  handler: async (_ctx) => {
    console.log('🔄 Syncing all users to Polar...\n');

    // Note: We can't directly query betterAuth.users
    // This would need to be called from client context with authenticated users
    console.log('⚠️  This action should be called per-user from the client');
    console.log('   Use: api.userSync.ensureCurrentUserSynced');

    return { message: 'Use ensureCurrentUserSynced for each user' };
  },
});

/**
 * Ensure user is synced to Polar (called with userId and email)
 */
export const ensureUserSynced = action({
  args: {
    userId: v.string(),
    email: v.string(),
  },
  handler: async (
    ctx,
    { userId, email },
  ): Promise<{
    success: boolean;
    userId: string;
    customerId: string;
    source: string;
  }> => {
    console.log(`Ensuring user is synced: ${email}`);

    const result = await ctx.runAction(api.polarCustomer.ensurePolarCustomer, {
      userId,
      email,
    });

    if (!result.customerId || !result.source) {
      throw new Error('Failed to ensure Polar customer');
    }

    return {
      success: true,
      userId,
      customerId: result.customerId,
      source: result.source,
    };
  },
});

/**
 * Cron job: Sync orphaned customers from Polar
 * Finds customers in Polar that aren't linked in Convex
 */
export const syncOrphanedCustomers = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log('🔄 [CRON] Checking for orphaned Polar customers...');

    const token = process.env.POLAR_ORGANIZATION_TOKEN;
    if (!token) {
      console.error('❌ POLAR_ORGANIZATION_TOKEN not set');
      return;
    }

    const polarClient = new PolarSDK({
      accessToken: token,
      server:
        (process.env.POLAR_SERVER as 'sandbox' | 'production') || 'sandbox',
    });

    try {
      // Get all customers from Polar
      const customersIter = await polarClient.customers.list({ limit: 100 });
      const allCustomers: PolarCustomer[] = [];

      for await (const response of customersIter) {
        const resp = response as unknown as PageIteratorResponse;
        if (resp.ok && resp.value) {
          const data = resp.value;
          const items = data.result?.items || [];
          allCustomers.push(...items);
        }
      }

      console.log(`Found ${allCustomers.length} customers in Polar`);

      let synced = 0;
      let alreadyLinked = 0;

      for (const customer of allCustomers) {
        const userIdRaw = customer.metadata?.userId;

        if (!userIdRaw || typeof userIdRaw !== 'string') {
          console.log(`⚠️  Customer ${customer.email} has no userId metadata`);
          continue;
        }

        const userId: string = userIdRaw;

        // Check if customer is already linked in Convex
        const existing = await ctx.runQuery(
          components.polar.lib.getCustomerByUserId,
          { userId },
        );

        if (existing) {
          alreadyLinked++;
          continue;
        }

        // Customer is orphaned - sync it
        try {
          await ctx.runMutation(components.polar.lib.insertCustomer, {
            id: customer.id,
            userId,
            email: customer.email,
            email_verified: customer.emailVerified ?? false,
            name: customer.name ?? null,
            external_id: customer.externalId ?? null,
            avatar_url: customer.avatarUrl ?? null,
            // @ts-expect-error - Polar API country string doesn't match Convex strict country code union
            billing_address: customer.billingAddress
              ? {
                  line1: customer.billingAddress.line1 ?? null,
                  line2: customer.billingAddress.line2 ?? null,
                  postal_code: customer.billingAddress.postalCode ?? null,
                  city: customer.billingAddress.city ?? null,
                  state: customer.billingAddress.state ?? null,
                  country: customer.billingAddress.country,
                }
              : null,
            tax_id: customer.taxId
              ? Array.isArray(customer.taxId)
                ? customer.taxId
                : null
              : null,
            created_at: customer.createdAt,
            modified_at: customer.modifiedAt ?? null,
            deleted_at: customer.deletedAt ?? null,
            metadata: (customer.metadata || {}) as Record<
              string,
              string | number | boolean
            >,
          });

          console.log(`✅ Synced orphaned customer: ${customer.email}`);
          synced++;
        } catch (error) {
          console.error(`Failed to sync customer ${customer.email}:`, error);
        }
      }

      console.log(`✅ [CRON] Orphaned customer sync complete`);
      console.log(`   - Already linked: ${alreadyLinked}`);
      console.log(`   - Newly synced: ${synced}`);
    } catch (error: unknown) {
      console.error('❌ [CRON] Orphaned customer sync failed:', error);
    }
  },
});
