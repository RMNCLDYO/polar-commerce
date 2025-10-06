import { cronJobs } from 'convex/server';

const crons = cronJobs();

// No cron jobs needed!
// Real-time sync is handled by:
// 1. Webhooks for Polar → Convex (instant)
// 2. Mutations for Convex → Polar (instant via productsSync.ts)

export default crons;
