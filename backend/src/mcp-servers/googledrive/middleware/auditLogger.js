/**
 * @fileoverview Audit logging utilities for Google Drive OAuth operations
 */

/// <reference path="./types.js" />

const { createTokenAuditLog  } = require('../../../db/queries/mcpInstances/audit');

/**
 * Logs successful token refresh
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
async function logSuccessfulTokenRefresh(instanceId, userId) {
  try {
    await createTokenAuditLog({
      instanceId,
      userId,
      operation: 'token_refresh',
      status: 'success',
      method: 'oauth_service',
      metadata: {
        service: 'googledrive',
        timestamp: new Date().toISOString()
      }
    });
    console.log(`📝 Audit log: Successful token refresh for instance ${instanceId}`);
  } catch (error) {
    console.error(`❌ Failed to create audit log for successful refresh:`, error);
  }
}

/**
 * Logs failed token refresh
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID
 * @param {string} error - Error message
 * @returns {Promise<void>}
 */
async function logFailedTokenRefresh(instanceId, userId, error) {
  try {
    await createTokenAuditLog({
      instanceId,
      userId,
      operation: 'token_refresh',
      status: 'failed',
      errorMessage: error,
      metadata: {
        service: 'googledrive',
        timestamp: new Date().toISOString()
      }
    });
    console.log(`📝 Audit log: Failed token refresh for instance ${instanceId}`);
  } catch (err) {
    console.error(`❌ Failed to create audit log for failed refresh:`, err);
  }
}

/**
 * Logs re-authentication required event
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
async function logReauthenticationRequired(instanceId, userId) {
  try {
    await createTokenAuditLog({
      instanceId,
      userId,
      operation: 'reauth_required',
      status: 'warning',
      metadata: {
        service: 'googledrive',
        timestamp: new Date().toISOString()
      }
    });
    console.log(`📝 Audit log: Re-authentication required for instance ${instanceId}`);
  } catch (error) {
    console.error(`❌ Failed to create audit log for reauth required:`, error);
  }
}

/**
 * Logs OAuth initiation
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
async function logOAuthInitiation(instanceId, userId) {
  try {
    await createTokenAuditLog({
      instanceId,
      userId,
      operation: 'oauth_initiation',
      status: 'info',
      metadata: {
        service: 'googledrive',
        timestamp: new Date().toISOString()
      }
    });
    console.log(`📝 Audit log: OAuth initiation for instance ${instanceId}`);
  } catch (error) {
    console.error(`❌ Failed to create audit log for OAuth initiation:`, error);
  }
}

/**
 * Logs OAuth callback
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID
 * @param {boolean} success - Whether callback was successful
 * @returns {Promise<void>}
 */
async function logOAuthCallback(instanceId, userId, success) {
  try {
    await createTokenAuditLog({
      instanceId,
      userId,
      operation: 'oauth_callback',
      status: success ? 'success' : 'failed',
      metadata: {
        service: 'googledrive',
        timestamp: new Date().toISOString()
      }
    });
    console.log(`📝 Audit log: OAuth callback ${success ? 'successful' : 'failed'} for instance ${instanceId}`);
  } catch (error) {
    console.error(`❌ Failed to create audit log for OAuth callback:`, error);
  }
}

/**
 * Logs instance revocation
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
async function logInstanceRevocation(instanceId, userId) {
  try {
    await createTokenAuditLog({
      instanceId,
      userId,
      operation: 'instance_revoked',
      status: 'info',
      metadata: {
        service: 'googledrive',
        timestamp: new Date().toISOString()
      }
    });
    console.log(`📝 Audit log: Instance revoked for ${instanceId}`);
  } catch (error) {
    console.error(`❌ Failed to create audit log for instance revocation:`, error);
  }
}

/**
 * Records usage tracking failure for monitoring
 * @param {string} instanceId - Instance ID
 * @param {string} errorMessage - Error message
 * @returns {void}
 */
function recordUsageTrackingFailure(instanceId, errorMessage) {
  console.error(`📊 Usage tracking failure for ${instanceId}: ${errorMessage}`);
  // In production, this would send metrics to a monitoring system
}

/**
 * Records audit log failure for monitoring
 * @param {string} instanceId - Instance ID
 * @param {string} operation - Operation type
 * @param {string} errorMessage - Error message
 * @returns {void}
 */
function recordAuditLogFailure(instanceId, operation, errorMessage) {
  console.error(`📋 Audit log failure for ${instanceId} (${operation}): ${errorMessage}`);
  // In production, this would send metrics to a monitoring system
}
module.exports = {
  logSuccessfulTokenRefresh,
  logFailedTokenRefresh,
  logReauthenticationRequired,
  logOAuthInitiation,
  logOAuthCallback,
  logInstanceRevocation
};