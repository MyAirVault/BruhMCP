/**
 * Fetch with retry and curl fallback
 * @param {string} url - URL to fetch
 * @param {{ headers?: Record<string, string>, [key: string]: any }} options - Request options
 * @returns {Promise<any>} Response data
 */
export function fetchWithRetry(url: string, options?: {
    headers?: Record<string, string>;
    [key: string]: any;
}): Promise<any>;
//# sourceMappingURL=fetchWithRetry.d.ts.map