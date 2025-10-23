import type { MutationCtx, QueryCtx } from '../_generated/server';

export const RATE_LIMITS = {
  cart: {
    maxRequests: 100,
    windowMs: 60 * 1000,
  },

  checkout: {
    maxRequests: 10,
    windowMs: 60 * 1000,
  },

  catalog: {
    maxRequests: 300,
    windowMs: 60 * 1000,
  },

  auth: {
    maxRequests: 5,
    windowMs: 60 * 1000,
  },

  webhook: {
    maxRequests: 50,
    windowMs: 60 * 1000,
  },
} as const;

export type RateLimitType = keyof typeof RATE_LIMITS;

export class RateLimitError extends Error {
  constructor(
    public readonly limitType: RateLimitType,
    public readonly retryAfter: number,
  ) {
    super(`Rate limit exceeded for ${limitType}. Try again in ${retryAfter}ms`);
    this.name = 'RateLimitError';
  }
}

function getRateLimitKey(
  limitType: RateLimitType,
  userId?: string,
  sessionId?: string,
): string {
  const identifier = userId || sessionId || 'anonymous';
  return `rateLimit:${limitType}:${identifier}`;
}

export async function checkRateLimit(
  ctx: MutationCtx | QueryCtx,
  limitType: RateLimitType,
  userId?: string,
  sessionId?: string,
): Promise<void> {
  const config = RATE_LIMITS[limitType];
  const key = getRateLimitKey(limitType, userId, sessionId);
  const now = Date.now();
  const windowStart = now - config.windowMs;

  const existing = await ctx.db
    .query('rateLimits')
    .withIndex('key', (q) => q.eq('key', key))
    .first();

  if (!existing) {
    if ('db' in ctx && 'insert' in ctx.db) {
      await (ctx as MutationCtx).db.insert('rateLimits', {
        key,
        requests: [now],
        createdAt: now,
        updatedAt: now,
        expiresAt: now + config.windowMs,
      });
    }
    return;
  }

  const recentRequests = existing.requests.filter((timestamp) => timestamp > windowStart);

  if (recentRequests.length >= config.maxRequests) {
    const oldestRequest = Math.min(...recentRequests);
    const retryAfter = oldestRequest + config.windowMs - now;

    throw new RateLimitError(limitType, retryAfter);
  }

  if ('db' in ctx && 'patch' in ctx.db) {
    await (ctx as MutationCtx).db.patch(existing._id, {
      requests: [...recentRequests, now],
      updatedAt: now,
      expiresAt: now + config.windowMs,
    });
  }
}

export async function resetRateLimit(
  ctx: MutationCtx,
  limitType: RateLimitType,
  userId?: string,
  sessionId?: string,
): Promise<void> {
  const key = getRateLimitKey(limitType, userId, sessionId);

  const existing = await ctx.db
    .query('rateLimits')
    .withIndex('key', (q) => q.eq('key', key))
    .first();

  if (existing) {
    await ctx.db.delete(existing._id);
  }
}

export async function getRateLimitStatus(
  ctx: QueryCtx,
  limitType: RateLimitType,
  userId?: string,
  sessionId?: string,
): Promise<{
  remaining: number;
  limit: number;
  resetAt: number;
}> {
  const config = RATE_LIMITS[limitType];
  const key = getRateLimitKey(limitType, userId, sessionId);
  const now = Date.now();
  const windowStart = now - config.windowMs;

  const existing = await ctx.db
    .query('rateLimits')
    .withIndex('key', (q) => q.eq('key', key))
    .first();

  if (!existing) {
    return {
      remaining: config.maxRequests,
      limit: config.maxRequests,
      resetAt: now + config.windowMs,
    };
  }

  const recentRequests = existing.requests.filter((timestamp) => timestamp > windowStart);
  const remaining = Math.max(0, config.maxRequests - recentRequests.length);
  const oldestRequest = recentRequests.length > 0 ? Math.min(...recentRequests) : now;
  const resetAt = oldestRequest + config.windowMs;

  return {
    remaining,
    limit: config.maxRequests,
    resetAt,
  };
}

export async function cleanupExpiredRateLimits(ctx: MutationCtx): Promise<number> {
  const now = Date.now();

  const expired = await ctx.db
    .query('rateLimits')
    .filter((q) => q.lt(q.field('expiresAt'), now))
    .collect();

  for (const record of expired) {
    await ctx.db.delete(record._id);
  }

  return expired.length;
}

import { internalMutation } from '../_generated/server';
import { v } from 'convex/values';

export const cleanup = internalMutation({
  handler: async (ctx) => {
    return await cleanupExpiredRateLimits(ctx);
  },
});

export const checkAndUpdate = internalMutation({
  args: {
    limitType: v.string(),
    userId: v.optional(v.string()),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await checkRateLimit(
      ctx,
      args.limitType as RateLimitType,
      args.userId,
      args.sessionId,
    );
    return { allowed: true };
  },
});
