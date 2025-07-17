declare const _default: OAuthServiceManager;
export default _default;
declare class OAuthServiceManager {
    server: import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse> | null;
    isRunning: boolean;
    port: string | number;
    healthMonitorInterval: NodeJS.Timeout | null;
    startTime: number | null;
    circuitBreaker: import("../utils/circuit-breaker.js").CircuitBreaker;
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
     * @param {Function} fn - Function to execute
     * @param {...any} args - Arguments to pass to function
     * @returns {Promise} Result of function execution
     */
    executeWithCircuitBreaker(fn: Function, ...args: any[]): Promise<any>;
    /**
     * Make HTTP request to OAuth service with circuit breaker and connection pooling
     * @param {string} path - API path
     * @param {Object} options - Request options
     * @returns {Promise<Response>} HTTP response
     */
    makeOAuthServiceRequest(path: string, options?: Object): Promise<Response>;
    /**
     * Ensure OAuth service is running for an operation
     * @returns {Promise<boolean>} true if service is available
     */
    ensureServiceRunning(): Promise<boolean>;
    /**
     * Check service health by testing endpoints
     * @returns {Promise<Object>} Health status
     */
    checkServiceHealth(): Promise<Object>;
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
     * @returns {Promise<Array>} Array of recommendations
     */
    getHealthRecommendations(): Promise<any[]>;
    /**
     * Get comprehensive service status
     * @returns {Promise<Object>} Complete service status
     */
    getServiceStatus(): Promise<Object>;
    /**
     * Cleanup resources (connection pool, circuit breaker, etc.)
     */
    cleanup(): Promise<void>;
}
//# sourceMappingURL=oauth-service-manager.d.ts.map