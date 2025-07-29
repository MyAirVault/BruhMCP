/**
 * @fileoverview Authentication error handling for Google Drive OAuth middleware
 */

/// <reference path="./types.js" />

const { ErrorResponses  } = require('../../../utils/errorResponse');

/**
 * Creates a system error response
 * @param {import('./types.js').ExpressResponse} res - Express response
 * @param {string} instanceId - Instance ID
 * @param {Error|unknown} error - Error object
 * @returns {void}
 */
function createSystemErrorResponse(res, instanceId, error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`System error for instance ${instanceId}:`, errorMessage);
  
  ErrorResponses.internal(res, 'System error during authentication', {
    instanceId,
    error: errorMessage
  });
}

/**
 * Creates a lightweight system error response
 * @param {import('./types.js').ExpressResponse} res - Express response
 * @param {string} instanceId - Instance ID
 * @param {Error|unknown} error - Error object
 * @returns {void}
 */
function createLightweightSystemErrorResponse(res, instanceId, error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`Lightweight auth system error for instance ${instanceId}:`, errorMessage);
  
  ErrorResponses.internal(res, 'System error during lightweight authentication', {
    instanceId,
    error: errorMessage
  });
}

/**
 * Handles token refresh failure
 * @param {string} instanceId - Instance ID
 * @param {string} error - Error message
 * @param {boolean} requiresReauth - Whether re-authentication is required
 * @returns {{requiresReauth: boolean, error: string}}
 */
function handleRefreshFailure(instanceId, error, requiresReauth) {
  if (requiresReauth) {
    console.error(`🔐 Re-authentication required for instance ${instanceId}: ${error}`);
  } else {
    console.error(`❌ Token refresh failed for instance ${instanceId}: ${error}`);
  }
  
  return { requiresReauth, error };
}

/**
 * Creates a token refresh failure response
 * @param {import('./types.js').ExpressResponse} res - Express response
 * @param {string} instanceId - Instance ID
 * @param {string} error - Error message
 * @returns {void}
 */
function createRefreshFailureResponse(res, instanceId, error) {
  ErrorResponses.unauthorized(res, 'Failed to refresh OAuth token', {
    instanceId,
    error,
    message: 'Unable to refresh access token. Please check your OAuth configuration.'
  });
}

/**
 * Creates a re-authentication required response
 * @param {import('./types.js').ExpressResponse} res - Express response
 * @param {string} instanceId - Instance ID
 * @returns {void}
 */
function createReauthenticationResponse(res, instanceId) {
  ErrorResponses.unauthorized(res, 'Re-authentication required', {
    instanceId,
    oauthStatus: 'expired',
    message: 'Your Google Drive authentication has expired. Please re-authenticate to continue.',
    action: 'reauth_required'
  });
}

/**
 * Logs OAuth refresh fallback attempt
 * @param {string} instanceId - Instance ID
 * @returns {void}
 */
function logRefreshFallback(instanceId) {
  console.log(`🔄 Attempting direct Google OAuth refresh for instance: ${instanceId}`);
}

/**
 * Creates no valid token response
 * @param {import('./types.js').ExpressResponse} res - Express response
 * @param {string} instanceId - Instance ID
 * @returns {void}
 */
function createNoValidTokenResponse(res, instanceId) {
  ErrorResponses.unauthorized(res, 'No valid OAuth token available', {
    instanceId,
    message: 'No valid access token or refresh token available. Please complete OAuth authentication.',
    action: 'oauth_required'
  });
}

/**
 * Handles OAuth-specific errors with appropriate responses
 * @param {import('./types.js').ExpressResponse} res - Express response
 * @param {string} instanceId - Instance ID
 * @param {Error|unknown} error - Error object
 * @returns {void}
 */
function handleOAuthError(res, instanceId, error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Check for specific OAuth errors
  if (errorMessage.includes('invalid_grant')) {
    createReauthenticationResponse(res, instanceId);
  } else if (errorMessage.includes('invalid_client')) {
    ErrorResponses.unauthorized(res, 'Invalid OAuth client configuration', {
      instanceId,
      error: 'Invalid client ID or client secret',
      action: 'check_oauth_config'
    });
  } else if (errorMessage.includes('insufficient_scope')) {
    ErrorResponses.forbidden(res, 'Insufficient OAuth permissions', {
      instanceId,
      error: 'The OAuth token does not have required scopes',
      requiredScopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/userinfo.email'
      ]
    });
  } else {
    createSystemErrorResponse(res, instanceId, error);
  }
}

module.exports = {
  createSystemErrorResponse,
  createLightweightSystemErrorResponse,
  handleRefreshFailure,
  createRefreshFailureResponse,
  createReauthenticationResponse,
  logRefreshFallback,
  createNoValidTokenResponse,
  handleOAuthError
};