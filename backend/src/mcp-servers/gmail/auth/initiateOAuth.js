/**
 * @fileoverview Gmail OAuth Initiation
 * Standardized function for initiating Gmail OAuth flow
 */

import GmailOAuthHandler from '../oauth/oauthHandler.js';

/**
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').OAuthResult} OAuthResult
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').CredentialsData} CredentialsData
 */


/**
 * Initiates OAuth flow for Gmail service
 * @param {CredentialsData} credentials - OAuth credentials (clientId, clientSecret)
 * @param {string} userId - User ID initiating OAuth
 * @param {string} instanceId - Existing MCP instance ID
 * @returns {Promise<OAuthResult>} OAuth initiation result
 */
async function initiateOAuth(credentials, userId, instanceId) {
	try {
		console.log(`🚀 Initiating Gmail OAuth for user: ${userId}, instance: ${instanceId}`);

		// Validate required parameters
		if (!instanceId) {
			return {
				success: false,
				message: 'Instance ID is required for Gmail OAuth'
			};
		}

		// Validate required credentials
		if (!credentials || !credentials.clientId || !credentials.clientSecret) {
			return {
				success: false,
				message: 'Client ID and Client Secret are required for Gmail OAuth'
			};
		}

		// Create OAuth handler instance
		const oauthHandler = new GmailOAuthHandler();

		// Initiate OAuth flow using the existing instance ID
		const oauthResult = await oauthHandler.initiateFlow(
			instanceId,
			userId,
			{
				client_id: credentials.clientId,
				client_secret: credentials.clientSecret
			}
		);

		console.log(`✅ Gmail OAuth initiated for instance: ${instanceId}`);

		return {
			success: true,
			authUrl: oauthResult.authUrl,
			state: oauthResult.state,
			instanceId: instanceId, // Return the same instance ID
			message: 'Gmail OAuth flow initiated successfully',
		};
	} catch (error) {
		console.error('Gmail OAuth initiation error:', error);
		return {
			success: false,
			message: `Failed to initiate Gmail OAuth: ${error instanceof Error ? error.message : 'Unknown error'}`
		};
	}
}


export { initiateOAuth };