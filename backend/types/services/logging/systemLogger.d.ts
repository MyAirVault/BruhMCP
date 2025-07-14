export default systemLogger;
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