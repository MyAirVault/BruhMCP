export default logFileManager;
declare const logFileManager: LogFileManager;
/**
 * Log file management utility for MCP instances
 */
declare class LogFileManager {
    logStreams: Map<any, any>;
    rootLogDir: string;
    /**
     * Initialize log files for an instance
     * @param {string} instanceId - Instance ID
     * @param {string} userId - User ID
     * @returns {Object} Log streams object
     */
    initializeLogFiles(instanceId: string, userId: string): Object;
    /**
     * Write a log entry to appropriate file
     * @param {string} instanceId - Instance ID
     * @param {string} level - Log level (info, error, warn)
     * @param {string} message - Log message
     * @param {string} type - Log type (stdout, stderr)
     * @param {Object} metadata - Additional metadata
     */
    writeLog(instanceId: string, level: string, message: string, type?: string, metadata?: Object): void;
    /**
     * Close log streams for an instance
     * @param {string} instanceId - Instance ID
     */
    closeLogStreams(instanceId: string): void;
    /**
     * Get log streams for an instance
     * @param {string} instanceId - Instance ID
     * @returns {Object|null} Log streams or null if not found
     */
    getLogStreams(instanceId: string): Object | null;
    /**
     * Clean up all log streams
     */
    cleanup(): void;
    /**
     * Get log directory path for an instance
     * @param {string} instanceId - Instance ID
     * @param {string} userId - User ID
     * @returns {string} Log directory path
     */
    getLogDirectory(instanceId: string, userId: string): string;
}
//# sourceMappingURL=log-file-manager.d.ts.map