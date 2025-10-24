import { v } from 'convex/values';
import { components } from '../_generated/api';
import { query } from '../_generated/server';

export const getDashboardData = query({
  args: {
    ordersLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const limit = args.ordersLimit ?? 5;

    // Fetch orders and subscription in parallel
    const [orders, subscription] = await Promise.all([
      ctx.db
        .query('orders')
        .withIndex('userId', (q) => q.eq('userId', identity.subject))
        .order('desc')
        .take(limit),
      ctx.runQuery(components.polar.lib.getCurrentSubscription, {
        userId: identity.subject,
      }),
    ]);

    return {
      orders,
      subscription,
    };
  },
});
