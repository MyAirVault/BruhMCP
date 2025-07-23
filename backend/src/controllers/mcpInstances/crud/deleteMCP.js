import { getMCPInstanceById } from '../../../db/queries/mcpInstances/index.js';
// import { updateMCPTypeStats } from '../../../db/queries/mcpTypesQueries.js'; // Unused import
import { invalidateInstanceCache } from '../../../services/cacheInvalidationService.js';
import { pool } from '../../../db/config.js';
// import { logDeletionEvent, trackDeletionMetrics } from '../../../utils/deletionAudit.js'; // Unused imports
import loggingService from '../../../services/logging/loggingService.js';
import { removeMCPLogDirectory } from '../../../utils/logDirectoryManager.js';
import mcpInstanceLogger from '../../../utils/mcpInstanceLogger.js';

/**
 * @typedef {Object} User
 * @property {number} id - User ID
 */

/**
 * @typedef {import('express').Request } AuthenticatedRequest
 */

/** @typedef {import('express').Response} Response */

/**
 * Database instance object from getMCPInstanceById query
 * @typedef {Object} MCPInstanceRecord
 * @property {string} instance_id - The unique instance ID
 * @property {string} mcp_service_name - The MCP service name
 * @property {string} mcp_service_id - The MCP service ID
 * @property {string} custom_name - User-defined custom name
 * @property {number} user_id - The user ID who owns the instance
 */

/**
 * Delete MCP instance
 * @param {AuthenticatedRequest} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function deleteMCP(req, res) {
	try {
		const userId = req.user?.id;
		if (!userId) {
			res.status(401).json({
				error: {
					code: 'UNAUTHORIZED',
					message: 'User authentication required',
				},
			});
			return;
		}

		const { id } = req.params;
		if (!id) {
			res.status(400).json({
				error: {
					code: 'MISSING_PARAMETER',
					message: 'Instance ID is required',
				},
			});
			return;
		}

		// Step 1: Get instance details before deletion (for cache cleanup and audit)
		const instance = await getMCPInstanceById(id, String(userId));
		if (!instance) {
			res.status(404).json({
				error: {
					code: 'NOT_FOUND',
					message: 'MCP instance not found',
				},
			});
			return;
		}

		const serviceName = /** @type {any} */ (instance).mcp_service_name;
		const serviceId = /** @type {any} */ (instance).mcp_service_id;
		const instanceDetails = {
			instance_id: /** @type {any} */ (instance).instance_id,
			service_type: serviceName,
			custom_name: /** @type {any} */ (instance).custom_name,
			user_id: userId,
		};

		console.log(`🗑️ Deleting MCP instance ${id} (${serviceName}) for user ${userId}`);

		// Step 2: Database transaction for atomic deletion
		const client = await pool.connect();

		try {
			await client.query('BEGIN');

			// Delete instance from database
			const deleteResult = await client.query(
				'DELETE FROM mcp_service_table WHERE instance_id = $1 AND user_id = $2',
				[id, String(userId)]
			);

			if (deleteResult.rowCount === 0) {
				await client.query('ROLLBACK');
				res.status(404).json({
					error: {
						code: 'NOT_FOUND',
						message: 'MCP instance not found or already deleted',
					},
				});
				return;
			}

			// Update service statistics
			await client.query(
				'UPDATE mcp_table SET active_instances_count = active_instances_count - 1, updated_at = NOW() WHERE mcp_service_id = $1',
				[serviceId]
			);

			await client.query('COMMIT');
			console.log(`✅ Database deletion completed for instance ${id}`);
		} catch (dbError) {
			await client.query('ROLLBACK');
			console.error(`❌ Database deletion failed for instance ${id}:`, dbError);
			throw dbError;
		} finally {
			client.release();
		}

		// Step 3: Service-specific cache invalidation (async, non-blocking)
		invalidateInstanceCache(serviceName, id).catch(cacheError => {
			console.error(`⚠️ Cache invalidation failed for ${serviceName} instance ${id}:`, cacheError);
			// Don't fail the deletion - background watcher will clean up cache
		});

		// Step 4: Log instance deletion and cleanup logger
		const logger = mcpInstanceLogger.getLogger(id);
		if (logger && typeof (/** @type {any} */ (logger).app) === 'function') {
			/** @type {any} */ (logger).app('info', 'MCP instance deleted', {
				instanceId: id,
				serviceName: serviceName,
				deletedAt: new Date().toISOString(),
				userId: userId,
			});
		}

		// Remove logger from memory
		mcpInstanceLogger.removeLogger(id);

		// Step 5: Log directory cleanup (async, non-blocking)
		removeMCPLogDirectory(String(userId), id).catch(logError => {
			console.error(`⚠️ Log directory cleanup failed for instance ${id}:`, logError);
			// Don't fail the deletion - log directories can be cleaned up manually if needed
		});

		// Step 6: Process cleanup no longer needed with new architecture

		console.log(`✅ MCP instance ${id} deleted successfully`);

		// Audit log the deletion
		loggingService.logInstanceDeleted(id, String(userId), {
			service: serviceName,
			cacheInvalidated: true,
		});

		// Step 7: Success response
		res.status(200).json({
			data: {
				message: 'MCP instance deleted successfully',
				instance_id: id,
				service_type: serviceName,
				deleted_at: new Date().toISOString(),
				details: instanceDetails,
			},
		});
		return;
	} catch (error) {
		console.error('Error deleting MCP instance:', error);
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Failed to delete MCP instance',
				details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
			},
		});
		return;
	}
}
