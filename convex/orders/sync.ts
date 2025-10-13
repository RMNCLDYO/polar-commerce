import { v } from 'convex/values';
import {
  internalMutation,
  internalQuery,
  mutation,
} from '../_generated/server';
import { logger } from '../utils/logger';
import { vLinkOrdersResponse } from '../utils/validation';

/**
 * Link guest orders to a newly created user account
 * This runs when a user signs up with an email that has existing orders
 */
export const linkOrdersToUser = internalMutation({
  args: {
    userId: v.string(),
    email: v.string(),
  },
  returns: vLinkOrdersResponse,
  handler: async (ctx, { userId, email }) => {
    // Find all orders with this email that don't have a userId yet
    const guestOrders = await ctx.db
      .query('orders')
      .withIndex('email', (q) => q.eq('email', email))
      .filter((q) => q.eq(q.field('userId'), undefined))
      .collect();

    logger.info(`Found ${guestOrders.length} guest orders for email: ${email}`);

    // Link each order to the user
    for (const order of guestOrders) {
      await ctx.db.patch(order._id, {
        userId,
      });
      logger.debug(`Linked order ${order.checkoutId} to user ${userId}`);
    }

    return {
      success: true,
      linkedOrders: guestOrders.length,
    };
  },
});

/**
 * Get all orders for a user (including guest orders by email)
 */
export const getUserOrdersWithEmail = internalQuery({
  args: {
    userId: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, { userId, email }) => {
    const orders = [];

    // Get orders by userId
    if (userId) {
      const userOrders = await ctx.db
        .query('orders')
        .withIndex('userId', (q) => q.eq('userId', userId))
        .order('desc')
        .collect();
      orders.push(...userOrders);
    }

    // Get orders by email that aren't linked to any user yet
    if (email) {
      const emailOrders = await ctx.db
        .query('orders')
        .withIndex('email', (q) => q.eq('email', email))
        .filter((q) => q.eq(q.field('userId'), undefined))
        .order('desc')
        .collect();
      orders.push(...emailOrders);
    }

    // Sort by creation date
    return orders.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * Manually link a user's guest orders (called after login)
 * This is useful if the automatic linking didn't run or needs to be re-run
 */
export const manuallyLinkMyOrders = mutation({
  args: {},
  returns: vLinkOrdersResponse,
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Must be authenticated');
    }

    const userId = identity.subject;
    const email = identity.email;

    if (!email) {
      throw new Error('User email not found');
    }

    // Find all orders with this email that don't have a userId yet
    const guestOrders = await ctx.db
      .query('orders')
      .withIndex('email', (q) => q.eq('email', email))
      .filter((q) => q.eq(q.field('userId'), undefined))
      .collect();

    // Link each order to the user
    for (const order of guestOrders) {
      await ctx.db.patch(order._id, {
        userId,
      });
    }

    return {
      success: true,
      linkedOrders: guestOrders.length,
    };
  },
});
