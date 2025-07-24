/**
 * Record token refresh metrics
 * @param {string} instanceId - Instance ID
 * @param {string} method - Refresh method used
 * @param {boolean} success - Whether refresh succeeded
 * @param {string|null} errorType - Error type if failed
 * @param {string|null} errorMessage - Error message if failed
 * @param {number} startTime - Operation start time
 * @param {number} endTime - Operation end time
 */
export function recordTokenRefreshMetrics(instanceId: string, method: string, success: boolean, errorType: string | null, errorMessage: string | null, startTime: number, endTime: number): void;
/**
 * Get token refresh metrics for an instance
 * @param {string} instanceId - Instance ID
 * @returns {Object|null} Metrics or null if not found
 */
export function getTokenRefreshMetrics(instanceId: string): Object | null;
/**
 * Get all token refresh metrics
 * @returns {Object} All metrics by instance
 */
export function getAllTokenRefreshMetrics(): Object;
/**
 * Clear metrics for an instance
 * @param {string} instanceId - Instance ID
 * @returns {boolean} Whether metrics were cleared
 */
export function clearTokenRefreshMetrics(instanceId: string): boolean;
/**
 * Get aggregated metrics summary
 * @returns {Object} Aggregated metrics
 */
export function getMetricsSummary(): Object;
//# sourceMappingURL=tokenMetrics.d.ts.map