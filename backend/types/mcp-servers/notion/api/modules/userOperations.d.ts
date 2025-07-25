/**
 * Get current user
 * @param {Record<string, never>} args - User arguments (empty object)
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, unknown>>} User data
 */
export function getCurrentUser(args: Record<string, never>, bearerToken: string): Promise<Record<string, unknown>>;
/**
 * List users
 * @param {{start_cursor?: string, page_size?: number}} args - List users arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, unknown>>} Users list
 */
export function listUsers(args: {
    start_cursor?: string;
    page_size?: number;
}, bearerToken: string): Promise<Record<string, unknown>>;
//# sourceMappingURL=userOperations.d.ts.map