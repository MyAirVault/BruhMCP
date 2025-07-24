/**
 * Lookup instance credentials from database
 * @param {string} instanceId - UUID of the service instance
 * @param {string} serviceName - Name of the MCP service (slack)
 * @returns {Object|null} Instance credentials or null if not found
 */
export function lookupInstanceCredentials(instanceId: string, serviceName: string): Object | null;
/**
 * Update instance usage tracking
 * @param {string} instanceId - UUID of the service instance
 * @returns {Promise<boolean>} Promise that resolves to true if update was successful
 */
export function updateInstanceUsage(instanceId: string): Promise<boolean>;
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
 * @returns {Promise<boolean>} Promise that resolves to true if update was successful
 */
export function updateInstanceStatus(instanceId: string, newStatus: string): Promise<boolean>;
/**
 * Get all active instances for Slack service
 * @returns {Array} Array of active instance records
 */
export function getActiveSlackInstances(): any[];
/**
 * Validate instance exists and is accessible
 * @param {string} instanceId - UUID of the service instance
 * @param {string} userId - UUID of the user (for additional security)
 * @returns {Promise<boolean>} Promise that resolves to true if instance is valid and accessible
 */
export function validateInstanceAccess(instanceId: string, userId: string): Promise<boolean>;
/**
 * Clean up expired instances
 * @returns {number} Number of instances marked as expired
 */
export function cleanupExpiredInstances(): number;
/**
 * Get Slack workspace information for an instance
 * @param {string} instanceId - UUID of the service instance
 * @returns {Object|null} Workspace information or null if not found
 */
export function getSlackWorkspaceInfo(instanceId: string): Object | null;
/**
 * Update Slack team information
 * @param {string} instanceId - UUID of the service instance
 * @param {Object} teamInfo - Team information object
 * @returns {Promise<boolean>} Promise that resolves to true if update was successful
 */
export function updateSlackTeamInfo(instanceId: string, teamInfo: Object): Promise<boolean>;
//# sourceMappingURL=database.d.ts.map