import { describe, it, expect } from 'vitest';
import { Photo } from '../../src/models/Photo.js';

describe('Photo', () => {
  describe('constructor', () => {
    it('should create photo with valid data', () => {
      const data = {
        id: 1,
        file_path: '/path/to/photo.jpg',
        file_name: 'photo.jpg',
        date_taken: 1640995200,
        width: 1920,
        height: 1080,
      };

      const photo = new Photo(data);

      expect(photo.id).toBe(1);
      expect(photo.file_path).toBe('/path/to/photo.jpg');
      expect(photo.file_name).toBe('photo.jpg');
      expect(photo.date_taken).toBe(1640995200);
      expect(photo.width).toBe(1920);
      expect(photo.height).toBe(1080);
    });

    it('should allow null date_taken', () => {
      const data = {
        id: 1,
        file_path: '/path/to/photo.jpg',
        file_name: 'photo.jpg',
        date_taken: null,
        width: 800,
        height: 600,
      };

      const photo = new Photo(data);

      expect(photo.date_taken).toBeNull();
    });
  });

  describe('validate', () => {
    it('should return empty array for valid photo', () => {
      const data = {
        file_path: '/path/to/photo.jpg',
        file_name: 'photo.jpg',
        date_taken: 1640995200,
        width: 1920,
        height: 1080,
      };

      const errors = Photo.validate(data);

      expect(errors).toEqual([]);
    });

    it('should return error for empty file_path', () => {
      const data = {
        file_path: '',
        file_name: 'photo.jpg',
        width: 1920,
        height: 1080,
      };

      const errors = Photo.validate(data);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toMatch(/file.*path/i);
    });

    it('should return error for zero width', () => {
      const data = {
        file_path: '/path/to/photo.jpg',
        file_name: 'photo.jpg',
        width: 0,
        height: 1080,
      };

      const errors = Photo.validate(data);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toMatch(/width/i);
    });

    it('should return error for zero height', () => {
      const data = {
        file_path: '/path/to/photo.jpg',
        file_name: 'photo.jpg',
        width: 1920,
        height: 0,
      };

      const errors = Photo.validate(data);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toMatch(/height/i);
    });

    it('should return error for negative dimensions', () => {
      const data = {
        file_path: '/path/to/photo.jpg',
        file_name: 'photo.jpg',
        width: -100,
        height: -100,
      };

      const errors = Photo.validate(data);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should allow null date_taken', () => {
      const data = {
        file_path: '/path/to/photo.jpg',
        file_name: 'photo.jpg',
        date_taken: null,
        width: 1920,
        height: 1080,
      };

      const errors = Photo.validate(data);

      expect(errors).toEqual([]);
    });

    it('should return error for non-timestamp date_taken', () => {
      const data = {
        file_path: '/path/to/photo.jpg',
        file_name: 'photo.jpg',
        date_taken: 'invalid',
        width: 1920,
        height: 1080,
      };

      const errors = Photo.validate(data);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('timestamp');
    });
  });

  describe('isValid', () => {
    it('should return true for valid photo', () => {
      const data = {
        file_path: '/path/to/photo.jpg',
        file_name: 'photo.jpg',
        width: 1920,
        height: 1080,
      };

      expect(Photo.isValid(data)).toBe(true);
    });

    it('should return false for invalid photo', () => {
      const data = {
        file_path: '',
        file_name: 'photo.jpg',
        width: 0,
        height: 0,
      };

      expect(Photo.isValid(data)).toBe(false);
    });
  });
});
