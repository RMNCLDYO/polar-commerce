import { cronJobs } from 'convex/server';
import { internal } from '../_generated/api';

const crons = cronJobs();

/**
 * Clean up expired guest carts daily at 2 AM UTC
 * Removes carts that have passed their expiration date
 */
crons.daily(
  'cleanup expired carts',
  { hourUTC: 2, minuteUTC: 0 },
  internal.cart.cleanup.cleanupExpiredCarts,
);

/**
 * Clean up abandoned empty carts weekly on Monday at 3 AM UTC
 * Removes empty carts that haven't been updated in 7+ days
 */
crons.weekly(
  'cleanup abandoned carts',
  { hourUTC: 3, minuteUTC: 0, dayOfWeek: 'monday' },
  internal.cart.cleanup.cleanupAbandonedCarts,
);

/**
 * Archive old bundle products weekly on Monday at 4 AM UTC
 * Bundles are temporary products created for multi-item checkouts
 */
crons.weekly(
  'archive old bundles',
  { hourUTC: 4, minuteUTC: 0, dayOfWeek: 'monday' },
  internal.catalog.cleanup.archiveOldBundles,
);

/**
 * Clean up expired rate limit records hourly
 * Removes rate limit records that are past their expiration time
 */
crons.hourly(
  'cleanup expired rate limits',
  { minuteUTC: 0 },
  internal.lib.rateLimit.cleanup,
);

// Real-time sync is handled by:
// 1. Webhooks for Polar → Convex (instant)
// 2. Mutations for Convex → Polar (instant via productsSync.ts)

export default crons;
