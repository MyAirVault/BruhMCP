/**
 * Database queries for MCP instances operations
 * @fileoverview Contains all database query functions for MCP instance management
 */

import { pool } from '../config.js';

/**
 * Get all MCP instances for a user
 * @param {string} userId - User ID
 * @param {Object} filters - Optional filters
 */
export async function getAllMCPInstances(userId, filters = {}) {
	let query = `
		SELECT 
			ms.instance_id,
			ms.user_id,
			ms.custom_name,
			ms.status,
			ms.oauth_status,
			ms.expires_at,
			ms.last_used_at,
			ms.usage_count,
			ms.renewed_count,
			ms.created_at,
			ms.updated_at,
			m.mcp_service_name,
			m.display_name,
			m.type,
			m.port,
			m.icon_url_path,
			c.oauth_completed_at,
			c.token_expires_at
		FROM mcp_service_table ms
		JOIN mcp_table m ON ms.mcp_service_id = m.mcp_service_id
		LEFT JOIN mcp_credentials c ON ms.instance_id = c.instance_id
		WHERE ms.user_id = $1 AND ms.oauth_status = 'completed'
	`;

	const params = [userId];
	let paramIndex = 2;

	if (filters.status) {
		query += ` AND ms.status = $${paramIndex}`;
		params.push(filters.status);
		paramIndex++;
	}

	if (filters.mcp_type) {
		query += ` AND m.mcp_service_name = $${paramIndex}`;
		params.push(filters.mcp_type);
		paramIndex++;
	}

	query += ` ORDER BY ms.created_at DESC`;

	if (filters.limit) {
		query += ` LIMIT $${paramIndex}`;
		params.push(filters.limit);
		paramIndex++;
	}

	const result = await pool.query(query, params);
	return result.rows;
}

/**
 * Get single MCP instance by ID
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object|null>} MCP instance record or null
 */
export async function getMCPInstanceById(instanceId, userId) {
	const query = `
		SELECT 
			ms.instance_id,
			ms.user_id,
			ms.custom_name,
			ms.status,
			ms.oauth_status,
			ms.expires_at,
			ms.last_used_at,
			ms.usage_count,
			ms.renewed_count,
			ms.created_at,
			ms.updated_at,
			m.mcp_service_name,
			m.display_name,
			m.type,
			m.port,
			m.icon_url_path,
			c.api_key,
			c.client_id,
			c.client_secret,
			c.access_token,
			c.refresh_token,
			c.token_expires_at,
			c.oauth_completed_at
		FROM mcp_service_table ms
		JOIN mcp_table m ON ms.mcp_service_id = m.mcp_service_id
		LEFT JOIN mcp_credentials c ON ms.instance_id = c.instance_id
		WHERE ms.instance_id = $1 AND ms.user_id = $2
	`;

	const result = await pool.query(query, [instanceId, userId]);
	return result.rows[0] || null;
}

/**
 * Update MCP instance
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>} Updated instance record or null
 */
export async function updateMCPInstance(instanceId, userId, updateData) {
	const setClauses = [];
	const params = [];
	let paramIndex = 1;

	if (updateData.custom_name !== undefined) {
		setClauses.push(`custom_name = $${paramIndex}`);
		params.push(updateData.custom_name);
		paramIndex++;
	}

	if (updateData.status !== undefined) {
		setClauses.push(`status = $${paramIndex}`);
		params.push(updateData.status);
		paramIndex++;
	}

	if (updateData.expires_at !== undefined) {
		setClauses.push(`expires_at = $${paramIndex}`);
		params.push(updateData.expires_at);
		paramIndex++;
	}

	if (updateData.api_key !== undefined) {
		setClauses.push(`api_key = $${paramIndex}`);
		params.push(updateData.api_key);
		paramIndex++;
	}

	if (updateData.client_id !== undefined) {
		setClauses.push(`client_id = $${paramIndex}`);
		params.push(updateData.client_id);
		paramIndex++;
	}

	if (updateData.client_secret !== undefined) {
		setClauses.push(`client_secret = $${paramIndex}`);
		params.push(updateData.client_secret);
		paramIndex++;
	}

	if (setClauses.length === 0) {
		throw new Error('No update data provided');
	}

	setClauses.push(`updated_at = NOW()`);

	// Add WHERE clause parameters
	params.push(instanceId);
	const instanceIdParam = paramIndex;
	paramIndex++;

	params.push(userId);
	const userIdParam = paramIndex;

	const query = `
		UPDATE mcp_service_table 
		SET ${setClauses.join(', ')}
		WHERE instance_id = $${instanceIdParam} AND user_id = $${userIdParam}
		RETURNING *
	`;

	const result = await pool.query(query, params);
	return result.rows[0] || null;
}

/**
 * Delete MCP instance
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<boolean>} Success status
 */
export async function deleteMCPInstance(instanceId, userId) {
	const query = `
		DELETE FROM mcp_service_table 
		WHERE instance_id = $1 AND user_id = $2
	`;

	const result = await pool.query(query, [instanceId, userId]);
	return result.rowCount > 0;
}

/**
 * Toggle MCP instance status
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @param {boolean} isActive - New active status
 * @returns {Promise<Object|null>} Updated instance record or null
 */
export async function toggleMCPInstance(instanceId, userId, isActive) {
	const status = isActive ? 'active' : 'inactive';
	return updateMCPInstance(instanceId, userId, { status });
}

/**
 * Renew MCP instance
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @param {Date} newExpirationDate - New expiration date
 * @returns {Promise<Object|null>} Updated instance record or null
 */
export async function renewMCPInstance(instanceId, userId, newExpirationDate) {
	const query = `
		UPDATE mcp_service_table 
		SET 
			status = 'active',
			expires_at = $1,
			renewed_count = renewed_count + 1,
			last_renewed_at = NOW(),
			updated_at = NOW()
		WHERE instance_id = $2 AND user_id = $3
		RETURNING *
	`;

	const result = await pool.query(query, [newExpirationDate, instanceId, userId]);
	return result.rows[0] || null;
}

/**
 * Update instance status only
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @param {string} status - New status (active, inactive, expired)
 * @returns {Promise<Object|null>} Updated instance record or null
 */
export async function updateInstanceStatus(instanceId, userId, status) {
	const query = `
		UPDATE mcp_service_table 
		SET status = $1, updated_at = NOW() 
		WHERE instance_id = $2 AND user_id = $3 
		RETURNING instance_id, status, updated_at
	`;

	const result = await pool.query(query, [status, instanceId, userId]);
	return result.rows[0] || null;
}

/**
 * Update instance expiration and activate
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @param {string} newExpirationDate - New expiration date
 * @returns {Promise<Object|null>} Updated instance record or null
 */
export async function renewInstanceExpiration(instanceId, userId, newExpirationDate) {
	const query = `
		UPDATE mcp_service_table 
		SET expires_at = $1, status = 'active', updated_at = NOW() 
		WHERE instance_id = $2 AND user_id = $3 
		RETURNING instance_id, status, expires_at, updated_at
	`;

	const result = await pool.query(query, [newExpirationDate, instanceId, userId]);
	return result.rows[0] || null;
}

/**
 * Get instances by status (for background maintenance)
 * @param {string} status - Status to filter by
 * @returns {Promise<Array>} Array of instances with the specified status
 */
export async function getInstancesByStatus(status) {
	const query = `
		SELECT 
			ms.instance_id,
			ms.user_id,
			ms.status,
			ms.expires_at,
			ms.updated_at,
			m.mcp_service_name
		FROM mcp_service_table ms
		JOIN mcp_table m ON ms.mcp_service_id = m.mcp_service_id
		WHERE ms.status = $1
		ORDER BY ms.updated_at DESC
	`;

	const result = await pool.query(query, [status]);
	return result.rows;
}

/**
 * Get expired instances (for background cleanup)
 * @returns {Promise<Array>} Array of expired instances
 */
export async function getExpiredInstances() {
	const query = `
		SELECT 
			ms.instance_id,
			ms.user_id,
			ms.status,
			ms.expires_at,
			ms.updated_at,
			m.mcp_service_name
		FROM mcp_service_table ms
		JOIN mcp_table m ON ms.mcp_service_id = m.mcp_service_id
		WHERE ms.expires_at < NOW() AND ms.status != 'expired'
		ORDER BY ms.expires_at ASC
	`;

	const result = await pool.query(query);
	return result.rows;
}

/**
 * Get failed OAuth instances (for background cleanup)
 * @returns {Promise<Array>} Array of instances with failed OAuth status
 */
export async function getFailedOAuthInstances() {
	const query = `
		SELECT 
			ms.instance_id,
			ms.user_id,
			ms.status,
			ms.oauth_status,
			ms.updated_at,
			m.mcp_service_name
		FROM mcp_service_table ms
		JOIN mcp_table m ON ms.mcp_service_id = m.mcp_service_id
		WHERE ms.oauth_status = 'failed'
		ORDER BY ms.updated_at ASC
	`;

	const result = await pool.query(query);
	return result.rows;
}

/**
 * Get pending OAuth instances older than specified minutes (for background cleanup)
 * @param {number} minutesOld - Minutes threshold (default: 5)
 * @returns {Promise<Array>} Array of instances with pending OAuth status older than threshold
 */
export async function getPendingOAuthInstances(minutesOld = 5) {
	const query = `
		SELECT 
			ms.instance_id,
			ms.user_id,
			ms.status,
			ms.oauth_status,
			ms.updated_at,
			ms.created_at,
			m.mcp_service_name
		FROM mcp_service_table ms
		JOIN mcp_table m ON ms.mcp_service_id = m.mcp_service_id
		WHERE ms.oauth_status = 'pending' 
			AND ms.updated_at < NOW() - INTERVAL '${minutesOld} minutes'
		ORDER BY ms.updated_at ASC
	`;

	const result = await pool.query(query);
	return result.rows;
}

/**
 * Bulk update expired instances to expired status
 * @param {Array<string>} instanceIds - Array of instance IDs to mark as expired
 * @returns {Promise<number>} Number of instances updated
 */
export async function bulkMarkInstancesExpired(instanceIds) {
	if (instanceIds.length === 0) return 0;

	const placeholders = instanceIds.map((_, index) => `$${index + 1}`).join(',');
	const query = `
		UPDATE mcp_service_table 
		SET status = 'expired', updated_at = NOW() 
		WHERE instance_id IN (${placeholders})
	`;

	const result = await pool.query(query, instanceIds);
	return result.rowCount;
}

/**
 * Get user instance count by status (only counts completed OAuth instances)
 * @param {string} userId - User ID
 * @param {string} [status] - Optional status filter (if not provided, counts active instances only)
 * @returns {Promise<number>} Number of instances with completed OAuth
 */
export async function getUserInstanceCount(userId, status = null) {
	let query = `
		SELECT COUNT(*) as count 
		FROM mcp_service_table ms
		JOIN mcp_table m ON ms.mcp_service_id = m.mcp_service_id
		WHERE ms.user_id = $1 AND ms.oauth_status = 'completed'
	`;
	const params = [userId];

	if (status) {
		query += ' AND ms.status = $2';
		params.push(status);
	} else {
		// Default: only count active instances with completed OAuth for plan limit checking
		query += ' AND ms.status = $2';
		params.push('active');
	}

	const result = await pool.query(query, params);
	return parseInt(result.rows[0].count);
}

/**
 * Create new MCP instance with transaction support
 * @param {Object} instanceData - Instance data
 * @param {string} instanceData.userId - User ID
 * @param {string} instanceData.mcpServiceId - MCP service ID
 * @param {string} instanceData.customName - Custom instance name
 * @param {string} [instanceData.apiKey] - API key for api_key type services
 * @param {string} [instanceData.clientId] - Client ID for oauth type services
 * @param {string} [instanceData.clientSecret] - Client secret for oauth type services
 * @param {Date} [instanceData.expiresAt] - Expiration date
 * @returns {Promise<Object>} Created instance record
 */
export async function createMCPInstance(instanceData) {
	const { userId, mcpServiceId, customName, apiKey, clientId, clientSecret, expiresAt, serviceType } = instanceData;

	const client = await pool.connect();
	try {
		await client.query('BEGIN');

		// Set oauth_status based on service type and credentials
		// For API key services, only mark as completed if we have an API key
		const oauthStatus = serviceType === 'oauth' ? 'pending' : apiKey ? 'completed' : 'pending';

		// Create MCP instance
		const instanceQuery = `
			INSERT INTO mcp_service_table (
				user_id,
				mcp_service_id,
				custom_name,
				status,
				oauth_status,
				expires_at,
				credentials_updated_at
			) VALUES ($1, $2, $3, 'active', $4, $5, NOW())
			RETURNING *
		`;

		const instanceParams = [userId, mcpServiceId, customName, oauthStatus, expiresAt];
		const instanceResult = await client.query(instanceQuery, instanceParams);
		const createdInstance = instanceResult.rows[0];

		// Create credentials record
		const credentialsQuery = `
			INSERT INTO mcp_credentials (
				instance_id,
				api_key,
				client_id,
				client_secret,
				oauth_status,
				oauth_completed_at
			) VALUES ($1, $2, $3, $4, $5, $6)
			RETURNING *
		`;

		// Only set oauth_completed_at for API key services when we actually have an API key
		const oauthCompletedAt = serviceType === 'api_key' && apiKey ? new Date() : null;
		const credentialsParams = [
			createdInstance.instance_id,
			apiKey,
			clientId,
			clientSecret,
			oauthStatus,
			oauthCompletedAt,
		];

		await client.query(credentialsQuery, credentialsParams);

		console.log(`✅ MCP instance created successfully: ${createdInstance.instance_id} (${serviceType})`);

		await client.query('COMMIT');
		return createdInstance;
	} catch (error) {
		await client.query('ROLLBACK');
		throw error;
	} finally {
		client.release();
	}
}

/**
 * Create MCP instance with atomic plan limit checking
 * @param {Object} instanceData - Instance data
 * @param {string} instanceData.userId - User ID
 * @param {string} instanceData.mcpServiceId - MCP service ID
 * @param {string} instanceData.customName - Custom instance name
 * @param {string} [instanceData.apiKey] - API key for api_key type services
 * @param {string} [instanceData.clientId] - Client ID for oauth type services
 * @param {string} [instanceData.clientSecret] - Client secret for oauth type services
 * @param {Date} [instanceData.expiresAt] - Expiration date
 * @param {string} instanceData.serviceType - Service type ('api_key' or 'oauth')
 * @param {number|null} maxInstances - Maximum allowed active instances (null = unlimited)
 * @returns {Promise<Object>} Created instance record or error
 */
export async function createMCPInstanceWithLimitCheck(instanceData, maxInstances) {
	const { userId, mcpServiceId, customName, apiKey, clientId, clientSecret, expiresAt, serviceType } = instanceData;

	const client = await pool.connect();
	try {
		await client.query('BEGIN');

		// Check current active instance count with row-level locking to prevent race conditions
		// Note: We count instances that are both 'active' status AND have 'completed' oauth_status
		// This ensures consistency with getUserInstanceCount() function
		// First, lock the relevant rows to prevent race conditions
		const lockQuery = `
			SELECT ms.mcp_service_id
			FROM mcp_service_table ms
			JOIN mcp_table m ON ms.mcp_service_id = m.mcp_service_id
			WHERE ms.user_id = $1 AND ms.status = 'active' AND ms.oauth_status = 'completed'
			FOR UPDATE
		`;
		await client.query(lockQuery, [userId]);
		
		// Then count the instances (without FOR UPDATE since we already have the lock)
		const countQuery = `
			SELECT COUNT(*) as count 
			FROM mcp_service_table ms
			JOIN mcp_table m ON ms.mcp_service_id = m.mcp_service_id
			WHERE ms.user_id = $1 AND ms.status = 'active' AND ms.oauth_status = 'completed'
		`;
		const countResult = await client.query(countQuery, [userId]);
		const currentActiveInstances = parseInt(countResult.rows[0].count);

		// Check plan limit (null means unlimited for pro plans)
		if (maxInstances !== null && currentActiveInstances >= maxInstances) {
			await client.query('ROLLBACK');
			return {
				success: false,
				reason: 'ACTIVE_LIMIT_REACHED',
				message: `You have reached your plan limit of ${maxInstances} active instance${maxInstances > 1 ? 's' : ''}. Deactivate or delete an existing instance to create a new one.`,
				currentCount: currentActiveInstances,
				maxInstances
			};
		}

		// Set oauth_status based on service type and credentials
		const oauthStatus = serviceType === 'oauth' ? 'pending' : (apiKey ? 'completed' : 'pending');

		// Create MCP instance
		const instanceQuery = `
			INSERT INTO mcp_service_table (
				user_id,
				mcp_service_id,
				custom_name,
				status,
				oauth_status,
				expires_at,
				credentials_updated_at
			) VALUES ($1, $2, $3, 'active', $4, $5, NOW())
			RETURNING *
		`;

		const instanceParams = [userId, mcpServiceId, customName, oauthStatus, expiresAt];
		const instanceResult = await client.query(instanceQuery, instanceParams);
		const createdInstance = instanceResult.rows[0];

		// Create credentials record
		const credentialsQuery = `
			INSERT INTO mcp_credentials (
				instance_id,
				api_key,
				client_id,
				client_secret,
				oauth_status,
				oauth_completed_at
			) VALUES ($1, $2, $3, $4, $5, $6)
			RETURNING *
		`;

		// Only set oauth_completed_at for API key services when we actually have an API key
		const oauthCompletedAt = (serviceType === 'api_key' && apiKey) ? new Date() : null;
		const credentialsParams = [
			createdInstance.instance_id,
			apiKey,
			clientId,
			clientSecret,
			oauthStatus,
			oauthCompletedAt,
		];

		await client.query(credentialsQuery, credentialsParams);

		console.log(`✅ MCP instance created successfully with atomic limit check: ${createdInstance.instance_id} (${serviceType})`);

		await client.query('COMMIT');
		return {
			success: true,
			instance: createdInstance
		};
	} catch (error) {
		await client.query('ROLLBACK');
		console.error('❌ Atomic instance creation failed:', error);
		return {
			success: false,
			reason: 'DATABASE_ERROR',
			message: 'Failed to create instance due to database error',
			error: error.message
		};
	} finally {
		client.release();
	}
}

/**
 * Update OAuth status and tokens for an instance
 * @param {string} instanceId - Instance ID
 * @param {Object} oauthData - OAuth data
 * @param {string} oauthData.status - OAuth status ('completed', 'failed', 'expired')
 * @param {string} [oauthData.accessToken] - Access token
 * @param {string} [oauthData.refreshToken] - Refresh token
 * @param {Date} [oauthData.tokenExpiresAt] - Token expiration date
 * @param {string} [oauthData.scope] - OAuth scope
 * @returns {Promise<Object>} Updated instance record
 */
export async function updateOAuthStatus(instanceId, oauthData) {
	const { status, accessToken, refreshToken, tokenExpiresAt, scope } = oauthData;

	const client = await pool.connect();
	try {
		await client.query('BEGIN');

		// Update credentials table
		const credentialsQuery = `
			UPDATE mcp_credentials SET
				oauth_status = $1,
				oauth_completed_at = $2,
				access_token = $3,
				refresh_token = $4,
				token_expires_at = $5,
				token_scope = $6,
				updated_at = NOW()
			WHERE instance_id = $7
			RETURNING *
		`;

		const completedAt = ['completed', 'failed', 'expired'].includes(status) ? new Date() : null;
		const credentialsParams = [status, completedAt, accessToken, refreshToken, tokenExpiresAt, scope, instanceId];

		const updateResult = await client.query(credentialsQuery, credentialsParams);

		// If no rows were updated, the credentials record doesn't exist
		// This should not happen for properly created OAuth instances
		if (updateResult.rowCount === 0) {
			await client.query('ROLLBACK');
			console.error(
				`Credentials record not found for instance ${instanceId}. This indicates a data integrity issue.`
			);
			throw new Error(`Authentication failed: Missing credentials for instance ${instanceId}`);
		}

		// Update mcp_service_table oauth_status for quick filtering
		const instanceQuery = `
			UPDATE mcp_service_table SET
				oauth_status = $1,
				updated_at = NOW()
			WHERE instance_id = $2
			RETURNING *
		`;

		const instanceResult = await client.query(instanceQuery, [status, instanceId]);

		await client.query('COMMIT');
		return instanceResult.rows[0];
	} catch (error) {
		await client.query('ROLLBACK');
		throw error;
	} finally {
		client.release();
	}
}

/**
 * Update OAuth status and tokens with optimistic locking
 * @param {string} instanceId - Instance ID
 * @param {Object} oauthData - OAuth data
 * @param {string} oauthData.status - OAuth status ('completed', 'failed', 'expired')
 * @param {string} [oauthData.accessToken] - Access token
 * @param {string} [oauthData.refreshToken] - Refresh token
 * @param {Date} [oauthData.tokenExpiresAt] - Token expiration date
 * @param {string} [oauthData.scope] - OAuth scope
 * @param {number} [oauthData.expectedVersion] - Expected version for optimistic locking
 * @param {number} [maxRetries] - Maximum retry attempts (default: 3)
 * @returns {Promise<Object>} Updated instance record
 */
export async function updateOAuthStatusWithLocking(instanceId, oauthData, maxRetries = 3) {
	const { status, accessToken, refreshToken, tokenExpiresAt, scope, expectedVersion } = oauthData;

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		const client = await pool.connect();
		try {
			await client.query('BEGIN');

			// Get current version if not provided
			let currentVersion = expectedVersion;
			if (currentVersion === undefined) {
				const versionQuery = `
					SELECT version FROM mcp_credentials WHERE instance_id = $1
				`;
				const versionResult = await client.query(versionQuery, [instanceId]);

				if (versionResult.rows.length === 0) {
					await client.query('ROLLBACK');
					throw new Error(`Instance ${instanceId} not found`);
				}

				currentVersion = versionResult.rows[0].version;
			}

			// Update credentials table with version check
			const credentialsQuery = `
				UPDATE mcp_credentials SET
					oauth_status = $1,
					oauth_completed_at = $2,
					access_token = $3,
					refresh_token = $4,
					token_expires_at = $5,
					token_scope = $6,
					updated_at = NOW()
				WHERE instance_id = $7 AND version = $8
				RETURNING *
			`;

			const completedAt = ['completed', 'failed', 'expired'].includes(status) ? new Date() : null;
			const credentialsParams = [
				status,
				completedAt,
				accessToken,
				refreshToken,
				tokenExpiresAt,
				scope,
				instanceId,
				currentVersion,
			];

			const credentialsResult = await client.query(credentialsQuery, credentialsParams);

			// Check if update was successful (row was found and updated)
			if (credentialsResult.rows.length === 0) {
				await client.query('ROLLBACK');

				if (attempt < maxRetries) {
					console.log(
						`🔄 Optimistic locking conflict for instance ${instanceId}, retrying (attempt ${attempt}/${maxRetries})`
					);
					client.release();

					// Exponential backoff
					const delay = Math.pow(2, attempt - 1) * 100;
					await new Promise(resolve => setTimeout(resolve, delay));
					continue;
				} else {
					throw new Error(
						`Optimistic locking failed after ${maxRetries} attempts for instance ${instanceId}`
					);
				}
			}

			// Update mcp_service_table oauth_status for quick filtering
			const instanceQuery = `
				UPDATE mcp_service_table SET
					oauth_status = $1,
					updated_at = NOW()
				WHERE instance_id = $2
				RETURNING *
			`;

			const instanceResult = await client.query(instanceQuery, [status, instanceId]);

			await client.query('COMMIT');

			const result = instanceResult.rows[0] || {};
			result.credentialsVersion = credentialsResult.rows[0].version;

			console.log(
				`✅ OAuth status updated with optimistic locking for instance ${instanceId} (version: ${result.credentialsVersion})`
			);
			return result;
		} catch (error) {
			await client.query('ROLLBACK');

			// Don't retry on non-concurrency errors
			if (!error.message.includes('Optimistic locking failed')) {
				throw error;
			}

			if (attempt === maxRetries) {
				throw error;
			}
		} finally {
			client.release();
		}
	}
}

/**
 * Update MCP service statistics (increment counters)
 * @param {string} serviceId - Service ID
 * @param {Object} updates - Statistics updates
 * @param {number} [updates.activeInstancesIncrement] - Increment active instances by this amount
 * @returns {Promise<Object|null>} Updated service record
 */
export async function updateMCPServiceStats(serviceId, updates) {
	const setClauses = [];
	const params = [];
	let paramIndex = 1;

	if (updates.activeInstancesIncrement !== undefined) {
		setClauses.push(`active_instances_count = active_instances_count + $${paramIndex}`);
		params.push(updates.activeInstancesIncrement);
		paramIndex++;
	}

	if (setClauses.length === 0) {
		throw new Error('No statistics updates provided');
	}

	setClauses.push(`updated_at = NOW()`);
	params.push(serviceId);

	const query = `
		UPDATE mcp_table 
		SET ${setClauses.join(', ')}
		WHERE mcp_service_id = $${paramIndex}
		RETURNING *
	`;

	const result = await pool.query(query, params);
	return result.rows[0] || null;
}

/**
 * Create audit log entry for token operations
 * @param {Object} auditData - Audit data
 * @param {string} auditData.instanceId - Instance ID
 * @param {string} auditData.operation - Operation type (refresh, revoke, validate, etc.)
 * @param {string} auditData.status - Operation status (success, failure, pending)
 * @param {string} [auditData.method] - Method used (oauth_service, direct_oauth)
 * @param {string} [auditData.errorType] - Error type if failed
 * @param {string} [auditData.errorMessage] - Error message if failed
 * @param {Object} [auditData.metadata] - Additional metadata
 * @param {string} [auditData.userId] - User ID (optional)
 * @returns {Promise<Object>} Created audit log entry
 */
export async function createTokenAuditLog(auditData) {
	const { instanceId, operation, status, method, errorType, errorMessage, metadata, userId } = auditData;

	// Validate required fields
	if (!instanceId || !operation || !status) {
		throw new Error('Instance ID, operation, and status are required for audit log');
	}

	const query = `
		INSERT INTO token_audit_log (
			instance_id,
			user_id,
			operation,
			status,
			method,
			error_type,
			error_message,
			metadata,
			created_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
		RETURNING *
	`;

	const params = [
		instanceId,
		userId || null,
		operation,
		status,
		method || null,
		errorType || null,
		errorMessage || null,
		metadata ? JSON.stringify(metadata) : null,
	];

	try {
		const result = await pool.query(query, params);
		return result.rows[0];
	} catch (error) {
		// If audit table doesn't exist, log error but don't fail the operation
		if (error.code === '42P01') {
			// relation does not exist
			console.warn('⚠️  Token audit table does not exist. Skipping audit log.');
			return null;
		}
		throw error;
	}
}

/**
 * Get audit logs for an instance
 * @param {string} instanceId - Instance ID
 * @param {Object} options - Query options
 * @param {number} [options.limit] - Limit number of results (default: 50)
 * @param {number} [options.offset] - Offset for pagination (default: 0)
 * @param {string} [options.operation] - Filter by operation type
 * @param {string} [options.status] - Filter by status
 * @param {Date} [options.since] - Get logs since this date
 * @returns {Promise<Array>} Array of audit log entries
 */
export async function getTokenAuditLogs(instanceId, options = {}) {
	const { limit = 50, offset = 0, operation, status, since } = options;

	let query = `
		SELECT 
			audit_id,
			instance_id,
			user_id,
			operation,
			status,
			method,
			error_type,
			error_message,
			metadata,
			created_at
		FROM token_audit_log
		WHERE instance_id = $1
	`;

	const params = [instanceId];
	let paramIndex = 2;

	// Add filters
	if (operation) {
		query += ` AND operation = $${paramIndex}`;
		params.push(operation);
		paramIndex++;
	}

	if (status) {
		query += ` AND status = $${paramIndex}`;
		params.push(status);
		paramIndex++;
	}

	if (since) {
		query += ` AND created_at >= $${paramIndex}`;
		params.push(since);
		paramIndex++;
	}

	// Order and pagination
	query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
	params.push(limit, offset);

	try {
		const result = await pool.query(query, params);

		// Parse metadata JSON
		return result.rows.map(row => ({
			...row,
			metadata: row.metadata ? JSON.parse(row.metadata) : null,
		}));
	} catch (error) {
		// If audit table doesn't exist, return empty array
		if (error.code === '42P01') {
			console.warn('⚠️  Token audit table does not exist. Returning empty audit log.');
			return [];
		}
		throw error;
	}
}

/**
 * Get audit log statistics
 * @param {string} [instanceId] - Instance ID (optional, for all instances if not provided)
 * @param {number} [days] - Number of days to include (default: 30)
 * @returns {Promise<Object>} Audit statistics
 */
export async function getTokenAuditStats(instanceId, days = 30) {
	const cutoffDate = new Date();
	cutoffDate.setDate(cutoffDate.getDate() - days);

	let query = `
		SELECT 
			operation,
			status,
			method,
			error_type,
			COUNT(*) as count,
			DATE(created_at) as date
		FROM token_audit_log
		WHERE created_at >= $1
	`;

	const params = [cutoffDate];
	let paramIndex = 2;

	if (instanceId) {
		query += ` AND instance_id = $${paramIndex}`;
		params.push(instanceId);
		paramIndex++;
	}

	query += `
		GROUP BY operation, status, method, error_type, DATE(created_at)
		ORDER BY date DESC, operation, status
	`;

	try {
		const result = await pool.query(query, params);

		// Aggregate statistics
		const stats = {
			totalOperations: 0,
			operationsByType: {},
			operationsByStatus: {},
			operationsByMethod: {},
			errorsByType: {},
			dailyBreakdown: {},
		};

		result.rows.forEach(row => {
			const count = parseInt(row.count);
			stats.totalOperations += count;

			// By operation type
			if (!stats.operationsByType[row.operation]) {
				stats.operationsByType[row.operation] = 0;
			}
			stats.operationsByType[row.operation] += count;

			// By status
			if (!stats.operationsByStatus[row.status]) {
				stats.operationsByStatus[row.status] = 0;
			}
			stats.operationsByStatus[row.status] += count;

			// By method
			if (row.method) {
				if (!stats.operationsByMethod[row.method]) {
					stats.operationsByMethod[row.method] = 0;
				}
				stats.operationsByMethod[row.method] += count;
			}

			// By error type
			if (row.error_type) {
				if (!stats.errorsByType[row.error_type]) {
					stats.errorsByType[row.error_type] = 0;
				}
				stats.errorsByType[row.error_type] += count;
			}

			// Daily breakdown
			const dateStr = row.date;
			if (!stats.dailyBreakdown[dateStr]) {
				stats.dailyBreakdown[dateStr] = {
					total: 0,
					success: 0,
					failure: 0,
				};
			}
			stats.dailyBreakdown[dateStr].total += count;

			if (row.status === 'success') {
				stats.dailyBreakdown[dateStr].success += count;
			} else if (row.status === 'failure') {
				stats.dailyBreakdown[dateStr].failure += count;
			}
		});

		return stats;
	} catch (error) {
		// If audit table doesn't exist, return empty stats
		if (error.code === '42P01') {
			console.warn('⚠️  Token audit table does not exist. Returning empty stats.');
			return {
				totalOperations: 0,
				operationsByType: {},
				operationsByStatus: {},
				operationsByMethod: {},
				errorsByType: {},
				dailyBreakdown: {},
			};
		}
		throw error;
	}
}

/**
 * Clean up old audit logs
 * @param {number} daysToKeep - Number of days to keep (default: 90)
 * @returns {Promise<number>} Number of deleted records
 */
export async function cleanupTokenAuditLogs(daysToKeep = 90) {
	const cutoffDate = new Date();
	cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

	const query = `
		DELETE FROM token_audit_log
		WHERE created_at < $1
	`;

	try {
		const result = await pool.query(query, [cutoffDate]);
		console.log(`🗑️  Cleaned up ${result.rowCount} old audit log entries`);
		return result.rowCount;
	} catch (error) {
		// If audit table doesn't exist, return 0
		if (error.code === '42P01') {
			console.warn('⚠️  Token audit table does not exist. Nothing to clean up.');
			return 0;
		}
		throw error;
	}
}
