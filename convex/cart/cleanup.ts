/**
 * Cart cleanup tasks
 * Scheduled jobs to maintain cart hygiene
 */

import { internalMutation } from '../_generated/server';
import { logger } from '../utils/logger';

/**
 * Clean up expired guest carts
 * Removes carts and their items that have passed their expiration date
 *
 * This is called by a daily cron job
 */
export const cleanupExpiredCarts = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Find all expired carts
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

    logger.info(`[Cleanup] Found ${expiredCarts.length} expired carts`);

    let deletedCarts = 0;
    let deletedItems = 0;

    for (const cart of expiredCarts) {
      // Delete all cart items first
      const items = await ctx.db
        .query('cartItems')
        .withIndex('cartId', (q) => q.eq('cartId', cart._id))
        .collect();

      for (const item of items) {
        await ctx.db.delete(item._id);
        deletedItems++;
      }

      // Delete the cart
      await ctx.db.delete(cart._id);
      deletedCarts++;
    }

    logger.info(
      `[Cleanup] Deleted ${deletedCarts} carts and ${deletedItems} items`,
    );

    return {
      deletedCarts,
      deletedItems,
    };
  },
});

/**
 * Clean up abandoned carts (no items and not updated in 7 days)
 * Helps keep the database clean
 */
export const cleanupAbandonedCarts = internalMutation({
  args: {},
  handler: async (ctx) => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    // Get all carts older than 7 days
    const oldCarts = await ctx.db
      .query('carts')
      .filter((q) => q.lt(q.field('updatedAt'), sevenDaysAgo))
      .collect();

    logger.info(`[Cleanup] Checking ${oldCarts.length} old carts`);

    let deletedCarts = 0;

    for (const cart of oldCarts) {
      // Check if cart has any items
      const items = await ctx.db
        .query('cartItems')
        .withIndex('cartId', (q) => q.eq('cartId', cart._id))
        .first();

      // Only delete if empty
      if (!items) {
        await ctx.db.delete(cart._id);
        deletedCarts++;
      }
    }

    logger.info(`[Cleanup] Deleted ${deletedCarts} abandoned carts`);

    return {
      deletedCarts,
    };
  },
});
