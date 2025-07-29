/**
 * @fileoverview Google Drive OAuth Initiation
 * Standardized function for initiating Google Drive OAuth flow
 */

const GoogleDriveOAuthHandler = require('../oauth/oauthHandler');

/**
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').OAuthResult} OAuthResult
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').CredentialsData} CredentialsData
 */


/**
 * Initiates OAuth flow for Google Drive service
 * @param {CredentialsData} credentials - OAuth credentials (clientId, clientSecret)
 * @param {string} userId - User ID initiating OAuth
 * @param {string} instanceId - Existing MCP instance ID
 * @returns {Promise<OAuthResult>} OAuth initiation result
 */
async function initiateOAuth(credentials, userId, instanceId) {
	try {
		console.log(`🚀 Initiating Google Drive OAuth for user: ${userId}, instance: ${instanceId}`);

		// Validate required parameters
		if (!instanceId) {
			return {
				success: false,
				message: 'Instance ID is required for Google Drive OAuth'
			};
		}

		// Validate required credentials
		if (!credentials || !credentials.clientId || !credentials.clientSecret) {
			return {
				success: false,
				message: 'Client ID and Client Secret are required for Google Drive OAuth'
			};
		}

		// Create OAuth handler instance
		const oauthHandler = new GoogleDriveOAuthHandler();

		// Initiate OAuth flow using the existing instance ID
		const oauthResult = await oauthHandler.initiateFlow(
			instanceId,
			userId,
			{
				client_id: credentials.clientId,
				client_secret: credentials.clientSecret
			}
		);

		console.log(`✅ Google Drive OAuth initiated for instance: ${instanceId}`);

		return {
			success: true,
			authUrl: oauthResult.authUrl,
			state: oauthResult.state,
			instanceId: instanceId, // Return the same instance ID
			message: 'Google Drive OAuth flow initiated successfully',
		};
	} catch (error) {
		console.error('Google Drive OAuth initiation error:', error);
		return {
			success: false,
			message: `Failed to initiate Google Drive OAuth: ${error instanceof Error ? error.message : 'Unknown error'}`
		};
	}
}



module.exports = { initiateOAuth  };