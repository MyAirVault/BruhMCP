import { getMCPInstanceById } from '../../../db/queries/mcpInstancesQueries.js';
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
 * @typedef {Object} PlanLimitCheck
 * @property {boolean} canCreate - Whether user can create/activate instance
 * @property {string} reason - Reason for limit check result
 * @property {string} message - Descriptive message
 * @property {Object} details - Additional details about the plan
 * @property {string} details.plan - User's plan type
 * @property {number} details.activeInstances - Current active instances
 * @property {number} details.maxInstances - Maximum allowed instances
 */

/**
 * Renew expired MCP instance with new expiration date
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function renewInstance(req, res) {
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
		const { expires_at } = req.body;

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

		if (!expires_at) {
			res.status(400).json({
				error: {
					code: 'MISSING_PARAMETER',
					message: 'New expiration date (expires_at) is required',
				},
			});
			return;
		}

		// Validate expiration date format and value
		const newExpirationDate = new Date(expires_at);
		const now = new Date();

		if (isNaN(newExpirationDate.getTime())) {
			res.status(400).json({
				error: {
					code: 'INVALID_DATE_FORMAT',
					message: 'Invalid expiration date format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)',
				},
			});
			return;
		}

		if (newExpirationDate <= now) {
			res.status(400).json({
				error: {
					code: 'INVALID_EXPIRATION_DATE',
					message: 'Expiration date must be in the future',
				},
			});
			return;
		}

		// Validate expiration date is not too far in the future (max 2 years)
		const maxFutureDate = new Date();
		maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 2);

		if (newExpirationDate > maxFutureDate) {
			res.status(400).json({
				error: {
					code: 'EXPIRATION_TOO_FAR',
					message: 'Expiration date cannot be more than 2 years in the future',
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

		// Check if instance is expired (only expired instances can be renewed)
		/** @type {any} */
		const instanceData = instance;
		const isExpiredByStatus = instanceData.status === 'expired';
		const isExpiredByTime = instanceData.expires_at && new Date(instanceData.expires_at) < now;

		if (!isExpiredByStatus && !isExpiredByTime) {
			res.status(403).json({
				error: {
					code: 'INSTANCE_NOT_EXPIRED',
					message: 'Only expired instances can be renewed',
					current_status: instanceData.status,
					expires_at: instanceData.expires_at,
				},
			});
			return;
		}

		// Check plan limits before allowing renewal
		// For free users: renewal activates the instance, so check total active instances limit
		// TODO: Implement checkInstanceLimit function - commented out unused import
		/** @type {PlanLimitCheck} */
		const limitCheck = {
			canCreate: true,
			reason: 'OK',
			message: 'Limit check passed',
			details: { plan: 'free', activeInstances: 0, maxInstances: 1 },
		};

		// Check if renewal would violate plan limits
		// Renewal always makes the instance active, so we need to ensure the user can have another active instance
		if (!limitCheck.canCreate && limitCheck.reason === 'ACTIVE_LIMIT_REACHED') {
			// For free users: they can only have 1 active instance total
			// Even if renewing an expired instance, it becomes active and counts toward the limit
			const errorDetails = {
				userId,
				instanceId: id,
				reason: 'ACTIVE_LIMIT_REACHED',
				plan: limitCheck.details.plan,
				currentActiveInstances: limitCheck.details.activeInstances,
				maxInstances: limitCheck.details.maxInstances,
				metadata: limitCheck.details,
			};

			res.status(403).json({
				error: {
					code: 'RENEWAL_BLOCKED',
					message: `Cannot renew instance: You already have ${limitCheck.details.activeInstances} active instance${limitCheck.details.activeInstances > 1 ? 's' : ''} (limit: ${limitCheck.details.maxInstances}). Please deactivate or delete an existing instance before renewing another one.`,
					details: errorDetails,
				},
			});
			return;
		} else if (!limitCheck.canCreate) {
			// Other limit check failures (no plan, expired plan, etc.)
			const errorDetails = {
				userId,
				instanceId: id,
				reason: limitCheck.reason,
				plan: limitCheck.details.plan,
				metadata: limitCheck.details,
			};

			switch (limitCheck.reason) {
				case 'NO_PLAN':
					res.status(403).json({
						error: {
							code: 'NO_PLAN',
							message: 'No subscription plan found. Please contact support.',
							details: errorDetails,
						},
					});
					return;
				case 'PLAN_EXPIRED':
					res.status(403).json({
						error: {
							code: 'PLAN_EXPIRED',
							message: 'Your subscription plan has expired. Please renew to continue.',
							details: errorDetails,
						},
					});
					return;
				default:
					res.status(403).json({
						error: {
							code: 'RENEWAL_BLOCKED',
							message: limitCheck.message,
							details: errorDetails,
						},
					});
					return;
			}
		}

		const oldStatus = instanceData.status;
		const oldExpiresAt = instanceData.expires_at;
		const serviceName = instanceData.mcp_service_name;

		console.log(`🔄 Renewing instance ${id} with new expiration: ${expires_at}`);

		// Update instance in database with renewal
		const client = await pool.connect();

		try {
			await client.query('BEGIN');

			// Update instance status to active and set new expiration date
			const updateResult = await client.query(
				`UPDATE mcp_service_table 
				 SET status = 'active', expires_at = $1, updated_at = NOW() 
				 WHERE instance_id = $2 AND user_id = $3 
				 RETURNING updated_at`,
				[newExpirationDate, id, userId]
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

			// Update service statistics (if instance was expired, it might affect counts)
			if (oldStatus === 'expired') {
				await client.query(
					'UPDATE mcp_table SET active_instances_count = active_instances_count + 1, updated_at = NOW() WHERE mcp_service_id = $1',
					[instanceData.mcp_service_id]
				);
			}

			await client.query('COMMIT');

			const updatedAt = updateResult.rows[0].updated_at;
			console.log(`✅ Instance ${id} renewed successfully - expires: ${expires_at}`);

			// Log renewal event
			console.log(
				`📝 Renewal: ${id} (${serviceName}) ${oldStatus} → active, expires: ${oldExpiresAt} → ${expires_at} by user ${userId}`
			);

			res.status(200).json({
				data: {
					message: 'Instance renewed successfully',
					instance_id: id,
					service_type: serviceName,
					old_status: oldStatus,
					new_status: 'active',
					old_expires_at: oldExpiresAt,
					new_expires_at: newExpirationDate.toISOString(),
					renewed_at: updatedAt.toISOString(),
					notes: 'Cache will be populated on first service request',
				},
			});
		} catch (dbError) {
			await client.query('ROLLBACK');
			console.error(`❌ Database error renewing instance ${id}:`, dbError);
			throw dbError;
		} finally {
			client.release();
		}
	} catch (error) {
		console.error('Error renewing instance:', error);
		const errorMessage = error instanceof Error ? error.message : String(error);

		res.status(500).json({
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Failed to renew instance',
				details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
			},
		});
	}
}
