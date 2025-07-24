/**
 * Type validation utilities for Google Drive MCP Service
 */

/**
 * Sanitize integer input
 * @param {string|number|null|undefined} value - Value to sanitize as integer
 * @param {Object} options - Sanitization options
 * @returns {number} Sanitized integer
 */
export function sanitizeInteger(value, options = {}) {
  const { min = -Infinity, max = Infinity, required = false } = options;

  if (value === null || value === undefined) {
    if (required) {
      throw new Error('Integer value is required');
    }
    return null;
  }

  const parsed = parseInt(value, 10);
  
  if (isNaN(parsed)) {
    throw new Error('Invalid integer value');
  }

  if (parsed < min) {
    throw new Error(`Integer value must be at least ${min}`);
  }

  if (parsed > max) {
    throw new Error(`Integer value must be at most ${max}`);
  }

  return parsed;
}

/**
 * Sanitize boolean input
 * @param {string|number|boolean|null|undefined} value - Value to sanitize as boolean
 * @returns {boolean} Sanitized boolean
 */
export function sanitizeBoolean(value) {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    if (lower === 'true' || lower === '1' || lower === 'yes' || lower === 'on') {
      return true;
    }
    if (lower === 'false' || lower === '0' || lower === 'no' || lower === 'off') {
      return false;
    }
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  throw new Error('Invalid boolean value');
}

/**
 * Sanitize array input
 * @param {Array|string|null|undefined} value - Value to sanitize as array
 * @param {Object} options - Sanitization options
 * @returns {Array} Sanitized array
 */
export function sanitizeArray(value, options = {}) {
  const { maxLength = 100, itemSanitizer = null } = options;

  if (value === null || value === undefined) {
    return [];
  }

  let array;
  
  if (Array.isArray(value)) {
    array = value;
  } else if (typeof value === 'string') {
    // Try to parse as JSON array
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        array = parsed;
      } else {
        throw new Error('Parsed value is not an array');
      }
    } catch (error) {
      // If not JSON, treat as comma-separated values
      array = value.split(',').map(item => item.trim()).filter(item => item);
    }
  } else {
    throw new Error('Value must be an array or string');
  }

  // Check array length
  if (array.length > maxLength) {
    throw new Error(`Array exceeds maximum length of ${maxLength}`);
  }

  // Sanitize items if sanitizer provided
  if (itemSanitizer && typeof itemSanitizer === 'function') {
    return array.map(item => itemSanitizer(item));
  }

  return array;
}