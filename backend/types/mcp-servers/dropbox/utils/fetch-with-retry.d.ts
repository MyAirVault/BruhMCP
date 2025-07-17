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
//# sourceMappingURL=fetch-with-retry.d.ts.map