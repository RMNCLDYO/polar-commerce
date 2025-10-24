/* eslint-disable @typescript-eslint/no-explicit-any */
export interface RetryConfig {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  retryableErrors?: string[];
}

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
    '429',
    '500',
    '502',
    '503',
    '504',
  ],
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

      const shouldRetry =
        attempt < cfg.maxRetries &&
        isRetryableError(error, cfg.retryableErrors);

      if (!shouldRetry) {
        throw error;
      }

      await sleep(delay);

      delay = Math.min(delay * cfg.backoffMultiplier, cfg.maxDelayMs);
    }
  }

  throw lastError;
}

class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private isOpen = false;

  constructor(
    private threshold: number = 5,
    private resetTimeMs: number = 60000,
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.isOpen) {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure < this.resetTimeMs) {
        throw new Error(
          'Circuit breaker is open. Service may be down. Please try again later.',
        );
      }
      this.isOpen = false;
      this.failures = 0;
    }

    try {
      const result = await fn();
      this.failures = 0;
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();

      if (this.failures >= this.threshold) {
        this.isOpen = true;
      }

      throw error;
    }
  }
}

export const polarCircuitBreaker = new CircuitBreaker(5, 60000);

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
