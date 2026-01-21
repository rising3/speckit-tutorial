/**
 * Format Unix timestamp to human-readable date string
 * @param {number} timestamp - Unix timestamp in seconds
 * @param {string} format - 'short' | 'long' | 'relative'
 * @returns {string} Formatted date string
 */
export function formatDate(timestamp, format = 'short') {
  if (!timestamp) return 'Unknown date';

  const date = new Date(timestamp * 1000);
  const now = new Date();

  if (format === 'relative') {
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }

  if (format === 'long') {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // short format (default)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get current Unix timestamp in seconds
 * @returns {number} Current Unix timestamp
 */
export function getCurrentTimestamp() {
  return Math.floor(Date.now() / 1000);
}

/**
 * Convert Date object to Unix timestamp
 * @param {Date} date - JavaScript Date object
 * @returns {number} Unix timestamp in seconds
 */
export function dateToTimestamp(date) {
  return Math.floor(date.getTime() / 1000);
}

/**
 * Convert Unix timestamp to Date object
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {Date} JavaScript Date object
 */
export function timestampToDate(timestamp) {
  return new Date(timestamp * 1000);
}
