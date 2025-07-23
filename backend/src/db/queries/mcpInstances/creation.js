/**
 * Instance creation operations for MCP instances
 * @fileoverview Contains functions for creating new MCP instances with transaction support
 */

import { pool } from '../../config.js';
import './types.js';

/**
 * Create new MCP instance with transaction support
 * @param {MCPInstanceCreateData} instanceData - Instance data
 * @returns {Promise<MCPInstanceRecord>} Created instance record
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
 * @param {MCPInstanceCreateData} instanceData - Instance data
 * @param {number|null} maxInstances - Maximum allowed active instances (null = unlimited)
 * @returns {Promise<CreateInstanceResult>} Created instance record or error
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
			error: error instanceof Error ? error.message : String(error)
		};
	} finally {
		client.release();
	}
}