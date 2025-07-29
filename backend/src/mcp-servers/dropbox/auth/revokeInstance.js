/**
 * @fileoverview Dropbox Instance Revocation
 * Standardized function for revoking Dropbox OAuth instances
 */

const { deleteMCPInstance, getMCPInstanceById } = require('../../../db/queries/mcpInstances/crud.js');

/**
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').RevokeResult} RevokeResult
 */

/**
 * Revokes a Dropbox OAuth instance
 * @param {string} instanceId - Instance ID to revoke
 * @param {string} userId - User ID requesting revocation
 * @returns {Promise<RevokeResult>} Revocation result
 */
async function revokeInstance(instanceId, userId) {
	try {
		console.log(`🗑️ Revoking Dropbox instance ${instanceId} for user: ${userId}`);

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

		if (instance.mcp_service_name !== 'dropbox') {
			return {
				success: false,
				message: 'Instance is not a Dropbox service'
			};
		}

		// TODO: Optionally revoke OAuth tokens with Dropbox
		// This would require making a request to Dropbox's token revocation endpoint
		// For now, we'll just delete the local instance

		// Delete the instance from database
		const deleteResult = await deleteMCPInstance(instanceId, userId);

		if (deleteResult) {
			console.log(`✅ Revoked Dropbox instance: ${instanceId}`);
			return {
				success: true,
				message: 'Dropbox instance revoked successfully'
			};
		} else {
			return {
				success: false,
				message: 'Failed to revoke instance'
			};
		}
	} catch (error) {
		console.error('Dropbox instance revocation error:', error);
		return {
			success: false,
			message: `Failed to revoke Dropbox instance: ${error instanceof Error ? error.message : 'Unknown error'}`
		};
	}
}

module.exports = { revokeInstance };