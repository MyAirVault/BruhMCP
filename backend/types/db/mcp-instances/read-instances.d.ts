/**
 * Get MCP instances for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of instances
 */
export function getMCPInstancesByUserId(userId: string, options?: Object): Promise<any[]>;
/**
 * Get MCP instance by ID
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object|null>} Instance or null if not found
 */
export function getMCPInstanceById(instanceId: string, userId: string): Promise<Object | null>;
/**
 * Get expired MCP instances
 * @returns {Promise<Array>} Array of expired instances
 */
export function getExpiredMCPInstances(): Promise<any[]>;
//# sourceMappingURL=read-instances.d.ts.map