import './style.css';
import { Database } from './models/Database.js';
import { AlbumService } from './services/AlbumService.js';
import { PhotoService } from './services/PhotoService.js';
import { FileService } from './services/FileService.js';
import { ThumbnailService } from './services/ThumbnailService.js';
import { AlbumList } from './components/AlbumList.js';
import { PhotoGrid } from './components/PhotoGrid.js';
import { Toast } from './components/Toast.js';
import { LoadingIndicator } from './components/LoadingIndicator.js';

// Global services
let albumService;
let photoService;
let fileService;
let thumbnailService;

// Current view state
let currentView = 'albums'; // 'albums' or 'photos'
let currentAlbum = null;
let currentPhotoGrid = null;

// Performance monitoring
const performanceMetrics = {
  albumLoadTimes: [],
  thumbnailLoadTimes: [],
};

// Initialize application
async function init() {
  try {
    console.log('Initializing Photo Album Organizer...');

    await LoadingIndicator.wrap(async () => {
      // Initialize database
      await Database.init();
      console.log('✅ Database initialized');

      // Initialize services
      albumService = new AlbumService();
      photoService = new PhotoService();
      fileService = new FileService();
      thumbnailService = await new ThumbnailService().init();
      console.log('✅ Services initialized');
    }, 'Initializing application...');

    // Set up event listeners
    setupEventListeners();

    // Load album list
    await loadAlbumList();

    console.log('✅ Application ready');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    Toast.error('Failed to start application. Please refresh the page.');
  }
}

function setupEventListeners() {
  const createAlbumBtn = document.querySelector('#create-album-btn');
  console.log('Setting up event listeners, button found:', !!createAlbumBtn);
  if (createAlbumBtn) {
    createAlbumBtn.addEventListener('click', () => {
      console.log('Create album button clicked');
      handleCreateAlbum();
    });
  } else {
    console.error('Create album button not found in DOM');
  }

  // Keyboard navigation
  document.addEventListener('keydown', handleKeyboardNavigation);
}

function handleKeyboardNavigation(event) {
  // ESC - Go back or close dialogs
  if (event.key === 'Escape') {
    if (currentView === 'photos') {
      const backBtn = document.querySelector('#back-btn');
      if (backBtn) backBtn.click();
    }
  }

  // Arrow keys for album/photo navigation
  if (event.key.startsWith('Arrow')) {
    const focusedElement = document.activeElement;
    const container =
      currentView === 'albums'
        ? document.querySelector('.album-list')
        : document.querySelector('.photo-grid');

    if (container) {
      const items = Array.from(
        container.querySelectorAll(
          currentView === 'albums' ? '.album-card' : '.photo-tile'
        )
      );
      const currentIndex = items.indexOf(focusedElement);

      let nextIndex = -1;
      if (event.key === 'ArrowRight' && currentIndex < items.length - 1) {
        nextIndex = currentIndex + 1;
      } else if (event.key === 'ArrowLeft' && currentIndex > 0) {
        nextIndex = currentIndex - 1;
      } else if (event.key === 'ArrowDown') {
        const cols = Math.floor(container.offsetWidth / 250);
        nextIndex = Math.min(currentIndex + cols, items.length - 1);
      } else if (event.key === 'ArrowUp') {
        const cols = Math.floor(container.offsetWidth / 250);
        nextIndex = Math.max(currentIndex - cols, 0);
      }

      if (nextIndex !== -1 && items[nextIndex]) {
        items[nextIndex].focus();
        event.preventDefault();
      }
    }
  }

  // Enter - Activate focused element
  if (event.key === 'Enter') {
    const focusedElement = document.activeElement;
    if (focusedElement.classList.contains('album-card')) {
      focusedElement.click();
    }
  }
}

async function loadAlbumList() {
  const container = document.querySelector('#album-list');
  if (!container) return;

  const startTime = performance.now();

  try {
    await LoadingIndicator.wrap(async () => {
      await AlbumList.load(
        albumService,
        container,
        handleAlbumClick,
        thumbnailService
      );
      currentView = 'albums';

      // Add keyboard navigation attributes
      const albumCards = container.querySelectorAll('.album-card');
      albumCards.forEach((card, index) => {
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Album ${index + 1}`);
      });
    }, 'Loading albums...');

    const loadTime = performance.now() - startTime;
    performanceMetrics.albumLoadTimes.push(loadTime);
    console.log(`Album list loaded in ${loadTime.toFixed(0)}ms`);

    if (loadTime > 2000) {
      console.warn('⚠️ Album load time exceeded 2s target');
    }
  } catch (error) {
    console.error('Failed to load albums:', error);
    Toast.error('Failed to load albums. Please try again.');
  }
}

function handleAlbumClick(album) {
  currentAlbum = album;
  showAlbumDetail(album);
}

async function showAlbumDetail(album) {
  // Update header
  const header = document.querySelector('header h1');
  if (header) {
    header.innerHTML = `
      <button id="back-btn" class="back-button">← Back</button>
      <span>${album.name}</span>
    `;

    const backBtn = document.querySelector('#back-btn');
    backBtn.addEventListener('click', () => {
      loadAlbumList();
      header.innerHTML = 'Photo Albums';

      // Show create album button again
      const createBtn = document.querySelector('#create-album-btn');
      if (createBtn) {
        createBtn.style.display = 'block';
      }
    });
  }

  // Hide create album button, show add photos button
  const createBtn = document.querySelector('#create-album-btn');
  if (createBtn) {
    createBtn.style.display = 'none';
  }

  // Add "Add Photos" button to header
  const existingAddBtn = document.querySelector('#add-photos-btn');
  if (!existingAddBtn && header) {
    const addPhotosBtn = document.createElement('button');
    addPhotosBtn.id = 'add-photos-btn';
    addPhotosBtn.textContent = 'Add Photos';
    addPhotosBtn.addEventListener('click', async () => {
      await handleAddPhotosToAlbum(album);
      // Refresh photo grid
      await refreshAlbumDetail(album);
    });
    header.appendChild(addPhotosBtn);
  }

  // Load photos
  const container = document.querySelector('#album-list');
  if (container) {
    // Clean up previous grid
    if (currentPhotoGrid) {
      currentPhotoGrid.destroy();
      currentPhotoGrid = null;
    }

    currentPhotoGrid = await PhotoGrid.load(
      album.id,
      albumService,
      thumbnailService,
      fileService,
      container
    );
    currentView = 'photos';

    // Update album cover cache with current first photo
    await updateAlbumCover(album.id);
  }
}

async function updateAlbumCover(albumId) {
  try {
    // Delete the old album cover cache first
    const coverKey = `album-${albumId}-first`;
    await thumbnailService.deleteCachedThumbnail(coverKey);
    console.log(`Deleted old album cover cache for album ${albumId}`);

    // Get the first photo from the album
    const photos = await albumService.getAlbumPhotos(albumId);
    if (photos.length === 0) {
      console.log(`No photos in album ${albumId}, skipping cover update`);
      return;
    }

    const firstPhoto = photos[0];

    // Try to get the cached thumbnail for the first photo
    const cachedThumbnail = await thumbnailService.getCachedThumbnail(
      firstPhoto.file_path
    );

    if (cachedThumbnail) {
      // Update the album cover cache with the current first photo's thumbnail
      // We need to re-cache it under the album cover key
      const response = await fetch(cachedThumbnail);
      const blob = await response.blob();
      const file = new File([blob], firstPhoto.file_name, {
        type: blob.type,
      });
      await thumbnailService.getThumbnail(file, coverKey);
      console.log(
        `Updated album cover for album ${albumId} with photo: ${firstPhoto.file_name}`
      );
    } else {
      console.log(
        `No cached thumbnail found for first photo: ${firstPhoto.file_path}`
      );
    }
  } catch (error) {
    console.warn(`Failed to update album cover for album ${albumId}:`, error);
  }
}

async function refreshAlbumDetail(album) {
  // Reload album data to get updated photo count
  const updatedAlbum = await albumService.getAlbum(album.id);
  if (!updatedAlbum) return;

  currentAlbum = updatedAlbum;

  // Update album cover cache with current first photo
  await updateAlbumCover(updatedAlbum.id);

  // Reload photo grid
  const container = document.querySelector('#album-list');
  if (container) {
    if (currentPhotoGrid) {
      currentPhotoGrid.destroy();
      currentPhotoGrid = null;
    }

    currentPhotoGrid = await PhotoGrid.load(
      updatedAlbum.id,
      albumService,
      thumbnailService,
      fileService,
      container
    );
  }
}

async function handleCreateAlbum() {
  console.log('handleCreateAlbum called');
  const name = prompt('Enter album name:');
  console.log('User entered name:', name);
  if (!name) return;

  try {
    console.log('Creating album with name:', name);
    await LoadingIndicator.wrap(async () => {
      const album = await albumService.createAlbum(name);
      console.log('Album created:', album);

      // Reload album list
      await loadAlbumList();

      Toast.success(
        `Album "${name}" created successfully! Click the album to add photos.`
      );
    }, 'Creating album...');
  } catch (error) {
    console.error('Failed to create album:', error);
    Toast.error(error.message || 'Failed to create album');
  }
}

async function handleAddPhotosToAlbum(album) {
  try {
    await LoadingIndicator.wrap(async () => {
      // Import FilePickerDialog dynamically
      const { FilePickerDialog } =
        await import('./components/FilePickerDialog.js');

      // Show file picker
      const files = await FilePickerDialog.open(fileService, photoService);

      if (files.length === 0) {
        return; // User cancelled or no valid files
      }

      // Add photos to database
      const photos = await photoService.addPhotos(files);
      console.log(`Added ${photos.length} photos to database`);

      // Associate photos with album
      const photoIds = photos.map(p => p.id);
      await albumService.addPhotosToAlbum(album.id, photoIds);
      console.log(
        `Associated ${photoIds.length} photos with album ${album.id}`
      );

      // Generate thumbnails and wait for completion
      await generateThumbnailsAsync(files, photos);

      Toast.success(
        `Successfully added ${photos.length} photo(s) to "${album.name}"`
      );
    }, 'Adding photos...');
  } catch (error) {
    console.error('Failed to add photos:', error);
    Toast.error(error.message || 'Failed to add photos');
  }
}

async function generateThumbnailsAsync(files, photos) {
  // Generate thumbnails in background without blocking UI
  for (let i = 0; i < files.length; i++) {
    try {
      const file = files[i];
      const photo = photos[i];
      await thumbnailService.getThumbnail(file, photo.file_path);
      console.log(`Generated thumbnail for ${photo.file_name}`);

      // If this is the first photo, also cache it as album cover
      if (i === 0 && currentAlbum) {
        await thumbnailService.getThumbnail(
          file,
          `album-${currentAlbum.id}-first`
        );
        console.log(`Cached album cover for album ${currentAlbum.id}`);
      }
    } catch (error) {
      console.warn(`Failed to generate thumbnail:`, error);
    }
  }
}

// Start the application
init();
