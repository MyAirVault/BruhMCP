/**
 * Lookup instance credentials from database
 * @param {string} instanceId - UUID of the service instance
 * @param {string} serviceName - Name of the MCP service (gmail)
 * @returns {Promise<Object|null>} Instance credentials or null if not found
 */
export function lookupInstanceCredentials(instanceId: string, serviceName: string): Promise<Object | null>;
/**
 * Update instance usage tracking
 * @param {string} instanceId - UUID of the service instance
 * @returns {Promise<boolean>} Promise that resolves to true if update was successful
 */
export function updateInstanceUsage(instanceId: string): Promise<boolean>;
/**
 * Get instance statistics
 * @param {string} instanceId - UUID of the service instance
 * @returns {Promise<Object|null>} Instance statistics or null if not found
 */
export function getInstanceStatistics(instanceId: string): Promise<Object | null>;
/**
 * Update instance status
 * @param {string} instanceId - UUID of the service instance
 * @param {string} newStatus - New status (active, inactive, expired)
 * @returns {Promise<boolean>} Promise that resolves to true if update was successful
 */
export function updateInstanceStatus(instanceId: string, newStatus: string): Promise<boolean>;
/**
 * Get all active instances for Gmail service
 * @returns {Promise<Object[]>} Array of active instance records
 */
export function getActiveGmailInstances(): Promise<Object[]>;
/**
 * Validate instance exists and is accessible
 * @param {string} instanceId - UUID of the service instance
 * @param {string} userId - UUID of the user (for additional security)
 * @returns {Promise<boolean>} True if instance is valid and accessible
 */
export function validateInstanceAccess(instanceId: string, userId: string): Promise<boolean>;
/**
 * Clean up expired instances
 * @returns {Promise<number>} Number of instances marked as expired
 */
export function cleanupExpiredInstances(): Promise<number>;
//# sourceMappingURL=database.d.ts.map