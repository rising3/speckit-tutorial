export class Album {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.display_date = data.display_date;
    this.display_order = data.display_order;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.photo_count = data.photo_count || 0;
  }

  static validate(data) {
    const errors = [];

    // Name validation
    if (!data.name || typeof data.name !== 'string') {
      errors.push('Album name is required');
    } else if (data.name.trim().length === 0) {
      errors.push('Album name cannot be empty');
    } else if (data.name.length > 100) {
      errors.push('Album name must be 100 characters or less');
    }

    // display_order validation
    if (
      data.display_order !== undefined &&
      (typeof data.display_order !== 'number' || data.display_order < 0)
    ) {
      errors.push('Display order must be a non-negative number');
    }

    // display_date validation
    if (
      data.display_date !== null &&
      data.display_date !== undefined &&
      typeof data.display_date !== 'number'
    ) {
      errors.push('Display date must be a valid Unix timestamp or null');
    }

    return errors;
  }

  static isValid(data) {
    return Album.validate(data).length === 0;
  }
}
