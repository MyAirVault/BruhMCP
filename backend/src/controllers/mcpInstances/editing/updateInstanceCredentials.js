import { getMCPInstanceById } from '../../../db/queries/mcpInstancesQueries.js';
import { validateCredentialsWithFormat } from '../../../services/instanceCredentialValidationService.js';
import { invalidateInstanceCache } from '../../../services/cacheInvalidationService.js';
import { pool } from '../../../db/config.js';
import loggingService from '../../../services/logging/loggingService.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * Update MCP instance credentials with validation
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function updateInstanceCredentials(req, res) {
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
		const credentials = req.body;

		// Validate request parameters
		if (!id) {
			return res.status(400).json({
				error: {
					code: 'MISSING_PARAMETER',
					message: 'Instance ID is required',
				},
			});
		}

		if (!credentials || typeof credentials !== 'object') {
			return res.status(400).json({
				error: {
					code: 'INVALID_CREDENTIALS',
					message: 'Credentials must be a valid object',
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

		const serviceName = instance.mcp_service_name;
		console.log(`🔐 Validating new credentials for ${serviceName} instance: ${id}`);

		// Validate credentials with format checking and API testing
		const validationResult = await validateCredentialsWithFormat(serviceName, credentials);

		if (!validationResult.isValid) {
			console.log(`❌ Credential validation failed for instance ${id}: ${validationResult.error}`);
			
			return res.status(400).json({
				error: {
					code: validationResult.errorCode || 'CREDENTIAL_VALIDATION_FAILED',
					message: validationResult.error,
					service: serviceName,
					validation_details: {
						test_endpoint: validationResult.details?.testEndpoint,
						suggestion: validationResult.details?.suggestion,
						...validationResult.details,
					},
				},
			});
		}

		console.log(`✅ Credential validation successful for instance ${id}`);

		// Extract API key for database storage
		const newApiKey = credentials.api_key;
		if (!newApiKey) {
			return res.status(400).json({
				error: {
					code: 'MISSING_API_KEY',
					message: 'API key is required in credentials',
				},
			});
		}

		// Check if credentials are actually different (avoid unnecessary updates)
		const currentApiKey = instance.api_key;
		if (currentApiKey === newApiKey) {
			return res.status(200).json({
				data: {
					message: 'Credentials are already set to this value',
					instance_id: id,
					service_type: serviceName,
					validation_status: 'success',
					updated_at: instance.updated_at,
				},
			});
		}

		console.log(`💾 Updating credentials for instance ${id}`);

		// Update credentials in database (within transaction)
		const client = await pool.connect();
		
		try {
			await client.query('BEGIN');

			// Update API key in database
			const updateResult = await client.query(
				'UPDATE mcp_service_table SET api_key = $1, updated_at = NOW() WHERE instance_id = $2 AND user_id = $3 RETURNING updated_at',
				[newApiKey, id, userId]
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

			await client.query('COMMIT');

			const updatedAt = updateResult.rows[0].updated_at;
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
				cacheInvalidated: true
			});

			res.status(200).json({
				data: {
					message: 'Credentials updated and validated successfully',
					instance_id: id,
					service_type: serviceName,
					validation_status: 'success',
					validation_details: {
						test_endpoint: validationResult.testEndpoint,
						validated_user: validationResult.userInfo?.email || validationResult.userInfo?.handle,
						user_info: sanitizeUserInfo(validationResult.userInfo),
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
 * @param {Object} userInfo - User information from API validation
 * @returns {Object} Sanitized user info
 */
function sanitizeUserInfo(userInfo) {
	if (!userInfo) return null;

	// Return only safe, non-sensitive user information
	const sanitized = {};

	// Include safe fields
	if (userInfo.email) sanitized.email = userInfo.email;
	if (userInfo.handle) sanitized.handle = userInfo.handle;
	if (userInfo.service) sanitized.service = userInfo.service;
	if (userInfo.permissions) sanitized.permissions = userInfo.permissions;

	// Include user ID only if it's not sensitive (some services expose internal IDs)
	if (userInfo.user_id && typeof userInfo.user_id === 'string') {
		sanitized.user_id = userInfo.user_id;
	}

	return Object.keys(sanitized).length > 0 ? sanitized : null;
}

/**
 * Validate credentials only (without updating database)
 * Useful for testing credentials before committing to update
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function validateInstanceCredentialsOnly(req, res) {
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
		const credentials = req.body;

		// Get instance to determine service type
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

		// Validate credentials
		const validationResult = await validateCredentialsWithFormat(serviceName, credentials);

		if (validationResult.isValid) {
			res.status(200).json({
				data: {
					message: 'Credentials validation successful',
					instance_id: id,
					service_type: serviceName,
					validation_status: 'success',
					validation_details: {
						test_endpoint: validationResult.testEndpoint,
						validated_user: validationResult.userInfo?.email || validationResult.userInfo?.handle,
						user_info: sanitizeUserInfo(validationResult.userInfo),
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