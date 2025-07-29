/**
 * Audit logging utilities for Dropbox OAuth operations
 * Handles security event tracking and compliance logging
 */

/**
 * @typedef {Object} AuditLogData
 * @property {string} instanceId - Instance ID
 * @property {string} userId - User ID
 * @property {string} service - Service name
 * @property {string} timestamp - Timestamp
 * @property {string} event - Event type
 * @property {boolean} success - Success indicator
 * @property {string} [method] - Method used
 * @property {string} [error] - Error message
 */

/**
 * Log OAuth flow initiation
 * @param {string} instanceId - The instance ID
 * @param {string} userId - User ID
 * @param {string} clientId - OAuth client ID
 * @returns {void}
 */
function logOAuthInitiation(instanceId, userId, clientId) {
  console.log(`🔐 [AUDIT] OAuth flow initiated`, {
    instanceId,
    userId,
    clientId: clientId.slice(0, 8) + '...', // Partially mask client ID
    service: 'dropbox',
    timestamp: new Date().toISOString(),
    event: 'oauth_initiation'
  });
}

/**
 * Log OAuth callback processing
 * @param {string} instanceId - The instance ID
 * @param {string} userId - User ID
 * @param {boolean} success - Whether callback was successful
 * @param {string} [error] - Error message if failed
 * @returns {void}
 */
function logOAuthCallback(instanceId, userId, success, error) {
  /** @type {AuditLogData} */
  const logData = {
    instanceId,
    userId,
    service: 'dropbox',
    timestamp: new Date().toISOString(),
    event: 'oauth_callback',
    success
  };

  if (!success && error) {
    logData.error = error;
  }

  console.log(`🔄 [AUDIT] OAuth callback processed`, logData);
}

/**
 * Log token refresh attempt
 * @param {string} instanceId - The instance ID
 * @param {string} userId - User ID
 * @param {boolean} success - Whether refresh was successful
 * @param {string} method - Refresh method used
 * @param {string} [error] - Error message if failed
 * @returns {void}
 */
function logTokenRefresh(instanceId, userId, success, method, error) {
  /** @type {AuditLogData} */
  const logData = {
    instanceId,
    userId,
    service: 'dropbox',
    timestamp: new Date().toISOString(),
    event: 'token_refresh',
    success,
    method
  };

  if (!success && error) {
    logData.error = error;
  }

  console.log(`🔄 [AUDIT] Token refresh attempt`, logData);
}

/**
 * Log token validation attempt
 * @param {string} instanceId - The instance ID
 * @param {string} userId - User ID
 * @param {boolean} success - Whether validation was successful
 * @param {string} [error] - Error message if failed
 * @returns {void}
 */
function logTokenValidation(instanceId, userId, success, error) {
  /** @type {AuditLogData} */
  const logData = {
    instanceId,
    userId,
    service: 'dropbox',
    timestamp: new Date().toISOString(),
    event: 'token_validation',
    success
  };

  if (!success && error) {
    logData.error = error;
  }

  console.log(`🔍 [AUDIT] Token validation`, logData);
}

/**
 * Log instance revocation
 * @param {string} instanceId - The instance ID
 * @param {string} userId - User ID
 * @param {boolean} success - Whether revocation was successful
 * @param {string} [error] - Error message if failed
 * @returns {void}
 */
function logInstanceRevocation(instanceId, userId, success, error) {
  /** @type {AuditLogData} */
  const logData = {
    instanceId,
    userId,
    service: 'dropbox',
    timestamp: new Date().toISOString(),
    event: 'instance_revocation',
    success
  };

  if (!success && error) {
    logData.error = error;
  }

  console.log(`🗑️ [AUDIT] Instance revocation`, logData);
}

/**
 * Log security event (failed authentication, suspicious activity, etc.)
 * @param {string} event - Event type
 * @param {string} instanceId - The instance ID
 * @param {string} userId - User ID
 * @param {string} description - Event description
 * @param {Object} [metadata] - Additional metadata
 * @returns {void}
 */
function logSecurityEvent(event, instanceId, userId, description, metadata) {
  const logData = {
    instanceId,
    userId,
    service: 'dropbox',
    timestamp: new Date().toISOString(),
    event: `security_${event}`,
    description,
    ...metadata
  };

  console.warn(`🚨 [SECURITY] ${description}`, logData);
}

/**
 * Log API request with authentication
 * @param {string} instanceId - The instance ID
 * @param {string} userId - User ID
 * @param {string} endpoint - API endpoint accessed
 * @param {string} method - HTTP method
 * @param {number} statusCode - Response status code
 * @returns {void}
 */
function logAPIRequest(instanceId, userId, endpoint, method, statusCode) {
  console.log(`📡 [AUDIT] API request`, {
    instanceId,
    userId,
    service: 'dropbox',
    timestamp: new Date().toISOString(),
    event: 'api_request',
    endpoint,
    method,
    statusCode
  });
}

module.exports = {
  logOAuthInitiation,
  logOAuthCallback,
  logTokenRefresh,
  logTokenValidation,
  logInstanceRevocation,
  logSecurityEvent,
  logAPIRequest
};