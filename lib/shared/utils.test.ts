import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('Utils', () => {
  describe('cn', () => {
    it('should combine class names', () => {
      const result = cn('base-class', 'additional-class');
      expect(result).toBe('base-class additional-class');
    });

    it('should handle conditional classes', () => {
      const result = cn('base', {
        'active': true,
        'disabled': false,
      });
      expect(result).toBe('base active');
    });

    it('should merge Tailwind classes correctly', () => {
      const result = cn('px-2 py-1', 'px-4');
      expect(result).toBe('py-1 px-4');
    });

    it('should handle undefined and null values', () => {
      const result = cn('base', undefined, null, 'end');
      expect(result).toBe('base end');
    });

    it('should handle arrays of classes', () => {
      const result = cn(['base', 'middle'], 'end');
      expect(result).toBe('base middle end');
    });

    it('should handle empty strings', () => {
      const result = cn('', 'base', '');
      expect(result).toBe('base');
    });

    it('should deduplicate classes', () => {
      const result = cn('text-red-500', 'text-red-500');
      expect(result).toBe('text-red-500');
    });
  });
});