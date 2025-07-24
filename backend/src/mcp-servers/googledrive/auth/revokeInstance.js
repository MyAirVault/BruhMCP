/**
 * @fileoverview Google Drive Instance Revocation
 * Standardized function for revoking Google Drive OAuth instance
 */

import { deleteMCPInstance } from '../../../db/queries/mcpInstances/crud.js';
import { removeCachedCredential } from '../services/cache/index.js';
import { removeHandler } from '../services/handlerSessions.js';

/**
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').RevocationResult} RevocationResult
 */


/**
 * Revokes Google Drive MCP instance and cleans up resources
 * @param {string} instanceId - Instance ID to revoke
 * @param {string} userId - User ID for authorization
 * @returns {Promise<RevocationResult>} Revocation result
 */
async function revokeInstance(instanceId, userId) {
	try {
		console.log(`🗑️ Revoking Google Drive instance: ${instanceId} for user: ${userId}`);

		// Validate parameters
		if (!instanceId || !userId) {
			return {
				success: false,
				message: 'Instance ID and User ID are required for revocation'
			};
		}

		// Remove cached credentials
		removeCachedCredential(instanceId);
		console.log('✅ Cached credentials removed');

		// Remove any active MCP handler sessions
		removeHandler(instanceId);
		console.log('✅ Active handler sessions removed');

		// Delete from database
		const deleteResult = await deleteMCPInstance(instanceId, userId);

		if (!deleteResult) {
			return {
				success: false,
				message: 'Failed to delete instance from database'
			};
		}

		console.log(`✅ Google Drive instance ${instanceId} revoked successfully`);

		return {
			success: true,
			message: 'Google Drive instance revoked successfully',
			data: {
				instanceId,
				revokedAt: new Date().toISOString()
			}
		};
	} catch (error) {
		console.error('Google Drive instance revocation error:', error);
		return {
			success: false,
			message: `Revocation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		};
	}
}


export { revokeInstance };