import { v } from 'convex/values';
import { internalMutation } from '../_generated/server';

export const archiveOldBundles = internalMutation({
  args: {},
  returns: v.object({
    archivedCount: v.number(),
  }),
  handler: async (ctx) => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    const oldBundles = await ctx.db
      .query('catalog')
      .withIndex('category', (q) => q.eq('category', 'bundle'))
      .filter((q) => q.lt(q.field('createdAt'), thirtyDaysAgo))
      .collect();

    let archivedCount = 0;

    for (const bundle of oldBundles) {
      await ctx.db.patch(bundle._id, {
        isActive: false,
        updatedAt: Date.now(),
      });
      archivedCount++;
    }

    return {
      archivedCount,
    };
  },
});
