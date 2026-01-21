import { Database } from '../models/Database.js';
import { Album } from '../models/Album.js';
import {
  ValidationError,
  NotFoundError,
  DuplicateError,
  DatabaseError,
} from '../utils/errorHandling.js';

export class AlbumService {
  constructor() {
    this.db = Database.db;
  }

  async createAlbum(name) {
    // Validate input
    const errors = Album.validate({ name, display_order: 0 });
    if (errors.length > 0) {
      throw new ValidationError('name', errors.join(', '));
    }

    try {
      // Check for duplicate name
      const existing = Database.instance.getOne(
        'SELECT id FROM albums WHERE name = ?',
        [name]
      );
      if (existing) {
        throw new DuplicateError('Album', 'name', name);
      }

      // Get next display_order
      const maxOrderResult = Database.instance.getOne(
        'SELECT MAX(display_order) as max_order FROM albums'
      );
      const nextOrder = (maxOrderResult?.max_order ?? -1) + 1;

      // Insert album
      Database.instance.run(
        'INSERT INTO albums (name, display_order, display_date) VALUES (?, ?, NULL)',
        [name, nextOrder]
      );

      // Get created album
      const album = Database.instance.getOne(
        'SELECT * FROM albums WHERE name = ?',
        [name]
      );

      return new Album({ ...album, photo_count: 0 });
    } catch (error) {
      if (error instanceof ValidationError || error instanceof DuplicateError) {
        throw error;
      }
      throw new DatabaseError('createAlbum', error);
    }
  }

  async listAlbums(sortBy = 'date') {
    // Validate sortBy
    if (sortBy !== 'date' && sortBy !== 'manual') {
      throw new ValidationError('sortBy', 'Must be "date" or "manual"');
    }

    try {
      const orderClause =
        sortBy === 'date'
          ? 'ORDER BY display_date DESC NULLS LAST, id DESC'
          : 'ORDER BY display_order ASC';

      const albums = Database.instance.getAll(
        `SELECT a.*, 
          (SELECT COUNT(*) FROM album_photos WHERE album_id = a.id) as photo_count
         FROM albums a
         ${orderClause}`
      );

      return albums.map(album => new Album(album));
    } catch (error) {
      throw new DatabaseError('listAlbums', error);
    }
  }

  async getAlbum(id) {
    try {
      const album = Database.instance.getOne(
        `SELECT a.*,
          (SELECT COUNT(*) FROM album_photos WHERE album_id = a.id) as photo_count
         FROM albums a
         WHERE a.id = ?`,
        [id]
      );

      return album ? new Album(album) : null;
    } catch (error) {
      throw new DatabaseError('getAlbum', error);
    }
  }

  async updateAlbum(id, updates) {
    try {
      // Check if album exists
      const album = await this.getAlbum(id);
      if (!album) {
        throw new NotFoundError('Album', id);
      }

      // Validate updates
      if (updates.name) {
        const errors = Album.validate({
          name: updates.name,
          display_order: 0,
        });
        if (errors.length > 0) {
          throw new ValidationError('name', errors.join(', '));
        }

        // Check for duplicate name
        const existing = Database.instance.getOne(
          'SELECT id FROM albums WHERE name = ? AND id != ?',
          [updates.name, id]
        );
        if (existing) {
          throw new DuplicateError('Album', 'name', updates.name);
        }

        Database.instance.run('UPDATE albums SET name = ? WHERE id = ?', [
          updates.name,
          id,
        ]);
      }

      // Get updated album
      return await this.getAlbum(id);
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof ValidationError ||
        error instanceof DuplicateError
      ) {
        throw error;
      }
      throw new DatabaseError('updateAlbum', error);
    }
  }

  async deleteAlbum(id) {
    try {
      // Check if album exists
      const album = await this.getAlbum(id);
      if (!album) {
        throw new NotFoundError('Album', id);
      }

      Database.instance.run('DELETE FROM albums WHERE id = ?', [id]);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('deleteAlbum', error);
    }
  }

  async addPhotosToAlbum(albumId, photoIds) {
    try {
      // Check if album exists
      const album = await this.getAlbum(albumId);
      if (!album) {
        throw new NotFoundError('Album', albumId);
      }

      // Add photos (skip duplicates)
      for (const photoId of photoIds) {
        try {
          Database.instance.run(
            'INSERT INTO album_photos (album_id, photo_id) VALUES (?, ?)',
            [albumId, photoId]
          );
        } catch (err) {
          // Skip duplicate entries silently
          if (!err.message.includes('UNIQUE constraint')) {
            throw err;
          }
        }
      }

      // Update album display_date to earliest photo
      Database.instance.run(
        `UPDATE albums 
         SET display_date = (
           SELECT MIN(p.date_taken) 
           FROM photos p 
           JOIN album_photos ap ON p.id = ap.photo_id 
           WHERE ap.album_id = ?
         )
         WHERE id = ?`,
        [albumId, albumId]
      );
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('addPhotosToAlbum', error);
    }
  }

  async removePhotosFromAlbum(albumId, photoIds) {
    try {
      // Check if album exists
      const album = await this.getAlbum(albumId);
      if (!album) {
        throw new NotFoundError('Album', albumId);
      }

      // Remove photos
      for (const photoId of photoIds) {
        Database.instance.run(
          'DELETE FROM album_photos WHERE album_id = ? AND photo_id = ?',
          [albumId, photoId]
        );
      }

      // Update album display_date
      Database.instance.run(
        `UPDATE albums 
         SET display_date = (
           SELECT MIN(p.date_taken) 
           FROM photos p 
           JOIN album_photos ap ON p.id = ap.photo_id 
           WHERE ap.album_id = ?
         )
         WHERE id = ?`,
        [albumId, albumId]
      );
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('removePhotosFromAlbum', error);
    }
  }

  async reorderAlbums(albumId, newPosition) {
    try {
      // Validate newPosition
      if (newPosition < 0) {
        throw new ValidationError('newPosition', 'Must be non-negative');
      }

      // Check if album exists
      const album = await this.getAlbum(albumId);
      if (!album) {
        throw new NotFoundError('Album', albumId);
      }

      const currentPosition = album.display_order;

      if (currentPosition === newPosition) {
        return; // No change needed
      }

      // Get all albums in current order
      const albums = await this.listAlbums('manual');

      // Remove the album being moved from its current position
      const targetAlbum = albums.find(a => a.id === albumId);
      const otherAlbums = albums.filter(a => a.id !== albumId);

      // Insert at new position
      otherAlbums.splice(newPosition, 0, targetAlbum);

      // Update all display_orders in a single transaction
      // First, set all to negative values to avoid UNIQUE constraint violations
      for (let i = 0; i < otherAlbums.length; i++) {
        Database.instance.run(
          'UPDATE albums SET display_order = ? WHERE id = ?',
          [-(i + 1), otherAlbums[i].id]
        );
      }

      // Then set to final positive values
      for (let i = 0; i < otherAlbums.length; i++) {
        Database.instance.run(
          'UPDATE albums SET display_order = ? WHERE id = ?',
          [i, otherAlbums[i].id]
        );
      }
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError('reorderAlbums', error);
    }
  }

  async getAlbumPhotos(albumId) {
    try {
      // Check if album exists
      const album = await this.getAlbum(albumId);
      if (!album) {
        throw new NotFoundError('Album', albumId);
      }

      const photos = Database.instance.getAll(
        `SELECT p.* 
         FROM photos p
         JOIN album_photos ap ON p.id = ap.photo_id
         WHERE ap.album_id = ?
         ORDER BY p.date_taken ASC NULLS LAST, p.file_path ASC`,
        [albumId]
      );

      return photos;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('getAlbumPhotos', error);
    }
  }
}
