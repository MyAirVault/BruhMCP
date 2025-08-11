const { getMCPInstanceById } = require('../../../db/queries/mcpInstances/index.js');
const { invalidateInstanceCache } = require('../../../services/cacheInvalidationService.js');
// const { checkInstanceLimit } = require('../../../utils/planLimits.js');
const { pool } = require('../../../db/config.js');

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @typedef {Object} MCPInstance
 * @property {string} instance_id - The instance ID
 * @property {string} status - Current status of the instance
 * @property {string} expires_at - Expiration timestamp
 * @property {string} mcp_service_name - Name of the MCP service
 * @property {string} mcp_service_id - ID of the MCP service
 * @property {string} updated_at - Last updated timestamp
 * @property {string} user_id - Owner user ID
 */

/**
 * Toggle MCP instance status between active and inactive
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
async function toggleInstanceStatus(req, res) {
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
		const { status } = req.body;

		// Validate request parameters
		if (!id) {
			res.status(400).json({
				error: {
					code: 'MISSING_PARAMETER',
					message: 'Instance ID is required',
				},
			});
			return;
		}

		if (!status || !['active', 'inactive'].includes(status)) {
			res.status(400).json({
				error: {
					code: 'INVALID_STATUS',
					message: 'Status must be either "active" or "inactive"',
				},
			});
			return;
		}

		// Get current instance details
		const instanceRaw = await getMCPInstanceById(id, userId);
		/** @type {MCPInstance|null} */
		const instance = /** @type {MCPInstance|null} */ (instanceRaw);
		if (!instance) {
			res.status(404).json({
				error: {
					code: 'NOT_FOUND',
					message: 'MCP instance not found',
				},
			});
			return;
		}

		// Check if instance is expired - expired instances cannot be toggled
		/** @type {any} */
		const instanceData = instance;
		if (instanceData.status === 'expired') {
			res.status(403).json({
				error: {
					code: 'INSTANCE_EXPIRED',
					message: 'Cannot toggle status of expired instance. Please renew the instance first.',
					expires_at: instanceData.expires_at,
				},
			});
			return;
		}

		// Check if status is already the requested status
		if (instanceData.status === status) {
			res.status(200).json({
				data: {
					message: `Instance is already ${status}`,
					instance_id: id,
					status: status,
					updated_at: instanceData.updated_at,
				},
			});
			return;
		}

		// Plan limit checking will be done atomically within the transaction below

		const oldStatus = instanceData.status;
		const serviceName = instanceData.mcp_service_name;

		console.log(`🔄 Toggling instance ${id} from ${oldStatus} to ${status}`);

		// For deactivation (active -> inactive), invalidate cache first
		if (status === 'inactive' && oldStatus === 'active') {
			try {
				console.log(`🗑️ Removing cache for deactivated instance: ${id}`);
				await invalidateInstanceCache(serviceName, id);
				console.log(`✅ Cache invalidated for instance: ${id}`);
			} catch (cacheError) {
				console.warn(`⚠️ Cache invalidation failed for instance ${id}:`, cacheError);
				// Continue with status update - cache will be cleaned by background watcher
			}
		}

		// Update instance status in database with atomic limit checking
		const client = await pool.connect();

		try {
			await client.query('BEGIN');

			// CRITICAL: Atomic subscription limit checking when activating inactive instances
			if (status === 'active' && instanceData.status === 'inactive') {
				// Check subscription limits before allowing activation
				const { checkInstanceLimit } = require('../../../utils/razorpay/subscriptionLimits.js');
				const limitCheck = await checkInstanceLimit(userId);

				if (!limitCheck.canCreate) {
					await client.query('ROLLBACK');
					res.status(403).json({
						error: {
							code: limitCheck.reason,
							message: limitCheck.message,
							details: {
								userId,
								instanceId: id,
								...limitCheck.details
							},
						},
					});
					return;
				}

				console.log(
					`✅ Subscription limit check passed: ${limitCheck.details?.activeInstances || 0 + 1}/${limitCheck.details?.maxInstances || 'unlimited'} active instances for ${limitCheck.details?.plan} plan`
				);
			}

			// Perform the status update
			const updateResult = await client.query(
				'UPDATE mcp_service_table SET status = $1, updated_at = NOW() WHERE instance_id = $2 AND user_id = $3 RETURNING updated_at',
				[status, id, userId]
			);

			if (updateResult.rowCount === 0) {
				await client.query('ROLLBACK');
				res.status(404).json({
					error: {
						code: 'NOT_FOUND',
						message: 'Instance not found or access denied',
					},
				});
				return;
			}

			await client.query('COMMIT');

			const updatedAt = updateResult.rows[0].updated_at;
			console.log(`✅ Instance ${id} status updated from ${oldStatus} to ${status}`);

			// Log status change event
			console.log(`📝 Status change: ${id} (${serviceName}) ${oldStatus} → ${status} by user ${userId}`);

			res.status(200).json({
				data: {
					message: `Instance status updated successfully`,
					instance_id: id,
					service_type: serviceName,
					old_status: oldStatus,
					new_status: status,
					updated_at: updatedAt.toISOString(),
					cache_invalidated: status === 'inactive',
				},
			});
		} catch (dbError) {
			await client.query('ROLLBACK');
			console.error(`❌ Database error updating instance ${id} status:`, dbError);
			throw dbError;
		} finally {
			client.release();
		}
	} catch (error) {
		console.error('Error toggling instance status:', error);
		const errorMessage = error instanceof Error ? error.message : String(error);

		res.status(500).json({
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Failed to update instance status',
				details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
			},
		});
	}
}

module.exports = { toggleInstanceStatus };
