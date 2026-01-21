import { describe, it, expect } from 'vitest';
import { Album } from '../../src/models/Album.js';

describe('Album', () => {
  describe('constructor', () => {
    it('should create album with valid data', () => {
      const data = {
        id: 1,
        name: 'Test Album',
        display_date: 1640995200,
        display_order: 0,
        photo_count: 5,
      };

      const album = new Album(data);

      expect(album.id).toBe(1);
      expect(album.name).toBe('Test Album');
      expect(album.display_date).toBe(1640995200);
      expect(album.display_order).toBe(0);
      expect(album.photo_count).toBe(5);
    });

    it('should set default photo_count to 0', () => {
      const data = {
        id: 1,
        name: 'Empty Album',
        display_order: 0,
      };

      const album = new Album(data);

      expect(album.photo_count).toBe(0);
    });

    it('should allow null display_date', () => {
      const data = {
        id: 1,
        name: 'New Album',
        display_date: null,
        display_order: 0,
      };

      const album = new Album(data);

      expect(album.display_date).toBeNull();
    });
  });

  describe('validate', () => {
    it('should return empty array for valid album', () => {
      const data = {
        name: 'Valid Album',
        display_order: 0,
      };

      const errors = Album.validate(data);

      expect(errors).toEqual([]);
    });

    it('should return error for empty name', () => {
      const data = {
        name: '',
        display_order: 0,
      };

      const errors = Album.validate(data);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('name');
    });

    it('should return error for name > 100 characters', () => {
      const data = {
        name: 'a'.repeat(101),
        display_order: 0,
      };

      const errors = Album.validate(data);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('100');
    });

    it('should return error for negative display_order', () => {
      const data = {
        name: 'Valid Name',
        display_order: -1,
      };

      const errors = Album.validate(data);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toMatch(/display.*order/i);
    });

    it('should allow display_order of 0', () => {
      const data = {
        name: 'Valid Name',
        display_order: 0,
      };

      const errors = Album.validate(data);

      expect(errors).toEqual([]);
    });

    it('should return multiple errors for multiple issues', () => {
      const data = {
        name: '',
        display_order: -5,
      };

      const errors = Album.validate(data);

      expect(errors.length).toBeGreaterThan(1);
    });
  });

  describe('isValid', () => {
    it('should return true for valid album', () => {
      const data = {
        name: 'Valid Album',
        display_order: 0,
      };

      expect(Album.isValid(data)).toBe(true);
    });

    it('should return false for invalid album', () => {
      const data = {
        name: '',
        display_order: -1,
      };

      expect(Album.isValid(data)).toBe(false);
    });
  });
});
