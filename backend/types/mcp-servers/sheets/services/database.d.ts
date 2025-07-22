/**
 * Lookup instance credentials from database
 * @param {string} instanceId - UUID of the service instance
 * @param {string} serviceName - Name of the MCP service (sheets)
 * @returns {Object|null} Instance credentials or null if not found
 */
export function lookupInstanceCredentials(instanceId: string, serviceName: string): Object | null;
/**
 * Update instance usage tracking
 * @param {string} instanceId - UUID of the service instance
 * @returns {boolean} True if update was successful
 */
export function updateInstanceUsage(instanceId: string): boolean;
/**
 * Get instance statistics
 * @param {string} instanceId - UUID of the service instance
 * @returns {Object|null} Instance statistics or null if not found
 */
export function getInstanceStatistics(instanceId: string): Object | null;
/**
 * Update instance status
 * @param {string} instanceId - UUID of the service instance
 * @param {string} newStatus - New status (active, inactive, expired)
 * @returns {boolean} True if update was successful
 */
export function updateInstanceStatus(instanceId: string, newStatus: string): boolean;
/**
 * Get all active instances for Google Sheets service
 * @returns {Array} Array of active instance records
 */
export function getActiveSheetsInstances(): any[];
/**
 * Validate instance exists and is accessible
 * @param {string} instanceId - UUID of the service instance
 * @param {string} userId - UUID of the user (for additional security)
 * @returns {boolean} True if instance is valid and accessible
 */
export function validateInstanceAccess(instanceId: string, userId: string): boolean;
/**
 * Clean up expired instances
 * @returns {number} Number of instances marked as expired
 */
export function cleanupExpiredInstances(): number;
//# sourceMappingURL=database.d.ts.map