import { getMCPInstanceById } from '../../../db/queries/mcpInstances/index.js';
import { validateCredentialsWithFormat } from '../../../services/instanceCredentialValidationService.js';
import { invalidateInstanceCache } from '../../../services/cacheInvalidationService.js';
import { pool } from '../../../db/config.js';
import loggingService from '../../../services/logging/loggingService.js';

/** @typedef {import('express').Request & {user?: {id: string}}} Request */
/** @typedef {import('express').Response} Response */

/** @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether validation passed
 * @property {string} [error] - Error message if validation failed
 * @property {string} [errorCode] - Error code if validation failed
 * @property {Object} [details] - Additional validation details
 * @property {string} [testEndpoint] - Test endpoint used for validation
 * @property {Object} [userInfo] - User information from validation
 * @property {string} [validatedAt] - Validation timestamp
 */

/** @typedef {Object} MCPInstance
 * @property {string} mcp_service_name - Service name
 * @property {string} api_key - Current API key
 * @property {string} updated_at - Last update timestamp
 * @property {string} instance_id - Instance ID
 */

/** @typedef {Object} DatabaseUpdateResult
 * @property {number} rowCount - Number of affected rows
 * @property {any[]} rows - Result rows
 */

/** @typedef {Object} UserInfo
 * @property {string} [email] - User email
 * @property {string} [handle] - User handle
 * @property {string} [service] - Service name
 * @property {any[]} [permissions] - User permissions
 * @property {string} [user_id] - User ID
 */

/**
 * Update MCP instance credentials with validation
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function updateInstanceCredentials(req, res) {
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
		const credentials = req.body;

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

		if (!credentials || typeof credentials !== 'object') {
			res.status(400).json({
				error: {
					code: 'INVALID_CREDENTIALS',
					message: 'Credentials must be a valid object',
				},
			});
			return;
		}

		// Get current instance details
		/** @type {MCPInstance} */
		const instance = /** @type {any} */ (await getMCPInstanceById(id, userId));
		if (!instance) {
			res.status(404).json({
				error: {
					code: 'NOT_FOUND',
					message: 'MCP instance not found',
				},
			});
			return;
		}

		const serviceName = instance.mcp_service_name;
		console.log(`🔐 Validating new credentials for ${serviceName} instance: ${id}`);

		// Validate credentials with format checking and API testing
		/** @type {ValidationResult} */
		const validationResult = /** @type {any} */ (await validateCredentialsWithFormat(serviceName, credentials));

		if (!validationResult.isValid) {
			console.log(`❌ Credential validation failed for instance ${id}: ${validationResult.error}`);

			res.status(400).json({
				error: {
					code: validationResult.errorCode || 'CREDENTIAL_VALIDATION_FAILED',
					message: validationResult.error,
					service: serviceName,
					validation_details: {
						test_endpoint: /** @type {any} */ (validationResult.details)?.testEndpoint,
						suggestion: /** @type {any} */ (validationResult.details)?.suggestion,
						...validationResult.details,
					},
				},
			});
			return;
		}

		console.log(`✅ Credential validation successful for instance ${id}`);

		// Extract API key for database storage
		/** @type {any} */
		const credentialsAny = credentials;
		const newApiKey = credentialsAny.api_key;
		if (!newApiKey) {
			res.status(400).json({
				error: {
					code: 'MISSING_API_KEY',
					message: 'API key is required in credentials',
				},
			});
			return;
		}

		// Check if credentials are actually different (avoid unnecessary updates)
		const currentApiKey = instance.api_key;
		if (currentApiKey === newApiKey) {
			res.status(200).json({
				data: {
					message: 'Credentials are already set to this value',
					instance_id: id,
					service_type: serviceName,
					validation_status: 'success',
					updated_at: instance.updated_at,
				},
			});
			return;
		}

		console.log(`💾 Updating credentials for instance ${id}`);

		// Update credentials in database (within transaction)
		const client = await pool.connect();

		try {
			await client.query('BEGIN');

			// Update API key in credentials table
			/** @type {DatabaseUpdateResult} */
			const updateResult = /** @type {any} */ (await client.query(
				'UPDATE mcp_credentials SET api_key = $1, updated_at = NOW() WHERE instance_id = $2 AND instance_id IN (SELECT instance_id FROM mcp_service_table WHERE user_id = $3) RETURNING updated_at',
				[newApiKey, id, userId]
			));

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

			// Also update the credentials_updated_at in mcp_service_table
			await client.query(
				'UPDATE mcp_service_table SET credentials_updated_at = NOW() WHERE instance_id = $1 AND user_id = $2',
				[id, userId]
			);

			await client.query('COMMIT');

			/** @type {any} */
			const updateRow = updateResult.rows[0];
			const updatedAt = updateRow.updated_at;
			console.log(`✅ Database update completed for instance ${id}`);

			// Invalidate cache (async, non-blocking)
			invalidateInstanceCache(serviceName, id).catch(cacheError => {
				console.warn(`⚠️ Cache invalidation failed for instance ${id}:`, cacheError);
				// Don't fail the update - cache will be cleaned up by background watcher
			});

			// Log credential update event (without logging actual credentials)
			console.log(`🔐 Credentials updated: ${id} (${serviceName}) by user ${userId}`);

			// Audit log the credential update
			loggingService.logCredentialUpdate(id, userId, {
				service: serviceName,
				success: true,
				validationResult: 'success',
				cacheInvalidated: true,
			});

			res.status(200).json({
				data: {
					message: 'Credentials updated and validated successfully',
					instance_id: id,
					service_type: serviceName,
					validation_status: 'success',
					validation_details: {
						test_endpoint: validationResult.testEndpoint,
						validated_user: /** @type {any} */ (validationResult.userInfo)?.email || /** @type {any} */ (validationResult.userInfo)?.handle,
						user_info: sanitizeUserInfo(/** @type {UserInfo} */ (validationResult.userInfo)),
					},
					cache_invalidated: true,
					updated_at: updatedAt.toISOString(),
					notes: 'New credentials will be used on next service request',
				},
			});
		} catch (dbError) {
			await client.query('ROLLBACK');
			console.error(`❌ Database error updating instance ${id} credentials:`, dbError);
			throw dbError;
		} finally {
			client.release();
		}
	} catch (error) {
		console.error('Error updating instance credentials:', error);
		const errorMessage = error instanceof Error ? error.message : String(error);

		res.status(500).json({
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Failed to update instance credentials',
				details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
			},
		});
	}
}

/**
 * Sanitize user info for response (remove sensitive data)
 * @param {UserInfo} userInfo - User information from API validation
 * @returns {Object|null} Sanitized user info
 */
function sanitizeUserInfo(userInfo) {
	if (!userInfo) return null;

	// Return only safe, non-sensitive user information
	/** @type {any} */
	const sanitized = {};

	/** @type {any} */
	const userInfoAny = userInfo;

	// Include safe fields
	if (userInfoAny.email) sanitized.email = userInfoAny.email;
	if (userInfoAny.handle) sanitized.handle = userInfoAny.handle;
	if (userInfoAny.service) sanitized.service = userInfoAny.service;
	if (userInfoAny.permissions) sanitized.permissions = userInfoAny.permissions;

	// Include user ID only if it's not sensitive (some services expose internal IDs)
	if (userInfoAny.user_id && typeof userInfoAny.user_id === 'string') {
		sanitized.user_id = userInfoAny.user_id;
	}

	return Object.keys(sanitized).length > 0 ? sanitized : null;
}

/**
 * Validate credentials only (without updating database)
 * Useful for testing credentials before committing to update
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function validateInstanceCredentialsOnly(req, res) {
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
		const credentials = req.body;

		// Get instance to determine service type
		/** @type {MCPInstance} */
		const instance = /** @type {any} */ (await getMCPInstanceById(id, userId));
		if (!instance) {
			res.status(404).json({
				error: {
					code: 'NOT_FOUND',
					message: 'MCP instance not found',
				},
			});
			return;
		}

		const serviceName = instance.mcp_service_name;

		// Validate credentials
		/** @type {ValidationResult} */
		const validationResult = /** @type {any} */ (await validateCredentialsWithFormat(serviceName, credentials));

		if (validationResult.isValid) {
			res.status(200).json({
				data: {
					message: 'Credentials validation successful',
					instance_id: id,
					service_type: serviceName,
					validation_status: 'success',
					validation_details: {
						test_endpoint: validationResult.testEndpoint,
						validated_user: /** @type {any} */ (validationResult.userInfo)?.email || /** @type {any} */ (validationResult.userInfo)?.handle,
						user_info: sanitizeUserInfo(/** @type {UserInfo} */ (validationResult.userInfo)),
					},
					validated_at: validationResult.validatedAt,
				},
			});
		} else {
			res.status(400).json({
				error: {
					code: validationResult.errorCode || 'VALIDATION_FAILED',
					message: validationResult.error,
					service: serviceName,
					validation_details: validationResult.details,
				},
			});
		}
	} catch (error) {
		console.error('Error validating credentials:', error);
		const errorMessage = error instanceof Error ? error.message : String(error);

		res.status(500).json({
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Failed to validate credentials',
				details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
			},
		});
	}
}
