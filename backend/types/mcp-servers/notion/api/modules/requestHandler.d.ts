/**
 * Make authenticated request to Notion API
 * @param {string} endpoint - API endpoint
 * @param {string} bearerToken - OAuth Bearer token
 * @param {{method?: string, headers?: Record<string, string>, body?: unknown}} options - Request options
 * @returns {Promise<Record<string, unknown>>} API response
 */
export function makeNotionRequest(endpoint: string, bearerToken: string, options?: {
    method?: string;
    headers?: Record<string, string>;
    body?: unknown;
}): Promise<Record<string, unknown>>;
//# sourceMappingURL=requestHandler.d.ts.map