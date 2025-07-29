/**
 * OAuth management operations for MCP instances
 * @fileoverview Contains functions for managing OAuth status and tokens
 */

const { pool } = require('../../config.js');

/**
 * @typedef {import('./types.js').OAuthUpdateData} OAuthUpdateData
 * @typedef {import('./types.js').MCPInstanceRecord} MCPInstanceRecord
 */

/**
 * Update OAuth status and tokens for an instance
 * @param {string} instanceId - Instance ID
 * @param {OAuthUpdateData} oauthData - OAuth data
 * @returns {Promise<MCPInstanceRecord>} Updated instance record
 */
async function updateOAuthStatus(instanceId, oauthData) {
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
		console.log(`📝 Updated credentials table for instance ${instanceId}: ${updateResult.rowCount} rows affected`);

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
		console.log(`📝 Updated mcp_service_table for instance ${instanceId}: ${instanceResult.rowCount} rows affected, oauth_status = ${status}`);

		await client.query('COMMIT');
		console.log(`✅ Transaction committed for instance ${instanceId}`);
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
 * @param {OAuthUpdateData} oauthData - OAuth data
 * @param {number} [maxRetries=3] - Maximum retry attempts (default: 3)
 * @returns {Promise<MCPInstanceRecord>} Updated instance record
 */
async function updateOAuthStatusWithLocking(instanceId, oauthData, maxRetries = 3) {
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
			if (!(error instanceof Error) || !error.message.includes('Optimistic locking failed')) {
				throw error;
			}

			if (attempt === maxRetries) {
				throw error;
			}
		} finally {
			client.release();
		}
	}
	
	// This should never be reached due to error throwing above
	throw new Error(`Failed to update OAuth status after ${maxRetries} attempts`);
}

module.exports = {
	updateOAuthStatus,
	updateOAuthStatusWithLocking
};