/**
 * Catalog cleanup tasks
 * Scheduled jobs to maintain product hygiene
 */

import { internalMutation } from '../_generated/server';
import { logger } from '../utils/logger';

/**
 * Archive old bundle products created for checkout
 * Bundles are temporary products created when checking out with multiple items
 *
 * This is called by a weekly cron job
 */
export const archiveOldBundles = internalMutation({
  args: {},
  handler: async (ctx) => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    // Find bundle products older than 30 days
    const oldBundles = await ctx.db
      .query('catalog')
      .withIndex('category', (q) => q.eq('category', 'bundle'))
      .filter((q) => q.lt(q.field('createdAt'), thirtyDaysAgo))
      .collect();

    logger.info(`[Cleanup] Found ${oldBundles.length} old bundle products`);

    let archivedCount = 0;

    for (const bundle of oldBundles) {
      // Mark as inactive instead of deleting (preserves order history)
      await ctx.db.patch(bundle._id, {
        isActive: false,
        updatedAt: Date.now(),
      });
      archivedCount++;
    }

    logger.info(`[Cleanup] Archived ${archivedCount} bundle products`);

    return {
      archivedCount,
    };
  },
});
