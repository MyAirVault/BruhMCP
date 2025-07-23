/**
 * @fileoverview Gmail OAuth Initiation
 * Standardized function for initiating Gmail OAuth flow
 */

import GmailOAuthHandler from '../oauth/oauth-handler.js';
import { createMCPInstance } from '../../../db/queries/mcpInstances/creation.js';
import { getMCPServiceByName } from '../../../db/queries/mcpServices/crud.js';

/**
 * @typedef {import('../../../services/mcp-auth-registry/types/service-types.js').OAuthResult} OAuthResult
 * @typedef {import('../../../services/mcp-auth-registry/types/service-types.js').CredentialsData} CredentialsData
 */


/**
 * Initiates OAuth flow for Gmail service
 * @param {CredentialsData} credentials - OAuth credentials (clientId, clientSecret)
 * @param {string} userId - User ID initiating OAuth
 * @returns {Promise<OAuthResult>} OAuth initiation result
 */
async function initiateOAuth(credentials, userId) {
	try {
		console.log(`🚀 Initiating Gmail OAuth for user: ${userId}`);

		// Validate required credentials
		if (!credentials || !credentials.clientId || !credentials.clientSecret) {
			return {
				success: false,
				message: 'Client ID and Client Secret are required for Gmail OAuth'
			};
		}

		// Create OAuth handler instance
		const oauthHandler = new GmailOAuthHandler();

		// Get MCP service ID for Gmail
		const mcpService = await getMCPServiceByName('gmail');
		if (!mcpService) {
			return {
				success: false,
				message: 'Gmail service not found in MCP services table'
			};
		}

		// First create a pending MCP instance to track the OAuth flow
		const instanceRecord = await createMCPInstance({
			userId,
			mcpServiceId: mcpService.id,
			customName: 'Gmail OAuth',
			clientId: credentials.clientId,
			clientSecret: credentials.clientSecret,
			serviceType: 'oauth'
		});

		// Initiate OAuth flow using the instance ID
		const oauthResult = await oauthHandler.initiateFlow(
			instanceRecord.instance_id,
			{
				client_id: credentials.clientId,
				client_secret: credentials.clientSecret
			}
		);

		console.log(`✅ Gmail OAuth initiated for instance: ${instanceRecord.instance_id}`);

		return {
			success: true,
			authUrl: oauthResult.authUrl,
			state: oauthResult.state,
			message: 'Gmail OAuth flow initiated successfully',
			data: {
				instanceId: instanceRecord.instance_id,
				authUrl: oauthResult.authUrl,
				state: oauthResult.state
			}
		};
	} catch (error) {
		console.error('Gmail OAuth initiation error:', error);
		return {
			success: false,
			message: `Failed to initiate Gmail OAuth: ${error.message}`
		};
	}
}


export { initiateOAuth };