/**
 * MCP Logging Middleware
 * Provides request/response logging for MCP server instances
 */

import mcpInstanceLogger from '../utils/mcpInstanceLogger.js';

/**
 * Create MCP request logging middleware for a specific service
 * @param {string} serviceName - Name of the MCP service (e.g., 'figma', 'github')
 * @returns {Function} Express middleware function
 */
export function createMCPLoggingMiddleware(serviceName) {
	return (req, res, next) => {
		const startTime = Date.now();
		const instanceId = req.instanceId || req.params.instanceId;
		
		// Skip logging if no instance ID is available
		if (!instanceId) {
			return next();
		}

		// Get logger for this instance
		const logger = mcpInstanceLogger.getLogger(instanceId);
		
		// Skip logging if no logger is initialized
		if (!logger) {
			return next();
		}

		// Log the incoming request
		logger.app('info', `${serviceName.toUpperCase()} request received`, {
			method: req.method,
			url: req.originalUrl,
			userAgent: req.get('User-Agent'),
			ip: req.ip,
			contentType: req.get('Content-Type'),
			contentLength: req.get('Content-Length') || 0
		});

		// Store original response methods
		const originalSend = res.send;
		const originalJson = res.json;
		const originalEnd = res.end;

		// Track if response has been logged
		let responseLogged = false;

		// Function to log response
		const logResponse = (data) => {
			if (responseLogged) return;
			responseLogged = true;

			const responseTime = Date.now() - startTime;
			const statusCode = res.statusCode;

			// Log to access.log
			logger.access(req.method, req.originalUrl, statusCode, responseTime, {
				userAgent: req.get('User-Agent'),
				ip: req.ip,
				contentLength: data ? Buffer.byteLength(JSON.stringify(data), 'utf8') : 0,
				service: serviceName
			});

			// Log errors to error.log
			if (statusCode >= 400) {
				logger.error(`${serviceName.toUpperCase()} request failed`, {
					method: req.method,
					url: req.originalUrl,
					statusCode,
					responseTime,
					errorData: data
				});
			}

			// Log slow requests as warnings
			if (responseTime > 2000) {
				logger.warn(`Slow ${serviceName.toUpperCase()} request`, {
					method: req.method,
					url: req.originalUrl,
					responseTime,
					threshold: 2000
				});
			}
		};

		// Override response methods to capture response
		res.send = function(data) {
			logResponse(data);
			return originalSend.call(this, data);
		};

		res.json = function(data) {
			logResponse(data);
			return originalJson.call(this, data);
		};

		res.end = function(data, encoding) {
			if (!responseLogged) {
				logResponse(data);
			}
			return originalEnd.call(this, data, encoding);
		};

		// Handle response finish event as fallback
		res.on('finish', () => {
			if (!responseLogged) {
				logResponse(null);
			}
		});

		next();
	};
}

/**
 * Create MCP error logging middleware for a specific service
 * @param {string} serviceName - Name of the MCP service
 * @returns {Function} Express error middleware function
 */
export function createMCPErrorMiddleware(serviceName) {
	return (err, req, res, next) => {
		const instanceId = req.instanceId || req.params.instanceId;
		
		if (instanceId) {
			const logger = mcpInstanceLogger.getLogger(instanceId);
			
			if (logger) {
				// Log error to error.log
				logger.error(err, {
					service: serviceName,
					method: req.method,
					url: req.originalUrl,
					userAgent: req.get('User-Agent'),
					ip: req.ip,
					stack: err.stack
				});

				// Log to app.log as well for service-specific error tracking
				logger.app('error', `${serviceName.toUpperCase()} service error`, {
					message: err.message,
					name: err.name,
					code: err.code,
					method: req.method,
					url: req.originalUrl
				});
			}
		}

		next(err);
	};
}

/**
 * Create MCP operation logging middleware for JSON-RPC operations
 * @param {string} serviceName - Name of the MCP service
 * @returns {Function} Express middleware function
 */
export function createMCPOperationMiddleware(serviceName) {
	return (req, res, next) => {
		const instanceId = req.instanceId || req.params.instanceId;
		
		if (!instanceId) {
			return next();
		}

		const logger = mcpInstanceLogger.getLogger(instanceId);
		
		if (!logger) {
			return next();
		}

		// Log MCP JSON-RPC operations
		if (req.body && req.body.method) {
			logger.mcpOperation('json-rpc-request', {
				service: serviceName,
				method: req.body.method,
				id: req.body.id,
				hasParams: !!req.body.params,
				paramsKeys: req.body.params ? Object.keys(req.body.params) : []
			});
		}

		// Override res.json to log responses
		const originalJson = res.json;
		res.json = function(data) {
			if (data && (data.result || data.error)) {
				logger.mcpOperation('json-rpc-response', {
					service: serviceName,
					id: data.id,
					hasResult: !!data.result,
					hasError: !!data.error,
					errorCode: data.error?.code,
					errorMessage: data.error?.message
				});
			}
			return originalJson.call(this, data);
		};

		next();
	};
}

/**
 * Create startup logging function for MCP services
 * @param {string} serviceName - Name of the MCP service
 * @param {Object} serviceConfig - Service configuration
 * @returns {Function} Function to call on service startup
 */
export function createMCPServiceLogger(serviceName, serviceConfig) {
	return {
		/**
		 * Log service startup for all instances
		 * @param {Array<string>} activeInstances - Array of active instance IDs
		 */
		logServiceStartup: (activeInstances = []) => {
			console.log(`📝 Initializing logging for ${serviceName.toUpperCase()} service`);
			console.log(`🔗 Active instances: ${activeInstances.length}`);
			
			// Note: We don't initialize loggers here as we don't have userId mapping
			// Loggers will be initialized on first request or via createMCP
		},

		/**
		 * Log instance-specific events
		 * @param {string} instanceId - Instance ID
		 * @param {string} event - Event type
		 * @param {Object} data - Event data
		 */
		logInstanceEvent: (instanceId, event, data = {}) => {
			const logger = mcpInstanceLogger.getLogger(instanceId);
			
			if (logger) {
				logger.app('info', `${serviceName.toUpperCase()} instance event: ${event}`, {
					event,
					service: serviceName,
					...data
				});
			}
		}
	};
}

export default {
	createMCPLoggingMiddleware,
	createMCPErrorMiddleware,
	createMCPOperationMiddleware,
	createMCPServiceLogger
};