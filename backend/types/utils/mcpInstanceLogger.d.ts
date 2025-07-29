export = mcpInstanceLogger;
declare const mcpInstanceLogger: MCPInstanceLogger;
declare namespace mcpInstanceLogger {
    export { Request, Response, NextFunction, LogMetadata, MCPLogger, LoggerStats };
}
/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */
/**
 * @typedef {Object} LogMetadata
 * @property {string} [userAgent] - User agent string
 * @property {string} [ip] - Client IP address
 * @property {number} [contentLength] - Content length
 * @property {string} [operation] - MCP operation type
 * @property {string} [protocol] - Protocol type
 */
/**
 * @typedef {Object} MCPLogger
 * @property {string} instanceId - Instance ID
 * @property {string} [userId] - User ID
 * @property {string|null} logDir - Log directory path
 * @property {function(string, string, LogMetadata): void} app - Application logger
 * @property {function(string, string, number, number, LogMetadata): void} access - Access logger
 * @property {function(Error|string, LogMetadata): void} error - Error logger
 * @property {function(string, LogMetadata): void} info - Info logger
 * @property {function(string, LogMetadata): void} warn - Warning logger
 * @property {function(string, LogMetadata): void} debug - Debug logger
 * @property {function(string, LogMetadata): void} mcpOperation - MCP operation logger
 */
/**
 * @typedef {Object} LoggerStats
 * @property {number} activeLoggers - Number of active loggers
 * @property {string[]} instances - Array of instance IDs
 */
declare class MCPInstanceLogger {
    /** @type {Map<string, MCPLogger>} */
    activeLoggers: Map<string, MCPLogger>;
    /**
     * Initialize logger for a specific MCP instance
     * @param {string} instanceId - MCP instance ID
     * @param {string} userId - User ID who owns the instance
     * @returns {MCPLogger} Logger instance with log methods
     */
    initializeLogger(instanceId: string, userId: string): MCPLogger;
    /**
     * Create a null logger that doesn't write to files (fallback)
     * @param {string} instanceId - Instance ID for identification
     * @returns {MCPLogger} Null logger with same interface
     */
    createNullLogger(instanceId: string): MCPLogger;
    /**
     * Write log entry to specified log file
     * @param {string} logDir - Log directory path
     * @param {string} logFile - Log file name
     * @param {Record<string, any>} logData - Log data to write
     */
    writeLog(logDir: string, logFile: string, logData: Record<string, any>): void;
    /**
     * Get logger for existing instance
     * @param {string} instanceId - Instance ID
     * @returns {MCPLogger|null} Logger instance or null if not found
     */
    getLogger(instanceId: string): MCPLogger | null;
    /**
     * Remove logger for instance (cleanup)
     * @param {string} instanceId - Instance ID
     */
    removeLogger(instanceId: string): void;
    /**
     * Get all active logger instance IDs
     * @returns {Array<string>} Array of instance IDs
     */
    getActiveLoggers(): Array<string>;
    /**
     * Get logger statistics
     * @returns {LoggerStats} Logger statistics
     */
    getStats(): LoggerStats;
    /**
     * Express middleware factory for request logging
     * @param {string} instanceId - Instance ID
     * @returns {function(Request, Response, NextFunction): void} Express middleware function
     */
    createRequestMiddleware(instanceId: string): (arg0: Request, arg1: Response, arg2: NextFunction) => void;
}
type Request = import('express').Request;
type Response = import('express').Response;
type NextFunction = import('express').NextFunction;
type LogMetadata = {
    /**
     * - User agent string
     */
    userAgent?: string | undefined;
    /**
     * - Client IP address
     */
    ip?: string | undefined;
    /**
     * - Content length
     */
    contentLength?: number | undefined;
    /**
     * - MCP operation type
     */
    operation?: string | undefined;
    /**
     * - Protocol type
     */
    protocol?: string | undefined;
};
type MCPLogger = {
    /**
     * - Instance ID
     */
    instanceId: string;
    /**
     * - User ID
     */
    userId?: string | undefined;
    /**
     * - Log directory path
     */
    logDir: string | null;
    /**
     * - Application logger
     */
    app: (arg0: string, arg1: string, arg2: LogMetadata) => void;
    /**
     * - Access logger
     */
    access: (arg0: string, arg1: string, arg2: number, arg3: number, arg4: LogMetadata) => void;
    /**
     * - Error logger
     */
    error: (arg0: Error | string, arg1: LogMetadata) => void;
    /**
     * - Info logger
     */
    info: (arg0: string, arg1: LogMetadata) => void;
    /**
     * - Warning logger
     */
    warn: (arg0: string, arg1: LogMetadata) => void;
    /**
     * - Debug logger
     */
    debug: (arg0: string, arg1: LogMetadata) => void;
    /**
     * - MCP operation logger
     */
    mcpOperation: (arg0: string, arg1: LogMetadata) => void;
};
type LoggerStats = {
    /**
     * - Number of active loggers
     */
    activeLoggers: number;
    /**
     * - Array of instance IDs
     */
    instances: string[];
};
//# sourceMappingURL=mcpInstanceLogger.d.ts.map