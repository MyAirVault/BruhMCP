import systemLogger from './systemLogger.js';

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
 * @property {string} ip - Client IP (guaranteed to be string, not undefined)
 * @property {{id?: string|number}|null} [user] - User object (can be null)
 * @property {Function} get - Get header function
 */

/**
 * @typedef {Object} ExpressResponse
 * @property {number} statusCode - HTTP status code
 */

class LoggingService {
	constructor() {
		this.systemLogger = systemLogger;
		/** @type {PerformanceData[]} */
		this.performanceBuffer = [];
		/** @type {ErrorData[]} */
		this.errorBuffer = [];
		/** @type {Object[]} */
		this.auditBuffer = [];
	}

	/**
	 * Application lifecycle logging
	 * @param {ServerInfo} serverInfo - Server information
	 */
	logServerStart(serverInfo) {
		this.systemLogger.startup({
			component: 'server',
			version: serverInfo.version,
			logDirectory: './logs/system'
		});
	}

	/**
	 * @param {ShutdownInfo} shutdownInfo - Shutdown information
	 */
	logServerStop(shutdownInfo) {
		this.systemLogger.shutdown({
			reason: shutdownInfo.reason,
			graceful: shutdownInfo.gracefulShutdown === 1
		});
	}

	/**
	 * Authentication and security logging
	 * @param {string|number} userId - User ID
	 * @param {AuthContext} context - Authentication context
	 */
	logAuthSuccess(userId, context = {}) {
		/** @type {import('./systemLogger.js').SecurityContext} */
		const securityContext = {
			userId: String(userId),
			action: 'login',
			ip: context.ip,
			userAgent: context.userAgent
		};
		this.systemLogger.security('info', 'Authentication successful', securityContext);
	}

	/**
	 * @param {string} reason - Failure reason
	 * @param {AuthContext} context - Authentication context
	 */
	logAuthFailure(reason, context = {}) {
		/** @type {SecurityContextExt} */
		const securityContext = {
			action: 'login_failed',
			ip: context.ip,
			userAgent: context.userAgent,
			email: context.email,
			reason
		};
		this.systemLogger.security('warn', 'Authentication failed', securityContext);
	}

	/**
	 * @param {string|number} userId - User ID
	 * @param {AuthContext} context - Authentication context
	 */
	logAuthLogout(userId, context = {}) {
		this.systemLogger.security('info', 'User logout', {
			userId: String(userId),
			action: 'logout',
			ip: context.ip
		});
	}

	/**
	 * @param {ValidationResult} result - Validation result
	 * @param {ValidationContext} context - Validation context
	 */
	logCredentialValidation(result, context = {}) {
		const level = result.success ? 'info' : 'warn';
		this.systemLogger.security(level, 'Credential validation attempt', {
			userId: context.userId ? String(context.userId) : undefined,
			action: 'credential_validation',
			ip: context.ip
		});
	}

	/**
	 * @param {string} activity - Suspicious activity description
	 * @param {SuspiciousActivityContext} context - Activity context
	 */
	logSuspiciousActivity(activity, context = {}) {
		/** @type {SecurityContextExt} */
		const securityContext = {
			userId: context.userId ? String(context.userId) : undefined,
			ip: context.ip,
			userAgent: context.userAgent,
			action: 'suspicious_activity',
			activity
		};
		this.systemLogger.security('error', 'Suspicious activity detected', securityContext);
	}

	/**
	 * API and performance logging
	 * @param {ExpressRequest} req - Express request object
	 * @param {ExpressResponse} res - Express response object
	 * @param {number} responseTime - Response time in milliseconds
	 */
	logAPIRequest(req, res, responseTime) {
		/** @type {PerformanceData} */
		const performanceData = {
			method: req.method,
			url: req.originalUrl,
			statusCode: res.statusCode,
			responseTime,
			userId: req.user?.id ? String(req.user.id) : undefined,
			ip: req.ip,
			userAgent: req.get('User-Agent'),
			timestamp: new Date().toISOString()
		};

		// Log to performance logger
		this.systemLogger.performance('API request completed', {
			duration: responseTime,
			operation: `${req.method} ${req.originalUrl}`
		});

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

	/**
	 * @param {string} operation - Database operation name
	 * @param {DatabaseContext} context - Database operation context
	 */
	logDatabaseOperation(operation, context = {}) {
		this.systemLogger.database(operation, {
			query: context.query,
			duration: context.duration,
			affectedRows: context.affectedRows,
			error: context.error instanceof Error ? context.error : (typeof context.error === 'string' ? new Error(context.error) : undefined),
			connectionPool: context.connectionPool
		});

		// Log slow queries
		if (context.duration && context.duration > 1000) {
			this.systemLogger.warn('Slow database query detected', {
				operation,
				duration: context.duration,
				query: context.query,
				threshold: 1000
			});
		}
	}

	/**
	 * @param {string} operation - Cache operation name
	 * @param {CacheContext} context - Cache operation context
	 */
	logCacheOperation(operation, context = {}) {
		this.systemLogger.cache(operation, {
			service: context.service,
			instanceId: context.instanceId,
			hit: context.hit,
			miss: context.miss,
			size: context.size,
			duration: context.duration
		});
	}

	/**
	 * Instance lifecycle logging
	 * @param {InstanceData} instanceData - Instance data
	 * @param {string|number} userId - User ID
	 */
	logInstanceCreated(instanceData, userId) {
		this.systemLogger.audit('Instance created', {
			userId: String(userId),
			instanceId: instanceData.instance_id,
			result: 'success'
		});
	}

	/**
	 * @param {string} instanceId - Instance ID
	 * @param {string|number} userId - User ID
	 * @param {InstanceContext} context - Instance context
	 */
	logInstanceDeleted(instanceId, userId, context = {}) {
		this.systemLogger.audit('Instance deleted', {
			userId: String(userId),
			instanceId,
			result: context.success !== false ? 'success' : 'failed'
		});
	}

	/**
	 * @param {string} instanceId - Instance ID
	 * @param {string|number} userId - User ID
	 * @param {Object} statusChange - Status change details
	 */
	logInstanceStatusChange(instanceId, userId, statusChange) {
		this.systemLogger.audit('Instance status changed', {
			userId: String(userId),
			instanceId,
			changes: statusChange,
			result: 'success'
		});
	}

	/**
	 * @param {string} instanceId - Instance ID
	 * @param {string|number} userId - User ID
	 * @param {RenewalData} renewalData - Renewal data
	 */
	logInstanceRenewal(instanceId, userId, renewalData) {
		this.systemLogger.audit('Instance renewed', {
			userId: String(userId),
			instanceId,
			changes: {
				oldExpiration: renewalData.oldExpiration,
				newExpiration: renewalData.newExpiration
			},
			result: 'success'
		});
	}

	/**
	 * @param {string} instanceId - Instance ID
	 * @param {string|number} userId - User ID
	 * @param {InstanceContext} context - Instance context
	 */
	logCredentialUpdate(instanceId, userId, context = {}) {
		this.systemLogger.audit('Credentials updated', {
			userId: String(userId),
			instanceId,
			result: context.success ? 'success' : 'failed'
		});
	}

	/**
	 * Error and exception logging
	 * @param {Error} error - Error object
	 * @param {ErrorContext} context - Error context
	 */
	logError(error, context = {}) {
		/** @type {ErrorData} */
		const errorData = {
			message: error.message,
			stack: error.stack,
			name: error.name,
			code: (error instanceof Error && 'code' in error) ? (typeof error.code === 'string' || typeof error.code === 'number' ? String(error.code) : undefined) : undefined,
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

	/**
	 * @param {Error} error - Error object
	 * @param {ErrorContext} context - Error context
	 */
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

	/**
	 * @param {string|Object} validationError - Validation error
	 * @param {ErrorContext} context - Error context
	 */
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
	 * @param {HealthData} healthData - System health data
	 */
	logSystemHealth(healthData) {
		this.systemLogger.performance('System health check', {
			memory: healthData.memoryUsage?.used || 0,
			cpu: healthData.cpuUsage,
			operation: 'health_check'
		});
	}

	/**
	 * @param {string} resourceType - Type of resource
	 * @param {number} usage - Current usage
	 * @param {number} threshold - Alert threshold
	 */
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
	 * @param {Object} configChange - Configuration changes
	 * @param {string|number} userId - User ID
	 */
	logConfigChange(configChange, userId) {
		this.systemLogger.audit('Configuration changed', {
			userId: String(userId),
			changes: configChange,
			result: 'success'
		});
	}

	/**
	 * @param {DeploymentInfo} deploymentInfo - Deployment information
	 */
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
	 * @param {string} timeRange - Time range (1h, 6h, 24h, 7d)
	 * @returns {Date} Cutoff date
	 */
	getTimeRangeCutoff(timeRange) {
		const now = new Date();
		/** @type {Record<string, number>} */
		const ranges = {
			'1h': 60 * 60 * 1000,
			'6h': 6 * 60 * 60 * 1000,
			'24h': 24 * 60 * 60 * 1000,
			'7d': 7 * 24 * 60 * 60 * 1000
		};
		
		return new Date(now.getTime() - (ranges[timeRange] || ranges['1h']));
	}

	/**
	 * @param {PerformanceData[]} data - Array of performance data objects
	 * @param {'responseTime'|'statusCode'} field - Field to calculate average for
	 * @returns {number} Average value
	 */
	calculateAverage(data, field) {
		if (data.length === 0) return 0;
		const sum = data.reduce((acc, item) => {
			const value = item[field];
			return acc + (typeof value === 'number' ? value : 0);
		}, 0);
		return Math.round(sum / data.length);
	}

	/**
	 * @param {PerformanceData[]} data - Performance data array
	 * @param {number} limit - Number of top endpoints to return
	 * @returns {Array<{endpoint: string, count: number}>} Top endpoints
	 */
	getTopEndpoints(data, limit = 5) {
		/** @type {Record<string, number>} */
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

	/**
	 * @param {ErrorData[]} errors - Array of error data
	 * @returns {Record<string, number>} Error counts by type
	 */
	groupErrorsByType(errors) {
		/** @type {Record<string, number>} */
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