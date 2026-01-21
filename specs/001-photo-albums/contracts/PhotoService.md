# Service Contracts: Photo Service

**Service**: PhotoService  
**Purpose**: Manage photo metadata extraction, storage, and retrieval  
**Module**: src/services/PhotoService.js

## Interface Definition

### addPhoto(file: File): Promise<Photo>

**Description**: Extract metadata from photo file and add to database

**Parameters**:
- `file` (File, required): Browser File object from file picker

**Returns**: Promise<Photo> - Created photo object

**Example**:
```javascript
const photo = await photoService.addPhoto(fileObject);
// Returns: { 
//   id: 10, 
//   file_path: "/path/to/image.jpg",
//   file_name: "image.jpg",
//   date_taken: 1704067200,
//   width: 4032,
//   height: 3024,
//   file_size: 2458624,
//   created_at: 1704153600
// }
```

**Errors**:
- `ValidationError`: file is not an image or missing
- `DuplicateError`: photo with same file_path already exists (returns existing)
- `DatabaseError`: SQLite operation failed

**Side Effects**:
- Inserts row in `photos` table
- Extracts EXIF data (date_taken, dimensions)
- Falls back to file modified date if no EXIF date

**Performance**: ~50ms per photo (EXIF extraction is sync)

---

### addPhotos(files: File[]): Promise<Photo[]>

**Description**: Batch add multiple photos

**Parameters**:
- `files` (File[], required): Array of File objects

**Returns**: Promise<Photo[]> - Array of created/existing photo objects

**Example**:
```javascript
const photos = await photoService.addPhotos([file1, file2, file3]);
// Returns array of 3 photo objects
```

**Errors**:
- `ValidationError`: one or more files invalid (partial success possible)
- `DatabaseError`: SQLite operation failed

**Side Effects**:
- Bulk insert into `photos` table (transaction)
- Skips duplicates (returns existing photo)

**Performance**: <500ms for 100 photos

---

### getPhoto(id: number): Promise<Photo | null>

**Description**: Retrieve single photo by ID

**Parameters**:
- `id` (number, required): Photo ID

**Returns**: Promise<Photo | null> - Photo object or null if not found

**Example**:
```javascript
const photo = await photoService.getPhoto(10);
```

**Errors**:
- `DatabaseError`: SQLite operation failed

**Side Effects**: None (read-only)

---

### getPhotoByPath(filePath: string): Promise<Photo | null>

**Description**: Retrieve photo by file path (for duplicate detection)

**Parameters**:
- `filePath` (string, required): Absolute file path

**Returns**: Promise<Photo | null> - Photo object or null if not found

**Example**:
```javascript
const photo = await photoService.getPhotoByPath("/path/to/image.jpg");
```

**Errors**:
- `DatabaseError`: SQLite operation failed

**Side Effects**: None (read-only)

**Performance**: <5ms (indexed query)

---

### deletePhoto(id: number): Promise<void>

**Description**: Delete photo and its album associations

**Parameters**:
- `id` (number, required): Photo ID

**Returns**: Promise<void>

**Example**:
```javascript
await photoService.deletePhoto(10);
```

**Errors**:
- `NotFoundError`: photo doesn't exist
- `DatabaseError`: SQLite operation failed

**Side Effects**:
- Deletes row from `photos` table
- CASCADE deletes associated rows in `album_photos` table
- Does NOT delete physical file

**Note**: Use with caution - removes photo from all albums

---

### extractMetadata(file: File): Promise<PhotoMetadata>

**Description**: Extract EXIF and file metadata without saving to database

**Parameters**:
- `file` (File, required): Browser File object

**Returns**: Promise<PhotoMetadata> - Extracted metadata

**Example**:
```javascript
const metadata = await photoService.extractMetadata(fileObject);
// Returns: {
//   fileName: "image.jpg",
//   filePath: "/path/to/image.jpg", // Browser file handle path
//   dateTaken: 1704067200 || null,
//   width: 4032,
//   height: 3024,
//   fileSize: 2458624
// }
```

**Errors**:
- `ValidationError`: file is not an image
- `ExifError`: EXIF parsing failed (returns partial data)

**Side Effects**: None (pure function)

**Dependencies**: exifr library for EXIF extraction

---

### getAlbumsForPhoto(photoId: number): Promise<Album[]>

**Description**: Find all albums containing a specific photo

**Parameters**:
- `photoId` (number, required): Photo ID

**Returns**: Promise<Album[]> - Array of album objects

**Example**:
```javascript
const albums = await photoService.getAlbumsForPhoto(10);
// Returns: [
//   { id: 1, name: "Vacation 2024", ... },
//   { id: 3, name: "Best Photos", ... }
// ]
```

**Errors**:
- `NotFoundError`: photo doesn't exist
- `DatabaseError`: SQLite operation failed

**Side Effects**: None (read-only)

**Use Case**: Show "This photo is in X albums" UI

---

### validateFile(file: File): Promise<boolean>

**Description**: Check if file is a valid image format

**Parameters**:
- `file` (File, required): Browser File object

**Returns**: Promise<boolean> - true if valid image

**Example**:
```javascript
const isValid = await photoService.validateFile(fileObject);
// Returns: true
```

**Errors**: None (returns false for invalid)

**Supported Formats**:
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- GIF (.gif)
- BMP (.bmp)
- TIFF (.tiff, .tif)

**Side Effects**: None (pure validation)

---

### checkFileExists(filePath: string): Promise<boolean>

**Description**: Verify physical file still exists (for handling missing files)

**Parameters**:
- `filePath` (string, required): Absolute file path

**Returns**: Promise<boolean> - true if file exists

**Example**:
```javascript
const exists = await photoService.checkFileExists("/path/to/image.jpg");
if (!exists) {
  // Show placeholder
}
```

**Errors**: None (returns false if inaccessible)

**Side Effects**: None (read-only)

**Note**: Uses File System Access API or traditional checks

---

## Type Definitions

```typescript
interface Photo {
  id: number;
  file_path: string;
  file_name: string;
  date_taken: number | null; // Unix timestamp
  width: number | null;
  height: number | null;
  file_size: number | null; // Bytes
  created_at: number; // Unix timestamp
}

interface PhotoMetadata {
  fileName: string;
  filePath: string;
  dateTaken: number | null;
  width: number | null;
  height: number | null;
  fileSize: number | null;
}

interface Album {
  id: number;
  name: string;
  display_date: number | null;
  display_order: number;
  created_at: number;
  updated_at: number;
}
```

---

## EXIF Extraction Details

**Library**: exifr (https://github.com/MikeKovarik/exifr)

**Extracted Fields**:
- `DateTimeOriginal` → date_taken (primary)
- `DateTime` → date_taken (fallback 1)
- `DateTimeDigitized` → date_taken (fallback 2)
- `ExifImageWidth` → width
- `ExifImageHeight` → height

**Fallback Strategy**:
1. Try EXIF DateTimeOriginal
2. Try EXIF DateTime
3. Try EXIF DateTimeDigitized
4. Use File.lastModified (file system date)

**Example**:
```javascript
import exifr from 'exifr';

async function extractDateTaken(file) {
  try {
    const exif = await exifr.parse(file, {
      pick: ['DateTimeOriginal', 'DateTime', 'DateTimeDigitized']
    });
    return exif?.DateTimeOriginal?.getTime() ||
           exif?.DateTime?.getTime() ||
           exif?.DateTimeDigitized?.getTime() ||
           file.lastModified;
  } catch (err) {
    return file.lastModified; // Fallback to file date
  }
}
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

class ExifError extends Error {
  constructor(message, originalError) {
    super(`EXIF extraction failed: ${message}`);
    this.name = 'ExifError';
    this.originalError = originalError;
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
