/**
 * OAuth Error Handler for Notion MCP Service
 * Handles OAuth-specific error scenarios and token refresh failures
 */

/**
 * Handle token refresh failures with appropriate error mapping
 * @param {string} instanceId - The instance ID
 * @param {Error} error - The refresh error
 * @param {Function} updateOAuthStatus - Function to update OAuth status
 * @returns {Promise<Object>} Error response object
 */
export async function handleTokenRefreshFailure(instanceId, error, updateOAuthStatus) {
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
 * @param {Error} error - The OAuth error
 * @param {string} operation - The operation that failed
 * @param {string} instanceId - The instance ID
 */
export function logOAuthError(error, operation, instanceId) {
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
 * @param {Object} metadata - Additional error metadata
 * @returns {Object} Standardized error object
 */
export function createOAuthError(errorType, message, metadata = {}) {
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
