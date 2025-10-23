import { Polar as PolarSDK } from '@polar-sh/sdk';
import { v } from 'convex/values';
import { api, components, internal } from '../_generated/api';
import { action, internalAction } from '../_generated/server';
import { ensurePolarCustomerHelper } from '../polarCustomer';
import { toCountryCode } from '../types/metadata';
import type { CustomerMetadata } from '../types/metadata';

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
  metadata?: CustomerMetadata & { userId?: string };
  [key: string]: unknown;
}

interface CustomersListResponse {
  result?: {
    items?: PolarCustomer[];
  };
}

type PageIteratorResponse = {
  ok: boolean;
  value?: CustomersListResponse;
}

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
    try {
      const result = await ctx.runAction(
        // @ts-ignore - Type instantiation depth issue with Convex generated types
        api.polarCustomer.ensurePolarCustomer,
        {
          userId,
          email,
          name,
        },
      );

      const orderLinkResult = await ctx.runMutation(
        // @ts-ignore - Type instantiation depth issue with Convex generated types
        internal.orders.sync.linkOrdersToUser,
        {
          userId,
          email,
        },
      );

      return {
        success: true,
        customerId: result.customerId,
        linkedOrders: orderLinkResult.linkedOrders,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  },
});

export const syncAllUsers = action({
  args: {},
  returns: v.object({ message: v.string() }),
  handler: async (_ctx) => {
    return { message: 'Use ensureCurrentUserSynced for each user' };
  },
});

export const ensureUserSynced = action({
  args: {
    userId: v.string(),
    email: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    userId: v.string(),
    customerId: v.string(),
    source: v.string(),
  }),
  handler: async (
    ctx,
    { userId, email },
  ): Promise<{
    success: boolean;
    userId: string;
    customerId: string;
    source: string;
  }> => {
    const result = await ensurePolarCustomerHelper(ctx, {
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

export const syncOrphanedCustomers = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const token = process.env.POLAR_ORGANIZATION_TOKEN;
    if (!token) {
      return null;
    }

    const polarClient = new PolarSDK({
      accessToken: token,
      server:
        (process.env.POLAR_SERVER as 'sandbox' | 'production') || 'sandbox',
    });

    try {
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

      for (const customer of allCustomers) {
        const userIdRaw = customer.metadata?.userId;

        if (!userIdRaw || typeof userIdRaw !== 'string') {
          continue;
        }

        const userId: string = userIdRaw;

        const existing = await ctx.runQuery(
          components.polar.lib.getCustomerByUserId,
          { userId },
        );

        if (existing) {
          continue;
        }

        await ctx.runMutation(components.polar.lib.insertCustomer, {
          id: customer.id,
          userId,
          email: customer.email,
          email_verified: customer.emailVerified ?? false,
          name: customer.name ?? null,
          external_id: customer.externalId ?? null,
          avatar_url: customer.avatarUrl ?? null,
          billing_address: customer.billingAddress
            ? {
                line1: customer.billingAddress.line1 ?? null,
                line2: customer.billingAddress.line2 ?? null,
                postal_code: customer.billingAddress.postalCode ?? null,
                city: customer.billingAddress.city ?? null,
                state: customer.billingAddress.state ?? null,
                country: toCountryCode(customer.billingAddress.country),
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
          metadata: (customer.metadata || { userId }) as Record<string, string | number | boolean>,
        });
      }
    } catch {
    }

    return null;
  },
});
