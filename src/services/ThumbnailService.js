export class ThumbnailService {
  constructor() {
    this.cache = null;
    this.maxCacheSize = 500 * 1024 * 1024; // 500MB
    this.thumbnailSize = 200;
    this.quality = 0.8;
  }

  async init() {
    try {
      this.cache = await this._openIndexedDB();
      return this;
    } catch (error) {
      console.warn('Failed to initialize thumbnail cache:', error);
      return this;
    }
  }

  async _openIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PhotoAlbumThumbnails', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = event => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('thumbnails')) {
          const store = db.createObjectStore('thumbnails', { keyPath: 'path' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('access_count', 'access_count', {
            unique: false,
          });
        }
      };
    });
  }

  async generateThumbnail(file, _path) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const url = URL.createObjectURL(file);

      img.onload = () => {
        // Calculate dimensions maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        const maxSize = this.thumbnailSize;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          blob => {
            URL.revokeObjectURL(url);
            resolve(blob);
          },
          'image/jpeg',
          this.quality
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image for thumbnail'));
      };

      img.src = url;
    });
  }

  async getThumbnail(file, path) {
    // Try to get from cache first
    const cached = await this._getCachedThumbnail(path);
    if (cached) {
      await this._updateAccessCount(path);
      return URL.createObjectURL(cached);
    }

    // Generate new thumbnail
    const blob = await this.generateThumbnail(file, path);

    // Cache it
    await this._cacheThumbnail(path, blob);

    return URL.createObjectURL(blob);
  }

  async getCachedThumbnail(path) {
    const cached = await this._getCachedThumbnail(path);
    if (cached) {
      await this._updateAccessCount(path);
      return URL.createObjectURL(cached);
    }
    return null;
  }

  async _getCachedThumbnail(path) {
    if (!this.cache) return null;

    return new Promise((resolve, _reject) => {
      const transaction = this.cache.transaction(['thumbnails'], 'readonly');
      const store = transaction.objectStore('thumbnails');
      const request = store.get(path);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.blob : null);
      };

      request.onerror = () => resolve(null);
    });
  }

  async _cacheThumbnail(path, blob) {
    if (!this.cache) return;

    try {
      // Check if we need to evict entries before adding
      const currentSize = await this.getCacheSize();
      if (currentSize + blob.size > this.maxCacheSize) {
        await this._evictLRUEntries(blob.size);
      }

      const transaction = this.cache.transaction(['thumbnails'], 'readwrite');
      const store = transaction.objectStore('thumbnails');

      const entry = {
        path,
        blob,
        timestamp: Date.now(),
        access_count: 1,
      };

      store.put(entry);

      await new Promise((resolve, reject) => {
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (error) {
      console.warn('Failed to cache thumbnail:', error);
    }
  }

  async deleteCachedThumbnail(path) {
    if (!this.cache) return;

    return new Promise((resolve, _reject) => {
      const transaction = this.cache.transaction(['thumbnails'], 'readwrite');
      const store = transaction.objectStore('thumbnails');
      const request = store.delete(path);

      request.onsuccess = () => {
        console.log(`Deleted cached thumbnail: ${path}`);
        resolve(true);
      };
      request.onerror = () => {
        console.warn(`Failed to delete cached thumbnail: ${path}`);
        resolve(false);
      };
    });
  }

  async _evictLRUEntries(requiredSpace) {
    if (!this.cache) return;

    try {
      const transaction = this.cache.transaction(['thumbnails'], 'readwrite');
      const store = transaction.objectStore('thumbnails');
      const request = store.getAll();

      await new Promise((resolve, reject) => {
        request.onsuccess = async () => {
          const entries = request.result;

          // Sort by access_count (ascending) then timestamp (ascending)
          // This gives us least recently/frequently used entries first
          entries.sort((a, b) => {
            if (a.access_count !== b.access_count) {
              return a.access_count - b.access_count;
            }
            return a.timestamp - b.timestamp;
          });

          let freedSpace = 0;
          const deleteTransaction = this.cache.transaction(
            ['thumbnails'],
            'readwrite'
          );
          const deleteStore = deleteTransaction.objectStore('thumbnails');

          // Delete entries until we have enough space
          for (const entry of entries) {
            if (freedSpace >= requiredSpace) break;

            deleteStore.delete(entry.path);
            freedSpace += entry.blob?.size || 0;
          }

          deleteTransaction.oncomplete = resolve;
          deleteTransaction.onerror = reject;
        };

        request.onerror = reject;
      });
    } catch (error) {
      console.warn('Failed to evict LRU entries:', error);
    }
  }

  async _updateAccessCount(path) {
    if (!this.cache) return;

    try {
      const transaction = this.cache.transaction(['thumbnails'], 'readwrite');
      const store = transaction.objectStore('thumbnails');
      const request = store.get(path);

      request.onsuccess = () => {
        const entry = request.result;
        if (entry) {
          entry.access_count += 1;
          entry.timestamp = Date.now();
          store.put(entry);
        }
      };
    } catch (error) {
      console.warn('Failed to update access count:', error);
    }
  }

  async clearCache() {
    if (!this.cache) return;

    const transaction = this.cache.transaction(['thumbnails'], 'readwrite');
    const store = transaction.objectStore('thumbnails');
    store.clear();
  }

  async getCacheSize() {
    if (!this.cache) return 0;

    return new Promise((resolve, _reject) => {
      const transaction = this.cache.transaction(['thumbnails'], 'readonly');
      const store = transaction.objectStore('thumbnails');
      const request = store.getAll();

      request.onsuccess = () => {
        const entries = request.result;
        const totalSize = entries.reduce(
          (sum, entry) => sum + (entry.blob?.size || 0),
          0
        );
        resolve(totalSize);
      };

      request.onerror = () => resolve(0);
    });
  }
}
