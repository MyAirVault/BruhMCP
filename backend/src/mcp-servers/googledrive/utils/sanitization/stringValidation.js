/**
 * String sanitization utilities for Google Drive MCP Service
 */

/**
 * Sanitize string input to prevent injection attacks
 * @param {string} input - Input string to sanitize
 * @param {Object} options - Sanitization options
 * @returns {string} Sanitized string
 */
export function sanitizeString(input, options = {}) {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }

  const {
    maxLength = 1000,
    allowHtml = false,
    allowSpecialChars = true,
    trimWhitespace = true,
    removeNullBytes = true,
    preventInjection = true
  } = options;

  let sanitized = input;

  // Remove null bytes
  if (removeNullBytes) {
    sanitized = sanitized.replace(/\x00/g, '');
  }

  // Trim whitespace
  if (trimWhitespace) {
    sanitized = sanitized.trim();
  }

  // Check length
  if (sanitized.length > maxLength) {
    throw new Error(`Input exceeds maximum length of ${maxLength} characters`);
  }

  // Remove HTML tags if not allowed
  if (!allowHtml) {
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  }

  // Remove dangerous characters if injection prevention is enabled
  if (preventInjection) {
    // Remove script tags more thoroughly
    sanitized = sanitized.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    
    // Remove event handlers
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    
    // Remove javascript: URLs
    sanitized = sanitized.replace(/javascript\s*:/gi, '');
    
    // Remove SQL injection patterns
    sanitized = sanitized.replace(/(\bDROP\s+TABLE\b|\bDELETE\s+FROM\b|\bUNION\s+SELECT\b)/gi, '');
  }

  // Remove special characters if not allowed
  if (!allowSpecialChars) {
    sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-_.]/g, '');
  }

  return sanitized;
}

/**
 * Sanitize file name
 * @param {string} fileName - File name to sanitize
 * @returns {string} Sanitized file name
 */
export function sanitizeFileName(fileName) {
  if (!fileName || typeof fileName !== 'string') {
    throw new Error('File name must be a non-empty string');
  }

  // Remove path traversal attempts
  let sanitized = fileName.replace(/\.\./g, '').replace(/[\/\\]/g, '');
  
  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Replace problematic characters with underscores
  sanitized = sanitized.replace(/[<>:"|?*]/g, '_');
  
  // Trim dots and spaces
  sanitized = sanitized.trim().replace(/^\.+|\.+$/g, '');
  
  // Ensure reasonable length
  if (sanitized.length > 255) {
    // Preserve extension if possible
    const lastDot = sanitized.lastIndexOf('.');
    if (lastDot > 200) {
      const extension = sanitized.substring(lastDot);
      sanitized = sanitized.substring(0, 255 - extension.length) + extension;
    } else {
      sanitized = sanitized.substring(0, 255);
    }
  }
  
  // Ensure not empty after sanitization
  if (!sanitized) {
    throw new Error('File name is empty after sanitization');
  }
  
  return sanitized;
}

/**
 * Sanitize search query
 * @param {string} query - Search query to sanitize
 * @returns {string} Sanitized query
 */
export function sanitizeSearchQuery(query) {
  if (!query || typeof query !== 'string') {
    return '';
  }

  // Escape special characters for Google Drive search
  let sanitized = query
    .replace(/\\/g, '\\\\')    // Escape backslashes
    .replace(/'/g, "\\'")      // Escape single quotes
    .replace(/"/g, '\\"');     // Escape double quotes
  
  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  // Limit query length
  if (sanitized.length > 500) {
    sanitized = sanitized.substring(0, 500);
  }
  
  // Remove potential injection patterns
  const injectionPatterns = [
    /(\bDROP\s+TABLE\b|\bDELETE\s+FROM\b|\bUNION\s+SELECT\b)/gi,
    /<script[^>]*>[\s\S]*?<\/script>/gi,
    /javascript\s*:/gi
  ];
  
  for (const pattern of injectionPatterns) {
    sanitized = sanitized.replace(pattern, '');
  }
  
  return sanitized;
}