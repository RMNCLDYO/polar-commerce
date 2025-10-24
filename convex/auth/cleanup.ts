import { internalMutation } from '../_generated/server';

// Cleanup stale anonymous and unverified accounts
// Scheduled to run daily at 2:30 AM UTC in convex/utils/crons.ts
//
// NOTE: This feature is currently disabled because the Better Auth component's
// deleteMany API does not support conditional filtering with 'where' clauses.
// The API only supports deleting all records of a model type, not filtered subsets.
//
// To implement conditional cleanup, we would need to:
// 1. Query users with specific conditions using the Better Auth query API
// 2. Loop through results and delete each user individually
// 3. Handle pagination for large datasets
//
// This would be more complex and potentially less performant than a bulk delete.
// Consider implementing this feature when Better Auth adds conditional delete support.
export const cleanupStaleAccounts = internalMutation({
  args: {},
  handler: async () => {
    console.log('Account cleanup is currently disabled - Better Auth deleteMany does not support conditional filtering');

    return {
      anonymousDeleted: 0,
      unverifiedDeleted: 0,
    };
  },
});
