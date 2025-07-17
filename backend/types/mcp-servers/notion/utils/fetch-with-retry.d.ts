/**
 * Fetch with retry logic and error handling
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} retryAttempts - Number of retry attempts
 * @param {number} retryDelay - Delay between retries in ms
 * @returns {Promise<any>} Response data
 */
export function fetchWithRetry(url: string, options?: Object, retryAttempts?: number, retryDelay?: number): Promise<any>;
//# sourceMappingURL=fetch-with-retry.d.ts.map