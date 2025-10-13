/**
 * Rate Limiting System
 *
 * Protects public endpoints from abuse with sliding window rate limiting
 * Uses Convex database for distributed rate limiting across all functions
 */

import type { MutationCtx, QueryCtx } from '../_generated/server';
import { logger } from '../utils/logger';

/**
 * Rate limit configurations for different endpoint types
 */
export const RATE_LIMITS = {
  // Cart operations - generous limits for normal use
  cart: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },

  // Checkout operations - more restrictive
  checkout: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
  },

  // Catalog queries - very generous for browsing
  catalog: {
    maxRequests: 300,
    windowMs: 60 * 1000, // 1 minute
  },

  // Auth operations - stricter to prevent brute force
  auth: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
  },

  // Webhook endpoints - moderate
  webhook: {
    maxRequests: 50,
    windowMs: 60 * 1000, // 1 minute
  },
} as const;

export type RateLimitType = keyof typeof RATE_LIMITS;

/**
 * Rate limit error
 */
export class RateLimitError extends Error {
  constructor(
    public readonly limitType: RateLimitType,
    public readonly retryAfter: number,
  ) {
    super(`Rate limit exceeded for ${limitType}. Try again in ${retryAfter}ms`);
    this.name = 'RateLimitError';
  }
}

/**
 * Get rate limit key for a user/session
 */
function getRateLimitKey(
  limitType: RateLimitType,
  userId?: string,
  sessionId?: string,
): string {
  const identifier = userId || sessionId || 'anonymous';
  return `rateLimit:${limitType}:${identifier}`;
}

/**
 * Check if request is within rate limit
 * Uses sliding window algorithm with database storage
 */
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

  // Query existing rate limit record
  const existing = await ctx.db
    .query('rateLimits')
    .withIndex('key', (q) => q.eq('key', key))
    .first();

  if (!existing) {
    // First request - create new rate limit record
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

  // Filter out requests outside the current window
  const recentRequests = existing.requests.filter((timestamp) => timestamp > windowStart);

  // Check if limit exceeded
  if (recentRequests.length >= config.maxRequests) {
    const oldestRequest = Math.min(...recentRequests);
    const retryAfter = oldestRequest + config.windowMs - now;

    logger.warn(`[RateLimit] ${limitType} limit exceeded for ${userId || sessionId || 'anonymous'}`, {
      requests: recentRequests.length,
      limit: config.maxRequests,
      retryAfter,
    });

    throw new RateLimitError(limitType, retryAfter);
  }

  // Add current request and update record
  if ('db' in ctx && 'patch' in ctx.db) {
    await (ctx as MutationCtx).db.patch(existing._id, {
      requests: [...recentRequests, now],
      updatedAt: now,
      expiresAt: now + config.windowMs,
    });
  }
}

/**
 * Reset rate limit for a user (useful for testing or admin override)
 */
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
    logger.info(`[RateLimit] Reset ${limitType} for ${userId || sessionId || 'anonymous'}`);
  }
}

/**
 * Get current rate limit status for a user
 */
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

/**
 * Cleanup expired rate limit records (run periodically via cron)
 */
export async function cleanupExpiredRateLimits(ctx: MutationCtx): Promise<number> {
  const now = Date.now();

  const expired = await ctx.db
    .query('rateLimits')
    .filter((q) => q.lt(q.field('expiresAt'), now))
    .collect();

  for (const record of expired) {
    await ctx.db.delete(record._id);
  }

  logger.info(`[RateLimit] Cleaned up ${expired.length} expired records`);
  return expired.length;
}

import { internalMutation } from '../_generated/server';
import { v } from 'convex/values';

/**
 * Internal mutation for cron job to clean up rate limits
 */
export const cleanup = internalMutation({
  handler: async (ctx) => {
    return await cleanupExpiredRateLimits(ctx);
  },
});

/**
 * Internal mutation to check and update rate limit (for use in actions)
 */
export const checkAndUpdate = internalMutation({
  args: {
    limitType: v.string(),
    userId: v.optional(v.string()),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // This will throw RateLimitError if limit is exceeded
    await checkRateLimit(
      ctx,
      args.limitType as RateLimitType,
      args.userId,
      args.sessionId,
    );
    return { allowed: true };
  },
});
