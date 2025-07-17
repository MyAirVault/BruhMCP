/**
 * Looks up instance credentials from database
 * @param {string} instanceId - The instance ID
 * @param {string} serviceName - The service name ('discord')
 * @returns {Promise<Object|null>} Instance credentials or null if not found
 */
export function lookupInstanceCredentials(instanceId: string, serviceName: string): Promise<Object | null>;
/**
 * Updates instance usage statistics
 * @param {string} instanceId - The instance ID
 * @returns {Promise<void>}
 */
export function updateInstanceUsage(instanceId: string): Promise<void>;
/**
 * Updates OAuth credentials in database
 * @param {string} instanceId - The instance ID
 * @param {Object} credentials - New credential data
 * @returns {Promise<void>}
 */
export function updateInstanceCredentials(instanceId: string, credentials: Object): Promise<void>;
/**
 * Validates if an instance exists and is active
 * @param {string} instanceId - The instance ID
 * @param {string} serviceName - The service name ('discord')
 * @returns {Promise<boolean>} True if instance is valid and active
 */
export function validateInstanceExists(instanceId: string, serviceName: string): Promise<boolean>;
/**
 * Gets instance statistics for monitoring
 * @param {string} instanceId - The instance ID
 * @returns {Promise<Object|null>} Instance statistics or null
 */
export function getInstanceStatistics(instanceId: string): Promise<Object | null>;
/**
 * Logs API operation for audit trail
 * @param {string} instanceId - The instance ID
 * @param {string} operation - The operation performed
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<void>}
 */
export function logApiOperation(instanceId: string, operation: string, metadata?: Object): Promise<void>;
/**
 * Checks if token needs refresh (within 5 minutes of expiry)
 * @param {Object} instance - Instance data with token_expires_at
 * @returns {boolean} True if token needs refresh
 */
export function tokenNeedsRefresh(instance: Object): boolean;
/**
 * Marks an instance as requiring re-authentication
 * @param {string} instanceId - The instance ID
 * @param {string} reason - Reason for requiring re-auth
 * @returns {Promise<void>}
 */
export function markInstanceForReauth(instanceId: string, reason: string): Promise<void>;
/**
 * Gets service health statistics
 * @returns {Promise<Object>} Service health data
 */
export function getServiceHealthStats(): Promise<Object>;
export { createTokenAuditLog };
import { createTokenAuditLog } from '../../../db/queries/mcpInstancesQueries.js';
//# sourceMappingURL=database.d.ts.map