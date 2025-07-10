/**
 * Create a new MCP instance
 * @param {Object} instanceData - Instance data
 * @returns {Promise<Object>} Created instance
 */
export function createMCPInstance(instanceData: object): Promise<object>;
/**
 * Update MCP instance
 * @param {string} instanceId - Instance ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated instance
 */
export function updateMCPInstance(instanceId: string, updateData: object): Promise<object>;
/**
 * Get MCP instances for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of instances
 */
export function getMCPInstancesByUserId(userId: string, options?: object): Promise<any[]>;
/**
 * Get MCP instance by ID
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object|null>} Instance or null if not found
 */
export function getMCPInstanceById(instanceId: string, userId: string): Promise<object | null>;
/**
 * Delete MCP instance
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<boolean>} True if deleted
 */
export function deleteMCPInstance(instanceId: string, userId: string): Promise<boolean>;
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
 * Get expired MCP instances
 * @returns {Promise<Array>} Array of expired instances
 */
export function getExpiredMCPInstances(): Promise<any[]>;
/**
 * Count user's MCP instances
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Instance counts
 */
export function countUserMCPInstances(userId: string): Promise<object>;
//# sourceMappingURL=mcpInstancesQueries.d.ts.map
