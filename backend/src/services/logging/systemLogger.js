import winston from 'winston';
import path from 'path';
import fs from 'fs';
import DailyRotateFile from 'winston-daily-rotate-file';

/**
 * @typedef {Object} SecurityContext
 * @property {string} [ip] - Client IP address
 * @property {string} [userAgent] - User agent string
 * @property {string} [userId] - User identifier
 * @property {string} [action] - Security action performed
 * @property {string} [email] - User email address
 * @property {string} [password] - User password (will be sanitized)
 * @property {string} [token] - Authentication token (will be sanitized)
 * @property {string} [apiKey] - API key (will be sanitized)
 * @property {string} [secret] - Secret value (will be sanitized)
 * @property {Object} [credentials] - Credential object (will be sanitized)
 */

/**
 * @typedef {Object} PerformanceData
 * @property {number} [duration] - Operation duration in ms
 * @property {number} [memory] - Memory usage
 * @property {number} [cpu] - CPU usage percentage
 * @property {string} [operation] - Operation name
 */

/**
 * @typedef {Object} AuditContext
 * @property {string} [userId] - User identifier
 * @property {string} [instanceId] - Instance identifier
 * @property {Object} [changes] - Changes made
 * @property {string} [result] - Operation result
 */

/**
 * @typedef {Object} DatabaseContext
 * @property {Error} [error] - Database error if any
 * @property {number} [duration] - Query duration in ms
 * @property {string} [query] - SQL query string
 * @property {number} [affectedRows] - Number of affected rows
 * @property {Object} [connectionPool] - Connection pool status
 */

/**
 * @typedef {Object} CacheContext
 * @property {string} [service] - Service name
 * @property {string} [instanceId] - Instance identifier
 * @property {boolean} [hit] - Cache hit indicator
 * @property {boolean} [miss] - Cache miss indicator
 * @property {number} [size] - Cache size
 * @property {number} [duration] - Operation duration
 */

/**
 * @typedef {Object} StartupInfo
 * @property {string} [component] - Component name
 * @property {string} [version] - Component version
 * @property {string} [logDirectory] - Log directory path
 */

/**
 * @typedef {Object} ShutdownInfo
 * @property {string} [reason] - Shutdown reason
 * @property {boolean} [graceful] - Whether shutdown was graceful
 */

/**
 * @typedef {Object} LoggerHealth
 * @property {string} status - Health status
 * @property {Array<LoggerInfo>} loggers - Logger information
 * @property {string} logDirectory - Log directory path
 * @property {DirectorySize} diskUsage - Disk usage information
 * @property {string|null} lastError - Last error message
 */

/**
 * @typedef {Object} LoggerInfo
 * @property {string} name - Logger name
 * @property {string} level - Log level
 * @property {number} transports - Number of transports
 */

/**
 * @typedef {Object} DirectorySize
 * @property {number} totalBytes - Total size in bytes
 * @property {number} totalMB - Total size in MB
 * @property {number} fileCount - Number of files
 * @property {string} [error] - Error message if any
 */

/**
 * Enhanced system logging service using Winston
 * Provides structured logging for system-wide events, errors, and monitoring
 */

// Ensure logs directory exists
const LOGS_DIR = path.resolve('./logs/system');
if (!fs.existsSync(LOGS_DIR)) {
	fs.mkdirSync(LOGS_DIR, { recursive: true });
}

/**
 * Custom log format for structured JSON logging
 */
const logFormat = winston.format.combine(
	winston.format.timestamp({
		format: 'YYYY-MM-DDTHH:mm:ss.SSSZ'
	}),
	winston.format.errors({ stack: true }),
	winston.format.json(),
	winston.format.printf((info) => {
		const { timestamp, level, message, service, category, metadata, ...rest } = info;
		const logEntry = {
			timestamp,
			level,
			message,
			service: service || 'mcp-backend',
			category: category || 'general',
			metadata: metadata || {},
			...rest
		};

		// Include stack trace for errors
		const stack = 'stack' in info ? info.stack : undefined;
		if (stack) {
			/** @type {any} */ (logEntry).stack = stack;
		}

		return JSON.stringify(logEntry);
	})
);

/**
 * Create daily rotate file transport
 * @param {string} filename - Base filename
 * @param {string} level - Log level
 * @returns {DailyRotateFile} Transport instance
 */
function createRotateTransport(filename, level = 'info') {
	return new DailyRotateFile({
		filename: path.join(LOGS_DIR, `${filename}-%DATE%.log`),
		datePattern: 'YYYY-MM-DD',
		zippedArchive: true,
		maxSize: '50m',
		maxFiles: '90d',
		level: level,
		format: logFormat,
		handleExceptions: filename === 'application',
		handleRejections: filename === 'application'
	});
}

/**
 * System logger instances for different categories
 */
const loggers = {
	// Main application logger
	application: winston.createLogger({
		level: process.env.LOG_LEVEL || 'info',
		format: logFormat,
		transports: [
			createRotateTransport('application'),
			new winston.transports.Console({
				format: winston.format.combine(
					winston.format.colorize(),
					winston.format.simple()
				),
				level: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
			})
		],
		defaultMeta: { service: 'mcp-backend', category: 'application' }
	}),

	// Security and authentication logger
	security: winston.createLogger({
		level: 'info',
		format: logFormat,
		transports: [
			createRotateTransport('security'),
			new winston.transports.Console({
				format: winston.format.combine(
					winston.format.colorize(),
					winston.format.simple()
				),
				level: 'warn'
			})
		],
		defaultMeta: { service: 'mcp-backend', category: 'security' }
	}),

	// Performance monitoring logger
	performance: winston.createLogger({
		level: 'info',
		format: logFormat,
		transports: [
			createRotateTransport('performance'),
		],
		defaultMeta: { service: 'mcp-backend', category: 'performance' }
	}),

	// Audit trail logger
	audit: winston.createLogger({
		level: 'info',
		format: logFormat,
		transports: [
			createRotateTransport('audit'),
		],
		defaultMeta: { service: 'mcp-backend', category: 'audit' }
	}),

	// Database operations logger
	database: winston.createLogger({
		level: 'info',
		format: logFormat,
		transports: [
			createRotateTransport('database'),
		],
		defaultMeta: { service: 'mcp-backend', category: 'database' }
	}),

	// Cache operations logger
	cache: winston.createLogger({
		level: 'info',
		format: logFormat,
		transports: [
			createRotateTransport('cache'),
		],
		defaultMeta: { service: 'mcp-backend', category: 'cache' }
	}),

};

/**
 * System logger class providing categorized logging methods
 */
class SystemLogger {
	/**
	 * Log application events and general system activity
	 * @param {string} level - Log level (info, warn, error, debug)
	 * @param {string} message - Log message
	 * @param {Object} metadata - Additional metadata
	 * @returns {void}
	 */
	application(level, message, metadata = {}) {
		loggers.application.log(level, message, { metadata });
	}

	/**
	 * Log security-related events
	 * @param {string} level - Log level
	 * @param {string} message - Security event description
	 * @param {SecurityContext} securityContext - Security-related metadata
	 * @returns {void}
	 */
	security(level, message, securityContext = {}) {
		const sanitizedContext = this.sanitizeSecurityData(securityContext);
		loggers.security.log(level, message, { 
			metadata: {
				...sanitizedContext,
				ip: securityContext.ip,
				userAgent: securityContext.userAgent,
				userId: securityContext.userId,
				action: securityContext.action
			}
		});
	}

	/**
	 * Log performance metrics and monitoring data
	 * @param {string} message - Performance event description
	 * @param {PerformanceData} performanceData - Performance metrics
	 * @returns {void}
	 */
	performance(message, performanceData = {}) {
		loggers.performance.info(message, { 
			metadata: {
				...performanceData,
				timestamp: new Date().toISOString()
			}
		});
	}

	/**
	 * Log audit trail events for compliance and tracking
	 * @param {string} action - Action performed
	 * @param {AuditContext} auditContext - Audit context and metadata
	 * @returns {void}
	 */
	audit(action, auditContext = {}) {
		loggers.audit.info(`Audit: ${action}`, { 
			metadata: {
				action,
				userId: auditContext.userId,
				instanceId: auditContext.instanceId,
				changes: auditContext.changes,
				result: auditContext.result,
				timestamp: new Date().toISOString()
			}
		});
	}

	/**
	 * Log database operations and performance
	 * @param {string} operation - Database operation type
	 * @param {DatabaseContext} dbContext - Database context and metrics
	 * @returns {void}
	 */
	database(operation, dbContext = {}) {
		const level = dbContext.error ? 'error' : 'info';
		loggers.database.log(level, `Database: ${operation}`, { 
			metadata: {
				operation,
				duration: dbContext.duration,
				query: dbContext.query ? this.sanitizeQuery(dbContext.query) : undefined,
				error: dbContext.error,
				affectedRows: dbContext.affectedRows,
				connectionPool: dbContext.connectionPool
			}
		});
	}

	/**
	 * Log cache operations and performance
	 * @param {string} operation - Cache operation type
	 * @param {CacheContext} cacheContext - Cache context and metrics
	 * @returns {void}
	 */
	cache(operation, cacheContext = {}) {
		loggers.cache.info(`Cache: ${operation}`, { 
			metadata: {
				operation,
				service: cacheContext.service,
				instanceId: cacheContext.instanceId,
				hit: cacheContext.hit,
				miss: cacheContext.miss,
				size: cacheContext.size,
				duration: cacheContext.duration
			}
		});
	}


	/**
	 * Convenience methods for common log levels
	 * @param {string} message - Log message
	 * @param {Object} metadata - Additional metadata
	 * @returns {void}
	 */
	info(message, metadata = {}) {
		this.application('info', message, metadata);
	}

	/**
	 * Log warning message
	 * @param {string} message - Warning message
	 * @param {Object} metadata - Additional metadata
	 * @returns {void}
	 */
	warn(message, metadata = {}) {
		this.application('warn', message, metadata);
	}

	/**
	 * Log error message
	 * @param {string} message - Error message
	 * @param {Object} metadata - Additional metadata
	 * @returns {void}
	 */
	error(message, metadata = {}) {
		this.application('error', message, metadata);
	}

	/**
	 * Log debug message
	 * @param {string} message - Debug message
	 * @param {Object} metadata - Additional metadata
	 * @returns {void}
	 */
	debug(message, metadata = {}) {
		this.application('debug', message, metadata);
	}

	/**
	 * Log system startup and initialization
	 * @param {StartupInfo} startupInfo - System startup information
	 * @returns {void}
	 */
	startup(startupInfo = {}) {
		this.application('info', 'System startup initiated', {
			nodeVersion: process.version,
			platform: process.platform,
			architecture: process.arch,
			environment: process.env.NODE_ENV,
			processId: process.pid,
			workingDirectory: process.cwd(),
			...startupInfo
		});
	}

	/**
	 * Log system shutdown and cleanup
	 * @param {ShutdownInfo} shutdownInfo - System shutdown information
	 * @returns {void}
	 */
	shutdown(shutdownInfo = {}) {
		this.application('info', 'System shutdown initiated', {
			uptime: process.uptime(),
			memoryUsage: process.memoryUsage(),
			reason: shutdownInfo.reason || 'unknown',
			graceful: shutdownInfo.graceful !== false,
			...shutdownInfo
		});
	}

	/**
	 * Sanitize security data to prevent logging sensitive information
	 * @param {SecurityContext} data - Security context data
	 * @returns {SecurityContext} Sanitized data
	 */
	sanitizeSecurityData(data) {
		const sanitized = /** @type {SecurityContext} */ ({ ...data });
		
		// Remove sensitive fields
		if ('password' in sanitized) delete sanitized.password;
		if ('token' in sanitized) delete sanitized.token;
		if ('apiKey' in sanitized) delete sanitized.apiKey;
		if ('secret' in sanitized) delete sanitized.secret;
		if ('credentials' in sanitized) delete sanitized.credentials;
		
		// Mask email addresses partially
		if (sanitized.email) {
			sanitized.email = this.maskEmail(sanitized.email);
		}
		
		return sanitized;
	}

	/**
	 * Sanitize database queries to prevent logging sensitive data
	 * @param {string} query - SQL query
	 * @returns {string} Sanitized query
	 */
	sanitizeQuery(query) {
		if (!query || typeof query !== 'string') return query;
		
		// Remove potential credential values
		return query
			.replace(/password\s*=\s*'[^']*'/gi, "password='***'")
			.replace(/api_key\s*=\s*'[^']*'/gi, "api_key='***'")
			.replace(/token\s*=\s*'[^']*'/gi, "token='***'");
	}

	/**
	 * Mask email address for privacy
	 * @param {string} email - Email address
	 * @returns {string} Masked email
	 */
	maskEmail(email) {
		if (!email || typeof email !== 'string') return email;
		
		const [local, domain] = email.split('@');
		if (!local || !domain) return email;
		
		const maskedLocal = local.length > 2 
			? local.charAt(0) + '*'.repeat(local.length - 2) + local.charAt(local.length - 1)
			: local;
		
		return `${maskedLocal}@${domain}`;
	}

	/**
	 * Get logger statistics and health information
	 * @returns {LoggerHealth} Logger health and statistics
	 */
	getLoggerHealth() {
		const stats = {
			status: 'healthy',
			loggers: Object.keys(loggers).map(name => {
				const logger = /** @type {winston.Logger} */ (loggers[/** @type {keyof typeof loggers} */ (name)]);
				return {
					name,
					level: logger.level,
					transports: logger.transports.length
				};
			}),
			logDirectory: LOGS_DIR,
			diskUsage: this.getLogDirectorySize(),
			lastError: null
		};

		return stats;
	}

	/**
	 * Get log directory size for monitoring
	 * @returns {DirectorySize} Directory size information
	 */
	getLogDirectorySize() {
		try {
			let totalSize = 0;
			const files = fs.readdirSync(LOGS_DIR);
			
			files.forEach(file => {
				const filePath = path.join(LOGS_DIR, file);
				const stats = fs.statSync(filePath);
				totalSize += stats.size;
			});

			return {
				totalBytes: totalSize,
				totalMB: Math.round(totalSize / 1024 / 1024 * 100) / 100,
				fileCount: files.length
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			return {
				error: errorMessage,
				totalBytes: 0,
				totalMB: 0,
				fileCount: 0
			};
		}
	}

	/**
	 * Force log rotation for all daily rotate transports
	 * @returns {void}
	 */
	rotateAllLogs() {
		Object.values(loggers).forEach(logger => {
			logger.transports.forEach(transport => {
				if (transport instanceof DailyRotateFile) {
					try {
						const rotateTransport = /** @type {DailyRotateFile & {rotate?: Function}} */ (transport);
						if (rotateTransport.rotate && typeof rotateTransport.rotate === 'function') {
							rotateTransport.rotate();
						}
					} catch (error) {
						const errorMessage = error instanceof Error ? error.message : String(error);
						console.error('Error rotating log transport:', errorMessage);
					}
				}
			});
		});
	}

	/**
	 * Cleanup old log files beyond retention period
	 * @param {number} retentionDays - Days to retain logs
	 * @returns {number} Number of files cleaned up
	 */
	cleanupOldLogs(retentionDays = 90) {
		try {
			const cutoffDate = new Date();
			cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

			const files = fs.readdirSync(LOGS_DIR);
			let cleanedCount = 0;

			files.forEach(file => {
				const filePath = path.join(LOGS_DIR, file);
				const stats = fs.statSync(filePath);
				
				if (stats.mtime < cutoffDate) {
					fs.unlinkSync(filePath);
					cleanedCount++;
				}
			});

			this.info('Log cleanup completed', { 
				cleanedFiles: cleanedCount, 
				retentionDays 
			});

			return cleanedCount;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			this.error('Log cleanup failed', { error: errorMessage });
			return 0;
		}
	}
}

// Create and export singleton instance
const systemLogger = new SystemLogger();

// Log system startup
systemLogger.startup({
	component: 'SystemLogger',
	version: '1.0.0',
	logDirectory: LOGS_DIR
});

export default systemLogger;