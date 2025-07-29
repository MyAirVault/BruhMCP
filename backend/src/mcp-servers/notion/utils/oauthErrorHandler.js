/**
 * OAuth Error Handler for Notion MCP Service
 * Handles OAuth-specific error scenarios and token refresh failures
 */

/**
 * @typedef {Error & {
 *   errorType?: string,
 *   statusCode?: number,
 *   originalError?: Error,
 *   response?: {
 *     status: number,
 *     data?: { message?: string }
 *   },
 *   code?: string
 * }} ExtendedError
 */

/**
 * @typedef {Object} OAuthStatusUpdate
 * @property {string} status
 * @property {string|null} accessToken
 * @property {string|null} refreshToken
 * @property {Date|null} tokenExpiresAt
 * @property {string|null} scope
 */

/**
 * @typedef {Object} TokenRefreshResponse
 * @property {string} instanceId
 * @property {string} error
 * @property {string} errorCode
 * @property {boolean} requiresReauth
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {string} message
 * @property {number} code
 * @property {number} statusCode
 * @property {string} details
 */

/**
 * @typedef {Object} OAuthErrorObject
 * @property {string} errorType
 * @property {string} message
 * @property {number} statusCode
 * @property {Error} [originalError]
 * @property {string} timestamp
 */

/**
 * Handle token refresh failures with appropriate error mapping
 * @param {string} instanceId - The instance ID
 * @param {ExtendedError} error - The refresh error
 * @param {function(string, OAuthStatusUpdate): Promise<void>} updateOAuthStatus - Function to update OAuth status
 * @returns {Promise<TokenRefreshResponse>} Error response object
 */
async function handleTokenRefreshFailure(instanceId, error, updateOAuthStatus) {
	// Map different error types to appropriate responses
	const errorType = error.errorType || 'UNKNOWN_ERROR';

	switch (errorType) {
		case 'INVALID_GRANT':
		case 'INVALID_CLIENT':
		case 'UNAUTHORIZED_CLIENT':
			// These errors require re-authentication
			await updateOAuthStatus(instanceId, {
				status: 'failed',
				accessToken: null,
				refreshToken: null,
				tokenExpiresAt: null,
				scope: null,
			});

			return {
				instanceId,
				error: 'OAuth authentication required - please re-authenticate',
				errorCode: 'OAUTH_FLOW_REQUIRED',
				requiresReauth: true,
			};

		case 'INVALID_REQUEST':
		case 'UNSUPPORTED_GRANT_TYPE':
			// These are configuration errors
			return {
				instanceId,
				error: 'OAuth configuration error',
				errorCode: 'OAUTH_CONFIG_ERROR',
				requiresReauth: false,
			};

		case 'TEMPORARILY_UNAVAILABLE':
		case 'SERVER_ERROR':
			// These are temporary errors - keep tokens for retry
			return {
				instanceId,
				error: 'OAuth service temporarily unavailable',
				errorCode: 'OAUTH_SERVICE_UNAVAILABLE',
				requiresReauth: false,
			};

		default:
			// Unknown errors - assume re-auth needed
			await updateOAuthStatus(instanceId, {
				status: 'failed',
				accessToken: null,
				refreshToken: null,
				tokenExpiresAt: null,
				scope: null,
			});

			return {
				instanceId,
				error: 'OAuth authentication required - please re-authenticate',
				errorCode: 'OAUTH_FLOW_REQUIRED',
				requiresReauth: true,
			};
	}
}

/**
 * Log OAuth errors with appropriate context
 * @param {ExtendedError} error - The OAuth error
 * @param {string} operation - The operation that failed
 * @param {string} instanceId - The instance ID
 * @returns {void}
 */
function logOAuthError(error, operation, instanceId) {
	console.error(`🔴 OAuth ${operation} failed for instance ${instanceId}:`, {
		errorType: error.errorType || 'UNKNOWN_ERROR',
		message: error.message,
		statusCode: error.statusCode,
		originalError: error.originalError,
	});
}

/**
 * Create standardized OAuth error response
 * @param {string} errorType - The error type
 * @param {string} message - Error message
 * @param {{originalError?: Error} & Object} [metadata={}] - Additional error metadata
 * @returns {OAuthErrorObject} Standardized error object
 */
function createOAuthError(errorType, message, metadata = {}) {
	return {
		errorType,
		message,
		statusCode: getStatusCodeForErrorType(errorType),
		originalError: metadata.originalError,
		timestamp: new Date().toISOString(),
		...metadata,
	};
}

/**
 * Get appropriate HTTP status code for OAuth error type
 * @param {string} errorType - The OAuth error type
 * @returns {number} HTTP status code
 */
function getStatusCodeForErrorType(errorType) {
	switch (errorType) {
		case 'INVALID_GRANT':
		case 'INVALID_CLIENT':
		case 'UNAUTHORIZED_CLIENT':
			return 401;
		case 'INVALID_REQUEST':
		case 'UNSUPPORTED_GRANT_TYPE':
			return 400;
		case 'TEMPORARILY_UNAVAILABLE':
		case 'SERVER_ERROR':
			return 503;
		default:
			return 500;
	}
}

/**
 * Handle Notion-specific API errors and OAuth errors
 * @param {ExtendedError} error - The error to handle
 * @returns {ErrorResponse} Formatted error response
 */
function handleNotionError(error) {
	// Default error structure
	const errorResponse = {
		message: 'An unexpected error occurred',
		code: -32603,
		statusCode: 500,
		details: error.message || 'Unknown error'
	};

	// Handle different error types
	if (error.response) {
		// HTTP response error
		const { status, data } = error.response;
		errorResponse.statusCode = status;

		if (status === 401) {
			errorResponse.message = 'Notion API authentication failed';
			errorResponse.code = -32000;
		} else if (status === 403) {
			errorResponse.message = 'Notion API access forbidden';
			errorResponse.code = -32000;
		} else if (status === 404) {
			errorResponse.message = 'Notion resource not found';
			errorResponse.code = -32601;
		} else if (status === 429) {
			errorResponse.message = 'Notion API rate limit exceeded';
			errorResponse.code = -32000;
		} else if (status >= 500) {
			errorResponse.message = 'Notion API server error';
			errorResponse.code = -32603;
		}

		if (data && data.message) {
			errorResponse.details = data.message;
		}
	} else if (error.code) {
		// Network or other errors
		if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
			errorResponse.message = 'Network error connecting to Notion API';
			errorResponse.statusCode = 503;
		} else if (error.code === 'ETIMEDOUT') {
			errorResponse.message = 'Notion API request timeout';
			errorResponse.statusCode = 504;
		}
	}

	return errorResponse;
}

module.exports = {
  handleTokenRefreshFailure,
  handleNotionError
};