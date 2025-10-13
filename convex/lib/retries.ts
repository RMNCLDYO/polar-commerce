/**
 * Action Retry Wrappers
 *
 * Automatic retry logic for actions that call external APIs (like Polar).
 * Based on convex-helpers retry patterns.
 */

import { logger } from '../utils/logger';

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries?: number; // Default: 3
  initialDelayMs?: number; // Default: 1000
  maxDelayMs?: number; // Default: 10000
  backoffMultiplier?: number; // Default: 2
  retryableErrors?: string[]; // Specific error messages to retry
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  retryableErrors: [
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'EAI_AGAIN',
    '429', // Rate limit
    '500', // Server error
    '502', // Bad gateway
    '503', // Service unavailable
    '504', // Gateway timeout
  ],
};

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: any, retryableErrors: string[]): boolean {
  if (!error) {return false;}

  const errorMessage = error.message || String(error);
  const errorCode = error.code || error.statusCode || error.status;

  return retryableErrors.some((retryable) => {
    return (
      errorMessage.includes(retryable) ||
      String(errorCode).includes(retryable)
    );
  });
}

/**
 * Retry wrapper for actions
 *
 * Usage:
 *   const result = await withRetry(
 *     async () => await polarClient.checkouts.create(data),
 *     { maxRetries: 3 }
 *   );
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {},
): Promise<T> {
  const cfg = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: any;
  let delay = cfg.initialDelayMs;

  for (let attempt = 0; attempt <= cfg.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Check if we should retry
      const shouldRetry =
        attempt < cfg.maxRetries &&
        isRetryableError(error, cfg.retryableErrors);

      if (!shouldRetry) {
        logger.error(
          `Action failed after ${attempt + 1} attempts:`,
          error,
        );
        throw error;
      }

      // Log retry attempt
      logger.warn(
        `Action failed (attempt ${attempt + 1}/${cfg.maxRetries + 1}), retrying in ${delay}ms...`,
        { error: error.message },
      );

      // Wait before retrying
      await sleep(delay);

      // Exponential backoff
      delay = Math.min(delay * cfg.backoffMultiplier, cfg.maxDelayMs);
    }
  }

  // All retries exhausted
  logger.error(
    `Action failed after ${cfg.maxRetries + 1} attempts`,
    lastError,
  );
  throw lastError;
}

/**
 * Retry wrapper with circuit breaker
 *
 * Stops retrying if too many failures occur in a time window.
 * Useful for external API calls that might be completely down.
 */
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private isOpen = false;

  constructor(
    private threshold: number = 5,
    private resetTimeMs: number = 60000, // 1 minute
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit is open
    if (this.isOpen) {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure < this.resetTimeMs) {
        throw new Error(
          'Circuit breaker is open. Service may be down. Please try again later.',
        );
      }
      // Reset circuit breaker
      this.isOpen = false;
      this.failures = 0;
    }

    try {
      const result = await fn();
      // Success - reset failures
      this.failures = 0;
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();

      if (this.failures >= this.threshold) {
        this.isOpen = true;
        logger.error(
          `Circuit breaker opened after ${this.failures} failures`,
        );
      }

      throw error;
    }
  }
}

// Global circuit breaker for Polar API
export const polarCircuitBreaker = new CircuitBreaker(5, 60000);

/**
 * Retry wrapper specifically for Polar API calls
 */
export async function withPolarRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {},
): Promise<T> {
  return await polarCircuitBreaker.execute(async () => {
    return await withRetry(fn, {
      maxRetries: 3,
      initialDelayMs: 1000,
      maxDelayMs: 10000,
      retryableErrors: [
        ...DEFAULT_RETRY_CONFIG.retryableErrors,
        'Invalid product',
        'Invalid customer',
      ],
      ...config,
    });
  });
}

/**
 * Batch retry - retry a batch of operations with individual failure tracking
 */
export async function batchWithRetry<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  config: RetryConfig = {},
): Promise<Array<{ item: T; result?: R; error?: any }>> {
  const results = await Promise.allSettled(
    items.map(async (item) => {
      try {
        const result = await withRetry(() => fn(item), config);
        return { item, result };
      } catch (error) {
        return { item, error };
      }
    }),
  );

  return results.map((result) =>
    result.status === 'fulfilled' ? result.value : result.reason,
  );
}
