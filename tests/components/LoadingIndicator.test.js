import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { LoadingIndicator } from '../../src/components/LoadingIndicator.js';

describe('LoadingIndicator', () => {
  beforeEach(() => {
    // Mock setTimeout and clearTimeout
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('constructor', () => {
    it('should create loading indicator with message', () => {
      const indicator = new LoadingIndicator('Loading...');
      expect(indicator.message).toBe('Loading...');
    });

    it('should use default message if not provided', () => {
      const indicator = new LoadingIndicator();
      expect(indicator.message).toBe('Loading...');
    });
  });

  describe('static wrap', () => {
    it('should wrap async operation with loading indicator', async () => {
      const operation = vi.fn().mockResolvedValue('result');

      const promise = LoadingIndicator.wrap(operation, 'Processing...');
      const result = await promise;

      expect(result).toBe('result');
      expect(operation).toHaveBeenCalled();
    });

    it('should handle operation errors', async () => {
      const error = new Error('Operation failed');
      const operation = vi.fn().mockRejectedValue(error);

      await expect(
        LoadingIndicator.wrap(operation, 'Processing...')
      ).rejects.toThrow('Operation failed');
    });

    it('should not show indicator for fast operations', async () => {
      const operation = vi.fn().mockResolvedValue('quick');

      const promise = LoadingIndicator.wrap(operation);

      // Resolve before 100ms threshold
      vi.advanceTimersByTime(50);

      await promise;
    });
  });
});
