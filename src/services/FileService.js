export class FileService {
  constructor() {
    this.supportsFileSystemAccess = 'showOpenFilePicker' in window;
  }

  /**
   * Open file picker to select photos
   * @param {boolean} multiple - Allow multiple file selection
   * @returns {Promise<File[]>} Array of selected files
   */
  async selectPhotos(multiple = true) {
    if (this.supportsFileSystemAccess) {
      return await this._useFileSystemAccessAPI(multiple);
    } else {
      return await this._useFallbackFilePicker(multiple);
    }
  }

  async _useFileSystemAccessAPI(multiple) {
    try {
      const options = {
        types: [
          {
            description: 'Images',
            accept: {
              'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'],
            },
          },
        ],
        multiple,
      };

      const fileHandles = await window.showOpenFilePicker(options);
      const files = await Promise.all(
        fileHandles.map(handle => handle.getFile())
      );

      return files;
    } catch (error) {
      if (error.name === 'AbortError') {
        return []; // User cancelled
      }
      throw error;
    }
  }

  async _useFallbackFilePicker(multiple) {
    return new Promise((resolve, _reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = multiple;

      input.onchange = e => {
        const files = Array.from(e.target.files || []);
        resolve(files);
      };

      input.oncancel = () => {
        resolve([]); // User cancelled
      };

      input.click();
    });
  }

  /**
   * Check if File System Access API is available
   * @returns {boolean}
   */
  hasFileSystemAccess() {
    return this.supportsFileSystemAccess;
  }
}
