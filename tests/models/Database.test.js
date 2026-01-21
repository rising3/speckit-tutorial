import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Database } from '../../src/models/Database.js';

describe('Database', () => {
  beforeEach(() => {
    Database.instance = null;
    Database.db = null;
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup
    if (global.window && global.window.initSqlJs) {
      delete global.window.initSqlJs;
    }
  });

  describe('loadSqlJs', () => {
    it('should load sql.js script from local file', async () => {
      const mockInitSqlJs = vi.fn();

      // Mock window and document
      global.window = {};
      global.document = {
        createElement: vi.fn(() => ({
          src: '',
          onload: null,
          onerror: null,
        })),
        head: {
          appendChild: vi.fn(script => {
            // Simulate successful script load
            global.window.initSqlJs = mockInitSqlJs;
            if (script.onload) script.onload();
          }),
        },
      };

      const initFn = await Database.loadSqlJs();
      expect(initFn).toBe(mockInitSqlJs);
    });

    it('should return existing initSqlJs if already loaded', async () => {
      const mockInitSqlJs = vi.fn();
      global.window = { initSqlJs: mockInitSqlJs };

      const initFn = await Database.loadSqlJs();
      expect(initFn).toBe(mockInitSqlJs);
    });

    it('should reject if script fails to load', async () => {
      global.document = {
        createElement: vi.fn(() => ({
          src: '',
          onload: null,
          onerror: null,
        })),
        head: {
          appendChild: vi.fn(script => {
            // Simulate script load error
            if (script.onerror) script.onerror();
          }),
        },
      };

      await expect(Database.loadSqlJs()).rejects.toThrow(
        'Failed to load sql.js from /sql-wasm.js'
      );
    });

    it('should reject if initSqlJs not found after load', async () => {
      global.document = {
        createElement: vi.fn(() => ({
          src: '',
          onload: null,
          onerror: null,
        })),
        head: {
          appendChild: vi.fn(script => {
            // Simulate script load without initSqlJs
            global.window = {};
            if (script.onload) script.onload();
          }),
        },
      };

      await expect(Database.loadSqlJs()).rejects.toThrow(
        'initSqlJs not found on window'
      );
    });
  });

  describe('init', () => {
    it('should return existing instance if already initialized', async () => {
      const mockInstance = { test: 'instance' };
      Database.instance = mockInstance;

      const result = await Database.init();
      expect(result).toBe(mockInstance);
    });

    it('should initialize SQL.js and create database', async () => {
      const mockDB = {
        run: vi.fn(),
      };

      class MockDatabase {
        constructor() {
          return mockDB;
        }
      }

      const mockInitSqlJs = vi.fn(async () => ({ Database: MockDatabase }));
      global.window = {};
      global.window = {};
      global.document = {
        createElement: vi.fn(() => ({
          src: '',
          onload: null,
          onerror: null,
        })),
        head: {
          appendChild: vi.fn(script => {
            global.window.initSqlJs = mockInitSqlJs;
            if (script.onload) script.onload();
          }),
        },
      };

      await Database.init();

      expect(mockInitSqlJs).toHaveBeenCalledWith({
        locateFile: expect.any(Function),
      });
      expect(Database.db).toBe(mockDB);
      expect(Database.instance).toBeDefined();
    });

    it('should create database schema', async () => {
      const mockDB = {
        run: vi.fn(),
      };

      class MockDatabase {
        constructor() {
          return mockDB;
        }
      }

      const mockInitSqlJs = vi.fn(async () => ({ Database: MockDatabase }));

      global.document = {
        createElement: vi.fn(() => ({
          src: '',
          onload: null,
          onerror: null,
        })),
        head: {
          appendChild: vi.fn(script => {
            global.window = { initSqlJs: mockInitSqlJs };
            if (script.onload) script.onload();
          }),
        },
      };

      await Database.init();

      expect(mockDB.run).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE albums')
      );
      expect(mockDB.run).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE photos')
      );
      expect(mockDB.run).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE album_photos')
      );
    });

    it('should handle initialization errors', async () => {
      global.document = {
        createElement: vi.fn(() => ({
          src: '',
          onload: null,
          onerror: null,
        })),
        head: {
          appendChild: vi.fn(script => {
            if (script.onerror) script.onerror();
          }),
        },
      };

      await expect(Database.init()).rejects.toThrow();
    });
  });

  describe('run', () => {
    it('should execute SQL statement', () => {
      const mockRun = vi.fn();
      Database.db = { run: mockRun };

      Database.instance = Database.db;
      const db = new Database();
      db.run('INSERT INTO albums VALUES (?, ?)', [1, 'Test']);

      expect(mockRun).toHaveBeenCalledWith('INSERT INTO albums VALUES (?, ?)', [
        1,
        'Test',
      ]);
    });
  });

  describe('getOne', () => {
    it('should return single row as object', () => {
      const mockExec = vi.fn(() => [
        {
          columns: ['id', 'name'],
          values: [[1, 'Test Album']],
        },
      ]);

      Database.db = { exec: mockExec };
      Database.instance = Database.db;

      const db = new Database();
      const result = db.getOne('SELECT * FROM albums WHERE id = ?', [1]);

      expect(result).toEqual({ id: 1, name: 'Test Album' });
    });

    it('should return null if no results', () => {
      const mockExec = vi.fn(() => []);
      Database.db = { exec: mockExec };
      Database.instance = Database.db;

      const db = new Database();
      const result = db.getOne('SELECT * FROM albums WHERE id = ?', [999]);

      expect(result).toBeNull();
    });
  });

  describe('getAll', () => {
    it('should return all rows as array of objects', () => {
      const mockExec = vi.fn(() => [
        {
          columns: ['id', 'name'],
          values: [
            [1, 'Album 1'],
            [2, 'Album 2'],
          ],
        },
      ]);

      Database.db = { exec: mockExec };
      Database.instance = Database.db;

      const db = new Database();
      const result = db.getAll('SELECT * FROM albums');

      expect(result).toEqual([
        { id: 1, name: 'Album 1' },
        { id: 2, name: 'Album 2' },
      ]);
    });

    it('should return empty array if no results', () => {
      const mockExec = vi.fn(() => []);
      Database.db = { exec: mockExec };
      Database.instance = Database.db;

      const db = new Database();
      const result = db.getAll('SELECT * FROM albums WHERE id > 1000');

      expect(result).toEqual([]);
    });
  });
});
