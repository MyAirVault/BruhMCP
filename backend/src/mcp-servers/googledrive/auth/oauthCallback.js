/**
 * @fileoverview Google Drive OAuth Callback Handler
 * Standardized function for processing OAuth callback
 */

const GoogleDriveOAuthHandler = require('../oauth/oauthHandler');
const { updateOAuthStatus  } = require('../../../db/queries/mcpInstances/oauth');

/**
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').ValidationResult} ValidationResult
 * @typedef {import('../../../services/mcp-auth-registry/types/authTypes.js').OAuthCallbackResult} OAuthCallbackResult
 * @typedef {import('../../../services/mcp-auth-registry/types/authTypes.js').OAuthStatusUpdate} OAuthStatusUpdate
 */


/**
 * Processes OAuth callback for Google Drive service
 * @param {string} code - OAuth authorization code
 * @param {string} state - OAuth state parameter
 * @returns {Promise<ValidationResult>} OAuth callback result
 */
async function oauthCallback(code, state) {
	try {
		console.log('🔄 Processing Google Drive OAuth callback');

		// Validate required parameters
		if (!code || !state) {
			return {
				success: false,
				message: 'Authorization code and state are required'
			};
		}

		// Create OAuth handler instance
		const oauthHandler = new GoogleDriveOAuthHandler();

		// Handle the callback and exchange code for tokens
		const callbackResult = await oauthHandler.handleCallback(code, state);

		if (!callbackResult.success) {
			// Update instance status to failed
			try {
				const stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
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

		// Parse state to get instance and user info
		const stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
		const { instanceId } = stateData;

		// Update tokens in database
		if (!callbackResult.tokens) {
			throw new Error('No tokens received from OAuth callback');
		}

		const tokenExpiresAt = callbackResult.tokens.expires_in 
			? new Date(Date.now() + (callbackResult.tokens.expires_in * 1000))
			: undefined;
		
		await updateOAuthStatus(instanceId, {
			status: 'completed',
			accessToken: callbackResult.tokens.access_token,
			refreshToken: callbackResult.tokens.refresh_token,
			tokenExpiresAt,
			scope: callbackResult.tokens.scope
		});

		console.log(`✅ Google Drive OAuth callback successful for instance: ${instanceId}`);

		return {
			success: true,
			message: 'Google Drive OAuth completed successfully',
			data: {
				instanceId,
				tokens: callbackResult.tokens,
				status: 'completed'
			}
		};
	} catch (error) {
		console.error('Google Drive OAuth callback error:', error);
		return {
			success: false,
			message: `OAuth callback failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		};
	}
}



module.exports = { oauthCallback  };