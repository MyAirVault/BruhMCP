/**
 * Record token refresh metrics
 * @param {string} instanceId - Instance ID
 * @param {string} method - Method used for refresh (oauth_service, direct_oauth)
 * @param {boolean} success - Whether the refresh was successful
 * @param {string} errorType - Type of error if failed
 * @param {string} errorMessage - Error message if failed
 * @param {number} startTime - Start timestamp
 * @param {number} endTime - End timestamp
 */
export function recordTokenRefreshMetrics(instanceId: string, method: string, success: boolean, errorType: string, errorMessage: string, startTime: number, endTime: number): void;
/**
 * Get token refresh metrics for an instance
 * @param {string} instanceId - Instance ID
 * @returns {Array} Array of metrics
 */
export function getTokenRefreshMetrics(instanceId: string): any[];
/**
 * Get aggregated token refresh statistics
 * @param {string} instanceId - Instance ID (optional)
 * @returns {Object} Aggregated statistics
 */
export function getTokenRefreshStats(instanceId?: string): Object;
/**
 * Clear all metrics (for testing)
 */
export function clearAllMetrics(): void;
/**
 * Export metrics for external monitoring systems
 * @returns {Array} All metrics
 */
export function exportMetrics(): any[];
//# sourceMappingURL=token-metrics.d.ts.map