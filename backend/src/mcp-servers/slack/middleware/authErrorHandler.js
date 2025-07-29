/**
 * Authentication error handling utilities
 * Handles OAuth authentication errors and error response creation
 */

/// <reference path="./types.js" />

const { ErrorResponses  } = require('../../../utils/errorResponse');
const { handleTokenRefreshFailure, logOAuthError  } = require('../utils/oauthErrorHandler');
const { updateOAuthStatus  } = require('../../../db/queries/mcpInstances/index');

/**
 * Create system error response for authentication middleware
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @param {Error} error - The error that occurred
 * @returns {void} Express response
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
 * Create lightweight auth system error response
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @param {Error} error - The error that occurred
 * @returns {void} Express response
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
 * Handle token refresh failure and determine appropriate response
 * @param {string} instanceId - The instance ID
 * @param {import('./types.js').TokenRefreshError} refreshError - The token refresh error
 * @returns {Promise<import('./types.js').AuthErrorResult>} Error handling result
 */
async function handleRefreshFailure(instanceId, refreshError) {
  // Convert TokenRefreshError to Error for compatibility with error handler
  const compatibleError = new Error(refreshError.message);
  compatibleError.name = refreshError.name || 'TokenRefreshError';
  /** @type {Error & {errorType?: string, originalError?: string}} */
  const errorWithExtensions = compatibleError;
  errorWithExtensions.errorType = refreshError.errorType;
  errorWithExtensions.originalError = refreshError.originalError;

  // Use centralized error handling
  logOAuthError(errorWithExtensions, 'token refresh', instanceId);
  
  // Create a wrapper function to convert OAuthStatusUpdate to OAuthUpdateData
  /**
   * @param {string} instanceId
   * @param {import('../utils/oauthErrorHandler.js').OAuthStatus} oauthStatusUpdate
   * @returns {Promise<void>}
   */
  const updateOAuthStatusWrapper = async (instanceId, oauthStatusUpdate) => {
    const oauthUpdateData = {
      status: oauthStatusUpdate.status,
      accessToken: oauthStatusUpdate.accessToken || undefined,
      refreshToken: oauthStatusUpdate.refreshToken || undefined,
      tokenExpiresAt: oauthStatusUpdate.tokenExpiresAt ? new Date(oauthStatusUpdate.tokenExpiresAt) : undefined,
      scope: oauthStatusUpdate.scope || undefined
    };
    await updateOAuthStatus(instanceId, oauthUpdateData);
  };

  const errorResponse = await handleTokenRefreshFailure(instanceId, errorWithExtensions, updateOAuthStatusWrapper);
  
  return {
    requiresReauth: errorResponse.requiresReauth || false,
    error: errorResponse.error || 'Authentication failed',
    errorCode: errorResponse.errorCode,
    instanceId: errorResponse.instanceId || instanceId
  };
}

/**
 * Create unauthorized response for token refresh failure
 * @param {import('express').Response} res - Express response object
 * @param {import('./types.js').AuthErrorResult} errorResult - The error result from handling
 * @returns {void} Express response
 */
function createRefreshFailureResponse(res, errorResult) {
  if (errorResult.requiresReauth) {
    return ErrorResponses.unauthorized(res, errorResult.error, {
      instanceId: errorResult.instanceId,
      metadata: {
        error: errorResult.error,
        errorCode: errorResult.errorCode,
        requiresReauth: errorResult.requiresReauth
      }
    });
  }
  
  // This should not happen in current implementation, but handle gracefully
  return ErrorResponses.internal(res, 'Token refresh failed', {
    instanceId: errorResult.instanceId,
    metadata: {
      error: errorResult.error,
      errorCode: errorResult.errorCode
    }
  });
}

/**
 * Mark OAuth status as failed and create re-authentication response
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @param {string} [refreshToken] - The refresh token to preserve
 * @returns {Promise<void>} Express response
 */
async function createReauthenticationResponse(res, instanceId, refreshToken) {
  console.log(`🔐 Full OAuth exchange required for instance: ${instanceId}`);
  
  // Mark OAuth status as failed in database to indicate re-authentication needed
  await updateOAuthStatus(instanceId, {
    status: 'failed',
    accessToken: undefined,
    refreshToken: refreshToken || undefined,
    tokenExpiresAt: undefined,
    scope: undefined
  });
  
  // Return specific error requiring re-authentication
  return ErrorResponses.unauthorized(res, 'OAuth authentication required - please re-authenticate', {
    instanceId,
    metadata: {
      error: 'No valid access token and refresh token failed',
      requiresReauth: true,
      errorCode: 'OAUTH_FLOW_REQUIRED'
    }
  });
}

/**
 * Log fallback message when token refresh fails
 * @param {import('./types.js').TokenRefreshError} refreshError - The token refresh error
 * @returns {void}
 */
function logRefreshFallback(refreshError) {
  console.log(`🔄 Falling back to full OAuth exchange due to refresh error: ${refreshError.message}`);
}
module.exports = {
  handleRefreshFailure,
  createReauthenticationResponse
};