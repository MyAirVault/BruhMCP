/**
 * Get information about a user
 * @param {Object} args - Query arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} User info result
 */
export function getUserInfo(args: Object, bearerToken: string): Promise<Object>;
/**
 * List users in the workspace
 * @param {Object} args - Query arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Users list result
 */
export function listUsers(args: Object, bearerToken: string): Promise<Object>;
//# sourceMappingURL=userOperations.d.ts.map