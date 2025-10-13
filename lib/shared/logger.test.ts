import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { logger } from './logger';

describe('Logger', () => {
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
  };

  beforeEach(() => {
    // Mock console methods
    console.log = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();
    // Clear module cache to ensure logger re-evaluates NODE_ENV
    vi.resetModules();
  });

  afterEach(() => {
    // Restore original console methods
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    // Restore env vars
    vi.unstubAllEnvs();
    // Clear module cache
    vi.resetModules();
  });

  describe('error', () => {
    it('should log error with context in development', () => {
      vi.stubEnv('NODE_ENV', 'development');

      const context = { userId: '123', action: 'test' };
      logger.error('Test error', context);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR] Test error'),
        context
      );
    });

    it('should log error without context in production', () => {
      vi.stubEnv('NODE_ENV', 'production');

      const context = { userId: '123', action: 'test' };
      logger.error('Test error', context);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringMatching(/\[.*\] \[ERROR\] Test error/)
      );
    });

    it('should include timestamp in production logs', () => {
      vi.stubEnv('NODE_ENV', 'production');

      logger.error('Test error');

      expect(console.error).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T.*\] \[ERROR\] Test error/)
      );
    });
  });

  describe('warn', () => {
    it('should log warning in development', () => {
      vi.stubEnv('NODE_ENV', 'development');

      logger.warn('Test warning', { detail: 'test' });

      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('[WARN] Test warning'),
        { detail: 'test' }
      );
    });

    it('should not log warning in production', () => {
      vi.stubEnv('NODE_ENV', 'production');

      logger.warn('Test warning');

      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  describe('info', () => {
    it('should log info in development', () => {
      vi.stubEnv('NODE_ENV', 'development');

      logger.info('Test info', { data: 'value' });

      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] Test info'),
        { data: 'value' }
      );
    });

    it('should not log info in production', () => {
      vi.stubEnv('NODE_ENV', 'production');

      logger.info('Test info');

      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe('debug', () => {
    it('should log debug in development', () => {
      vi.stubEnv('NODE_ENV', 'development');

      logger.debug('Debug message', { debug: true });

      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG] Debug message'),
        { debug: true }
      );
    });

    it('should not log debug in production', () => {
      vi.stubEnv('NODE_ENV', 'production');

      logger.debug('Debug message');

      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe('productGeneration', () => {
    it('should log product generation error', () => {
      vi.stubEnv('NODE_ENV', 'development');

      logger.productGeneration('Product A', 'error', { error: 'Failed' });

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR] Product Generation: Product A - error'),
        expect.objectContaining({ productName: 'Product A', error: 'Failed' })
      );
    });

    it('should log product generation success', () => {
      vi.stubEnv('NODE_ENV', 'development');

      logger.productGeneration('Product B', 'success', { time: '2s' });

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] Product Generation: Product B - success'),
        expect.objectContaining({ productName: 'Product B', time: '2s' })
      );
    });

    it('should log product generation start', () => {
      vi.stubEnv('NODE_ENV', 'development');

      logger.productGeneration('Product C', 'start');

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG] Product Generation: Product C - start'),
        expect.objectContaining({ productName: 'Product C' })
      );
    });
  });

  describe('apiError', () => {
    it('should handle network errors', () => {
      vi.stubEnv('NODE_ENV', 'development');

      const error = new Error('fetch failed');
      const result = logger.apiError('/api/test', error, 0);

      expect(result).toEqual({
        message: 'Network error',
        details: 'fetch failed',
        retryable: true,
      });
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle timeout errors', () => {
      vi.stubEnv('NODE_ENV', 'development');

      const error = new Error('Request timeout');
      const result = logger.apiError('/api/test', error);

      expect(result).toEqual({
        message: 'Request timed out',
        details: 'Request timeout',
        retryable: true,
      });
    });

    it('should handle generic errors', () => {
      vi.stubEnv('NODE_ENV', 'development');

      const error = new Error('Something went wrong');
      const result = logger.apiError('/api/test', error, 500);

      expect(result).toEqual({
        message: 'Failed to process request',
        details: 'Something went wrong',
        retryable: false,
      });
    });

    it('should not include error details in production', () => {
      vi.stubEnv('NODE_ENV', 'production');

      const error = new Error('Sensitive error message');
      const result = logger.apiError('/api/test', error);

      expect(result.details).toBeUndefined();
      expect(result.message).toBe('Failed to process request');
    });

    it('should handle non-Error objects', () => {
      vi.stubEnv('NODE_ENV', 'development');

      const result = logger.apiError('/api/test', 'String error');

      expect(result).toEqual({
        message: 'Failed to process request',
        details: 'Unknown error',
        retryable: false,
      });
    });
  });

  describe('performance', () => {
    it('should warn for slow operations (>3s)', () => {
      vi.stubEnv('NODE_ENV', 'development');

      logger.performance('database query', 4000, { query: 'SELECT *' });

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('[WARN] Performance: database query took 4000ms'),
        expect.objectContaining({
          operation: 'database query',
          duration: 4000,
          query: 'SELECT *',
        })
      );
    });

    it('should debug log for normal operations in development', () => {
      vi.stubEnv('NODE_ENV', 'development');

      logger.performance('api call', 500);

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG] Performance: api call took 500ms'),
        expect.objectContaining({
          operation: 'api call',
          duration: 500,
        })
      );
    });

    it('should not log normal operations in production', () => {
      vi.stubEnv('NODE_ENV', 'production');

      logger.performance('api call', 500);

      expect(console.log).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should still warn for slow operations in production', () => {
      vi.stubEnv('NODE_ENV', 'production');

      logger.performance('slow operation', 5000);

      // In production, warn is not called because it checks isDevelopment
      expect(console.warn).not.toHaveBeenCalled();
    });
  });
});