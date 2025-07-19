import { getMCPInstanceById } from '../../../db/queries/mcpInstancesQueries.js';
import { checkInstanceLimit } from '../../../utils/planLimits.js';
import { pool } from '../../../db/config.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * Renew expired MCP instance with new expiration date
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function renewInstance(req, res) {
	try {
		const userId = req.user?.id;
		if (!userId) {
			return res.status(401).json({
				error: {
					code: 'UNAUTHORIZED',
					message: 'User authentication required',
				},
			});
		}

		const { id } = req.params;
		const { expires_at } = req.body;

		// Validate request parameters
		if (!id) {
			return res.status(400).json({
				error: {
					code: 'MISSING_PARAMETER',
					message: 'Instance ID is required',
				},
			});
		}

		if (!expires_at) {
			return res.status(400).json({
				error: {
					code: 'MISSING_PARAMETER',
					message: 'New expiration date (expires_at) is required',
				},
			});
		}

		// Validate expiration date format and value
		const newExpirationDate = new Date(expires_at);
		const now = new Date();

		if (isNaN(newExpirationDate.getTime())) {
			return res.status(400).json({
				error: {
					code: 'INVALID_DATE_FORMAT',
					message: 'Invalid expiration date format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)',
				},
			});
		}

		if (newExpirationDate <= now) {
			return res.status(400).json({
				error: {
					code: 'INVALID_EXPIRATION_DATE',
					message: 'Expiration date must be in the future',
				},
			});
		}

		// Validate expiration date is not too far in the future (max 2 years)
		const maxFutureDate = new Date();
		maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 2);

		if (newExpirationDate > maxFutureDate) {
			return res.status(400).json({
				error: {
					code: 'EXPIRATION_TOO_FAR',
					message: 'Expiration date cannot be more than 2 years in the future',
				},
			});
		}

		// Get current instance details
		const instance = await getMCPInstanceById(id, userId);
		if (!instance) {
			return res.status(404).json({
				error: {
					code: 'NOT_FOUND',
					message: 'MCP instance not found',
				},
			});
		}

		// Check if instance is expired (only expired instances can be renewed)
		const isExpiredByStatus = instance.status === 'expired';
		const isExpiredByTime = instance.expires_at && new Date(instance.expires_at) < now;

		if (!isExpiredByStatus && !isExpiredByTime) {
			return res.status(403).json({
				error: {
					code: 'INSTANCE_NOT_EXPIRED',
					message: 'Only expired instances can be renewed',
					current_status: instance.status,
					expires_at: instance.expires_at,
				},
			});
		}

		// Check plan limits before allowing renewal (for free plan users)
		const limitCheck = await checkInstanceLimit(userId);
		
		// Special case: If user is at their limit but this is a renewal of an expired instance,
		// we need to allow it since the expired instance doesn't count toward the active limit
		if (!limitCheck.canCreate && limitCheck.reason === 'LIMIT_REACHED') {
			// For renewal, we temporarily don't count this expired instance toward the limit
			// The database logic should handle this correctly since expired instances 
			// shouldn't count toward active_instances_count
			console.log(`ℹ️ Allowing renewal of expired instance ${id} for user ${userId} (${limitCheck.details.plan} plan)`);
		} else if (!limitCheck.canCreate) {
			// Other limit check failures (no plan, expired plan, etc.)
			const errorDetails = {
				userId,
				instanceId: id,
				reason: limitCheck.reason,
				plan: limitCheck.details.plan,
				metadata: limitCheck.details
			};

			switch (limitCheck.reason) {
				case 'NO_PLAN':
					return res.status(403).json({
						error: {
							code: 'NO_PLAN',
							message: 'No subscription plan found. Please contact support.',
							details: errorDetails
						}
					});
				case 'PLAN_EXPIRED':
					return res.status(403).json({
						error: {
							code: 'PLAN_EXPIRED',
							message: 'Your subscription plan has expired. Please renew to continue.',
							details: errorDetails
						}
					});
				default:
					return res.status(403).json({
						error: {
							code: 'RENEWAL_BLOCKED',
							message: limitCheck.message,
							details: errorDetails
						}
					});
			}
		}

		const oldStatus = instance.status;
		const oldExpiresAt = instance.expires_at;
		const serviceName = instance.mcp_service_name;

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
				return res.status(404).json({
					error: {
						code: 'NOT_FOUND',
						message: 'Instance not found or access denied',
					},
				});
			}

			// Update service statistics (if instance was expired, it might affect counts)
			if (oldStatus === 'expired') {
				await client.query(
					'UPDATE mcp_table SET active_instances_count = active_instances_count + 1, updated_at = NOW() WHERE mcp_service_id = $1',
					[instance.mcp_service_id]
				);
			}

			await client.query('COMMIT');

			const updatedAt = updateResult.rows[0].updated_at;
			console.log(`✅ Instance ${id} renewed successfully - expires: ${expires_at}`);

			// Log renewal event
			console.log(`📝 Renewal: ${id} (${serviceName}) ${oldStatus} → active, expires: ${oldExpiresAt} → ${expires_at} by user ${userId}`);

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