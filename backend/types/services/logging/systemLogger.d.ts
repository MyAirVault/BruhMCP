export default systemLogger;
export type SecurityContext = {
    /**
     * - Client IP address
     */
    ip?: string | undefined;
    /**
     * - User agent string
     */
    userAgent?: string | undefined;
    /**
     * - User identifier
     */
    userId?: string | undefined;
    /**
     * - Security action performed
     */
    action?: string | undefined;
    /**
     * - User email address
     */
    email?: string | undefined;
    /**
     * - User password (will be sanitized)
     */
    password?: string | undefined;
    /**
     * - Authentication token (will be sanitized)
     */
    token?: string | undefined;
    /**
     * - API key (will be sanitized)
     */
    apiKey?: string | undefined;
    /**
     * - Secret value (will be sanitized)
     */
    secret?: string | undefined;
    /**
     * - Credential object (will be sanitized)
     */
    credentials?: Object | undefined;
};
export type PerformanceData = {
    /**
     * - Operation duration in ms
     */
    duration?: number | undefined;
    /**
     * - Memory usage
     */
    memory?: number | undefined;
    /**
     * - CPU usage percentage
     */
    cpu?: number | undefined;
    /**
     * - Operation name
     */
    operation?: string | undefined;
};
export type AuditContext = {
    /**
     * - User identifier
     */
    userId?: string | undefined;
    /**
     * - Instance identifier
     */
    instanceId?: string | undefined;
    /**
     * - Changes made
     */
    changes?: Object | undefined;
    /**
     * - Operation result
     */
    result?: string | undefined;
};
export type DatabaseContext = {
    /**
     * - Database error if any
     */
    error?: Error | undefined;
    /**
     * - Query duration in ms
     */
    duration?: number | undefined;
    /**
     * - SQL query string
     */
    query?: string | undefined;
    /**
     * - Number of affected rows
     */
    affectedRows?: number | undefined;
    /**
     * - Connection pool status
     */
    connectionPool?: Object | undefined;
};
export type CacheContext = {
    /**
     * - Service name
     */
    service?: string | undefined;
    /**
     * - Instance identifier
     */
    instanceId?: string | undefined;
    /**
     * - Cache hit indicator
     */
    hit?: boolean | undefined;
    /**
     * - Cache miss indicator
     */
    miss?: boolean | undefined;
    /**
     * - Cache size
     */
    size?: number | undefined;
    /**
     * - Operation duration
     */
    duration?: number | undefined;
};
export type StartupInfo = {
    /**
     * - Component name
     */
    component?: string | undefined;
    /**
     * - Component version
     */
    version?: string | undefined;
    /**
     * - Log directory path
     */
    logDirectory?: string | undefined;
};
export type ShutdownInfo = {
    /**
     * - Shutdown reason
     */
    reason?: string | undefined;
    /**
     * - Whether shutdown was graceful
     */
    graceful?: boolean | undefined;
};
export type LoggerHealth = {
    /**
     * - Health status
     */
    status: string;
    /**
     * - Logger information
     */
    loggers: Array<LoggerInfo>;
    /**
     * - Log directory path
     */
    logDirectory: string;
    /**
     * - Disk usage information
     */
    diskUsage: DirectorySize;
    /**
     * - Last error message
     */
    lastError: string | null;
};
export type LoggerInfo = {
    /**
     * - Logger name
     */
    name: string;
    /**
     * - Log level
     */
    level: string;
    /**
     * - Number of transports
     */
    transports: number;
};
export type DirectorySize = {
    /**
     * - Total size in bytes
     */
    totalBytes: number;
    /**
     * - Total size in MB
     */
    totalMB: number;
    /**
     * - Number of files
     */
    fileCount: number;
    /**
     * - Error message if any
     */
    error?: string | undefined;
};
declare const systemLogger: SystemLogger;
/**
 * System logger class providing categorized logging methods
 */
declare class SystemLogger {
    /**
     * Log application events and general system activity
     * @param {string} level - Log level (info, warn, error, debug)
     * @param {string} message - Log message
     * @param {Object} metadata - Additional metadata
     */
    application(level: string, message: string, metadata?: Object): void;
    /**
     * Log security-related events
     * @param {string} level - Log level
     * @param {string} message - Security event description
     * @param {Object} securityContext - Security-related metadata
     */
    security(level: string, message: string, securityContext?: Object): void;
    /**
     * Log performance metrics and monitoring data
     * @param {string} message - Performance event description
     * @param {Object} performanceData - Performance metrics
     */
    performance(message: string, performanceData?: Object): void;
    /**
     * Log audit trail events for compliance and tracking
     * @param {string} action - Action performed
     * @param {Object} auditContext - Audit context and metadata
     */
    audit(action: string, auditContext?: Object): void;
    /**
     * Log database operations and performance
     * @param {string} operation - Database operation type
     * @param {Object} dbContext - Database context and metrics
     */
    database(operation: string, dbContext?: Object): void;
    /**
     * Log cache operations and performance
     * @param {string} operation - Cache operation type
     * @param {Object} cacheContext - Cache context and metrics
     */
    cache(operation: string, cacheContext?: Object): void;
    /**
     * Convenience methods for common log levels
     */
    info(message: any, metadata?: {}): void;
    warn(message: any, metadata?: {}): void;
    error(message: any, metadata?: {}): void;
    debug(message: any, metadata?: {}): void;
    /**
     * Log system startup and initialization
     * @param {Object} startupInfo - System startup information
     */
    startup(startupInfo?: Object): void;
    /**
     * Log system shutdown and cleanup
     * @param {Object} shutdownInfo - System shutdown information
     */
    shutdown(shutdownInfo?: Object): void;
    /**
     * Sanitize security data to prevent logging sensitive information
     * @param {Object} data - Security context data
     * @returns {Object} Sanitized data
     */
    sanitizeSecurityData(data: Object): Object;
    /**
     * Sanitize database queries to prevent logging sensitive data
     * @param {string} query - SQL query
     * @returns {string} Sanitized query
     */
    sanitizeQuery(query: string): string;
    /**
     * Mask email address for privacy
     * @param {string} email - Email address
     * @returns {string} Masked email
     */
    maskEmail(email: string): string;
    /**
     * Get logger statistics and health information
     * @returns {Object} Logger health and statistics
     */
    getLoggerHealth(): Object;
    /**
     * Get log directory size for monitoring
     * @returns {Object} Directory size information
     */
    getLogDirectorySize(): Object;
    /**
     * Force log rotation for all daily rotate transports
     */
    rotateAllLogs(): void;
    /**
     * Cleanup old log files beyond retention period
     * @param {number} retentionDays - Days to retain logs
     */
    cleanupOldLogs(retentionDays?: number): number;
}
//# sourceMappingURL=systemLogger.d.ts.map