/**
 * @fileoverview Notion OAuth Initiation
 * Standardized function for initiating Notion OAuth flow
 */

import NotionOAuthHandler from '../oauth/oauthHandler.js';

/**
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').OAuthResult} OAuthResult
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').CredentialsData} CredentialsData
 */


/**
 * Initiates OAuth flow for Notion service
 * @param {CredentialsData} credentials - OAuth credentials (clientId, clientSecret)
 * @param {string} userId - User ID initiating OAuth
 * @param {string} instanceId - Existing MCP instance ID
 * @returns {Promise<OAuthResult>} OAuth initiation result
 */
async function initiateOAuth(credentials, userId, instanceId) {
	try {
		console.log(`🚀 Initiating Notion OAuth for user: ${userId}, instance: ${instanceId}`);

		// Validate required parameters
		if (!instanceId) {
			return {
				success: false,
				message: 'Instance ID is required for Notion OAuth'
			};
		}

		// Validate required credentials
		if (!credentials || !credentials.clientId || !credentials.clientSecret) {
			return {
				success: false,
				message: 'Client ID and Client Secret are required for Notion OAuth'
			};
		}

		// Create OAuth handler instance
		const oauthHandler = new NotionOAuthHandler();

		// Initiate OAuth flow using the existing instance ID
		const oauthResult = await oauthHandler.initiateFlow(
			instanceId,
			userId,
			{
				client_id: credentials.clientId,
				client_secret: credentials.clientSecret
			}
		);

		console.log(`✅ Notion OAuth initiated for instance: ${instanceId}`);

		return {
			success: true,
			authUrl: oauthResult.authUrl,
			state: oauthResult.state,
			instanceId: instanceId,
			message: 'Notion OAuth flow initiated successfully',
		};
	} catch (error) {
		console.error('Notion OAuth initiation error:', error);
		return {
			success: false,
			message: `Failed to initiate Notion OAuth: ${error instanceof Error ? error.message : 'Unknown error'}`
		};
	}
}


export { initiateOAuth };