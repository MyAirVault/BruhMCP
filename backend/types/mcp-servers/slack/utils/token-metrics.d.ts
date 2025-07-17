/**
 * Initialize token metrics system
 */
export function initializeTokenMetrics(): void;
/**
 * Record token refresh metrics
 * @param {string} instanceId - Instance ID
 * @param {string} method - Refresh method used (oauth_service, direct_oauth)
 * @param {boolean} success - Whether refresh was successful
 * @param {string} errorType - Error type if failed
 * @param {string} errorMessage - Error message if failed
 * @param {number} startTime - Start timestamp
 * @param {number} endTime - End timestamp
 */
export function recordTokenRefreshMetrics(instanceId: string, method: string, success: boolean, errorType: string, errorMessage: string, startTime: number, endTime: number): void;
/**
 * Get token metrics for a specific instance
 * @param {string} instanceId - Instance ID
 * @returns {Object|null} Token metrics or null if not found
 */
export function getTokenMetrics(instanceId: string): Object | null;
/**
 * Get aggregated token metrics across all instances
 * @returns {Object} Aggregated metrics
 */
export function getAggregatedTokenMetrics(): Object;
/**
 * Get token metrics for instances with recent failures
 * @param {number} hoursBack - Hours to look back for failures
 * @returns {Array} Array of instances with recent failures
 */
export function getInstancesWithRecentFailures(hoursBack?: number): any[];
/**
 * Reset metrics for a specific instance
 * @param {string} instanceId - Instance ID
 */
export function resetInstanceMetrics(instanceId: string): void;
/**
 * Clear all token metrics
 */
export function clearAllTokenMetrics(): void;
/**
 * Get performance insights based on metrics
 * @returns {Object} Performance insights
 */
export function getPerformanceInsights(): Object;
/**
 * Export metrics data for external monitoring
 * @returns {Object} Exportable metrics data
 */
export function exportMetricsData(): Object;
//# sourceMappingURL=token-metrics.d.ts.map