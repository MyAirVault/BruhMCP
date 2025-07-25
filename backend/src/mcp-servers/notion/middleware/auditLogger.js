/**
 * Audit logging for Notion OAuth authentication operations
 * Tracks all authentication events for security and compliance
 */

/// <reference path="./types.js" />

import { createTokenAuditLog } from '../../../db/queries/mcpInstances/index.js';

/**
 * Log successful token refresh event
 * @param {string} instanceId - The instance ID
 * @param {string} method - Method used for refresh
 * @param {string} userId - User ID
 * @param {Object} metadata - Additional metadata
 * @param {number} [metadata.duration] - Refresh duration in ms
 * @param {number} [metadata.expiresIn] - Token expiration time in seconds
 * @returns {Promise<void>} Promise that resolves when log is created
 */
export async function logSuccessfulTokenRefresh(instanceId, method, userId, metadata = {}) {
  try {
    await createTokenAuditLog({
      instanceId,
      userId,
      operation: 'TOKEN_REFRESH_SUCCESS',
      method,
      status: 'success',
      metadata: {
        refreshMethod: method,
        duration: metadata.duration,
        expiresIn: metadata.expiresIn,
        timestamp: new Date().toISOString()
      }
    });

    console.log(`📝 Audit: Token refresh success logged for instance: ${instanceId}`);
  } catch (error) {
    console.error(`❌ Failed to log token refresh success for instance: ${instanceId}:`, error);
  }
}

/**
 * Log failed token refresh event
 * @param {string} instanceId - The instance ID
 * @param {string} method - Method used for refresh
 * @param {string} userId - User ID
 * @param {string} errorType - Type of error that occurred
 * @param {string} errorMessage - Error message
 * @param {Object} errorInfo - Additional error information
 * @returns {Promise<void>} Promise that resolves when log is created
 */
export async function logFailedTokenRefresh(instanceId, method, userId, errorType, errorMessage, errorInfo = {}) {
  try {
    await createTokenAuditLog({
      instanceId,
      userId,
      operation: 'TOKEN_REFRESH_FAILED',
      method,
      status: 'failed',
      errorType,
      errorMessage,
      metadata: {
        refreshMethod: method,
        errorType,
        errorMessage,
        duration: /** @type {Record<string, unknown>} */ (errorInfo).duration,
        timestamp: new Date().toISOString()
      }
    });

    console.log(`📝 Audit: Token refresh failure logged for instance: ${instanceId}`);
  } catch (error) {
    console.error(`❌ Failed to log token refresh failure for instance: ${instanceId}:`, error);
  }
}

/**
 * Log re-authentication required event
 * @param {string} instanceId - The instance ID
 * @param {string} userId - User ID
 * @param {boolean} hadRefreshToken - Whether a refresh token was available
 * @param {boolean} hadAccessToken - Whether an access token was available
 * @param {boolean | string} tokenExpired - Whether the token was expired
 * @returns {Promise<void>} Promise that resolves when log is created
 */
export async function logReauthenticationRequired(instanceId, userId, hadRefreshToken, hadAccessToken, tokenExpired) {
  try {
    await createTokenAuditLog({
      instanceId,
      userId,
      operation: 'REAUTH_REQUIRED',
      method: 'none',
      status: 'failed',
      metadata: {
        hadRefreshToken,
        hadAccessToken,
        tokenExpired,
        reason: hadRefreshToken ? 'refresh_failed' : 'no_valid_tokens',
        timestamp: new Date().toISOString()
      }
    });

    console.log(`📝 Audit: Re-authentication requirement logged for instance: ${instanceId}`);
  } catch (error) {
    console.error(`❌ Failed to log re-authentication requirement for instance: ${instanceId}:`, error);
  }
}

/**
 * Log token validation success
 * @param {string} instanceId - The instance ID
 * @param {string} userId - User ID
 * @param {string} source - Source of the token (cache, database)
 * @returns {Promise<void>} Promise that resolves when log is created
 */
export async function logTokenValidationSuccess(instanceId, userId, source) {
  try {
    await createTokenAuditLog({
      instanceId,
      userId,
      operation: 'TOKEN_VALIDATION_SUCCESS',
      method: source,
      status: 'success',
      metadata: {
        tokenSource: source,
        timestamp: new Date().toISOString()
      }
    });

    console.log(`📝 Audit: Token validation success logged for instance: ${instanceId}`);
  } catch (error) {
    console.error(`❌ Failed to log token validation success for instance: ${instanceId}:`, error);
  }
}

/**
 * Log OAuth flow initiation
 * @param {string} instanceId - The instance ID
 * @param {string} userId - User ID
 * @param {string[]} scopes - OAuth scopes requested
 * @returns {Promise<void>} Promise that resolves when log is created
 */
export async function logOAuthFlowInitiation(instanceId, userId, scopes) {
  try {
    await createTokenAuditLog({
      instanceId,
      userId,
      operation: 'OAUTH_FLOW_INITIATED',
      method: 'oauth_initiation',
      status: 'success',
      metadata: {
        scopes,
        timestamp: new Date().toISOString()
      }
    });

    console.log(`📝 Audit: OAuth flow initiation logged for instance: ${instanceId}`);
  } catch (error) {
    console.error(`❌ Failed to log OAuth flow initiation for instance: ${instanceId}:`, error);
  }
}

/**
 * Log OAuth callback completion
 * @param {string} instanceId - The instance ID
 * @param {string} userId - User ID
 * @param {boolean} success - Whether callback was successful
 * @param {string} [errorMessage] - Error message if callback failed
 * @returns {Promise<void>} Promise that resolves when log is created
 */
export async function logOAuthCallbackCompletion(instanceId, userId, success, errorMessage) {
  try {
    await createTokenAuditLog({
      instanceId,
      userId,
      operation: 'OAUTH_CALLBACK_COMPLETED',
      method: 'oauth_callback',
      status: success ? 'success' : 'failed',
      errorMessage: success ? undefined : errorMessage,
      metadata: {
        success,
        errorMessage,
        timestamp: new Date().toISOString()
      }
    });

    console.log(`📝 Audit: OAuth callback completion logged for instance: ${instanceId}`);
  } catch (error) {
    console.error(`❌ Failed to log OAuth callback completion for instance: ${instanceId}:`, error);
  }
}

/**
 * Create general audit log entry
 * @param {string} instanceId - The instance ID
 * @param {string} userId - User ID
 * @param {string} operation - Operation performed
 * @param {string} method - Method used
 * @param {boolean} success - Whether operation was successful
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<void>} Promise that resolves when log is created
 */
export async function createAuditLogEntry(instanceId, userId, operation, method, success, metadata = {}) {
  try {
    await createTokenAuditLog({
      instanceId,
      userId,
      operation,
      method,
      status: success ? 'success' : 'failed',
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString()
      }
    });

    console.log(`📝 Audit: ${operation} logged for instance: ${instanceId}`);
  } catch (error) {
    console.error(`❌ Failed to log ${operation} for instance: ${instanceId}:`, error);
  }
}

export default {
  logSuccessfulTokenRefresh,
  logFailedTokenRefresh,
  logReauthenticationRequired,
  logTokenValidationSuccess,
  logOAuthFlowInitiation,
  logOAuthCallbackCompletion,
  createAuditLogEntry
};