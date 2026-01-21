export class PhotoTile {
  constructor(photo, thumbnailService, fileService) {
    this.photo = photo;
    this.thumbnailService = thumbnailService;
    this.fileService = fileService;
    this.element = null;
  }

  render() {
    const tile = document.createElement('div');
    tile.className = 'photo-tile';
    tile.dataset.photoId = this.photo.id;

    const img = document.createElement('img');
    img.className = 'photo-image';
    img.alt = this.photo.file_name;
    img.dataset.src = this.photo.file_path; // For lazy loading

    // Placeholder while loading
    img.src =
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23e0e0e0" width="200" height="200"/%3E%3C/svg%3E';

    tile.appendChild(img);

    this.element = tile;
    return tile;
  }

  async loadThumbnail(file) {
    if (!this.element) return;

    const img = this.element.querySelector('.photo-image');
    if (!img) return;

    console.log('Loading thumbnail for:', this.photo.file_name, 'file:', file);

    try {
      // If no file provided, try to load from cache
      if (!file) {
        const cachedThumbnail = await this.thumbnailService.getCachedThumbnail(
          this.photo.file_path
        );
        if (cachedThumbnail) {
          console.log('Using cached thumbnail');
          img.src = cachedThumbnail;
          img.classList.add('loaded');
          return;
        }
        console.warn('No file provided and no cached thumbnail');
        this._showMissingPlaceholder(img);
        return;
      }

      // Generate or retrieve thumbnail
      const thumbnailUrl = await this.thumbnailService.getThumbnail(
        file,
        this.photo.file_path
      );
      console.log('Thumbnail generated/retrieved:', thumbnailUrl);
      img.src = thumbnailUrl;
      img.classList.add('loaded');
    } catch (error) {
      console.error('Failed to load thumbnail:', error);
      this._showMissingPlaceholder(img);
    }
  }

  _showMissingPlaceholder(img) {
    img.src = '/assets/placeholder-image.svg';
    img.alt = 'Photo not found';
    img.classList.add('missing');
  }
}
