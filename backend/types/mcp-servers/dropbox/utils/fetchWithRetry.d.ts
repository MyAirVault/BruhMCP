/**
 * Fetch with retry logic
 * @param {string} url - URL to fetch
 * @param {RequestInit} options - Fetch options
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay between retries in milliseconds
 * @param {number} timeout - Request timeout in milliseconds
 * @returns {Promise<Response>} Response object
 */
export function fetchWithRetry(url: string, options?: RequestInit, maxRetries?: number, baseDelay?: number, timeout?: number): Promise<Response>;
/**
 * Fetch with retry logic for file operations (longer timeout)
 * @param {string} url - URL to fetch
 * @param {RequestInit} options - Fetch options
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay between retries in milliseconds
 * @returns {Promise<Response>} Response object
 */
export function fetchFileWithRetry(url: string, options?: RequestInit, maxRetries?: number, baseDelay?: number): Promise<Response>;
/**
 * Fetch with retry logic for Dropbox API
 * Handles rate limiting and temporary errors
 */
export const MAX_RETRIES: 3;
export const RETRY_DELAY: 1000;
export const DEFAULT_TIMEOUT: 30000;
export const LONG_TIMEOUT: 120000;
//# sourceMappingURL=fetchWithRetry.d.ts.map