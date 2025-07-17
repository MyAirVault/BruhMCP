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
 */
export function getInstanceTokenMetrics(instanceId: any): Object;
/**
 * Get daily statistics
 */
export function getDailyTokenStats(days: any): Object;
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
export default tokenMetrics;
declare const tokenMetrics: TokenMetrics;
/**
 * Token Refresh Metrics System
 * Tracks performance and reliability metrics for OAuth token operations
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
        errorsByType: {};
        dailyStats: {};
        instanceMetrics: {};
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
     * @returns {Object} Instance-specific metrics
     */
    getInstanceMetrics(instanceId: string): Object;
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
//# sourceMappingURL=token-metrics.d.ts.map