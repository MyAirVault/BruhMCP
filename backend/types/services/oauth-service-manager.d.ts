declare const _default: OAuthServiceManager;
export default _default;
export type HealthStatus = {
    /**
     * - Health status
     */
    status: "healthy" | "degraded" | "unhealthy";
    /**
     * - Reason for status
     */
    reason?: string | undefined;
    /**
     * - Service uptime in milliseconds
     */
    uptime: number;
    /**
     * - Endpoint health results
     */
    endpoints: {
        [x: string]: EndpointResult;
    };
    /**
     * - Ratio of healthy endpoints
     */
    healthRatio?: number | undefined;
    /**
     * - Service port
     */
    port?: number | undefined;
    /**
     * - Process ID
     */
    pid?: number | undefined;
};
export type EndpointResult = {
    /**
     * - Endpoint status
     */
    status: "healthy" | "unhealthy";
    /**
     * - HTTP status code
     */
    statusCode: number | null;
    /**
     * - Response time in milliseconds
     */
    responseTime: number | null;
    /**
     * - Error message if any
     */
    error: string | null;
};
export type HealthRecommendation = {
    /**
     * - Recommendation priority
     */
    priority: "high" | "medium" | "low";
    /**
     * - Recommended action
     */
    action: string;
    /**
     * - Recommendation message
     */
    message: string;
    /**
     * - Additional details
     */
    details?: Object | undefined;
};
export type ServiceStatus = {
    /**
     * - Whether service is running
     */
    isRunning: boolean;
    /**
     * - Service port
     */
    port: number | string;
    /**
     * - Service URL
     */
    url: string;
    /**
     * - Health status
     */
    health: HealthStatus;
    /**
     * - Health recommendations
     */
    recommendations: HealthRecommendation[];
    /**
     * - Circuit breaker status
     */
    circuitBreaker: Object;
    /**
     * - Connection pool status
     */
    connectionPool: Object;
    /**
     * - Service start time
     */
    startTime: string | null;
    /**
     * - Service uptime
     */
    uptime: number;
};
export type CustomError = Error;
/**
 * @typedef {Object} HealthStatus
 * @property {'healthy'|'degraded'|'unhealthy'} status - Health status
 * @property {string} [reason] - Reason for status
 * @property {number} uptime - Service uptime in milliseconds
 * @property {Object<string, EndpointResult>} endpoints - Endpoint health results
 * @property {number} [healthRatio] - Ratio of healthy endpoints
 * @property {number} [port] - Service port
 * @property {number} [pid] - Process ID
 */
/**
 * @typedef {Object} EndpointResult
 * @property {'healthy'|'unhealthy'} status - Endpoint status
 * @property {number|null} statusCode - HTTP status code
 * @property {number|null} responseTime - Response time in milliseconds
 * @property {string|null} error - Error message if any
 */
/**
 * @typedef {Object} HealthRecommendation
 * @property {'high'|'medium'|'low'} priority - Recommendation priority
 * @property {string} action - Recommended action
 * @property {string} message - Recommendation message
 * @property {Object} [details] - Additional details
 */
/**
 * @typedef {Object} ServiceStatus
 * @property {boolean} isRunning - Whether service is running
 * @property {number|string} port - Service port
 * @property {string} url - Service URL
 * @property {HealthStatus} health - Health status
 * @property {HealthRecommendation[]} recommendations - Health recommendations
 * @property {Object} circuitBreaker - Circuit breaker status
 * @property {Object} connectionPool - Connection pool status
 * @property {string|null} startTime - Service start time
 * @property {number} uptime - Service uptime
 */
/**
 * @typedef {Error} CustomError
 * @property {number} [status] - HTTP status code
 * @property {Response} [response] - HTTP response object
 */
declare class OAuthServiceManager {
    /** @type {import('http').Server|null} */
    server: import("http").Server | null;
    /** @type {boolean} */
    isRunning: boolean;
    /** @type {number} */
    port: number;
    /** @type {NodeJS.Timeout|null} */
    healthMonitorInterval: NodeJS.Timeout | null;
    /** @type {number|null} */
    startTime: number | null;
    /** @type {import('../utils/circuit-breaker.js').CircuitBreaker} */
    circuitBreaker: import("../utils/circuit-breaker.js").CircuitBreaker;
    /** @type {import('../utils/connection-pool.js').ConnectionPool} */
    connectionPool: import("../utils/connection-pool.js").ConnectionPool;
    /**
     * Start OAuth service if not already running
     * @returns {Promise<boolean>} true if started successfully
     */
    startService(): Promise<boolean>;
    /**
     * Stop OAuth service if running
     * @returns {Promise<boolean>} true if stopped successfully
     */
    stopService(): Promise<boolean>;
    /**
     * Check if OAuth service is running
     * @returns {boolean} true if running
     */
    isServiceRunning(): boolean;
    /**
     * Get OAuth service URL
     * @returns {string} OAuth service URL
     */
    getServiceUrl(): string;
    /**
     * Execute OAuth service call through circuit breaker
     * @param {(...args: unknown[]) => Promise<unknown>} fn - Function to execute
     * @param {...unknown} args - Arguments to pass to function
     * @returns {Promise<unknown>} Result of function execution
     */
    executeWithCircuitBreaker(fn: (...args: unknown[]) => Promise<unknown>, ...args: unknown[]): Promise<unknown>;
    /**
     * Make HTTP request to OAuth service with circuit breaker and connection pooling
     * @param {string} path - API path
     * @param {RequestInit} options - Request options
     * @returns {Promise<Response>} HTTP response
     */
    makeOAuthServiceRequest(path: string, options?: RequestInit): Promise<Response>;
    /**
     * Ensure OAuth service is running for an operation
     * @returns {Promise<boolean>} true if service is available
     */
    ensureServiceRunning(): Promise<boolean>;
    /**
     * Check service health by testing endpoints
     * @returns {Promise<HealthStatus>} Health status
     */
    checkServiceHealth(): Promise<HealthStatus>;
    /**
     * Restart service if unhealthy
     * @returns {Promise<boolean>} true if restart was successful
     */
    restartIfUnhealthy(): Promise<boolean>;
    /**
     * Start health monitoring with periodic checks
     */
    startHealthMonitoring(): void;
    /**
     * Stop health monitoring
     */
    stopHealthMonitoring(): void;
    /**
     * Perform health monitoring check
     */
    monitorServiceHealth(): Promise<void>;
    /**
     * Get health recommendations based on current status
     * @returns {Promise<HealthRecommendation[]>} Array of recommendations
     */
    getHealthRecommendations(): Promise<HealthRecommendation[]>;
    /**
     * Get comprehensive service status
     * @returns {Promise<ServiceStatus>} Complete service status
     */
    getServiceStatus(): Promise<ServiceStatus>;
    /**
     * Cleanup resources (connection pool, circuit breaker, etc.)
     */
    cleanup(): Promise<void>;
}
//# sourceMappingURL=oauth-service-manager.d.ts.map