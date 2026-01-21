import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Toast } from '../../src/components/Toast.js';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('static convenience methods', () => {
    it('should have success method', () => {
      expect(typeof Toast.success).toBe('function');
    });

    it('should have error method', () => {
      expect(typeof Toast.error).toBe('function');
    });

    it('should have warning method', () => {
      expect(typeof Toast.warning).toBe('function');
    });

    it('should have info method', () => {
      expect(typeof Toast.info).toBe('function');
    });
  });
});
