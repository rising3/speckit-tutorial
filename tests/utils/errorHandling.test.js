import { describe, it, expect } from 'vitest';
import {
  ValidationError,
  NotFoundError,
  DuplicateError,
  ExifError,
  DatabaseError,
} from '../../src/utils/errorHandling.js';

describe('errorHandling', () => {
  describe('ValidationError', () => {
    it('should create error with field and message', () => {
      const error = new ValidationError('name', 'Name is required');
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ValidationError');
      expect(error.field).toBe('name');
      expect(error.message).toContain('name');
      expect(error.message).toContain('Name is required');
    });

    it('should be catchable as Error', () => {
      try {
        throw new ValidationError('email', 'Invalid email');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(ValidationError);
      }
    });
  });

  describe('NotFoundError', () => {
    it('should create error with resource type and id', () => {
      const error = new NotFoundError('Album', 123);
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('NotFoundError');
      expect(error.entity).toBe('Album');
      expect(error.id).toBe(123);
      expect(error.message).toContain('Album');
      expect(error.message).toContain('123');
    });

    it('should handle string id', () => {
      const error = new NotFoundError('Photo', 'abc-123');
      expect(error.id).toBe('abc-123');
      expect(error.message).toContain('abc-123');
    });
  });

  describe('DuplicateError', () => {
    it('should create error with resource, field, and value', () => {
      const error = new DuplicateError('Album', 'name', 'Vacation 2022');
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('DuplicateError');
      expect(error.entity).toBe('Album');
      expect(error.field).toBe('name');
      expect(error.message).toContain('Album');
      expect(error.message).toContain('name');
      expect(error.message).toContain('Vacation 2022');
    });

    it('should handle numeric value', () => {
      const error = new DuplicateError('Photo', 'id', 456);
      expect(error.message).toContain('456');
    });
  });

  describe('ExifError', () => {
    it('should create error with file path', () => {
      const error = new ExifError('photo.jpg: Invalid EXIF data');
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ExifError');
      expect(error.message).toContain('photo.jpg');
      expect(error.message).toContain('Invalid EXIF data');
    });

    it('should handle missing details', () => {
      const error = new ExifError('image.png');
      expect(error.message).toContain('image.png');
    });
  });

  describe('DatabaseError', () => {
    it('should create error with operation and original error', () => {
      const originalError = new Error('Connection failed');
      const error = new DatabaseError('createAlbum', originalError);
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('DatabaseError');
      expect(error.operation).toBe('createAlbum');
      expect(error.originalError).toBe(originalError);
      expect(error.message).toContain('createAlbum');
      expect(error.message).toContain('Connection failed');
    });

    it('should handle string error', () => {
      const error = new DatabaseError('query', 'Syntax error');
      expect(error.originalError).toBe('Syntax error');
    });
  });

  describe('Error inheritance', () => {
    it('should all extend Error', () => {
      expect(new ValidationError('f', 'm')).toBeInstanceOf(Error);
      expect(new NotFoundError('R', 1)).toBeInstanceOf(Error);
      expect(new DuplicateError('R', 'f', 'v')).toBeInstanceOf(Error);
      expect(new ExifError('p', 'd')).toBeInstanceOf(Error);
      expect(new DatabaseError('o', 'e')).toBeInstanceOf(Error);
    });

    it('should have distinct names', () => {
      const errors = [
        new ValidationError('f', 'm'),
        new NotFoundError('R', 1),
        new DuplicateError('R', 'f', 'v'),
        new ExifError('p', 'd'),
        new DatabaseError('o', 'e'),
      ];

      const names = errors.map(e => e.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(5);
    });
  });
});
