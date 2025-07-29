/**
 * Standardized error response utility
 * Provides consistent error formatting across the entire backend
 * @fileoverview Creates uniform error responses for all API endpoints
 */

/**
 * Validation error detail structure
 * @typedef {Object} ValidationDetail
 * @property {string} field - Field name with validation error
 * @property {string} message - Validation error message
 * @property {string} code - Validation error code
 */

/**
 * Error object structure
 * @typedef {Object} ErrorObject
 * @property {string} code - Error code (e.g., 'VALIDATION_ERROR', 'NOT_FOUND')
 * @property {string} message - Human-readable error message
 * @property {string} timestamp - ISO timestamp of when error occurred
 * @property {Array<ValidationDetail>} [details] - Additional error details (for validation errors)
 * @property {string} [instanceId] - Instance ID if applicable
 * @property {string} [userId] - User ID if applicable
 * @property {string} [reason] - Error reason if applicable
 * @property {string} [expiresAt] - Expiration date if applicable
 * @property {string} [plan] - Plan type if applicable
 * @property {number} [currentCount] - Current count if applicable
 * @property {number} [maxInstances] - Maximum instances if applicable
 * @property {string} [upgradeMessage] - Upgrade message if applicable
 * @property {Object} [metadata] - Additional metadata
 */

/**
 * Standard error response structure
 * @typedef {Object} ErrorResponse
 * @property {ErrorObject} error - Error details
 */

/**
 * Options for error response creation
 * @typedef {Object} CustomErrorOptions
 * @property {Array<ValidationDetail>} [details] - Validation error details
 * @property {string} [instanceId] - Instance ID
 * @property {string} [userId] - User ID
 * @property {string} [reason] - Error reason
 * @property {string} [expiresAt] - Expiration date
 * @property {string} [plan] - Plan type
 * @property {number} [currentCount] - Current count
 * @property {number} [maxInstances] - Maximum instances
 * @property {string} [upgradeMessage] - Upgrade message
 * @property {Object} [metadata] - Additional metadata
 * @property {string} [error] - Error message
 * @property {string} [oauthStatus] - OAuth status
 * @property {string} [message] - Custom message
 * @property {string} [status] - Status code
 * @property {string} [service] - Service name
 * @property {string} [expectedFormat] - Expected format
 * @property {string} [action] - Action being performed
 * @property {string[]} [requiredScopes] - Required OAuth scopes
 */

/**
 * Creates a standardized error response
 * @param {number} _statusCode - HTTP status code (not used in response, kept for API compatibility)
 * @param {string} code - Error code (uppercase with underscores)
 * @param {string} message - Human-readable error message
 * @param {CustomErrorOptions} [options] - Additional options
 * @returns {ErrorResponse} Standardized error response object
 */
function createErrorResponse(_statusCode, code, message, options = {}) {
	/** @type {ErrorResponse} */
	const errorResponse = {
		error: {
			code,
			message,
			timestamp: new Date().toISOString(),
		},
	};

	// Add optional fields if provided
	if (options.details && Array.isArray(options.details)) {
		errorResponse.error.details = options.details;
	}

	if (options.instanceId) {
		errorResponse.error.instanceId = options.instanceId;
	}

	if (options.userId) {
		errorResponse.error.userId = options.userId;
	}

	if (options.reason) {
		errorResponse.error.reason = options.reason;
	}

	if (options.expiresAt) {
		errorResponse.error.expiresAt = options.expiresAt;
	}

	if (options.plan) {
		errorResponse.error.plan = options.plan;
	}

	if (options.currentCount !== undefined) {
		errorResponse.error.currentCount = options.currentCount;
	}

	if (options.maxInstances !== undefined) {
		errorResponse.error.maxInstances = options.maxInstances;
	}

	if (options.upgradeMessage) {
		errorResponse.error.upgradeMessage = options.upgradeMessage;
	}

	if (options.metadata && typeof options.metadata === 'object') {
		errorResponse.error.metadata = options.metadata;
	}

	return errorResponse;
}

/**
 * Sends a standardized error response
 * @param {import('express').Response} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {CustomErrorOptions} [options] - Additional options
 */
function sendErrorResponse(res, statusCode, code, message, options = {}) {
	const errorResponse = createErrorResponse(statusCode, code, message, options);
	res.status(statusCode).json(errorResponse);
}

/**
 * Common error response helpers for frequent use cases
 */
const ErrorResponses = {
	// Authentication & Authorization
	/**
	 * @param {import('express').Response} res
	 * @param {string} [message]
	 * @param {CustomErrorOptions} [options]
	 */
	unauthorized: (res, message = 'Authentication required', options = {}) =>
		sendErrorResponse(res, 401, 'UNAUTHORIZED', message, options),

	/**
	 * @param {import('express').Response} res
	 * @param {string} [message]
	 * @param {CustomErrorOptions} [options]
	 */
	forbidden: (res, message = 'Access denied', options = {}) =>
		sendErrorResponse(res, 403, 'FORBIDDEN', message, options),

	/**
	 * @param {import('express').Response} res
	 * @param {string} [message]
	 * @param {CustomErrorOptions} [options]
	 */
	invalidToken: (res, message = 'Invalid or expired authentication token', options = {}) =>
		sendErrorResponse(res, 401, 'INVALID_AUTH_TOKEN', message, options),

	/**
	 * @param {import('express').Response} res
	 * @param {string} [message]
	 * @param {CustomErrorOptions} [options]
	 */
	missingToken: (res, message = 'Authentication token required', options = {}) =>
		sendErrorResponse(res, 401, 'MISSING_AUTH_TOKEN', message, options),

	// Validation
	/**
	 * @param {import('express').Response} res
	 * @param {string} [message]
	 * @param {Array<ValidationDetail>} [details]
	 * @param {CustomErrorOptions} [options]
	 */
	validation: (res, message = 'Invalid request parameters', details = [], options = {}) =>
		sendErrorResponse(res, 400, 'VALIDATION_ERROR', message, { ...options, details }),

	/**
	 * @param {import('express').Response} res
	 * @param {string} [message]
	 * @param {CustomErrorOptions} [options]
	 */
	badRequest: (res, message = 'Bad request', options = {}) =>
		sendErrorResponse(res, 400, 'BAD_REQUEST', message, options),

	/**
	 * @param {import('express').Response} res
	 * @param {string} [message]
	 * @param {CustomErrorOptions} [options]
	 */
	invalidInput: (res, message = 'Invalid input provided', options = {}) =>
		sendErrorResponse(res, 400, 'INVALID_INPUT', message, options),

	/**
	 * @param {import('express').Response} res
	 * @param {string} field
	 * @param {CustomErrorOptions} [options]
	 */
	missingField: (res, field, options = {}) =>
		sendErrorResponse(res, 400, 'MISSING_FIELD', `Required field '${field}' is missing`, options),

	// Resource Management
	/**
	 * @param {import('express').Response} res
	 * @param {string} [resource]
	 * @param {CustomErrorOptions} [options]
	 */
	notFound: (res, resource = 'Resource', options = {}) =>
		sendErrorResponse(res, 404, 'NOT_FOUND', `${resource} not found`, options),

	/**
	 * @param {import('express').Response} res
	 * @param {string} [resource]
	 * @param {CustomErrorOptions} [options]
	 */
	alreadyExists: (res, resource = 'Resource', options = {}) =>
		sendErrorResponse(res, 409, 'ALREADY_EXISTS', `${resource} already exists`, options),

	// Instance-specific
	/**
	 * @param {import('express').Response} res
	 * @param {string} instanceId
	 * @param {CustomErrorOptions} [options]
	 */
	instanceNotFound: (res, instanceId, options = {}) =>
		sendErrorResponse(res, 404, 'INSTANCE_NOT_FOUND', 'MCP instance not found or access denied', {
			instanceId,
			...options,
		}),

	/**
	 * @param {import('express').Response} res
	 * @param {string} instanceId
	 * @param {CustomErrorOptions} [options]
	 */
	instanceUnavailable: (res, instanceId, options = {}) =>
		sendErrorResponse(res, 502, 'INSTANCE_NOT_AVAILABLE', `MCP instance is not available or not running`, {
			instanceId,
			...options,
		}),

	// Service Management
	/**
	 * @param {import('express').Response} res
	 * @param {string} serviceName
	 * @param {CustomErrorOptions} [options]
	 */
	serviceDisabled: (res, serviceName, options = {}) =>
		sendErrorResponse(res, 503, 'SERVICE_DISABLED', `${serviceName} service is currently disabled`, options),

	/**
	 * @param {import('express').Response} res
	 * @param {string} [serviceName]
	 * @param {CustomErrorOptions} [options]
	 */
	serviceUnavailable: (res, serviceName = 'Service', options = {}) =>
		sendErrorResponse(res, 503, 'SERVICE_UNAVAILABLE', `${serviceName} is temporarily unavailable`, options),

	// Rate Limiting
	/**
	 * @param {import('express').Response} res
	 * @param {string} [message]
	 * @param {CustomErrorOptions} [options]
	 */
	rateLimited: (res, message = 'Too many requests', options = {}) =>
		sendErrorResponse(res, 429, 'RATE_LIMITED', message, options),

	// Server Errors
	/**
	 * @param {import('express').Response} res
	 * @param {string} [message]
	 * @param {CustomErrorOptions} [options]
	 */
	internal: (res, message = 'Internal server error', options = {}) =>
		sendErrorResponse(res, 500, 'INTERNAL_ERROR', message, options),

	/**
	 * @param {import('express').Response} res
	 * @param {string} [message]
	 * @param {CustomErrorOptions} [options]
	 */
	databaseError: (res, message = 'Database operation failed', options = {}) =>
		sendErrorResponse(res, 500, 'DATABASE_ERROR', message, options),

	// External API Errors
	/**
	 * @param {import('express').Response} res
	 * @param {string} service
	 * @param {string} [message]
	 * @param {CustomErrorOptions} [options]
	 */
	externalApiError: (res, service, message = 'External service error', options = {}) =>
		sendErrorResponse(res, 502, 'EXTERNAL_API_ERROR', `${service}: ${message}`, options),

	/**
	 * @param {import('express').Response} res
	 * @param {string} service
	 * @param {CustomErrorOptions} [options]
	 */
	credentialsInvalid: (res, service, options = {}) =>
		sendErrorResponse(res, 400, 'INVALID_CREDENTIALS', `Invalid credentials for ${service}`, options),
};

/**
 * Converts Zod validation errors to standard format
 * @param {import('zod').ZodError} zodError - Zod validation error
 * @returns {Array<ValidationDetail>} Formatted validation details
 */
function formatZodErrors(zodError) {
	return zodError.errors.map(err => ({
		field: err.path.join('.'),
		message: err.message,
		code: err.code,
	}));
}

/**
 * Error handler middleware for Express
 * Catches unhandled errors and formats them consistently
 * @param {Error} err - Error object
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 */
function errorHandler(err, req, res, next) {
	console.error(`Unhandled error on ${req.method} ${req.originalUrl}:`, err);

	// Check if response was already sent
	if (res.headersSent) {
		next(err);
		return;
	}

	// Handle specific error types
	if (err.name === 'ValidationError') {
		ErrorResponses.validation(res, err.message);
		return;
	}

	if (err.name === 'UnauthorizedError') {
		ErrorResponses.unauthorized(res, err.message);
		return;
	}

	// Default internal server error
	ErrorResponses.internal(res, 'An unexpected error occurred', {
		metadata: {
			path: req.originalUrl,
			method: req.method,
		},
	});
}

module.exports = {
	createErrorResponse,
	sendErrorResponse,
	ErrorResponses,
	formatZodErrors,
	errorHandler
};
