export = systemLogger;
declare const systemLogger: SystemLogger;
declare namespace systemLogger {
    export { SecurityContext, PerformanceData, AuditContext, DatabaseContext, CacheContext, StartupInfo, ShutdownInfo, LoggerHealth, LoggerInfo, DirectorySize };
}
/**
 * System logger class providing categorized logging methods
 */
declare class SystemLogger {
    /**
     * Log application events and general system activity
     * @param {string} level - Log level (info, warn, error, debug)
     * @param {string} message - Log message
     * @param {Object} metadata - Additional metadata
     * @returns {void}
     */
    application(level: string, message: string, metadata?: Object): void;
    /**
     * Log security-related events
     * @param {string} level - Log level
     * @param {string} message - Security event description
     * @param {SecurityContext} securityContext - Security-related metadata
     * @returns {void}
     */
    security(level: string, message: string, securityContext?: SecurityContext): void;
    /**
     * Log performance metrics and monitoring data
     * @param {string} message - Performance event description
     * @param {PerformanceData} performanceData - Performance metrics
     * @returns {void}
     */
    performance(message: string, performanceData?: PerformanceData): void;
    /**
     * Log audit trail events for compliance and tracking
     * @param {string} action - Action performed
     * @param {AuditContext} auditContext - Audit context and metadata
     * @returns {void}
     */
    audit(action: string, auditContext?: AuditContext): void;
    /**
     * Log database operations and performance
     * @param {string} operation - Database operation type
     * @param {DatabaseContext} dbContext - Database context and metrics
     * @returns {void}
     */
    database(operation: string, dbContext?: DatabaseContext): void;
    /**
     * Log cache operations and performance
     * @param {string} operation - Cache operation type
     * @param {CacheContext} cacheContext - Cache context and metrics
     * @returns {void}
     */
    cache(operation: string, cacheContext?: CacheContext): void;
    /**
     * Convenience methods for common log levels
     * @param {string} message - Log message
     * @param {Object} metadata - Additional metadata
     * @returns {void}
     */
    info(message: string, metadata?: Object): void;
    /**
     * Log warning message
     * @param {string} message - Warning message
     * @param {Object} metadata - Additional metadata
     * @returns {void}
     */
    warn(message: string, metadata?: Object): void;
    /**
     * Log error message
     * @param {string} message - Error message
     * @param {Object} metadata - Additional metadata
     * @returns {void}
     */
    error(message: string, metadata?: Object): void;
    /**
     * Log debug message
     * @param {string} message - Debug message
     * @param {Object} metadata - Additional metadata
     * @returns {void}
     */
    debug(message: string, metadata?: Object): void;
    /**
     * Log system startup and initialization
     * @param {StartupInfo} startupInfo - System startup information
     * @returns {void}
     */
    startup(startupInfo?: StartupInfo): void;
    /**
     * Log system shutdown and cleanup
     * @param {ShutdownInfo} shutdownInfo - System shutdown information
     * @returns {void}
     */
    shutdown(shutdownInfo?: ShutdownInfo): void;
    /**
     * Sanitize security data to prevent logging sensitive information
     * @param {SecurityContext} data - Security context data
     * @returns {SecurityContext} Sanitized data
     */
    sanitizeSecurityData(data: SecurityContext): SecurityContext;
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
     * @returns {LoggerHealth} Logger health and statistics
     */
    getLoggerHealth(): LoggerHealth;
    /**
     * Get log directory size for monitoring
     * @returns {DirectorySize} Directory size information
     */
    getLogDirectorySize(): DirectorySize;
    /**
     * Force log rotation for all daily rotate transports
     * @returns {void}
     */
    rotateAllLogs(): void;
    /**
     * Cleanup old log files beyond retention period
     * @param {number} retentionDays - Days to retain logs
     * @returns {number} Number of files cleaned up
     */
    cleanupOldLogs(retentionDays?: number): number;
}
type SecurityContext = {
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
type PerformanceData = {
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
type AuditContext = {
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
type DatabaseContext = {
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
type CacheContext = {
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
type StartupInfo = {
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
type ShutdownInfo = {
    /**
     * - Shutdown reason
     */
    reason?: string | undefined;
    /**
     * - Whether shutdown was graceful
     */
    graceful?: boolean | undefined;
};
type LoggerHealth = {
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
type LoggerInfo = {
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
type DirectorySize = {
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
//# sourceMappingURL=systemLogger.d.ts.map