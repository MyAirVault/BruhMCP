export default mcpInstanceLogger;
export type Request = import("express").Request;
export type Response = import("express").Response;
export type NextFunction = import("express").NextFunction;
declare const mcpInstanceLogger: MCPInstanceLogger;
/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */
declare class MCPInstanceLogger {
    activeLoggers: Map<any, any>;
    /**
     * Initialize logger for a specific MCP instance
     * @param {string} instanceId - MCP instance ID
     * @param {string} userId - User ID who owns the instance
     * @returns {Object} Logger instance with log methods
     */
    initializeLogger(instanceId: string, userId: string): Object;
    /**
     * Create a null logger that doesn't write to files (fallback)
     * @param {string} instanceId - Instance ID for identification
     * @returns {Object} Null logger with same interface
     */
    createNullLogger(instanceId: string): Object;
    /**
     * Write log entry to specified log file
     * @param {string} logDir - Log directory path
     * @param {string} logFile - Log file name
     * @param {Object} logData - Log data to write
     */
    writeLog(logDir: string, logFile: string, logData: Object): void;
    /**
     * Get logger for existing instance
     * @param {string} instanceId - Instance ID
     * @returns {Object|null} Logger instance or null if not found
     */
    getLogger(instanceId: string): Object | null;
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
     * @returns {Object} Logger statistics
     */
    getStats(): Object;
    /**
     * Express middleware factory for request logging
     * @param {string} instanceId - Instance ID
     * @returns {Function} Express middleware function
     */
    createRequestMiddleware(instanceId: string): Function;
}
//# sourceMappingURL=mcpInstanceLogger.d.ts.map