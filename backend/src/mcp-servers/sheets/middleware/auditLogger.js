/**
 * @fileoverview Audit logging utilities for Google Sheets middleware
 * Handles security and operational logging for OAuth operations
 */

/// <reference path="./types.js" />

/**
 * Log successful token refresh
 * @param {string} instanceId - Instance ID
 * @param {string} method - Refresh method used
 * @param {number} duration - Operation duration in ms
 * @param {Object} metadata - Additional metadata
 */
export function logSuccessfulTokenRefresh(instanceId, method, duration, metadata = {}) {
	console.log(`✅ Token refresh successful for instance ${instanceId}`, {
		method,
		duration,
		...metadata
	});
}

/**
 * Log failed token refresh
 * @param {string} instanceId - Instance ID
 * @param {string} method - Refresh method attempted
 * @param {Error} error - Error object
 * @param {number} duration - Operation duration in ms
 */
export function logFailedTokenRefresh(instanceId, method, error, duration) {
	console.error(`❌ Token refresh failed for instance ${instanceId}`, {
		method,
		duration,
		error: error.message,
		errorType: (error instanceof Error && 'errorType' in error) ? error.errorType : 'UNKNOWN_ERROR'
	});
}

/**
 * Log re-authentication required
 * @param {string} instanceId - Instance ID
 * @param {Object} details - Additional details
 */
export function logReauthenticationRequired(instanceId, details = {}) {
	console.log(`🔐 Re-authentication required for instance ${instanceId}`, details);
}