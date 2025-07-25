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
export default tokenMetrics;
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
};
declare const tokenMetrics: TokenMetrics;
/**
 * Token Refresh Metrics System for Slack MCP
 * Tracks performance and reliability metrics for OAuth token operations
 */
/**
 * @typedef {Object} MetricsOverview
 * @property {string} successRate - Success rate percentage
 * @property {string} directFallbackRate - Direct fallback rate percentage
 */
/**
 * @typedef {Object} MetricsPerformance
 * @property {string} averageLatency - Average latency string
 * @property {string} maxLatency - Maximum latency string
 */
/**
 * @typedef {Object} MetricsSummary
 * @property {MetricsOverview} overview - Overview metrics
 * @property {MetricsPerformance} performance - Performance metrics
 */
/**
 * @typedef {Object} InstanceMetric
 * @property {number} attempts - Number of attempts
 * @property {number} successes - Number of successes
 * @property {number} failures - Number of failures
 * @property {Object|null} lastAttempt - Last attempt data
 * @property {number} averageLatency - Average latency
 */
/**
 * @typedef {Object} DailyStat
 * @property {number} attempts - Daily attempts
 * @property {number} successes - Daily successes
 * @property {number} failures - Daily failures
 */
/**
 * Metrics storage and management
 */
declare class TokenMetrics {
    metrics: {
        refreshAttempts: number;
        refreshSuccesses: number;
        refreshFailures: number;
        directOAuthFallbacks: number;
        serviceUnavailableErrors: number;
        invalidTokenErrors: number;
        networkErrors: number;
        totalLatency: number;
        maxLatency: number;
        minLatency: number;
        lastReset: number;
        errorsByType: {
            [x: string]: number;
        };
        dailyStats: {
            [x: string]: DailyStat;
        };
        instanceMetrics: {
            [x: string]: InstanceMetric;
        };
    };
    /**
     * Record a token refresh attempt
     * @param {string} instanceId - Instance ID
     * @param {string} method - Method used ('oauth_service' | 'direct_oauth')
     * @param {number} startTime - Start timestamp
     */
    recordRefreshAttempt(instanceId: string, method: string, startTime: number): void;
    /**
     * Record a successful token refresh
     * @param {string} instanceId - Instance ID
     * @param {string} method - Method used
     * @param {number} startTime - Start timestamp
     * @param {number} endTime - End timestamp
     */
    recordRefreshSuccess(instanceId: string, method: string, startTime: number, endTime: number): void;
    /**
     * Record a failed token refresh
     * @param {string} instanceId - Instance ID
     * @param {string} method - Method used
     * @param {string} errorType - Type of error
     * @param {string} errorMessage - Error message
     * @param {number} startTime - Start timestamp
     * @param {number} endTime - End timestamp
     */
    recordRefreshFailure(instanceId: string, method: string, errorType: string, errorMessage: string, startTime: number, endTime: number): void;
    /**
     * Get current metrics summary
     * @returns {Object} Metrics summary
     */
    getMetricsSummary(): Object;
    /**
     * Get metrics for a specific instance
     * @param {string} instanceId - Instance ID
     * @returns {Object|null} Instance-specific metrics
     */
    getInstanceMetrics(instanceId: string): Object | null;
    /**
     * Get daily statistics
     * @param {number} days - Number of days to include (default: 7)
     * @returns {Object} Daily statistics
     */
    getDailyStats(days?: number): Object;
    /**
     * Reset metrics (for testing or periodic reset)
     */
    reset(): void;
    /**
     * Export metrics for external monitoring systems
     * @returns {Object} Exportable metrics
     */
    exportMetrics(): Object;
    /**
     * Check if metrics indicate system health issues
     * @returns {Object} Health assessment
     */
    getHealthAssessment(): Object;
}
//# sourceMappingURL=tokenMetrics.d.ts.map