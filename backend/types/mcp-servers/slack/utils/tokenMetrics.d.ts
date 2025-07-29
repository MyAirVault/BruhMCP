export type MetricsOverview = {
    /**
     * - Success rate percentage
     */
    successRate: string;
    /**
     * - Direct fallback rate percentage
     */
    directFallbackRate: string;
};
export type MetricsPerformance = {
    /**
     * - Average latency string
     */
    averageLatency: string;
    /**
     * - Maximum latency string
     */
    maxLatency: string;
};
export type MetricsSummary = {
    /**
     * - Overview metrics
     */
    overview: MetricsOverview;
    /**
     * - Performance metrics
     */
    performance: MetricsPerformance;
};
export type InstanceMetric = {
    /**
     * - Number of attempts
     */
    attempts: number;
    /**
     * - Number of successes
     */
    successes: number;
    /**
     * - Number of failures
     */
    failures: number;
    /**
     * - Last attempt data
     */
    lastAttempt: Object | null;
    /**
     * - Average latency
     */
    averageLatency: number;
};
export type DailyStat = {
    /**
     * - Daily attempts
     */
    attempts: number;
    /**
     * - Daily successes
     */
    successes: number;
    /**
     * - Daily failures
     */
    failures: number;
    /**
     * - Daily direct fallbacks
     */
    directFallbacks: number;
};
/**
 * Record token refresh metrics
 * @param {string} instanceId - Instance ID
 * @param {string} method - Method used
 * @param {boolean} success - Whether refresh was successful
 * @param {string} errorType - Error type if failed
 * @param {string} errorMessage - Error message if failed
 * @param {number} startTime - Start timestamp
 * @param {number} endTime - End timestamp
 */
export function recordTokenRefreshMetrics(instanceId: string, method: string, success: boolean, errorType: string, errorMessage: string, startTime: number, endTime: number): void;
/**
 * Get metrics summary
 */
export function getTokenMetricsSummary(): Object;
/**
 * Get instance-specific metrics
 * @param {string} instanceId - Instance ID
 */
export function getInstanceTokenMetrics(instanceId: string): Object | null;
/**
 * Get daily statistics
 * @param {number} days - Number of days
 */
export function getDailyTokenStats(days: number): Object;
/**
 * Export all metrics
 */
export function exportTokenMetrics(): Object;
/**
 * Get health assessment
 */
export function getTokenSystemHealth(): Object;
/**
 * Reset metrics (for testing)
 */
export function resetTokenMetrics(): void;
/**
 * Get aggregated token metrics (alias for exportTokenMetrics)
 * @returns {Object} Aggregated metrics data
 */
export function getAggregatedTokenMetrics(): Object;
//# sourceMappingURL=tokenMetrics.d.ts.map