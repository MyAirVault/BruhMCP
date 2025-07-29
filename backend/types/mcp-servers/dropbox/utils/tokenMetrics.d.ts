export type LastAttempt = {
    /**
     * - Timestamp of the last attempt
     */
    timestamp: number;
    /**
     * - Method used for the attempt
     */
    method: 'oauth_service' | 'direct_oauth';
};
export type InstanceMetric = {
    /**
     * - Total number of attempts
     */
    attempts: number;
    /**
     * - Number of successful attempts
     */
    successes: number;
    /**
     * - Number of failed attempts
     */
    failures: number;
    /**
     * - Details of the last attempt
     */
    lastAttempt: LastAttempt | null;
    /**
     * - Average latency in milliseconds
     */
    averageLatency: number;
};
export type DailyStats = {
    /**
     * - Number of attempts for the day
     */
    attempts: number;
    /**
     * - Number of successes for the day
     */
    successes: number;
    /**
     * - Number of failures for the day
     */
    failures: number;
    /**
     * - Number of direct fallbacks for the day
     */
    directFallbacks: number;
};
export type MetricsData = {
    /**
     * - Total refresh attempts
     */
    refreshAttempts: number;
    /**
     * - Total successful refreshes
     */
    refreshSuccesses: number;
    /**
     * - Total failed refreshes
     */
    refreshFailures: number;
    /**
     * - Direct OAuth fallback count
     */
    directOAuthFallbacks: number;
    /**
     * - Service unavailable error count
     */
    serviceUnavailableErrors: number;
    /**
     * - Invalid token error count
     */
    invalidTokenErrors: number;
    /**
     * - Network error count
     */
    networkErrors: number;
    /**
     * - Total latency across all requests
     */
    totalLatency: number;
    /**
     * - Maximum latency recorded
     */
    maxLatency: number;
    /**
     * - Minimum latency recorded
     */
    minLatency: number;
    /**
     * - Timestamp of last metrics reset
     */
    lastReset: number;
    /**
     * - Errors grouped by type
     */
    errorsByType: Record<string, number>;
    /**
     * - Daily statistics
     */
    dailyStats: Record<string, DailyStats>;
    /**
     * - Per-instance metrics
     */
    instanceMetrics: Record<string, InstanceMetric>;
};
export type MetricsOverview = {
    /**
     * - Total number of attempts
     */
    totalAttempts: number;
    /**
     * - Total number of successes
     */
    totalSuccesses: number;
    /**
     * - Total number of failures
     */
    totalFailures: number;
    /**
     * - Success rate as percentage string
     */
    successRate: string;
    /**
     * - Direct fallback rate as percentage string
     */
    directFallbackRate: string;
};
export type PerformanceMetrics = {
    /**
     * - Average latency as string with units
     */
    averageLatency: string;
    /**
     * - Maximum latency as string with units
     */
    maxLatency: string;
    /**
     * - Minimum latency as string with units
     */
    minLatency: string;
};
export type ErrorMetrics = {
    /**
     * - Count of invalid token errors
     */
    invalidTokenErrors: number;
    /**
     * - Count of service unavailable errors
     */
    serviceUnavailableErrors: number;
    /**
     * - Count of network errors
     */
    networkErrors: number;
    /**
     * - Errors grouped by type
     */
    errorsByType: Record<string, number>;
};
export type UptimeMetrics = {
    /**
     * - ISO string of when metrics started
     */
    metricsStarted: string;
    /**
     * - Uptime in hours as string
     */
    uptimeHours: string;
};
export type MetricsSummary = {
    /**
     * - Overview metrics
     */
    overview: MetricsOverview;
    /**
     * - Performance metrics
     */
    performance: PerformanceMetrics;
    /**
     * - Error metrics
     */
    errors: ErrorMetrics;
    /**
     * - Uptime metrics
     */
    uptime: UptimeMetrics;
};
export type InstanceMetricsResult = {
    /**
     * - Instance identifier
     */
    instanceId: string;
    /**
     * - Total attempts for this instance
     */
    totalAttempts: number;
    /**
     * - Total successes for this instance
     */
    totalSuccesses: number;
    /**
     * - Total failures for this instance
     */
    totalFailures: number;
    /**
     * - Success rate as percentage string
     */
    successRate: string;
    /**
     * - Average latency as string with units
     */
    averageLatency: string;
    /**
     * - Details of the last attempt
     */
    lastAttempt: LastAttempt | null;
};
export type HealthAssessment = {
    /**
     * - Overall health status
     */
    status: 'healthy' | 'degraded' | 'unhealthy';
    /**
     * - List of critical issues
     */
    issues: string[];
    /**
     * - List of warnings
     */
    warnings: string[];
    /**
     * - Current metrics summary
     */
    summary: MetricsSummary;
};
export type ExportedMetrics = {
    /**
     * - Export timestamp
     */
    timestamp: number;
    /**
     * - Metrics summary
     */
    summary: MetricsSummary;
    /**
     * - Daily statistics
     */
    dailyStats: Record<string, DailyStats>;
    /**
     * - All instance metrics
     */
    allInstanceMetrics: InstanceMetricsResult[];
    /**
     * - Raw metrics data
     */
    rawMetrics: MetricsData;
};
/**
 * Record token refresh metrics
 * @param {string} instanceId - Instance ID
 * @param {'oauth_service' | 'direct_oauth'} method - Method used
 * @param {boolean} success - Whether refresh was successful
 * @param {string | null} errorType - Error type if failed
 * @param {string | null} errorMessage - Error message if failed
 * @param {number} startTime - Start timestamp
 * @param {number} endTime - End timestamp
 */
export function recordTokenRefreshMetrics(instanceId: string, method: 'oauth_service' | 'direct_oauth', success: boolean, errorType: string | null, errorMessage: string | null, startTime: number, endTime: number): void;
/**
 * Get metrics summary
 * @returns {MetricsSummary} Current metrics summary
 */
export function getTokenMetricsSummary(): MetricsSummary;
/**
 * Get instance-specific metrics
 * @param {string} instanceId - Instance ID to get metrics for
 * @returns {InstanceMetricsResult} Instance-specific metrics
 */
export function getInstanceTokenMetrics(instanceId: string): InstanceMetricsResult;
/**
 * Get daily statistics
 * @param {number} [days] - Number of days to include (default: 7)
 * @returns {Record<string, DailyStats>} Daily statistics
 */
export function getDailyTokenStats(days?: number | undefined): Record<string, DailyStats>;
/**
 * Export all metrics
 * @returns {ExportedMetrics} All metrics data for export
 */
export function exportTokenMetrics(): ExportedMetrics;
/**
 * Get health assessment
 * @returns {HealthAssessment} System health assessment
 */
export function getTokenSystemHealth(): HealthAssessment;
/**
 * Reset metrics (for testing)
 * @returns {void}
 */
export function resetTokenMetrics(): void;
/** @type {TokenMetrics} */
export const tokenMetrics: TokenMetrics;
/**
 * Token Refresh Metrics System for Dropbox
 * Tracks performance and reliability metrics for OAuth token operations
 */
/**
 * @typedef {Object} LastAttempt
 * @property {number} timestamp - Timestamp of the last attempt
 * @property {'oauth_service' | 'direct_oauth'} method - Method used for the attempt
 */
/**
 * @typedef {Object} InstanceMetric
 * @property {number} attempts - Total number of attempts
 * @property {number} successes - Number of successful attempts
 * @property {number} failures - Number of failed attempts
 * @property {LastAttempt | null} lastAttempt - Details of the last attempt
 * @property {number} averageLatency - Average latency in milliseconds
 */
/**
 * @typedef {Object} DailyStats
 * @property {number} attempts - Number of attempts for the day
 * @property {number} successes - Number of successes for the day
 * @property {number} failures - Number of failures for the day
 * @property {number} directFallbacks - Number of direct fallbacks for the day
 */
/**
 * @typedef {Object} MetricsData
 * @property {number} refreshAttempts - Total refresh attempts
 * @property {number} refreshSuccesses - Total successful refreshes
 * @property {number} refreshFailures - Total failed refreshes
 * @property {number} directOAuthFallbacks - Direct OAuth fallback count
 * @property {number} serviceUnavailableErrors - Service unavailable error count
 * @property {number} invalidTokenErrors - Invalid token error count
 * @property {number} networkErrors - Network error count
 * @property {number} totalLatency - Total latency across all requests
 * @property {number} maxLatency - Maximum latency recorded
 * @property {number} minLatency - Minimum latency recorded
 * @property {number} lastReset - Timestamp of last metrics reset
 * @property {Record<string, number>} errorsByType - Errors grouped by type
 * @property {Record<string, DailyStats>} dailyStats - Daily statistics
 * @property {Record<string, InstanceMetric>} instanceMetrics - Per-instance metrics
 */
/**
 * @typedef {Object} MetricsOverview
 * @property {number} totalAttempts - Total number of attempts
 * @property {number} totalSuccesses - Total number of successes
 * @property {number} totalFailures - Total number of failures
 * @property {string} successRate - Success rate as percentage string
 * @property {string} directFallbackRate - Direct fallback rate as percentage string
 */
/**
 * @typedef {Object} PerformanceMetrics
 * @property {string} averageLatency - Average latency as string with units
 * @property {string} maxLatency - Maximum latency as string with units
 * @property {string} minLatency - Minimum latency as string with units
 */
/**
 * @typedef {Object} ErrorMetrics
 * @property {number} invalidTokenErrors - Count of invalid token errors
 * @property {number} serviceUnavailableErrors - Count of service unavailable errors
 * @property {number} networkErrors - Count of network errors
 * @property {Record<string, number>} errorsByType - Errors grouped by type
 */
/**
 * @typedef {Object} UptimeMetrics
 * @property {string} metricsStarted - ISO string of when metrics started
 * @property {string} uptimeHours - Uptime in hours as string
 */
/**
 * @typedef {Object} MetricsSummary
 * @property {MetricsOverview} overview - Overview metrics
 * @property {PerformanceMetrics} performance - Performance metrics
 * @property {ErrorMetrics} errors - Error metrics
 * @property {UptimeMetrics} uptime - Uptime metrics
 */
/**
 * @typedef {Object} InstanceMetricsResult
 * @property {string} instanceId - Instance identifier
 * @property {number} totalAttempts - Total attempts for this instance
 * @property {number} totalSuccesses - Total successes for this instance
 * @property {number} totalFailures - Total failures for this instance
 * @property {string} successRate - Success rate as percentage string
 * @property {string} averageLatency - Average latency as string with units
 * @property {LastAttempt | null} lastAttempt - Details of the last attempt
 */
/**
 * @typedef {Object} HealthAssessment
 * @property {'healthy' | 'degraded' | 'unhealthy'} status - Overall health status
 * @property {string[]} issues - List of critical issues
 * @property {string[]} warnings - List of warnings
 * @property {MetricsSummary} summary - Current metrics summary
 */
/**
 * @typedef {Object} ExportedMetrics
 * @property {number} timestamp - Export timestamp
 * @property {MetricsSummary} summary - Metrics summary
 * @property {Record<string, DailyStats>} dailyStats - Daily statistics
 * @property {InstanceMetricsResult[]} allInstanceMetrics - All instance metrics
 * @property {MetricsData} rawMetrics - Raw metrics data
 */
/**
 * Metrics storage and management
 */
declare class TokenMetrics {
    /** @type {MetricsData} */
    metrics: MetricsData;
    /**
     * Record a token refresh attempt
     * @param {string} instanceId - Instance ID
     * @param {'oauth_service' | 'direct_oauth'} method - Method used
     * @param {number} startTime - Start timestamp
     */
    recordRefreshAttempt(instanceId: string, method: 'oauth_service' | 'direct_oauth', startTime: number): void;
    /**
     * Record a successful token refresh
     * @param {string} instanceId - Instance ID
     * @param {'oauth_service' | 'direct_oauth'} method - Method used
     * @param {number} startTime - Start timestamp
     * @param {number} endTime - End timestamp
     */
    recordRefreshSuccess(instanceId: string, method: 'oauth_service' | 'direct_oauth', startTime: number, endTime: number): void;
    /**
     * Record a failed token refresh
     * @param {string} instanceId - Instance ID
     * @param {'oauth_service' | 'direct_oauth'} method - Method used
     * @param {string} errorType - Type of error
     * @param {string} errorMessage - Error message
     * @param {number} startTime - Start timestamp
     * @param {number} endTime - End timestamp
     */
    recordRefreshFailure(instanceId: string, method: 'oauth_service' | 'direct_oauth', errorType: string, errorMessage: string, startTime: number, endTime: number): void;
    /**
     * Get current metrics summary
     * @returns {MetricsSummary} Metrics summary
     */
    getMetricsSummary(): MetricsSummary;
    /**
     * Get metrics for a specific instance
     * @param {string} instanceId - Instance ID
     * @returns {InstanceMetricsResult} Instance-specific metrics
     */
    getInstanceMetrics(instanceId: string): InstanceMetricsResult;
    /**
     * Get daily statistics
     * @param {number} days - Number of days to include (default: 7)
     * @returns {Record<string, DailyStats>} Daily statistics
     */
    getDailyStats(days?: number): Record<string, DailyStats>;
    /**
     * Reset metrics (for testing or periodic reset)
     */
    reset(): void;
    /**
     * Export metrics for external monitoring systems
     * @returns {ExportedMetrics} Exportable metrics
     */
    exportMetrics(): ExportedMetrics;
    /**
     * Check if metrics indicate system health issues
     * @returns {HealthAssessment} Health assessment
     */
    getHealthAssessment(): HealthAssessment;
}
export {};
//# sourceMappingURL=tokenMetrics.d.ts.map