export type RequestOptions = {
    /**
     * - HTTP method
     */
    method?: string | undefined;
    /**
     * - Additional headers
     */
    headers?: Record<string, string> | undefined;
    /**
     * - Request body
     */
    body?: string | Object | undefined;
    /**
     * - Abort signal for timeout
     */
    signal?: AbortSignal | undefined;
};
/**
 * @typedef {Object} RequestOptions
 * @property {string} [method] - HTTP method
 * @property {Record<string, string>} [headers] - Additional headers
 * @property {Object|string} [body] - Request body
 * @property {AbortSignal} [signal] - Abort signal for timeout
 */
/**
 * Make authenticated request to Gmail API
 * @param {string} endpoint - API endpoint
 * @param {string} bearerToken - OAuth Bearer token
 * @param {RequestOptions} [options={}] - Request options
 * @returns {Promise<Record<string, any>>} API response
 * @throws {Error} When API request fails
 */
export function makeGmailRequest(endpoint: string, bearerToken: string, options?: RequestOptions): Promise<Record<string, any>>;
//# sourceMappingURL=requestHandler.d.ts.map