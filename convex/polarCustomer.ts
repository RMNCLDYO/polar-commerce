import { Polar as PolarSDK } from '@polar-sh/sdk';
import { v } from 'convex/values';
import { components } from './_generated/api';
import { action, internalAction, type ActionCtx } from './_generated/server';
import { validateMetadata } from './polar/types';
import type { CustomerMetadata } from './types/metadata';
import { toCountryCode } from './types/metadata';

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


function mapPolarCustomerToSchema(
  polarCustomer: PolarCustomer | {
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
    taxId?: (string | null)[] | null;
    createdAt: string | Date;
    modifiedAt?: string | Date | null;
    deletedAt?: string | Date | null;
    metadata?: CustomerMetadata & { userId?: string };
    [key: string]: unknown;
  },
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
        ? polarCustomer.taxId.filter((id): id is string => id !== null)
        : null
      : null,
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
    metadata: polarCustomer.metadata || { userId },
  };
}

export async function ensurePolarCustomerHelper(
  ctx: ActionCtx,
  args: {
    userId: string;
    email: string;
    name?: string;
  },
): Promise<{
  success: boolean;
  customerId?: string;
  source?: string;
  message?: string;
}> {
  const { userId, email, name } = args;

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

    const mappedCustomer = mapPolarCustomerToSchema(result, userId);
    await ctx.runMutation(
      components.polar.lib.insertCustomer,
      {
        ...mappedCustomer,
        billing_address: mappedCustomer.billing_address
          ? {
            ...mappedCustomer.billing_address,
            country: toCountryCode(mappedCustomer.billing_address.country),
          }
          : null,
        metadata: mappedCustomer.metadata as Record<string, string | number | boolean>,
        tax_id: mappedCustomer.tax_id
          ? mappedCustomer.tax_id.filter((id): id is string => id !== null)
          : null,
      },
    );

    return {
      success: true,
      customerId: result.id,
      source: 'created',
    };
  } catch (error: unknown) {

    const isExistingCustomerError =
      (error as { statusCode?: number }).statusCode === 422 ||
      (error as { message?: string }).message?.includes('already exists');

    if (isExistingCustomerError) {
      try {
        const customersIter = await polarClient.customers.list({
          email,
          limit: 1,
        });

        for await (const response of customersIter) {
          const resp = response as unknown as PageIteratorResponse;
          const items =
            resp.ok && resp.value ? resp.value.result?.items || [] : [];
          if (items.length > 0) {
            const customer = items[0];
            if (!customer) { continue; }

            const updatedMetadata = {
              ...(customer.metadata || {}),
              userId,
            };

            await polarClient.customers.update({
              id: customer.id,
              customerUpdate: {
                metadata: updatedMetadata,
                externalId: userId,
              },
            });

            const mappedCustomer = mapPolarCustomerToSchema(
              { ...customer, metadata: updatedMetadata },
              userId,
            );
            await ctx.runMutation(
              components.polar.lib.insertCustomer,
              {
                ...mappedCustomer,
                billing_address: mappedCustomer.billing_address
                  ? {
                    ...mappedCustomer.billing_address,
                    country: toCountryCode(mappedCustomer.billing_address.country),
                  }
                  : null,
                metadata: mappedCustomer.metadata as Record<string, string | number | boolean>,
                tax_id: mappedCustomer.tax_id
                  ? mappedCustomer.tax_id.filter((id): id is string => id !== null)
                  : null,
              },
            );

            return {
              success: true,
              customerId: customer.id,
              source: 'recovered',
            };
          }
        }
      } catch (recoveryError) {
        console.error('Customer recovery failed:', recoveryError);
      }
    }

    throw error;
  }
}

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
    return await ensurePolarCustomerHelper(ctx, { userId, email, name });
  },
});

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
      metadata: v.optional(v.record(v.string(), v.union(v.string(), v.number(), v.boolean()))),
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
      const polarUpdates: Parameters<typeof polarClient.customers.update>[0]['customerUpdate'] = {};

      if (updates.email !== undefined) { polarUpdates.email = updates.email; }
      if (updates.name !== undefined) { polarUpdates.name = updates.name; }
      if (updates.billing_address !== undefined) { polarUpdates.billingAddress = updates.billing_address as typeof polarUpdates.billingAddress; }
      if (updates.tax_id !== undefined) { polarUpdates.taxId = updates.tax_id; }
      if (updates.metadata !== undefined) { polarUpdates.metadata = updates.metadata; }

      const updatedCustomer = await polarClient.customers.update({
        id: existingCustomer.id,
        customerUpdate: polarUpdates,
      });

      if (!updatedCustomer) {
        throw new Error('Failed to update customer in Polar');
      }

      const mappedCustomer = mapPolarCustomerToSchema(updatedCustomer, userId);
      await ctx.runMutation(
        components.polar.lib.upsertCustomer,
        {
          ...mappedCustomer,
          billing_address: mappedCustomer.billing_address
            ? {
              ...mappedCustomer.billing_address,
              country: toCountryCode(mappedCustomer.billing_address.country),
            }
            : null,
          metadata: mappedCustomer.metadata as Record<string, string | number | boolean>,
          tax_id: mappedCustomer.tax_id
            ? mappedCustomer.tax_id.filter((id): id is string => id !== null)
            : null,
        },
      );

      return {
        success: true,
        customerId: updatedCustomer.id,
      };
    } catch (error: unknown) {
      throw error;
    }
  },
});

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

      return { success: true, customerId: existingCustomer.id };
    } catch (error: unknown) {
      throw error;
    }
  },
});
