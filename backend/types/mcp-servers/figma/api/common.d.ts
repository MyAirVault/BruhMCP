/**
 * @typedef {Object} CommentPosition
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 */
/**
 * @typedef {Object} CommentRequestBody
 * @property {string} message - Comment message
 * @property {Object} [client_meta] - Client metadata for position
 * @property {number} client_meta.x - X coordinate
 * @property {number} client_meta.y - Y coordinate
 */
/**
 * Handle common API response errors
 * @param {Response} response - Fetch response object
 * @param {string} context - Context for error message
 */
export function handleApiError(response: Response, context: string): Promise<void>;
/**
 * Make authenticated request to Figma API
 * @param {string} endpoint - API endpoint
 * @param {string} apiKey - User's Figma API key
 * @param {Object} [options] - Fetch options
 * @param {Object} [options.headers] - Additional headers
 * @param {string} [options.method] - HTTP method
 * @param {string} [options.body] - Request body
 * @returns {Promise<any>}
 */
export function makeAuthenticatedRequest(endpoint: string, apiKey: string, options?: {
    headers?: Object | undefined;
    method?: string | undefined;
    body?: string | undefined;
}): Promise<any>;
export const FIGMA_BASE_URL: "https://api.figma.com/v1";
export type CommentPosition = {
    /**
     * - X coordinate
     */
    x: number;
    /**
     * - Y coordinate
     */
    y: number;
};
export type CommentRequestBody = {
    /**
     * - Comment message
     */
    message: string;
    /**
     * - Client metadata for position
     */
    client_meta?: {
        /**
         * - X coordinate
         */
        x: number;
        /**
         * - Y coordinate
         */
        y: number;
    } | undefined;
};
//# sourceMappingURL=common.d.ts.map