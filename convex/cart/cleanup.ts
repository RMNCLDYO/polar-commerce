import { v } from 'convex/values';
import { internalMutation } from '../_generated/server';

export const cleanupExpiredCarts = internalMutation({
  args: {},
  returns: v.object({
    deletedCarts: v.number(),
    deletedItems: v.number(),
  }),
  handler: async (ctx) => {
    const now = Date.now();

    const expiredCarts = await ctx.db
      .query('carts')
      .withIndex('expiresAt')
      .filter((q) => {
        const expiresAt = q.field('expiresAt');
        return q.and(
          q.neq(expiresAt, undefined),
          q.lt(expiresAt, now),
        );
      })
      .collect();

    let deletedCarts = 0;
    let deletedItems = 0;

    for (const cart of expiredCarts) {
      const items = await ctx.db
        .query('cartItems')
        .withIndex('cartId_catalogId', (q) => q.eq('cartId', cart._id))
        .collect();

      for (const item of items) {
        await ctx.db.delete(item._id);
        deletedItems++;
      }

      await ctx.db.delete(cart._id);
      deletedCarts++;
    }

    return {
      deletedCarts,
      deletedItems,
    };
  },
});

export const cleanupAbandonedCarts = internalMutation({
  args: {},
  returns: v.object({
    deletedCarts: v.number(),
  }),
  handler: async (ctx) => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const oldCarts = await ctx.db
      .query('carts')
      .filter((q) => q.lt(q.field('updatedAt'), sevenDaysAgo))
      .collect();

    let deletedCarts = 0;

    for (const cart of oldCarts) {
      const items = await ctx.db
        .query('cartItems')
        .withIndex('cartId_catalogId', (q) => q.eq('cartId', cart._id))
        .first();

      if (!items) {
        await ctx.db.delete(cart._id);
        deletedCarts++;
      }
    }

    return {
      deletedCarts,
    };
  },
});
