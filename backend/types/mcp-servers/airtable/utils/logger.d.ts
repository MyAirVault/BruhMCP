/**
 * Create logger instance
 * @param {string} component - Component name
 * @returns {Logger}
 */
export function createLogger(component: string): Logger;
/**
 * Global logger for service-wide events
 */
export const serviceLogger: Logger;
/**
 * Request logger middleware
 * @param {string} instanceId - Instance ID
 * @returns {Function}
 */
export function createRequestLogger(instanceId: string): Function;
/**
 * Error logger
 * @param {Error} error - Error object
 * @param {Object} context - Error context
 */
export function logError(error: Error, context?: Object): void;
/**
 * Performance logger
 * @param {string} operation - Operation name
 * @param {Function} fn - Function to measure
 * @returns {Function}
 */
export function measurePerformance(operation: string, fn: Function): Function;
export namespace logLevel {
    function setLevel(level: string): void;
    function getLevel(): string | undefined;
    function isDebugEnabled(): boolean;
}
/**
 * Logger class
 */
declare class Logger {
    /**
     * @param {string} component - Component name
     */
    constructor(component: string);
    component: string;
    /** @type {Object} */
    context: Object;
    /**
     * Log debug message
     * @param {string} message - Message to log
     * @param {Object} metadata - Additional metadata
     */
    debug(message: string, metadata?: Object): void;
    /**
     * Log info message
     * @param {string} message - Message to log
     * @param {Object} metadata - Additional metadata
     */
    info(message: string, metadata?: Object): void;
    /**
     * Log warning message
     * @param {string} message - Message to log
     * @param {Object} metadata - Additional metadata
     */
    warn(message: string, metadata?: Object): void;
    /**
     * Log error message
     * @param {string} message - Message to log
     * @param {Object} metadata - Additional metadata
     */
    error(message: string, metadata?: Object): void;
    /**
     * Log API call
     * @param {string} method - HTTP method
     * @param {string} endpoint - API endpoint
     * @param {number} duration - Request duration in ms
     * @param {number} status - HTTP status code
     * @param {Object} metadata - Additional metadata
     */
    apiCall(method: string, endpoint: string, duration: number, status: number, metadata?: Object): void;
    /**
     * Log performance metrics
     * @param {string} operation - Operation name
     * @param {Object} metrics - Performance metrics
     */
    performance(operation: string, metrics: Object): void;
    /**
     * Log validation error
     * @param {string} field - Field name
     * @param {string} value - Invalid value
     * @param {string} reason - Validation failure reason
     */
    validationError(field: string, value: string, reason: string): void;
    /**
     * Log cache operation
     * @param {string} operation - Cache operation (hit, miss, set, clear)
     * @param {string} key - Cache key
     * @param {Object} metadata - Additional metadata
     */
    cache(operation: string, key: string, metadata?: Object): void;
    /**
     * Log rate limit event
     * @param {string} endpoint - API endpoint
     * @param {number} retryAfter - Retry after seconds
     * @param {Object} metadata - Additional metadata
     */
    rateLimit(endpoint: string, retryAfter: number, metadata?: Object): void;
    /**
     * Log authentication event
     * @param {string} event - Auth event (success, failure, refresh)
     * @param {Object} metadata - Additional metadata
     */
    auth(event: string, metadata?: Object): void;
    /**
     * Log MCP protocol event
     * @param {string} event - MCP event
     * @param {Object} metadata - Additional metadata
     */
    mcp(event: string, metadata?: Object): void;
    /**
     * Log session event
     * @param {string} sessionId - Session ID
     * @param {string} event - Session event
     * @param {Object} metadata - Additional metadata
     */
    session(sessionId: string, event: string, metadata?: Object): void;
    /**
     * Log database event
     * @param {string} operation - Database operation
     * @param {Object} metadata - Additional metadata
     */
    database(operation: string, metadata?: Object): void;
    /**
     * Log tool execution
     * @param {string} toolName - Tool name
     * @param {Object} params - Tool parameters
     * @param {number} duration - Execution duration
     * @param {boolean} success - Execution success
     */
    tool(toolName: string, params: Object, duration: number, success: boolean): void;
    /**
     * Create child logger with additional context
     * @param {string} subComponent - Sub-component name
     * @param {Object} context - Additional context
     * @returns {Logger}
     */
    child(subComponent: string, context?: Object): Logger;
    /**
     * Log with additional context
     * @param {'debug' | 'info' | 'warn' | 'error'} level - Log level
     * @param {string} message - Message
     * @param {Object} metadata - Metadata
     */
    withContext(level: "debug" | "info" | "warn" | "error", message: string, metadata?: Object): void;
}
export {};
//# sourceMappingURL=logger.d.ts.map