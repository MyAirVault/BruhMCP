/**
 * Deletion audit utilities for MCP instance deletion
 * Provides logging and monitoring capabilities for deletion operations
 */
/**
 * Log deletion attempt for audit trail
 * @param {Object} deletionEvent - Deletion event details
 * @param {string} deletionEvent.instanceId - Instance ID being deleted
 * @param {string} deletionEvent.userId - User performing deletion
 * @param {string} deletionEvent.serviceName - Service name (figma, github, etc.)
 * @param {string} deletionEvent.customName - Custom instance name
 * @param {string} deletionEvent.status - Deletion status (started, completed, failed)
 * @param {string} [deletionEvent.error] - Error message if deletion failed
 */
export function logDeletionEvent(deletionEvent: {
    instanceId: string;
    userId: string;
    serviceName: string;
    customName: string;
    status: string;
    error?: string | undefined;
}): void;
/**
 * Track deletion performance metrics
 * @param {Object} metrics - Performance metrics
 * @param {string} metrics.instanceId - Instance ID
 * @param {number} metrics.databaseDuration - Database operation duration in ms
 * @param {number} metrics.cacheDuration - Cache cleanup duration in ms
 * @param {number} metrics.totalDuration - Total deletion duration in ms
 * @param {boolean} metrics.cacheCleanupSuccess - Whether cache cleanup succeeded
 */
export function trackDeletionMetrics(metrics: {
    instanceId: string;
    databaseDuration: number;
    cacheDuration: number;
    totalDuration: number;
    cacheCleanupSuccess: boolean;
}): void;
/**
 * Validate deletion request before processing
 * @param {Object} request - Deletion request
 * @param {string} request.instanceId - Instance ID to delete
 * @param {string} request.userId - User requesting deletion
 * @returns {Object} Validation result
 */
export function validateDeletionRequest(request: {
    instanceId: string;
    userId: string;
}): Object;
/**
 * Generate deletion summary for response
 * @param {Object} deletionResult - Deletion operation result
 * @param {string} deletionResult.instanceId - Deleted instance ID
 * @param {string} deletionResult.serviceName - Service name
 * @param {string} deletionResult.customName - Instance custom name
 * @param {boolean} deletionResult.databaseSuccess - Database deletion success
 * @param {boolean} deletionResult.cacheSuccess - Cache cleanup success
 * @param {number} deletionResult.duration - Total operation duration
 * @returns {Object} Formatted deletion summary
 */
export function generateDeletionSummary(deletionResult: {
    instanceId: string;
    serviceName: string;
    customName: string;
    databaseSuccess: boolean;
    cacheSuccess: boolean;
    duration: number;
}): Object;
/**
 * Check if instance deletion should be allowed
 * @param {Object} instance - Instance details
 * @param {string} instance.status - Current instance status
 * @param {string} instance.last_used_at - Last usage timestamp
 * @param {number} instance.usage_count - Total usage count
 * @returns {Object} Deletion permission result
 */
export function checkDeletionPermission(instance: {
    status: string;
    last_used_at: string;
    usage_count: number;
}): Object;
/**
 * Format deletion error for user-friendly response
 * @param {Error} error - Error that occurred during deletion
 * @param {string} instanceId - Instance ID that failed to delete
 * @returns {Object} Formatted error response
 */
export function formatDeletionError(error: Error, instanceId: string): Object;
//# sourceMappingURL=deletionAudit.d.ts.map