/**
 * OAuth error handling utilities for Dropbox service
 * Provides centralized error classification and handling logic
 */

/**
 * OAuth error types
 * @readonly
 * @enum {string}
 */
export const OAUTH_ERROR_TYPES = {
  INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',
  INVALID_CLIENT: 'INVALID_CLIENT',
  INVALID_REQUEST: 'INVALID_REQUEST',
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

/**
 * OAuth error analysis result
 * @typedef {Object} OAuthErrorAnalysis
 * @property {string} type - Error type from OAUTH_ERROR_TYPES
 * @property {boolean} requiresReauth - Whether user needs to re-authenticate
 * @property {string} userMessage - User-friendly error message
 * @property {boolean} shouldRetry - Whether operation should be retried
 * @property {string} logLevel - Logging level (error, warn, log)
 */

/**
 * Parse OAuth error and determine appropriate action
 * @param {Error & {code?: string, name?: string}} error - OAuth error with optional code and name properties
 * @returns {OAuthErrorAnalysis} Error analysis
 */
export function parseOAuthError(error) {
  const message = error.message.toLowerCase();
  
  // Check for invalid refresh token errors
  if (message.includes('invalid_grant') || 
      message.includes('invalid_refresh_token') ||
      message.includes('authorization grant is invalid')) {
    return {
      type: OAUTH_ERROR_TYPES.INVALID_REFRESH_TOKEN,
      requiresReauth: true,
      userMessage: 'Your authorization has expired. Please re-authenticate.',
      shouldRetry: false,
      logLevel: 'warn'
    };
  }
  
  // Check for invalid client credentials
  if (message.includes('invalid_client') || 
      message.includes('client authentication failed') ||
      message.includes('oauth client was not found')) {
    return {
      type: OAUTH_ERROR_TYPES.INVALID_CLIENT,
      requiresReauth: true,
      userMessage: 'Invalid OAuth credentials. Please contact support.',
      shouldRetry: false,
      logLevel: 'error'
    };
  }
  
  // Check for invalid request format
  if (message.includes('invalid_request') || 
      message.includes('missing a required parameter') ||
      message.includes('malformed')) {
    return {
      type: OAUTH_ERROR_TYPES.INVALID_REQUEST,
      requiresReauth: false,
      userMessage: 'OAuth request format error. Please try again.',
      shouldRetry: true,
      logLevel: 'warn'
    };
  }
  
  // Check for network errors
  if (error.code === 'ECONNRESET' || 
      error.code === 'ETIMEDOUT' || 
      error.code === 'ENOTFOUND' ||
      error.code === 'ECONNREFUSED' ||
      error.name === 'AbortError') {
    return {
      type: OAUTH_ERROR_TYPES.NETWORK_ERROR,
      requiresReauth: false,
      userMessage: 'Network error. Please try again.',
      shouldRetry: true,
      logLevel: 'warn'
    };
  }
  
  // Check for service unavailable errors
  if (message.includes('oauth service') || 
      message.includes('service unavailable') ||
      message.includes('failed to start oauth service')) {
    return {
      type: OAUTH_ERROR_TYPES.SERVICE_UNAVAILABLE,
      requiresReauth: false,
      userMessage: 'Authentication service temporarily unavailable. Please try again.',
      shouldRetry: true,
      logLevel: 'error'
    };
  }
  
  // Unknown error
  return {
    type: OAUTH_ERROR_TYPES.UNKNOWN_ERROR,
    requiresReauth: false,
    userMessage: 'Authentication error. Please try again.',
    shouldRetry: false,
    logLevel: 'error'
  };
}

/**
 * OAuth status update parameters
 * @typedef {Object} OAuthStatusUpdate
 * @property {string} status - OAuth status
 * @property {string} [accessToken] - Access token
 * @property {string} [refreshToken] - Refresh token
 * @property {Date} [tokenExpiresAt] - Token expiration date
 * @property {string} [scope] - OAuth scope
 */

/**
 * Token refresh failure response
 * @typedef {Object} TokenRefreshFailureResponse
 * @property {string} instanceId - Instance ID
 * @property {string} error - User-friendly error message
 * @property {string} errorCode - Error code from OAUTH_ERROR_TYPES
 * @property {boolean} requiresReauth - Whether user needs to re-authenticate
 * @property {boolean} shouldRetry - Whether operation should be retried
 * @property {string} logLevel - Logging level
 * @property {string} originalError - Original error message
 */

/**
 * Handle token refresh failure with appropriate response
 * @param {string} instanceId - Instance ID
 * @param {Error & {code?: string, name?: string}} error - Refresh error with optional code and name properties
 * @param {function(string, import('../../../db/queries/mcpInstances/types.js').OAuthUpdateData): Promise<import('../../../db/queries/mcpInstances/types.js').MCPInstanceRecord>} updateOAuthStatus - Database update function
 * @returns {Promise<TokenRefreshFailureResponse>} Error response details
 */
export async function handleTokenRefreshFailure(instanceId, error, updateOAuthStatus) {
  const errorAnalysis = parseOAuthError(error);
  
  console.log(`🔍 Token refresh error analysis for ${instanceId}:`, {
    type: errorAnalysis.type,
    requiresReauth: errorAnalysis.requiresReauth,
    shouldRetry: errorAnalysis.shouldRetry,
    originalError: error.message
  });
  
  // Update database based on error type
  if (errorAnalysis.requiresReauth) {
    await updateOAuthStatus(instanceId, {
      status: 'failed',
      accessToken: undefined,
      refreshToken: undefined, // Clear refresh token for security
      tokenExpiresAt: undefined,
      scope: undefined
    });
  }
  
  // Return error response details
  return {
    instanceId,
    error: errorAnalysis.userMessage,
    errorCode: errorAnalysis.type,
    requiresReauth: errorAnalysis.requiresReauth,
    shouldRetry: errorAnalysis.shouldRetry,
    logLevel: errorAnalysis.logLevel,
    originalError: error.message
  };
}

/**
 * Determine if error should trigger retry logic
 * @param {Error & {code?: string, name?: string}} error - OAuth error with optional code and name properties
 * @param {number} attempt - Current attempt number
 * @param {number} maxAttempts - Maximum attempts allowed
 * @returns {boolean} Whether to retry
 */
export function shouldRetryOAuthError(error, attempt, maxAttempts) {
  if (attempt >= maxAttempts) {
    return false;
  }
  
  const errorAnalysis = parseOAuthError(error);
  return errorAnalysis.shouldRetry;
}

/**
 * Get appropriate delay for retry attempt
 * @param {number} attempt - Current attempt number
 * @param {Error & {code?: string, name?: string}} error - OAuth error with optional code and name properties
 * @returns {number} Delay in milliseconds
 */
export function getRetryDelay(attempt, error) {
  const errorAnalysis = parseOAuthError(error);
  
  // Different delays for different error types
  const baseDelay = errorAnalysis.type === OAUTH_ERROR_TYPES.NETWORK_ERROR ? 1000 : 2000;
  
  // Exponential backoff with jitter
  const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
  const jitter = Math.random() * 1000; // Add up to 1 second jitter
  
  return Math.min(exponentialDelay + jitter, 30000); // Cap at 30 seconds
}

/**
 * Log OAuth error with appropriate level
 * @param {Error & {code?: string, name?: string}} error - OAuth error with optional code and name properties
 * @param {string} context - Error context
 * @param {string} instanceId - Instance ID
 * @returns {void}
 */
export function logOAuthError(error, context, instanceId) {
  const errorAnalysis = parseOAuthError(error);
  
  const logMessage = `OAuth error in ${context} for instance ${instanceId}: ${error.message}`;
  
  switch (errorAnalysis.logLevel) {
    case 'error':
      console.error(`❌ ${logMessage}`);
      break;
    case 'warn':
      console.warn(`⚠️  ${logMessage}`);
      break;
    default:
      console.log(`ℹ️  ${logMessage}`);
  }
}

/**
 * OAuth error response metadata
 * @typedef {Object} OAuthErrorMetadata
 * @property {string} originalError - Original error message
 * @property {string} errorType - Error type from OAUTH_ERROR_TYPES
 * @property {string} logLevel - Logging level
 */

/**
 * Standardized OAuth error response
 * @typedef {Object} OAuthErrorResponse
 * @property {boolean} success - Always false for error responses
 * @property {string} instanceId - Instance ID
 * @property {string} context - Error context
 * @property {string} error - User-friendly error message
 * @property {string} errorCode - Error code from OAUTH_ERROR_TYPES
 * @property {boolean} requiresReauth - Whether user needs to re-authenticate
 * @property {boolean} shouldRetry - Whether operation should be retried
 * @property {string} timestamp - ISO timestamp of error
 * @property {OAuthErrorMetadata} metadata - Additional error metadata
 */

/**
 * Create standardized error response for OAuth failures
 * @param {string} instanceId - Instance ID
 * @param {Error & {code?: string, name?: string}} error - OAuth error with optional code and name properties
 * @param {string} context - Error context
 * @returns {OAuthErrorResponse} Standardized error response
 */
export function createOAuthErrorResponse(instanceId, error, context) {
  const errorAnalysis = parseOAuthError(error);
  
  return {
    success: false,
    instanceId,
    context,
    error: errorAnalysis.userMessage,
    errorCode: errorAnalysis.type,
    requiresReauth: errorAnalysis.requiresReauth,
    shouldRetry: errorAnalysis.shouldRetry,
    timestamp: new Date().toISOString(),
    metadata: {
      originalError: error.message,
      errorType: errorAnalysis.type,
      logLevel: errorAnalysis.logLevel
    }
  };
}