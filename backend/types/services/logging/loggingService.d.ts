export default loggingService;
declare const loggingService: LoggingService;
/**
 * Centralized logging service that routes logs to appropriate destinations
 * Integrates system-wide logging with existing user instance logging
 */
declare class LoggingService {
    systemLogger: {
        application(level: string, message: string, metadata?: Object): void;
        security(level: string, message: string, securityContext?: Object): void;
        performance(message: string, performanceData?: Object): void;
        audit(action: string, auditContext?: Object): void;
        database(operation: string, dbContext?: Object): void;
        cache(operation: string, cacheContext?: Object): void;
        info(message: any, metadata?: {}): void;
        warn(message: any, metadata?: {}): void;
        error(message: any, metadata?: {}): void;
        debug(message: any, metadata?: {}): void;
        startup(startupInfo?: Object): void;
        shutdown(shutdownInfo?: Object): void;
        sanitizeSecurityData(data: Object): Object;
        sanitizeQuery(query: string): string;
        maskEmail(email: string): string;
        getLoggerHealth(): Object;
        getLogDirectorySize(): Object;
        rotateAllLogs(): void;
        cleanupOldLogs(retentionDays?: number): number;
    };
    performanceBuffer: any[];
    errorBuffer: any[];
    auditBuffer: any[];
    /**
     * Application lifecycle logging
     */
    logServerStart(serverInfo: any): void;
    logServerStop(shutdownInfo: any): void;
    /**
     * Authentication and security logging
     */
    logAuthSuccess(userId: any, context?: {}): void;
    logAuthFailure(reason: any, context?: {}): void;
    logAuthLogout(userId: any, context?: {}): void;
    logCredentialValidation(result: any, context?: {}): void;
    logSuspiciousActivity(activity: any, context?: {}): void;
    /**
     * API and performance logging
     */
    logAPIRequest(req: any, res: any, responseTime: any): void;
    logDatabaseOperation(operation: any, context?: {}): void;
    logCacheOperation(operation: any, context?: {}): void;
    /**
     * Instance lifecycle logging
     */
    logInstanceCreated(instanceData: any, userId: any): void;
    logInstanceDeleted(instanceId: any, userId: any, context?: {}): void;
    logInstanceStatusChange(instanceId: any, userId: any, statusChange: any): void;
    logInstanceRenewal(instanceId: any, userId: any, renewalData: any): void;
    logCredentialUpdate(instanceId: any, userId: any, context?: {}): void;
    /**
     * Error and exception logging
     */
    logError(error: any, context?: {}): void;
    logUnhandledException(error: any, context?: {}): void;
    logValidationError(validationError: any, context?: {}): void;
    /**
     * System health and monitoring
     */
    logSystemHealth(healthData: any): void;
    logResourceAlert(resourceType: any, usage: any, threshold: any): void;
    /**
     * Configuration and deployment logging
     */
    logConfigChange(configChange: any, userId: any): void;
    logDeployment(deploymentInfo: any): void;
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
            count: any;
        }[];
        timeRange: string;
    };
    getErrorSummary(timeRange?: string): {
        totalErrors: number;
        criticalErrors: number;
        errorsByType: {};
        recentErrors: any[];
        timeRange: string;
    };
    /**
     * Utility methods
     */
    getTimeRangeCutoff(timeRange: any): Date;
    calculateAverage(data: any, field: any): number;
    getTopEndpoints(data: any, limit?: number): {
        endpoint: string;
        count: any;
    }[];
    groupErrorsByType(errors: any): {};
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
        systemLogger: Object;
        buffers: {
            performance: number;
            errors: number;
            audit: number;
        };
        lastMaintenance: string;
    };
}
//# sourceMappingURL=loggingService.d.ts.map