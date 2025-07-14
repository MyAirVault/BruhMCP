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

class MCPInstanceLogger {
	constructor() {
		this.activeLoggers = new Map(); // instanceId -> logger instance
	}

	/**
	 * Initialize logger for a specific MCP instance
	 * @param {string} instanceId - MCP instance ID
	 * @param {string} userId - User ID who owns the instance
	 * @returns {Object} Logger instance with log methods
	 */
	initializeLogger(instanceId, userId) {
		if (this.activeLoggers.has(instanceId)) {
			return this.activeLoggers.get(instanceId);
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
			 * @param {Object} metadata - Additional metadata
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
			 * @param {Object} metadata - Additional metadata
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
			 * @param {Object} metadata - Additional metadata
			 */
			error: (error, metadata = {}) => {
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
			 */
			info: (message, metadata = {}) => logger.app('info', message, metadata),
			warn: (message, metadata = {}) => logger.app('warn', message, metadata),
			debug: (message, metadata = {}) => logger.app('debug', message, metadata),

			/**
			 * Log MCP protocol specific events
			 * @param {string} operation - MCP operation (tools, call, resources)
			 * @param {Object} data - Operation data
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
	 * @returns {Object} Null logger with same interface
	 */
	createNullLogger(instanceId) {
		return {
			instanceId,
			logDir: null,
			app: (/** @type {string} */ level, /** @type {string} */ message, /** @type {Object} */ metadata = {}) => {},
			access: (/** @type {string} */ method, /** @type {string} */ url, /** @type {number} */ statusCode, /** @type {number} */ responseTime, /** @type {Object} */ metadata = {}) => {},
			error: (/** @type {Error|string} */ error) => console.error(`[${instanceId}] ${error}`),
			info: (/** @type {string} */ message) => console.log(`[${instanceId}] ${message}`),
			warn: (/** @type {string} */ message) => console.warn(`[${instanceId}] ${message}`),
			debug: (/** @type {string} */ message) => console.debug(`[${instanceId}] ${message}`),
			mcpOperation: (/** @type {string} */ operation, /** @type {Object} */ data = {}) => {}
		};
	}

	/**
	 * Write log entry to specified log file
	 * @param {string} logDir - Log directory path
	 * @param {string} logFile - Log file name
	 * @param {Object} logData - Log data to write
	 */
	writeLog(logDir, logFile, logData) {
		try {
			const logFilePath = path.join(logDir, logFile);
			const logLine = JSON.stringify(logData) + '\n';
			
			fs.appendFileSync(logFilePath, logLine);
		} catch (error) {
			console.error(`⚠️ Failed to write to ${logFile}:`, error.message);
		}
	}

	/**
	 * Get logger for existing instance
	 * @param {string} instanceId - Instance ID
	 * @returns {Object|null} Logger instance or null if not found
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
	 * @returns {Object} Logger statistics
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
	 * @returns {Function} Express middleware function
	 */
	createRequestMiddleware(instanceId) {
		const logger = this.getLogger(instanceId);
		
		if (!logger) {
			console.warn(`⚠️ No logger found for instance ${instanceId}`);
			return (/** @type {Request} */ req, /** @type {Response} */ res, /** @type {NextFunction} */ next) => next();
		}

		return (/** @type {Request} */ req, /** @type {Response} */ res, /** @type {NextFunction} */ next) => {
			const startTime = Date.now();
			
			// Capture original response methods
			const originalSend = res.send;
			const originalJson = res.json;
			
			// Override response methods to capture when response is sent
			res.send = function(/** @type {any} */ data) {
				const responseTime = Date.now() - startTime;
				if (logger && logger.access) {
					logger.access(req.method, req.originalUrl, res.statusCode, responseTime, {
						userAgent: req.get('User-Agent'),
						ip: req.ip,
						contentLength: data ? Buffer.byteLength(data, 'utf8') : 0
					});
				}
				return originalSend.call(this, data);
			};

			res.json = function(/** @type {any} */ data) {
				const responseTime = Date.now() - startTime;
				if (logger && logger.access) {
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
				// Only log if we haven't already logged via send/json
				if (!res._logged && logger && logger.access) {
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