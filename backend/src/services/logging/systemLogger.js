import winston from 'winston';
import path from 'path';
import fs from 'fs';
import DailyRotateFile from 'winston-daily-rotate-file';

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
	winston.format.printf(({ timestamp, level, message, service, category, metadata, stack, ...rest }) => {
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
		if (stack) {
			logEntry.stack = stack;
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
	 */
	application(level, message, metadata = {}) {
		loggers.application.log(level, message, { metadata });
	}

	/**
	 * Log security-related events
	 * @param {string} level - Log level
	 * @param {string} message - Security event description
	 * @param {Object} securityContext - Security-related metadata
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
	 * @param {Object} performanceData - Performance metrics
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
	 * @param {Object} auditContext - Audit context and metadata
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
	 * @param {Object} dbContext - Database context and metrics
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
	 * @param {Object} cacheContext - Cache context and metrics
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
	 */
	info(message, metadata = {}) {
		this.application('info', message, metadata);
	}

	warn(message, metadata = {}) {
		this.application('warn', message, metadata);
	}

	error(message, metadata = {}) {
		this.application('error', message, metadata);
	}

	debug(message, metadata = {}) {
		this.application('debug', message, metadata);
	}

	/**
	 * Log system startup and initialization
	 * @param {Object} startupInfo - System startup information
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
	 * @param {Object} shutdownInfo - System shutdown information
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
	 * @param {Object} data - Security context data
	 * @returns {Object} Sanitized data
	 */
	sanitizeSecurityData(data) {
		const sanitized = { ...data };
		
		// Remove sensitive fields
		delete sanitized.password;
		delete sanitized.token;
		delete sanitized.apiKey;
		delete sanitized.secret;
		delete sanitized.credentials;
		
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
	 * @returns {Object} Logger health and statistics
	 */
	getLoggerHealth() {
		const stats = {
			status: 'healthy',
			loggers: Object.keys(loggers).map(name => ({
				name,
				level: loggers[name].level,
				transports: loggers[name].transports.length
			})),
			logDirectory: LOGS_DIR,
			diskUsage: this.getLogDirectorySize(),
			lastError: null
		};

		return stats;
	}

	/**
	 * Get log directory size for monitoring
	 * @returns {Object} Directory size information
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
			return {
				error: error.message,
				totalBytes: 0,
				totalMB: 0,
				fileCount: 0
			};
		}
	}

	/**
	 * Force log rotation for all daily rotate transports
	 */
	rotateAllLogs() {
		Object.values(loggers).forEach(logger => {
			logger.transports.forEach(transport => {
				if (transport instanceof DailyRotateFile) {
					transport.rotate();
				}
			});
		});
	}

	/**
	 * Cleanup old log files beyond retention period
	 * @param {number} retentionDays - Days to retain logs
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
			this.error('Log cleanup failed', { error: error.message });
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