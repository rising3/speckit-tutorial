import { PhotoTile } from './PhotoTile.js';

export class PhotoGrid {
  constructor(photos, thumbnailService, fileService) {
    this.photos = photos;
    this.thumbnailService = thumbnailService;
    this.fileService = fileService;
    this.observer = null;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'photo-grid';

    if (this.photos.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.innerHTML = `
        <img src="/assets/placeholder-image.svg" alt="No photos" class="empty-icon" />
        <p>No photos in this album</p>
        <p class="empty-hint">Add photos to see them here</p>
      `;
      container.appendChild(empty);
      return container;
    }

    // Create photo tiles
    this.photos.forEach(photo => {
      const tile = new PhotoTile(
        photo,
        this.thumbnailService,
        this.fileService
      );
      const element = tile.render();
      container.appendChild(element);

      // Store tile instance for lazy loading
      element._tileInstance = tile;
    });

    // Set up intersection observer for lazy loading
    this._setupLazyLoading(container);

    return container;
  }

  _setupLazyLoading(container) {
    const options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.01,
    };

    this.observer = new IntersectionObserver(entries => {
      entries.forEach(async entry => {
        if (entry.isIntersecting) {
          const tile = entry.target._tileInstance;
          if (tile && !entry.target.classList.contains('loaded')) {
            // Mark as loading
            entry.target.classList.add('loading');

            // Load thumbnail from cache (files were already processed)
            await tile.loadThumbnail(null);

            this.observer.unobserve(entry.target);
          }
        }
      });
    }, options);

    // Observe all photo tiles
    container.querySelectorAll('.photo-tile').forEach(tile => {
      this.observer.observe(tile);
    });
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  static async load(
    albumId,
    albumService,
    thumbnailService,
    fileService,
    container
  ) {
    try {
      const photos = await albumService.getAlbumPhotos(albumId);
      const grid = new PhotoGrid(photos, thumbnailService, fileService);
      const element = grid.render();

      container.innerHTML = '';
      container.appendChild(element);

      return grid;
    } catch (error) {
      console.error('Failed to load photos:', error);
      container.innerHTML = `
        <div class="error-state">
          <p>Failed to load photos</p>
          <p class="error-hint">${error.message}</p>
        </div>
      `;
      return null;
    }
  }
}
