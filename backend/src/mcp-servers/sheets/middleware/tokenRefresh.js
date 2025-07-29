/**
 * @fileoverview Token refresh utilities for Google Sheets middleware
 * Handles OAuth token refresh operations
 */

/// <reference path="./types.js" />

const { setCachedCredential  } = require('../services/credentialCache');
const { updateInstanceUsage  } = require('../services/database');
const { updateOAuthStatus  } = require('../../../db/queries/mcpInstances/oauth');
const { recordTokenRefreshMetrics  } = require('../utils/tokenMetrics');
const SheetsOAuthHandler = require('../oauth/oauthHandler');

/**
 * Attempt to refresh OAuth token
 * @param {string} refreshToken - Refresh token
 * @param {import('./types.js').DatabaseInstance} instance - Database instance
 * @returns {Promise<import('./types.js').OAuthTokens>} New tokens
 */
async function attemptTokenRefresh(refreshToken, instance) {
	const oauthHandler = new SheetsOAuthHandler();
	
	try {
		// Try to refresh token using OAuth handler
		const newTokens = await oauthHandler.refreshToken(refreshToken, {
			client_id: instance.client_id,
			client_secret: instance.client_secret
		});
		
		return newTokens;
	} catch (error) {
		console.error('Token refresh failed:', error);
		throw error;
	}
}

/**
 * Process successful token refresh
 * @param {string} instanceId - Instance ID
 * @param {import('./types.js').OAuthTokens} newTokens - New tokens
 * @param {string} refreshToken - Original refresh token
 * @param {string} userId - User ID
 * @param {string} method - Refresh method used
 * @param {number} startTime - Operation start time
 */
async function processSuccessfulRefresh(instanceId, newTokens, refreshToken, userId, method, startTime) {
	const newExpiresAt = new Date(Date.now() + (newTokens.expires_in * 1000));
	const endTime = Date.now();

	// Record successful metrics
	recordTokenRefreshMetrics(
		instanceId, 
		method, 
		true, // success
		null, // errorType
		null, // errorMessage
		startTime, 
		endTime
	);

	// Update cache with new Bearer token
	setCachedCredential(instanceId, {
		bearerToken: newTokens.access_token,
		refreshToken: newTokens.refresh_token || refreshToken,
		expiresAt: newExpiresAt.getTime(),
		user_id: userId
	});

	// Update database with new tokens
	await updateOAuthStatus(instanceId, {
		status: 'completed',
		accessToken: newTokens.access_token,
		refreshToken: newTokens.refresh_token || refreshToken,
		tokenExpiresAt: newExpiresAt,
		scope: newTokens.scope
	});

	return {
		bearerToken: newTokens.access_token,
		expiresAt: newExpiresAt
	};
}

/**
 * Process failed token refresh
 * @param {string} instanceId - Instance ID
 * @param {Error} error - Refresh error
 * @param {string} method - Refresh method used
 * @param {number} startTime - Operation start time
 */
async function processFailedRefresh(instanceId, error, method, startTime) {
	const endTime = Date.now();
	
	// Record failed metrics
	recordTokenRefreshMetrics(
		instanceId, 
		method, 
		false, // failure
		(error instanceof Error && 'errorType' in error) ? String(error.errorType) : 'UNKNOWN_ERROR',
		error.message || 'Token refresh failed',
		startTime, 
		endTime
	);

	// Update OAuth status to failed
	await updateOAuthStatus(instanceId, {
		status: 'failed',
		accessToken: undefined,
		refreshToken: undefined,
		tokenExpiresAt: undefined,
		scope: undefined
	});
}

/**
 * Perform complete token refresh operation
 * @param {string} instanceId - Instance ID
 * @param {string} refreshToken - Refresh token
 * @param {import('./types.js').DatabaseInstance} instance - Database instance
 * @param {import('./types.js').ExpressRequest} req - Express request
 * @returns {Promise<import('./types.js').RefreshResult>} Refresh result
 */
async function performTokenRefresh(instanceId, refreshToken, instance, req) {
	console.log(`🔄 Refreshing expired Bearer token for instance: ${instanceId}`);
	
	const startTime = Date.now();
	const method = 'oauth_handler';
	
	try {
		const newTokens = await attemptTokenRefresh(refreshToken, instance);
		
		const { bearerToken } = await processSuccessfulRefresh(
			instanceId, 
			newTokens, 
			refreshToken, 
			instance.user_id, 
			method, 
			startTime
		);

		// Setup request with new token
		/** @type {import('express').Request & {bearerToken?: string, instanceId?: string, userId?: string, oauth?: Object}} */ (req).bearerToken = bearerToken;
		/** @type {import('express').Request & {bearerToken?: string, instanceId?: string, userId?: string, oauth?: Object}} */ (req).instanceId = instanceId;
		/** @type {import('express').Request & {bearerToken?: string, instanceId?: string, userId?: string, oauth?: Object}} */ (req).userId = instance.user_id;
		/** @type {import('express').Request & {bearerToken?: string, instanceId?: string, userId?: string, oauth?: Object}} */ (req).oauth = {
			bearerToken: bearerToken,
			instanceId: instanceId,
			userId: instance.user_id
		};

		// Update usage tracking
		await updateInstanceUsage(instanceId);

		return { success: true, method };
		
	} catch (error) {
		const refreshError = error instanceof Error ? error : new Error(String(error));
		await processFailedRefresh(instanceId, refreshError, method, startTime);
		return { success: false, error: refreshError };
	}
}
module.exports = {
  performTokenRefresh
};