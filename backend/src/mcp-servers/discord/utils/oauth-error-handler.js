/**
 * Discord OAuth Error Handler
 * Handles OAuth errors and provides appropriate responses
 * Based on Gmail MCP service architecture
 */

/**
 * OAuth error types for Discord
 */
export const OAUTH_ERROR_TYPES = {
	INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',
	INVALID_CLIENT: 'INVALID_CLIENT',
	INVALID_GRANT: 'INVALID_GRANT',
	INVALID_SCOPE: 'INVALID_SCOPE',
	UNAUTHORIZED_CLIENT: 'UNAUTHORIZED_CLIENT',
	ACCESS_DENIED: 'ACCESS_DENIED',
	UNSUPPORTED_RESPONSE_TYPE: 'UNSUPPORTED_RESPONSE_TYPE',
	INVALID_REQUEST: 'INVALID_REQUEST',
	NETWORK_ERROR: 'NETWORK_ERROR',
	SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
	RATE_LIMITED: 'RATE_LIMITED',
	UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

/**
 * Parses OAuth error and returns structured error information
 * @param {Error} error - The error to parse
 * @returns {Object} Structured error information
 */
export function parseOAuthError(error) {
	const message = error.message.toLowerCase();

	// Invalid refresh token or expired token
	if (
		message.includes('invalid_grant') ||
		message.includes('invalid_refresh_token') ||
		(message.includes('refresh_token') && message.includes('invalid'))
	) {
		return {
			type: OAUTH_ERROR_TYPES.INVALID_REFRESH_TOKEN,
			requiresReauth: true,
			userMessage: 'Your Discord authorization has expired. Please re-authenticate.',
			shouldRetry: false,
			logLevel: 'warn',
			httpStatus: 401,
		};
	}

	// Invalid client credentials
	if (message.includes('invalid_client') || message.includes('client_id') || message.includes('client_secret')) {
		return {
			type: OAUTH_ERROR_TYPES.INVALID_CLIENT,
			requiresReauth: true,
			userMessage: 'Discord client configuration error. Please contact support.',
			shouldRetry: false,
			logLevel: 'error',
			httpStatus: 401,
		};
	}

	// Access denied by user
	if (message.includes('access_denied')) {
		return {
			type: OAUTH_ERROR_TYPES.ACCESS_DENIED,
			requiresReauth: true,
			userMessage: 'Discord access was denied. Please re-authenticate and grant permissions.',
			shouldRetry: false,
			logLevel: 'info',
			httpStatus: 403,
		};
	}

	// Invalid scope
	if (message.includes('invalid_scope')) {
		return {
			type: OAUTH_ERROR_TYPES.INVALID_SCOPE,
			requiresReauth: true,
			userMessage: 'Invalid Discord permissions requested. Please re-authenticate.',
			shouldRetry: false,
			logLevel: 'error',
			httpStatus: 400,
		};
	}

	// Unauthorized client
	if (message.includes('unauthorized_client')) {
		return {
			type: OAUTH_ERROR_TYPES.UNAUTHORIZED_CLIENT,
			requiresReauth: true,
			userMessage: 'Discord client is not authorized. Please contact support.',
			shouldRetry: false,
			logLevel: 'error',
			httpStatus: 401,
		};
	}

	// Rate limiting
	if (message.includes('rate') && message.includes('limit')) {
		return {
			type: OAUTH_ERROR_TYPES.RATE_LIMITED,
			requiresReauth: false,
			userMessage: 'Discord rate limit exceeded. Please try again later.',
			shouldRetry: true,
			retryAfter: 60000, // 1 minute
			logLevel: 'warn',
			httpStatus: 429,
		};
	}

	// Network errors
	if (
		message.includes('network') ||
		message.includes('connection') ||
		message.includes('timeout') ||
		message.includes('econnreset') ||
		message.includes('enotfound')
	) {
		return {
			type: OAUTH_ERROR_TYPES.NETWORK_ERROR,
			requiresReauth: false,
			userMessage: 'Network error connecting to Discord. Please try again.',
			shouldRetry: true,
			retryAfter: 5000, // 5 seconds
			logLevel: 'warn',
			httpStatus: 503,
		};
	}

	// Service unavailable
	if (
		message.includes('service unavailable') ||
		message.includes('502') ||
		message.includes('503') ||
		message.includes('504')
	) {
		return {
			type: OAUTH_ERROR_TYPES.SERVICE_UNAVAILABLE,
			requiresReauth: false,
			userMessage: 'Discord service is temporarily unavailable. Please try again later.',
			shouldRetry: true,
			retryAfter: 30000, // 30 seconds
			logLevel: 'warn',
			httpStatus: 503,
		};
	}

	// Default unknown error
	return {
		type: OAUTH_ERROR_TYPES.UNKNOWN_ERROR,
		requiresReauth: false,
		userMessage: 'An unexpected error occurred with Discord authentication. Please try again.',
		shouldRetry: false,
		logLevel: 'error',
		httpStatus: 500,
	};
}

/**
 * Handles OAuth error and returns appropriate response
 * @param {Error} error - The error to handle
 * @param {string} instanceId - Instance ID for logging
 * @param {string} operation - Operation being performed
 * @returns {Object} Error response data
 */
export function handleOAuthError(error, instanceId, operation) {
	const errorInfo = parseOAuthError(error);

	// Log the error with appropriate level
	const logMessage = `Discord OAuth error in ${operation} for instance ${instanceId}: ${error.message}`;

	switch (errorInfo.logLevel) {
		case 'error':
			console.error(logMessage);
			break;
		case 'warn':
			console.warn(logMessage);
			break;
		case 'info':
			console.info(logMessage);
			break;
		default:
			console.log(logMessage);
	}

	return {
		success: false,
		error: {
			type: errorInfo.type,
			message: errorInfo.userMessage,
			requiresReauth: errorInfo.requiresReauth,
			shouldRetry: errorInfo.shouldRetry,
			retryAfter: errorInfo.retryAfter,
			httpStatus: errorInfo.httpStatus,
		},
		metadata: {
			instanceId,
			operation,
			errorType: errorInfo.type,
			originalError: error.message,
		},
	};
}

/**
 * Checks if error requires re-authentication
 * @param {Error} error - The error to check
 * @returns {boolean} True if re-authentication is required
 */
export function requiresReauthentication(error) {
	const errorInfo = parseOAuthError(error);
	return errorInfo.requiresReauth;
}

/**
 * Checks if error is retryable
 * @param {Error} error - The error to check
 * @returns {boolean} True if error is retryable
 */
export function isRetryableError(error) {
	const errorInfo = parseOAuthError(error);
	return errorInfo.shouldRetry;
}

/**
 * Gets retry delay for retryable errors
 * @param {Error} error - The error to check
 * @returns {number|null} Retry delay in milliseconds or null if not retryable
 */
export function getRetryDelay(error) {
	const errorInfo = parseOAuthError(error);
	return errorInfo.shouldRetry ? errorInfo.retryAfter || 5000 : null;
}

/**
 * Creates user-friendly error message
 * @param {Error} error - The error to create message for
 * @returns {string} User-friendly error message
 */
export function createUserFriendlyMessage(error) {
	const errorInfo = parseOAuthError(error);
	return errorInfo.userMessage;
}

/**
 * Creates error response for Express
 * @param {Object} res - Express response object
 * @param {Error} error - The error to respond with
 * @param {string} instanceId - Instance ID
 * @param {string} operation - Operation being performed
 */
export function sendOAuthErrorResponse(res, error, instanceId, operation) {
	const errorResponse = handleOAuthError(error, instanceId, operation);

	res.status(errorResponse.error.httpStatus).json({
		success: false,
		error: errorResponse.error.message,
		requiresReauth: errorResponse.error.requiresReauth,
		shouldRetry: errorResponse.error.shouldRetry,
		retryAfter: errorResponse.error.retryAfter,
		metadata: errorResponse.metadata,
	});
}

/**
 * Maps Discord API errors to OAuth error types
 * @param {Object} discordError - Discord API error response
 * @returns {Object} Mapped error information
 */
export function mapDiscordApiError(discordError) {
	const errorCode = discordError.code;
	const errorMessage = discordError.message || 'Unknown Discord API error';

	switch (errorCode) {
		case 50001:
			return {
				type: OAUTH_ERROR_TYPES.ACCESS_DENIED,
				message: 'Missing access to Discord resource',
			};
		case 50013:
			return {
				type: OAUTH_ERROR_TYPES.ACCESS_DENIED,
				message: 'Missing Discord permissions',
			};
		case 40001:
			return {
				type: OAUTH_ERROR_TYPES.INVALID_REFRESH_TOKEN,
				message: 'Discord token is invalid or expired',
			};
		case 40007:
			return {
				type: OAUTH_ERROR_TYPES.INVALID_CLIENT,
				message: 'Discord bot is banned from this guild',
			};
		case 50035:
			return {
				type: OAUTH_ERROR_TYPES.INVALID_REQUEST,
				message: 'Invalid Discord request data',
			};
		default:
			return {
				type: OAUTH_ERROR_TYPES.UNKNOWN_ERROR,
				message: errorMessage,
			};
	}
}

/**
 * Validates OAuth error response format
 * @param {Object} errorResponse - Error response to validate
 * @returns {boolean} True if valid error response format
 */
export function isValidOAuthErrorResponse(errorResponse) {
	return (
		errorResponse &&
		typeof errorResponse === 'object' &&
		typeof errorResponse.error === 'string' &&
		typeof errorResponse.requiresReauth === 'boolean' &&
		typeof errorResponse.shouldRetry === 'boolean'
	);
}

/**
 * Creates structured error for logging
 * @param {Error} error - Original error
 * @param {string} instanceId - Instance ID
 * @param {string} operation - Operation name
 * @param {Object} context - Additional context
 * @returns {Object} Structured error object
 */
export function createStructuredError(error, instanceId, operation, context = {}) {
	const errorInfo = parseOAuthError(error);

	return {
		timestamp: new Date().toISOString(),
		service: 'discord',
		instanceId,
		operation,
		errorType: errorInfo.type,
		message: error.message,
		requiresReauth: errorInfo.requiresReauth,
		shouldRetry: errorInfo.shouldRetry,
		logLevel: errorInfo.logLevel,
		context,
	};
}
