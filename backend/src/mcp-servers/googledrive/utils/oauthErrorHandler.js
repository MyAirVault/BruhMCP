/**
 * OAuth error handling utilities for Google Drive service
 * Provides centralized error classification and handling logic
 */

/**
 * @typedef {'INVALID_REFRESH_TOKEN' | 'INVALID_CLIENT' | 'INVALID_REQUEST' | 'NETWORK_ERROR' | 'SERVICE_UNAVAILABLE' | 'UNKNOWN_ERROR'} OAuthErrorType
 */

/**
 * @typedef {'error' | 'warn' | 'info'} LogLevel
 */

/**
 * @typedef {Object} OAuthErrorAnalysis
 * @property {OAuthErrorType} type
 * @property {boolean} requiresReauth
 * @property {string} userMessage
 * @property {boolean} shouldRetry
 * @property {LogLevel} logLevel
 */

/**
 * @typedef {Object} TokenRefreshFailureResponse
 * @property {string} instanceId
 * @property {string} error
 * @property {OAuthErrorType} errorCode
 * @property {boolean} requiresReauth
 * @property {boolean} shouldRetry
 * @property {LogLevel} logLevel
 * @property {string} originalError
 */

/**
 * @typedef {Object} OAuthErrorResponse
 * @property {boolean} success
 * @property {string} instanceId
 * @property {string} context
 * @property {string} error
 * @property {OAuthErrorType} errorCode
 * @property {boolean} requiresReauth
 * @property {boolean} shouldRetry
 * @property {string} timestamp
 * @property {Object} metadata
 * @property {string} metadata.originalError
 * @property {OAuthErrorType} metadata.errorType
 * @property {LogLevel} metadata.logLevel
 */

/**
 * @typedef {Object} OAuthStatusUpdate
 * @property {'failed'} status
 * @property {null} accessToken
 * @property {null} refreshToken
 * @property {null} tokenExpiresAt
 * @property {null} scope
 */

/**
 * OAuth error types
 * @type {Record<string, OAuthErrorType>}
 */
const OAUTH_ERROR_TYPES = {
  INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',
  INVALID_CLIENT: 'INVALID_CLIENT',
  INVALID_REQUEST: 'INVALID_REQUEST',
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

/**
 * Parse OAuth error and determine appropriate action
 * @param {Error} error - OAuth error
 * @returns {OAuthErrorAnalysis} Error analysis
 */
function parseOAuthError(error) {
  const message = error.message?.toLowerCase() || '';
  
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
  if ((/** @type {NodeJS.ErrnoException} */(error)).code === 'ECONNRESET' || 
      (/** @type {NodeJS.ErrnoException} */(error)).code === 'ETIMEDOUT' || 
      (/** @type {NodeJS.ErrnoException} */(error)).code === 'ENOTFOUND' ||
      (/** @type {NodeJS.ErrnoException} */(error)).code === 'ECONNREFUSED' ||
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
 * Handle token refresh failure with appropriate response
 * @param {string} instanceId - Instance ID
 * @param {Error} error - Refresh error
 * @param {(instanceId: string, update: OAuthStatusUpdate) => Promise<void>} updateOAuthStatus - Database update function
 * @returns {Promise<TokenRefreshFailureResponse>} Error response details
 */
async function handleTokenRefreshFailure(instanceId, error, updateOAuthStatus) {
  const errorAnalysis = parseOAuthError(error);
  
  console.log(`= Token refresh error analysis for ${instanceId}:`, {
    type: errorAnalysis.type,
    requiresReauth: errorAnalysis.requiresReauth,
    shouldRetry: errorAnalysis.shouldRetry,
    originalError: error.message || 'Unknown error' || 'Unknown error'
  });
  
  // Update database based on error type
  if (errorAnalysis.requiresReauth) {
    await updateOAuthStatus(instanceId, /** @type {OAuthStatusUpdate} */({
      status: 'failed',
      accessToken: null,
      refreshToken: null, // Clear refresh token for security
      tokenExpiresAt: null,
      scope: null
    }));
  }
  
  // Return error response details
  return {
    instanceId,
    error: errorAnalysis.userMessage,
    errorCode: errorAnalysis.type,
    requiresReauth: errorAnalysis.requiresReauth,
    shouldRetry: errorAnalysis.shouldRetry,
    logLevel: errorAnalysis.logLevel,
    originalError: error.message || 'Unknown error'
  };
}

/**
 * Determine if error should trigger retry logic
 * @param {Error} error - OAuth error
 * @param {number} attempt - Current attempt number
 * @param {number} maxAttempts - Maximum attempts allowed
 * @returns {boolean} Whether to retry
 */
function shouldRetryOAuthError(error, attempt, maxAttempts) {
  if (attempt >= maxAttempts) {
    return false;
  }
  
  const errorAnalysis = parseOAuthError(error);
  return errorAnalysis.shouldRetry;
}

/**
 * Get appropriate delay for retry attempt
 * @param {number} attempt - Current attempt number
 * @param {Error} error - OAuth error
 * @returns {number} Delay in milliseconds
 */
function getRetryDelay(attempt, error) {
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
 * @param {Error} error - OAuth error
 * @param {string} context - Error context
 * @param {string} instanceId - Instance ID
 */
function logOAuthError(error, context, instanceId) {
  const errorAnalysis = parseOAuthError(error);
  
  const logMessage = `OAuth error in ${context} for instance ${instanceId}: ${error.message || 'Unknown error'}`;
  
  switch (errorAnalysis.logLevel) {
    case 'error':
      console.error(`L ${logMessage}`);
      break;
    case 'warn':
      console.warn(`�  ${logMessage}`);
      break;
    default:
      console.log(`9  ${logMessage}`);
  }
}

/**
 * Create standardized error response for OAuth failures
 * @param {string} instanceId - Instance ID
 * @param {Error} error - OAuth error
 * @param {string} context - Error context
 * @returns {OAuthErrorResponse} Standardized error response
 */
function createOAuthErrorResponse(instanceId, error, context) {
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
      originalError: error.message || 'Unknown error',
      errorType: errorAnalysis.type,
      logLevel: errorAnalysis.logLevel
    }
  };
}
module.exports = {
  handleTokenRefreshFailure
};