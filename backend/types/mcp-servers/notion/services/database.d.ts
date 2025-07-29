/**
 * Lookup instance credentials for OAuth authentication
 * @param {string} instanceId - UUID of the service instance
 * @param {string} serviceName - Name of the MCP service (e.g., 'notion')
 * @returns {Promise<Object|null>} Instance data with credentials or null if not found
 */
export function lookupInstanceCredentials(instanceId: string, serviceName?: string): Promise<Object | null>;
/**
 * Update instance usage tracking
 * @param {string} instanceId - UUID of the service instance
 * @returns {Promise<void>}
 */
export function updateInstanceUsage(instanceId: string): Promise<void>;
/**
 * Legacy function - kept for backward compatibility
 * @param {string} instanceId - UUID of the service instance
 * @returns {Promise<void>}
 */
export function updateUsageTracking(instanceId: string): Promise<void>;
/**
 * Get instance credentials (legacy function name)
 * @param {string} instanceId - UUID of the service instance
 * @returns {Promise<Object|null>} Instance data with credentials or null if not found
 */
export function getInstanceCredentials(instanceId: string): Promise<Object | null>;
//# sourceMappingURL=database.d.ts.map