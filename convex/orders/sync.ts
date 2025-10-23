import { v } from 'convex/values';
import {
  internalMutation,
  internalQuery,
  mutation,
} from '../_generated/server';
import { vLinkOrdersResponse } from '../utils/validation';

export const linkOrdersToUser = internalMutation({
  args: {
    userId: v.string(),
    email: v.string(),
  },
  returns: vLinkOrdersResponse,
  handler: async (ctx, { userId, email }) => {
    const guestOrders = await ctx.db
      .query('orders')
      .withIndex('email', (q) => q.eq('email', email))
      .filter((q) => q.eq(q.field('userId'), undefined))
      .collect();

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

export const getUserOrdersWithEmail = internalQuery({
  args: {
    userId: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, { userId, email }) => {
    const orders = [];

    if (userId) {
      const userOrders = await ctx.db
        .query('orders')
        .withIndex('userId', (q) => q.eq('userId', userId))
        .order('desc')
        .collect();
      orders.push(...userOrders);
    }

    if (email) {
      const emailOrders = await ctx.db
        .query('orders')
        .withIndex('email', (q) => q.eq('email', email))
        .filter((q) => q.eq(q.field('userId'), undefined))
        .order('desc')
        .collect();
      orders.push(...emailOrders);
    }

    return orders.sort((a, b) => b.createdAt - a.createdAt);
  },
});

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

    const guestOrders = await ctx.db
      .query('orders')
      .withIndex('email', (q) => q.eq('email', email))
      .filter((q) => q.eq(q.field('userId'), undefined))
      .collect();

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
