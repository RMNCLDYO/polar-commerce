import { cronJobs } from 'convex/server';
import { internal } from '../_generated/api';

const crons = cronJobs();

crons.daily(
  'cleanup expired carts',
  { hourUTC: 2, minuteUTC: 0 },
  internal.cart.cleanup.cleanupExpiredCarts,
);

crons.weekly(
  'cleanup abandoned carts',
  { hourUTC: 3, minuteUTC: 0, dayOfWeek: 'monday' },
  internal.cart.cleanup.cleanupAbandonedCarts,
);

crons.weekly(
  'archive old bundles',
  { hourUTC: 4, minuteUTC: 0, dayOfWeek: 'monday' },
  internal.catalog.cleanup.archiveOldBundles,
);

crons.hourly(
  'cleanup expired rate limits',
  { minuteUTC: 0 },
  internal.lib.rateLimit.cleanup,
);

export default crons;
