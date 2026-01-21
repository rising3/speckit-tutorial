import { formatDate } from '../utils/dateUtils.js';
import {
  initDragStart,
  setDragData,
  addDraggingClass,
  removeDraggingClass,
} from '../utils/dragDrop.js';

export class AlbumCard {
  constructor(album, onClick, thumbnailService = null) {
    this.album = album;
    this.onClick = onClick;
    this.thumbnailService = thumbnailService;
  }

  render() {
    const card = document.createElement('div');
    card.className = 'album-card';
    card.dataset.albumId = this.album.id;
    card.draggable = true;

    // Empty album check
    const isEmpty = this.album.photo_count === 0;

    // Album thumbnail or placeholder
    const thumbnail = document.createElement('div');
    thumbnail.className = 'album-thumbnail';

    if (isEmpty) {
      const placeholder = document.createElement('img');
      placeholder.src = '/assets/placeholder-image.svg';
      placeholder.alt = 'Empty album';
      placeholder.className = 'album-placeholder';
      thumbnail.appendChild(placeholder);
    } else {
      // Load first photo thumbnail as cover
      const coverImg = document.createElement('img');
      coverImg.className = 'album-cover-image';
      coverImg.alt = this.album.name;
      coverImg.src =
        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23e0e0e0" width="200" height="200"/%3E%3C/svg%3E';
      thumbnail.appendChild(coverImg);

      // Load cover image asynchronously
      if (this.thumbnailService) {
        this._loadCoverImage(coverImg);
      }
    }

    card.appendChild(thumbnail);

    // Album info
    const info = document.createElement('div');
    info.className = 'album-info';

    const name = document.createElement('h3');
    name.className = 'album-name';
    name.textContent = this.album.name;
    info.appendChild(name);

    const meta = document.createElement('div');
    meta.className = 'album-meta';

    // Date display
    const date = document.createElement('span');
    date.className = 'album-date';
    date.textContent = this.album.display_date
      ? formatDate(this.album.display_date, 'short')
      : 'No photos yet';
    meta.appendChild(date);

    // Photo count
    const count = document.createElement('span');
    count.className = 'album-count';
    count.textContent = `${this.album.photo_count} ${
      this.album.photo_count === 1 ? 'photo' : 'photos'
    }`;
    meta.appendChild(count);

    info.appendChild(meta);
    card.appendChild(info);

    // Drag event handlers
    card.addEventListener('dragstart', e => this.handleDragStart(e));
    card.addEventListener('dragend', e => this.handleDragEnd(e));

    // Click handler
    card.addEventListener('click', () => {
      if (this.onClick) {
        this.onClick(this.album);
      }
    });

    return card;
  }

  async _loadCoverImage(imgElement) {
    try {
      // Get the first photo from this album
      const cachedThumbnail = await this.thumbnailService.getCachedThumbnail(
        `album-${this.album.id}-first`
      );

      if (cachedThumbnail) {
        imgElement.src = cachedThumbnail;
        imgElement.classList.add('loaded');
      }
    } catch (error) {
      console.warn(`Failed to load cover for album ${this.album.id}:`, error);
    }
  }

  handleDragStart(event) {
    initDragStart(event);
    setDragData(event, 'application/x-album-id', this.album.id.toString());
    addDraggingClass(event.target);

    // Set drag image opacity
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  handleDragEnd(event) {
    removeDraggingClass(event.target);
  }
}
