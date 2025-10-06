import { v } from 'convex/values';
import { action } from './_generated/server';
import { components } from './_generated/api';
import { Polar as PolarSDK } from '@polar-sh/sdk';

/**
 * Ensures a Polar customer exists for a user
 * Handles the case where a customer may exist in Polar but not in Convex
 * Should be called after user signup or before first checkout
 */
export const ensurePolarCustomer = action({
  args: {
    userId: v.string(),
    email: v.string(),
  },
  handler: async (ctx, { userId, email }) => {
    // Check if customer already exists in Convex via the Polar component
    const existingCustomer = await ctx.runQuery(
      components.polar.lib.getCustomerByUserId,
      { userId },
    );

    if (existingCustomer) {
      return {
        success: true,
        customerId: existingCustomer.id,
        source: 'existing',
      };
    }

    // Customer not in Convex - check/create in Polar
    const polarClient = new PolarSDK({
      accessToken: process.env.POLAR_ORGANIZATION_TOKEN!,
      server:
        (process.env.POLAR_SERVER as 'sandbox' | 'production') || 'sandbox',
    });

    try {
      // Try to find customer in Polar by email
      const customersIter = await polarClient.customers.list({
        email: email,
        limit: 1,
      });

      let polarCustomer = null;
      for await (const response of customersIter) {
        const items = (response as any).result?.items || [];
        if (items.length > 0) {
          polarCustomer = items[0];
          break;
        }
      }

      if (polarCustomer) {
        // Customer exists in Polar but not in Convex - sync it
        await ctx.runMutation(components.polar.lib.insertCustomer, {
          id: polarCustomer.id,
          userId,
          metadata: polarCustomer.metadata || {},
        });

        return {
          success: true,
          customerId: polarCustomer.id,
          source: 'polar-synced',
        };
      }

      // Customer doesn't exist anywhere - create in Polar
      const result = await polarClient.customers.create({
        email,
        metadata: {
          userId,
        },
      });

      if (!result) {
        throw new Error('Failed to create customer in Polar');
      }

      // Store in Convex via component
      await ctx.runMutation(components.polar.lib.insertCustomer, {
        id: result.id,
        userId,
        metadata: result.metadata || {},
      });

      return {
        success: true,
        customerId: result.id,
        source: 'created',
      };
    } catch (error: any) {
      console.error('Failed to ensure Polar customer:', error);

      // If customer already exists error, try to find and sync
      if (
        error.statusCode === 422 ||
        error.message?.includes('already exists')
      ) {
        try {
          const customersIter = await polarClient.customers.list({
            email: email,
            limit: 1,
          });

          for await (const response of customersIter) {
            const items = (response as any).result?.items || [];
            if (items.length > 0) {
              const customer = items[0];

              // Sync to Convex
              await ctx.runMutation(components.polar.lib.insertCustomer, {
                id: customer.id,
                userId,
                metadata: customer.metadata || {},
              });

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
