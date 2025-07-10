/**
 * Get next instance number for user and MCP type
 * @param {string} userId - User ID
 * @param {string} mcpTypeId - MCP type ID
 * @returns {Promise<number>} Next instance number
 */
export function getNextInstanceNumber(userId: string, mcpTypeId: string): Promise<number>;
/**
 * Generate unique access token
 * @returns {Promise<string>} Unique access token
 */
export function generateUniqueAccessToken(): Promise<string>;
/**
 * Count user's MCP instances
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Instance counts
 */
export function countUserMCPInstances(userId: string): Promise<Object>;
//# sourceMappingURL=instance-utilities.d.ts.map