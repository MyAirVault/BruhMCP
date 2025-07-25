/**
 * Record token refresh metrics
 * @param {string} instanceId - Instance ID
 * @param {string} method - Method used for refresh (oauth_service, direct_oauth)
 * @param {boolean} success - Whether the refresh was successful
 * @param {string|null} errorType - Type of error if failed
 * @param {string|null} errorMessage - Error message if failed
 * @param {number} startTime - Start timestamp
 * @param {number} endTime - End timestamp
 */
export function recordTokenRefreshMetrics(instanceId: string, method: string, success: boolean, errorType: string | null, errorMessage: string | null, startTime: number, endTime: number): void;
/**
 * Get token refresh metrics for an instance
 * @param {string} instanceId - Instance ID
 * @returns {TokenMetric[]} Array of metrics
 */
export function getTokenRefreshMetrics(instanceId: string): TokenMetric[];
/**
 * Get aggregated token refresh statistics
 * @param {string|null} instanceId - Instance ID (optional)
 * @returns {TokenRefreshStats} Aggregated statistics
 */
export function getTokenRefreshStats(instanceId?: string | null): TokenRefreshStats;
/**
 * Clear all metrics (for testing)
 */
export function clearAllMetrics(): void;
/**
 * Export metrics for external monitoring systems
 * @returns {TokenMetric[]} All metrics
 */
export function exportMetrics(): TokenMetric[];
export type TokenMetric = {
    /**
     * - Instance ID
     */
    instanceId: string;
    /**
     * - Method used for refresh
     */
    method: string;
    /**
     * - Whether the refresh was successful
     */
    success: boolean;
    /**
     * - Type of error if failed
     */
    errorType: string | null;
    /**
     * - Error message if failed
     */
    errorMessage: string | null;
    /**
     * - Duration in milliseconds
     */
    duration: number;
    /**
     * - ISO timestamp
     */
    timestamp: string;
    /**
     * - Start timestamp
     */
    startTime: number;
    /**
     * - End timestamp
     */
    endTime: number;
};
export type MethodStats = {
    /**
     * - Total requests for this method
     */
    total: number;
    /**
     * - Successful requests
     */
    successful: number;
    /**
     * - Failed requests
     */
    failed: number;
};
export type TokenRefreshStats = {
    /**
     * - Total number of requests
     */
    totalRequests: number;
    /**
     * - Success rate percentage
     */
    successRate: number;
    /**
     * - Average duration in ms
     */
    averageDuration: number;
    /**
     * - Breakdown by method
     */
    methodBreakdown: Record<string, MethodStats>;
    /**
     * - Breakdown by error type
     */
    errorBreakdown: Record<string, number>;
    /**
     * - Time range of metrics
     */
    timeRange: {
        earliest: string | undefined;
        latest: string | undefined;
    };
};
//# sourceMappingURL=tokenMetrics.d.ts.map