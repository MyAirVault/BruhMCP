/**
 * OAuth error handling utilities for Reddit service
 * Provides centralized error classification and handling logic
 */

/**
 * OAuth error types
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
 * Parse OAuth error and determine appropriate action
 * @param {Error} error - OAuth error
 * @returns {Object} Error analysis
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
      userMessage: 'Your Reddit authorization has expired. Please re-authenticate.',
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
      userMessage: 'Invalid Reddit OAuth credentials. Please contact support.',
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
      userMessage: 'Reddit OAuth request format error. Please try again.',
      shouldRetry: true,
      logLevel: 'warn'
    };
  }
  
  // Check for network errors
  if (/** @type {Error & {code?: string}} */ (error).code === 'ECONNRESET' || 
      /** @type {Error & {code?: string}} */ (error).code === 'ETIMEDOUT' || 
      /** @type {Error & {code?: string}} */ (error).code === 'ENOTFOUND' ||
      /** @type {Error & {code?: string}} */ (error).code === 'ECONNREFUSED' ||
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
      userMessage: 'Reddit authentication service temporarily unavailable. Please try again.',
      shouldRetry: true,
      logLevel: 'error'
    };
  }
  
  // Unknown error
  return {
    type: OAUTH_ERROR_TYPES.UNKNOWN_ERROR,
    requiresReauth: false,
    userMessage: 'Reddit authentication error. Please try again.',
    shouldRetry: false,
    logLevel: 'error'
  };
}

/**
 * Handle token refresh failure with appropriate response
 * @param {string} instanceId - Instance ID
 * @param {Error} error - Refresh error
 * @param {Function} updateOAuthStatus - Database update function
 * @returns {Promise<{instanceId: string, error: string, errorCode: string, requiresReauth: boolean, shouldRetry: boolean, logLevel: string, originalError: string}>} Error response details
 */
export async function handleTokenRefreshFailure(instanceId, error, updateOAuthStatus) {
  const errorAnalysis = parseOAuthError(error);
  
  console.log(`🔍 Reddit token refresh error analysis for ${instanceId}:`, {
    type: /** @type {{type: string, requiresReauth: boolean, shouldRetry: boolean, userMessage: string, logLevel: string}} */ (errorAnalysis).type,
    requiresReauth: /** @type {{type: string, requiresReauth: boolean, shouldRetry: boolean, userMessage: string, logLevel: string}} */ (errorAnalysis).requiresReauth,
    shouldRetry: /** @type {{type: string, requiresReauth: boolean, shouldRetry: boolean, userMessage: string, logLevel: string}} */ (errorAnalysis).shouldRetry,
    originalError: error.message
  });
  
  // Update database based on error type
  if (/** @type {{type: string, requiresReauth: boolean, shouldRetry: boolean, userMessage: string, logLevel: string}} */ (errorAnalysis).requiresReauth) {
    await updateOAuthStatus(instanceId, {
      status: 'failed',
      accessToken: null,
      refreshToken: null, // Clear refresh token for security
      tokenExpiresAt: null,
      scope: null
    });
  }
  
  // Return error response details
  return {
    instanceId,
    error: /** @type {{type: string, requiresReauth: boolean, shouldRetry: boolean, userMessage: string, logLevel: string}} */ (errorAnalysis).userMessage,
    errorCode: /** @type {{type: string, requiresReauth: boolean, shouldRetry: boolean, userMessage: string, logLevel: string}} */ (errorAnalysis).type,
    requiresReauth: /** @type {{type: string, requiresReauth: boolean, shouldRetry: boolean, userMessage: string, logLevel: string}} */ (errorAnalysis).requiresReauth,
    shouldRetry: /** @type {{type: string, requiresReauth: boolean, shouldRetry: boolean, userMessage: string, logLevel: string}} */ (errorAnalysis).shouldRetry,
    logLevel: /** @type {{type: string, requiresReauth: boolean, shouldRetry: boolean, userMessage: string, logLevel: string}} */ (errorAnalysis).logLevel,
    originalError: error.message
  };
}

/**
 * Determine if error should trigger retry logic
 * @param {Error} error - OAuth error
 * @param {number} attempt - Current attempt number
 * @param {number} maxAttempts - Maximum attempts allowed
 * @returns {boolean} Whether to retry
 */
export function shouldRetryOAuthError(error, attempt, maxAttempts) {
  if (attempt >= maxAttempts) {
    return false;
  }
  
  const errorAnalysis = parseOAuthError(error);
  return /** @type {{type: string, requiresReauth: boolean, shouldRetry: boolean, userMessage: string, logLevel: string}} */ (errorAnalysis).shouldRetry;
}

/**
 * Get appropriate delay for retry attempt
 * @param {number} attempt - Current attempt number
 * @param {Error} error - OAuth error
 * @returns {number} Delay in milliseconds
 */
export function getRetryDelay(attempt, error) {
  const errorAnalysis = parseOAuthError(error);
  
  // Different delays for different error types
  const baseDelay = /** @type {{type: string, requiresReauth: boolean, shouldRetry: boolean, userMessage: string, logLevel: string}} */ (errorAnalysis).type === OAUTH_ERROR_TYPES.NETWORK_ERROR ? 1000 : 2000;
  
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
export function logOAuthError(error, context, instanceId) {
  const errorAnalysis = parseOAuthError(error);
  
  const logMessage = `Reddit OAuth error in ${context} for instance ${instanceId}: ${error.message}`;
  
  switch (/** @type {{type: string, requiresReauth: boolean, shouldRetry: boolean, userMessage: string, logLevel: string}} */ (errorAnalysis).logLevel) {
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
 * Create standardized error response for OAuth failures
 * @param {string} instanceId - Instance ID
 * @param {Error} error - OAuth error
 * @param {string} context - Error context
 * @returns {Object} Standardized error response
 */
export function createOAuthErrorResponse(instanceId, error, context) {
  const errorAnalysis = parseOAuthError(error);
  
  return {
    success: false,
    instanceId,
    context,
    error: /** @type {{type: string, requiresReauth: boolean, shouldRetry: boolean, userMessage: string, logLevel: string}} */ (errorAnalysis).userMessage,
    errorCode: /** @type {{type: string, requiresReauth: boolean, shouldRetry: boolean, userMessage: string, logLevel: string}} */ (errorAnalysis).type,
    requiresReauth: /** @type {{type: string, requiresReauth: boolean, shouldRetry: boolean, userMessage: string, logLevel: string}} */ (errorAnalysis).requiresReauth,
    shouldRetry: /** @type {{type: string, requiresReauth: boolean, shouldRetry: boolean, userMessage: string, logLevel: string}} */ (errorAnalysis).shouldRetry,
    timestamp: new Date().toISOString(),
    metadata: {
      originalError: error.message,
      errorType: /** @type {{type: string, requiresReauth: boolean, shouldRetry: boolean, userMessage: string, logLevel: string}} */ (errorAnalysis).type,
      logLevel: /** @type {{type: string, requiresReauth: boolean, shouldRetry: boolean, userMessage: string, logLevel: string}} */ (errorAnalysis).logLevel
    }
  };
}