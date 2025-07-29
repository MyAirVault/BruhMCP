/// <reference types="node" />
/// <reference types="node" />
export type ConnectionPoolOptions = {
    /**
     * - Pool name
     */
    name?: string | undefined;
    /**
     * - Maximum sockets per host
     */
    maxSockets?: number | undefined;
    /**
     * - Maximum free sockets per host
     */
    maxFreeSockets?: number | undefined;
    /**
     * - Request timeout in milliseconds
     */
    timeout?: number | undefined;
    /**
     * - Enable keep-alive connections
     */
    keepAlive?: boolean | undefined;
    /**
     * - Keep-alive timeout
     */
    keepAliveMsecs?: number | undefined;
    /**
     * - Maximum retry attempts
     */
    maxRetries?: number | undefined;
    /**
     * - Delay between retries in milliseconds
     */
    retryDelay?: number | undefined;
    /**
     * - Maximum concurrent requests
     */
    maxConcurrentRequests?: number | undefined;
};
export type ConnectionMetrics = {
    /**
     * - Total number of requests
     */
    totalRequests: number;
    /**
     * - Currently active connections
     */
    activeConnections: number;
    /**
     * - Number of successful requests
     */
    successfulRequests: number;
    /**
     * - Number of failed requests
     */
    failedRequests: number;
    /**
     * - Total number of retries
     */
    retryCount: number;
    /**
     * - Average response time in milliseconds
     */
    averageResponseTime: number;
    /**
     * - Timestamp of last request
     */
    lastRequestTime: number | null;
    /**
     * - Pool creation timestamp
     */
    createdAt: number;
};
/**
 * @typedef {Object} ConnectionPoolOptions
 * @property {string} [name] - Pool name
 * @property {number} [maxSockets] - Maximum sockets per host
 * @property {number} [maxFreeSockets] - Maximum free sockets per host
 * @property {number} [timeout] - Request timeout in milliseconds
 * @property {boolean} [keepAlive] - Enable keep-alive connections
 * @property {number} [keepAliveMsecs] - Keep-alive timeout
 * @property {number} [maxRetries] - Maximum retry attempts
 * @property {number} [retryDelay] - Delay between retries in milliseconds
 * @property {number} [maxConcurrentRequests] - Maximum concurrent requests
 */
/**
 * @typedef {Object} ConnectionMetrics
 * @property {number} totalRequests - Total number of requests
 * @property {number} activeConnections - Currently active connections
 * @property {number} successfulRequests - Number of successful requests
 * @property {number} failedRequests - Number of failed requests
 * @property {number} retryCount - Total number of retries
 * @property {number} averageResponseTime - Average response time in milliseconds
 * @property {number|null} lastRequestTime - Timestamp of last request
 * @property {number} createdAt - Pool creation timestamp
 */
/**
 * HTTP Connection Pool Manager
 */
export class ConnectionPool {
    /**
     * @param {ConnectionPoolOptions} options - Pool configuration options
     */
    constructor(options?: ConnectionPoolOptions);
    name: string;
    maxSockets: number;
    maxFreeSockets: number;
    timeout: number;
    keepAlive: boolean;
    keepAliveMsecs: number;
    maxRetries: number;
    retryDelay: number;
    httpAgent: Agent;
    httpsAgent: HttpsAgent;
    /** @type {ConnectionMetrics} */
    metrics: ConnectionMetrics;
    /** @type {Array<() => void>} */
    requestQueue: Array<() => void>;
    maxConcurrentRequests: number;
    activeRequests: number;
    /**
     * Execute HTTP request with connection pooling
     * @param {string} url - Request URL
     * @param {RequestInit} options - Request options
     * @returns {Promise<Response>} HTTP response
     */
    fetch(url: string, options?: RequestInit): Promise<Response>;
    /**
     * Execute request with retry logic
     * @param {string} url - Request URL
     * @param {RequestInit} options - Request options
     * @returns {Promise<Response>} HTTP response
     */
    executeWithRetries(url: string, options: RequestInit): Promise<Response>;
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
     * @typedef {Object} PoolStatus
     * @property {string} name - Pool name
     * @property {Object} config - Pool configuration
     * @property {ConnectionMetrics} metrics - Pool metrics
     * @property {number} activeRequests - Current active requests
     * @property {number} queuedRequests - Queued requests count
     * @property {Object} httpAgent - HTTP agent status
     * @property {Object} httpsAgent - HTTPS agent status
     */
    /**
     * Get connection pool status
     * @returns {PoolStatus} Pool status
     */
    getStatus(): {
        /**
         * - Pool name
         */
        name: string;
        /**
         * - Pool configuration
         */
        config: Object;
        /**
         * - Pool metrics
         */
        metrics: ConnectionMetrics;
        /**
         * - Current active requests
         */
        activeRequests: number;
        /**
         * - Queued requests count
         */
        queuedRequests: number;
        /**
         * - HTTP agent status
         */
        httpAgent: Object;
        /**
         * - HTTPS agent status
         */
        httpsAgent: Object;
    };
    /**
     * @typedef {Object} HealthAssessment
     * @property {boolean} healthy - Overall health status
     * @property {string} status - Health status string
     * @property {number} uptime - Pool uptime in milliseconds
     * @property {string} successRate - Success rate percentage
     * @property {string} retryRate - Retry rate percentage
     * @property {string} averageResponseTime - Average response time
     * @property {number} activeConnections - Active connections count
     * @property {number} queuedRequests - Queued requests count
     * @property {string[]} issues - List of issues
     * @property {string[]} warnings - List of warnings
     */
    /**
     * Get health assessment
     * @returns {HealthAssessment} Health assessment
     */
    getHealthAssessment(): {
        /**
         * - Overall health status
         */
        healthy: boolean;
        /**
         * - Health status string
         */
        status: string;
        /**
         * - Pool uptime in milliseconds
         */
        uptime: number;
        /**
         * - Success rate percentage
         */
        successRate: string;
        /**
         * - Retry rate percentage
         */
        retryRate: string;
        /**
         * - Average response time
         */
        averageResponseTime: string;
        /**
         * - Active connections count
         */
        activeConnections: number;
        /**
         * - Queued requests count
         */
        queuedRequests: number;
        /**
         * - List of issues
         */
        issues: string[];
        /**
         * - List of warnings
         */
        warnings: string[];
    };
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
    /** @type {Map<string, ConnectionPool>} */
    pools: Map<string, ConnectionPool>;
    /**
     * Get or create connection pool
     * @param {string} name - Pool name
     * @param {ConnectionPoolOptions} options - Pool options
     * @returns {ConnectionPool} Connection pool instance
     */
    getOrCreate(name: string, options?: ConnectionPoolOptions): ConnectionPool;
    /**
     * Get connection pool by name
     * @param {string} name - Pool name
     * @returns {ConnectionPool|null} Connection pool instance or null
     */
    get(name: string): ConnectionPool | null;
    /**
     * Get all connection pools
     * @returns {Map<string, ConnectionPool>} All connection pools
     */
    getAll(): Map<string, ConnectionPool>;
    /**
     * Get status of all connection pools
     * @returns {Record<string, PoolStatus>} Status of all pools
     */
    getAllStatus(): Record<string, {
        /**
         * - Pool name
         */
        name: string;
        /**
         * - Pool configuration
         */
        config: Object;
        /**
         * - Pool metrics
         */
        metrics: ConnectionMetrics;
        /**
         * - Current active requests
         */
        activeRequests: number;
        /**
         * - Queued requests count
         */
        queuedRequests: number;
        /**
         * - HTTP agent status
         */
        httpAgent: Object;
        /**
         * - HTTPS agent status
         */
        httpsAgent: Object;
    }>;
    /**
     * Get health assessment of all connection pools
     * @returns {Record<string, HealthAssessment>} Health assessment of all pools
     */
    getAllHealthAssessments(): Record<string, {
        /**
         * - Overall health status
         */
        healthy: boolean;
        /**
         * - Health status string
         */
        status: string;
        /**
         * - Pool uptime in milliseconds
         */
        uptime: number;
        /**
         * - Success rate percentage
         */
        successRate: string;
        /**
         * - Retry rate percentage
         */
        retryRate: string;
        /**
         * - Average response time
         */
        averageResponseTime: string;
        /**
         * - Active connections count
         */
        activeConnections: number;
        /**
         * - Queued requests count
         */
        queuedRequests: number;
        /**
         * - List of issues
         */
        issues: string[];
        /**
         * - List of warnings
         */
        warnings: string[];
    }>;
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
import { Agent } from "http";
import { Agent as HttpsAgent } from "https";
export { connectionPoolManager as default };
//# sourceMappingURL=connectionPool.d.ts.map