/**
 * MCP Logging Middleware
 * Provides request/response logging for MCP server instances
 */

import mcpInstanceLogger from '../utils/mcpInstanceLogger.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */
/** @typedef {import('express').ErrorRequestHandler} ErrorRequestHandler */

/**
 * @typedef {Object} MCPLogger
 * @property {string} instanceId - Instance ID
 * @property {string} userId - User ID
 * @property {string} logDir - Log directory path
 * @property {(level: string, message: string, metadata?: Object) => void} app - Log application events
 * @property {(method: string, url: string, statusCode: number, responseTime: number, metadata?: Object) => void} access - Log HTTP access
 * @property {(error: Error | string, metadata?: Object) => void} error - Log errors
 * @property {(message: string, metadata?: Object) => void} info - Log info messages
 * @property {(message: string, metadata?: Object) => void} warn - Log warning messages
 * @property {(message: string, metadata?: Object) => void} debug - Log debug messages
 * @property {(operation: string, data?: Object) => void} mcpOperation - Log MCP operations
 */

/**
 * Create MCP request logging middleware for a specific service
 * @param {string} serviceName - Name of the MCP service (e.g., 'figma', 'github')
 * @returns {(req: Request, res: Response, next: NextFunction) => void} Express middleware function
 */
export function createMCPLoggingMiddleware(serviceName) {
	/**
	 * @param {Request} req - Express request object
	 * @param {Response} res - Express response object
	 * @param {NextFunction} next - Express next function
	 */
	return (req, res, next) => {
		const startTime = Date.now();
		const instanceId = req.instanceId || req.params.instanceId;
		
		// Skip logging if no instance ID is available
		if (!instanceId) {
			return next();
		}

		// Get logger for this instance
		/** @type {MCPLogger | null} */
		const logger = /** @type {MCPLogger | null} */ (mcpInstanceLogger.getLogger(instanceId));
		
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
		/**
		 * @param {any} data - Response data
		 */
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
		/**
		 * @param {any} data - Response data
		 */
		res.send = function(data) {
			logResponse(data);
			return originalSend.call(this, data);
		};

		/**
		 * @param {any} data - JSON response data
		 */
		res.json = function(data) {
			logResponse(data);
			return originalJson.call(this, data);
		};

		/**
		 * @param {any} data - Response data
		 * @param {BufferEncoding | (() => void)} [encodingOrCallback] - Encoding type or callback
		 * @param {(() => void)} [callback] - Callback function
		 */
		res.end = function(data, encodingOrCallback, callback) {
			if (!responseLogged) {
				logResponse(data);
			}
			// Cast to any to handle Express overloaded signatures
			return /** @type {any} */ (originalEnd).call(this, data, encodingOrCallback, callback);
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
 * @returns {(err: Error, req: Request, res: Response, next: NextFunction) => void} Express error middleware function
 */
export function createMCPErrorMiddleware(serviceName) {
	/**
	 * @param {Error} err - Error object
	 * @param {Request} req - Express request object
	 * @param {Response} _res - Express response object (unused)
	 * @param {NextFunction} next - Express next function
	 */
	return (err, req, _res, next) => {
		const instanceId = req.instanceId || req.params.instanceId;
		
		if (instanceId) {
			/** @type {MCPLogger | null} */
			const logger = /** @type {MCPLogger | null} */ (mcpInstanceLogger.getLogger(instanceId));
			
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
					code: /** @type {any} */ (err).code,
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
 * @returns {(req: Request, res: Response, next: NextFunction) => void} Express middleware function
 */
export function createMCPOperationMiddleware(serviceName) {
	/**
	 * @param {Request} req - Express request object
	 * @param {Response} res - Express response object
	 * @param {NextFunction} next - Express next function
	 */
	return (req, res, next) => {
		const instanceId = req.instanceId || req.params.instanceId;
		
		if (!instanceId) {
			return next();
		}

		/** @type {MCPLogger | null} */
		const logger = /** @type {MCPLogger | null} */ (mcpInstanceLogger.getLogger(instanceId));
		
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
		/**
		 * @param {any} data - JSON response data
		 */
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
 * @param {Object} _serviceConfig - Service configuration (unused)
 * @returns {{logServiceStartup: (activeInstances?: string[]) => void, logInstanceEvent: (instanceId: string, event: string, data?: Object) => void}} Service logger object
 */
export function createMCPServiceLogger(serviceName, _serviceConfig) {
	return {
		/**
		 * Log service startup for all instances
		 * @param {string[]} [activeInstances=[]] - Array of active instance IDs
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
		 * @param {Object} [data={}] - Event data
		 */
		logInstanceEvent: (instanceId, event, data = {}) => {
			/** @type {MCPLogger | null} */
			const logger = /** @type {MCPLogger | null} */ (mcpInstanceLogger.getLogger(instanceId));
			
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