import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PhotoService } from '../../src/services/PhotoService.js';
import { Database } from '../../src/models/Database.js';
import { NotFoundError } from '../../src/utils/errorHandling.js';

describe('PhotoService', () => {
  let photoService;

  beforeEach(() => {
    photoService = new PhotoService();
    // Mock Database
    Database.instance = {
      run: vi.fn(),
      getOne: vi.fn(),
      getAll: vi.fn(),
    };
  });

  describe('addPhoto', () => {
    it('should have addPhoto method', () => {
      expect(typeof photoService.addPhoto).toBe('function');
    });
  });

  describe('getPhoto', () => {
    it('should return photo by id', async () => {
      const mockPhoto = {
        id: 1,
        file_name: 'test.jpg',
        file_path: '/path/to/test.jpg',
        file_size: 1024,
        mime_type: 'image/jpeg',
      };

      Database.instance.getOne.mockReturnValue(mockPhoto);

      const photo = await photoService.getPhoto(1);

      expect(photo).toBeDefined();
      expect(photo.id).toBe(1);
      expect(photo.file_name).toBe('test.jpg');
    });

    it('should return null for non-existent photo', async () => {
      Database.instance.getOne.mockReturnValue(null);

      const photo = await photoService.getPhoto(999);

      expect(photo).toBeNull();
    });
  });

  describe('deletePhoto', () => {
    it('should delete existing photo', async () => {
      const mockPhoto = {
        id: 1,
        file_name: 'test.jpg',
        file_path: '/path/to/test.jpg',
      };

      Database.instance.getOne.mockReturnValue(mockPhoto);
      Database.instance.run.mockReturnValue({});

      await photoService.deletePhoto(1);

      expect(Database.instance.run).toHaveBeenCalledWith(
        'DELETE FROM photos WHERE id = ?',
        [1]
      );
    });

    it('should throw NotFoundError for non-existent photo', async () => {
      Database.instance.getOne.mockReturnValue(null);

      await expect(photoService.deletePhoto(999)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('validateFile', () => {
    it('should have validateFile method', () => {
      expect(typeof photoService.validateFile).toBe('function');
    });
  });

  describe('getPhotoByPath', () => {
    it('should return photo by file path', async () => {
      const mockPhoto = {
        id: 1,
        file_name: 'test.jpg',
        file_path: '/path/to/test.jpg',
      };

      Database.instance.getOne.mockReturnValue(mockPhoto);

      const photo = await photoService.getPhotoByPath('/path/to/test.jpg');

      expect(photo).toBeDefined();
      expect(photo.file_path).toBe('/path/to/test.jpg');
      expect(Database.instance.getOne).toHaveBeenCalledWith(
        'SELECT * FROM photos WHERE file_path = ?',
        ['/path/to/test.jpg']
      );
    });

    it('should return null for non-existent path', async () => {
      Database.instance.getOne.mockReturnValue(null);

      const photo = await photoService.getPhotoByPath('/nonexistent.jpg');

      expect(photo).toBeNull();
    });
  });
});
