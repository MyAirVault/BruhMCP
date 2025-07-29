/**
 * @fileoverview Notion Instance Revocation
 * Standardized function for revoking Notion OAuth instances
 */

const { deleteMCPInstance, getMCPInstanceById  } = require('../../../db/queries/mcpInstances/crud');

/**
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').RevokeResult} RevokeResult
 */


/**
 * Revokes a Notion OAuth instance
 * @param {string} instanceId - Instance ID to revoke
 * @param {string} userId - User ID requesting revocation
 * @returns {Promise<RevokeResult>} Revocation result
 */
async function revokeInstance(instanceId, userId) {
	try {
		console.log(`🗑️ Revoking Notion instance ${instanceId} for user: ${userId}`);

		if (!instanceId || !userId) {
			return {
				success: false,
				message: 'Instance ID and User ID are required'
			};
		}

		// First verify the instance exists and belongs to the user
		const instance = await getMCPInstanceById(instanceId, userId);

		if (!instance) {
			return {
				success: false,
				message: 'Instance not found or does not belong to user'
			};
		}

		if (instance.mcp_service_name !== 'notion') {
			return {
				success: false,
				message: 'Instance is not a Notion service'
			};
		}

		// TODO: Optionally revoke OAuth tokens with Notion
		// This would require making a request to Notion's token revocation endpoint
		// For now, we'll just delete the local instance

		// Delete the instance from database
		const deleteResult = await deleteMCPInstance(instanceId, userId);

		if (deleteResult) {
			console.log(`✅ Revoked Notion instance: ${instanceId}`);
			return {
				success: true,
				message: 'Notion instance revoked successfully'
			};
		} else {
			return {
				success: false,
				message: 'Failed to revoke instance'
			};
		}
	} catch (error) {
		console.error('Notion instance revocation error:', error);
		return {
			success: false,
			message: `Failed to revoke Notion instance: ${error instanceof Error ? error.message : 'Unknown error'}`
		};
	}
}



module.exports = { revokeInstance  };