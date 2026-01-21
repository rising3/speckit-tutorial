export class Photo {
  constructor(data) {
    this.id = data.id;
    this.file_path = data.file_path;
    this.file_name = data.file_name;
    this.date_taken = data.date_taken;
    this.width = data.width;
    this.height = data.height;
    this.file_size = data.file_size;
    this.created_at = data.created_at;
  }

  static validate(data) {
    const errors = [];

    // file_path validation
    if (!data.file_path || typeof data.file_path !== 'string') {
      errors.push('File path is required');
    } else if (data.file_path.trim().length === 0) {
      errors.push('File path cannot be empty');
    }

    // file_name validation
    if (!data.file_name || typeof data.file_name !== 'string') {
      errors.push('File name is required');
    } else if (data.file_name.trim().length === 0) {
      errors.push('File name cannot be empty');
    }

    // Dimensions validation
    if (data.width !== null && data.width !== undefined) {
      if (typeof data.width !== 'number' || data.width <= 0) {
        errors.push('Width must be a positive number');
      }
    }

    if (data.height !== null && data.height !== undefined) {
      if (typeof data.height !== 'number' || data.height <= 0) {
        errors.push('Height must be a positive number');
      }
    }

    // file_size validation
    if (data.file_size !== null && data.file_size !== undefined) {
      if (typeof data.file_size !== 'number' || data.file_size <= 0) {
        errors.push('File size must be a positive number');
      }
    }

    // date_taken validation
    if (
      data.date_taken !== null &&
      data.date_taken !== undefined &&
      typeof data.date_taken !== 'number'
    ) {
      errors.push('Date taken must be a valid Unix timestamp or null');
    }

    return errors;
  }

  static isValid(data) {
    return Photo.validate(data).length === 0;
  }
}
