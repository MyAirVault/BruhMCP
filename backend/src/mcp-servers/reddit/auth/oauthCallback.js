/**
 * @fileoverview Reddit OAuth Callback Handler
 * Standardized function for handling Reddit OAuth callbacks
 */

const RedditOAuthHandler = require('../oauth/oauthHandler');
const { updateOAuthStatus  } = require('../../../db/queries/mcpInstances/oauth');

/**
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').ValidationResult} ValidationResult
 * @typedef {import('../../../services/mcp-auth-registry/types/authTypes.js').OAuthCallbackResult} OAuthCallbackResult
 * @typedef {import('../../../services/mcp-auth-registry/types/authTypes.js').OAuthStatusUpdate} OAuthStatusUpdate
 */

/**
 * @typedef {Object} StateData
 * @property {string} instanceId - MCP instance ID
 * @property {number} timestamp - Timestamp when state was created
 * @property {string} service - Service name
 */

/**
 * Handles OAuth callback for Reddit service
 * @param {string} code - OAuth authorization code
 * @param {string} state - OAuth state parameter
 * @returns {Promise<ValidationResult>} Callback processing result
 */
async function oauthCallback(code, state) {
	try {
		console.log(`🔄 Processing Reddit OAuth callback`);

		// Validate required parameters
		if (!code || !state) {
			return {
				success: false,
				message: 'Authorization code and state are required'
			};
		}

		// Create OAuth handler instance
		const oauthHandler = new RedditOAuthHandler();

		// Handle the callback and get tokens
		const callbackResult = await oauthHandler.handleCallback(code, state);

		if (!callbackResult.success) {
			// Update instance status to failed
			try {
				const stateData = /** @type {StateData} */ (JSON.parse(Buffer.from(state, 'base64').toString('utf-8')));
				if (stateData.instanceId) {
					await updateOAuthStatus(stateData.instanceId, {
						status: 'failed',
						accessToken: undefined,
						refreshToken: undefined,
						tokenExpiresAt: undefined,
						scope: undefined
					});
				}
			} catch (stateError) {
				console.error('Failed to update instance status:', stateError instanceof Error ? stateError.message : String(stateError));
			}

			return {
				success: false,
				message: callbackResult.error || 'OAuth callback failed'
			};
		}

		// Parse state to get instance ID
		console.log(`📋 Parsing state to get instance ID`);
		const stateData = /** @type {StateData} */ (JSON.parse(Buffer.from(state, 'base64').toString('utf-8')));
		const { instanceId } = stateData;
		console.log(`📋 Extracted instanceId: ${instanceId}`);

		// Ensure tokens exist
		if (!callbackResult.tokens) {
			console.error(`❌ No tokens received from OAuth callback`);
			return {
				success: false,
				message: 'OAuth callback succeeded but no tokens received'
			};
		}
		console.log(`✅ Tokens received:`, {
			hasAccessToken: !!callbackResult.tokens.access_token,
			hasRefreshToken: !!callbackResult.tokens.refresh_token,
			expiresIn: callbackResult.tokens.expires_in
		});

		// Update instance with OAuth tokens
		try {
			console.log(`🔄 Updating OAuth status for instance ${instanceId} to 'completed'`);
			await updateOAuthStatus(instanceId, {
				status: 'completed',
				accessToken: callbackResult.tokens.access_token,
				refreshToken: callbackResult.tokens.refresh_token,
				tokenExpiresAt: callbackResult.tokens.expires_in 
					? new Date(Date.now() + (callbackResult.tokens.expires_in * 1000))
					: undefined,
				scope: callbackResult.tokens.scope
			});
			console.log(`✅ OAuth status updated successfully for instance ${instanceId}`);
		} catch (updateError) {
			console.error(`❌ Failed to update OAuth status for instance ${instanceId}:`, updateError);
			throw updateError;
		}

		console.log(`✅ Reddit OAuth callback completed for instance: ${instanceId}`);

		return {
			success: true,
			message: 'Reddit OAuth completed successfully',
			data: {
				instanceId,
				tokens: callbackResult.tokens,
				status: 'completed'
			}
		};
	} catch (error) {
		console.error('Reddit OAuth callback error:', error);
		return {
			success: false,
			message: `OAuth callback failed: ${error instanceof Error ? error.message : String(error)}`
		};
	}
}


module.exports = { oauthCallback  };