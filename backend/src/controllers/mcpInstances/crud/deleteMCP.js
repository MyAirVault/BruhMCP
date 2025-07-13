import { getMCPInstanceById, deleteMCPInstance } from '../../../db/queries/mcpInstancesQueries.js';
import { updateMCPTypeStats } from '../../../db/queries/mcpTypesQueries.js';
import { invalidateInstanceCache } from '../../../services/cacheInvalidationService.js';
import { pool } from '../../../db/config.js';
import { logDeletionEvent, trackDeletionMetrics } from '../../../utils/deletionAudit.js';
import loggingService from '../../../services/logging/loggingService.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * Delete MCP instance
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function deleteMCP(req, res) {
	try {
		const userId = req.user?.id;
		if (!userId) {
			return res.status(401).json({
				error: {
					code: 'UNAUTHORIZED',
					message: 'User authentication required'
				}
			});
		}
		
		const { id } = req.params;
		if (!id) {
			return res.status(400).json({
				error: {
					code: 'MISSING_PARAMETER',
					message: 'Instance ID is required'
				}
			});
		}

		// Step 1: Get instance details before deletion (for cache cleanup and audit)
		const instance = await getMCPInstanceById(id, userId);
		if (!instance) {
			return res.status(404).json({
				error: {
					code: 'NOT_FOUND',
					message: 'MCP instance not found',
				},
			});
		}

		const serviceName = instance.mcp_service_name;
		const serviceId = instance.mcp_service_id;
		const instanceDetails = {
			instance_id: instance.instance_id,
			service_type: serviceName,
			custom_name: instance.custom_name,
			user_id: userId
		};

		console.log(`🗑️ Deleting MCP instance ${id} (${serviceName}) for user ${userId}`);

		// Step 2: Database transaction for atomic deletion
		const client = await pool.connect();
		
		try {
			await client.query('BEGIN');

			// Delete instance from database
			const deleteResult = await client.query(
				'DELETE FROM mcp_service_table WHERE instance_id = $1 AND user_id = $2',
				[id, userId]
			);

			if (deleteResult.rowCount === 0) {
				await client.query('ROLLBACK');
				return res.status(404).json({
					error: {
						code: 'NOT_FOUND',
						message: 'MCP instance not found or already deleted',
					},
				});
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

		// Step 4: Process cleanup no longer needed with new architecture

		console.log(`✅ MCP instance ${id} deleted successfully`);

		// Audit log the deletion
		loggingService.logInstanceDeleted(id, userId, {
			service: serviceName,
			cacheInvalidated: true
		});

		// Step 5: Success response
		res.status(200).json({
			data: {
				message: 'MCP instance deleted successfully',
				instance_id: id,
				service_type: serviceName,
				deleted_at: new Date().toISOString(),
				details: instanceDetails
			},
		});
	} catch (error) {
		console.error('Error deleting MCP instance:', error);
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Failed to delete MCP instance',
				details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
			},
		});
	}
}
