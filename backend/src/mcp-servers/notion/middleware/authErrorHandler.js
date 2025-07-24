/**
 * Authentication error handling for Notion OAuth middleware
 * Handles various error scenarios and provides appropriate responses
 */

/// <reference path="./types.js" />

import { ErrorResponses } from '../../../utils/errorResponse.js';
import { handleTokenRefreshFailure } from '../utils/oauthErrorHandler.js';

/**
 * Create system error response for authentication failures
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @param {Error} error - Error object
 * @returns {void} Express response
 */
export function createSystemErrorResponse(res, instanceId, error) {
  console.error(`❌ System error during authentication for instance: ${instanceId}:`, error);
  return ErrorResponses.internal(res, 'Authentication system error', {
    instanceId,
    metadata: {
      errorMessage: error.message,
      errorType: 'SYSTEM_ERROR'
    }
  });
}

/**
 * Create lightweight system error response
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @param {Error} error - Error object
 * @returns {void} Express response
 */
export function createLightweightSystemErrorResponse(res, instanceId, error) {
  console.error(`❌ Lightweight auth system error for instance: ${instanceId}:`, error);
  return ErrorResponses.internal(res, 'Authentication system error', {
    instanceId,
    metadata: {
      errorMessage: error.message,
      errorType: 'LIGHTWEIGHT_AUTH_ERROR'
    }
  });
}

/**
 * Handle token refresh failure and determine next steps
 * @param {string} instanceId - The instance ID
 * @param {import('./types.js').TokenRefreshError} error - Token refresh error
 * @returns {Promise<import('./types.js').ErrorHandlingResult>} Error handling result
 */
export async function handleRefreshFailure(instanceId, error) {
  return await handleTokenRefreshFailure(instanceId, error);
}

/**
 * Create refresh failure response
 * @param {import('express').Response} res - Express response object
 * @param {import('./types.js').ErrorHandlingResult} errorResult - Error handling result
 * @returns {void} Express response
 */
export function createRefreshFailureResponse(res, errorResult) {
  if (errorResult.requiresReauth) {
    return ErrorResponses.unauthorized(res, 'Token refresh failed - re-authentication required', {
      metadata: {
        errorType: 'TOKEN_REFRESH_FAILED',
        requiresReauth: true,
        redirectUrl: errorResult.redirectUrl,
        message: errorResult.message
      }
    });
  } else {
    return ErrorResponses.internal(res, 'Token refresh system error', {
      metadata: {
        errorType: 'TOKEN_REFRESH_SYSTEM_ERROR',
        message: errorResult.message
      }
    });
  }
}

/**
 * Create re-authentication response
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @param {string | undefined} refreshToken - Whether refresh token was available
 * @returns {Promise<void>} Express response
 */
export async function createReauthenticationResponse(res, instanceId, refreshToken) {
  const hasRefreshToken = !!refreshToken;
  
  console.log(`🔐 Re-authentication required for instance: ${instanceId}`, {
    hasRefreshToken,
    reason: hasRefreshToken ? 'refresh_failed' : 'no_tokens'
  });

  return ErrorResponses.unauthorized(res, 'OAuth re-authentication required', {
    instanceId,
    metadata: {
      errorType: 'OAUTH_REAUTH_REQUIRED',
      hasRefreshToken,
      reason: hasRefreshToken ? 'Token refresh failed' : 'No valid tokens available',
      action: 'Please re-authenticate through OAuth flow'
    }
  });
}

/**
 * Log refresh fallback scenario
 * @param {import('./types.js').TokenRefreshError} error - Token refresh error
 * @returns {void}
 */
export function logRefreshFallback(error) {
  console.log(`⚠️  Token refresh failed, falling back to re-authentication: ${error.message}`);
}

/**
 * Handle network errors during authentication
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @param {Error} error - Network error
 * @returns {void} Express response
 */
export function handleNetworkError(res, instanceId, error) {
  console.error(`🌐 Network error during authentication for instance: ${instanceId}:`, error);
  return ErrorResponses.serviceUnavailable(res, 'Network error during authentication', {
    instanceId,
    metadata: {
      errorMessage: error.message,
      errorType: 'NETWORK_ERROR',
      retryable: true
    }
  });
}

/**
 * Handle OAuth provider errors
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @param {Error} error - OAuth provider error
 * @returns {void} Express response
 */
export function handleOAuthProviderError(res, instanceId, error) {
  console.error(`🔑 OAuth provider error for instance: ${instanceId}:`, error);
  return ErrorResponses.badGateway(res, 'OAuth provider error', {
    instanceId,
    metadata: {
      errorMessage: error.message,
      errorType: 'OAUTH_PROVIDER_ERROR',
      provider: 'notion'
    }
  });
}

/**
 * Handle rate limiting errors
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @param {Error} error - Rate limit error
 * @returns {void} Express response
 */
export function handleRateLimitError(res, instanceId, error) {
  console.error(`⏱️  Rate limit error for instance: ${instanceId}:`, error);
  return ErrorResponses.tooManyRequests(res, 'Rate limit exceeded', {
    instanceId,
    metadata: {
      errorMessage: error.message,
      errorType: 'RATE_LIMIT_ERROR',
      provider: 'notion'
    }
  });
}

export default {
  createSystemErrorResponse,
  createLightweightSystemErrorResponse,
  handleRefreshFailure,
  createRefreshFailureResponse,
  createReauthenticationResponse,
  logRefreshFallback,
  handleNetworkError,
  handleOAuthProviderError,
  handleRateLimitError
};