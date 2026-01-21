import { describe, it, expect } from 'vitest';
import {
  formatDate,
  getCurrentTimestamp,
  dateToTimestamp,
  timestampToDate,
} from '../../src/utils/dateUtils.js';

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('should format date in short format', () => {
      const timestamp = 1640995200; // 2022-01-01 00:00:00 UTC
      const result = formatDate(timestamp, 'short');
      expect(result).toMatch(/[A-Za-z]+ \d{1,2}, \d{4}/);
    });

    it('should format date in long format', () => {
      const timestamp = 1640995200;
      const result = formatDate(timestamp, 'long');
      expect(result).toMatch(/[A-Za-z]+ \d{1,2}, \d{4}/);
    });

    it('should format recent date as relative', () => {
      const now = Math.floor(Date.now() / 1000);
      const yesterday = now - 86400;
      const result = formatDate(yesterday, 'relative');
      expect(result).toMatch(/Yesterday|\d+ (day|hour|minute|second)s? ago/);
    });

    it('should handle null timestamp', () => {
      const result = formatDate(null, 'short');
      expect(result).toBe('Unknown date');
    });

    it('should handle undefined timestamp', () => {
      const result = formatDate(undefined, 'short');
      expect(result).toBe('Unknown date');
    });
  });

  describe('getCurrentTimestamp', () => {
    it('should return current timestamp in seconds', () => {
      const timestamp = getCurrentTimestamp();
      const now = Math.floor(Date.now() / 1000);
      expect(timestamp).toBeCloseTo(now, -1);
    });
  });

  describe('dateToTimestamp', () => {
    it('should convert Date to Unix timestamp', () => {
      const date = new Date('2022-01-01T00:00:00Z');
      const timestamp = dateToTimestamp(date);
      expect(timestamp).toBe(1640995200);
    });

    it('should handle current date', () => {
      const date = new Date();
      const timestamp = dateToTimestamp(date);
      const expected = Math.floor(date.getTime() / 1000);
      expect(timestamp).toBe(expected);
    });
  });

  describe('timestampToDate', () => {
    it('should convert Unix timestamp to Date', () => {
      const timestamp = 1640995200;
      const date = timestampToDate(timestamp);
      expect(date).toBeInstanceOf(Date);
      expect(date.getTime()).toBe(timestamp * 1000);
    });

    it('should handle timestamp 0', () => {
      const date = timestampToDate(0);
      expect(date.getTime()).toBe(0);
    });
  });

  describe('round-trip conversion', () => {
    it('should preserve timestamp through conversions', () => {
      const original = 1640995200;
      const date = timestampToDate(original);
      const converted = dateToTimestamp(date);
      expect(converted).toBe(original);
    });
  });
});
