/**
 * @fileoverview Figma Instance Revocation
 * Standardized function for revoking Figma service instances
 */

import { deleteMCPInstance, getMCPInstanceById } from '../../../db/queries/mcpInstances/crud.js';

/**
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').RevokeResult} RevokeResult
 */

/**
 * Revokes a Figma service instance
 * @param {string} instanceId - Instance ID to revoke
 * @param {string} userId - User ID requesting revocation
 * @returns {Promise<RevokeResult>} Revocation result
 */
async function revokeInstance(instanceId, userId) {
	try {
		console.log(`🗑️ Revoking Figma instance ${instanceId} for user: ${userId}`);

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

		if (instance.mcp_service_name !== 'figma') {
			return {
				success: false,
				message: 'Instance is not a Figma service',
			};
		}

		// Delete the instance from database
		const deleteResult = await deleteMCPInstance(instanceId, userId);

		if (deleteResult) {
			console.log(`✅ Revoked Figma instance: ${instanceId}`);
			return {
				success: true,
				message: 'Figma instance revoked successfully',
			};
		} else {
			return {
				success: false,
				message: 'Failed to revoke instance',
			};
		}
	} catch (error) {
		console.error('Figma instance revocation error:', error);
		return {
			success: false,
			message: `Failed to revoke Figma instance: ${error instanceof Error ? error.message : 'Unknown error'}`,
		};
	}
}

export { revokeInstance };
