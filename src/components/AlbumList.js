import { AlbumCard } from './AlbumCard.js';
import {
  getDragData,
  calculateDropPosition,
  addDropZoneClass,
  removeDropZoneClass,
} from '../utils/dragDrop.js';

export class AlbumList {
  constructor(albums, onAlbumClick, albumService, thumbnailService = null) {
    this.albums = albums;
    this.onAlbumClick = onAlbumClick;
    this.albumService = albumService;
    this.thumbnailService = thumbnailService;
    this.containerElement = null;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'album-list';
    this.containerElement = container;

    if (this.albums.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.innerHTML = `
        <div class="empty-icon">📁</div>
        <h2>Welcome to Photo Album Organizer</h2>
        <p>You don't have any albums yet</p>
        <div class="empty-guide">
          <h3>Getting Started:</h3>
          <ol>
            <li>Click the <strong>"Create Album"</strong> button above</li>
            <li>Give your album a name (e.g., "Summer Vacation 2024")</li>
            <li>Click on the album to open it</li>
            <li>Add photos by clicking <strong>"Add Photos"</strong></li>
            <li>Drag and drop to organize your photos</li>
          </ol>
        </div>
        <p class="empty-hint">💡 Tip: You can drag albums to reorder them</p>
      `;
      container.appendChild(empty);
      return container;
    }

    this.albums.forEach(album => {
      const card = new AlbumCard(
        album,
        this.onAlbumClick,
        this.thumbnailService
      );
      container.appendChild(card.render());
    });

    // Setup drag and drop handlers
    this.setupDragAndDrop(container);

    return container;
  }

  setupDragAndDrop(container) {
    // Add event listeners to the container
    container.addEventListener('dragover', e => this.handleDragOver(e));
    container.addEventListener('dragleave', e => this.handleDragLeave(e));
    container.addEventListener('drop', e => this.handleDrop(e));

    // Also set up dragover on individual cards for better feedback
    const cards = container.querySelectorAll('.album-card');
    cards.forEach(card => {
      card.addEventListener('dragover', e => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) {
          e.dataTransfer.dropEffect = 'move';
        }
      });
    });
  }

  handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    addDropZoneClass(event.currentTarget);
  }

  handleDragLeave(event) {
    // Only remove class if leaving the container itself, not child elements
    if (event.target === event.currentTarget) {
      removeDropZoneClass(event.currentTarget);
    }
  }

  async handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    removeDropZoneClass(event.currentTarget);

    const albumId = parseInt(getDragData(event, 'application/x-album-id'), 10);
    if (!albumId || isNaN(albumId)) {
      console.warn('No valid album ID found in drop data');
      return;
    }

    try {
      // Calculate drop position (index in filtered array)
      const dropIndex = calculateDropPosition(event.currentTarget, event);
      console.log(`Drop index: ${dropIndex}`);

      // Get all albums in current order to determine the actual display_order
      const albums = await this.albumService.listAlbums('manual');

      // Find the dragged album
      const draggedAlbum = albums.find(a => a.id === albumId);
      if (!draggedAlbum) {
        console.error('Dragged album not found');
        return;
      }

      // Calculate the target display_order
      // We need to map the drop index (excluding dragged item) to actual display_order
      const albumsExcludingDragged = albums.filter(a => a.id !== albumId);

      let newDisplayOrder;
      if (dropIndex >= albumsExcludingDragged.length) {
        // Dropping at the end
        newDisplayOrder =
          albumsExcludingDragged.length > 0
            ? albumsExcludingDragged[albumsExcludingDragged.length - 1]
                .display_order + 1
            : 0;
      } else {
        // Dropping before an existing album
        newDisplayOrder = albumsExcludingDragged[dropIndex].display_order;
      }

      console.log(
        `Dropping album ${albumId} (current order: ${draggedAlbum.display_order}) at display_order ${newDisplayOrder}`
      );

      // Reorder albums
      await this.albumService.reorderAlbums(albumId, newDisplayOrder);

      // Refresh the album list
      const parentContainer =
        this.containerElement?.parentElement ||
        event.currentTarget.parentElement;
      if (!parentContainer) {
        console.error('Cannot find parent container to refresh album list');
        return;
      }

      await AlbumList.load(
        this.albumService,
        parentContainer,
        this.onAlbumClick,
        this.thumbnailService
      );

      console.log('Album reordered successfully');
    } catch (error) {
      console.error('Failed to reorder albums:', error);
      const Toast = (await import('./Toast.js')).Toast;
      Toast.error(`Failed to reorder albums: ${error.message}`);
    }
  }

  static async load(
    albumService,
    container,
    onAlbumClick,
    thumbnailService = null
  ) {
    try {
      const albums = await albumService.listAlbums('manual');
      const albumList = new AlbumList(
        albums,
        onAlbumClick,
        albumService,
        thumbnailService
      );
      const element = albumList.render();

      container.innerHTML = '';
      container.appendChild(element);
    } catch (error) {
      console.error('Failed to load albums:', error);
      container.innerHTML = `
        <div class="error-state">
          <p>Failed to load albums</p>
          <p class="error-hint">${error.message}</p>
        </div>
      `;
    }
  }
}
