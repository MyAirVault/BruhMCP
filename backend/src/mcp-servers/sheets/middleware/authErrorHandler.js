/**
 * @fileoverview Authentication error handling for Google Sheets middleware
 * Provides centralized error handling for OAuth operations
 */

/// <reference path="./types.js" />

const { ErrorResponses  } = require('../../../utils/errorResponse');
const { logOAuthError  } = require('../utils/oauthErrorHandler');

/**
 * Create system error response
 * @param {import('./types.js').ExpressResponse} res - Express response
 * @param {string} instanceId - Instance ID
 * @param {Error} error - Error object
 * @returns {any} Error response
 */
function createSystemErrorResponse(res, instanceId, error) {
	console.error('Credential authentication middleware error:', error);
	const errorMessage = error instanceof Error ? error.message : String(error);
	return ErrorResponses.internal(res, 'Authentication system error', {
		instanceId,
		metadata: { errorMessage }
	});
}

/**
 * Create lightweight system error response
 * @param {import('./types.js').ExpressResponse} res - Express response
 * @param {string} instanceId - Instance ID
 * @param {Error} error - Error object
 * @returns {any} Error response
 */
function createLightweightSystemErrorResponse(res, instanceId, error) {
	console.error('Lightweight authentication middleware error:', error);
	const errorMessage = error instanceof Error ? error.message : String(error);
	return ErrorResponses.internal(res, 'Authentication system error', {
		instanceId,
		metadata: { errorMessage }
	});
}

/**
 * Handle token refresh failure
 * @param {string} instanceId - Instance ID
 * @param {Error} error - Refresh error
 * @returns {Object} Error response details
 */
function handleRefreshFailure(instanceId, error) {
	// Log the OAuth error
	logOAuthError(error, 'token refresh', instanceId);
	
	// Determine if re-authentication is required
	const requiresReauth = error.message?.includes('invalid_grant') || 
		error.message?.includes('Token has been expired or revoked');
	
	return {
		requiresReauth,
		error: error.message || 'Token refresh failed',
		errorCode: (error instanceof Error && 'errorType' in error) ? error.errorType : 'TOKEN_REFRESH_FAILED',
		instanceId
	};
}

/**
 * Create token refresh failure response
 * @param {import('./types.js').ExpressResponse} res - Express response
 * @param {{error: string, errorCode: string, requiresReauth: boolean, instanceId: string}} errorDetails - Error details
 * @returns {any} Error response
 */
function createRefreshFailureResponse(res, errorDetails) {
	return ErrorResponses.unauthorized(res, errorDetails.error, {
		instanceId: errorDetails.instanceId
	});
}

/**
 * Create re-authentication required response
 * @param {import('./types.js').ExpressResponse} res - Express response
 * @param {string} instanceId - Instance ID
 * @returns {any} Error response
 */
function createReauthenticationResponse(res, instanceId) {
	return ErrorResponses.unauthorized(res, 'OAuth authentication required - please re-authenticate', {
		instanceId
	});
}

/**
 * Log refresh fallback attempt
 * @param {Error} error - Original error
 */
function logRefreshFallback(error) {
	console.log(`🔄 Falling back to full OAuth exchange due to refresh error: ${error.message}`);
}

module.exports = {
	createSystemErrorResponse,
	createLightweightSystemErrorResponse,
	handleRefreshFailure,
	createRefreshFailureResponse,
	createReauthenticationResponse,
	logRefreshFallback
};