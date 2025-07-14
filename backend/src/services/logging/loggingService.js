import systemLogger from './systemLogger.js';

/**
 * Centralized logging service that routes logs to appropriate destinations
 * Integrates system-wide logging with existing user instance logging
 */

class LoggingService {
	constructor() {
		this.systemLogger = systemLogger;
		this.performanceBuffer = [];
		this.errorBuffer = [];
		this.auditBuffer = [];
	}

	/**
	 * Application lifecycle logging
	 */
	logServerStart(serverInfo) {
		this.systemLogger.startup({
			...serverInfo,
			event: 'server_start',
			timestamp: new Date().toISOString()
		});
	}

	logServerStop(shutdownInfo) {
		this.systemLogger.shutdown({
			...shutdownInfo,
			event: 'server_stop',
			timestamp: new Date().toISOString()
		});
	}

	/**
	 * Authentication and security logging
	 */
	logAuthSuccess(userId, context = {}) {
		this.systemLogger.security('info', 'Authentication successful', {
			userId,
			action: 'login',
			ip: context.ip,
			userAgent: context.userAgent,
			method: context.method || 'session',
			timestamp: new Date().toISOString()
		});
	}

	logAuthFailure(reason, context = {}) {
		this.systemLogger.security('warn', 'Authentication failed', {
			reason,
			action: 'login_failed',
			ip: context.ip,
			userAgent: context.userAgent,
			email: context.email,
			timestamp: new Date().toISOString()
		});
	}

	logAuthLogout(userId, context = {}) {
		this.systemLogger.security('info', 'User logout', {
			userId,
			action: 'logout',
			ip: context.ip,
			sessionDuration: context.sessionDuration,
			timestamp: new Date().toISOString()
		});
	}

	logCredentialValidation(result, context = {}) {
		const level = result.success ? 'info' : 'warn';
		this.systemLogger.security(level, 'Credential validation attempt', {
			userId: context.userId,
			service: context.service,
			success: result.success,
			action: 'credential_validation',
			error: result.error,
			ip: context.ip,
			timestamp: new Date().toISOString()
		});
	}

	logSuspiciousActivity(activity, context = {}) {
		this.systemLogger.security('error', 'Suspicious activity detected', {
			activity,
			userId: context.userId,
			ip: context.ip,
			userAgent: context.userAgent,
			action: 'suspicious_activity',
			severity: context.severity || 'medium',
			timestamp: new Date().toISOString()
		});
	}

	/**
	 * API and performance logging
	 */
	logAPIRequest(req, res, responseTime) {
		const performanceData = {
			method: req.method,
			url: req.originalUrl,
			statusCode: res.statusCode,
			responseTime,
			userId: req.user?.id,
			ip: req.ip,
			userAgent: req.get('User-Agent'),
			timestamp: new Date().toISOString()
		};

		// Log to performance logger
		this.systemLogger.performance('API request completed', performanceData);

		// Buffer for analysis
		this.performanceBuffer.push(performanceData);
		if (this.performanceBuffer.length > 1000) {
			this.performanceBuffer = this.performanceBuffer.slice(-500);
		}

		// Log slow requests as warnings
		if (responseTime > 5000) {
			this.systemLogger.warn('Slow API request detected', {
				...performanceData,
				threshold: 5000
			});
		}
	}

	logDatabaseOperation(operation, context = {}) {
		this.systemLogger.database(operation, {
			query: context.query,
			duration: context.duration,
			affectedRows: context.affectedRows,
			error: context.error,
			connectionPool: context.connectionPool,
			timestamp: new Date().toISOString()
		});

		// Log slow queries
		if (context.duration > 1000) {
			this.systemLogger.warn('Slow database query detected', {
				operation,
				duration: context.duration,
				query: context.query,
				threshold: 1000
			});
		}
	}

	logCacheOperation(operation, context = {}) {
		this.systemLogger.cache(operation, {
			service: context.service,
			instanceId: context.instanceId,
			hit: context.hit,
			miss: context.miss,
			size: context.size,
			duration: context.duration,
			timestamp: new Date().toISOString()
		});
	}

	/**
	 * Instance lifecycle logging
	 */
	logInstanceCreated(instanceData, userId) {
		this.systemLogger.audit('Instance created', {
			userId,
			instanceId: instanceData.instance_id,
			service: instanceData.service_type,
			action: 'create_instance',
			result: 'success',
			timestamp: new Date().toISOString()
		});
	}

	logInstanceDeleted(instanceId, userId, context = {}) {
		this.systemLogger.audit('Instance deleted', {
			userId,
			instanceId,
			service: context.service,
			action: 'delete_instance',
			result: 'success',
			cacheInvalidated: context.cacheInvalidated,
			timestamp: new Date().toISOString()
		});
	}

	logInstanceStatusChange(instanceId, userId, statusChange) {
		this.systemLogger.audit('Instance status changed', {
			userId,
			instanceId,
			action: 'status_change',
			changes: statusChange,
			result: 'success',
			timestamp: new Date().toISOString()
		});
	}

	logInstanceRenewal(instanceId, userId, renewalData) {
		this.systemLogger.audit('Instance renewed', {
			userId,
			instanceId,
			action: 'renew_instance',
			changes: {
				oldExpiration: renewalData.oldExpiration,
				newExpiration: renewalData.newExpiration
			},
			result: 'success',
			timestamp: new Date().toISOString()
		});
	}

	logCredentialUpdate(instanceId, userId, context = {}) {
		this.systemLogger.audit('Credentials updated', {
			userId,
			instanceId,
			service: context.service,
			action: 'update_credentials',
			result: context.success ? 'success' : 'failed',
			validationResult: context.validationResult,
			cacheInvalidated: context.cacheInvalidated,
			timestamp: new Date().toISOString()
		});
	}

	/**
	 * Error and exception logging
	 */
	logError(error, context = {}) {
		const errorData = {
			message: error.message,
			stack: error.stack,
			name: error.name,
			code: error.code,
			userId: context.userId,
			instanceId: context.instanceId,
			operation: context.operation,
			ip: context.ip,
			timestamp: new Date().toISOString()
		};

		this.systemLogger.error('Application error', errorData);

		// Buffer critical errors for alerting
		if (context.critical) {
			this.errorBuffer.push(errorData);
			if (this.errorBuffer.length > 100) {
				this.errorBuffer = this.errorBuffer.slice(-50);
			}
		}
	}

	logUnhandledException(error, context = {}) {
		this.systemLogger.error('Unhandled exception', {
			message: error.message,
			stack: error.stack,
			name: error.name,
			critical: true,
			context,
			timestamp: new Date().toISOString()
		});
	}

	logValidationError(validationError, context = {}) {
		this.systemLogger.warn('Validation error', {
			validationError,
			userId: context.userId,
			endpoint: context.endpoint,
			data: context.data,
			timestamp: new Date().toISOString()
		});
	}


	/**
	 * System health and monitoring
	 */
	logSystemHealth(healthData) {
		this.systemLogger.performance('System health check', {
			memoryUsage: healthData.memoryUsage,
			cpuUsage: healthData.cpuUsage,
			diskUsage: healthData.diskUsage,
			databaseHealth: healthData.databaseHealth,
			cacheHealth: healthData.cacheHealth,
			activeConnections: healthData.activeConnections,
			timestamp: new Date().toISOString()
		});
	}

	logResourceAlert(resourceType, usage, threshold) {
		this.systemLogger.warn('Resource usage alert', {
			resourceType,
			currentUsage: usage,
			threshold,
			severity: usage > threshold * 1.5 ? 'critical' : 'warning',
			timestamp: new Date().toISOString()
		});
	}

	/**
	 * Configuration and deployment logging
	 */
	logConfigChange(configChange, userId) {
		this.systemLogger.audit('Configuration changed', {
			userId,
			action: 'config_change',
			changes: configChange,
			result: 'success',
			timestamp: new Date().toISOString()
		});
	}

	logDeployment(deploymentInfo) {
		this.systemLogger.info('System deployment', {
			version: deploymentInfo.version,
			environment: deploymentInfo.environment,
			deployer: deploymentInfo.deployer,
			changes: deploymentInfo.changes,
			timestamp: new Date().toISOString()
		});
	}

	/**
	 * Analytics and reporting methods
	 */
	getPerformanceMetrics(timeRange = '1h') {
		const cutoffTime = this.getTimeRangeCutoff(timeRange);
		const relevantData = this.performanceBuffer.filter(
			entry => new Date(entry.timestamp) > cutoffTime
		);

		return {
			totalRequests: relevantData.length,
			averageResponseTime: this.calculateAverage(relevantData, 'responseTime'),
			slowRequests: relevantData.filter(entry => entry.responseTime > 5000).length,
			errorRate: relevantData.filter(entry => entry.statusCode >= 400).length / relevantData.length,
			topEndpoints: this.getTopEndpoints(relevantData),
			timeRange
		};
	}

	getErrorSummary(timeRange = '1h') {
		const cutoffTime = this.getTimeRangeCutoff(timeRange);
		const relevantErrors = this.errorBuffer.filter(
			entry => new Date(entry.timestamp) > cutoffTime
		);

		return {
			totalErrors: relevantErrors.length,
			criticalErrors: relevantErrors.filter(entry => entry.critical).length,
			errorsByType: this.groupErrorsByType(relevantErrors),
			recentErrors: relevantErrors.slice(-10),
			timeRange
		};
	}

	/**
	 * Utility methods
	 */
	getTimeRangeCutoff(timeRange) {
		const now = new Date();
		const ranges = {
			'1h': 60 * 60 * 1000,
			'6h': 6 * 60 * 60 * 1000,
			'24h': 24 * 60 * 60 * 1000,
			'7d': 7 * 24 * 60 * 60 * 1000
		};
		
		return new Date(now.getTime() - (ranges[timeRange] || ranges['1h']));
	}

	calculateAverage(data, field) {
		if (data.length === 0) return 0;
		const sum = data.reduce((acc, item) => acc + (item[field] || 0), 0);
		return Math.round(sum / data.length);
	}

	getTopEndpoints(data, limit = 5) {
		const endpointCounts = {};
		data.forEach(entry => {
			const endpoint = `${entry.method} ${entry.url}`;
			endpointCounts[endpoint] = (endpointCounts[endpoint] || 0) + 1;
		});

		return Object.entries(endpointCounts)
			.sort(([,a], [,b]) => b - a)
			.slice(0, limit)
			.map(([endpoint, count]) => ({ endpoint, count }));
	}

	groupErrorsByType(errors) {
		const errorTypes = {};
		errors.forEach(error => {
			const type = error.name || 'UnknownError';
			errorTypes[type] = (errorTypes[type] || 0) + 1;
		});
		return errorTypes;
	}

	/**
	 * Log cleanup and maintenance
	 */
	performMaintenance() {
		// Clean up performance buffer
		if (this.performanceBuffer.length > 2000) {
			this.performanceBuffer = this.performanceBuffer.slice(-1000);
		}

		// Clean up error buffer
		if (this.errorBuffer.length > 200) {
			this.errorBuffer = this.errorBuffer.slice(-100);
		}

		// Trigger log rotation
		this.systemLogger.rotateAllLogs();

		// Log maintenance completion
		this.systemLogger.info('Logging maintenance completed', {
			performanceBufferSize: this.performanceBuffer.length,
			errorBufferSize: this.errorBuffer.length,
			timestamp: new Date().toISOString()
		});
	}

	/**
	 * Generic info logging method
	 * @param {string} message - Log message
	 * @param {Object} context - Additional context data
	 */
	info(message, context = {}) {
		this.systemLogger.info(message, {
			...context,
			timestamp: new Date().toISOString()
		});
	}

	/**
	 * Generic warn logging method
	 * @param {string} message - Log message
	 * @param {Object} context - Additional context data
	 */
	warn(message, context = {}) {
		this.systemLogger.warn(message, {
			...context,
			timestamp: new Date().toISOString()
		});
	}

	/**
	 * Get logging system health
	 */
	getLoggingHealth() {
		return {
			systemLogger: this.systemLogger.getLoggerHealth(),
			buffers: {
				performance: this.performanceBuffer.length,
				errors: this.errorBuffer.length,
				audit: this.auditBuffer.length
			},
			lastMaintenance: new Date().toISOString()
		};
	}
}

// Create and export singleton instance
const loggingService = new LoggingService();

// Set up global error handlers
process.on('uncaughtException', (error) => {
	loggingService.logUnhandledException(error, { 
		type: 'uncaughtException',
		critical: true 
	});
});

process.on('unhandledRejection', (reason, promise) => {
	loggingService.logUnhandledException(new Error(`Unhandled Promise Rejection: ${reason}`), { 
		type: 'unhandledRejection',
		promise: promise.toString(),
		critical: true 
	});
});

export default loggingService;