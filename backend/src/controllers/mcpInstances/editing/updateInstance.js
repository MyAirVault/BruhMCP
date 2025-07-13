import { getMCPInstanceById } from '../../../db/queries/mcpInstancesQueries.js';
import { validateCredentialsWithFormat } from '../../../services/instanceCredentialValidationService.js';
import { invalidateInstanceCache } from '../../../services/cacheInvalidationService.js';
import { validateInstanceCustomName } from './updateInstanceName.js';
import { pool } from '../../../db/config.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * Update MCP instance (combined name and credentials update)
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function updateInstance(req, res) {
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
		const { custom_name, credentials } = req.body;

		// Validate request parameters
		if (!id) {
			return res.status(400).json({
				error: {
					code: 'MISSING_PARAMETER',
					message: 'Instance ID is required',
				},
			});
		}

		// Check if at least one update field is provided
		if (!custom_name && !credentials) {
			return res.status(400).json({
				error: {
					code: 'NO_UPDATES_PROVIDED',
					message: 'Either custom_name or credentials must be provided for update',
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
		const updatesApplied = [];
		let validationResult = null;
		let nameValidation = null;

		console.log(`🔄 Processing combined update for instance ${id} (${serviceName})`);

		// Validate custom name if provided
		if (custom_name) {
			nameValidation = validateInstanceCustomName(custom_name);
			if (!nameValidation.isValid) {
				return res.status(400).json({
					error: {
						code: 'INVALID_NAME',
						message: nameValidation.error,
						field: 'custom_name',
						...nameValidation.details,
					},
				});
			}
		}

		// Validate credentials if provided
		if (credentials) {
			if (typeof credentials !== 'object') {
				return res.status(400).json({
					error: {
						code: 'INVALID_CREDENTIALS',
						message: 'Credentials must be a valid object',
					},
				});
			}

			console.log(`🔐 Validating new credentials for instance ${id}`);
			validationResult = await validateCredentialsWithFormat(serviceName, credentials);

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
		}

		// Prepare update data
		const updateData = {};
		let needsCacheInvalidation = false;

		// Add name update if provided and different
		if (custom_name && nameValidation) {
			const cleanedName = nameValidation.cleanedName;
			if (instance.custom_name !== cleanedName) {
				updateData.custom_name = cleanedName;
				updatesApplied.push('custom_name');
			}
		}

		// Add credentials update if provided and different
		if (credentials && validationResult) {
			const newApiKey = credentials.api_key;
			if (newApiKey && instance.api_key !== newApiKey) {
				updateData.api_key = newApiKey;
				updatesApplied.push('credentials');
				needsCacheInvalidation = true;
			}
		}

		// Check if any updates are actually needed
		if (updatesApplied.length === 0) {
			return res.status(200).json({
				data: {
					message: 'No changes detected - instance is already up to date',
					instance_id: id,
					service_type: serviceName,
					updates_applied: [],
					updated_at: instance.updated_at,
				},
			});
		}

		console.log(`💾 Applying updates to instance ${id}: ${updatesApplied.join(', ')}`);

		// Perform database update (within transaction)
		const client = await pool.connect();
		
		try {
			await client.query('BEGIN');

			// Build dynamic update query
			const setClauses = [];
			const params = [];
			let paramIndex = 1;

			if (updateData.custom_name !== undefined) {
				setClauses.push(`custom_name = $${paramIndex}`);
				params.push(updateData.custom_name);
				paramIndex++;
			}

			if (updateData.api_key !== undefined) {
				setClauses.push(`api_key = $${paramIndex}`);
				params.push(updateData.api_key);
				paramIndex++;
			}

			// Always update timestamp
			setClauses.push('updated_at = NOW()');
			params.push(id, userId);

			const query = `
				UPDATE mcp_service_table 
				SET ${setClauses.join(', ')}
				WHERE instance_id = $${paramIndex} AND user_id = $${paramIndex + 1}
				RETURNING updated_at
			`;

			const updateResult = await client.query(query, params);

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

			// Invalidate cache if credentials were updated (async, non-blocking)
			if (needsCacheInvalidation) {
				invalidateInstanceCache(serviceName, id).catch(cacheError => {
					console.warn(`⚠️ Cache invalidation failed for instance ${id}:`, cacheError);
					// Don't fail the update - cache will be cleaned up by background watcher
				});
			}

			// Log update event
			console.log(`📝 Instance updated: ${id} (${serviceName}) - ${updatesApplied.join(', ')} by user ${userId}`);

			// Build response with update details
			const responseData = {
				message: 'Instance updated successfully',
				instance_id: id,
				service_type: serviceName,
				updates_applied: updatesApplied,
				updated_at: updatedAt.toISOString(),
			};

			// Add name change details if name was updated
			if (updatesApplied.includes('custom_name')) {
				responseData.name_change = {
					old_name: instance.custom_name,
					new_name: updateData.custom_name,
				};
			}

			// Add credential validation details if credentials were updated
			if (updatesApplied.includes('credentials') && validationResult) {
				responseData.credential_validation = {
					status: 'success',
					service: serviceName,
					test_endpoint: validationResult.testEndpoint,
					validated_user: validationResult.userInfo?.email || validationResult.userInfo?.handle,
					user_info: sanitizeUserInfo(validationResult.userInfo),
				};
				responseData.cache_invalidated = true;
			}

			res.status(200).json({
				data: responseData,
			});

		} catch (dbError) {
			await client.query('ROLLBACK');
			console.error(`❌ Database error updating instance ${id}:`, dbError);
			throw dbError;
		} finally {
			client.release();
		}

	} catch (error) {
		console.error('Error updating instance:', error);
		const errorMessage = error instanceof Error ? error.message : String(error);
		
		res.status(500).json({
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Failed to update instance',
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