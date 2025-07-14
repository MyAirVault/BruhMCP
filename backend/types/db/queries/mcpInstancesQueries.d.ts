/**
 * Get all MCP instances for a user
 * @param {string} userId - User ID
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} Array of MCP instance records
 */
export function getAllMCPInstances(userId: string, filters?: Object): Promise<any[]>;
/**
 * Get single MCP instance by ID
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object|null>} MCP instance record or null
 */
export function getMCPInstanceById(instanceId: string, userId: string): Promise<Object | null>;
/**
 * Update MCP instance
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>} Updated instance record or null
 */
export function updateMCPInstance(instanceId: string, userId: string, updateData: Object): Promise<Object | null>;
/**
 * Delete MCP instance
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<boolean>} Success status
 */
export function deleteMCPInstance(instanceId: string, userId: string): Promise<boolean>;
/**
 * Toggle MCP instance status
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @param {boolean} isActive - New active status
 * @returns {Promise<Object|null>} Updated instance record or null
 */
export function toggleMCPInstance(instanceId: string, userId: string, isActive: boolean): Promise<Object | null>;
/**
 * Renew MCP instance
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @param {Date} newExpirationDate - New expiration date
 * @returns {Promise<Object|null>} Updated instance record or null
 */
export function renewMCPInstance(instanceId: string, userId: string, newExpirationDate: Date): Promise<Object | null>;
/**
 * Update instance status only
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @param {string} status - New status (active, inactive, expired)
 * @returns {Promise<Object|null>} Updated instance record or null
 */
export function updateInstanceStatus(instanceId: string, userId: string, status: string): Promise<Object | null>;
/**
 * Update instance expiration and activate
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @param {string} newExpirationDate - New expiration date
 * @returns {Promise<Object|null>} Updated instance record or null
 */
export function renewInstanceExpiration(instanceId: string, userId: string, newExpirationDate: string): Promise<Object | null>;
/**
 * Get instances by status (for background maintenance)
 * @param {string} status - Status to filter by
 * @returns {Promise<Array>} Array of instances with the specified status
 */
export function getInstancesByStatus(status: string): Promise<any[]>;
/**
 * Get expired instances (for background cleanup)
 * @returns {Promise<Array>} Array of expired instances
 */
export function getExpiredInstances(): Promise<any[]>;
/**
 * Bulk update expired instances to expired status
 * @param {Array<string>} instanceIds - Array of instance IDs to mark as expired
 * @returns {Promise<number>} Number of instances updated
 */
export function bulkMarkInstancesExpired(instanceIds: Array<string>): Promise<number>;
/**
 * Get user instance count by status
 * @param {string} userId - User ID
 * @param {string} [status] - Optional status filter (if not provided, counts non-deleted instances)
 * @returns {Promise<number>} Number of instances
 */
export function getUserInstanceCount(userId: string, status?: string): Promise<number>;
/**
 * Create new MCP instance with transaction support
 * @param {Object} instanceData - Instance data
 * @param {string} instanceData.userId - User ID
 * @param {string} instanceData.mcpServiceId - MCP service ID
 * @param {string} instanceData.customName - Custom instance name
 * @param {string} [instanceData.apiKey] - API key for api_key type services
 * @param {string} [instanceData.clientId] - Client ID for oauth type services
 * @param {string} [instanceData.clientSecret] - Client secret for oauth type services
 * @param {Date} [instanceData.expiresAt] - Expiration date
 * @returns {Promise<Object>} Created instance record
 */
export function createMCPInstance(instanceData: {
    userId: string;
    mcpServiceId: string;
    customName: string;
    apiKey?: string | undefined;
    clientId?: string | undefined;
    clientSecret?: string | undefined;
    expiresAt?: Date | undefined;
}): Promise<Object>;
/**
 * Update MCP service statistics (increment counters)
 * @param {string} serviceId - Service ID
 * @param {Object} updates - Statistics updates
 * @param {number} [updates.totalInstancesIncrement] - Increment total instances by this amount
 * @param {number} [updates.activeInstancesIncrement] - Increment active instances by this amount
 * @returns {Promise<Object|null>} Updated service record
 */
export function updateMCPServiceStats(serviceId: string, updates: {
    totalInstancesIncrement?: number | undefined;
    activeInstancesIncrement?: number | undefined;
}): Promise<Object | null>;
//# sourceMappingURL=mcpInstancesQueries.d.ts.map