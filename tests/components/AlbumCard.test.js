import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AlbumCard } from '../../src/components/AlbumCard.js';

// Mock utilities
vi.mock('../../src/utils/dateUtils.js', () => ({
  formatDate: vi.fn((date, format) => {
    if (format === 'short') return 'Jan 1, 2024';
    return 'January 1, 2024';
  }),
}));

vi.mock('../../src/utils/dragDrop.js', () => ({
  initDragStart: vi.fn(),
  setDragData: vi.fn(),
  addDraggingClass: vi.fn(),
  removeDraggingClass: vi.fn(),
}));

describe('AlbumCard', () => {
  let mockAlbum;
  let mockOnClick;
  let mockThumbnailService;

  beforeEach(() => {
    mockAlbum = {
      id: 1,
      name: 'Test Album',
      photo_count: 5,
      display_date: 1704067200,
      display_order: 0,
    };

    mockOnClick = vi.fn();

    mockThumbnailService = {
      getCachedThumbnail: vi.fn(),
    };

    // Mock DOM
    global.document = {
      createElement: tag => {
        const element = {
          tagName: tag.toUpperCase(),
          className: '',
          dataset: {},
          style: {},
          textContent: '',
          innerHTML: '',
          draggable: false,
          children: [],
          appendChild: vi.fn(function (child) {
            this.children.push(child);
            return child;
          }),
          addEventListener: vi.fn(),
          classList: {
            add: vi.fn(),
          },
        };
        return element;
      },
    };
  });

  describe('render', () => {
    it('should render album card with correct structure', () => {
      const card = new AlbumCard(mockAlbum, mockOnClick);
      const element = card.render();

      expect(element.className).toBe('album-card');
      expect(element.dataset.albumId).toBe(1);
      expect(element.draggable).toBe(true);
    });

    it('should show placeholder for empty album', () => {
      mockAlbum.photo_count = 0;
      const card = new AlbumCard(mockAlbum, mockOnClick);
      const element = card.render();

      const thumbnail = element.children.find(
        c => c.className === 'album-thumbnail'
      );
      expect(thumbnail).toBeDefined();
      expect(thumbnail.children.length).toBeGreaterThan(0);
    });

    it('should show cover image for non-empty album with thumbnailService', () => {
      const card = new AlbumCard(mockAlbum, mockOnClick, mockThumbnailService);
      const element = card.render();

      const thumbnail = element.children.find(
        c => c.className === 'album-thumbnail'
      );
      expect(thumbnail).toBeDefined();
      const img = thumbnail.children.find(
        c => c.className === 'album-cover-image'
      );
      expect(img).toBeDefined();
    });

    it('should display album name', () => {
      const card = new AlbumCard(mockAlbum, mockOnClick);
      const element = card.render();

      const info = element.children.find(c => c.className === 'album-info');
      expect(info).toBeDefined();
      const name = info.children.find(c => c.className === 'album-name');
      expect(name.textContent).toBe('Test Album');
    });

    it('should display photo count correctly (singular)', () => {
      mockAlbum.photo_count = 1;
      const card = new AlbumCard(mockAlbum, mockOnClick);
      const element = card.render();

      const info = element.children.find(c => c.className === 'album-info');
      const meta = info.children.find(c => c.className === 'album-meta');
      const count = meta.children.find(c => c.className === 'album-count');
      expect(count.textContent).toBe('1 photo');
    });

    it('should display photo count correctly (plural)', () => {
      mockAlbum.photo_count = 5;
      const card = new AlbumCard(mockAlbum, mockOnClick);
      const element = card.render();

      const info = element.children.find(c => c.className === 'album-info');
      const meta = info.children.find(c => c.className === 'album-meta');
      const count = meta.children.find(c => c.className === 'album-count');
      expect(count.textContent).toBe('5 photos');
    });

    it('should add click event listener', () => {
      const card = new AlbumCard(mockAlbum, mockOnClick);
      const element = card.render();

      expect(element.addEventListener).toHaveBeenCalledWith(
        'click',
        expect.any(Function)
      );
    });

    it('should add drag event listeners', () => {
      const card = new AlbumCard(mockAlbum, mockOnClick);
      const element = card.render();

      expect(element.addEventListener).toHaveBeenCalledWith(
        'dragstart',
        expect.any(Function)
      );
      expect(element.addEventListener).toHaveBeenCalledWith(
        'dragend',
        expect.any(Function)
      );
    });
  });

  describe('_loadCoverImage', () => {
    it('should load cached cover image', async () => {
      mockThumbnailService.getCachedThumbnail.mockResolvedValue(
        'blob:test-url'
      );

      const mockImg = {
        src: '',
        classList: {
          add: vi.fn(),
        },
      };

      const card = new AlbumCard(mockAlbum, mockOnClick, mockThumbnailService);
      await card._loadCoverImage(mockImg);

      expect(mockThumbnailService.getCachedThumbnail).toHaveBeenCalledWith(
        'album-1-first'
      );
      expect(mockImg.src).toBe('blob:test-url');
      expect(mockImg.classList.add).toHaveBeenCalledWith('loaded');
    });

    it('should handle missing cover image gracefully', async () => {
      mockThumbnailService.getCachedThumbnail.mockResolvedValue(null);

      const mockImg = {
        src: 'placeholder',
        classList: {
          add: vi.fn(),
        },
      };

      const card = new AlbumCard(mockAlbum, mockOnClick, mockThumbnailService);
      await card._loadCoverImage(mockImg);

      expect(mockImg.src).toBe('placeholder');
      expect(mockImg.classList.add).not.toHaveBeenCalled();
    });
  });
});
