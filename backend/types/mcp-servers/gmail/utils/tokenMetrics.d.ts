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
export function recordTokenRefreshMetrics(instanceId: string, method: 'oauth_service' | 'direct_oauth', success: boolean, startTime: number, endTime: number, errorType?: string | undefined, errorMessage?: string | undefined): void;
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
export function getDailyTokenStats(days?: number | undefined): Record<string, DailyStats>;
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
    allInstanceMetrics: {
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
    }[];
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
    status: 'healthy' | 'degraded' | 'unhealthy';
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
export declare namespace metrics {
    let refreshAttempts: number;
    let refreshSuccesses: number;
    let refreshFailures: number;
    let directOAuthFallbacks: number;
    let serviceUnavailableErrors: number;
    let invalidTokenErrors: number;
    let networkErrors: number;
    let totalLatency: number;
    let maxLatency: number;
    let minLatency: number;
    let lastReset: number;
    let errorsByType: Record<string, number>;
    let dailyStats: Record<string, DailyStats>;
    let instanceMetrics: Record<string, InstanceMetric>;
}
//# sourceMappingURL=tokenMetrics.d.ts.map