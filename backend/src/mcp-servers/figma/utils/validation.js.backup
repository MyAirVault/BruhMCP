/**
 * Validation utilities for Figma service
 */

/**
 * Validate Figma file key format
 * @param {string} fileKey - Figma file key to validate
 * @returns {boolean} True if valid format
 */
export function isValidFigmaFileKey(fileKey) {
  if (!fileKey || typeof fileKey !== 'string') {
    return false;
  }
  
  // Figma file keys are typically alphanumeric with some special characters
  // Example: zX1YuwS9Jg1Rc_qF3T1Du_Um
  const fileKeyPattern = /^[a-zA-Z0-9_-]+$/;
  return fileKeyPattern.test(fileKey) && fileKey.length > 10;
}

/**
 * Validate API key format
 * @param {string} apiKey - API key to validate
 * @returns {boolean} True if valid format
 */
export function isValidApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }
  
  // Figma API keys start with "figd_" and are followed by base64-like characters
  // Example: figd_ABC123def456GHI789jkl012MNO345pqr
  return apiKey.startsWith('figd_') && apiKey.length > 20;
}

/**
 * Extract file key from Figma URL
 * @param {string} url - Figma URL
 * @returns {string|null} File key if found, null otherwise
 */
export function extractFileKeyFromUrl(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }
  
  // Match Figma URLs like:
  // https://www.figma.com/file/ABC123/Project-Name
  // https://figma.com/file/ABC123/
  const urlPattern = /figma\.com\/file\/([a-zA-Z0-9_-]+)/;
  const match = url.match(urlPattern);
  
  return match ? match[1] : null;
}

/**
 * Sanitize user input for logging
 * @param {string} input - User input to sanitize
 * @returns {string} Sanitized input
 */
export function sanitizeForLogging(input) {
  if (!input || typeof input !== 'string') {
    return 'invalid_input';
  }
  
  // Remove potentially sensitive information and limit length
  return input.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
}