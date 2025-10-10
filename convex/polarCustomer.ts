import { Polar as PolarSDK } from '@polar-sh/sdk';
import { v } from 'convex/values';
import { components } from './_generated/api';
import { action, internalAction } from './_generated/server';
import { validateMetadata } from './polar/types';

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
  createdAt: string | Date;
  modifiedAt?: string | Date | null;
  deletedAt?: string | Date | null;
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

interface PolarCustomerUpdate {
  email?: string;
  name?: string | null;
  billingAddress?: {
    line1?: string | null;
    line2?: string | null;
    postalCode?: string | null;
    city?: string | null;
    state?: string | null;
    country: string;
  } | null;
  taxId?: string[] | null;
  metadata?: Record<string, string | number | boolean>;
}

/**
 * Helper to map Polar API customer to our schema
 * Converts dates to ISO strings for Convex Polar component
 */
function mapPolarCustomerToSchema(
  polarCustomer: PolarCustomer,
  userId: string,
) {
  return {
    id: polarCustomer.id,
    userId,
    email: polarCustomer.email,
    email_verified: polarCustomer.emailVerified ?? false,
    name: polarCustomer.name ?? null,
    external_id: polarCustomer.externalId ?? null,
    avatar_url: polarCustomer.avatarUrl ?? null,
    billing_address: polarCustomer.billingAddress
      ? {
          line1: polarCustomer.billingAddress.line1 ?? null,
          line2: polarCustomer.billingAddress.line2 ?? null,
          postal_code: polarCustomer.billingAddress.postalCode ?? null,
          city: polarCustomer.billingAddress.city ?? null,
          state: polarCustomer.billingAddress.state ?? null,
          country: polarCustomer.billingAddress.country,
        }
      : null,
    tax_id: polarCustomer.taxId
      ? Array.isArray(polarCustomer.taxId)
        ? polarCustomer.taxId
        : null
      : null,
    // Convert Date objects to ISO strings (Polar component expects strings)
    created_at:
      polarCustomer.createdAt instanceof Date
        ? polarCustomer.createdAt.toISOString()
        : typeof polarCustomer.createdAt === 'string'
          ? polarCustomer.createdAt
          : new Date().toISOString(),
    modified_at: polarCustomer.modifiedAt
      ? polarCustomer.modifiedAt instanceof Date
        ? polarCustomer.modifiedAt.toISOString()
        : polarCustomer.modifiedAt
      : null,
    deleted_at: polarCustomer.deletedAt
      ? polarCustomer.deletedAt instanceof Date
        ? polarCustomer.deletedAt.toISOString()
        : polarCustomer.deletedAt
      : null,
    metadata: polarCustomer.metadata || {},
  };
}

/**
 * Ensures a Polar customer exists for a user
 * Simplified to rely on the Polar component's webhook-based sync
 *
 * Flow:
 * 1. Check if customer exists in Convex (synced via webhook)
 * 2. If not, create in Polar with basic info
 * 3. Webhook will sync it back to Convex automatically
 *
 * Note: In most cases, you don't need to call this explicitly.
 * Just pass customer_email to checkout and Polar will handle it.
 */
export const ensurePolarCustomer = action({
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
    source?: string;
    message?: string;
  }> => {
    // Check if customer already exists in Convex (synced via webhook)
    const existingCustomer = await ctx.runQuery(
      components.polar.lib.getCustomerByUserId,
      {
        userId,
      },
    );

    if (existingCustomer) {
      return {
        success: true,
        customerId: existingCustomer.id,
        source: 'existing',
      };
    }

    // Customer not in Convex - create in Polar
    // Webhook will automatically sync it back to Convex
    const token = process.env.POLAR_ORGANIZATION_TOKEN;
    if (!token) {
      throw new Error('POLAR_ORGANIZATION_TOKEN not set');
    }

    const polarClient = new PolarSDK({
      accessToken: token,
      server:
        (process.env.POLAR_SERVER as 'sandbox' | 'production') || 'sandbox',
    });

    try {
      // Create customer in Polar with minimal info
      const result = await polarClient.customers.create({
        email,
        externalId: userId,
        name: name || undefined,
        metadata: {
          userId,
        },
      });

      if (!result) {
        throw new Error('Failed to create customer in Polar');
      }

      // Webhook will sync this customer to Convex automatically
      // But we can also sync it immediately for better UX
      await ctx.runMutation(
        components.polar.lib.insertCustomer,
        // @ts-expect-error - Polar SDK country type vs component country code type mismatch
        mapPolarCustomerToSchema(result, userId),
      );

      return {
        success: true,
        customerId: result.id,
        source: 'created',
      };
    } catch (error: unknown) {
      console.error('Failed to ensure Polar customer:', error);

      // If customer already exists in Polar but not in Convex
      // (can happen if webhook hasn't fired yet or failed)
      const isExistingCustomerError =
        (error as { statusCode?: number }).statusCode === 422 ||
        (error as { message?: string }).message?.includes('already exists');

      if (isExistingCustomerError) {
        // Try to find the existing customer in Polar
        try {
          const customersIter = await polarClient.customers.list({
            email: email,
            limit: 1,
          });

          for await (const response of customersIter) {
            const resp = response as unknown as PageIteratorResponse;
            const items =
              resp.ok && resp.value ? resp.value.result?.items || [] : [];
            if (items.length > 0) {
              const customer = items[0];
              if (!customer) continue;

              // Update metadata to include userId
              const updatedMetadata = {
                ...(customer.metadata || {}),
                userId,
              };

              try {
                await polarClient.customers.update({
                  id: customer.id,
                  customerUpdate: {
                    metadata: updatedMetadata,
                    externalId: userId,
                  },
                });
              } catch (updateError) {
                console.error(
                  'Failed to update existing customer:',
                  updateError,
                );
              }

              // Sync to Convex immediately
              await ctx.runMutation(
                components.polar.lib.insertCustomer,
                // @ts-expect-error - Polar SDK country type vs component country code type mismatch
                mapPolarCustomerToSchema(
                  { ...customer, metadata: updatedMetadata },
                  userId,
                ),
              );

              return {
                success: true,
                customerId: customer.id,
                source: 'recovered',
              };
            }
          }
        } catch (recoveryError) {
          console.error('Failed to recover existing customer:', recoveryError);
        }
      }

      throw error;
    }
  },
});

/**
 * Update a customer's information
 * Updates both Polar and Convex (via webhook)
 */
export const updateCustomer = action({
  args: {
    userId: v.string(),
    updates: v.object({
      email: v.optional(v.string()),
      name: v.optional(v.union(v.string(), v.null())),
      billing_address: v.optional(
        v.union(
          v.object({
            line1: v.union(v.string(), v.null()),
            line2: v.union(v.string(), v.null()),
            postal_code: v.union(v.string(), v.null()),
            city: v.union(v.string(), v.null()),
            state: v.union(v.string(), v.null()),
            country: v.string(),
          }),
          v.null(),
        ),
      ),
      tax_id: v.optional(v.union(v.array(v.string()), v.null())),
      metadata: v.optional(v.record(v.string(), v.any())),
    }),
  },
  handler: async (ctx, { userId, updates }) => {
    if (updates.metadata) {
      const validation = validateMetadata(updates.metadata);
      if (!validation.valid) {
        throw new Error(`Invalid metadata: ${validation.error}`);
      }
    }

    if (updates.tax_id) {
      if (updates.tax_id.length !== 2) {
        throw new Error(
          'Tax ID must be an array with exactly 2 elements: [value, format]',
        );
      }
    }

    const existingCustomer = await ctx.runQuery(
      components.polar.lib.getCustomerByUserId,
      {
        userId,
      },
    );

    if (!existingCustomer) {
      throw new Error(`Customer not found for user: ${userId}`);
    }

    const token = process.env.POLAR_ORGANIZATION_TOKEN;
    if (!token) {
      throw new Error('POLAR_ORGANIZATION_TOKEN not set');
    }

    const polarClient = new PolarSDK({
      accessToken: token,
      server:
        (process.env.POLAR_SERVER as 'sandbox' | 'production') || 'sandbox',
    });

    try {
      const polarUpdates: PolarCustomerUpdate = {};

      if (updates.email !== undefined) polarUpdates.email = updates.email;
      if (updates.name !== undefined) polarUpdates.name = updates.name;
      if (updates.billing_address !== undefined)
        polarUpdates.billingAddress = updates.billing_address;
      if (updates.tax_id !== undefined) polarUpdates.taxId = updates.tax_id;
      if (updates.metadata !== undefined)
        polarUpdates.metadata = updates.metadata;

      const updatedCustomer = await polarClient.customers.update({
        id: existingCustomer.id,
        // @ts-expect-error - Polar SDK country type vs generic string type mismatch
        customerUpdate: polarUpdates,
      });

      if (!updatedCustomer) {
        throw new Error('Failed to update customer in Polar');
      }

      // Sync the updated customer back to Convex
      // (webhook will also do this, but we do it immediately for better UX)
      await ctx.runMutation(
        components.polar.lib.upsertCustomer,
        // @ts-expect-error - Polar SDK country type vs component country code type mismatch
        mapPolarCustomerToSchema(updatedCustomer, userId),
      );

      return {
        success: true,
        customerId: updatedCustomer.id,
      };
    } catch (error: unknown) {
      console.error('Failed to update Polar customer:', error);
      throw error;
    }
  },
});

/**
 * Delete a customer from Polar
 * This is an internal action - should only be called when deleting user accounts
 */
export const deleteCustomer = internalAction({
  args: {
    userId: v.string(),
  },
  handler: async (
    ctx,
    { userId },
  ): Promise<{
    success: boolean;
    customerId?: string;
    message?: string;
  }> => {
    const existingCustomer = await ctx.runQuery(
      components.polar.lib.getCustomerByUserId,
      {
        userId,
      },
    );

    if (!existingCustomer) {
      console.log(`No Polar customer found for user: ${userId}`);
      return { success: true, message: 'No customer to delete' };
    }

    const token = process.env.POLAR_ORGANIZATION_TOKEN;
    if (!token) {
      throw new Error('POLAR_ORGANIZATION_TOKEN not set');
    }

    const polarClient = new PolarSDK({
      accessToken: token,
      server:
        (process.env.POLAR_SERVER as 'sandbox' | 'production') || 'sandbox',
    });

    try {
      await polarClient.customers.delete({ id: existingCustomer.id });

      console.log(`✅ Deleted Polar customer: ${existingCustomer.id}`);

      // Webhook will handle Convex cleanup via customer.deleted event
      return { success: true, customerId: existingCustomer.id };
    } catch (error: unknown) {
      console.error('Failed to delete Polar customer:', error);
      throw error;
    }
  },
});
