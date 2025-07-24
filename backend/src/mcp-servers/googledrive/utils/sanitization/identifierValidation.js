/**
 * Identifier validation utilities for Google Drive MCP Service
 */

// Constants for validation
const GOOGLE_DRIVE_FILE_ID_REGEX = /^[a-zA-Z0-9_-]{10,}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const MIME_TYPE_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9!#$&^_+-]{0,126}\/[a-zA-Z0-9][a-zA-Z0-9!#$&^_+-]{0,126}$/;

/**
 * Sanitize Google Drive file ID
 * @param {string} fileId - File ID to sanitize
 * @returns {string} Sanitized file ID
 */
export function sanitizeFileId(fileId) {
  if (!fileId || typeof fileId !== 'string') {
    throw new Error('File ID must be a non-empty string');
  }

  const trimmed = fileId.trim();
  
  // Check against known Google Drive file ID pattern
  if (!GOOGLE_DRIVE_FILE_ID_REGEX.test(trimmed)) {
    throw new Error('Invalid Google Drive file ID format');
  }
  
  return trimmed;
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

  const trimmed = email.trim().toLowerCase();
  
  // Basic email validation
  if (!EMAIL_REGEX.test(trimmed)) {
    throw new Error('Invalid email format');
  }
  
  // Additional checks
  if (trimmed.length > 254) { // Max email length per RFC
    throw new Error('Email address is too long');
  }
  
  // Check for dangerous patterns
  if (trimmed.includes('..') || trimmed.startsWith('.') || trimmed.endsWith('.')) {
    throw new Error('Invalid email format');
  }
  
  // Check domain part
  const [localPart, domain] = trimmed.split('@');
  if (!localPart || !domain || domain.includes('..')) {
    throw new Error('Invalid email format');
  }
  
  return trimmed;
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

  const trimmed = mimeType.trim().toLowerCase();
  
  // Validate MIME type format
  if (!MIME_TYPE_REGEX.test(trimmed)) {
    throw new Error('Invalid MIME type format');
  }
  
  // Common MIME types whitelist (partial list for validation)
  const commonMimeTypes = [
    'application/vnd.google-apps.document',
    'application/vnd.google-apps.spreadsheet',
    'application/vnd.google-apps.presentation',
    'application/vnd.google-apps.folder',
    'application/pdf',
    'text/plain',
    'text/csv',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/json',
    'application/xml',
    'application/zip'
  ];
  
  // Warn if not a common type (but still allow it)
  if (!commonMimeTypes.includes(trimmed) && !trimmed.startsWith('application/vnd.google-apps.')) {
    console.warn(`Uncommon MIME type: ${trimmed}`);
  }
  
  return trimmed;
}