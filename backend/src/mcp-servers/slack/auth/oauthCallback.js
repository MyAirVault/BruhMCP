/**
 * @fileoverview Slack OAuth Callback Handler
 * Standardized function for handling Slack OAuth callback
 */

import SlackOAuthHandler from '../oauth/oauthHandler.js';
import { updateOAuthStatus } from '../../../db/queries/mcpInstances/index.js';

/**
 * @typedef {Object} CallbackResult
 * @property {boolean} success - Whether callback processing succeeded
 * @property {string} message - Human readable message
 * @property {Object} [tokens] - OAuth tokens if successful
 * @property {string} [tokens.access_token] - Access token
 * @property {string} [tokens.refresh_token] - Refresh token
 * @property {number} [tokens.expires_in] - Token expiration in seconds
 * @property {string} [tokens.scope] - Token scope
 * @property {string} [tokens.team_id] - Slack team ID
 */

/**
 * Handles OAuth callback for Slack service
 * @param {string} code - OAuth authorization code
 * @param {string} state - OAuth state parameter
 * @returns {Promise<CallbackResult>} Callback processing result
 */
async function oauthCallback(code, state) {
	try {
		console.log(`🔄 Processing Slack OAuth callback`);

		// Validate required parameters
		if (!code) {
			return {
				success: false,
				message: 'Authorization code is required'
			};
		}

		if (!state) {
			return {
				success: false,
				message: 'State parameter is required for security'
			};
		}

		// Create OAuth handler instance
		const oauthHandler = new SlackOAuthHandler();

		// Handle the callback and exchange code for tokens
		const callbackResult = await oauthHandler.handleCallback(code, state);

		if (!callbackResult.success) {
			console.error('Slack OAuth callback failed:', callbackResult.error);
			return {
				success: false,
				message: callbackResult.error || 'OAuth callback processing failed'
			};
		}

		// Parse state to get instance info
		const stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
		const { instanceId } = stateData;

		// Update instance with new tokens
		const tokenExpiresAt = new Date(Date.now() + ((callbackResult.tokens?.expires_in || 3600) * 1000));

		await updateOAuthStatus(instanceId, {
			status: 'completed',
			accessToken: callbackResult.tokens?.access_token || '',
			refreshToken: callbackResult.tokens?.refresh_token || '',
			tokenExpiresAt: tokenExpiresAt,
			scope: callbackResult.tokens?.scope
		});

		console.log(`✅ Slack OAuth callback completed for instance: ${instanceId}`);

		return {
			success: true,
			message: 'Slack OAuth flow completed successfully',
			data: {
				instanceId: instanceId,
				tokens: callbackResult.tokens,
				status: 'completed'
			}
		};
	} catch (error) {
		console.error('Slack OAuth callback error:', error);
		return {
			success: false,
			message: `OAuth callback failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		};
	}
}

export { oauthCallback };