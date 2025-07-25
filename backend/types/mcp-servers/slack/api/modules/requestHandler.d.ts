/**
 * @typedef {Object} RequestOptions
 * @property {string} [method] - HTTP method
 * @property {Record<string, string>} [headers] - Request headers
 * @property {FormData} [formData] - Form data for file uploads
 * @property {Object} [body] - Request body as object
 */
/**
 * @typedef {Object} SlackApiResponse
 * @property {boolean} ok - Success indicator
 * @property {string} [error] - Error message if request failed
 */
/**
 * Make authenticated request to Slack API
 * @param {string} endpoint - API endpoint
 * @param {string} bearerToken - OAuth Bearer token
 * @param {RequestOptions} options - Request options
 * @returns {Promise<SlackApiResponse & Record<string, any>>} API response
 */
export function makeSlackRequest(endpoint: string, bearerToken: string, options?: RequestOptions): Promise<SlackApiResponse & Record<string, any>>;
export type RequestOptions = {
    /**
     * - HTTP method
     */
    method?: string | undefined;
    /**
     * - Request headers
     */
    headers?: Record<string, string> | undefined;
    /**
     * - Form data for file uploads
     */
    formData?: FormData | undefined;
    /**
     * - Request body as object
     */
    body?: Object | undefined;
};
export type SlackApiResponse = {
    /**
     * - Success indicator
     */
    ok: boolean;
    /**
     * - Error message if request failed
     */
    error?: string | undefined;
};
//# sourceMappingURL=requestHandler.d.ts.map