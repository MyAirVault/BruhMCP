/**
 * Input sanitization and validation utilities for Google Drive MCP Service
 * Provides comprehensive security measures for user inputs
 */

// No imports needed for sanitization utilities

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
    // Remove SQL injection patterns
    const sqlPatterns = [
      /('|(\\)|(%[0-9a-f]{2})|(\\x[0-9a-f]{2}))/gi,
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT|JAVASCRIPT|VBSCRIPT|ONLOAD|ONERROR|EVAL|EXPRESSION)\b)/gi
    ];

    sqlPatterns.forEach(pattern => {
      if (pattern.test(sanitized)) {
        console.error('❌ SQL injection attempt detected:', { 
          input: sanitized,
          pattern: pattern.toString()
        });
        throw new Error('Invalid input: potential SQL injection detected');
      }
    });

    // Remove XSS patterns
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /<object[^>]*>.*?<\/object>/gi,
      /<embed[^>]*>.*?<\/embed>/gi,
      /<form[^>]*>.*?<\/form>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /on\w+=/gi,
      /expression\(/gi,
      /url\(/gi,
      /@import/gi,
      /behaviour:/gi,
      /binding:/gi,
      /-moz-binding:/gi,
      /mocha:/gi,
      /livescript:/gi,
      /data:text\/html/gi,
      /data:application\/javascript/gi
    ];

    xssPatterns.forEach(pattern => {
      if (pattern.test(sanitized)) {
        console.error('❌ XSS attempt detected:', { 
          input: sanitized,
          pattern: pattern.toString()
        });
        throw new Error('Invalid input: potential XSS attack detected');
      }
    });
  }

  // Remove special characters if not allowed
  if (!allowSpecialChars) {
    sanitized = sanitized.replace(/[^\w\s\-_.@]/g, '');
  }

  return sanitized;
}

/**
 * Sanitize file ID to ensure it's a valid Google Drive file ID
 * @param {string} fileId - File ID to sanitize
 * @returns {string} Sanitized file ID
 */
export function sanitizeFileId(fileId) {
  if (!fileId || typeof fileId !== 'string') {
    throw new Error('File ID must be a non-empty string');
  }

  // Google Drive file IDs are alphanumeric with hyphens and underscores
  const sanitized = fileId.replace(/[^a-zA-Z0-9\-_]/g, '');
  
  if (sanitized.length < 10 || sanitized.length > 100) {
    throw new Error('Invalid file ID format');
  }

  if (sanitized !== fileId) {
    console.error('❌ File ID sanitization occurred:', { 
      original: fileId,
      sanitized
    });
  }

  return sanitized;
}

/**
 * Sanitize file name to prevent directory traversal and other attacks
 * @param {string} fileName - File name to sanitize
 * @returns {string} Sanitized file name
 */
export function sanitizeFileName(fileName) {
  if (!fileName || typeof fileName !== 'string') {
    throw new Error('File name must be a non-empty string');
  }

  let sanitized = fileName;

  // Remove directory traversal patterns
  sanitized = sanitized.replace(/\.\.\//g, '');
  sanitized = sanitized.replace(/\.\.\\/g, '');
  sanitized = sanitized.replace(/\.\./g, '');
  sanitized = sanitized.replace(/\//g, '');
  sanitized = sanitized.replace(/\\/g, '');

  // Remove null bytes and control characters
  sanitized = sanitized.replace(/[\x00-\x1f\x7f-\x9f]/g, '');

  // Remove leading/trailing dots and spaces
  sanitized = sanitized.replace(/^[.\s]+|[.\s]+$/g, '');

  // Check for reserved Windows file names
  const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
  const nameWithoutExtension = sanitized.split('.')[0].toUpperCase();
  if (reservedNames.includes(nameWithoutExtension)) {
    throw new Error('File name contains reserved system name');
  }

  // Check length
  if (sanitized.length === 0) {
    throw new Error('File name cannot be empty after sanitization');
  }

  if (sanitized.length > 255) {
    throw new Error('File name exceeds maximum length of 255 characters');
  }

  // Remove dangerous characters for file names
  sanitized = sanitized.replace(/[<>:"|?*]/g, '');

  if (sanitized !== fileName) {
    console.error('❌ File name sanitization occurred:', { 
      original: fileName,
      sanitized
    });
  }

  return sanitized;
}

/**
 * Sanitize email address
 * @param {string} email - Email address to sanitize
 * @returns {string} Sanitized email address
 */
export function sanitizeEmail(email) {
  if (!email || typeof email !== 'string') {
    throw new Error('Email must be a non-empty string');
  }

  const sanitized = email.toLowerCase().trim();

  // Basic email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format');
  }

  // Check for dangerous patterns
  const dangerousPatterns = [
    /javascript:/gi,
    /vbscript:/gi,
    /data:/gi,
    /<script/gi,
    /<iframe/gi,
    /<%/gi,
    /%>/gi
  ];

  dangerousPatterns.forEach(pattern => {
    if (pattern.test(sanitized)) {
      throw new Error('Invalid email: contains dangerous patterns');
    }
  });

  return sanitized;
}

/**
 * Sanitize URL to prevent malicious redirects
 * @param {string} url - URL to sanitize
 * @returns {string} Sanitized URL
 */
export function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('URL must be a non-empty string');
  }

  const sanitized = url.trim();

  // Check for dangerous protocols
  const dangerousProtocols = [
    /^javascript:/gi,
    /^vbscript:/gi,
    /^data:/gi,
    /^file:/gi,
    /^ftp:/gi,
    /^about:/gi,
    /^chrome:/gi,
    /^chrome-extension:/gi,
    /^moz-extension:/gi,
    /^ms-appx:/gi,
    /^ms-appx-web:/gi,
    /^blob:/gi
  ];

  dangerousProtocols.forEach(protocol => {
    if (protocol.test(sanitized)) {
      throw new Error('Invalid URL: dangerous protocol detected');
    }
  });

  // Only allow HTTP and HTTPS
  if (!/^https?:\/\//i.test(sanitized)) {
    throw new Error('Invalid URL: only HTTP and HTTPS protocols are allowed');
  }

  try {
    new URL(sanitized);
  } catch (error) {
    throw new Error('Invalid URL format');
  }

  return sanitized;
}

/**
 * Sanitize search query to prevent injection attacks
 * @param {string} query - Search query to sanitize
 * @returns {string} Sanitized search query
 */
export function sanitizeSearchQuery(query) {
  if (!query || typeof query !== 'string') {
    throw new Error('Search query must be a non-empty string');
  }

  // Remove dangerous patterns commonly used in search injection
  const dangerousPatterns = [
    /(['"])\s*;\s*/g,  // SQL injection patterns
    /(['"])\s*\|\|\s*/g, // SQL injection with OR
    /(['"])\s*&&\s*/g, // SQL injection with AND
    /(['"])\s*union\s+select\s*/gi, // UNION SELECT
    /(['"])\s*insert\s+into\s*/gi, // INSERT INTO
    /(['"])\s*delete\s+from\s*/gi, // DELETE FROM
    /(['"])\s*update\s+set\s*/gi, // UPDATE SET
    /(['"])\s*drop\s+table\s*/gi, // DROP TABLE
    /(['"])\s*create\s+table\s*/gi, // CREATE TABLE
    /(['"])\s*alter\s+table\s*/gi, // ALTER TABLE
    /<script[^>]*>/gi, // XSS script tags
    /<iframe[^>]*>/gi, // XSS iframe tags
    /javascript:/gi, // JavaScript protocol
    /vbscript:/gi, // VBScript protocol
    /on\w+=/gi, // Event handlers
    /expression\(/gi, // CSS expressions
    /url\(/gi, // CSS url()
    /import\s*\(/gi, // CSS/JS imports
    /eval\s*\(/gi, // JavaScript eval
    /function\s*\(/gi, // JavaScript functions
    /\$\{[^}]*\}/g, // Template literals
    /\$\([^)]*\)/g, // jQuery selectors
    /\|\s*sh\s*$/gi, // Shell commands
    /\|\s*bash\s*$/gi, // Bash commands
    /\|\s*cmd\s*$/gi, // Windows commands
    /\|\s*powershell\s*$/gi, // PowerShell commands
    /\b(rm|del|format|chmod|chown|su|sudo|passwd|exec|eval|system|shell_exec|passthru|proc_open|popen|fopen|fwrite|file_get_contents|file_put_contents|include|require|include_once|require_once)\b/gi
  ];

  let sanitized = query;

  dangerousPatterns.forEach(pattern => {
    if (pattern.test(sanitized)) {
      console.error('❌ Dangerous pattern detected in search query:', { 
        query: sanitized,
        pattern: pattern.toString()
      });
      throw new Error('Invalid search query: contains dangerous patterns');
    }
  });

  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  // Check length
  if (sanitized.length > 1000) {
    throw new Error('Search query exceeds maximum length of 1000 characters');
  }

  return sanitized;
}

/**
 * Sanitize MIME type
 * @param {string} mimeType - MIME type to sanitize
 * @returns {string} Sanitized MIME type
 */
export function sanitizeMimeType(mimeType) {
  if (!mimeType || typeof mimeType !== 'string') {
    throw new Error('MIME type must be a non-empty string');
  }

  const sanitized = mimeType.toLowerCase().trim();

  // MIME type should follow the pattern: type/subtype
  const mimeTypeRegex = /^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*$/;
  if (!mimeTypeRegex.test(sanitized)) {
    throw new Error('Invalid MIME type format');
  }

  // Check for dangerous MIME types
  const dangerousMimeTypes = [
    'application/javascript',
    'application/x-javascript',
    'text/javascript',
    'text/vbscript',
    'application/x-shockwave-flash',
    'application/x-msdownload',
    'application/x-executable',
    'application/x-dosexec',
    'application/x-winexe',
    'application/x-msdos-program',
    'application/x-msdownload'
  ];

  if (dangerousMimeTypes.includes(sanitized)) {
    throw new Error('MIME type not allowed for security reasons');
  }

  return sanitized;
}

/**
 * Sanitize integer input
 * @param {any} value - Value to sanitize as integer
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
 * @param {any} value - Value to sanitize as boolean
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
 * @param {any} value - Value to sanitize as array
 * @param {Object} options - Sanitization options
 * @returns {Array} Sanitized array
 */
export function sanitizeArray(value, options = {}) {
  const { maxLength = 100, required = false, itemSanitizer = null } = options;

  if (value === null || value === undefined) {
    if (required) {
      throw new Error('Array value is required');
    }
    return [];
  }

  if (!Array.isArray(value)) {
    throw new Error('Value must be an array');
  }

  if (value.length > maxLength) {
    throw new Error(`Array exceeds maximum length of ${maxLength}`);
  }

  if (itemSanitizer) {
    return value.map(item => itemSanitizer(item));
  }

  return value;
}

/**
 * Comprehensive input sanitization for API requests
 * @param {Object} input - Input object to sanitize
 * @param {Object} schema - Sanitization schema
 * @returns {Object} Sanitized input
 */
export function sanitizeInput(input, schema) {
  if (!input || typeof input !== 'object') {
    throw new Error('Input must be an object');
  }

  if (!schema || typeof schema !== 'object') {
    throw new Error('Schema must be an object');
  }

  const sanitized = {};

  Object.keys(schema).forEach(key => {
    const fieldSchema = schema[key];
    const value = input[key];

    try {
      switch (fieldSchema.type) {
        case 'string':
          sanitized[key] = value ? sanitizeString(value, fieldSchema.options) : null;
          break;
        case 'fileId':
          sanitized[key] = value ? sanitizeFileId(value) : null;
          break;
        case 'fileName':
          sanitized[key] = value ? sanitizeFileName(value) : null;
          break;
        case 'email':
          sanitized[key] = value ? sanitizeEmail(value) : null;
          break;
        case 'url':
          sanitized[key] = value ? sanitizeUrl(value) : null;
          break;
        case 'searchQuery':
          sanitized[key] = value ? sanitizeSearchQuery(value) : null;
          break;
        case 'mimeType':
          sanitized[key] = value ? sanitizeMimeType(value) : null;
          break;
        case 'integer':
          sanitized[key] = sanitizeInteger(value, fieldSchema.options);
          break;
        case 'boolean':
          sanitized[key] = sanitizeBoolean(value);
          break;
        case 'array':
          sanitized[key] = sanitizeArray(value, fieldSchema.options);
          break;
        default:
          sanitized[key] = value;
      }

      // Check required fields
      if (fieldSchema.required && (sanitized[key] === null || sanitized[key] === undefined)) {
        throw new Error(`Field '${key}' is required`);
      }
    } catch (error) {
      throw new Error(`Field '${key}': ${error.message}`);
    }
  });

  return sanitized;
}

/**
 * Export all sanitization functions
 */
export default {
  sanitizeString,
  sanitizeFileId,
  sanitizeFileName,
  sanitizeEmail,
  sanitizeUrl,
  sanitizeSearchQuery,
  sanitizeMimeType,
  sanitizeInteger,
  sanitizeBoolean,
  sanitizeArray,
  sanitizeInput
};