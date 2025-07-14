export default logMaintenanceService;
declare const logMaintenanceService: LogMaintenanceService;
/**
 * Log maintenance service for cleanup, rotation, and monitoring
 * Handles both system logs and user instance logs
 */
declare class LogMaintenanceService {
    systemLogsDir: string;
    userLogsDir: string;
    maintenanceInterval: NodeJS.Timeout | null;
    cleanupStats: {
        lastRun: null;
        filesRemoved: number;
        spaceFreed: number;
        errors: never[];
    };
    /**
     * Start automated log maintenance
     * @param {number} intervalHours - Hours between maintenance runs
     */
    startAutomatedMaintenance(intervalHours?: number): void;
    /**
     * Stop automated maintenance
     */
    stopAutomatedMaintenance(): void;
    /**
     * Perform complete maintenance cycle
     */
    performCompleteMaintenance(): Promise<void>;
    /**
     * Clean up old system logs
     */
    cleanupSystemLogs(): Promise<void>;
    /**
     * Clean up old user instance logs
     */
    cleanupUserLogs(): Promise<void>;
    /**
     * Clean up logs for a specific MCP instance
     * @param {string} mcpPath - Path to MCP instance logs
     * @param {Date} cutoffDate - Cutoff date for cleanup
     * @returns {Object} Cleanup statistics
     */
    cleanupUserMCPLogs(mcpPath: string, cutoffDate: Date): Object;
    /**
     * Compress old log files
     */
    compressOldLogs(): Promise<void>;
    /**
     * Compress logs in a specific directory
     * @param {string} directory - Directory to compress logs in
     * @param {Date} cutoffDate - Date cutoff for compression
     * @returns {number} Number of files compressed
     */
    compressLogsInDirectory(directory: string, cutoffDate: Date): number;
    /**
     * Compress user logs recursively
     * @param {Date} cutoffDate - Date cutoff for compression
     * @returns {number} Number of files compressed
     */
    compressUserLogs(cutoffDate: Date): number;
    /**
     * Validate log file integrity
     */
    validateLogIntegrity(): Promise<void>;
    /**
     * Validate logs in a directory
     * @param {string} directory - Directory to validate
     * @returns {Object} Validation results
     */
    validateLogsInDirectory(directory: string): Object;
    /**
     * Validate user logs recursively
     * @returns {Object} Validation results
     */
    validateUserLogs(): Object;
    /**
     * Update log statistics and monitoring data
     */
    updateLogStatistics(): Promise<void>;
    /**
     * Get directory statistics
     * @param {string} directory - Directory to analyze
     * @returns {Object} Directory statistics
     */
    getDirectoryStats(directory: string): Object;
    /**
     * Get user logs statistics
     * @returns {Object} User logs statistics
     */
    getUserLogsStats(): Object;
    /**
     * Check if directory is empty
     * @param {string} directory - Directory to check
     * @returns {boolean} True if directory is empty
     */
    isDirectoryEmpty(directory: string): boolean;
    /**
     * Get maintenance status and statistics
     * @returns {Object} Maintenance status
     */
    getMaintenanceStatus(): Object;
    /**
     * Force immediate maintenance run
     */
    forceMaintenanceRun(): Promise<void>;
}
//# sourceMappingURL=logMaintenanceService.d.ts.map