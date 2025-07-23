/**
 * Record token refresh metrics
 * @param {string} instanceId - Instance ID
 * @param {'oauth_service'|'direct_oauth'} method - Method used
 * @param {boolean} success - Whether refresh was successful
 * @param {number} startTime - Start timestamp
 * @param {number} endTime - End timestamp
 * @param {string} [errorType=''] - Error type if failed
 * @param {string} [errorMessage=''] - Error message if failed
 */
export function recordTokenRefreshMetrics(instanceId: string, method: "oauth_service" | "direct_oauth", success: boolean, startTime: number, endTime: number, errorType?: string, errorMessage?: string): void;
/**
 * Get metrics summary
 */
export function getTokenMetricsSummary(): {
    /**
     * - Overview stats
     */
    overview: {
        totalAttempts: number;
        totalSuccesses: number;
        totalFailures: number;
        successRate: string;
        directFallbackRate: string;
    };
    /**
     * - Performance stats
     */
    performance: {
        averageLatency: string;
        maxLatency: string;
        minLatency: string;
    };
    /**
     * - Error stats
     */
    errors: {
        invalidTokenErrors: number;
        serviceUnavailableErrors: number;
        networkErrors: number;
        errorsByType: {
            [x: string]: number;
        };
    };
    /**
     * - Uptime stats
     */
    uptime: {
        metricsStarted: string;
        uptimeHours: string;
    };
};
/**
 * Get instance-specific metrics
 * @param {string} instanceId - Instance ID
 * @returns {InstanceMetrics|null} Instance metrics
 */
export function getInstanceTokenMetrics(instanceId: string): {
    /**
     * - Instance ID
     */
    instanceId: string;
    /**
     * - Total attempts
     */
    totalAttempts: number;
    /**
     * - Total successes
     */
    totalSuccesses: number;
    /**
     * - Total failures
     */
    totalFailures: number;
    /**
     * - Success rate percentage
     */
    successRate: string;
    /**
     * - Average latency
     */
    averageLatency: string;
    /**
     * - Last attempt info
     */
    lastAttempt: {
        timestamp: number;
        method: string;
    } | null;
} | null;
/**
 * Get daily statistics
 * @param {number} [days=7] - Number of days to include
 * @returns {Record<string, DailyStats>} Daily statistics
 */
export function getDailyTokenStats(days?: number): Record<string, DailyStats>;
/**
 * Export all metrics
 */
export function exportTokenMetrics(): {
    /**
     * - Export timestamp
     */
    timestamp: number;
    /**
     * - Metrics summary
     */
    summary: {
        /**
         * - Overview stats
         */
        overview: {
            totalAttempts: number;
            totalSuccesses: number;
            totalFailures: number;
            successRate: string;
            directFallbackRate: string;
        };
        /**
         * - Performance stats
         */
        performance: {
            averageLatency: string;
            maxLatency: string;
            minLatency: string;
        };
        /**
         * - Error stats
         */
        errors: {
            invalidTokenErrors: number;
            serviceUnavailableErrors: number;
            networkErrors: number;
            errorsByType: {
                [x: string]: number;
            };
        };
        /**
         * - Uptime stats
         */
        uptime: {
            metricsStarted: string;
            uptimeHours: string;
        };
    };
    /**
     * - Daily statistics
     */
    dailyStats: {
        [x: string]: DailyStats;
    };
    /**
     * - All instance metrics
     */
    allInstanceMetrics: Array<{
        /**
         * - Instance ID
         */
        instanceId: string;
        /**
         * - Total attempts
         */
        totalAttempts: number;
        /**
         * - Total successes
         */
        totalSuccesses: number;
        /**
         * - Total failures
         */
        totalFailures: number;
        /**
         * - Success rate percentage
         */
        successRate: string;
        /**
         * - Average latency
         */
        averageLatency: string;
        /**
         * - Last attempt info
         */
        lastAttempt: {
            timestamp: number;
            method: string;
        } | null;
    }>;
    /**
     * - Raw metrics data
     */
    rawMetrics: MetricsData;
};
/**
 * Get health assessment
 */
export function getTokenSystemHealth(): {
    /**
     * - Overall health status
     */
    status: "healthy" | "degraded" | "unhealthy";
    /**
     * - Critical issues
     */
    issues: Array<string>;
    /**
     * - Warning messages
     */
    warnings: Array<string>;
    /**
     * - Metrics summary
     */
    summary: {
        /**
         * - Overview stats
         */
        overview: {
            totalAttempts: number;
            totalSuccesses: number;
            totalFailures: number;
            successRate: string;
            directFallbackRate: string;
        };
        /**
         * - Performance stats
         */
        performance: {
            averageLatency: string;
            maxLatency: string;
            minLatency: string;
        };
        /**
         * - Error stats
         */
        errors: {
            invalidTokenErrors: number;
            serviceUnavailableErrors: number;
            networkErrors: number;
            errorsByType: {
                [x: string]: number;
            };
        };
        /**
         * - Uptime stats
         */
        uptime: {
            metricsStarted: string;
            uptimeHours: string;
        };
    };
};
/**
 * Reset metrics (for testing)
 */
export function resetTokenMetrics(): void;
export default tokenMetrics;
/**
 * Token metrics data structure
 */
export type MetricsData = {
    /**
     * - Total refresh attempts
     */
    refreshAttempts: number;
    /**
     * - Successful refreshes
     */
    refreshSuccesses: number;
    /**
     * - Failed refreshes
     */
    refreshFailures: number;
    /**
     * - Direct OAuth fallbacks
     */
    directOAuthFallbacks: number;
    /**
     * - Service unavailable errors
     */
    serviceUnavailableErrors: number;
    /**
     * - Invalid token errors
     */
    invalidTokenErrors: number;
    /**
     * - Network errors
     */
    networkErrors: number;
    /**
     * - Total latency sum
     */
    totalLatency: number;
    /**
     * - Maximum latency
     */
    maxLatency: number;
    /**
     * - Minimum latency
     */
    minLatency: number;
    /**
     * - Last reset timestamp
     */
    lastReset: number;
    /**
     * - Errors by type
     */
    errorsByType: Record<string, number>;
    /**
     * - Daily statistics
     */
    dailyStats: Record<string, DailyStats>;
    /**
     * - Instance metrics
     */
    instanceMetrics: Record<string, InstanceMetric>;
};
/**
 * Daily statistics
 */
export type DailyStats = {
    /**
     * - Attempts count
     */
    attempts: number;
    /**
     * - Success count
     */
    successes: number;
    /**
     * - Failure count
     */
    failures: number;
    /**
     * - Direct fallback count
     */
    directFallbacks: number;
};
/**
 * Instance metric data
 */
export type InstanceMetric = {
    /**
     * - Attempts count
     */
    attempts: number;
    /**
     * - Success count
     */
    successes: number;
    /**
     * - Failure count
     */
    failures: number;
    /**
     * - Last attempt info
     */
    lastAttempt: {
        timestamp: number;
        method: string;
    } | null;
    /**
     * - Average latency
     */
    averageLatency: number;
};
declare const tokenMetrics: TokenMetrics;
/**
 * Token Refresh Metrics System
 * Tracks performance and reliability metrics for OAuth token operations
 */
/**
 * Token metrics data structure
 * @typedef {Object} MetricsData
 * @property {number} refreshAttempts - Total refresh attempts
 * @property {number} refreshSuccesses - Successful refreshes
 * @property {number} refreshFailures - Failed refreshes
 * @property {number} directOAuthFallbacks - Direct OAuth fallbacks
 * @property {number} serviceUnavailableErrors - Service unavailable errors
 * @property {number} invalidTokenErrors - Invalid token errors
 * @property {number} networkErrors - Network errors
 * @property {number} totalLatency - Total latency sum
 * @property {number} maxLatency - Maximum latency
 * @property {number} minLatency - Minimum latency
 * @property {number} lastReset - Last reset timestamp
 * @property {Record<string, number>} errorsByType - Errors by type
 * @property {Record<string, DailyStats>} dailyStats - Daily statistics
 * @property {Record<string, InstanceMetric>} instanceMetrics - Instance metrics
 */
/**
 * Daily statistics
 * @typedef {Object} DailyStats
 * @property {number} attempts - Attempts count
 * @property {number} successes - Success count
 * @property {number} failures - Failure count
 * @property {number} directFallbacks - Direct fallback count
 */
/**
 * Instance metric data
 * @typedef {Object} InstanceMetric
 * @property {number} attempts - Attempts count
 * @property {number} successes - Success count
 * @property {number} failures - Failure count
 * @property {{timestamp: number, method: string}|null} lastAttempt - Last attempt info
 * @property {number} averageLatency - Average latency
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
        errorsByType: Record<string, number>;
        dailyStats: Record<string, DailyStats>;
        instanceMetrics: Record<string, InstanceMetric>;
    };
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
     * Metrics summary structure
     * @typedef {Object} MetricsSummary
     * @property {{totalAttempts: number, totalSuccesses: number, totalFailures: number, successRate: string, directFallbackRate: string}} overview - Overview stats
     * @property {{averageLatency: string, maxLatency: string, minLatency: string}} performance - Performance stats
     * @property {{invalidTokenErrors: number, serviceUnavailableErrors: number, networkErrors: number, errorsByType: Object<string, number>}} errors - Error stats
     * @property {{metricsStarted: string, uptimeHours: string}} uptime - Uptime stats
     */
    /**
     * Get current metrics summary
     * @returns {MetricsSummary} Metrics summary
     */
    getMetricsSummary(): {
        /**
         * - Overview stats
         */
        overview: {
            totalAttempts: number;
            totalSuccesses: number;
            totalFailures: number;
            successRate: string;
            directFallbackRate: string;
        };
        /**
         * - Performance stats
         */
        performance: {
            averageLatency: string;
            maxLatency: string;
            minLatency: string;
        };
        /**
         * - Error stats
         */
        errors: {
            invalidTokenErrors: number;
            serviceUnavailableErrors: number;
            networkErrors: number;
            errorsByType: {
                [x: string]: number;
            };
        };
        /**
         * - Uptime stats
         */
        uptime: {
            metricsStarted: string;
            uptimeHours: string;
        };
    };
    /**
     * Instance metrics structure
     * @typedef {Object} InstanceMetrics
     * @property {string} instanceId - Instance ID
     * @property {number} totalAttempts - Total attempts
     * @property {number} totalSuccesses - Total successes
     * @property {number} totalFailures - Total failures
     * @property {string} successRate - Success rate percentage
     * @property {string} averageLatency - Average latency
     * @property {{timestamp: number, method: string}|null} lastAttempt - Last attempt info
     */
    /**
     * Get metrics for a specific instance
     * @param {string} instanceId - Instance ID
     * @returns {InstanceMetrics|null} Instance-specific metrics
     */
    getInstanceMetrics(instanceId: string): {
        /**
         * - Instance ID
         */
        instanceId: string;
        /**
         * - Total attempts
         */
        totalAttempts: number;
        /**
         * - Total successes
         */
        totalSuccesses: number;
        /**
         * - Total failures
         */
        totalFailures: number;
        /**
         * - Success rate percentage
         */
        successRate: string;
        /**
         * - Average latency
         */
        averageLatency: string;
        /**
         * - Last attempt info
         */
        lastAttempt: {
            timestamp: number;
            method: string;
        } | null;
    } | null;
    /**
     * Get daily statistics
     * @param {number} [days=7] - Number of days to include
     * @returns {Object<string, DailyStats>} Daily statistics
     */
    getDailyStats(days?: number): {
        [x: string]: DailyStats;
    };
    /**
     * Reset metrics (for testing or periodic reset)
     */
    reset(): void;
    /**
     * Exportable metrics structure
     * @typedef {Object} ExportableMetrics
     * @property {number} timestamp - Export timestamp
     * @property {MetricsSummary} summary - Metrics summary
     * @property {Object<string, DailyStats>} dailyStats - Daily statistics
     * @property {Array<InstanceMetrics>} allInstanceMetrics - All instance metrics
     * @property {MetricsData} rawMetrics - Raw metrics data
     */
    /**
     * Export metrics for external monitoring systems
     * @returns {ExportableMetrics} Exportable metrics
     */
    exportMetrics(): {
        /**
         * - Export timestamp
         */
        timestamp: number;
        /**
         * - Metrics summary
         */
        summary: {
            /**
             * - Overview stats
             */
            overview: {
                totalAttempts: number;
                totalSuccesses: number;
                totalFailures: number;
                successRate: string;
                directFallbackRate: string;
            };
            /**
             * - Performance stats
             */
            performance: {
                averageLatency: string;
                maxLatency: string;
                minLatency: string;
            };
            /**
             * - Error stats
             */
            errors: {
                invalidTokenErrors: number;
                serviceUnavailableErrors: number;
                networkErrors: number;
                errorsByType: {
                    [x: string]: number;
                };
            };
            /**
             * - Uptime stats
             */
            uptime: {
                metricsStarted: string;
                uptimeHours: string;
            };
        };
        /**
         * - Daily statistics
         */
        dailyStats: {
            [x: string]: DailyStats;
        };
        /**
         * - All instance metrics
         */
        allInstanceMetrics: Array<{
            /**
             * - Instance ID
             */
            instanceId: string;
            /**
             * - Total attempts
             */
            totalAttempts: number;
            /**
             * - Total successes
             */
            totalSuccesses: number;
            /**
             * - Total failures
             */
            totalFailures: number;
            /**
             * - Success rate percentage
             */
            successRate: string;
            /**
             * - Average latency
             */
            averageLatency: string;
            /**
             * - Last attempt info
             */
            lastAttempt: {
                timestamp: number;
                method: string;
            } | null;
        }>;
        /**
         * - Raw metrics data
         */
        rawMetrics: MetricsData;
    };
    /**
     * Health assessment structure
     * @typedef {Object} HealthAssessment
     * @property {'healthy'|'degraded'|'unhealthy'} status - Overall health status
     * @property {Array<string>} issues - Critical issues
     * @property {Array<string>} warnings - Warning messages
     * @property {MetricsSummary} summary - Metrics summary
     */
    /**
     * Check if metrics indicate system health issues
     * @returns {HealthAssessment} Health assessment
     */
    getHealthAssessment(): {
        /**
         * - Overall health status
         */
        status: "healthy" | "degraded" | "unhealthy";
        /**
         * - Critical issues
         */
        issues: Array<string>;
        /**
         * - Warning messages
         */
        warnings: Array<string>;
        /**
         * - Metrics summary
         */
        summary: {
            /**
             * - Overview stats
             */
            overview: {
                totalAttempts: number;
                totalSuccesses: number;
                totalFailures: number;
                successRate: string;
                directFallbackRate: string;
            };
            /**
             * - Performance stats
             */
            performance: {
                averageLatency: string;
                maxLatency: string;
                minLatency: string;
            };
            /**
             * - Error stats
             */
            errors: {
                invalidTokenErrors: number;
                serviceUnavailableErrors: number;
                networkErrors: number;
                errorsByType: {
                    [x: string]: number;
                };
            };
            /**
             * - Uptime stats
             */
            uptime: {
                metricsStarted: string;
                uptimeHours: string;
            };
        };
    };
}
//# sourceMappingURL=token-metrics.d.ts.map