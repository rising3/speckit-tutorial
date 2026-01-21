# Service Contracts: Album Service

**Service**: AlbumService  
**Purpose**: Manage album CRUD operations and album-photo associations  
**Module**: src/services/AlbumService.js

## Interface Definition

### createAlbum(name: string): Promise<Album>

**Description**: Create a new empty album

**Parameters**:
- `name` (string, required): Album display name, 1-100 characters

**Returns**: Promise<Album> - Created album object

**Example**:
```javascript
const album = await albumService.createAlbum("Vacation 2024");
// Returns: { id: 1, name: "Vacation 2024", display_date: null, display_order: 0, ... }
```

**Errors**:
- `ValidationError`: name empty or > 100 characters
- `DuplicateError`: album with same name already exists
- `DatabaseError`: SQLite operation failed

**Side Effects**:
- Inserts row in `albums` table
- Assigns next available `display_order`
- Sets `display_date` to NULL (empty album)

---

### listAlbums(sortBy: 'date' | 'manual' = 'date'): Promise<Album[]>

**Description**: Retrieve all albums with sort option

**Parameters**:
- `sortBy` (string, optional): Sort by 'date' (chronological) or 'manual' (display_order)

**Returns**: Promise<Album[]> - Array of album objects with photo_count

**Example**:
```javascript
const albums = await albumService.listAlbums('date');
// Returns: [
//   { id: 2, name: "Summer 2024", display_date: 1704067200, photo_count: 15, ... },
//   { id: 1, name: "Vacation 2024", display_date: null, photo_count: 0, ... }
// ]
```

**Errors**:
- `ValidationError`: invalid sortBy value
- `DatabaseError`: SQLite operation failed

**Side Effects**: None (read-only)

**Performance**: <10ms for 50 albums

---

### getAlbum(id: number): Promise<Album | null>

**Description**: Retrieve single album by ID with photo count

**Parameters**:
- `id` (number, required): Album ID

**Returns**: Promise<Album | null> - Album object or null if not found

**Example**:
```javascript
const album = await albumService.getAlbum(1);
// Returns: { id: 1, name: "Vacation 2024", display_date: null, photo_count: 0, ... }
```

**Errors**:
- `DatabaseError`: SQLite operation failed

**Side Effects**: None (read-only)

---

### updateAlbum(id: number, updates: Partial<Album>): Promise<Album>

**Description**: Update album properties (name only, display_date auto-calculated)

**Parameters**:
- `id` (number, required): Album ID
- `updates` (object, required): Object with fields to update
  - `name` (string, optional): New album name

**Returns**: Promise<Album> - Updated album object

**Example**:
```javascript
const album = await albumService.updateAlbum(1, { name: "Hawaii Trip" });
// Returns: { id: 1, name: "Hawaii Trip", display_date: null, ... }
```

**Errors**:
- `NotFoundError`: album with id doesn't exist
- `ValidationError`: invalid field values
- `DuplicateError`: name already exists
- `DatabaseError`: SQLite operation failed

**Side Effects**:
- Updates `albums` table row
- Triggers `updated_at` update

---

### deleteAlbum(id: number): Promise<void>

**Description**: Delete album and its photo associations

**Parameters**:
- `id` (number, required): Album ID

**Returns**: Promise<void>

**Example**:
```javascript
await albumService.deleteAlbum(1);
```

**Errors**:
- `NotFoundError`: album with id doesn't exist
- `DatabaseError`: SQLite operation failed

**Side Effects**:
- Deletes row from `albums` table
- CASCADE deletes associated rows in `album_photos` table
- Does NOT delete photos (photos can belong to multiple albums)

---

### addPhotosToAlbum(albumId: number, photoIds: number[]): Promise<void>

**Description**: Associate photos with album and update album display_date

**Parameters**:
- `albumId` (number, required): Album ID
- `photoIds` (number[], required): Array of photo IDs to add

**Returns**: Promise<void>

**Example**:
```javascript
await albumService.addPhotosToAlbum(1, [10, 11, 12]);
```

**Errors**:
- `NotFoundError`: album or photo doesn't exist
- `DuplicateError`: photo already in album (silently skipped)
- `DatabaseError`: SQLite operation failed

**Side Effects**:
- Inserts rows in `album_photos` table
- Updates `albums.display_date` to earliest photo date
- Triggers `albums.updated_at` update

**Performance**: <500ms for 100 photos (batch insert)

---

### removePhotosFromAlbum(albumId: number, photoIds: number[]): Promise<void>

**Description**: Remove photo associations from album and update album display_date

**Parameters**:
- `albumId` (number, required): Album ID
- `photoIds` (number[], required): Array of photo IDs to remove

**Returns**: Promise<void>

**Example**:
```javascript
await albumService.removePhotosFromAlbum(1, [10, 11]);
```

**Errors**:
- `NotFoundError`: album doesn't exist (photo not found is silent)
- `DatabaseError`: SQLite operation failed

**Side Effects**:
- Deletes rows from `album_photos` table
- Updates `albums.display_date` if earliest photo removed
- Triggers `albums.updated_at` update

---

### reorderAlbums(albumId: number, newPosition: number): Promise<void>

**Description**: Change manual display order of album

**Parameters**:
- `albumId` (number, required): Album ID to reorder
- `newPosition` (number, required): New display_order position (0-indexed)

**Returns**: Promise<void>

**Example**:
```javascript
// Move album 3 to position 0 (first)
await albumService.reorderAlbums(3, 0);
```

**Errors**:
- `NotFoundError`: album doesn't exist
- `ValidationError`: newPosition < 0 or > album count
- `DatabaseError`: SQLite operation failed

**Side Effects**:
- Updates `display_order` for affected albums (shift others)
- Triggers `albums.updated_at` for moved album

**Algorithm**:
1. Get current position
2. If moving up, decrement orders between new and old position
3. If moving down, increment orders between old and new position
4. Set target album's order to newPosition

---

### getAlbumPhotos(albumId: number): Promise<Photo[]>

**Description**: Retrieve all photos in album sorted by date_taken

**Parameters**:
- `albumId` (number, required): Album ID

**Returns**: Promise<Photo[]> - Array of photo objects

**Example**:
```javascript
const photos = await albumService.getAlbumPhotos(1);
// Returns: [
//   { id: 10, file_path: "/path/img1.jpg", date_taken: 1704067200, ... },
//   { id: 11, file_path: "/path/img2.jpg", date_taken: 1704153600, ... }
// ]
```

**Errors**:
- `NotFoundError`: album doesn't exist
- `DatabaseError`: SQLite operation failed

**Side Effects**: None (read-only)

**Performance**: <50ms for 500 photos

---

## Type Definitions

```typescript
interface Album {
  id: number;
  name: string;
  display_date: number | null; // Unix timestamp or null for empty
  display_order: number;
  created_at: number; // Unix timestamp
  updated_at: number; // Unix timestamp
  photo_count?: number; // Included in list queries
}

interface Photo {
  id: number;
  file_path: string;
  file_name: string;
  date_taken: number | null;
  width: number | null;
  height: number | null;
  file_size: number | null;
  created_at: number;
}

type SortMode = 'date' | 'manual';
```

---

## Error Classes

```javascript
class ValidationError extends Error {
  constructor(field, message) {
    super(`Validation failed for ${field}: ${message}`);
    this.name = 'ValidationError';
    this.field = field;
  }
}

class NotFoundError extends Error {
  constructor(entity, id) {
    super(`${entity} with id ${id} not found`);
    this.name = 'NotFoundError';
    this.entity = entity;
    this.id = id;
  }
}

class DuplicateError extends Error {
  constructor(entity, field, value) {
    super(`${entity} with ${field}='${value}' already exists`);
    this.name = 'DuplicateError';
    this.entity = entity;
    this.field = field;
  }
}

class DatabaseError extends Error {
  constructor(operation, originalError) {
    super(`Database operation '${operation}' failed: ${originalError.message}`);
    this.name = 'DatabaseError';
    this.operation = operation;
    this.originalError = originalError;
  }
}
```
