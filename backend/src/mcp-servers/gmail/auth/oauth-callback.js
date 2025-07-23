/**
 * @fileoverview Gmail OAuth Callback Handler
 * Standardized function for handling Gmail OAuth callbacks
 */

import GmailOAuthHandler from '../oauth/oauth-handler.js';
import { updateOAuthStatus } from '../../../db/queries/mcpInstances/oauth.js';

/**
 * @typedef {import('../../../services/mcp-auth-registry/types/service-types.js').ValidationResult} ValidationResult
 */


/**
 * Handles OAuth callback for Gmail service
 * @param {string} code - OAuth authorization code
 * @param {string} state - OAuth state parameter
 * @returns {Promise<ValidationResult>} Callback processing result
 */
async function oauthCallback(code, state) {
	try {
		console.log(`🔄 Processing Gmail OAuth callback`);

		// Validate required parameters
		if (!code || !state) {
			return {
				success: false,
				message: 'Authorization code and state are required'
			};
		}

		// Create OAuth handler instance
		const oauthHandler = new GmailOAuthHandler();

		// Handle the callback and get tokens
		const callbackResult = await oauthHandler.handleCallback(code, state);

		if (!callbackResult.success) {
			// Update instance status to failed
			try {
				const stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
				if (stateData.instanceId) {
					await updateOAuthStatus(stateData.instanceId, {
						status: 'failed',
						accessToken: null,
						refreshToken: null,
						tokenExpiresAt: null,
						scope: null
					});
				}
			} catch (stateError) {
				console.error('Failed to update instance status:', stateError);
			}

			return {
				success: false,
				message: callbackResult.error || 'OAuth callback failed'
			};
		}

		// Parse state to get instance ID
		const stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
		const { instanceId } = stateData;

		// Update instance with OAuth tokens
		await updateOAuthStatus(instanceId, {
			status: 'completed',
			accessToken: callbackResult.tokens.access_token,
			refreshToken: callbackResult.tokens.refresh_token,
			tokenExpiresAt: callbackResult.tokens.expires_in 
				? new Date(Date.now() + (callbackResult.tokens.expires_in * 1000))
				: null,
			scope: callbackResult.tokens.scope
		});

		console.log(`✅ Gmail OAuth callback completed for instance: ${instanceId}`);

		return {
			success: true,
			message: 'Gmail OAuth completed successfully',
			data: {
				instanceId,
				tokens: callbackResult.tokens,
				status: 'completed'
			}
		};
	} catch (error) {
		console.error('Gmail OAuth callback error:', error);
		return {
			success: false,
			message: `OAuth callback failed: ${error.message}`
		};
	}
}


export { oauthCallback };