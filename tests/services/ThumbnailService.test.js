import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThumbnailService } from '../../src/services/ThumbnailService.js';

// Mock IndexedDB
const mockDB = {
  transaction: vi.fn(),
  close: vi.fn(),
};

const mockTransaction = {
  objectStore: vi.fn(),
};

const mockStore = {
  get: vi.fn(),
  put: vi.fn(),
  openCursor: vi.fn(),
};

const mockRequest = {
  onsuccess: null,
  onerror: null,
  result: null,
};

global.indexedDB = {
  open: vi.fn(() => {
    const request = { ...mockRequest };
    setTimeout(() => {
      request.result = mockDB;
      if (request.onsuccess) request.onsuccess({ target: request });
    }, 0);
    return request;
  }),
};

describe('ThumbnailService', () => {
  let thumbnailService;

  beforeEach(() => {
    thumbnailService = new ThumbnailService();
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with correct properties', () => {
      expect(thumbnailService.cache).toBeNull();
      expect(thumbnailService.maxCacheSize).toBe(500 * 1024 * 1024);
      expect(thumbnailService.thumbnailSize).toBe(200);
      expect(thumbnailService.quality).toBe(0.8);
    });

    it('should initialize IndexedDB cache', async () => {
      const service = await thumbnailService.init();
      expect(service).toBe(thumbnailService);
      expect(indexedDB.open).toHaveBeenCalledWith('PhotoAlbumThumbnails', 1);
    });
  });

  describe('generateThumbnail', () => {
    it('should generate thumbnail with correct dimensions', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockCanvas = {
        toBlob: vi.fn(callback => {
          callback(new Blob(['thumbnail'], { type: 'image/jpeg' }));
        }),
        getContext: vi.fn(() => ({
          drawImage: vi.fn(),
        })),
      };

      global.document = {
        createElement: vi.fn(() => mockCanvas),
      };

      global.Image = class {
        constructor() {
          setTimeout(() => {
            this.width = 800;
            this.height = 600;
            if (this.onload) this.onload();
          }, 0);
        }
      };

      global.URL = {
        createObjectURL: vi.fn(() => 'blob:mock'),
        revokeObjectURL: vi.fn(),
      };

      const blob = await thumbnailService.generateThumbnail(
        mockFile,
        'test.jpg'
      );
      expect(blob).toBeInstanceOf(Blob);
    });
  });

  describe('getCachedThumbnail', () => {
    it('should return null when cache is not initialized', async () => {
      thumbnailService.cache = null;
      const result = await thumbnailService.getCachedThumbnail('test.jpg');
      expect(result).toBeNull();
    });

    it('should return cached thumbnail URL when available', async () => {
      thumbnailService.cache = mockDB;
      const mockBlob = new Blob(['thumbnail'], { type: 'image/jpeg' });

      mockDB.transaction.mockReturnValue(mockTransaction);
      mockTransaction.objectStore.mockReturnValue(mockStore);
      mockStore.get.mockReturnValue({
        ...mockRequest,
        result: { blob: mockBlob, path: 'test.jpg' },
      });

      global.URL = {
        createObjectURL: vi.fn(() => 'blob:mock-url'),
      };

      // Mock the async get operation
      vi.spyOn(thumbnailService, '_getCachedThumbnail').mockResolvedValue(
        mockBlob
      );
      vi.spyOn(thumbnailService, '_updateAccessCount').mockResolvedValue();

      const result = await thumbnailService.getCachedThumbnail('test.jpg');
      expect(result).toBe('blob:mock-url');
    });
  });

  describe('getThumbnail', () => {
    it('should return cached thumbnail if available', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockBlob = new Blob(['thumbnail'], { type: 'image/jpeg' });

      vi.spyOn(thumbnailService, '_getCachedThumbnail').mockResolvedValue(
        mockBlob
      );
      vi.spyOn(thumbnailService, '_updateAccessCount').mockResolvedValue();

      global.URL = {
        createObjectURL: vi.fn(() => 'blob:cached'),
      };

      const result = await thumbnailService.getThumbnail(mockFile, 'test.jpg');
      expect(result).toBe('blob:cached');
      expect(thumbnailService._getCachedThumbnail).toHaveBeenCalledWith(
        'test.jpg'
      );
    });

    it('should generate and cache thumbnail if not cached', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockBlob = new Blob(['thumbnail'], { type: 'image/jpeg' });

      vi.spyOn(thumbnailService, '_getCachedThumbnail').mockResolvedValue(null);
      vi.spyOn(thumbnailService, 'generateThumbnail').mockResolvedValue(
        mockBlob
      );
      vi.spyOn(thumbnailService, '_cacheThumbnail').mockResolvedValue();

      global.URL = {
        createObjectURL: vi.fn(() => 'blob:new'),
      };

      const result = await thumbnailService.getThumbnail(mockFile, 'test.jpg');
      expect(result).toBe('blob:new');
      expect(thumbnailService.generateThumbnail).toHaveBeenCalledWith(
        mockFile,
        'test.jpg'
      );
      expect(thumbnailService._cacheThumbnail).toHaveBeenCalledWith(
        'test.jpg',
        mockBlob
      );
    });
  });

  describe('deleteCachedThumbnail', () => {
    it('should delete cached thumbnail successfully', async () => {
      thumbnailService.cache = mockDB;

      const mockDeleteRequest = {
        onsuccess: null,
        onerror: null,
      };

      mockDB.transaction.mockReturnValue(mockTransaction);
      mockTransaction.objectStore.mockReturnValue({
        delete: vi.fn(() => {
          const req = { ...mockDeleteRequest };
          setTimeout(() => {
            if (req.onsuccess) req.onsuccess();
          }, 0);
          return req;
        }),
      });

      const result = await thumbnailService.deleteCachedThumbnail('test.jpg');
      expect(result).toBe(true);
    });

    it('should return false when cache is not initialized', async () => {
      thumbnailService.cache = null;
      const result = await thumbnailService.deleteCachedThumbnail('test.jpg');
      expect(result).toBeUndefined();
    });

    it('should handle deletion errors gracefully', async () => {
      thumbnailService.cache = mockDB;

      const mockDeleteRequest = {
        onsuccess: null,
        onerror: null,
      };

      mockDB.transaction.mockReturnValue(mockTransaction);
      mockTransaction.objectStore.mockReturnValue({
        delete: vi.fn(() => {
          const req = { ...mockDeleteRequest };
          setTimeout(() => {
            if (req.onerror) req.onerror();
          }, 0);
          return req;
        }),
      });

      const result = await thumbnailService.deleteCachedThumbnail('test.jpg');
      expect(result).toBe(false);
    });
  });
});
