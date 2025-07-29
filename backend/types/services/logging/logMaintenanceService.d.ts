export = logMaintenanceService;
declare const logMaintenanceService: LogMaintenanceService;
declare namespace logMaintenanceService {
    export { CleanupStats, ValidationResult, DirectoryStats, UserLogsStats, CleanupResult };
}
/**
 * @typedef {Object} CleanupStats
 * @property {string|null} lastRun - Last maintenance run timestamp
 * @property {number} filesRemoved - Number of files removed
 * @property {number} spaceFreed - Space freed in bytes
 * @property {string[]} errors - Array of error messages
 */
/**
 * @typedef {Object} ValidationResult
 * @property {number} validated - Number of validated files
 * @property {number} corrupted - Number of corrupted files
 */
/**
 * @typedef {Object} DirectoryStats
 * @property {number} size - Total size in bytes
 * @property {number} fileCount - Number of files
 */
/**
 * @typedef {Object} UserLogsStats
 * @property {number} size - Total size in bytes
 * @property {number} fileCount - Number of files
 * @property {number} userCount - Number of users
 * @property {number} instanceCount - Number of instances
 */
/**
 * @typedef {Object} CleanupResult
 * @property {number} removed - Number of files removed
 * @property {number} spaceSaved - Space saved in bytes
 */
/**
 * Log maintenance service for cleanup, rotation, and monitoring
 * Handles both system logs and user instance logs
 */
declare class LogMaintenanceService {
    systemLogsDir: string;
    userLogsDir: string;
    maintenanceInterval: NodeJS.Timeout | null;
    /** @type {CleanupStats} */
    cleanupStats: CleanupStats;
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
     * @returns {Promise<CleanupResult>} Cleanup statistics
     */
    cleanupUserMCPLogs(mcpPath: string, cutoffDate: Date): Promise<CleanupResult>;
    /**
     * Compress old log files
     */
    compressOldLogs(): Promise<void>;
    /**
     * Compress logs in a specific directory
     * @param {string} directory - Directory to compress logs in
     * @param {Date} cutoffDate - Date cutoff for compression
     * @returns {Promise<number>} Number of files compressed
     */
    compressLogsInDirectory(directory: string, cutoffDate: Date): Promise<number>;
    /**
     * Compress user logs recursively
     * @param {Date} cutoffDate - Date cutoff for compression
     * @returns {Promise<number>} Number of files compressed
     */
    compressUserLogs(cutoffDate: Date): Promise<number>;
    /**
     * Validate log file integrity
     */
    validateLogIntegrity(): Promise<void>;
    /**
     * Validate logs in a directory
     * @param {string} directory - Directory to validate
     * @returns {Promise<ValidationResult>} Validation results
     */
    validateLogsInDirectory(directory: string): Promise<ValidationResult>;
    /**
     * Validate user logs recursively
     * @returns {Promise<ValidationResult>} Validation results
     */
    validateUserLogs(): Promise<ValidationResult>;
    /**
     * Update log statistics and monitoring data
     */
    updateLogStatistics(): Promise<void>;
    /**
     * Get directory statistics
     * @param {string} directory - Directory to analyze
     * @returns {Promise<DirectoryStats>} Directory statistics
     */
    getDirectoryStats(directory: string): Promise<DirectoryStats>;
    /**
     * Get user logs statistics
     * @returns {Promise<UserLogsStats>} User logs statistics
     */
    getUserLogsStats(): Promise<UserLogsStats>;
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
type CleanupStats = {
    /**
     * - Last maintenance run timestamp
     */
    lastRun: string | null;
    /**
     * - Number of files removed
     */
    filesRemoved: number;
    /**
     * - Space freed in bytes
     */
    spaceFreed: number;
    /**
     * - Array of error messages
     */
    errors: string[];
};
type ValidationResult = {
    /**
     * - Number of validated files
     */
    validated: number;
    /**
     * - Number of corrupted files
     */
    corrupted: number;
};
type DirectoryStats = {
    /**
     * - Total size in bytes
     */
    size: number;
    /**
     * - Number of files
     */
    fileCount: number;
};
type UserLogsStats = {
    /**
     * - Total size in bytes
     */
    size: number;
    /**
     * - Number of files
     */
    fileCount: number;
    /**
     * - Number of users
     */
    userCount: number;
    /**
     * - Number of instances
     */
    instanceCount: number;
};
type CleanupResult = {
    /**
     * - Number of files removed
     */
    removed: number;
    /**
     * - Space saved in bytes
     */
    spaceSaved: number;
};
//# sourceMappingURL=logMaintenanceService.d.ts.map