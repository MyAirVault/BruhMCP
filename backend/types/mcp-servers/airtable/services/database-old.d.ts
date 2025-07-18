/**
 * Initialize database connection
 * @returns {Promise<void>}
 */
export function initialize(): Promise<void>;
/**
 * Get instance credentials (required by middleware)
 * @param {string} instanceId - Instance ID
 * @returns {Promise<Object|null>} Instance record or null
 */
export function getInstanceCredentials(instanceId: string): Promise<Object | null>;
/**
 * Validate instance access (required by middleware)
 * @param {Object} instance - Instance record
 * @returns {Object} Validation result
 */
export function validateInstanceAccess(instance: Object): Object;
/**
 * Update usage tracking (required by middleware)
 * @param {string} instanceId - Instance ID
 * @returns {Promise<void>}
 */
export function updateUsageTracking(instanceId: string): Promise<void>;
/**
 * Get API key for instance (required by middleware)
 * @param {Object} instance - Instance record
 * @returns {string} API key
 */
export function getApiKeyForInstance(instance: Object): string;
/**
 * Store instance credentials
 * @param {string} instanceId - Instance ID
 * @param {string} apiKeyHash - Hashed API key
 * @param {Object} metadata - Instance metadata
 * @returns {Promise<Object>} Created instance record
 */
export function storeInstance(instanceId: string, apiKeyHash: string, metadata?: Object): Promise<Object>;
/**
 * Get instance by ID
 * @param {string} instanceId - Instance ID
 * @returns {Promise<Object|null>} Instance record or null
 */
export function getInstance(instanceId: string): Promise<Object | null>;
/**
 * Update instance metadata
 * @param {string} instanceId - Instance ID
 * @param {Object} metadata - Metadata to update
 * @returns {Promise<Object>} Updated instance record
 */
export function updateInstanceMetadata(instanceId: string, metadata: Object): Promise<Object>;
/**
 * Delete instance
 * @param {string} instanceId - Instance ID
 * @returns {Promise<boolean>} True if deleted
 */
export function deleteInstance(instanceId: string): Promise<boolean>;
/**
 * List all instances
 * @param {Object} options - List options
 * @returns {Promise<Array>} Array of instance records
 */
export function listInstances(options?: Object): Promise<any[]>;
/**
 * Get instance statistics
 * @returns {Promise<Object>} Statistics
 */
export function getStatistics(): Promise<Object>;
/**
 * Clean up old instances
 * @param {number} olderThanDays - Delete instances older than this many days
 * @returns {Promise<number>} Number of instances cleaned up
 */
export function cleanupOldInstances(olderThanDays?: number): Promise<number>;
/**
 * Health check
 * @returns {Promise<Object>} Health status
 */
export function healthCheck(): Promise<Object>;
/**
 * Close database connection
 * @returns {Promise<void>}
 */
export function close(): Promise<void>;
//# sourceMappingURL=database-old.d.ts.map