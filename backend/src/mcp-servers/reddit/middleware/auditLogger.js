/**
 * Audit logging utilities for OAuth token operations
 * Handles creation of audit log entries for authentication events
 */

/// <reference path="./types.js" />

const { createTokenAuditLog  } = require('../../../db/queries/mcpInstances/index');

/**
 * Create audit log for successful token refresh
 * @param {string} instanceId - The instance ID
 * @param {string} method - Method used for refresh (oauth_service or direct_oauth)
 * @param {string} userId - The user ID
 * @param {import('./types.js').TokenRefreshMetadata} metadata - Additional metadata
 * @returns {Promise<void>} Promise that resolves when audit log is created
 */
async function logSuccessfulTokenRefresh(instanceId, method, userId, metadata) {
  try {
    await createTokenAuditLog({
      instanceId,
      operation: 'refresh',
      status: 'success',
      method: method,
      userId: userId,
      metadata: {
        expiresIn: metadata.expiresIn,
        scope: metadata.scope,
        responseTime: metadata.responseTime
      }
    });
  } catch (err) {
    console.error('Failed to create audit log:', err);
  }
}

/**
 * Create audit log for failed token refresh
 * @param {string} instanceId - The instance ID
 * @param {string} method - Method used for refresh (oauth_service or direct_oauth)
 * @param {string} userId - The user ID
 * @param {string} errorType - Error type classification
 * @param {string} errorMessage - Error message
 * @param {import('./types.js').TokenRefreshErrorInfo} metadata - Additional metadata
 * @returns {Promise<void>} Promise that resolves when audit log is created
 */
async function logFailedTokenRefresh(instanceId, method, userId, errorType, errorMessage, metadata) {
  try {
    await createTokenAuditLog({
      instanceId,
      operation: 'refresh',
      status: 'failure',
      method: method,
      errorType: errorType,
      errorMessage: errorMessage,
      userId: userId,
      metadata: {
        responseTime: metadata.responseTime,
        originalError: metadata.originalError
      }
    });
  } catch (err) {
    console.error('Failed to create audit log:', err);
  }
}

/**
 * Create audit log for re-authentication requirement
 * @param {string} instanceId - The instance ID
 * @param {string} userId - The user ID
 * @param {boolean} hasRefreshToken - Whether refresh token was available
 * @param {boolean} hasAccessToken - Whether access token was available
 * @param {boolean|string} tokenExpired - Whether token was expired
 * @returns {Promise<void>} Promise that resolves when audit log is created
 */
async function logReauthenticationRequired(instanceId, userId, hasRefreshToken, hasAccessToken, tokenExpired) {
  try {
    await createTokenAuditLog({
      instanceId,
      operation: 'validate',
      status: 'failure',
      method: 'middleware_check',
      errorType: 'OAUTH_FLOW_REQUIRED',
      errorMessage: 'No valid access token and refresh token failed',
      userId: userId,
      metadata: {
        hasRefreshToken: hasRefreshToken,
        hasAccessToken: hasAccessToken,
        tokenExpired: tokenExpired
      }
    });
  } catch (err) {
    console.error('Failed to create audit log:', err);
  }
}

/**
 * Create comprehensive audit log entry with error handling
 * @param {import('./types.js').TokenAuditLogEntry} logEntry - The audit log entry object
 * @returns {Promise<void>} Promise that resolves when audit log is created
 */
async function createAuditLogEntry(logEntry) {
  try {
    await createTokenAuditLog(logEntry);
  } catch (err) {
    console.error('Failed to create audit log:', err);
  }
}

/**
 * Create audit log for token validation success
 * @param {string} instanceId - The instance ID
 * @param {string} userId - The user ID
 * @param {string} source - Source of the token (cache, database)
 * @returns {Promise<void>} Promise that resolves when audit log is created
 */
async function logTokenValidationSuccess(instanceId, userId, source) {
  try {
    await createTokenAuditLog({
      instanceId,
      operation: 'validate',
      status: 'success',
      method: source,
      userId: userId,
      metadata: {
        tokenSource: source
      }
    });
  } catch (err) {
    console.error('Failed to create audit log:', err);
  }
}
module.exports = {
  logSuccessfulTokenRefresh,
  logFailedTokenRefresh,
  logReauthenticationRequired,
  createAuditLogEntry,
  logTokenValidationSuccess
};