export class Database {
  static instance = null;
  static db = null;

  static async loadSqlJs() {
    // Load sql.js from local public folder
    return new Promise((resolve, reject) => {
      if (window.initSqlJs) {
        resolve(window.initSqlJs);
        return;
      }

      const script = document.createElement('script');
      script.src = '/sql-wasm.js';
      script.onload = () => {
        if (window.initSqlJs) {
          resolve(window.initSqlJs);
        } else {
          reject(new Error('initSqlJs not found on window'));
        }
      };
      script.onerror = () =>
        reject(new Error('Failed to load sql.js from /sql-wasm.js'));
      document.head.appendChild(script);
    });
  }

  static async init() {
    if (Database.instance) return Database.instance;

    try {
      // Load sql.js from local files
      const initSqlJs = await this.loadSqlJs();

      const SQL = await initSqlJs({
        locateFile: file => `/${file}`,
      });

      Database.db = new SQL.Database();
      Database.instance = Database.db;
      console.log('✅ SQL.js Database initialized');
    } catch (error) {
      console.error('Failed to initialize SQL.js:', error);
      throw error;
    }

    // Create schema
    Database.db.run(`
      -- Albums table
      CREATE TABLE albums (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        display_date INTEGER,
        display_order INTEGER NOT NULL UNIQUE,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      );

      CREATE INDEX idx_albums_display_date ON albums(display_date);
      CREATE INDEX idx_albums_display_order ON albums(display_order);

      CREATE TRIGGER albums_updated_at
      AFTER UPDATE ON albums
      BEGIN
        UPDATE albums SET updated_at = unixepoch() WHERE id = NEW.id;
      END;

      -- Photos table
      CREATE TABLE photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_path TEXT NOT NULL UNIQUE,
        file_name TEXT NOT NULL,
        date_taken INTEGER,
        width INTEGER,
        height INTEGER,
        file_size INTEGER,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      );

      CREATE INDEX idx_photos_date_taken ON photos(date_taken);
      CREATE INDEX idx_photos_file_path ON photos(file_path);

      -- Album-Photo join table
      CREATE TABLE album_photos (
        album_id INTEGER NOT NULL,
        photo_id INTEGER NOT NULL,
        added_at INTEGER NOT NULL DEFAULT (unixepoch()),
        PRIMARY KEY (album_id, photo_id),
        FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE,
        FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE
      );

      CREATE INDEX idx_album_photos_album ON album_photos(album_id);
      CREATE INDEX idx_album_photos_photo ON album_photos(photo_id);

      -- User preferences table
      CREATE TABLE preferences (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      -- Initial preferences
      INSERT INTO preferences (key, value) VALUES
        ('sort_mode', 'date'),
        ('theme', 'light'),
        ('thumbnail_quality', '0.8');
    `);

    Database.instance = new Database();
    return Database.instance;
  }

  query(sql, params = []) {
    return Database.db.exec(sql, params);
  }

  run(sql, params = []) {
    return Database.db.run(sql, params);
  }

  prepare(sql) {
    return Database.db.prepare(sql);
  }

  getOne(sql, params = []) {
    const result = Database.db.exec(sql, params);
    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }
    const columns = result[0].columns;
    const values = result[0].values[0];
    const row = {};
    columns.forEach((col, idx) => {
      row[col] = values[idx];
    });
    return row;
  }

  getAll(sql, params = []) {
    const result = Database.db.exec(sql, params);
    if (result.length === 0) {
      return [];
    }
    const columns = result[0].columns;
    return result[0].values.map(values => {
      const row = {};
      columns.forEach((col, idx) => {
        row[col] = values[idx];
      });
      return row;
    });
  }
}
