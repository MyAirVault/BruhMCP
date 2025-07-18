/**
 * Debug logging
 */
export function debug(message: any, context?: {}): void;
/**
 * Info logging
 */
export function info(message: any, context?: {}): void;
/**
 * Warning logging
 */
export function warn(message: any, context?: {}): void;
/**
 * Error logging
 */
export function error(message: any, context?: {}): void;
/**
 * Fatal error logging
 */
export function fatal(message: any, context?: {}): void;
/**
 * Log API request start
 */
export function logApiRequest(method: any, endpoint: any, instanceId: any, params?: {}): void;
/**
 * Log API response
 */
export function logApiResponse(method: any, endpoint: any, instanceId: any, success: any, duration: any, response?: {}): void;
/**
 * Log OAuth token operations
 */
export function logTokenOperation(operation: any, instanceId: any, success: any, details?: {}): void;
/**
 * Log token refresh with metrics
 */
export function logTokenRefresh(instanceId: any, method: any, success: any, errorType: any, errorMessage: any, startTime: any, endTime: any): void;
/**
 * Log MCP request processing
 */
export function logMcpRequest(method: any, params: any, instanceId: any): void;
/**
 * Log MCP response
 */
export function logMcpResponse(method: any, instanceId: any, success: any, duration: any, error?: null): void;
/**
 * Log database operations
 */
export function logDatabaseOperation(operation: any, table: any, instanceId: any, success: any, details?: {}): void;
/**
 * Log credential operations
 */
export function logCredentialOperation(operation: any, instanceId: any, success: any, details?: {}): void;
/**
 * Log validation errors
 */
export function logValidationError(type: any, field: any, value: any, instanceId: any, details?: {}): void;
/**
 * Log rate limiting
 */
export function logRateLimit(endpoint: any, instanceId: any, retryAfter: any, details?: {}): void;
/**
 * Log cache operations
 */
export function logCacheOperation(operation: any, key: any, hit: any, instanceId: any, details?: {}): void;
/**
 * Log system health
 */
export function logSystemHealth(status: any, metrics: any, issues?: any[], warnings?: any[]): void;
/**
 * Log startup information
 */
export function logStartup(port: any, environment: any, features?: any[]): void;
/**
 * Log shutdown information
 */
export function logShutdown(reason: any, graceful?: boolean): void;
/**
 * Create a request logger middleware
 */
export function createRequestLogger(serviceName?: string): (req: any, res: any, next: any) => void;
/**
 * Performance timer utility
 */
export function createTimer(operation: any, instanceId: any): {
    end: (success?: boolean, details?: {}) => number;
};
/**
 * Export current log level for testing
 */
export const currentLogLevel: any;
export namespace logLevels {
    let DEBUG: number;
    let INFO: number;
    let WARN: number;
    let ERROR: number;
    let FATAL: number;
}
//# sourceMappingURL=logger.d.ts.map