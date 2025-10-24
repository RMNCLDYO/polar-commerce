import { v } from 'convex/values';
import { query } from '../_generated/server';

export const getUserOrders = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const limit = args.limit ?? 10;

    const orders = await ctx.db
      .query('orders')
      .withIndex('userId', (q) => q.eq('userId', identity.subject))
      .order('desc')
      .take(limit);

    return orders;
  },
});
