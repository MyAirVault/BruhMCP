/**
 * Airtable Error Handler
 * Comprehensive error handling for Airtable API operations
 */

import { createLogger } from './logger.js';

const logger = createLogger('ErrorHandler');

/**
 * Custom error classes
 */
export class AirtableError extends Error {
	/**
	 * @param {string} message - Error message
	 * @param {string} code - Error code
	 * @param {number} statusCode - HTTP status code
	 * @param {Record<string, string | number | boolean | Object>} details - Error details
	 */
	constructor(message, code, statusCode, details = {}) {
		super(message);
		this.name = 'AirtableError';
		/** @type {string} */
		this.code = code;
		/** @type {number} */
		this.statusCode = statusCode;
		/** @type {Record<string, string | number | boolean | Object>} */
		this.details = details;
		/** @type {string} */
		this.timestamp = new Date().toISOString();
	}
}

export class ValidationError extends AirtableError {
	/**
	 * @param {string} message - Error message
	 * @param {Record<string, string | number | boolean | Object>} details - Error details
	 */
	constructor(message, details = {}) {
		super(message, 'VALIDATION_ERROR', 400, details);
		this.name = 'ValidationError';
	}
}

export class AuthenticationError extends AirtableError {
	/**
	 * @param {string} message - Error message
	 * @param {Record<string, string | number | boolean | Object>} details - Error details
	 */
	constructor(message, details = {}) {
		super(message, 'AUTHENTICATION_ERROR', 401, details);
		this.name = 'AuthenticationError';
	}
}

export class AuthorizationError extends AirtableError {
	/**
	 * @param {string} message - Error message
	 * @param {Record<string, string | number | boolean | Object>} details - Error details
	 */
	constructor(message, details = {}) {
		super(message, 'AUTHORIZATION_ERROR', 403, details);
		this.name = 'AuthorizationError';
	}
}

export class NotFoundError extends AirtableError {
	/**
	 * @param {string} message - Error message
	 * @param {Record<string, string | number | boolean | Object>} details - Error details
	 */
	constructor(message, details = {}) {
		super(message, 'NOT_FOUND_ERROR', 404, details);
		this.name = 'NotFoundError';
	}
}

export class RateLimitError extends AirtableError {
	/**
	 * @param {string} message - Error message
	 * @param {number} retryAfter - Retry after seconds
	 * @param {Record<string, string | number | boolean | Object>} details - Error details
	 */
	constructor(message, retryAfter, details = {}) {
		super(message, 'RATE_LIMIT_ERROR', 429, { retryAfter, ...details });
		this.name = 'RateLimitError';
		/** @type {number} */
		this.retryAfter = retryAfter;
	}
}

export class UnprocessableEntityError extends AirtableError {
	/**
	 * @param {string} message - Error message
	 * @param {Record<string, string | number | boolean | Object>} details - Error details
	 */
	constructor(message, details = {}) {
		super(message, 'UNPROCESSABLE_ENTITY_ERROR', 422, details);
		this.name = 'UnprocessableEntityError';
	}
}

export class InternalServerError extends AirtableError {
	/**
	 * @param {string} message - Error message
	 * @param {Record<string, string | number | boolean | Object>} details - Error details
	 */
	constructor(message, details = {}) {
		super(message, 'INTERNAL_SERVER_ERROR', 500, details);
		this.name = 'InternalServerError';
	}
}

export class ServiceUnavailableError extends AirtableError {
	/**
	 * @param {string} message - Error message
	 * @param {Record<string, string | number | boolean | Object>} details - Error details
	 */
	constructor(message, details = {}) {
		super(message, 'SERVICE_UNAVAILABLE_ERROR', 503, details);
		this.name = 'ServiceUnavailableError';
	}
}

export class NetworkError extends AirtableError {
	/**
	 * @param {string} message - Error message
	 * @param {Record<string, string | number | boolean | Object>} details - Error details
	 */
	constructor(message, details = {}) {
		super(message, 'NETWORK_ERROR', 0, details);
		this.name = 'NetworkError';
	}
}

export class TimeoutError extends AirtableError {
	/**
	 * @param {string} message - Error message
	 * @param {Record<string, string | number | boolean | Object>} details - Error details
	 */
	constructor(message, details = {}) {
		super(message, 'TIMEOUT_ERROR', 408, details);
		this.name = 'TimeoutError';
	}
}

/**
 * Error handler class
 */
export class AirtableErrorHandler {
	/**
	 * Create error from HTTP response
	 * @param {Response} response - HTTP response
	 * @returns {Promise<AirtableError>}
	 */
	static async fromResponse(response) {
		/** @type {Record<string, string | number | boolean | Object>} */
		let errorData = {};
		
		try {
			const text = await response.text();
			if (text) {
				errorData = JSON.parse(text);
			}
		} catch (parseError) {
			logger.warn('Failed to parse error response', { parseError: parseError instanceof Error ? parseError.message : String(parseError) });
		}

		const { status, statusText, url } = response;
		const message = /** @type {Record<string, Record<string, string>>} */ (errorData).error?.message || statusText || 'Unknown error';
		// Convert headers to object - compatible with older environments
		/** @type {Record<string, string>} */
		const headers = {};
		if (response.headers.forEach) {
			response.headers.forEach((value, key) => {
				headers[key] = value;
			});
		}
		
		const details = {
			status,
			statusText,
			url,
			response: errorData,
			headers
		};

		switch (status) {
			case 400:
				return new ValidationError(message, details);
			
			case 401:
				return new AuthenticationError(message, details);
			
			case 403:
				return new AuthorizationError(message, details);
			
			case 404:
				return new NotFoundError(message, details);
			
			case 422:
				return new UnprocessableEntityError(message, details);
			
			case 429:
				const retryAfter = response.headers.get('Retry-After') || '5';
				return new RateLimitError(message, parseInt(retryAfter), details);
			
			case 500:
				return new InternalServerError(message, details);
			
			case 503:
				return new ServiceUnavailableError(message, details);
			
			default:
				return new AirtableError(message, 'HTTP_ERROR', status, details);
		}
	}

	/**
	 * Create error from JavaScript error
	 * @param {Error} error - JavaScript error
	 * @returns {AirtableError}
	 */
	static fromError(error) {
		if (error instanceof AirtableError) {
			return error;
		}

		const details = {
			originalError: error.message,
			stack: error.stack || '',
			name: error.name
		};

		// Handle specific error types
		if (error.name === 'AbortError' || (error.message && error.message.includes('timeout'))) {
			return new TimeoutError(error.message, details);
		}

		if (error.name === 'TypeError' && error.message && error.message.includes('fetch')) {
			return new NetworkError(error.message, details);
		}

		if (error.name === 'SyntaxError') {
			return new ValidationError(`Invalid JSON: ${error.message}`, details);
		}

		// Default to internal server error
		return new InternalServerError(error.message, details);
	}

	/**
	 * Handle and log error
	 * @param {Error} error - Error to handle
	 * @param {Object} context - Error context
	 * @returns {AirtableError}
	 */
	static handle(error, context = {}) {
		const airtableError = error instanceof AirtableError ? error : this.fromError(error);
		
		// Log error with context
		logger.error('Error handled', {
			error: {
				name: airtableError.name,
				message: airtableError.message,
				code: airtableError.code,
				statusCode: airtableError.statusCode
			},
			context,
			details: airtableError.details
		});

		return airtableError;
	}

	/**
	 * Create MCP error response
	 * @param {AirtableError} error - Airtable error
	 * @param {string|number|null} id - Request ID
	 * @returns {Object}
	 */
	static toMCPError(error, id = null) {
		const mcpError = {
			jsonrpc: '2.0',
			id,
			error: {
				code: this.getMCPErrorCode(error),
				message: error.message,
				data: {
					type: error.name,
					code: error.code,
					statusCode: error.statusCode,
					timestamp: error.timestamp
				}
			}
		};

		// Add additional details for specific error types
		if (error instanceof RateLimitError) {
			/** @type {Object & {retryAfter?: number}} */
			const errorData = mcpError.error.data;
			errorData.retryAfter = error.retryAfter;
		}

		if (error instanceof ValidationError) {
			/** @type {Object & {validationDetails?: Record<string, string | number | boolean | Object>}} */
			const errorData = mcpError.error.data;
			errorData.validationDetails = error.details;
		}

		return mcpError;
	}

	/**
	 * Get MCP error code from Airtable error
	 * @param {AirtableError} error - Airtable error
	 * @returns {number}
	 */
	static getMCPErrorCode(error) {
		const errorCodeMap = {
			'VALIDATION_ERROR': -32602,
			'AUTHENTICATION_ERROR': -32001,
			'AUTHORIZATION_ERROR': -32002,
			'NOT_FOUND_ERROR': -32003,
			'RATE_LIMIT_ERROR': -32004,
			'UNPROCESSABLE_ENTITY_ERROR': -32005,
			'NETWORK_ERROR': -32006,
			'TIMEOUT_ERROR': -32007,
			'SERVICE_UNAVAILABLE_ERROR': -32008,
			'INTERNAL_SERVER_ERROR': -32603
		};

		return /** @type {Record<string, number>} */ (errorCodeMap)[error.code] || -32603; // Default to internal error
	}

	/**
	 * Create HTTP error response
	 * @param {AirtableError} error - Airtable error
	 * @returns {{status: number, body: Object}}
	 */
	static toHTTPError(error) {
		return {
			status: error.statusCode || 500,
			body: {
				error: {
					type: error.name,
					message: error.message,
					code: error.code,
					timestamp: error.timestamp
				}
			}
		};
	}

	/**
	 * Check if error is retryable
	 * @param {AirtableError} error - Airtable error
	 * @returns {boolean}
	 */
	static isRetryable(error) {
		const retryableCodes = [
			'RATE_LIMIT_ERROR',
			'NETWORK_ERROR',
			'TIMEOUT_ERROR',
			'SERVICE_UNAVAILABLE_ERROR',
			'INTERNAL_SERVER_ERROR'
		];

		return retryableCodes.includes(error.code);
	}

	/**
	 * Get retry delay for error
	 * @param {AirtableError} error - Airtable error
	 * @param {number} attempt - Retry attempt number
	 * @returns {number} Delay in milliseconds
	 */
	static getRetryDelay(error, attempt) {
		if (error instanceof RateLimitError) {
			return (error.retryAfter || 5) * 1000;
		}

		// Exponential backoff with jitter
		const baseDelay = 1000;
		const maxDelay = 30000;
		const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
		const jitter = Math.random() * 0.1 * exponentialDelay;
		
		return exponentialDelay + jitter;
	}

	/**
	 * Categorize error for metrics
	 * @param {AirtableError} error - Airtable error
	 * @returns {string}
	 */
	static categorizeError(error) {
		const categories = {
			'VALIDATION_ERROR': 'client',
			'AUTHENTICATION_ERROR': 'auth',
			'AUTHORIZATION_ERROR': 'auth',
			'NOT_FOUND_ERROR': 'client',
			'RATE_LIMIT_ERROR': 'rate_limit',
			'UNPROCESSABLE_ENTITY_ERROR': 'client',
			'NETWORK_ERROR': 'network',
			'TIMEOUT_ERROR': 'timeout',
			'SERVICE_UNAVAILABLE_ERROR': 'service',
			'INTERNAL_SERVER_ERROR': 'server'
		};

		return /** @type {Record<string, string>} */ (categories)[error.code] || 'unknown';
	}

	/**
	 * Create error summary for logging
	 * @param {AirtableError} error - Airtable error
	 * @returns {Object}
	 */
	static createErrorSummary(error) {
		return {
			type: error.name,
			code: error.code,
			message: error.message,
			statusCode: error.statusCode,
			category: this.categorizeError(error),
			retryable: this.isRetryable(error),
			timestamp: error.timestamp
		};
	}

	/**
	 * Handle multiple errors
	 * @param {Array<Error>} errors - Array of errors
	 * @param {Object} context - Error context
	 * @returns {Array<AirtableError>}
	 */
	static handleMultiple(errors, context = {}) {
		return errors.map((error, index) => {
			return this.handle(error, { ...context, errorIndex: index });
		});
	}
}

/**
 * Error middleware for Express
 * @param {Error} err - Error object
 * @param {import('express').Request} req - Request object
 * @param {import('express').Response} res - Response object
 * @param {import('express').NextFunction} _next - Next middleware
 */
export function errorMiddleware(err, req, res, _next) {
	const error = AirtableErrorHandler.handle(err, {
		method: req.method,
		url: req.url,
		instanceId: /** @type {import('express').Request & {instanceId?: string}} */ (req).instanceId,
		userAgent: req.get('User-Agent')
	});

	const httpError = AirtableErrorHandler.toHTTPError(error);
	
	res.status(httpError.status).json(httpError.body);
}

/**
 * Async error wrapper
 * @param {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => Promise<void>} fn - Async function to wrap
 * @returns {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => void}
 */
export function asyncErrorHandler(fn) {
	return (req, res, next) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
}

/**
 * Error recovery helper
 * @template T
 * @param {() => Promise<T>} operation - Operation to execute
 * @param {{maxRetries?: number, retryDelay?: number, context?: Record<string, string | number | boolean>}} options - Recovery options
 * @returns {Promise<T>}
 */
export async function withErrorRecovery(operation, options = {}) {
	const { maxRetries = 3, context = {} } = options;
	
	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await operation();
		} catch (error) {
			const airtableError = AirtableErrorHandler.handle(/** @type {Error} */ (error), { ...context, attempt });
			
			if (attempt === maxRetries || !AirtableErrorHandler.isRetryable(airtableError)) {
				throw airtableError;
			}

			const delay = AirtableErrorHandler.getRetryDelay(airtableError, attempt);
			logger.warn('Operation failed, retrying', {
				attempt,
				maxRetries,
				delay,
				error: AirtableErrorHandler.createErrorSummary(airtableError)
			});

			await new Promise(resolve => setTimeout(resolve, delay));
		}
	}
	
	// This should never be reached, but satisfies TypeScript
	throw new Error('Unexpected end of retry loop');
}

/**
 * Default export
 */
export default AirtableErrorHandler;