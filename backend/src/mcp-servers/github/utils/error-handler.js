/**
 * GitHub Error Handler
 * Comprehensive error handling for GitHub API operations
 */

import { createLogger } from './logger.js';

const logger = createLogger('GitHubErrorHandler');

/**
 * Custom error classes
 */
export class GitHubError extends Error {
	constructor(message, code, statusCode, details = {}) {
		super(message);
		this.name = 'GitHubError';
		this.code = code;
		this.statusCode = statusCode;
		this.details = details;
		this.timestamp = new Date().toISOString();
	}
}

export class ValidationError extends GitHubError {
	constructor(message, details = {}) {
		super(message, 'VALIDATION_ERROR', 400, details);
		this.name = 'ValidationError';
	}
}

export class AuthenticationError extends GitHubError {
	constructor(message, details = {}) {
		super(message, 'AUTHENTICATION_ERROR', 401, details);
		this.name = 'AuthenticationError';
	}
}

export class AuthorizationError extends GitHubError {
	constructor(message, details = {}) {
		super(message, 'AUTHORIZATION_ERROR', 403, details);
		this.name = 'AuthorizationError';
	}
}

export class NotFoundError extends GitHubError {
	constructor(message, details = {}) {
		super(message, 'NOT_FOUND_ERROR', 404, details);
		this.name = 'NotFoundError';
	}
}

export class RateLimitError extends GitHubError {
	constructor(message, retryAfter, details = {}) {
		super(message, 'RATE_LIMIT_ERROR', 429, { retryAfter, ...details });
		this.name = 'RateLimitError';
		this.retryAfter = retryAfter;
	}
}

export class UnprocessableEntityError extends GitHubError {
	constructor(message, details = {}) {
		super(message, 'UNPROCESSABLE_ENTITY_ERROR', 422, details);
		this.name = 'UnprocessableEntityError';
	}
}

export class InternalServerError extends GitHubError {
	constructor(message, details = {}) {
		super(message, 'INTERNAL_SERVER_ERROR', 500, details);
		this.name = 'InternalServerError';
	}
}

export class ServiceUnavailableError extends GitHubError {
	constructor(message, details = {}) {
		super(message, 'SERVICE_UNAVAILABLE_ERROR', 503, details);
		this.name = 'ServiceUnavailableError';
	}
}

export class NetworkError extends GitHubError {
	constructor(message, details = {}) {
		super(message, 'NETWORK_ERROR', 0, details);
		this.name = 'NetworkError';
	}
}

export class TimeoutError extends GitHubError {
	constructor(message, details = {}) {
		super(message, 'TIMEOUT_ERROR', 408, details);
		this.name = 'TimeoutError';
	}
}

export class ConflictError extends GitHubError {
	constructor(message, details = {}) {
		super(message, 'CONFLICT_ERROR', 409, details);
		this.name = 'ConflictError';
	}
}

export class AbuseDetectionError extends GitHubError {
	constructor(message, retryAfter, details = {}) {
		super(message, 'ABUSE_DETECTION_ERROR', 403, { retryAfter, ...details });
		this.name = 'AbuseDetectionError';
		this.retryAfter = retryAfter;
	}
}

/**
 * Error handler class
 */
export class GitHubErrorHandler {
	/**
	 * Create error from HTTP response
	 * @param {Response} response - HTTP response
	 * @returns {GitHubError}
	 */
	static async fromResponse(response) {
		let errorData = {};
		
		try {
			const text = await response.text();
			if (text) {
				errorData = JSON.parse(text);
			}
		} catch (parseError) {
			logger.warn('Failed to parse error response', { parseError: parseError.message });
		}

		const { status, statusText, url } = response;
		const message = errorData.message || statusText || 'Unknown error';
		const details = {
			status,
			statusText,
			url,
			response: errorData,
			headers: Object.fromEntries(response.headers.entries()),
			githubRequestId: response.headers.get('X-GitHub-Request-Id'),
			rateLimitRemaining: response.headers.get('X-RateLimit-Remaining'),
			rateLimitReset: response.headers.get('X-RateLimit-Reset')
		};

		// Handle GitHub-specific error responses
		if (errorData.errors) {
			details.validationErrors = errorData.errors;
		}

		if (errorData.documentation_url) {
			details.documentationUrl = errorData.documentation_url;
		}

		switch (status) {
			case 400:
				return new ValidationError(message, details);
			
			case 401:
				return new AuthenticationError(message, details);
			
			case 403:
				// Check for abuse detection
				if (errorData.message && errorData.message.includes('abuse')) {
					const retryAfter = response.headers.get('Retry-After') || '60';
					return new AbuseDetectionError(message, parseInt(retryAfter), details);
				}
				
				// Check for rate limiting
				if (errorData.message && errorData.message.includes('rate limit')) {
					const retryAfter = response.headers.get('X-RateLimit-Reset') || '3600';
					return new RateLimitError(message, parseInt(retryAfter), details);
				}
				
				return new AuthorizationError(message, details);
			
			case 404:
				return new NotFoundError(message, details);
			
			case 409:
				return new ConflictError(message, details);
			
			case 422:
				return new UnprocessableEntityError(message, details);
			
			case 429:
				const retryAfter = response.headers.get('Retry-After') || '60';
				return new RateLimitError(message, parseInt(retryAfter), details);
			
			case 500:
				return new InternalServerError(message, details);
			
			case 503:
				return new ServiceUnavailableError(message, details);
			
			default:
				return new GitHubError(message, 'HTTP_ERROR', status, details);
		}
	}

	/**
	 * Create error from JavaScript error
	 * @param {Error} error - JavaScript error
	 * @returns {GitHubError}
	 */
	static fromError(error) {
		if (error instanceof GitHubError) {
			return error;
		}

		const details = {
			originalError: error.message,
			stack: error.stack,
			name: error.name
		};

		// Handle specific error types
		if (error.name === 'AbortError' || error.message.includes('timeout')) {
			return new TimeoutError(error.message, details);
		}

		if (error.name === 'TypeError' && error.message.includes('fetch')) {
			return new NetworkError(error.message, details);
		}

		if (error.name === 'SyntaxError') {
			return new ValidationError(`Invalid JSON: ${error.message}`, details);
		}

		// Handle GitHub API specific errors
		if (error.message.includes('GitHub API error')) {
			// Try to extract status code from error message
			const statusMatch = error.message.match(/GitHub API error: (\d+)/);
			if (statusMatch) {
				const statusCode = parseInt(statusMatch[1]);
				return new GitHubError(error.message, 'API_ERROR', statusCode, details);
			}
		}

		// Default to internal server error
		return new InternalServerError(error.message, details);
	}

	/**
	 * Handle and log error
	 * @param {Error} error - Error to handle
	 * @param {Object} context - Error context
	 * @returns {GitHubError}
	 */
	static handle(error, context = {}) {
		const githubError = error instanceof GitHubError ? error : this.fromError(error);
		
		// Log error with context
		logger.error('Error handled', {
			error: {
				name: githubError.name,
				message: githubError.message,
				code: githubError.code,
				statusCode: githubError.statusCode
			},
			context,
			details: githubError.details
		});

		return githubError;
	}

	/**
	 * Create MCP error response
	 * @param {GitHubError} error - GitHub error
	 * @param {string|number} id - Request ID
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
		if (error instanceof RateLimitError || error instanceof AbuseDetectionError) {
			mcpError.error.data.retryAfter = error.retryAfter;
		}

		if (error instanceof ValidationError) {
			mcpError.error.data.validationDetails = error.details;
		}

		if (error.details?.githubRequestId) {
			mcpError.error.data.githubRequestId = error.details.githubRequestId;
		}

		if (error.details?.documentationUrl) {
			mcpError.error.data.documentationUrl = error.details.documentationUrl;
		}

		return mcpError;
	}

	/**
	 * Get MCP error code from GitHub error
	 * @param {GitHubError} error - GitHub error
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
			'INTERNAL_SERVER_ERROR': -32603,
			'CONFLICT_ERROR': -32009,
			'ABUSE_DETECTION_ERROR': -32010
		};

		return errorCodeMap[error.code] || -32603; // Default to internal error
	}

	/**
	 * Create HTTP error response
	 * @param {GitHubError} error - GitHub error
	 * @returns {Object}
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
	 * @param {GitHubError} error - GitHub error
	 * @returns {boolean}
	 */
	static isRetryable(error) {
		const retryableCodes = [
			'RATE_LIMIT_ERROR',
			'ABUSE_DETECTION_ERROR',
			'NETWORK_ERROR',
			'TIMEOUT_ERROR',
			'SERVICE_UNAVAILABLE_ERROR',
			'INTERNAL_SERVER_ERROR'
		];

		return retryableCodes.includes(error.code);
	}

	/**
	 * Get retry delay for error
	 * @param {GitHubError} error - GitHub error
	 * @param {number} attempt - Retry attempt number
	 * @returns {number} Delay in milliseconds
	 */
	static getRetryDelay(error, attempt) {
		if (error instanceof RateLimitError) {
			// GitHub rate limit reset time
			const resetTime = error.details?.rateLimitReset;
			if (resetTime) {
				const resetMs = parseInt(resetTime) * 1000;
				const now = Date.now();
				return Math.max(resetMs - now, 1000);
			}
			return (error.retryAfter || 60) * 1000;
		}

		if (error instanceof AbuseDetectionError) {
			return (error.retryAfter || 60) * 1000;
		}

		// Exponential backoff with jitter
		const baseDelay = 1000;
		const maxDelay = 60000; // 1 minute max for GitHub
		const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
		const jitter = Math.random() * 0.1 * exponentialDelay;
		
		return exponentialDelay + jitter;
	}

	/**
	 * Categorize error for metrics
	 * @param {GitHubError} error - GitHub error
	 * @returns {string}
	 */
	static categorizeError(error) {
		const categories = {
			'VALIDATION_ERROR': 'client',
			'AUTHENTICATION_ERROR': 'auth',
			'AUTHORIZATION_ERROR': 'auth',
			'NOT_FOUND_ERROR': 'client',
			'RATE_LIMIT_ERROR': 'rate_limit',
			'ABUSE_DETECTION_ERROR': 'rate_limit',
			'UNPROCESSABLE_ENTITY_ERROR': 'client',
			'NETWORK_ERROR': 'network',
			'TIMEOUT_ERROR': 'timeout',
			'SERVICE_UNAVAILABLE_ERROR': 'service',
			'INTERNAL_SERVER_ERROR': 'server',
			'CONFLICT_ERROR': 'client'
		};

		return categories[error.code] || 'unknown';
	}

	/**
	 * Create error summary for logging
	 * @param {GitHubError} error - GitHub error
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
			timestamp: error.timestamp,
			githubRequestId: error.details?.githubRequestId,
			rateLimitRemaining: error.details?.rateLimitRemaining
		};
	}

	/**
	 * Handle multiple errors
	 * @param {Array<Error>} errors - Array of errors
	 * @param {Object} context - Error context
	 * @returns {Array<GitHubError>}
	 */
	static handleMultiple(errors, context = {}) {
		return errors.map((error, index) => {
			return this.handle(error, { ...context, errorIndex: index });
		});
	}

	/**
	 * Check if error indicates repository access issues
	 * @param {GitHubError} error - GitHub error
	 * @returns {boolean}
	 */
	static isRepositoryAccessError(error) {
		return error instanceof NotFoundError || 
			   error instanceof AuthorizationError ||
			   (error instanceof ValidationError && error.message.includes('repository'));
	}

	/**
	 * Check if error indicates authentication issues
	 * @param {GitHubError} error - GitHub error
	 * @returns {boolean}
	 */
	static isAuthenticationError(error) {
		return error instanceof AuthenticationError ||
			   (error instanceof AuthorizationError && error.message.includes('token'));
	}

	/**
	 * Get suggested actions for error
	 * @param {GitHubError} error - GitHub error
	 * @returns {Array<string>}
	 */
	static getSuggestedActions(error) {
		const actions = [];

		if (this.isAuthenticationError(error)) {
			actions.push('Check your authentication token');
			actions.push('Verify token has not expired');
		}

		if (this.isRepositoryAccessError(error)) {
			actions.push('Verify repository name and owner');
			actions.push('Check repository permissions');
		}

		if (error instanceof RateLimitError) {
			actions.push('Wait for rate limit reset');
			actions.push('Consider using authenticated requests');
		}

		if (error instanceof AbuseDetectionError) {
			actions.push('Reduce request frequency');
			actions.push('Review GitHub abuse guidelines');
		}

		if (error instanceof ValidationError) {
			actions.push('Check request parameters');
			actions.push('Review API documentation');
		}

		return actions;
	}
}

/**
 * Error middleware for Express
 * @param {Error} err - Error object
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
export function errorMiddleware(err, req, res, next) {
	const error = GitHubErrorHandler.handle(err, {
		method: req.method,
		url: req.url,
		instanceId: req.instanceId,
		userAgent: req.get('User-Agent')
	});

	const httpError = GitHubErrorHandler.toHTTPError(error);
	
	res.status(httpError.status).json(httpError.body);
}

/**
 * Async error wrapper
 * @param {Function} fn - Async function to wrap
 * @returns {Function}
 */
export function asyncErrorHandler(fn) {
	return (req, res, next) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
}

/**
 * Error recovery helper
 * @param {Function} operation - Operation to execute
 * @param {Object} options - Recovery options
 * @returns {Promise}
 */
export async function withErrorRecovery(operation, options = {}) {
	const { maxRetries = 3, retryDelay = 1000, context = {} } = options;
	
	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await operation();
		} catch (error) {
			const githubError = GitHubErrorHandler.handle(error, { ...context, attempt });
			
			if (attempt === maxRetries || !GitHubErrorHandler.isRetryable(githubError)) {
				throw githubError;
			}

			const delay = GitHubErrorHandler.getRetryDelay(githubError, attempt);
			logger.warn('Operation failed, retrying', {
				attempt,
				maxRetries,
				delay,
				error: GitHubErrorHandler.createErrorSummary(githubError)
			});

			await new Promise(resolve => setTimeout(resolve, delay));
		}
	}
}

/**
 * Default export
 */
export default GitHubErrorHandler;