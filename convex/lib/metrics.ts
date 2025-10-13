/**
 * Metrics Collection and Performance Monitoring
 *
 * Tracks query performance, error rates, and system health
 */

import type { MutationCtx, QueryCtx } from '../_generated/server';
import { logger } from '../utils/logger';

/**
 * Metric types
 */
export type MetricType =
  | 'query_duration'
  | 'mutation_duration'
  | 'action_duration'
  | 'error'
  | 'cart_operation'
  | 'checkout_operation'
  | 'external_api_call';

export interface Metric {
  type: MetricType;
  name: string;
  duration?: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

/**
 * Track query/mutation/action performance
 */
export async function trackPerformance<T>(
  ctx: MutationCtx | QueryCtx,
  type: MetricType,
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  const start = Date.now();

  try {
    const result = await fn();
    const duration = Date.now() - start;

    // Log metric
    await logMetric(ctx, {
      type,
      name,
      duration,
      success: true,
      metadata,
      timestamp: Date.now(),
    });

    // Warn on slow operations
    if (duration > 1000) {
      logger.warn(`[Performance] Slow operation: ${name} took ${duration}ms`, metadata);
    }

    return result;
  } catch (error) {
    const duration = Date.now() - start;

    // Log error metric
    await logMetric(ctx, {
      type: 'error',
      name,
      duration,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      metadata,
      timestamp: Date.now(),
    });

    logger.error(`[Error] ${name}:`, error);
    throw error;
  }
}

/**
 * Log metric to database (for persistence) or console (for real-time monitoring)
 */
async function logMetric(
  _ctx: MutationCtx | QueryCtx,
  metric: Metric
): Promise<void> {
  // For now, log to console
  // In production, you'd send to a metrics service (Datadog, New Relic, etc.)
  const level = metric.success ? 'info' : 'error';
  const message = `[Metric] ${metric.type}:${metric.name} - ${metric.duration}ms`;

  if (level === 'info') {
    logger.info(message, metric.metadata);
  } else {
    logger.error(message, { error: metric.error, ...metric.metadata });
  }

  // Optional: Store in database for historical analysis
  // Uncomment if you add a 'metrics' table to your schema
  // if ('db' in ctx) {
  //   await ctx.db.insert('metrics', {
  //     ...metric,
  //     userId: (await ctx.auth?.getUserIdentity?.())?.subject,
  //   });
  // }
}

/**
 * Track cart operations
 */
export async function trackCartOperation<T>(
  ctx: MutationCtx | QueryCtx,
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  return trackPerformance(
    ctx,
    'cart_operation',
    `cart.${operation}`,
    fn,
    metadata
  );
}

/**
 * Track checkout operations
 */
export async function trackCheckoutOperation<T>(
  ctx: MutationCtx | QueryCtx,
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  return trackPerformance(
    ctx,
    'checkout_operation',
    `checkout.${operation}`,
    fn,
    metadata
  );
}

/**
 * Track external API calls (Polar, etc.) with automatic retry logic
 */
export async function trackExternalAPICall<T>(
  apiName: string,
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  const start = Date.now();
  const maxRetries = 3;
  const initialDelayMs = 1000;
  const retryableErrors = ['429', '500', '502', '503', '504', 'ECONNREFUSED', 'ETIMEDOUT'];

  let lastError: any;
  let delay = initialDelayMs;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      const result = await fn();
      const duration = Date.now() - start;

      // Log success (include retry info if retried)
      if (attempt > 0) {
        logger.info(`[External API] ${apiName}.${operation} - ${duration}ms (succeeded after ${attempt} retries)`, metadata);
      } else {
        logger.info(`[External API] ${apiName}.${operation} - ${duration}ms`, metadata);
      }

      // Warn on slow external calls
      if (duration > 5000) {
        logger.warn(`[External API] Slow call: ${apiName}.${operation} took ${duration}ms`);
      }

      return result;
    } catch (error: any) {
      lastError = error;
      attempt++;

      // Check if error is retryable
      const errorMessage = error.message || String(error);
      const errorCode = error.code || error.statusCode || error.status;
      const isRetryable = retryableErrors.some(code =>
        errorMessage.includes(code) || String(errorCode).includes(code)
      );

      // If not retryable or out of retries, fail immediately
      if (!isRetryable || attempt > maxRetries) {
        const duration = Date.now() - start;
        logger.error(`[External API] ${apiName}.${operation} failed after ${duration}ms (${attempt} attempts):`, error);
        throw error;
      }

      // Log retry attempt
      logger.warn(`[External API] ${apiName}.${operation} failed (attempt ${attempt}/${maxRetries + 1}), retrying in ${delay}ms...`, {
        error: errorMessage,
        code: errorCode,
      });

      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * 2, 10000); // Cap at 10s
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError;
}

/**
 * Get performance summary (for debugging/monitoring dashboards)
 */
export interface PerformanceSummary {
  totalOperations: number;
  successRate: number;
  averageDuration: number;
  slowOperations: number;
  errors: number;
}

/**
 * Calculate performance metrics
 * (In production, query from metrics database or time-series DB)
 */
export function calculatePerformanceSummary(metrics: Metric[]): PerformanceSummary {
  const total = metrics.length;
  const successful = metrics.filter(m => m.success).length;
  const durations = metrics.filter(m => m.duration !== undefined).map(m => m.duration!);
  const avgDuration = durations.length > 0
    ? durations.reduce((a, b) => a + b, 0) / durations.length
    : 0;
  const slow = durations.filter(d => d > 1000).length;
  const errors = total - successful;

  return {
    totalOperations: total,
    successRate: total > 0 ? (successful / total) * 100 : 0,
    averageDuration: Math.round(avgDuration),
    slowOperations: slow,
    errors,
  };
}
