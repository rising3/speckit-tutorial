import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PhotoTile } from '../../src/components/PhotoTile.js';

describe('PhotoTile', () => {
  let mockPhoto;
  let mockThumbnailService;
  let mockFileService;

  beforeEach(() => {
    mockPhoto = {
      id: 1,
      file_name: 'test.jpg',
      file_path: '/path/to/test.jpg',
      width: 1920,
      height: 1080,
    };

    mockThumbnailService = {
      getThumbnail: vi.fn(),
      getCachedThumbnail: vi.fn(),
    };

    mockFileService = {
      checkFileExists: vi.fn(),
    };

    // Mock DOM
    global.document = {
      createElement: tag => {
        const element = {
          tagName: tag.toUpperCase(),
          className: '',
          dataset: {},
          alt: '',
          src: '',
          appendChild: vi.fn(function (child) {
            this._child = child;
            return child;
          }),
          querySelector: vi.fn(function (selector) {
            if (selector === '.photo-image') {
              return this._child;
            }
            return null;
          }),
          classList: {
            add: vi.fn(),
          },
        };
        return element;
      },
    };
  });

  describe('render', () => {
    it('should render photo tile with correct structure', () => {
      const tile = new PhotoTile(
        mockPhoto,
        mockThumbnailService,
        mockFileService
      );
      const element = tile.render();

      expect(element.className).toBe('photo-tile');
      expect(element.dataset.photoId).toBe(1);
    });

    it('should render image with placeholder', () => {
      const tile = new PhotoTile(
        mockPhoto,
        mockThumbnailService,
        mockFileService
      );
      const element = tile.render();

      const img = element._child;
      expect(img.className).toBe('photo-image');
      expect(img.alt).toBe('test.jpg');
      expect(img.dataset.src).toBe('/path/to/test.jpg');
      expect(img.src).toContain('data:image/svg+xml');
    });
  });

  describe('loadThumbnail', () => {
    it('should load thumbnail from file when provided', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      mockThumbnailService.getThumbnail.mockResolvedValue('blob:test-url');

      const tile = new PhotoTile(
        mockPhoto,
        mockThumbnailService,
        mockFileService
      );
      tile.render();

      await tile.loadThumbnail(mockFile);

      expect(mockThumbnailService.getThumbnail).toHaveBeenCalledWith(
        mockFile,
        '/path/to/test.jpg'
      );
    });

    it('should load cached thumbnail when no file provided', async () => {
      mockThumbnailService.getCachedThumbnail.mockResolvedValue(
        'blob:cached-url'
      );

      const tile = new PhotoTile(
        mockPhoto,
        mockThumbnailService,
        mockFileService
      );
      tile.render();

      await tile.loadThumbnail(null);

      expect(mockThumbnailService.getCachedThumbnail).toHaveBeenCalledWith(
        '/path/to/test.jpg'
      );
    });

    it('should show placeholder when no file and no cache', async () => {
      mockThumbnailService.getCachedThumbnail.mockResolvedValue(null);

      const tile = new PhotoTile(
        mockPhoto,
        mockThumbnailService,
        mockFileService
      );
      const element = tile.render();
      const img = element._child;

      await tile.loadThumbnail(null);

      // Placeholder image should be shown
      expect(img.src).toBe('/assets/placeholder-image.svg');
    });

    it('should handle thumbnail loading errors gracefully', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      mockThumbnailService.getThumbnail.mockRejectedValue(
        new Error('Load failed')
      );

      const tile = new PhotoTile(
        mockPhoto,
        mockThumbnailService,
        mockFileService
      );
      tile.render();

      await tile.loadThumbnail(mockFile);

      // Should not throw and should show placeholder
      expect(tile.element).toBeDefined();
    });

    it('should not load if element is not rendered', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      const tile = new PhotoTile(
        mockPhoto,
        mockThumbnailService,
        mockFileService
      );
      // Don't call render()

      await tile.loadThumbnail(mockFile);

      expect(mockThumbnailService.getThumbnail).not.toHaveBeenCalled();
    });
  });

  describe('_showMissingPlaceholder', () => {
    it('should set missing placeholder image', () => {
      const mockImg = {
        src: '',
        alt: '',
        classList: {
          add: vi.fn(),
        },
      };

      const tile = new PhotoTile(
        mockPhoto,
        mockThumbnailService,
        mockFileService
      );
      tile._showMissingPlaceholder(mockImg);

      expect(mockImg.src).toBe('/assets/placeholder-image.svg');
      expect(mockImg.alt).toBe('Photo not found');
      expect(mockImg.classList.add).toHaveBeenCalledWith('missing');
    });
  });
});
