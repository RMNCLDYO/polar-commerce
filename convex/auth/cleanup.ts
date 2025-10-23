import { components } from '../_generated/api';
import { internalMutation } from '../_generated/server';

// Cleanup stale anonymous and unverified accounts
// Scheduled to run daily at 2:30 AM UTC in convex/utils/crons.ts
//
// This function uses the Better Auth component's deleteMany API to remove:
// 1. Anonymous users (no email) older than 30 days
// 2. Unverified users older than 7 days
export const cleanupStaleAccounts = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const DAYS_30_AGO = now - (30 * 24 * 60 * 60 * 1000);
    const DAYS_7_AGO = now - (7 * 24 * 60 * 60 * 1000);

    let anonymousDeleted = 0;
    let unverifiedDeleted = 0;

    try {
      // Delete anonymous users (those without email) older than 30 days
      // @ts-ignore - Better Auth adapter type inference issue
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const anonymousResult = await ctx.runMutation(
        components.betterAuth.adapter.deleteMany,
        {
          input: {
            // @ts-ignore
            model: 'user',
            where: [
              // @ts-ignore
              { field: 'email', operator: '==', value: null },
              // @ts-ignore
              { field: 'createdAt', operator: '<', value: DAYS_30_AGO },
            ],
          },
          paginationOpts: { cursor: null, numItems: 1000 },
        },
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      anonymousDeleted = anonymousResult?.deletedCount || 0;
    } catch (error) {
      console.error('Failed to delete anonymous users', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    try {
      // Delete unverified users older than 7 days
      // @ts-ignore - Better Auth adapter type inference issue
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const unverifiedResult = await ctx.runMutation(
        components.betterAuth.adapter.deleteMany,
        {
          input: {
            // @ts-ignore
            model: 'user',
            where: [
              // @ts-ignore
              { field: 'emailVerified', operator: '==', value: false },
              // @ts-ignore
              { field: 'createdAt', operator: '<', value: DAYS_7_AGO },
            ],
          },
          paginationOpts: { cursor: null, numItems: 1000 },
        },
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      unverifiedDeleted = unverifiedResult?.deletedCount || 0;
    } catch (error) {
      console.error('Failed to delete unverified users', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // eslint-disable-next-line no-console
    console.log('Account cleanup completed', {
      anonymousDeleted,
      unverifiedDeleted,
    });

    return {
      anonymousDeleted,
      unverifiedDeleted,
    };
  },
});
