export = loggingService;
declare const loggingService: LoggingService;
declare namespace loggingService {
    export { ServerInfo, ShutdownInfo, AuthContext, ValidationResult, ValidationContext, SuspiciousActivityContext, DatabaseContext, SecurityContextExt, CacheContext, InstanceData, InstanceContext, RenewalData, ErrorContext, HealthData, DeploymentInfo, PerformanceData, ErrorData, ExpressRequest, ExpressResponse };
}
/**
 * Centralized logging service that routes logs to appropriate destinations
 * Integrates system-wide logging with existing user instance logging
 */
/**
 * @typedef {Object} ServerInfo
 * @property {string} port - Server port
 * @property {string} environment - Environment name
 * @property {string} [nodeVersion] - Node.js version
 * @property {string} [platform] - Platform name
 * @property {string} [version] - Application version
 * @property {string} [event] - Event type
 * @property {string} [timestamp] - Event timestamp
 */
/**
 * @typedef {Object} ShutdownInfo
 * @property {string} reason - Shutdown reason
 * @property {boolean} [graceful] - Whether shutdown was graceful
 * @property {number} [uptime] - Server uptime
 * @property {number} [gracefulShutdown] - Whether shutdown was graceful
 * @property {string} [event] - Event type
 * @property {string} [timestamp] - Event timestamp
 */
/**
 * @typedef {Object} AuthContext
 * @property {string} [ip] - Client IP address
 * @property {string} [userAgent] - User agent string
 * @property {string} [method] - Authentication method
 * @property {string} [email] - User email
 * @property {number} [sessionDuration] - Session duration in milliseconds
 * @property {string} [endpoint] - API endpoint
 */
/**
 * @typedef {Object} ValidationResult
 * @property {boolean} success - Whether validation was successful
 * @property {string} [error] - Error message if validation failed
 */
/**
 * @typedef {Object} ValidationContext
 * @property {string|number} [userId] - User ID
 * @property {string} [service] - Service name
 * @property {string} [ip] - Client IP address
 */
/**
 * @typedef {Object} SuspiciousActivityContext
 * @property {string|number} [userId] - User ID
 * @property {string} [ip] - Client IP address
 * @property {string} [userAgent] - User agent string
 * @property {string} [severity] - Activity severity level
 */
/**
 * @typedef {Object} DatabaseContext
 * @property {string} [query] - Database query
 * @property {number} [duration] - Query duration in milliseconds
 * @property {number} [affectedRows] - Number of affected rows
 * @property {Error|string} [error] - Error object or message
 * @property {string} [connectionPool] - Connection pool info
 */
/**
 * @typedef {Object} SecurityContextExt
 * @property {string} [ip] - Client IP address
 * @property {string} [userAgent] - User agent string
 * @property {string} [userId] - User identifier
 * @property {string} [action] - Security action performed
 * @property {string} [email] - User email address
 * @property {string} [reason] - Failure reason
 * @property {string} [activity] - Suspicious activity description
 */
/**
 * @typedef {Object} CacheContext
 * @property {string} [service] - Service name
 * @property {string} [instanceId] - Instance ID
 * @property {boolean} [hit] - Cache hit
 * @property {boolean} [miss] - Cache miss
 * @property {number} [size] - Cache entry size
 * @property {number} [duration] - Operation duration
 * @property {string} [timestamp] - Operation timestamp
 */
/**
 * @typedef {Object} InstanceData
 * @property {string} instance_id - Instance ID
 * @property {string} service_type - Service type
 */
/**
 * @typedef {Object} InstanceContext
 * @property {string} [service] - Service name
 * @property {boolean} [cacheInvalidated] - Whether cache was invalidated
 * @property {boolean} [success] - Operation success status
 * @property {Object} [validationResult] - Validation result
 */
/**
 * @typedef {Object} RenewalData
 * @property {string|Date} oldExpiration - Old expiration date
 * @property {string|Date} newExpiration - New expiration date
 */
/**
 * @typedef {Object} ErrorContext
 * @property {string|number} [userId] - User ID
 * @property {string} [instanceId] - Instance ID
 * @property {string} [operation] - Operation name
 * @property {string} [method] - HTTP method
 * @property {string} [ip] - Client IP address
 * @property {boolean} [critical] - Whether error is critical
 * @property {string} [endpoint] - API endpoint
 * @property {Object} [data] - Additional data
 * @property {Object} [details] - Additional error details
 * @property {string} [type] - Error type
 * @property {Object} [promise] - Promise object for unhandled rejections
 * @property {string} [email] - User email address
 */
/**
 * @typedef {Object} HealthData
 * @property {{used?: number}} [memoryUsage] - Memory usage statistics
 * @property {number} [cpuUsage] - CPU usage percentage
 * @property {Object} [diskUsage] - Disk usage statistics
 * @property {Object} [databaseHealth] - Database health status
 * @property {Object} [cacheHealth] - Cache health status
 * @property {number} [activeConnections] - Number of active connections
 */
/**
 * @typedef {Object} DeploymentInfo
 * @property {string} version - Deployment version
 * @property {string} environment - Target environment
 * @property {string} deployer - Person/system deploying
 * @property {Array<string>} changes - List of changes
 */
/**
 * @typedef {Object} PerformanceData
 * @property {string} method - HTTP method
 * @property {string} url - Request URL
 * @property {number} statusCode - HTTP status code
 * @property {number} responseTime - Response time in milliseconds
 * @property {string|number} [userId] - User ID
 * @property {string} [ip] - Client IP
 * @property {string} [userAgent] - User agent
 * @property {string} timestamp - ISO timestamp
 */
/**
 * @typedef {Object} ErrorData
 * @property {string} message - Error message
 * @property {string} [stack] - Error stack trace
 * @property {string} name - Error name
 * @property {string|number} [code] - Error code
 * @property {string|number} [userId] - User ID
 * @property {string} [instanceId] - Instance ID
 * @property {string} [operation] - Operation name
 * @property {string} [ip] - Client IP
 * @property {string} timestamp - ISO timestamp
 * @property {boolean} [critical] - Whether error is critical
 */
/**
 * @typedef {Object} ExpressRequest
 * @property {string} method - HTTP method
 * @property {string} originalUrl - Original URL
 * @property {string|undefined} ip - Client IP
 * @property {{id?: string|number}|null} [user] - User object (can be null)
 * @property {Function} get - Get header function
 */
/**
 * @typedef {Object} ExpressResponse
 * @property {number} statusCode - HTTP status code
 */
declare class LoggingService {
    systemLogger: {
        application(level: string, message: string, metadata?: Object): void;
        security(level: string, message: string, securityContext?: SecurityContext): void;
        performance(message: string, performanceData?: systemLogger.PerformanceData): void;
        audit(action: string, auditContext?: AuditContext): void;
        database(operation: string, dbContext?: systemLogger.DatabaseContext): void;
        cache(operation: string, cacheContext?: systemLogger.CacheContext): void;
        info(message: string, metadata?: Object): void;
        warn(message: string, metadata?: Object): void;
        error(message: string, metadata?: Object): void;
        debug(message: string, metadata?: Object): void;
        startup(startupInfo?: StartupInfo): void;
        shutdown(shutdownInfo?: systemLogger.ShutdownInfo): void;
        sanitizeSecurityData(data: SecurityContext): SecurityContext;
        sanitizeQuery(query: string): string;
        maskEmail(email: string): string;
        getLoggerHealth(): LoggerHealth;
        getLogDirectorySize(): DirectorySize;
        rotateAllLogs(): void;
        cleanupOldLogs(retentionDays?: number): number;
    };
    /** @type {PerformanceData[]} */
    performanceBuffer: PerformanceData[];
    /** @type {ErrorData[]} */
    errorBuffer: ErrorData[];
    /** @type {Object[]} */
    auditBuffer: Object[];
    /**
     * Application lifecycle logging
     * @param {ServerInfo} serverInfo - Server information
     */
    logServerStart(serverInfo: ServerInfo): void;
    /**
     * @param {ShutdownInfo} shutdownInfo - Shutdown information
     */
    logServerStop(shutdownInfo: ShutdownInfo): void;
    /**
     * Authentication and security logging
     * @param {string|number} userId - User ID
     * @param {AuthContext} context - Authentication context
     */
    logAuthSuccess(userId: string | number, context?: AuthContext): void;
    /**
     * @param {string} reason - Failure reason
     * @param {AuthContext} context - Authentication context
     */
    logAuthFailure(reason: string, context?: AuthContext): void;
    /**
     * @param {string|number} userId - User ID
     * @param {AuthContext} context - Authentication context
     */
    logAuthLogout(userId: string | number, context?: AuthContext): void;
    /**
     * @param {ValidationResult} result - Validation result
     * @param {ValidationContext} context - Validation context
     */
    logCredentialValidation(result: ValidationResult, context?: ValidationContext): void;
    /**
     * @param {string} activity - Suspicious activity description
     * @param {SuspiciousActivityContext} context - Activity context
     */
    logSuspiciousActivity(activity: string, context?: SuspiciousActivityContext): void;
    /**
     * API and performance logging
     * @param {ExpressRequest} req - Express request object
     * @param {ExpressResponse} res - Express response object
     * @param {number} responseTime - Response time in milliseconds
     */
    logAPIRequest(req: ExpressRequest, res: ExpressResponse, responseTime: number): void;
    /**
     * @param {string} operation - Database operation name
     * @param {DatabaseContext} context - Database operation context
     */
    logDatabaseOperation(operation: string, context?: DatabaseContext): void;
    /**
     * @param {string} operation - Cache operation name
     * @param {CacheContext} context - Cache operation context
     */
    logCacheOperation(operation: string, context?: CacheContext): void;
    /**
     * Instance lifecycle logging
     * @param {InstanceData} instanceData - Instance data
     * @param {string|number} userId - User ID
     */
    logInstanceCreated(instanceData: InstanceData, userId: string | number): void;
    /**
     * @param {string} instanceId - Instance ID
     * @param {string|number} userId - User ID
     * @param {InstanceContext} context - Instance context
     */
    logInstanceDeleted(instanceId: string, userId: string | number, context?: InstanceContext): void;
    /**
     * @param {string} instanceId - Instance ID
     * @param {string|number} userId - User ID
     * @param {Object} statusChange - Status change details
     */
    logInstanceStatusChange(instanceId: string, userId: string | number, statusChange: Object): void;
    /**
     * @param {string} instanceId - Instance ID
     * @param {string|number} userId - User ID
     * @param {RenewalData} renewalData - Renewal data
     */
    logInstanceRenewal(instanceId: string, userId: string | number, renewalData: RenewalData): void;
    /**
     * @param {string} instanceId - Instance ID
     * @param {string|number} userId - User ID
     * @param {InstanceContext} context - Instance context
     */
    logCredentialUpdate(instanceId: string, userId: string | number, context?: InstanceContext): void;
    /**
     * Error and exception logging
     * @param {Error} error - Error object
     * @param {ErrorContext} context - Error context
     */
    logError(error: Error, context?: ErrorContext): void;
    /**
     * @param {Error} error - Error object
     * @param {ErrorContext} context - Error context
     */
    logUnhandledException(error: Error, context?: ErrorContext): void;
    /**
     * @param {string|Object} validationError - Validation error
     * @param {ErrorContext} context - Error context
     */
    logValidationError(validationError: string | Object, context?: ErrorContext): void;
    /**
     * System health and monitoring
     * @param {HealthData} healthData - System health data
     */
    logSystemHealth(healthData: HealthData): void;
    /**
     * @param {string} resourceType - Type of resource
     * @param {number} usage - Current usage
     * @param {number} threshold - Alert threshold
     */
    logResourceAlert(resourceType: string, usage: number, threshold: number): void;
    /**
     * Configuration and deployment logging
     * @param {Object} configChange - Configuration changes
     * @param {string|number} userId - User ID
     */
    logConfigChange(configChange: Object, userId: string | number): void;
    /**
     * @param {DeploymentInfo} deploymentInfo - Deployment information
     */
    logDeployment(deploymentInfo: DeploymentInfo): void;
    /**
     * Analytics and reporting methods
     */
    getPerformanceMetrics(timeRange?: string): {
        totalRequests: number;
        averageResponseTime: number;
        slowRequests: number;
        errorRate: number;
        topEndpoints: {
            endpoint: string;
            count: number;
        }[];
        timeRange: string;
    };
    getErrorSummary(timeRange?: string): {
        totalErrors: number;
        criticalErrors: number;
        errorsByType: Record<string, number>;
        recentErrors: ErrorData[];
        timeRange: string;
    };
    /**
     * Utility methods
     * @param {string} timeRange - Time range (1h, 6h, 24h, 7d)
     * @returns {Date} Cutoff date
     */
    getTimeRangeCutoff(timeRange: string): Date;
    /**
     * @param {PerformanceData[]} data - Array of performance data objects
     * @param {'responseTime'|'statusCode'} field - Field to calculate average for
     * @returns {number} Average value
     */
    calculateAverage(data: PerformanceData[], field: "responseTime" | "statusCode"): number;
    /**
     * @param {PerformanceData[]} data - Performance data array
     * @param {number} limit - Number of top endpoints to return
     * @returns {Array<{endpoint: string, count: number}>} Top endpoints
     */
    getTopEndpoints(data: PerformanceData[], limit?: number): Array<{
        endpoint: string;
        count: number;
    }>;
    /**
     * @param {ErrorData[]} errors - Array of error data
     * @returns {Record<string, number>} Error counts by type
     */
    groupErrorsByType(errors: ErrorData[]): Record<string, number>;
    /**
     * Log cleanup and maintenance
     */
    performMaintenance(): void;
    /**
     * Generic info logging method
     * @param {string} message - Log message
     * @param {Object} context - Additional context data
     */
    info(message: string, context?: Object): void;
    /**
     * Generic warn logging method
     * @param {string} message - Log message
     * @param {Object} context - Additional context data
     */
    warn(message: string, context?: Object): void;
    /**
     * Get logging system health
     */
    getLoggingHealth(): {
        systemLogger: systemLogger.LoggerHealth;
        buffers: {
            performance: number;
            errors: number;
            audit: number;
        };
        lastMaintenance: string;
    };
}
type ServerInfo = {
    /**
     * - Server port
     */
    port: string;
    /**
     * - Environment name
     */
    environment: string;
    /**
     * - Node.js version
     */
    nodeVersion?: string | undefined;
    /**
     * - Platform name
     */
    platform?: string | undefined;
    /**
     * - Application version
     */
    version?: string | undefined;
    /**
     * - Event type
     */
    event?: string | undefined;
    /**
     * - Event timestamp
     */
    timestamp?: string | undefined;
};
type ShutdownInfo = {
    /**
     * - Shutdown reason
     */
    reason: string;
    /**
     * - Whether shutdown was graceful
     */
    graceful?: boolean | undefined;
    /**
     * - Server uptime
     */
    uptime?: number | undefined;
    /**
     * - Whether shutdown was graceful
     */
    gracefulShutdown?: number | undefined;
    /**
     * - Event type
     */
    event?: string | undefined;
    /**
     * - Event timestamp
     */
    timestamp?: string | undefined;
};
type AuthContext = {
    /**
     * - Client IP address
     */
    ip?: string | undefined;
    /**
     * - User agent string
     */
    userAgent?: string | undefined;
    /**
     * - Authentication method
     */
    method?: string | undefined;
    /**
     * - User email
     */
    email?: string | undefined;
    /**
     * - Session duration in milliseconds
     */
    sessionDuration?: number | undefined;
    /**
     * - API endpoint
     */
    endpoint?: string | undefined;
};
type ValidationResult = {
    /**
     * - Whether validation was successful
     */
    success: boolean;
    /**
     * - Error message if validation failed
     */
    error?: string | undefined;
};
type ValidationContext = {
    /**
     * - User ID
     */
    userId?: string | number | undefined;
    /**
     * - Service name
     */
    service?: string | undefined;
    /**
     * - Client IP address
     */
    ip?: string | undefined;
};
type SuspiciousActivityContext = {
    /**
     * - User ID
     */
    userId?: string | number | undefined;
    /**
     * - Client IP address
     */
    ip?: string | undefined;
    /**
     * - User agent string
     */
    userAgent?: string | undefined;
    /**
     * - Activity severity level
     */
    severity?: string | undefined;
};
type DatabaseContext = {
    /**
     * - Database query
     */
    query?: string | undefined;
    /**
     * - Query duration in milliseconds
     */
    duration?: number | undefined;
    /**
     * - Number of affected rows
     */
    affectedRows?: number | undefined;
    /**
     * - Error object or message
     */
    error?: string | Error | undefined;
    /**
     * - Connection pool info
     */
    connectionPool?: string | undefined;
};
type SecurityContextExt = {
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
     * - Failure reason
     */
    reason?: string | undefined;
    /**
     * - Suspicious activity description
     */
    activity?: string | undefined;
};
type CacheContext = {
    /**
     * - Service name
     */
    service?: string | undefined;
    /**
     * - Instance ID
     */
    instanceId?: string | undefined;
    /**
     * - Cache hit
     */
    hit?: boolean | undefined;
    /**
     * - Cache miss
     */
    miss?: boolean | undefined;
    /**
     * - Cache entry size
     */
    size?: number | undefined;
    /**
     * - Operation duration
     */
    duration?: number | undefined;
    /**
     * - Operation timestamp
     */
    timestamp?: string | undefined;
};
type InstanceData = {
    /**
     * - Instance ID
     */
    instance_id: string;
    /**
     * - Service type
     */
    service_type: string;
};
type InstanceContext = {
    /**
     * - Service name
     */
    service?: string | undefined;
    /**
     * - Whether cache was invalidated
     */
    cacheInvalidated?: boolean | undefined;
    /**
     * - Operation success status
     */
    success?: boolean | undefined;
    /**
     * - Validation result
     */
    validationResult?: Object | undefined;
};
type RenewalData = {
    /**
     * - Old expiration date
     */
    oldExpiration: string | Date;
    /**
     * - New expiration date
     */
    newExpiration: string | Date;
};
type ErrorContext = {
    /**
     * - User ID
     */
    userId?: string | number | undefined;
    /**
     * - Instance ID
     */
    instanceId?: string | undefined;
    /**
     * - Operation name
     */
    operation?: string | undefined;
    /**
     * - HTTP method
     */
    method?: string | undefined;
    /**
     * - Client IP address
     */
    ip?: string | undefined;
    /**
     * - Whether error is critical
     */
    critical?: boolean | undefined;
    /**
     * - API endpoint
     */
    endpoint?: string | undefined;
    /**
     * - Additional data
     */
    data?: Object | undefined;
    /**
     * - Additional error details
     */
    details?: Object | undefined;
    /**
     * - Error type
     */
    type?: string | undefined;
    /**
     * - Promise object for unhandled rejections
     */
    promise?: Object | undefined;
    /**
     * - User email address
     */
    email?: string | undefined;
};
type HealthData = {
    /**
     * - Memory usage statistics
     */
    memoryUsage?: {
        used?: number;
    } | undefined;
    /**
     * - CPU usage percentage
     */
    cpuUsage?: number | undefined;
    /**
     * - Disk usage statistics
     */
    diskUsage?: Object | undefined;
    /**
     * - Database health status
     */
    databaseHealth?: Object | undefined;
    /**
     * - Cache health status
     */
    cacheHealth?: Object | undefined;
    /**
     * - Number of active connections
     */
    activeConnections?: number | undefined;
};
type DeploymentInfo = {
    /**
     * - Deployment version
     */
    version: string;
    /**
     * - Target environment
     */
    environment: string;
    /**
     * - Person/system deploying
     */
    deployer: string;
    /**
     * - List of changes
     */
    changes: Array<string>;
};
type PerformanceData = {
    /**
     * - HTTP method
     */
    method: string;
    /**
     * - Request URL
     */
    url: string;
    /**
     * - HTTP status code
     */
    statusCode: number;
    /**
     * - Response time in milliseconds
     */
    responseTime: number;
    /**
     * - User ID
     */
    userId?: string | number | undefined;
    /**
     * - Client IP
     */
    ip?: string | undefined;
    /**
     * - User agent
     */
    userAgent?: string | undefined;
    /**
     * - ISO timestamp
     */
    timestamp: string;
};
type ErrorData = {
    /**
     * - Error message
     */
    message: string;
    /**
     * - Error stack trace
     */
    stack?: string | undefined;
    /**
     * - Error name
     */
    name: string;
    /**
     * - Error code
     */
    code?: string | number | undefined;
    /**
     * - User ID
     */
    userId?: string | number | undefined;
    /**
     * - Instance ID
     */
    instanceId?: string | undefined;
    /**
     * - Operation name
     */
    operation?: string | undefined;
    /**
     * - Client IP
     */
    ip?: string | undefined;
    /**
     * - ISO timestamp
     */
    timestamp: string;
    /**
     * - Whether error is critical
     */
    critical?: boolean | undefined;
};
type ExpressRequest = {
    /**
     * - HTTP method
     */
    method: string;
    /**
     * - Original URL
     */
    originalUrl: string;
    /**
     * - Client IP
     */
    ip: string | undefined;
    /**
     * - User object (can be null)
     */
    user?: {
        id?: string | number;
    } | null | undefined;
    /**
     * - Get header function
     */
    get: Function;
};
type ExpressResponse = {
    /**
     * - HTTP status code
     */
    statusCode: number;
};
import systemLogger = require("./systemLogger.js");
//# sourceMappingURL=loggingService.d.ts.map