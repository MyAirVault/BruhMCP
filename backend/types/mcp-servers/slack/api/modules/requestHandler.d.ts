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
 * @property {Object} [channel] - Channel data
 * @property {Object} [message] - Message data
 * @property {Object} [user] - User data
 * @property {Object} [team] - Team data
 * @property {Object[]} [channels] - Array of channels
 * @property {Object[]} [members] - Array of members
 * @property {Object[]} [messages] - Array of messages
 * @property {Object[]} [files] - Array of files
 * @property {string} [ts] - Message timestamp
 * @property {string} [response_metadata] - Response metadata
 */
/**
 * Make authenticated request to Slack API
 * @param {string} endpoint - API endpoint
 * @param {string} bearerToken - OAuth Bearer token
 * @param {RequestOptions} options - Request options
 * @returns {Promise<SlackApiResponse>} API response
 */
export function makeSlackRequest(endpoint: string, bearerToken: string, options?: RequestOptions): Promise<SlackApiResponse>;
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
    /**
     * - Channel data
     */
    channel?: Object | undefined;
    /**
     * - Message data
     */
    message?: Object | undefined;
    /**
     * - User data
     */
    user?: Object | undefined;
    /**
     * - Team data
     */
    team?: Object | undefined;
    /**
     * - Array of channels
     */
    channels?: Object[] | undefined;
    /**
     * - Array of members
     */
    members?: Object[] | undefined;
    /**
     * - Array of messages
     */
    messages?: Object[] | undefined;
    /**
     * - Array of files
     */
    files?: Object[] | undefined;
    /**
     * - Message timestamp
     */
    ts?: string | undefined;
    /**
     * - Response metadata
     */
    response_metadata?: string | undefined;
};
//# sourceMappingURL=requestHandler.d.ts.map