/**
 * Airtable Logger Utilities
 * Structured logging system for Airtable MCP service
 */

const { inspect } = require('util');
const { sanitizeForLogging } = require('./sanitization.js');

/**
 * Log levels
 */
const LOG_LEVELS = {
	debug: 0,
	info: 1,
	warn: 2,
	error: 3
};

/**
 * Current log level (set via environment variable)
 */
const CURRENT_LOG_LEVEL = /** @type {Record<string, number>} */ (LOG_LEVELS)[process.env.LOG_LEVEL?.toLowerCase() || 'info'] ?? LOG_LEVELS.info;

/**
 * Color codes for console output
 */
const COLORS = {
	reset: '\x1b[0m',
	bright: '\x1b[1m',
	dim: '\x1b[2m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m',
	white: '\x1b[37m'
};

/**
 * Format timestamp
 * @returns {string}
 */
function formatTimestamp() {
	return new Date().toISOString();
}


/**
 * Format colored message for console
 * @param {string} level - Log level
 * @param {string} component - Component name
 * @param {string} message - Log message
 * @param {Object} metadata - Additional metadata
 * @returns {string}
 */
function formatColoredMessage(level, component, message, metadata = {}) {
	const timestamp = formatTimestamp();
	const colors = {
		debug: COLORS.dim,
		info: COLORS.green,
		warn: COLORS.yellow,
		error: COLORS.red
	};
	
	const color = /** @type {Record<string, string>} */ (colors)[level] || COLORS.white;
	const baseMessage = `${COLORS.dim}[${timestamp}]${COLORS.reset} ${color}[${level.toUpperCase()}]${COLORS.reset} ${COLORS.cyan}[${component}]${COLORS.reset} ${message}`;
	
	if (Object.keys(metadata).length > 0) {
		// Sanitize metadata to prevent credential exposure
		const sanitizedMetadata = sanitizeForLogging(metadata);
		const metadataStr = inspect(sanitizedMetadata, { 
			depth: 3, 
			compact: true, 
			breakLength: 100,
			colors: true 
		});
		return `${baseMessage} ${COLORS.dim}${metadataStr}${COLORS.reset}`;
	}
	
	return baseMessage;
}

/**
 * Logger class
 */
class Logger {
	/**
	 * @param {string} component - Component name
	 */
	constructor(component) {
		this.component = component;
		/** @type {Object} */
		this.context = {};
	}

	/**
	 * Log debug message
	 * @param {string} message - Message to log
	 * @param {Object} metadata - Additional metadata
	 */
	debug(message, metadata = {}) {
		if (CURRENT_LOG_LEVEL <= LOG_LEVELS.debug) {
			console.debug(formatColoredMessage('debug', this.component, message, metadata));
		}
	}

	/**
	 * Log info message
	 * @param {string} message - Message to log
	 * @param {Object} metadata - Additional metadata
	 */
	info(message, metadata = {}) {
		if (CURRENT_LOG_LEVEL <= LOG_LEVELS.info) {
			console.info(formatColoredMessage('info', this.component, message, metadata));
		}
	}

	/**
	 * Log warning message
	 * @param {string} message - Message to log
	 * @param {Object} metadata - Additional metadata
	 */
	warn(message, metadata = {}) {
		if (CURRENT_LOG_LEVEL <= LOG_LEVELS.warn) {
			console.warn(formatColoredMessage('warn', this.component, message, metadata));
		}
	}

	/**
	 * Log error message
	 * @param {string} message - Message to log
	 * @param {Object} metadata - Additional metadata
	 */
	error(message, metadata = {}) {
		if (CURRENT_LOG_LEVEL <= LOG_LEVELS.error) {
			console.error(formatColoredMessage('error', this.component, message, metadata));
		}
	}

	/**
	 * Log API call
	 * @param {string} method - HTTP method
	 * @param {string} endpoint - API endpoint
	 * @param {number} duration - Request duration in ms
	 * @param {number} status - HTTP status code
	 * @param {Object} metadata - Additional metadata
	 */
	apiCall(method, endpoint, duration, status, metadata = {}) {
		const statusColor = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info';
		const message = `API ${method} ${endpoint} - ${status} (${duration}ms)`;
		
		this[statusColor](message, {
			method,
			endpoint,
			duration,
			status,
			...metadata
		});
	}

	/**
	 * Log performance metrics
	 * @param {string} operation - Operation name
	 * @param {Object} metrics - Performance metrics
	 */
	performance(operation, metrics) {
		this.info(`Performance: ${operation}`, metrics);
	}

	/**
	 * Log validation error
	 * @param {string} field - Field name
	 * @param {string} value - Invalid value
	 * @param {string} reason - Validation failure reason
	 */
	validationError(field, value, reason) {
		this.error('Validation failed', {
			field,
			value: typeof value === 'string' ? value : inspect(value, { depth: 1 }),
			reason
		});
	}

	/**
	 * Log cache operation
	 * @param {string} operation - Cache operation (hit, miss, set, clear)
	 * @param {string} key - Cache key
	 * @param {Object} metadata - Additional metadata
	 */
	cache(operation, key, metadata = {}) {
		const message = `Cache ${operation}: ${key}`;
		this.debug(message, metadata);
	}

	/**
	 * Log rate limit event
	 * @param {string} endpoint - API endpoint
	 * @param {number} retryAfter - Retry after seconds
	 * @param {Object} metadata - Additional metadata
	 */
	rateLimit(endpoint, retryAfter, metadata = {}) {
		this.warn(`Rate limit exceeded for ${endpoint}`, {
			endpoint,
			retryAfter,
			...metadata
		});
	}

	/**
	 * Log authentication event
	 * @param {string} event - Auth event (success, failure, refresh)
	 * @param {Object} metadata - Additional metadata
	 */
	auth(event, metadata = {}) {
		const message = `Authentication ${event}`;
		const level = event === 'failure' ? 'error' : 'info';
		this[level](message, metadata);
	}

	/**
	 * Log MCP protocol event
	 * @param {string} event - MCP event
	 * @param {Object} metadata - Additional metadata
	 */
	mcp(event, metadata = {}) {
		this.info(`MCP: ${event}`, metadata);
	}

	/**
	 * Log session event
	 * @param {string} sessionId - Session ID
	 * @param {string} event - Session event
	 * @param {Object} metadata - Additional metadata
	 */
	session(sessionId, event, metadata = {}) {
		this.info(`Session ${sessionId}: ${event}`, metadata);
	}

	/**
	 * Log database event
	 * @param {string} operation - Database operation
	 * @param {Object} metadata - Additional metadata
	 */
	database(operation, metadata = {}) {
		this.debug(`Database: ${operation}`, metadata);
	}

	/**
	 * Log tool execution
	 * @param {string} toolName - Tool name
	 * @param {Object} params - Tool parameters
	 * @param {number} duration - Execution duration
	 * @param {boolean} success - Execution success
	 */
	tool(toolName, params, duration, success) {
		const message = `Tool ${toolName} ${success ? 'completed' : 'failed'} (${duration}ms)`;
		const level = success ? 'info' : 'error';
		
		this[level](message, {
			tool: toolName,
			params: Object.keys(params),
			duration,
			success
		});
	}

	/**
	 * Create child logger with additional context
	 * @param {string} subComponent - Sub-component name
	 * @param {Object} context - Additional context
	 * @returns {Logger}
	 */
	child(subComponent, context = {}) {
		const childLogger = new Logger(`${this.component}:${subComponent}`);
		childLogger.context = context;
		return childLogger;
	}

	/**
	 * Log with additional context
	 * @param {'debug' | 'info' | 'warn' | 'error'} level - Log level
	 * @param {string} message - Message
	 * @param {Object} metadata - Metadata
	 */
	withContext(level, message, metadata = {}) {
		const combinedMetadata = { ...this.context, ...metadata };
		switch(level) {
			case 'debug': this.debug(message, combinedMetadata); break;
			case 'info': this.info(message, combinedMetadata); break;
			case 'warn': this.warn(message, combinedMetadata); break;
			case 'error': this.error(message, combinedMetadata); break;
		}
	}
}

/**
 * Create logger instance
 * @param {string} component - Component name
 * @returns {Logger}
 */
function createLogger(component) {
	return new Logger(component);
}

/**
 * Global logger for service-wide events
 */
const serviceLogger = createLogger('AirtableService');

/**
 * Request logger middleware
 * @param {string} instanceId - Instance ID
 * @returns {Function}
 */
function createRequestLogger(instanceId) {
	const logger = createLogger(`Request:${instanceId}`);
	
	return (/** @type {import('express').Request} */ req, /** @type {import('express').Response} */ res, /** @type {import('express').NextFunction} */ next) => {
		const startTime = Date.now();
		const { method, url, headers } = req;
		
		logger.info('Request started', {
			method,
			url,
			userAgent: headers['user-agent'],
			contentLength: headers['content-length']
		});

		// Log response
		const originalSend = res.send;
		res.send = function(/** @type {string | Buffer | Object} */ data) {
			const duration = Date.now() - startTime;
			let responseSize = 0;
			if (data) {
				if (typeof data === 'string') {
					responseSize = data.length;
				} else if (Buffer.isBuffer(data)) {
					responseSize = data.length;
				} else {
					responseSize = JSON.stringify(data).length;
				}
			}
			logger.apiCall(method, url, duration, res.statusCode, {
				responseSize
			});
			return originalSend.call(this, data);
		};

		next();
	};
}

/**
 * Error logger
 * @param {Error} error - Error object
 * @param {Object} context - Error context
 */
function logError(error, context = {}) {
	const logger = createLogger('Error');
	
	logger.error(error.message, {
		stack: error.stack,
		name: error.name,
		...context
	});
}

/**
 * Performance logger
 * @param {string} operation - Operation name
 * @param {Function} fn - Function to measure
 * @returns {Function}
 */
function measurePerformance(operation, fn) {
	return async function() {
		/** @type {Object[]} */
		const args = Array.from(arguments);
		const logger = createLogger('Performance');
		const startTime = Date.now();
		
		try {
			const result = await fn.apply(/** @type {Object} */ (fn), args);
			const duration = Date.now() - startTime;
			
			logger.performance(operation, {
				duration,
				success: true,
				args: args.length
			});
			
			return result;
		} catch (error) {
			const duration = Date.now() - startTime;
			
			logger.performance(operation, {
				duration,
				success: false,
				error: error instanceof Error ? error.message : String(error),
				args: args.length
			});
			
			throw error;
		}
	};
}

/**
 * Log level utilities
 */
const logLevel = {
	setLevel(/** @type {string} */ level) {
		if (/** @type {Record<string, number>} */ (LOG_LEVELS)[level] !== undefined) {
			process.env.LOG_LEVEL = level;
		}
	},
	
	getLevel() {
		return Object.keys(LOG_LEVELS).find(key => /** @type {Record<string, number>} */ (LOG_LEVELS)[key] === CURRENT_LOG_LEVEL);
	},
	
	isDebugEnabled() {
		return CURRENT_LOG_LEVEL <= LOG_LEVELS.debug;
	}
};

module.exports = {
	createLogger,
	serviceLogger,
	createRequestLogger,
	logError,
	measurePerformance,
	logLevel
};