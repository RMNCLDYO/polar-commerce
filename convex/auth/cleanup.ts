import { internalMutation } from '../_generated/server';

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
