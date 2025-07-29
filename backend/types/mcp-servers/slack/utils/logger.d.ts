/**
 * Log levels
 */
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
/**
 * Debug logging
 * @param {string} message - The log message
 * @param {Record<string, unknown>} [context={}] - Additional context data
 */
export function debug(message: string, context?: Record<string, unknown> | undefined): void;
/**
 * Info logging
 * @param {string} message - The log message
 * @param {Record<string, unknown>} [context={}] - Additional context data
 */
export function info(message: string, context?: Record<string, unknown> | undefined): void;
/**
 * Warning logging
 * @param {string} message - The log message
 * @param {Record<string, unknown>} [context={}] - Additional context data
 */
export function warn(message: string, context?: Record<string, unknown> | undefined): void;
/**
 * Error logging
 * @param {string} message - The log message
 * @param {Record<string, unknown>} [context={}] - Additional context data
 */
export function error(message: string, context?: Record<string, unknown> | undefined): void;
/**
 * Fatal error logging
 * @param {string} message - The log message
 * @param {Record<string, unknown>} [context={}] - Additional context data
 */
export function fatal(message: string, context?: Record<string, unknown> | undefined): void;
/**
 * Log API request start
 * @param {string} method - HTTP method
 * @param {string} endpoint - API endpoint
 * @param {string} instanceId - Instance identifier
 * @param {Record<string, unknown>} [params={}] - Request parameters
 */
export function logApiRequest(method: string, endpoint: string, instanceId: string, params?: Record<string, unknown> | undefined): void;
/**
 * Log API response
 * @param {string} method - HTTP method
 * @param {string} endpoint - API endpoint
 * @param {string} instanceId - Instance identifier
 * @param {boolean} success - Whether the request was successful
 * @param {number} duration - Request duration in milliseconds
 * @param {Record<string, unknown>} [response={}] - Response data
 */
export function logApiResponse(method: string, endpoint: string, instanceId: string, success: boolean, duration: number, response?: Record<string, unknown> | undefined): void;
/**
 * Log OAuth token operations
 * @param {string} operation - The token operation
 * @param {string} instanceId - Instance identifier
 * @param {boolean} success - Whether the operation was successful
 * @param {Record<string, unknown>} [details={}] - Additional operation details
 */
export function logTokenOperation(operation: string, instanceId: string, success: boolean, details?: Record<string, unknown> | undefined): void;
/**
 * Log token refresh with metrics
 * @param {string} instanceId - Instance identifier
 * @param {string} method - Refresh method used
 * @param {boolean} success - Whether the refresh was successful
 * @param {string|null} errorType - Type of error if failed
 * @param {string|null} errorMessage - Error message if failed
 * @param {number} startTime - Operation start timestamp
 * @param {number} endTime - Operation end timestamp
 */
export function logTokenRefresh(instanceId: string, method: string, success: boolean, errorType: string | null, errorMessage: string | null, startTime: number, endTime: number): void;
/**
 * Log MCP request processing
 * @param {string} method - MCP method name
 * @param {Record<string, unknown>|null} params - Request parameters
 * @param {string} instanceId - Instance identifier
 */
export function logMcpRequest(method: string, params: Record<string, unknown> | null, instanceId: string): void;
/**
 * Log MCP response
 * @param {string} method - MCP method name
 * @param {string} instanceId - Instance identifier
 * @param {boolean} success - Whether the request was successful
 * @param {number} duration - Request duration in milliseconds
 * @param {Error|null} [error=null] - Error object if failed
 */
export function logMcpResponse(method: string, instanceId: string, success: boolean, duration: number, error?: Error | null | undefined): void;
/**
 * Log database operations
 * @param {string} operation - Database operation type
 * @param {string} table - Database table name
 * @param {string} instanceId - Instance identifier
 * @param {boolean} success - Whether the operation was successful
 * @param {Record<string, unknown>} [details={}] - Additional operation details
 */
export function logDatabaseOperation(operation: string, table: string, instanceId: string, success: boolean, details?: Record<string, unknown> | undefined): void;
/**
 * Log credential operations
 * @param {string} operation - Credential operation type
 * @param {string} instanceId - Instance identifier
 * @param {boolean} success - Whether the operation was successful
 * @param {Record<string, unknown>} [details={}] - Additional operation details
 */
export function logCredentialOperation(operation: string, instanceId: string, success: boolean, details?: Record<string, unknown> | undefined): void;
/**
 * Log validation errors
 * @param {string} type - Validation error type
 * @param {string} field - Field that failed validation
 * @param {unknown} value - Value that failed validation
 * @param {string} instanceId - Instance identifier
 * @param {Record<string, unknown>} [details={}] - Additional error details
 */
export function logValidationError(type: string, field: string, value: unknown, instanceId: string, details?: Record<string, unknown> | undefined): void;
/**
 * Log rate limiting
 * @param {string} endpoint - API endpoint that was rate limited
 * @param {string} instanceId - Instance identifier
 * @param {number} retryAfter - Retry after duration in seconds
 * @param {Record<string, unknown>} [details={}] - Additional rate limit details
 */
export function logRateLimit(endpoint: string, instanceId: string, retryAfter: number, details?: Record<string, unknown> | undefined): void;
/**
 * Log cache operations
 * @param {string} operation - Cache operation type
 * @param {string} key - Cache key
 * @param {boolean} hit - Whether it was a cache hit
 * @param {string} instanceId - Instance identifier
 * @param {Record<string, unknown>} [details={}] - Additional cache details
 */
export function logCacheOperation(operation: string, key: string, hit: boolean, instanceId: string, details?: Record<string, unknown> | undefined): void;
/**
 * Log system health
 * @param {'healthy'|'degraded'|'unhealthy'} status - System health status
 * @param {Record<string, unknown>} metrics - System metrics
 * @param {string[]} [issues=[]] - List of system issues
 * @param {string[]} [warnings=[]] - List of system warnings
 */
export function logSystemHealth(status: 'healthy' | 'degraded' | 'unhealthy', metrics: Record<string, unknown>, issues?: string[] | undefined, warnings?: string[] | undefined): void;
/**
 * Log startup information
 * @param {number} port - Server port number
 * @param {string} environment - Environment name
 * @param {string[]} [features=[]] - List of enabled features
 */
export function logStartup(port: number, environment: string, features?: string[] | undefined): void;
/**
 * Log shutdown information
 * @param {string} reason - Shutdown reason
 * @param {boolean} [graceful=true] - Whether shutdown was graceful
 */
export function logShutdown(reason: string, graceful?: boolean | undefined): void;
/**
 * Create a request logger middleware
 * @param {string} [serviceName='slack'] - Service name for logging
 * @returns {Function} Express middleware function
 */
export function createRequestLogger(serviceName?: string | undefined): Function;
/**
 * Performance timer utility
 * @param {string} operation - Operation name
 * @param {string} instanceId - Instance identifier
 * @returns {{end: Function}} Timer object with end method
 */
export function createTimer(operation: string, instanceId: string): {
    end: Function;
};
/**
 * Current log level (can be set via environment variable)
 */
declare const CURRENT_LOG_LEVEL: number;
declare namespace LOG_LEVELS {
    let DEBUG: number;
    let INFO: number;
    let WARN: number;
    let ERROR: number;
    let FATAL: number;
}
export { CURRENT_LOG_LEVEL as currentLogLevel, LOG_LEVELS as logLevels };
//# sourceMappingURL=logger.d.ts.map