import { getMCPInstanceById } from '../../../db/queries/mcpInstancesQueries.js';
import { invalidateInstanceCache } from '../../../services/cacheInvalidationService.js';
// import { checkInstanceLimit } from '../../../utils/planLimits.js';
import { pool } from '../../../db/config.js';

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
export async function toggleInstanceStatus(req, res) {
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

			// CRITICAL: Atomic plan limit checking when activating inactive instances
			if (status === 'active' && instanceData.status === 'inactive') {
				// Get user plan with locking to prevent race conditions
				const planQuery = `
					SELECT up.plan_type, up.max_instances, up.expires_at
					FROM user_plans up
					WHERE up.user_id = $1
					FOR UPDATE
				`;
				const planResult = await client.query(planQuery, [userId]);

				if (planResult.rows.length === 0) {
					await client.query('ROLLBACK');
					res.status(403).json({
						error: {
							code: 'NO_PLAN',
							message: 'No subscription plan found. Please contact support.',
							details: { userId, instanceId: id },
						},
					});
					return;
				}

				const userPlan = planResult.rows[0];

				// Check if plan is active (not expired)
				if (userPlan.expires_at && new Date(userPlan.expires_at) < new Date()) {
					await client.query('ROLLBACK');
					res.status(403).json({
						error: {
							code: 'PLAN_EXPIRED',
							message: 'Your subscription plan has expired. Please renew to continue.',
							details: {
								userId,
								instanceId: id,
								plan: userPlan.plan_type,
								expiresAt: userPlan.expires_at,
							},
						},
					});
					return;
				}

				// First, lock the relevant rows to prevent race conditions
				const lockQuery = `
					SELECT ms.instance_id
					FROM mcp_service_table ms
					WHERE ms.user_id = $1 
					  AND ms.status = 'active' 
					  AND ms.oauth_status = 'completed'
					  AND ms.instance_id != $2
					FOR UPDATE
				`;
				await client.query(lockQuery, [userId, id]);

				// Then count the instances (without FOR UPDATE since we already have the lock)
				const countQuery = `
					SELECT COUNT(*) as count 
					FROM mcp_service_table ms
					WHERE ms.user_id = $1 
					  AND ms.status = 'active' 
					  AND ms.oauth_status = 'completed'
					  AND ms.instance_id != $2
				`;
				const countResult = await client.query(countQuery, [userId, id]);
				const currentActiveInstances = parseInt(countResult.rows[0].count);

				// Check plan limits (null means unlimited for pro plans)
				if (userPlan.max_instances !== null && currentActiveInstances >= userPlan.max_instances) {
					await client.query('ROLLBACK');
					res.status(403).json({
						error: {
							code: 'ACTIVE_LIMIT_REACHED',
							message: `You have reached your ${userPlan.plan_type} plan limit of ${userPlan.max_instances} active instance${userPlan.max_instances > 1 ? 's' : ''}. Deactivate or delete an existing instance to activate this one.`,
							details: {
								userId,
								instanceId: id,
								plan: userPlan.plan_type,
								currentActiveInstances,
								maxInstances: userPlan.max_instances,
								upgradeMessage: 'Upgrade to Pro plan for unlimited active instances',
							},
						},
					});
					return;
				}

				console.log(
					`✅ Plan limit check passed: ${currentActiveInstances + 1}/${userPlan.max_instances || 'unlimited'} active instances for ${userPlan.plan_type} plan`
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
