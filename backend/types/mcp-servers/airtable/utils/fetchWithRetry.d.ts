/**
 * @typedef {Object} FetchOptions
 * @property {Record<string, string>} [headers] - Request headers
 * @property {string} [method] - HTTP method
 * @property {string | Buffer} [body] - Request body
 */
/**
 * @typedef {Object} MockResponse
 * @property {boolean} ok - Whether request succeeded
 * @property {number} status - HTTP status code
 * @property {string} statusText - Status text
 * @property {Map<string, string>} headers - Response headers
 * @property {() => Promise<any>} json - JSON parser function
 */
/**
 * Fetch with retry and curl fallback
 * @param {string} url - URL to fetch
 * @param {FetchOptions} [options] - Request options
 * @returns {Promise<import('node-fetch').Response | MockResponse>} Response data
 */
export function fetchWithRetry(url: string, options?: FetchOptions): Promise<import("node-fetch").Response | MockResponse>;
export type FetchOptions = {
    /**
     * - Request headers
     */
    headers?: Record<string, string> | undefined;
    /**
     * - HTTP method
     */
    method?: string | undefined;
    /**
     * - Request body
     */
    body?: string | Buffer<ArrayBufferLike> | undefined;
};
export type MockResponse = {
    /**
     * - Whether request succeeded
     */
    ok: boolean;
    /**
     * - HTTP status code
     */
    status: number;
    /**
     * - Status text
     */
    statusText: string;
    /**
     * - Response headers
     */
    headers: Map<string, string>;
    /**
     * - JSON parser function
     */
    json: () => Promise<any>;
};
//# sourceMappingURL=fetchWithRetry.d.ts.map