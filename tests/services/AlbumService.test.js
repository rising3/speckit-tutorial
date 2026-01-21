import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AlbumService } from '../../src/services/AlbumService.js';
import { Database } from '../../src/models/Database.js';
import {
  ValidationError,
  NotFoundError,
  DuplicateError,
} from '../../src/utils/errorHandling.js';

// Mock Database
vi.mock('../../src/models/Database.js', () => ({
  Database: {
    instance: {
      getOne: vi.fn(),
      getAll: vi.fn(),
      run: vi.fn(),
    },
  },
}));

describe('AlbumService', () => {
  let albumService;

  beforeEach(() => {
    albumService = new AlbumService();
    vi.clearAllMocks();
  });

  describe('createAlbum', () => {
    it('should create album with valid name', async () => {
      Database.instance.getOne.mockReturnValueOnce(null); // No duplicate
      Database.instance.getOne.mockReturnValueOnce({ max_order: 0 }); // Max order
      Database.instance.getOne.mockReturnValueOnce({
        id: 1,
        name: 'Test Album',
        display_order: 1,
        display_date: null,
      });

      const album = await albumService.createAlbum('Test Album');

      expect(album.name).toBe('Test Album');
      expect(Database.instance.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO albums'),
        ['Test Album', 1]
      );
    });

    it('should throw ValidationError for empty name', async () => {
      await expect(albumService.createAlbum('')).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw ValidationError for name > 100 chars', async () => {
      const longName = 'a'.repeat(101);
      await expect(albumService.createAlbum(longName)).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw DuplicateError for duplicate name', async () => {
      Database.instance.getOne.mockReturnValueOnce({ id: 1 }); // Existing album

      await expect(albumService.createAlbum('Duplicate')).rejects.toThrow(
        DuplicateError
      );
    });
  });

  describe('listAlbums', () => {
    it('should list albums sorted by date', async () => {
      const mockAlbums = [
        { id: 1, name: 'Album 1', display_date: 1000000, photo_count: 5 },
        { id: 2, name: 'Album 2', display_date: 2000000, photo_count: 3 },
      ];
      Database.instance.getAll.mockReturnValue(mockAlbums);

      const albums = await albumService.listAlbums('date');

      expect(albums).toHaveLength(2);
      expect(Database.instance.getAll).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY display_date DESC')
      );
    });

    it('should list albums sorted by manual order', async () => {
      const mockAlbums = [
        { id: 1, name: 'Album 1', display_order: 0, photo_count: 5 },
        { id: 2, name: 'Album 2', display_order: 1, photo_count: 3 },
      ];
      Database.instance.getAll.mockReturnValue(mockAlbums);

      const albums = await albumService.listAlbums('manual');

      expect(albums).toHaveLength(2);
      expect(Database.instance.getAll).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY display_order ASC')
      );
    });

    it('should throw ValidationError for invalid sortBy', async () => {
      await expect(albumService.listAlbums('invalid')).rejects.toThrow(
        ValidationError
      );
    });
  });

  describe('getAlbum', () => {
    it('should return album by id', async () => {
      const mockAlbum = {
        id: 1,
        name: 'Test Album',
        display_order: 0,
        photo_count: 5,
      };
      Database.instance.getOne.mockReturnValue(mockAlbum);

      const album = await albumService.getAlbum(1);

      expect(album.id).toBe(1);
      expect(album.name).toBe('Test Album');
    });

    it('should return null for non-existent album', async () => {
      Database.instance.getOne.mockReturnValue(null);

      const album = await albumService.getAlbum(999);

      expect(album).toBeNull();
    });
  });

  describe('updateAlbum', () => {
    it('should update album name', async () => {
      Database.instance.getOne
        .mockReturnValueOnce({
          id: 1,
          name: 'Old Name',
          photo_count: 5,
        })
        .mockReturnValueOnce(null) // No duplicate
        .mockReturnValueOnce({
          id: 1,
          name: 'New Name',
          photo_count: 5,
        });

      const album = await albumService.updateAlbum(1, { name: 'New Name' });

      expect(album.name).toBe('New Name');
      expect(Database.instance.run).toHaveBeenCalledWith(
        'UPDATE albums SET name = ? WHERE id = ?',
        ['New Name', 1]
      );
    });

    it('should throw NotFoundError for non-existent album', async () => {
      Database.instance.getOne.mockReturnValue(null);

      await expect(
        albumService.updateAlbum(999, { name: 'New Name' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('reorderAlbums', () => {
    it('should reorder album to new position', async () => {
      Database.instance.getOne.mockReturnValue({
        id: 1,
        display_order: 0,
        photo_count: 5,
      });

      await albumService.reorderAlbums(1, 2);

      expect(Database.instance.run).toHaveBeenCalled();
    });

    it('should throw ValidationError for negative position', async () => {
      Database.instance.getOne.mockReturnValue({ id: 1, display_order: 0 });

      await expect(albumService.reorderAlbums(1, -1)).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw NotFoundError for non-existent album', async () => {
      Database.instance.getOne.mockReturnValue(null);

      await expect(albumService.reorderAlbums(999, 0)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('getAlbumPhotos', () => {
    it('should return photos sorted by date and file_path', async () => {
      Database.instance.getOne.mockReturnValue({ id: 1, photo_count: 2 });
      Database.instance.getAll.mockReturnValue([
        { id: 1, file_path: '/path/a.jpg', date_taken: 1000000 },
        { id: 2, file_path: '/path/b.jpg', date_taken: 1000000 },
      ]);

      const photos = await albumService.getAlbumPhotos(1);

      expect(photos).toHaveLength(2);
      expect(Database.instance.getAll).toHaveBeenCalledWith(
        expect.stringContaining(
          'ORDER BY p.date_taken ASC NULLS LAST, p.file_path ASC'
        ),
        [1]
      );
    });

    it('should throw NotFoundError for non-existent album', async () => {
      Database.instance.getOne.mockReturnValue(null);

      await expect(albumService.getAlbumPhotos(999)).rejects.toThrow(
        NotFoundError
      );
    });
  });
});
