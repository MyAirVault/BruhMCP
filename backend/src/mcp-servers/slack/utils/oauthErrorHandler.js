/**
 * OAuth error handling utilities for Slack MCP service
 * Provides centralized error handling for OAuth operations
 */

/**
 * Map of Slack OAuth error codes to error types
 */
const SLACK_ERROR_MAP = {
  'invalid_grant': 'INVALID_GRANT',
  'invalid_client': 'INVALID_CLIENT', 
  'invalid_request': 'INVALID_REQUEST',
  'invalid_scope': 'INVALID_SCOPE',
  'unauthorized_client': 'UNAUTHORIZED_CLIENT',
  'unsupported_grant_type': 'UNSUPPORTED_GRANT_TYPE',
  'access_denied': 'ACCESS_DENIED',
  'server_error': 'SERVER_ERROR',
  'temporarily_unavailable': 'TEMPORARILY_UNAVAILABLE',
  'account_inactive': 'ACCOUNT_INACTIVE',
  'invalid_auth': 'INVALID_AUTH',
  'not_authed': 'NOT_AUTHED',
  'token_revoked': 'TOKEN_REVOKED',
  'no_permission': 'NO_PERMISSION',
  'org_login_required': 'ORG_LOGIN_REQUIRED',
  'user_is_bot': 'USER_IS_BOT',
  'user_is_restricted': 'USER_IS_RESTRICTED',
  'team_access_not_granted': 'TEAM_ACCESS_NOT_GRANTED'
};

/**
 * Determine if an error requires user re-authentication
 * @param {Error} error - The error to check
 * @returns {boolean} True if re-authentication is required
 */
export function requiresReauthentication(error) {
  const errorMessage = error.message?.toLowerCase() || '';
  const errorCode = error.code?.toLowerCase() || '';
  
  // Check for specific Slack error codes that require re-auth
  const reAuthCodes = [
    'invalid_grant', 'invalid_auth', 'not_authed', 'token_revoked',
    'account_inactive', 'user_is_restricted', 'team_access_not_granted'
  ];
  
  if (reAuthCodes.includes(errorCode)) {
    return true;
  }
  
  // Check for error messages that indicate re-auth needed
  const reAuthMessages = [
    'invalid refresh token',
    'refresh token expired',
    'token revoked',
    'user may need to re-authorize',
    'authentication required',
    'invalid_grant'
  ];
  
  return reAuthMessages.some(msg => errorMessage.includes(msg));
}

/**
 * Determine if an error is temporary/retryable
 * @param {Error} error - The error to check
 * @returns {boolean} True if error is temporary
 */
export function isTemporaryError(error) {
  const errorMessage = error.message?.toLowerCase() || '';
  const errorCode = error.code?.toLowerCase() || '';
  const status = error.status || 0;
  
  // HTTP status codes that indicate temporary errors
  const temporaryStatusCodes = [429, 502, 503, 504];
  if (temporaryStatusCodes.includes(status)) {
    return true;
  }
  
  // Slack-specific temporary error codes
  const temporaryErrorCodes = [
    'server_error', 'temporarily_unavailable', 'rate_limited'
  ];
  
  if (temporaryErrorCodes.includes(errorCode)) {
    return true;
  }
  
  // Check for temporary error messages
  const temporaryMessages = [
    'rate limit',
    'temporarily unavailable',
    'server error',
    'service unavailable',
    'timeout',
    'network error',
    'connection error'
  ];
  
  return temporaryMessages.some(msg => errorMessage.includes(msg));
}

/**
 * Extract structured error information from error object
 * @param {Error} error - The error to parse
 * @returns {Object} Structured error information
 */
export function parseSlackError(error) {
  const errorMessage = error.message || 'Unknown error';
  const errorCode = error.code || 'UNKNOWN_ERROR';
  const status = error.status || 0;
  
  // Map Slack error codes to standardized error types
  const errorType = SLACK_ERROR_MAP[errorCode?.toLowerCase()] || 'UNKNOWN_ERROR';
  
  return {
    errorType,
    errorCode,
    errorMessage,
    status,
    requiresReauth: requiresReauthentication(error),
    isTemporary: isTemporaryError(error),
    originalError: error
  };
}

/**
 * Handle token refresh failures with appropriate error responses
 * @param {string} instanceId - Instance ID for logging
 * @param {Error} error - The refresh error
 * @param {Function} updateOAuthStatus - Function to update OAuth status
 * @returns {Object} Error response object
 */
export async function handleTokenRefreshFailure(instanceId, error, updateOAuthStatus) {
  const parsedError = parseSlackError(error);
  
  console.error(`L Slack token refresh failed for instance ${instanceId}:`, {
    errorType: parsedError.errorType,
    errorCode: parsedError.errorCode,
    errorMessage: parsedError.errorMessage,
    requiresReauth: parsedError.requiresReauth,
    isTemporary: parsedError.isTemporary
  });
  
  // Handle re-authentication required errors
  if (parsedError.requiresReauth) {
    try {
      await updateOAuthStatus(instanceId, {
        status: 'failed',
        accessToken: null,
        refreshToken: null,
        tokenExpiresAt: null,
        scope: null,
        error: parsedError.errorMessage
      });
      
      console.log(`= Marked Slack instance ${instanceId} as requiring re-authentication`);
    } catch (updateError) {
      console.error(`L Failed to update OAuth status for instance ${instanceId}:`, updateError);
    }
    
    return {
      error: 'OAuth authentication required - please re-authenticate',
      errorCode: 'OAUTH_REAUTH_REQUIRED',
      errorType: parsedError.errorType,
      requiresReauth: true,
      instanceId
    };
  }
  
  // Handle temporary errors
  if (parsedError.isTemporary) {
    console.log(`ó Temporary error for Slack instance ${instanceId}, will retry automatically`);
    
    return {
      error: 'Temporary authentication error - please try again',
      errorCode: 'TEMPORARY_AUTH_ERROR',
      errorType: parsedError.errorType,
      requiresReauth: false,
      instanceId
    };
  }
  
  // Handle permanent errors
  try {
    await updateOAuthStatus(instanceId, {
      status: 'failed',
      error: parsedError.errorMessage
    });
    
    console.log(`L Marked Slack instance ${instanceId} as failed due to permanent error`);
  } catch (updateError) {
    console.error(`L Failed to update OAuth status for instance ${instanceId}:`, updateError);
  }
  
  return {
    error: `Authentication failed: ${parsedError.errorMessage}`,
    errorCode: 'PERMANENT_AUTH_ERROR',
    errorType: parsedError.errorType,
    requiresReauth: true,
    instanceId
  };
}

/**
 * Log OAuth errors with structured information
 * @param {Error} error - The error to log
 * @param {string} operation - The operation that failed
 * @param {string} instanceId - Instance ID for context
 */
export function logOAuthError(error, operation, instanceId) {
  const parsedError = parseSlackError(error);
  
  console.error(`L Slack OAuth ${operation} failed for instance ${instanceId}:`, {
    operation,
    instanceId,
    errorType: parsedError.errorType,
    errorCode: parsedError.errorCode,
    errorMessage: parsedError.errorMessage,
    status: parsedError.status,
    requiresReauth: parsedError.requiresReauth,
    isTemporary: parsedError.isTemporary,
    stack: error.stack
  });
}

/**
 * Create user-friendly error messages for different error types
 * @param {Object} parsedError - Parsed error information
 * @returns {string} User-friendly error message
 */
export function createUserFriendlyMessage(parsedError) {
  const { errorType, errorCode, errorMessage } = parsedError;
  
  switch (errorType) {
    case 'INVALID_GRANT':
      return 'Your Slack authorization has expired. Please re-authenticate to continue.';
    
    case 'INVALID_CLIENT':
      return 'There\'s an issue with the Slack app configuration. Please contact support.';
    
    case 'TOKEN_REVOKED':
      return 'Your Slack access has been revoked. Please re-authenticate to continue.';
    
    case 'ACCOUNT_INACTIVE':
      return 'Your Slack account appears to be inactive. Please check your account status.';
    
    case 'USER_IS_RESTRICTED':
      return 'Your Slack account has restrictions that prevent access. Please contact your workspace admin.';
    
    case 'TEAM_ACCESS_NOT_GRANTED':
      return 'Access to this Slack workspace has not been granted. Please contact your workspace admin.';
    
    case 'NO_PERMISSION':
      return 'You don\'t have permission to perform this action in Slack. Please contact your workspace admin.';
    
    case 'ORG_LOGIN_REQUIRED':
      return 'Your Slack workspace requires organization login. Please authenticate through your organization.';
    
    case 'SERVER_ERROR':
      return 'Slack is experiencing technical difficulties. Please try again later.';
    
    case 'TEMPORARILY_UNAVAILABLE':
      return 'Slack services are temporarily unavailable. Please try again in a few moments.';
    
    case 'RATE_LIMITED':
      return 'You\'ve made too many requests. Please wait a moment before trying again.';
    
    default:
      return `Authentication error: ${errorMessage}`;
  }
}

/**
 * Determine retry delay based on error type
 * @param {Object} parsedError - Parsed error information
 * @param {number} attemptNumber - Current attempt number
 * @returns {number} Retry delay in milliseconds
 */
export function getRetryDelay(parsedError, attemptNumber) {
  const { errorType, status } = parsedError;
  
  // No retry for permanent errors
  if (parsedError.requiresReauth && !parsedError.isTemporary) {
    return 0;
  }
  
  // Exponential backoff for temporary errors
  let baseDelay = 1000; // 1 second
  
  // Longer delays for rate limiting
  if (status === 429 || errorType === 'RATE_LIMITED') {
    baseDelay = 5000; // 5 seconds
  }
  
  // Longer delays for server errors
  if (status >= 500 || errorType === 'SERVER_ERROR') {
    baseDelay = 3000; // 3 seconds
  }
  
  // Exponential backoff with jitter
  const exponentialDelay = baseDelay * Math.pow(2, attemptNumber - 1);
  const jitter = Math.random() * 1000; // Add up to 1 second of jitter
  
  return Math.min(exponentialDelay + jitter, 60000); // Cap at 60 seconds
}

/**
 * Check if an error should be retried
 * @param {Object} parsedError - Parsed error information
 * @param {number} attemptNumber - Current attempt number
 * @param {number} maxAttempts - Maximum retry attempts
 * @returns {boolean} True if should retry
 */
export function shouldRetry(parsedError, attemptNumber, maxAttempts = 3) {
  // Don't retry if we've exceeded max attempts
  if (attemptNumber >= maxAttempts) {
    return false;
  }
  
  // Don't retry permanent errors
  if (parsedError.requiresReauth && !parsedError.isTemporary) {
    return false;
  }
  
  // Retry temporary errors
  return parsedError.isTemporary;
}

/**
 * Create an OAuth error response object
 * @param {string} instanceId - Instance ID
 * @param {Object} parsedError - Parsed error information
 * @returns {Object} OAuth error response
 */
export function createOAuthErrorResponse(instanceId, parsedError) {
  return {
    success: false,
    error: createUserFriendlyMessage(parsedError),
    errorCode: parsedError.errorCode,
    errorType: parsedError.errorType,
    requiresReauth: parsedError.requiresReauth,
    isTemporary: parsedError.isTemporary,
    instanceId,
    timestamp: new Date().toISOString()
  };
}