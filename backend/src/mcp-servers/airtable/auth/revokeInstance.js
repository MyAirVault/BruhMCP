/**
 * @fileoverview Airtable Instance Revocation
 * Standardized function for revoking Airtable service instances
 */

import { deleteMCPInstance, getMCPInstanceById } from '../../../db/queries/mcpInstances/crud.js';

/**
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').RevokeResult} RevokeResult
 */

/**
 * Revokes an Airtable service instance
 * @param {string} instanceId - Instance ID to revoke
 * @param {string} userId - User ID requesting revocation
 * @returns {Promise<RevokeResult>} Revocation result
 */
async function revokeInstance(instanceId, userId) {
	try {
		console.log(`🗑️ Revoking Airtable instance ${instanceId} for user: ${userId}`);

		if (!instanceId || !userId) {
			return {
				success: false,
				message: 'Instance ID and User ID are required',
			};
		}

		// First verify the instance exists and belongs to the user
		const instance = await getMCPInstanceById(instanceId, userId);

		if (!instance) {
			return {
				success: false,
				message: 'Instance not found or does not belong to user',
			};
		}

		if (instance.mcp_service_name !== 'airtable') {
			return {
				success: false,
				message: 'Instance is not an Airtable service',
			};
		}

		// Delete the instance from database
		const deleteResult = await deleteMCPInstance(instanceId, userId);

		if (deleteResult) {
			console.log(`✅ Revoked Airtable instance: ${instanceId}`);
			return {
				success: true,
				message: 'Airtable instance revoked successfully',
			};
		} else {
			return {
				success: false,
				message: 'Failed to revoke instance',
			};
		}
	} catch (error) {
		console.error('Airtable instance revocation error:', error);
		return {
			success: false,
			message: `Failed to revoke Airtable instance: ${error instanceof Error ? error.message : 'Unknown error'}`,
		};
	}
}

export { revokeInstance };