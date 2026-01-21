# Quickstart Guide: Photo Album Organizer

**Purpose**: Get development environment running in <5 minutes  
**Prerequisites**: Node.js 18+, npm 9+, modern browser  
**Tech Stack**: Vite + Vanilla JS + SQLite (sql.js)

## 1. Project Setup (2 minutes)

```bash
# Create project directory
mkdir photo-album-organizer
cd photo-album-organizer

# Initialize npm project
npm init -y

# Install dependencies
npm install vite sql.js exifr

# Install dev dependencies
npm install -D vitest @vitest/ui playwright @playwright/test eslint prettier

# Create directory structure
mkdir -p src/{models,services,components,utils} tests/{unit,integration} public/assets
```

## 2. Configuration Files (1 minute)

### package.json

```json
{
  "name": "photo-album-organizer",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "lint": "eslint src",
    "format": "prettier --write src"
  },
  "dependencies": {
    "exifr": "^7.1.3",
    "sql.js": "^1.8.0",
    "vite": "^5.0.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "@vitest/ui": "^1.0.0",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0",
    "vitest": "^1.0.0"
  }
}
```

### vite.config.js

```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    headers: {
      // Enable SharedArrayBuffer for sql.js
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  optimizeDeps: {
    exclude: ['sql.js'], // Don't pre-bundle WASM
  },
});
```

### .eslintrc.js

```javascript
module.exports = {
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};
```

### .prettierrc

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

## 3. Create Minimal Working App (2 minutes)

### public/index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Photo Album Organizer</title>
</head>
<body>
  <div id="app">
    <header>
      <h1>Photo Albums</h1>
      <button id="create-album-btn">Create Album</button>
    </header>
    <main id="album-list"></main>
  </div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

### src/main.js

```javascript
import './style.css';
import { Database } from './models/Database.js';

// Initialize database
const db = await Database.init();

// Simple test
console.log('✅ Database initialized');
console.log('✅ Application ready');

document.querySelector('#create-album-btn').addEventListener('click', () => {
  alert('Album creation coming soon!');
});
```

### src/models/Database.js

```javascript
import initSqlJs from 'sql.js';

export class Database {
  static instance = null;
  static db = null;

  static async init() {
    if (Database.instance) return Database.instance;

    const SQL = await initSqlJs({
      locateFile: (file) => `https://sql.js.org/dist/${file}`,
    });

    Database.db = new SQL.Database();

    // Create schema
    Database.db.run(`
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
}
```

### src/style.css

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #f5f5f5;
  padding: 20px;
}

#app {
  max-width: 1200px;
  margin: 0 auto;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  margin-bottom: 20px;
}

button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  background: #0056b3;
}

#album-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}
```

## 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

Expected output:
- ✅ Page loads with "Photo Albums" header
- ✅ "Create Album" button visible
- ✅ Console shows "Database initialized" and "Application ready"

## 5. First Test (Optional)

### tests/unit/Database.test.js

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { Database } from '../../src/models/Database.js';

describe('Database', () => {
  beforeEach(async () => {
    // Reset database between tests
    Database.instance = null;
    Database.db = null;
    await Database.init();
  });

  it('initializes successfully', async () => {
    const db = await Database.init();
    expect(db).toBeInstanceOf(Database);
  });

  it('creates albums table', async () => {
    await Database.init();
    const result = Database.db.exec(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='albums'"
    );
    expect(result.length).toBe(1);
    expect(result[0].values[0][0]).toBe('albums');
  });
});
```

Run tests:
```bash
npm test
```

## 6. Next Steps

You now have a working skeleton. Continue development by:

1. **Implement AlbumService** (src/services/AlbumService.js)
2. **Create AlbumList component** (src/components/AlbumList.js)
3. **Add photo file picker** (File System Access API)
4. **Write tests first** (TDD - as per constitution)

See [data-model.md](data-model.md) for schema and [contracts/](contracts/) for service interfaces.

## Troubleshooting

### sql.js not loading

**Problem**: SharedArrayBuffer error in console  
**Solution**: Ensure vite.config.js has correct CORS headers

### Module not found

**Problem**: Import errors  
**Solution**: Check file extensions (.js) in imports, use relative paths

### Tests failing

**Problem**: Database not resetting between tests  
**Solution**: Use beforeEach to reset Database.instance and Database.db

## Development Workflow (TDD)

1. Write failing test in `tests/unit/`
2. Run `npm test` - verify test fails ❌
3. Implement minimal code to pass
4. Run `npm test` - verify test passes ✅
5. Refactor if needed
6. Repeat

## Performance Verification

After implementing features, verify performance targets:

```bash
# Run performance tests
npm test -- --run tests/integration/performance.spec.js
```

Expected results (per constitution):
- ✅ Album list load: <2s for 50 albums
- ✅ Thumbnail display: <1s for 100 photos
- ✅ Drag-and-drop feedback: <100ms

## Browser Compatibility Check

Test in:
- ✅ Chrome 90+ (full File System Access API support)
- ✅ Firefox 88+ (file input fallback)
- ✅ Safari 14+ (file input fallback)
- ✅ Edge 90+ (full File System Access API support)

## Summary

**Time to first render**: ~2 minutes  
**Time to first test passing**: ~5 minutes  
**Development server**: http://localhost:3000  
**Test UI**: http://localhost:51204 (run `npm run test:ui`)

You're ready to implement Photo Album Organizer! Follow TDD principles and reference the constitution for quality gates.
