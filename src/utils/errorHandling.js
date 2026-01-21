export class ValidationError extends Error {
  constructor(field, message) {
    super(`Validation failed for ${field}: ${message}`);
    this.name = 'ValidationError';
    this.field = field;
  }
}

export class NotFoundError extends Error {
  constructor(entity, id) {
    super(`${entity} with id ${id} not found`);
    this.name = 'NotFoundError';
    this.entity = entity;
    this.id = id;
  }
}

export class DuplicateError extends Error {
  constructor(entity, field, value) {
    super(`${entity} with ${field}='${value}' already exists`);
    this.name = 'DuplicateError';
    this.entity = entity;
    this.field = field;
  }
}

export class ExifError extends Error {
  constructor(message, originalError) {
    super(`EXIF extraction failed: ${message}`);
    this.name = 'ExifError';
    this.originalError = originalError;
  }
}

export class DatabaseError extends Error {
  constructor(operation, originalError) {
    super(`Database operation '${operation}' failed: ${originalError.message}`);
    this.name = 'DatabaseError';
    this.operation = operation;
    this.originalError = originalError;
  }
}
