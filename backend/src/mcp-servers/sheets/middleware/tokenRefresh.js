/**
 * @fileoverview Token refresh utilities for Google Sheets middleware
 * Handles OAuth token refresh operations
 */

/// <reference path="./types.js" />

import { setCachedCredential } from '../services/credentialCache.js';
import { updateInstanceUsage } from '../services/database.js';
import { updateOAuthStatus } from '../../../db/queries/mcpInstances/oauth.js';
import { recordTokenRefreshMetrics } from '../utils/tokenMetrics.js';
import SheetsOAuthHandler from '../oauth/oauthHandler.js';

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
		error.errorType || 'UNKNOWN_ERROR',
		error.message || 'Token refresh failed',
		startTime, 
		endTime
	);

	// Update OAuth status to failed
	await updateOAuthStatus(instanceId, {
		status: 'failed',
		accessToken: null,
		refreshToken: null,
		tokenExpiresAt: null,
		scope: null
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
export async function performTokenRefresh(instanceId, refreshToken, instance, req) {
	console.log(`🔄 Refreshing expired Bearer token for instance: ${instanceId}`);
	
	const startTime = Date.now();
	const method = 'oauth_handler';
	
	try {
		const newTokens = await attemptTokenRefresh(refreshToken, instance);
		
		const { bearerToken, expiresAt } = await processSuccessfulRefresh(
			instanceId, 
			newTokens, 
			refreshToken, 
			instance.user_id, 
			method, 
			startTime
		);

		// Setup request with new token
		req.bearerToken = bearerToken;
		req.instanceId = instanceId;
		req.userId = instance.user_id;
		req.oauth = {
			bearerToken: bearerToken,
			instanceId: instanceId,
			userId: instance.user_id
		};

		// Update usage tracking
		await updateInstanceUsage(instanceId);

		return { success: true, method };
		
	} catch (error) {
		await processFailedRefresh(instanceId, error, method, startTime);
		return { success: false, error };
	}
}