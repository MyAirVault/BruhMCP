/**
 * Error handling utilities for Notion MCP service
 */

import { Logger } from './logger.js';

/**
 * Notion API error codes
 */
export const NotionErrorCodes = {
	INVALID_REQUEST: 'invalid_request',
	INVALID_JSON: 'invalid_json',
	INVALID_REQUEST_URL: 'invalid_request_url',
	INVALID_REQUEST_METHOD: 'invalid_request_method',
	UNAUTHORIZED: 'unauthorized',
	RESTRICTED_RESOURCE: 'restricted_resource',
	OBJECT_NOT_FOUND: 'object_not_found',
	RATE_LIMITED: 'rate_limited',
	INTERNAL_SERVER_ERROR: 'internal_server_error',
	SERVICE_UNAVAILABLE: 'service_unavailable',
	DATABASE_CONNECTION_UNAVAILABLE: 'database_connection_unavailable',
	GATEWAY_TIMEOUT: 'gateway_timeout',
	CONFLICT_ERROR: 'conflict_error',
	VALIDATION_ERROR: 'validation_error',
};

/**
 * Parse Notion API error response
 * @param {Error} error - Error object
 * @returns {Object} Parsed error information
 */
export function parseNotionError(error) {
	let errorCode = NotionErrorCodes.INTERNAL_SERVER_ERROR;
	let message = 'An unexpected error occurred';
	let statusCode = 500;
	let details = null;

	try {
		// Check if error message contains HTTP status
		if (error.message) {
			const httpMatch = error.message.match(/HTTP (\d+):/);
			if (httpMatch) {
				statusCode = parseInt(httpMatch[1]);

				// Try to parse JSON error response
				try {
					const jsonMatch = error.message.match(/HTTP \d+: (.+)/);
					if (jsonMatch) {
						const errorData = JSON.parse(jsonMatch[1]);
						if (errorData.code) {
							errorCode = errorData.code;
						}
						if (errorData.message) {
							message = errorData.message;
						}
						details = errorData;
					}
				} catch (parseError) {
					// If JSON parsing fails, use the original error message
					message = error.message;
				}
			} else {
				message = error.message;
			}
		}

		// Map HTTP status codes to error codes
		switch (statusCode) {
			case 400:
				errorCode = NotionErrorCodes.INVALID_REQUEST;
				break;
			case 401:
				errorCode = NotionErrorCodes.UNAUTHORIZED;
				break;
			case 403:
				errorCode = NotionErrorCodes.RESTRICTED_RESOURCE;
				break;
			case 404:
				errorCode = NotionErrorCodes.OBJECT_NOT_FOUND;
				break;
			case 409:
				errorCode = NotionErrorCodes.CONFLICT_ERROR;
				break;
			case 429:
				errorCode = NotionErrorCodes.RATE_LIMITED;
				break;
			case 500:
				errorCode = NotionErrorCodes.INTERNAL_SERVER_ERROR;
				break;
			case 502:
			case 503:
				errorCode = NotionErrorCodes.SERVICE_UNAVAILABLE;
				break;
			case 504:
				errorCode = NotionErrorCodes.GATEWAY_TIMEOUT;
				break;
		}
	} catch (parseError) {
		Logger.error('Failed to parse error:', parseError);
	}

	return {
		code: errorCode,
		message,
		statusCode,
		details,
	};
}

/**
 * Create user-friendly error message
 * @param {Object} errorInfo - Parsed error information
 * @returns {string} User-friendly error message
 */
export function createUserFriendlyMessage(errorInfo) {
	const { code, message, statusCode } = errorInfo;

	switch (code) {
		case NotionErrorCodes.UNAUTHORIZED:
			return 'Invalid or expired API key. Please check your Notion API key.';

		case NotionErrorCodes.RESTRICTED_RESOURCE:
			return 'Access denied. Please check your permissions for this resource.';

		case NotionErrorCodes.OBJECT_NOT_FOUND:
			return 'The requested page, database, or block was not found.';

		case NotionErrorCodes.RATE_LIMITED:
			return 'Rate limit exceeded. Please try again later.';

		case NotionErrorCodes.INVALID_REQUEST:
			return `Invalid request: ${message}`;

		case NotionErrorCodes.INVALID_JSON:
			return 'Invalid JSON in request body.';

		case NotionErrorCodes.SERVICE_UNAVAILABLE:
			return 'Notion service is temporarily unavailable. Please try again later.';

		case NotionErrorCodes.GATEWAY_TIMEOUT:
			return 'Request timeout. Please try again.';

		case NotionErrorCodes.CONFLICT_ERROR:
			return 'Conflict occurred. The resource may have been modified by another process.';

		case NotionErrorCodes.VALIDATION_ERROR:
			return `Validation error: ${message}`;

		default:
			return message || 'An unexpected error occurred';
	}
}

/**
 * Handle Notion API errors with retry logic
 * @param {Error} error - Error object
 * @param {number} attempt - Current attempt number
 * @param {number} maxAttempts - Maximum number of attempts
 * @returns {Object} Error handling result
 */
export function handleNotionError(error, attempt = 1, maxAttempts = 3) {
	const errorInfo = parseNotionError(error);
	const userMessage = createUserFriendlyMessage(errorInfo);

	// Log error
	Logger.error(`Notion API error (attempt ${attempt}/${maxAttempts}):`, {
		code: errorInfo.code,
		message: errorInfo.message,
		statusCode: errorInfo.statusCode,
	});

	// Determine if error is retryable
	const retryableErrors = [
		NotionErrorCodes.RATE_LIMITED,
		NotionErrorCodes.INTERNAL_SERVER_ERROR,
		NotionErrorCodes.SERVICE_UNAVAILABLE,
		NotionErrorCodes.GATEWAY_TIMEOUT,
		NotionErrorCodes.DATABASE_CONNECTION_UNAVAILABLE,
	];

	const shouldRetry = retryableErrors.includes(errorInfo.code) && attempt < maxAttempts;

	// Calculate retry delay
	let retryDelay = 0;
	if (shouldRetry) {
		if (errorInfo.code === NotionErrorCodes.RATE_LIMITED) {
			// For rate limiting, use exponential backoff starting at 1 second
			retryDelay = Math.min(1000 * Math.pow(2, attempt - 1), 30000);
		} else {
			// For other errors, use linear backoff
			retryDelay = 1000 * attempt;
		}
	}

	return {
		...errorInfo,
		userMessage,
		shouldRetry,
		retryDelay,
		attempt,
		maxAttempts,
	};
}

/**
 * Create MCP error response
 * @param {Object} errorInfo - Error information
 * @param {string|number} requestId - Request ID
 * @returns {Object} MCP error response
 */
export function createMCPErrorResponse(errorInfo, requestId) {
	const { code, message, statusCode, userMessage } = errorInfo;

	// Map Notion error codes to MCP error codes
	let mcpErrorCode = -32603; // Internal error

	switch (code) {
		case NotionErrorCodes.INVALID_REQUEST:
		case NotionErrorCodes.INVALID_JSON:
		case NotionErrorCodes.VALIDATION_ERROR:
			mcpErrorCode = -32602; // Invalid params
			break;
		case NotionErrorCodes.UNAUTHORIZED:
		case NotionErrorCodes.RESTRICTED_RESOURCE:
			mcpErrorCode = -32001; // Unauthorized
			break;
		case NotionErrorCodes.OBJECT_NOT_FOUND:
			mcpErrorCode = -32002; // Not found
			break;
		case NotionErrorCodes.RATE_LIMITED:
			mcpErrorCode = -32003; // Rate limited
			break;
		default:
			mcpErrorCode = -32603; // Internal error
	}

	return {
		jsonrpc: '2.0',
		id: requestId,
		error: {
			code: mcpErrorCode,
			message: userMessage || message,
			data: {
				notion_error_code: code,
				notion_status_code: statusCode,
				details: message,
			},
		},
	};
}

/**
 * Validate error handling configuration
 * @param {Object} config - Error handling configuration
 * @returns {boolean} True if valid
 */
export function validateErrorConfig(config) {
	if (!config || typeof config !== 'object') {
		return false;
	}

	// Check required properties
	const requiredProps = ['maxRetries', 'baseDelay', 'maxDelay'];
	for (const prop of requiredProps) {
		if (typeof config[prop] !== 'number' || config[prop] < 0) {
			return false;
		}
	}

	return true;
}
