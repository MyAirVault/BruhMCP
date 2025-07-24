/**
 * Authentication error handling utilities for Dropbox
 * Handles OAuth authentication errors and error response creation
 */

/// <reference path="./types.js" />

import { ErrorResponses } from '../../../utils/errorResponse.js';
import { handleTokenRefreshFailure, logOAuthError } from '../utils/oauthErrorHandler.js';
import { updateOAuthStatus } from '../../../db/queries/mcpInstances/index.js';

/**
 * Create system error response for authentication middleware
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @param {Error} error - The error that occurred
 * @returns {void} Express response
 */
export function createSystemErrorResponse(res, instanceId, error) {
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
export function createLightweightSystemErrorResponse(res, instanceId, error) {
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
export async function handleRefreshFailure(instanceId, refreshError) {
  // Log the OAuth error
  logOAuthError(instanceId, refreshError);
  
  // Handle different types of token refresh failures
  const errorType = refreshError.errorType || 'UNKNOWN_ERROR';
  
  switch (errorType) {
    case 'INVALID_REFRESH_TOKEN':
      // Update database to mark token as invalid
      await updateOAuthStatus(instanceId, {
        status: 'failed',
        accessToken: undefined,
        refreshToken: undefined,
        tokenExpiresAt: undefined
      });
      
      return {
        requiresReauth: true,
        errorType: 'INVALID_REFRESH_TOKEN',
        message: 'Refresh token is invalid. Please re-authenticate with Dropbox.',
        statusCode: 401
      };
      
    case 'NETWORK_ERROR':
      return {
        requiresReauth: false,
        errorType: 'NETWORK_ERROR',
        message: 'Network error occurred during token refresh. Please try again.',
        statusCode: 503
      };
      
    case 'RATE_LIMITED':
      return {
        requiresReauth: false,
        errorType: 'RATE_LIMITED',
        message: 'Rate limited by Dropbox. Please try again later.',
        statusCode: 429
      };
      
    default:
      return {
        requiresReauth: false,
        errorType: 'UNKNOWN_ERROR',
        message: 'Token refresh failed. Please try again.',
        statusCode: 500
      };
  }
}

/**
 * Create appropriate error response based on authentication error
 * @param {import('express').Response} res - Express response object
 * @param {string} instanceId - The instance ID
 * @param {import('./types.js').AuthErrorResult} errorResult - Error handling result
 * @returns {void} Express response
 */
export function createAuthErrorResponse(res, instanceId, errorResult) {
  const { requiresReauth, errorType, message, statusCode } = errorResult;
  
  if (requiresReauth) {
    return ErrorResponses.unauthorized(res, message, {
      instanceId,
      requiresReauth: true,
      errorType,
      metadata: {
        action: 'Please re-authenticate with Dropbox to continue using this instance'
      }
    });
  }
  
  switch (statusCode) {
    case 429:
      return ErrorResponses.tooManyRequests(res, message, {
        instanceId,
        errorType,
        metadata: { retryAfter: '60 seconds' }
      });
      
    case 503:
      return ErrorResponses.serviceUnavailable(res, message, {
        instanceId,
        errorType,
        metadata: { service: 'Dropbox OAuth' }
      });
      
    default:
      return ErrorResponses.internal(res, message, {
        instanceId,
        errorType,
        metadata: { originalError: errorType }
      });
  }
}