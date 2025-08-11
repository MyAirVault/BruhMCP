/**
 * Make raw API call to Notion
 * @param {{endpoint: string, method?: 'GET' | 'POST' | 'PATCH' | 'DELETE', body?: Record<string, unknown>}} args - Raw API call arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, unknown>>} API response
 */
export function makeRawApiCall(args: {
    endpoint: string;
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    body?: Record<string, unknown>;
}, bearerToken: string): Promise<Record<string, unknown>>;
//# sourceMappingURL=utilityOperations.d.ts.map