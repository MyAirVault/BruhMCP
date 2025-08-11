export type InstanceMetric = {
    attempts: number;
    successes: number;
    failures: number;
    lastAttempt: LastAttempt | null;
    averageLatency: number;
};
export type LastAttempt = {
    timestamp: number;
    method: string;
};
export type DailyStat = {
    attempts: number;
    successes: number;
    failures: number;
    directFallbacks: number;
};
export type MetricsData = {
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
    errorsByType: Record<string, number>;
    dailyStats: Record<string, DailyStat>;
    instanceMetrics: Record<string, InstanceMetric>;
};
export type MetricsSummary = {
    overview: {
        totalAttempts: number;
        totalSuccesses: number;
        totalFailures: number;
        successRate: string;
        directFallbackRate: string;
    };
    performance: {
        averageLatency: string;
        maxLatency: string;
        minLatency: string;
    };
    errors: {
        invalidTokenErrors: number;
        serviceUnavailableErrors: number;
        networkErrors: number;
        errorsByType: Record<string, number>;
    };
    uptime: {
        metricsStarted: string;
        uptimeHours: string;
    };
};
export type InstanceMetricResult = {
    instanceId: string;
    totalAttempts: number;
    totalSuccesses: number;
    totalFailures: number;
    successRate: string;
    averageLatency: string;
    lastAttempt: LastAttempt | null;
};
export type HealthAssessment = {
    status: string;
    issues: string[];
    warnings: string[];
    summary: MetricsSummary;
};
export type ExportedMetrics = {
    timestamp: number;
    summary: MetricsSummary;
    dailyStats: Record<string, DailyStat>;
    allInstanceMetrics: InstanceMetricResult[];
    rawMetrics: MetricsData;
};
/**
 * Record token refresh metrics
 * @param {string} instanceId - Instance ID
 * @param {'oauth_service'|'direct_oauth'} method - Method used
 * @param {boolean} success - Whether refresh was successful
 * @param {string} errorType - Error type if failed
 * @param {string} errorMessage - Error message if failed
 * @param {number} startTime - Start timestamp
 * @param {number} endTime - End timestamp
 */
export function recordTokenRefreshMetrics(instanceId: string, method: "oauth_service" | "direct_oauth", success: boolean, errorType: string, errorMessage: string, startTime: number, endTime: number): void;
/**
 * Get metrics summary
 * @returns {MetricsSummary}
 */
export function getTokenMetricsSummary(): MetricsSummary;
/**
 * Get instance-specific metrics
 * @param {string} instanceId
 * @returns {InstanceMetricResult|null}
 */
export function getInstanceTokenMetrics(instanceId: string): InstanceMetricResult | null;
/**
 * Get daily statistics
 * @param {number} [days] - Number of days to include
 * @returns {Record<string, DailyStat>}
 */
export function getDailyTokenStats(days?: number): Record<string, DailyStat>;
/**
 * Export all metrics
 * @returns {ExportedMetrics}
 */
export function exportTokenMetrics(): ExportedMetrics;
/**
 * Get health assessment
 * @returns {HealthAssessment}
 */
export function getTokenSystemHealth(): HealthAssessment;
/**
 * Reset metrics (for testing)
 * @returns {void}
 */
export function resetTokenMetrics(): void;
export const tokenMetrics: TokenMetrics;
/**
 * Token Refresh Metrics System
 * Tracks performance and reliability metrics for OAuth token operations
 */
/**
 * @typedef {Object} InstanceMetric
 * @property {number} attempts
 * @property {number} successes
 * @property {number} failures
 * @property {LastAttempt|null} lastAttempt
 * @property {number} averageLatency
 */
/**
 * @typedef {Object} LastAttempt
 * @property {number} timestamp
 * @property {string} method
 */
/**
 * @typedef {Object} DailyStat
 * @property {number} attempts
 * @property {number} successes
 * @property {number} failures
 * @property {number} directFallbacks
 */
/**
 * @typedef {Object} MetricsData
 * @property {number} refreshAttempts
 * @property {number} refreshSuccesses
 * @property {number} refreshFailures
 * @property {number} directOAuthFallbacks
 * @property {number} serviceUnavailableErrors
 * @property {number} invalidTokenErrors
 * @property {number} networkErrors
 * @property {number} totalLatency
 * @property {number} maxLatency
 * @property {number} minLatency
 * @property {number} lastReset
 * @property {Record<string, number>} errorsByType
 * @property {Record<string, DailyStat>} dailyStats
 * @property {Record<string, InstanceMetric>} instanceMetrics
 */
/**
 * @typedef {Object} MetricsSummary
 * @property {Object} overview
 * @property {number} overview.totalAttempts
 * @property {number} overview.totalSuccesses
 * @property {number} overview.totalFailures
 * @property {string} overview.successRate
 * @property {string} overview.directFallbackRate
 * @property {Object} performance
 * @property {string} performance.averageLatency
 * @property {string} performance.maxLatency
 * @property {string} performance.minLatency
 * @property {Object} errors
 * @property {number} errors.invalidTokenErrors
 * @property {number} errors.serviceUnavailableErrors
 * @property {number} errors.networkErrors
 * @property {Record<string, number>} errors.errorsByType
 * @property {Object} uptime
 * @property {string} uptime.metricsStarted
 * @property {string} uptime.uptimeHours
 */
/**
 * @typedef {Object} InstanceMetricResult
 * @property {string} instanceId
 * @property {number} totalAttempts
 * @property {number} totalSuccesses
 * @property {number} totalFailures
 * @property {string} successRate
 * @property {string} averageLatency
 * @property {LastAttempt|null} lastAttempt
 */
/**
 * @typedef {Object} HealthAssessment
 * @property {string} status
 * @property {string[]} issues
 * @property {string[]} warnings
 * @property {MetricsSummary} summary
 */
/**
 * @typedef {Object} ExportedMetrics
 * @property {number} timestamp
 * @property {MetricsSummary} summary
 * @property {Record<string, DailyStat>} dailyStats
 * @property {InstanceMetricResult[]} allInstanceMetrics
 * @property {MetricsData} rawMetrics
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
     * @param {'oauth_service'|'direct_oauth'} method - Method used
     * @param {number} startTime - Start timestamp
     */
    recordRefreshAttempt(instanceId: string, method: "oauth_service" | "direct_oauth", startTime: number): void;
    /**
     * Record a successful token refresh
     * @param {string} instanceId - Instance ID
     * @param {'oauth_service'|'direct_oauth'} method - Method used
     * @param {number} startTime - Start timestamp
     * @param {number} endTime - End timestamp
     */
    recordRefreshSuccess(instanceId: string, method: "oauth_service" | "direct_oauth", startTime: number, endTime: number): void;
    /**
     * Record a failed token refresh
     * @param {string} instanceId - Instance ID
     * @param {'oauth_service'|'direct_oauth'} method - Method used
     * @param {string} errorType - Type of error
     * @param {string} errorMessage - Error message
     * @param {number} startTime - Start timestamp
     * @param {number} endTime - End timestamp
     */
    recordRefreshFailure(instanceId: string, method: "oauth_service" | "direct_oauth", errorType: string, errorMessage: string, startTime: number, endTime: number): void;
    /**
     * Get current metrics summary
     * @returns {MetricsSummary} Metrics summary
     */
    getMetricsSummary(): MetricsSummary;
    /**
     * Get metrics for a specific instance
     * @param {string} instanceId - Instance ID
     * @returns {InstanceMetricResult|null} Instance-specific metrics
     */
    getInstanceMetrics(instanceId: string): InstanceMetricResult | null;
    /**
     * Get daily statistics
     * @param {number} days - Number of days to include (default: 7)
     * @returns {Record<string, DailyStat>} Daily statistics
     */
    getDailyStats(days?: number): Record<string, DailyStat>;
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