/**
 * Record token refresh metrics
 * @param {string} instanceId - Instance ID
 * @param {string} method - Refresh method ('oauth_service' or 'direct_oauth')
 * @param {boolean} success - Whether refresh was successful
 * @param {string} errorType - Error type if failed
 * @param {string} _errorMessage - Error message if failed (unused)
 * @param {number} startTime - Start timestamp
 * @param {number} endTime - End timestamp
 */
export function recordTokenRefreshMetrics(instanceId: string, method: string, success: boolean, errorType: string, _errorMessage: string, startTime: number, endTime: number): void;
/**
 * Get current token metrics
 * @returns {Object} Current metrics
 */
export function getTokenMetrics(): Object;
/**
 * Reset token metrics
 */
export function resetTokenMetrics(): void;
/**
 * Get metrics summary for monitoring
 * @returns {Object} Metrics summary
 */
export function getMetricsSummary(): Object;
/**
 * Check if metrics indicate healthy token refresh performance
 * @returns {boolean} True if performance is healthy
 */
export function isTokenRefreshHealthy(): boolean;
/**
 * Log periodic metrics summary
 */
export function logMetricsSummary(): void;
/**
 * Start periodic metrics logging
 * @param {number} intervalMinutes - Interval in minutes
 * @returns {Object} Controller with stop method
 */
export function startMetricsLogging(intervalMinutes?: number): Object;
//# sourceMappingURL=tokenMetrics.d.ts.map