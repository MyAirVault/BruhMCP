/**
 * @fileoverview Slack Instance Revocation
 * Standardized function for revoking Slack OAuth tokens and cleaning up instance
 */

const { revokeToken  } = require('../utils/oauthValidation');
const { removeCachedCredential  } = require('../services/credentialCache');
const { removeHandlerSession  } = require('../services/handlerSessions');
const { deleteMCPInstance  } = require('../../../db/queries/mcpInstances/crud');

/**
 * @typedef {Object} RevocationResult
 * @property {boolean} success - Whether revocation succeeded
 * @property {string} message - Human readable message
 */

/**
 * Revokes Slack OAuth tokens and cleans up instance
 * @param {string} instanceId - MCP instance ID to revoke
 * @param {string} userId - User ID requesting revocation
 * @returns {Promise<RevocationResult>} Revocation result
 */
async function revokeInstance(instanceId, userId) {
	try {
		console.log(`🔒 Revoking Slack instance: ${instanceId} for user: ${userId}`);

		// Validate required parameters
		if (!instanceId) {
			return {
				success: false,
				message: 'Instance ID is required for revocation'
			};
		}

		if (!userId) {
			return {
				success: false,
				message: 'User ID is required for revocation'
			};
		}

		// Get instance to retrieve access token for revocation
		const { getMCPInstanceById } = await import('../../../db/queries/mcpInstances/crud.js');
		const instance = await getMCPInstanceById(instanceId, userId);

		if (!instance) {
			return {
				success: false,
				message: 'Instance not found or access denied'
			};
		}

		// Try to revoke the token with Slack if we have an access token
		if (instance.access_token) {
			try {
				await revokeToken(instance.access_token);
				console.log(`✅ Successfully revoked Slack access token for instance: ${instanceId}`);
			} catch (revokeError) {
				const errorMessage = revokeError instanceof Error ? revokeError.message : String(revokeError);
				console.warn(`⚠️ Failed to revoke Slack token (continuing with cleanup): ${errorMessage}`);
				// Continue with cleanup even if revocation fails
			}
		}

		// Clean up cached credentials and sessions
		removeCachedCredential(instanceId);
		removeHandlerSession(instanceId);

		// Delete the instance from database
		await deleteMCPInstance(instanceId, userId);

		console.log(`✅ Slack instance revoked and cleaned up: ${instanceId}`);

		return {
			success: true,
			message: 'Slack instance revoked successfully'
		};
	} catch (error) {
		console.error('Slack instance revocation error:', error);
		return {
			success: false,
			message: `Revocation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		};
	}
}


module.exports = { revokeInstance  };