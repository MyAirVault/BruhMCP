export = fetchWithRetry;
/**
 * @typedef {Object} FetchOptions
 * @property {Record<string, string>} [headers] - Request headers
 * @property {string} [method] - HTTP method
 * @property {string | Buffer} [body] - Request body
 * @property {number} [timeout] - Request timeout in milliseconds
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
declare function fetchWithRetry(url: string, options?: FetchOptions | undefined): Promise<import('node-fetch').Response | MockResponse>;
declare namespace fetchWithRetry {
    export { FetchOptions, MockResponse };
}
type MockResponse = {
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
type FetchOptions = {
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
    body?: string | Buffer | undefined;
    /**
     * - Request timeout in milliseconds
     */
    timeout?: number | undefined;
};
//# sourceMappingURL=fetchWithRetry.d.ts.map