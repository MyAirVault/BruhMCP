export default connectionPoolManager;
/**
 * HTTP Connection Pool Manager
 */
export class ConnectionPool {
    constructor(options?: {});
    name: any;
    maxSockets: any;
    maxFreeSockets: any;
    timeout: any;
    keepAlive: boolean;
    keepAliveMsecs: any;
    maxRetries: any;
    retryDelay: any;
    httpAgent: Agent;
    httpsAgent: HttpsAgent;
    metrics: {
        totalRequests: number;
        activeConnections: number;
        successfulRequests: number;
        failedRequests: number;
        retryCount: number;
        averageResponseTime: number;
        lastRequestTime: null;
        createdAt: number;
    };
    requestQueue: any[];
    maxConcurrentRequests: any;
    activeRequests: number;
    /**
     * Execute HTTP request with connection pooling
     * @param {string} url - Request URL
     * @param {Object} options - Request options
     * @returns {Promise<Response>} HTTP response
     */
    fetch(url: string, options?: Object): Promise<Response>;
    /**
     * Execute request with retry logic
     * @param {string} url - Request URL
     * @param {Object} options - Request options
     * @returns {Promise<Response>} HTTP response
     */
    executeWithRetries(url: string, options: Object): Promise<Response>;
    /**
     * Determine if request should be retried based on status code
     * @param {number} statusCode - HTTP status code
     * @param {number} attempt - Current attempt number
     * @returns {boolean} True if should retry
     */
    shouldRetry(statusCode: number, attempt: number): boolean;
    /**
     * Determine if request should be retried based on error
     * @param {Error} error - Request error
     * @param {number} attempt - Current attempt number
     * @returns {boolean} True if should retry
     */
    shouldRetryError(error: Error, attempt: number): boolean;
    /**
     * Wait for available request slot
     * @returns {Promise<void>}
     */
    waitForAvailableSlot(): Promise<void>;
    /**
     * Process next request in queue
     */
    processNextRequest(): void;
    /**
     * Update connection metrics
     * @param {boolean} success - Whether request was successful
     * @param {number} responseTime - Response time in milliseconds
     */
    updateMetrics(success: boolean, responseTime: number): void;
    /**
     * Get connection pool status
     * @returns {Object} Pool status
     */
    getStatus(): Object;
    /**
     * Get health assessment
     * @returns {Object} Health assessment
     */
    getHealthAssessment(): Object;
    /**
     * Reset connection pool metrics
     */
    resetMetrics(): void;
    /**
     * Close connection pool and cleanup resources
     */
    close(): Promise<void>;
}
/**
 * Connection Pool Manager for managing multiple connection pools
 */
export class ConnectionPoolManager {
    pools: Map<any, any>;
    /**
     * Get or create connection pool
     * @param {string} name - Pool name
     * @param {Object} options - Pool options
     * @returns {ConnectionPool} Connection pool instance
     */
    getOrCreate(name: string, options?: Object): ConnectionPool;
    /**
     * Get connection pool by name
     * @param {string} name - Pool name
     * @returns {ConnectionPool|null} Connection pool instance or null
     */
    get(name: string): ConnectionPool | null;
    /**
     * Get all connection pools
     * @returns {Map} All connection pools
     */
    getAll(): Map<any, any>;
    /**
     * Get status of all connection pools
     * @returns {Object} Status of all pools
     */
    getAllStatus(): Object;
    /**
     * Get health assessment of all connection pools
     * @returns {Object} Health assessment of all pools
     */
    getAllHealthAssessments(): Object;
    /**
     * Close and remove connection pool
     * @param {string} name - Pool name
     */
    close(name: string): Promise<void>;
    /**
     * Close all connection pools
     */
    closeAll(): Promise<void>;
}
declare const connectionPoolManager: ConnectionPoolManager;
import { Agent } from 'http';
import { Agent as HttpsAgent } from 'https';
//# sourceMappingURL=connection-pool.d.ts.map