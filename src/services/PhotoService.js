import exifr from 'exifr';
import { Database } from '../models/Database.js';
import { Photo } from '../models/Photo.js';
import {
  ValidationError,
  NotFoundError,
  ExifError,
  DatabaseError,
} from '../utils/errorHandling.js';

export class PhotoService {
  constructor() {
    this.db = Database.db;
  }

  async addPhoto(file) {
    try {
      // Validate file
      if (!(await this.validateFile(file))) {
        throw new ValidationError('file', 'Must be a valid image file');
      }

      // Extract metadata
      const metadata = await this.extractMetadata(file);

      // Check for duplicate
      const existing = Database.instance.getOne(
        'SELECT * FROM photos WHERE file_path = ?',
        [metadata.filePath]
      );
      if (existing) {
        return new Photo(existing);
      }

      // Insert photo
      Database.instance.run(
        `INSERT INTO photos (file_path, file_name, date_taken, width, height, file_size)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          metadata.filePath,
          metadata.fileName,
          metadata.dateTaken,
          metadata.width,
          metadata.height,
          metadata.fileSize,
        ]
      );

      // Get created photo
      const photo = Database.instance.getOne(
        'SELECT * FROM photos WHERE file_path = ?',
        [metadata.filePath]
      );

      return new Photo(photo);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError('addPhoto', error);
    }
  }

  async addPhotos(files) {
    const photos = [];
    for (const file of files) {
      try {
        const photo = await this.addPhoto(file);
        photos.push(photo);
      } catch (error) {
        console.warn(`Failed to add photo ${file.name}:`, error);
        // Continue with other photos
      }
    }
    return photos;
  }

  async getPhoto(id) {
    try {
      const photo = Database.instance.getOne(
        'SELECT * FROM photos WHERE id = ?',
        [id]
      );
      return photo ? new Photo(photo) : null;
    } catch (error) {
      throw new DatabaseError('getPhoto', error);
    }
  }

  async getPhotoByPath(filePath) {
    try {
      const photo = Database.instance.getOne(
        'SELECT * FROM photos WHERE file_path = ?',
        [filePath]
      );
      return photo ? new Photo(photo) : null;
    } catch (error) {
      throw new DatabaseError('getPhotoByPath', error);
    }
  }

  async deletePhoto(id) {
    try {
      const photo = await this.getPhoto(id);
      if (!photo) {
        throw new NotFoundError('Photo', id);
      }

      Database.instance.run('DELETE FROM photos WHERE id = ?', [id]);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('deletePhoto', error);
    }
  }

  async extractMetadata(file) {
    try {
      let dateTaken = null;
      let width = null;
      let height = null;

      // Try to extract EXIF data
      try {
        const exif = await exifr.parse(file, {
          pick: [
            'DateTimeOriginal',
            'DateTime',
            'DateTimeDigitized',
            'ExifImageWidth',
            'ExifImageHeight',
          ],
        });

        if (exif) {
          // Extract date (with fallbacks)
          const exifDate =
            exif.DateTimeOriginal || exif.DateTime || exif.DateTimeDigitized;
          if (exifDate) {
            dateTaken = Math.floor(exifDate.getTime() / 1000);
          }

          // Extract dimensions
          width = exif.ExifImageWidth || null;
          height = exif.ExifImageHeight || null;
        }
      } catch (exifError) {
        console.warn('EXIF extraction failed, using fallbacks:', exifError);
      }

      // Fallback to file modified date if no EXIF date
      if (!dateTaken && file.lastModified) {
        dateTaken = Math.floor(file.lastModified / 1000);
      }

      // If no EXIF dimensions, try to load image to get dimensions
      if (!width || !height) {
        try {
          const dimensions = await this._getImageDimensions(file);
          width = dimensions.width;
          height = dimensions.height;
        } catch (err) {
          console.warn('Could not get image dimensions:', err);
        }
      }

      return {
        fileName: file.name,
        filePath: file.webkitRelativePath || file.name,
        dateTaken,
        width,
        height,
        fileSize: file.size,
      };
    } catch (error) {
      throw new ExifError('Metadata extraction failed', error);
    }
  }

  async _getImageDimensions(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  }

  async getAlbumsForPhoto(photoId) {
    try {
      const photo = await this.getPhoto(photoId);
      if (!photo) {
        throw new NotFoundError('Photo', photoId);
      }

      const albums = Database.instance.getAll(
        `SELECT a.*
         FROM albums a
         JOIN album_photos ap ON a.id = ap.album_id
         WHERE ap.photo_id = ?
         ORDER BY a.name ASC`,
        [photoId]
      );

      return albums;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('getAlbumsForPhoto', error);
    }
  }

  async validateFile(file) {
    if (!file || !(file instanceof File)) {
      return false;
    }

    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/bmp',
      'image/tiff',
    ];

    return validTypes.includes(file.type);
  }

  async checkFileExists(_filePath) {
    // This is a placeholder - actual implementation would depend on
    // File System Access API availability
    // For now, return true (assume file exists)
    return true;
  }
}
