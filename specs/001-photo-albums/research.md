# Research: Photo Album Organizer

**Phase**: 0 - Outline & Research  
**Date**: 2026-01-21  
**Purpose**: Resolve all technical unknowns from Constitution Check before design phase

## Research Items

### 1. File System Access API Browser Compatibility

**Decision**: Use File System Access API with fallback to traditional file input

**Rationale**:
- File System Access API provides native file picker with multi-select and maintains file handles
- Supported in Chrome 86+, Edge 86+, Opera 72+
- Safari and Firefox support traditional `<input type="file" multiple>` as fallback
- Progressive enhancement strategy maintains core functionality across all browsers

**Alternatives Considered**:
- Native file input only: Lacks persistent file handles, requires re-selection
- Electron/Tauri wrapper: Adds complexity, defeats "minimal dependencies" goal
- IndexedDB file storage: Copies files (violates "photos stay in place" requirement)

**Implementation Approach**:
```javascript
// Feature detection pattern
if ('showOpenFilePicker' in window) {
  // Use File System Access API
  const handles = await window.showOpenFilePicker({ multiple: true });
} else {
  // Fallback to traditional file input
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = true;
}
```

**Browser Compatibility Table**:
| Browser | File System Access API | Fallback Support |
|---------|----------------------|------------------|
| Chrome 86+ | ✅ Full | N/A |
| Edge 86+ | ✅ Full | N/A |
| Firefox | ❌ | ✅ File Input |
| Safari 14+ | ❌ | ✅ File Input |
| Opera 72+ | ✅ Full | N/A |

---

### 2. Vanilla JS Module Organization in Vite

**Decision**: Use ES6 modules with Vite's native import/export, organized by responsibility

**Rationale**:
- Vite provides zero-config ES module support with hot module replacement
- No build configuration needed for ES6 imports
- Tree-shaking automatically removes unused code
- Native browser module support eliminates need for bundler complexity

**Module Pattern**:
```javascript
// src/models/Album.js
export class Album {
  constructor(id, name, date) { ... }
  addPhoto(photoId) { ... }
}

// src/services/AlbumService.js
import { Album } from '../models/Album.js';
export class AlbumService {
  async createAlbum(name) { ... }
}

// src/main.js
import { AlbumService } from './services/AlbumService.js';
```

**Best Practices**:
- One class/function per file
- Named exports for better tree-shaking
- Barrel exports (index.js) only when grouping related utilities
- Avoid circular dependencies (models shouldn't import services)

**Alternatives Considered**:
- IIFE pattern: Old-school, doesn't work with tree-shaking
- Class-based singletons: Harder to test, global state issues
- Framework (React/Vue): Violates "minimal dependencies" requirement

---

### 3. Testing File System API Interactions

**Decision**: Use Playwright for E2E tests with real file interactions; mock File System API in unit tests

**Rationale**:
- Playwright can interact with native file dialogs and validate actual file operations
- Unit tests mock File System API to test business logic without browser dependencies
- Vitest provides excellent mocking capabilities for API stubs

**Testing Strategy**:

**Unit Tests** (Vitest):
```javascript
// Mock File System Access API
global.showOpenFilePicker = vi.fn().mockResolvedValue([
  { getFile: () => Promise.resolve(new File([''], 'test.jpg')) }
]);

// Test file selection logic
test('FileService handles multiple file selection', async () => {
  const files = await fileService.selectPhotos();
  expect(files).toHaveLength(1);
});
```

**Integration Tests** (Playwright):
```javascript
// Real file dialog interaction
test('User can add photos to album', async ({ page }) => {
  await page.click('button:text("Add Photos")');
  // Playwright handles file chooser
  const fileChooser = await page.waitForEvent('filechooser');
  await fileChooser.setFiles(['test-photos/img1.jpg', 'test-photos/img2.jpg']);
  await expect(page.locator('.photo-tile')).toHaveCount(2);
});
```

**Test Fixtures**:
- Create `tests/fixtures/` with sample photos (various formats, sizes, EXIF data)
- Use 5-10 small test images (<50KB each) to keep tests fast

**Alternatives Considered**:
- Cypress: Weaker file upload support compared to Playwright
- Jest + jsdom: Cannot test real File System API interactions
- Manual testing only: Insufficient for TDD requirement

---

### 4. Visual Regression Testing for Tile Grids

**Decision**: Use Playwright's screenshot comparison for critical layouts; skip for minor variations

**Rationale**:
- Constitution requires consistent UX, but not pixel-perfect matching
- Focus on structural layout (tile grid flow, album card arrangement)
- Avoid flaky tests from minor rendering differences

**Testing Approach**:
```javascript
// Snapshot critical layouts only
test('Album list layout renders consistently', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('.album-card');
  await expect(page).toHaveScreenshot('album-list-layout.png', {
    mask: [page.locator('.album-date')], // Ignore dynamic dates
    maxDiffPixels: 100
  });
});
```

**What to test**:
- ✅ Album grid layout (3-column grid, responsive breakpoints)
- ✅ Empty state placeholder rendering
- ✅ Photo tile grid arrangement
- ❌ Individual pixel colors (browser rendering variations)
- ❌ Text rendering (font hinting differences)

**Alternatives Considered**:
- Percy/Chromatic: External service dependency, costs money
- Canvas pixel comparison: Too brittle, high maintenance
- No visual testing: Insufficient for UX consistency gate

---

### 5. Native Drag-and-Drop API Best Practices

**Decision**: Use HTML5 Drag and Drop API with touch event polyfill for mobile devices

**Rationale**:
- Native DnD API is well-supported (IE11+) and requires no libraries
- Touch devices need separate event handlers (touchstart/touchmove/touchend)
- Small polyfill (drag-drop-touch ~2KB) bridges gap without major dependency

**Implementation Pattern**:
```javascript
// Album card drag handlers
element.draggable = true;
element.addEventListener('dragstart', (e) => {
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('albumId', albumId);
  element.classList.add('dragging');
});

element.addEventListener('dragover', (e) => {
  e.preventDefault(); // Allow drop
  e.dataTransfer.dropEffect = 'move';
});

element.addEventListener('drop', (e) => {
  e.preventDefault();
  const draggedAlbumId = e.dataTransfer.getData('albumId');
  albumService.reorderAlbum(draggedAlbumId, dropPosition);
});

// Add touch support with small polyfill
import 'drag-drop-touch'; // For mobile compatibility
```

**Touch Device Strategy**:
- Include drag-drop-touch polyfill (https://github.com/Bernardo-Castilho/dragdroptouch)
- Lightweight (~2KB minified)
- Translates touch events to drag events
- No API changes required

**Visual Feedback**:
- CSS class `dragging` reduces opacity
- Drop zones show border highlight on `dragover`
- Cursor changes to `move` icon during drag

**Alternatives Considered**:
- SortableJS library: 45KB, violates minimal dependencies
- Custom touch implementation: 200+ lines, complex gesture handling
- Mouse-only drag: Excludes tablet users, poor UX

---

### 6. Thumbnail Generation and Caching Strategy

**Decision**: Use Canvas API for thumbnail generation with IndexedDB caching; lazy load on scroll

**Rationale**:
- Canvas API generates thumbnails client-side without server
- IndexedDB stores generated thumbnails persistently
- Lazy loading prevents memory issues with 500-photo albums
- Intersection Observer API handles efficient lazy loading

**Thumbnail Pipeline**:
1. **Generate**: Canvas API resizes image to 200x200px
2. **Cache**: Store blob in IndexedDB with photo file path as key
3. **Retrieve**: Check IndexedDB before regenerating
4. **Display**: Lazy load with Intersection Observer

**Implementation**:
```javascript
// Thumbnail generation
async function generateThumbnail(file) {
  const img = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(200, 200);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, 200, 200);
  return canvas.convertToBlob({ type: 'image/jpeg', quality: 0.8 });
}

// IndexedDB caching
const CACHE_NAME = 'photo-thumbnails';
async function cacheThumbnail(filePath, blob) {
  const db = await openDB(CACHE_NAME);
  await db.put('thumbnails', { path: filePath, blob, timestamp: Date.now() });
}

// Lazy loading
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadThumbnail(entry.target);
      observer.unobserve(entry.target);
    }
  });
});
```

**Cache Management**:
- Maximum cache size: 500MB (2500 thumbnails × 200KB each)
- LRU eviction when limit reached
- Clear cache option in settings

**Performance Targets**:
- Thumbnail generation: ~50ms per photo
- Cached retrieval: <10ms
- Batch generate first 50 on album open, lazy load rest

**Alternatives Considered**:
- Server-side thumbnails: No server in local-first architecture
- Store original images in IndexedDB: Wastes storage, violates "photos stay in place"
- No caching: Regenerate on every view (too slow)

---

### 7. Virtual Scrolling Implementation

**Decision**: Use Intersection Observer for lazy loading; defer true virtual scrolling to Phase 2 if needed

**Rationale**:
- Spec requires handling 500 photos per album
- Lazy loading with Intersection Observer handles 500 photos adequately
- True virtual scrolling (render only visible items) adds significant complexity
- Measure first: if 500 photos cause performance issues, implement virtual scrolling

**Lazy Loading Strategy**:
```javascript
// Render all photo tiles but don't load images
photoGrid.innerHTML = photos.map(p => `
  <div class="photo-tile" data-photo-id="${p.id}">
    <img data-src="${p.path}" alt="Loading...">
  </div>
`).join('');

// Load images as they enter viewport
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target.querySelector('img');
      img.src = img.dataset.src;
      observer.unobserve(entry.target);
    }
  });
}, { rootMargin: '200px' }); // Preload before visible

document.querySelectorAll('.photo-tile').forEach(tile => observer.observe(tile));
```

**When to upgrade to virtual scrolling**:
- If scrolling performance drops below 60fps with 500 tiles
- If memory usage exceeds 100MB with loaded thumbnails
- If user testing shows lag during scroll

**Virtual Scrolling Libraries** (if needed):
- react-window: 31KB, but requires React (violates minimal deps)
- Custom implementation: ~100 lines, maintains vanilla approach

**Alternatives Considered**:
- Implement virtual scrolling immediately: Premature optimization
- Pagination: Poor UX for photo browsing (constitution requires smooth scrolling)
- No optimization: Likely acceptable for 500 photos, measure first

---

### 8. SQLite Query Optimization

**Decision**: Use better-sqlite3 with indexed queries; denormalize album dates for fast sorting

**Rationale**:
- better-sqlite3 is synchronous, faster than sql.js for local operations
- Runs in Node environment (Vite dev server) without WebAssembly overhead
- Indexes on frequently queried columns (album_id, photo_date)
- Denormalize album.display_date to avoid JOIN on every album list query

**Database Schema**:
```sql
CREATE TABLE albums (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  display_date INTEGER, -- Earliest photo date, for fast sorting
  display_order INTEGER, -- Manual ordering position
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);
CREATE INDEX idx_albums_display_date ON albums(display_date);
CREATE INDEX idx_albums_display_order ON albums(display_order);

CREATE TABLE photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  file_path TEXT UNIQUE NOT NULL,
  file_name TEXT NOT NULL,
  date_taken INTEGER, -- EXIF date or file modified date
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  created_at INTEGER DEFAULT (unixepoch())
);
CREATE INDEX idx_photos_date_taken ON photos(date_taken);
CREATE INDEX idx_photos_file_path ON photos(file_path);

CREATE TABLE album_photos (
  album_id INTEGER NOT NULL,
  photo_id INTEGER NOT NULL,
  added_at INTEGER DEFAULT (unixepoch()),
  PRIMARY KEY (album_id, photo_id),
  FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE,
  FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE
);
CREATE INDEX idx_album_photos_album ON album_photos(album_id);
CREATE INDEX idx_album_photos_photo ON album_photos(photo_id);
```

**Query Optimization Patterns**:
```javascript
// Fast album list query (no JOINs)
const albums = db.prepare(`
  SELECT id, name, display_date, display_order
  FROM albums
  ORDER BY display_order ASC, display_date DESC
`).all();

// Photo count with precomputed count
const albumWithCount = db.prepare(`
  SELECT a.*, COUNT(ap.photo_id) as photo_count
  FROM albums a
  LEFT JOIN album_photos ap ON a.id = ap.album_id
  WHERE a.id = ?
  GROUP BY a.id
`).get(albumId);

// Update album display_date when photos added
db.prepare(`
  UPDATE albums
  SET display_date = (
    SELECT MIN(p.date_taken)
    FROM photos p
    JOIN album_photos ap ON p.id = ap.photo_id
    WHERE ap.album_id = ?
  )
  WHERE id = ?
`).run(albumId, albumId);
```

**Performance Targets**:
- Album list query: <10ms for 50 albums
- Photo list for album: <50ms for 500 photos
- Album creation: <20ms
- Bulk photo insert: <500ms for 100 photos

**Alternatives Considered**:
- sql.js: WASM-based, slower, but runs in browser (chosen initially)
- LocalStorage/JSON: No relational queries, slow for large datasets
- IndexedDB: Key-value store, complex queries difficult

**Revision**: For browser deployment, use sql.js (WASM) instead of better-sqlite3 (Node-only). Accept slight performance trade-off for browser compatibility.

---

## Summary

All 8 research items have been resolved. Key decisions:

1. **File System Access API** with traditional input fallback
2. **ES6 modules** in Vite's standard structure
3. **Playwright** for E2E, **Vitest** for unit tests with mocked File System API
4. **Playwright screenshots** for layout regression (not pixel-perfect)
5. **HTML5 Drag and Drop** + drag-drop-touch polyfill
6. **Canvas API** thumbnails cached in **IndexedDB**
7. **Lazy loading** via Intersection Observer (virtual scrolling if needed)
8. **sql.js** (WASM) with indexed schema and denormalized dates

**Constitution Re-Check Ready**: All "NEEDS RESEARCH" items resolved. Proceeding to Phase 1 (Design).
