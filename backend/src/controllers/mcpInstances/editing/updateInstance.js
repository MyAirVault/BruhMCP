import { getMCPInstanceById } from '../../../db/queries/mcpInstances/index.js';
import { validateCredentialsWithFormat } from '../../../services/instanceCredentialValidationService.js';
import { invalidateInstanceCache } from '../../../services/cacheInvalidationService.js';
import { validateInstanceCustomName } from './updateInstanceName.js';
import { pool } from '../../../db/config.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @typedef {Object} InstanceData
 * @property {string} mcp_service_name - MCP service name
 * @property {string} custom_name - Custom instance name
 * @property {string} api_key - API key for the instance
 * @property {string} updated_at - Last updated timestamp
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether validation passed
 * @property {string} [error] - Error message if validation failed
 * @property {string} [errorCode] - Error code if validation failed
 * @property {Object} [details] - Additional validation details
 * @property {string} [testEndpoint] - Test endpoint used
 * @property {Object} [userInfo] - User information from validation
 */

/**
 * @typedef {Object} NameValidationResult
 * @property {boolean} isValid - Whether name validation passed
 * @property {string} [error] - Error message if validation failed
 * @property {string} [cleanedName] - Cleaned version of the name
 * @property {Object} [details] - Additional validation details
 */

/**
 * Update MCP instance (combined name and credentials update)
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function updateInstance(req, res) {
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
		const { custom_name, credentials } = req.body;

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

		// Check if at least one update field is provided
		if (!custom_name && !credentials) {
			res.status(400).json({
				error: {
					code: 'NO_UPDATES_PROVIDED',
					message: 'Either custom_name or credentials must be provided for update',
				},
			});
			return;
		}

		// Get current instance details
		/** @type {any} */
		const instance = await getMCPInstanceById(id, userId);
		if (!instance) {
			res.status(404).json({
				error: {
					code: 'NOT_FOUND',
					message: 'MCP instance not found',
				},
			});
			return;
		}

		const serviceName = /** @type {any} */ (instance).mcp_service_name;
		const updatesApplied = /** @type {string[]} */ ([]);
		/** @type {ValidationResult | null} */
		let validationResult = null;
		/** @type {NameValidationResult | null} */
		let nameValidation = null;

		console.log(`🔄 Processing combined update for instance ${id} (${serviceName})`);

		// Validate custom name if provided
		if (custom_name) {
			nameValidation = /** @type {NameValidationResult} */ (validateInstanceCustomName(custom_name));
			if (!nameValidation.isValid) {
				res.status(400).json({
					error: {
						code: 'INVALID_NAME',
						message: nameValidation.error,
						field: 'custom_name',
						...nameValidation.details,
					},
				});
				return;
			}
		}

		// Validate credentials if provided
		if (credentials) {
			if (typeof credentials !== 'object') {
				res.status(400).json({
					error: {
						code: 'INVALID_CREDENTIALS',
						message: 'Credentials must be a valid object',
					},
				});
				return;
			}

			console.log(`🔐 Validating new credentials for instance ${id}`);
			validationResult = /** @type {ValidationResult} */ (
				await validateCredentialsWithFormat(serviceName, credentials)
			);

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
							.../** @type {any} */ (validationResult.details),
						},
					},
				});
				return;
			}

			console.log(`✅ Credential validation successful for instance ${id}`);
		}

		// Prepare update data
		/** @type {any} */
		const updateData = {};
		let needsCacheInvalidation = false;

		// Add name update if provided and different
		if (custom_name && nameValidation) {
			const cleanedName = /** @type {any} */ (nameValidation).cleanedName;
			if (/** @type {any} */ (instance).custom_name !== cleanedName) {
				updateData.custom_name = cleanedName;
				updatesApplied.push('custom_name');
			}
		}

		// Add credentials update if provided and different
		if (credentials && validationResult) {
			const newApiKey = /** @type {any} */ (credentials).api_key;
			if (newApiKey && /** @type {any} */ (instance).api_key !== newApiKey) {
				updateData.api_key = newApiKey;
				updatesApplied.push('credentials');
				needsCacheInvalidation = true;
			}
		}

		// Check if any updates are actually needed
		if (updatesApplied.length === 0) {
			res.status(200).json({
				data: {
					message: 'No changes detected - instance is already up to date',
					instance_id: id,
					service_type: serviceName,
					updates_applied: [],
					updated_at: /** @type {any} */ (instance).updated_at,
				},
			});
			return;
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
			/** @type {any} */
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
					old_name: /** @type {any} */ (instance).custom_name,
					new_name: updateData.custom_name,
				};
			}

			// Add credential validation details if credentials were updated
			if (updatesApplied.includes('credentials') && validationResult) {
				responseData.credential_validation = {
					status: 'success',
					service: serviceName,
					test_endpoint: /** @type {any} */ (validationResult).testEndpoint,
					validated_user:
						/** @type {any} */ (validationResult.userInfo)?.email ||
						/** @type {any} */ (validationResult.userInfo)?.handle,
					user_info: sanitizeUserInfo(/** @type {any} */ (validationResult.userInfo)),
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
 * @param {any} userInfo - User information from API validation
 * @returns {any} Sanitized user info
 */
function sanitizeUserInfo(userInfo) {
	if (!userInfo) return null;

	// Return only safe, non-sensitive user information
	/** @type {any} */
	const sanitized = {};

	// Include safe fields
	if (/** @type {any} */ (userInfo).email) sanitized.email = /** @type {any} */ (userInfo).email;
	if (/** @type {any} */ (userInfo).handle) sanitized.handle = /** @type {any} */ (userInfo).handle;
	if (/** @type {any} */ (userInfo).service) sanitized.service = /** @type {any} */ (userInfo).service;
	if (/** @type {any} */ (userInfo).permissions) sanitized.permissions = /** @type {any} */ (userInfo).permissions;

	// Include user ID only if it's not sensitive (some services expose internal IDs)
	if (/** @type {any} */ (userInfo).user_id && typeof (/** @type {any} */ (userInfo).user_id) === 'string') {
		sanitized.user_id = /** @type {any} */ (userInfo).user_id;
	}

	return Object.keys(sanitized).length > 0 ? sanitized : null;
}
