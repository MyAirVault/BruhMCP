/**
 * MCP Instance Logger Utility
 * Provides structured logging for MCP server instances to their specific log directories
 */

import fs from 'fs';
import path from 'path';
import { getMCPLogDirectoryPath } from './logDirectoryManager.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */

/**
 * @typedef {Object} LogMetadata
 * @property {string} [userAgent] - User agent string
 * @property {string} [ip] - Client IP address
 * @property {number} [contentLength] - Content length
 * @property {string} [operation] - MCP operation type
 * @property {string} [protocol] - Protocol type
 */

/**
 * @typedef {Object} MCPLogger
 * @property {string} instanceId - Instance ID
 * @property {string} [userId] - User ID
 * @property {string|null} logDir - Log directory path
 * @property {function(string, string, LogMetadata): void} app - Application logger
 * @property {function(string, string, number, number, LogMetadata): void} access - Access logger
 * @property {function(Error|string, LogMetadata): void} error - Error logger
 * @property {function(string, LogMetadata): void} info - Info logger
 * @property {function(string, LogMetadata): void} warn - Warning logger
 * @property {function(string, LogMetadata): void} debug - Debug logger
 * @property {function(string, LogMetadata): void} mcpOperation - MCP operation logger
 */

/**
 * @typedef {Object} LoggerStats
 * @property {number} activeLoggers - Number of active loggers
 * @property {string[]} instances - Array of instance IDs
 */

class MCPInstanceLogger {
	constructor() {
		/** @type {Map<string, MCPLogger>} */
		this.activeLoggers = new Map();
	}

	/**
	 * Initialize logger for a specific MCP instance
	 * @param {string} instanceId - MCP instance ID
	 * @param {string} userId - User ID who owns the instance
	 * @returns {MCPLogger} Logger instance with log methods
	 */
	initializeLogger(instanceId, userId) {
		if (this.activeLoggers.has(instanceId)) {
			const existingLogger = this.activeLoggers.get(instanceId);
			if (existingLogger) {
				return existingLogger;
			}
		}

		const logDir = getMCPLogDirectoryPath(userId, instanceId);
		
		// Ensure log directory exists
		if (!fs.existsSync(logDir)) {
			console.warn(`⚠️ Log directory doesn't exist for instance ${instanceId}: ${logDir}`);
			return this.createNullLogger(instanceId);
		}

		const logger = {
			instanceId,
			userId,
			logDir,

			/**
			 * Log application events to app.log
			 * @param {string} level - Log level (info, warn, error)
			 * @param {string} message - Log message
			 * @param {LogMetadata} metadata - Additional metadata
			 */
			app: (level, message, metadata = {}) => {
				this.writeLog(logDir, 'app.log', {
					timestamp: new Date().toISOString(),
					level,
					message,
					instanceId,
					userId,
					type: 'application',
					...metadata
				});
			},

			/**
			 * Log HTTP requests to access.log
			 * @param {string} method - HTTP method
			 * @param {string} url - Request URL
			 * @param {number} statusCode - Response status code
			 * @param {number} responseTime - Response time in ms
			 * @param {LogMetadata} metadata - Additional metadata
			 */
			access: (method, url, statusCode, responseTime, metadata = {}) => {
				this.writeLog(logDir, 'access.log', {
					timestamp: new Date().toISOString(),
					level: 'info',
					method,
					url,
					statusCode,
					responseTime,
					instanceId,
					userId,
					type: 'access',
					...metadata
				});
			},

			/**
			 * Log errors to error.log
			 * @param {Error|string} error - Error object or message
			 * @param {LogMetadata} metadata - Additional metadata
			 */
			error: (error, metadata = {}) => {
				/** @type {Record<string, any>} */
				const errorData = {
					timestamp: new Date().toISOString(),
					level: 'error',
					instanceId,
					userId,
					type: 'error',
					...metadata
				};

				if (error instanceof Error) {
					errorData.message = error.message;
					errorData.stack = error.stack;
					errorData.name = error.name;
				} else {
					errorData.message = String(error);
				}

				this.writeLog(logDir, 'error.log', errorData);
			},

			/**
			 * Convenience methods for common log levels
			 * @param {string} message - Log message
			 * @param {LogMetadata} metadata - Additional metadata
			 */
			info: (message, metadata = {}) => logger.app('info', message, metadata),
			/**
			 * @param {string} message - Log message
			 * @param {LogMetadata} metadata - Additional metadata
			 */
			warn: (message, metadata = {}) => logger.app('warn', message, metadata),
			/**
			 * @param {string} message - Log message
			 * @param {LogMetadata} metadata - Additional metadata
			 */
			debug: (message, metadata = {}) => logger.app('debug', message, metadata),

			/**
			 * Log MCP protocol specific events
			 * @param {string} operation - MCP operation (tools, call, resources)
			 * @param {LogMetadata} data - Operation data
			 */
			mcpOperation: (operation, data = {}) => {
				logger.app('info', `MCP ${operation}`, {
					operation,
					protocol: 'mcp',
					...data
				});
			}
		};

		this.activeLoggers.set(instanceId, logger);
		console.log(`📝 Initialized logger for instance ${instanceId}`);
		
		return logger;
	}

	/**
	 * Create a null logger that doesn't write to files (fallback)
	 * @param {string} instanceId - Instance ID for identification
	 * @returns {MCPLogger} Null logger with same interface
	 */
	createNullLogger(instanceId) {
		return {
			instanceId,
			logDir: null,
			app: (_level, _message, _metadata = {}) => {},
			access: (_method, _url, _statusCode, _responseTime, _metadata = {}) => {},
			error: (error) => console.error(`[${instanceId}] ${error}`),
			info: (message) => console.log(`[${instanceId}] ${message}`),
			warn: (message) => console.warn(`[${instanceId}] ${message}`),
			debug: (message) => console.debug(`[${instanceId}] ${message}`),
			mcpOperation: (_operation, _data = {}) => {}
		};
	}

	/**
	 * Write log entry to specified log file
	 * @param {string} logDir - Log directory path
	 * @param {string} logFile - Log file name
	 * @param {Record<string, any>} logData - Log data to write
	 */
	writeLog(logDir, logFile, logData) {
		try {
			const logFilePath = path.join(logDir, logFile);
			const logLine = JSON.stringify(logData) + '\n';
			
			fs.appendFileSync(logFilePath, logLine);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			console.error(`⚠️ Failed to write to ${logFile}:`, errorMessage);
		}
	}

	/**
	 * Get logger for existing instance
	 * @param {string} instanceId - Instance ID
	 * @returns {MCPLogger|null} Logger instance or null if not found
	 */
	getLogger(instanceId) {
		return this.activeLoggers.get(instanceId) || null;
	}

	/**
	 * Remove logger for instance (cleanup)
	 * @param {string} instanceId - Instance ID
	 */
	removeLogger(instanceId) {
		if (this.activeLoggers.has(instanceId)) {
			this.activeLoggers.delete(instanceId);
			console.log(`🗑️ Removed logger for instance ${instanceId}`);
		}
	}

	/**
	 * Get all active logger instance IDs
	 * @returns {Array<string>} Array of instance IDs
	 */
	getActiveLoggers() {
		return Array.from(this.activeLoggers.keys());
	}

	/**
	 * Get logger statistics
	 * @returns {LoggerStats} Logger statistics
	 */
	getStats() {
		return {
			activeLoggers: this.activeLoggers.size,
			instances: Array.from(this.activeLoggers.keys())
		};
	}

	/**
	 * Express middleware factory for request logging
	 * @param {string} instanceId - Instance ID
	 * @returns {function(Request, Response, NextFunction): void} Express middleware function
	 */
	createRequestMiddleware(instanceId) {
		const logger = this.getLogger(instanceId);
		
		if (!logger) {
			console.warn(`⚠️ No logger found for instance ${instanceId}`);
			return (_req, _res, next) => next();
		}

		return (req, res, next) => {
			const startTime = Date.now();
			
			// Capture original response methods
			const originalSend = res.send;
			const originalJson = res.json;
			
			// Override response methods to capture when response is sent
			res.send = function(data) {
				const responseTime = Date.now() - startTime;
				if (logger) {
					logger.access(req.method, req.originalUrl, res.statusCode, responseTime, {
						userAgent: req.get('User-Agent'),
						ip: req.ip,
						contentLength: data ? Buffer.byteLength(String(data), 'utf8') : 0
					});
				}
				return originalSend.call(this, data);
			};

			res.json = function(data) {
				const responseTime = Date.now() - startTime;
				if (logger) {
					logger.access(req.method, req.originalUrl, res.statusCode, responseTime, {
						userAgent: req.get('User-Agent'),
						ip: req.ip,
						contentLength: data ? JSON.stringify(data).length : 0
					});
				}
				return originalJson.call(this, data);
			};

			// Handle cases where neither send nor json is called
			res.on('finish', () => {
				if (!res.headersSent) return;
				
				const responseTime = Date.now() - startTime;
				/** @type {Response & {_logged?: boolean}} */
				const responseWithLogged = res;
				// Only log if we haven't already logged via send/json
				if (!responseWithLogged._logged && logger) {
					logger.access(req.method, req.originalUrl, res.statusCode, responseTime, {
						userAgent: req.get('User-Agent'),
						ip: req.ip
					});
				}
			});

			next();
		};
	}
}

// Create and export singleton instance
const mcpInstanceLogger = new MCPInstanceLogger();

export default mcpInstanceLogger;