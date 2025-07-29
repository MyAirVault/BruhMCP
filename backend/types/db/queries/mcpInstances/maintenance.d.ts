export type InstanceStatusRecord = import('./types.js').InstanceStatusRecord;
/**
 * @typedef {import('./types.js').InstanceStatusRecord} InstanceStatusRecord
 */
/**
 * Get instances by status (for background maintenance)
 * @param {string} status - Status to filter by
 * @returns {Promise<InstanceStatusRecord[]>} Array of instances with the specified status
 */
export function getInstancesByStatus(status: string): Promise<InstanceStatusRecord[]>;
/**
 * Get expired instances (for background cleanup)
 * @returns {Promise<InstanceStatusRecord[]>} Array of expired instances
 */
export function getExpiredInstances(): Promise<InstanceStatusRecord[]>;
/**
 * Get failed OAuth instances (for background cleanup)
 * @returns {Promise<InstanceStatusRecord[]>} Array of instances with failed OAuth status
 */
export function getFailedOAuthInstances(): Promise<InstanceStatusRecord[]>;
/**
 * Get pending OAuth instances older than specified minutes (for background cleanup)
 * @param {number} [minutesOld=5] - Minutes threshold (default: 5)
 * @returns {Promise<InstanceStatusRecord[]>} Array of instances with pending OAuth status older than threshold
 */
export function getPendingOAuthInstances(minutesOld?: number | undefined): Promise<InstanceStatusRecord[]>;
/**
 * Bulk update expired instances to expired status
 * @param {string[]} instanceIds - Array of instance IDs to mark as expired
 * @returns {Promise<number>} Number of instances updated
 */
export function bulkMarkInstancesExpired(instanceIds: string[]): Promise<number>;
//# sourceMappingURL=maintenance.d.ts.map