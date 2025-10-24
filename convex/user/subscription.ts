import { components } from '../_generated/api';
import { query } from '../_generated/server';

export const getUserSubscription = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    return await ctx.runQuery(components.polar.lib.getCurrentSubscription, {
      userId: identity.subject,
    });
  },
});
