import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AlbumList } from '../../src/components/AlbumList.js';

describe('AlbumList', () => {
  let mockAlbums;
  let mockAlbumService;
  let mockThumbnailService;
  let mockOnClick;

  beforeEach(() => {
    mockAlbums = [
      {
        id: 1,
        name: 'Album 1',
        photo_count: 5,
        display_order: 0,
        display_date: '2024-01-01',
      },
      {
        id: 2,
        name: 'Album 2',
        photo_count: 3,
        display_order: 1,
        display_date: '2024-01-02',
      },
    ];

    mockAlbumService = {
      listAlbums: vi.fn().mockResolvedValue(mockAlbums),
      reorderAlbums: vi.fn().mockResolvedValue(),
      getAlbum: vi.fn(),
    };

    mockThumbnailService = {
      getCachedThumbnail: vi.fn().mockResolvedValue('blob:mock'),
    };

    mockOnClick = vi.fn();

    // Mock DOM
    global.document = {
      createElement: vi.fn(tag => {
        const element = {
          tagName: tag.toUpperCase(),
          className: '',
          innerHTML: '',
          children: [],
          dataset: {},
          draggable: false,
          appendChild: vi.fn(function (child) {
            this.children.push(child);
          }),
          addEventListener: vi.fn(),
          querySelector: vi.fn(),
          querySelectorAll: vi.fn(() => []),
        };
        return element;
      }),
    };
  });

  describe('render', () => {
    it('should render empty state when no albums', () => {
      const albumList = new AlbumList([], mockOnClick, mockAlbumService);
      const element = albumList.render();

      expect(element.className).toBe('album-list');
      // Empty state creates a div with empty-state class
      expect(element.children.length).toBeGreaterThan(0);
    });

    it('should render album cards for each album', () => {
      const albumList = new AlbumList(
        mockAlbums,
        mockOnClick,
        mockAlbumService,
        mockThumbnailService
      );
      const element = albumList.render();

      expect(element.className).toBe('album-list');
      expect(element.children.length).toBe(2);
    });

    it('should setup drag and drop handlers', () => {
      const albumList = new AlbumList(
        mockAlbums,
        mockOnClick,
        mockAlbumService
      );
      const element = albumList.render();

      expect(element.addEventListener).toHaveBeenCalledWith(
        'dragover',
        expect.any(Function)
      );
      expect(element.addEventListener).toHaveBeenCalledWith(
        'dragleave',
        expect.any(Function)
      );
      expect(element.addEventListener).toHaveBeenCalledWith(
        'drop',
        expect.any(Function)
      );
    });
  });

  describe('handleDrop', () => {
    it('should reorder albums on drop', async () => {
      mockAlbumService.listAlbums.mockResolvedValue(mockAlbums);

      const albumList = new AlbumList(
        mockAlbums,
        mockOnClick,
        mockAlbumService
      );
      const container = albumList.render();
      albumList.containerElement = container;

      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        currentTarget: container,
        dataTransfer: {
          getData: vi.fn(() => '1'),
        },
        clientX: 100,
        clientY: 100,
      };

      // Mock parent element
      container.parentElement = {
        innerHTML: '',
        appendChild: vi.fn(),
      };

      await albumList.handleDrop(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockAlbumService.listAlbums).toHaveBeenCalledWith('manual');
    });

    it('should handle invalid album ID gracefully', async () => {
      const albumList = new AlbumList(
        mockAlbums,
        mockOnClick,
        mockAlbumService
      );
      const container = albumList.render();

      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        currentTarget: container,
        dataTransfer: {
          getData: vi.fn(() => ''), // Empty ID
        },
      };

      await albumList.handleDrop(mockEvent);

      expect(mockAlbumService.reorderAlbums).not.toHaveBeenCalled();
    });
  });

  describe('static load', () => {
    it('should load and render album list', async () => {
      const container = {
        innerHTML: '',
        appendChild: vi.fn(),
      };

      await AlbumList.load(
        mockAlbumService,
        container,
        mockOnClick,
        mockThumbnailService
      );

      expect(mockAlbumService.listAlbums).toHaveBeenCalledWith('manual');
      expect(container.appendChild).toHaveBeenCalled();
    });

    it('should handle errors during load', async () => {
      mockAlbumService.listAlbums.mockRejectedValue(new Error('Load failed'));

      const container = {
        innerHTML: '',
        appendChild: vi.fn(),
      };

      // Should not throw
      await AlbumList.load(mockAlbumService, container, mockOnClick);

      expect(container.innerHTML).toContain('Failed to load albums');
    });
  });
});
