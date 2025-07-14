/**
 * Validation utilities for Figma service
 */
/**
 * Validate Figma file key format
 * @param {string} fileKey - Figma file key to validate
 * @returns {boolean} True if valid format
 */
export function isValidFigmaFileKey(fileKey: string): boolean;
/**
 * Validate API key format
 * @param {string} apiKey - API key to validate
 * @returns {boolean} True if valid format
 */
export function isValidApiKey(apiKey: string): boolean;
/**
 * Extract file key from Figma URL
 * @param {string} url - Figma URL
 * @returns {string|null} File key if found, null otherwise
 */
export function extractFileKeyFromUrl(url: string): string | null;
/**
 * Sanitize user input for logging
 * @param {string} input - User input to sanitize
 * @returns {string} Sanitized input
 */
export function sanitizeForLogging(input: string): string;
//# sourceMappingURL=validation.d.ts.map