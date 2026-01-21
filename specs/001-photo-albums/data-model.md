# Data Model: Photo Album Organizer

**Phase**: 1 - Design & Contracts  
**Date**: 2026-01-21  
**Purpose**: Define entities, relationships, validation rules, and state transitions

## Entities

### Album

**Description**: Represents a collection of photos organized by date

**Fields**:
| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| id | INTEGER | Yes (PK) | Unique identifier | Auto-increment |
| name | TEXT | Yes | Album display name | 1-100 characters, not empty |
| display_date | INTEGER | No | Unix timestamp of earliest photo | NULL for empty albums |
| display_order | INTEGER | Yes | Manual ordering position | >= 0, unique |
| created_at | INTEGER | Yes | Unix timestamp of creation | Auto-generated |
| updated_at | INTEGER | Yes | Unix timestamp of last modification | Auto-updated |

**Relationships**:
- Has many Photos (many-to-many through album_photos join table)

**Validation Rules**:
- Album name must be unique per user (though single-user app, prepares for multi-user)
- display_date automatically updated when photos added/removed
- display_order must be unique; auto-assigned to max+1 on creation
- Cannot delete album if it would orphan photos referenced nowhere else (soft check, not enforced)

**State Transitions**:
```
Created (empty) → Photos Added → Has Date
              ↓                      ↓
         Display on page ← Manually Reordered
```

**Business Rules**:
- Albums are never nested (enforced at application layer)
- Empty albums are valid and displayed with placeholder
- Album date is always the earliest photo's date_taken
- Manual reordering overrides chronological date sorting

---

### Photo

**Description**: Represents an individual photo file with metadata

**Fields**:
| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| id | INTEGER | Yes (PK) | Unique identifier | Auto-increment |
| file_path | TEXT | Yes (UNIQUE) | Absolute path to photo file | Must be valid file path, unique |
| file_name | TEXT | Yes | Display name extracted from path | Not empty |
| date_taken | INTEGER | No | Unix timestamp from EXIF or file date | NULL if unavailable |
| width | INTEGER | No | Photo width in pixels | > 0 if present |
| height | INTEGER | No | Photo height in pixels | > 0 if present |
| file_size | INTEGER | No | File size in bytes | > 0 if present |
| created_at | INTEGER | Yes | Unix timestamp when added to system | Auto-generated |

**Relationships**:
- Belongs to many Albums (many-to-many through album_photos join table)

**Validation Rules**:
- file_path must be unique (same photo can't be added twice)
- date_taken defaults to file modified date if EXIF unavailable
- File existence validated before adding (graceful handling if missing later)

**State Transitions**:
```
File Selected → Metadata Extracted → Added to Album
                                           ↓
                                    Thumbnail Generated → Cached
```

**Business Rules**:
- Photos remain in original file system location (no copying)
- Photos can belong to multiple albums simultaneously (reference model)
- Adding same photo to same album twice is prevented
- Missing photo files show placeholder instead of error

---

### AlbumPhoto (Join Table)

**Description**: Many-to-many relationship between Albums and Photos

**Fields**:
| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| album_id | INTEGER | Yes (PK, FK) | Foreign key to albums.id | Must exist in albums |
| photo_id | INTEGER | Yes (PK, FK) | Foreign key to photos.id | Must exist in photos |
| added_at | INTEGER | Yes | Unix timestamp when photo added to album | Auto-generated |

**Composite Primary Key**: (album_id, photo_id)

**Relationships**:
- Belongs to one Album
- Belongs to one Photo

**Validation Rules**:
- album_id and photo_id pair must be unique (prevent duplicate additions)
- CASCADE DELETE on album deletion (if album deleted, remove associations)
- CASCADE DELETE on photo deletion (if photo deleted, remove associations)

**Business Rules**:
- added_at used for displaying "recently added" photos if needed
- No ordering within album (photos sorted by date_taken at display time)

---

### ThumbnailCache (IndexedDB)

**Description**: Client-side cache for generated photo thumbnails

**Fields**:
| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| path | TEXT | Yes (PK) | File path (matches Photo.file_path) | Unique |
| blob | BLOB | Yes | Thumbnail image data (JPEG) | 200x200px, <200KB |
| timestamp | INTEGER | Yes | Unix timestamp of generation | Auto-generated |
| access_count | INTEGER | Yes | LRU tracking | Default 0, incremented on access |

**Validation Rules**:
- Maximum cache size: 500MB
- LRU eviction when size exceeded
- Stale thumbnails (>30 days since access) eligible for eviction

**Business Rules**:
- Thumbnail regenerated if original photo modified (detect via file modified date)
- Cache cleared manually via settings
- Not stored in SQLite (too large, IndexedDB optimized for blobs)

---

## Database Schema (SQLite)

```sql
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
  ('sort_mode', 'date'), -- 'date' or 'manual'
  ('theme', 'light'),
  ('thumbnail_quality', '0.8');
```

---

## Validation Rules Summary

### Album Validation
- ✅ Name: 1-100 characters, not empty, unique
- ✅ display_order: Non-negative integer, unique
- ✅ display_date: NULL or valid Unix timestamp

### Photo Validation
- ✅ file_path: Valid path string, unique, file must exist on add
- ✅ file_name: Not empty
- ✅ date_taken: NULL or valid Unix timestamp
- ✅ Dimensions: NULL or positive integers

### AlbumPhoto Validation
- ✅ album_id: Must reference existing album
- ✅ photo_id: Must reference existing photo
- ✅ Uniqueness: (album_id, photo_id) pair must be unique

---

## Calculated Fields

### Album.display_date
**Calculation**: Minimum date_taken from associated photos
**Update Trigger**: When photos added/removed from album
**Query**:
```sql
SELECT MIN(p.date_taken)
FROM photos p
JOIN album_photos ap ON p.id = ap.photo_id
WHERE ap.album_id = ?
```

### Album.photo_count (runtime)
**Calculation**: Count of associated photos
**Not stored**: Calculated on-demand
**Query**:
```sql
SELECT COUNT(*)
FROM album_photos
WHERE album_id = ?
```

---

## State Machine: Album Lifecycle

```
┌─────────────┐
│   Created   │ (empty album)
│ display_date│
│   = NULL    │
└──────┬──────┘
       │ User adds photos
       ▼
┌─────────────┐
│  Populated  │
│ display_date│
│ = earliest  │
│   photo     │
└──────┬──────┘
       │ User reorders manually
       ▼
┌─────────────┐
│  Reordered  │
│display_order│
│  customized │
└──────┬──────┘
       │ User removes all photos
       ▼
┌─────────────┐
│   Empty     │
│ display_date│
│   = NULL    │
└─────────────┘
```

---

## Indexing Strategy

**Performance Target**: <10ms for album list queries, <50ms for photo list queries

**Indexes**:
1. `albums.display_date` - For chronological sorting
2. `albums.display_order` - For manual sorting
3. `photos.date_taken` - For sorting photos within album
4. `photos.file_path` - For fast duplicate detection
5. `album_photos.album_id` - For photo lookup by album
6. `album_photos.photo_id` - For album lookup by photo

**Query Patterns**:
- Get all albums sorted: Uses `idx_albums_display_order` or `idx_albums_display_date`
- Get photos for album: Uses `idx_album_photos_album`
- Check if photo in album: Uses composite PK on (album_id, photo_id)
- Find albums containing photo: Uses `idx_album_photos_photo`

---

## Data Integrity Constraints

1. **Referential Integrity**: Foreign keys with CASCADE DELETE
2. **Uniqueness**: album.name, album.display_order, photo.file_path, (album_id, photo_id) pair
3. **Non-null**: Required fields enforced at DB level
4. **Positive Values**: Width, height, file_size must be > 0 (enforced at app layer)
5. **Path Validation**: file_path must be valid and exist (checked before insert)

---

## Migration Strategy

**Version 1** (Initial Schema):
- Create tables as specified above
- Seed preferences with defaults
- No data migration (new installation)

**Future Migrations** (if needed):
- Add columns with DEFAULT values for backward compatibility
- Use ALTER TABLE for schema changes
- Maintain migration version in preferences table
