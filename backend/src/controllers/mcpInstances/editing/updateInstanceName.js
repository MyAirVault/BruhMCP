import { getMCPInstanceById } from '../../../db/queries/mcpInstances/index.js';
import { pool } from '../../../db/config.js';

/** @typedef {import('express').Request & {user?: {id: string}}} Request */
/** @typedef {import('express').Response} Response */

/**
 * Update MCP instance custom name
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function updateInstanceName(req, res) {
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
		const { custom_name } = req.body;

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

		if (!custom_name) {
			res.status(400).json({
				error: {
					code: 'MISSING_PARAMETER',
					message: 'Custom name is required',
				},
			});
			return;
		}

		// Validate name format
		/** @type {any} */
		const nameValidation = validateCustomName(custom_name);
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

		const oldName = instance.custom_name;
		const cleanedName = nameValidation.cleanedName;

		// Check if name is actually different
		if (oldName === cleanedName) {
			res.status(200).json({
				data: {
					message: 'Instance name is already set to this value',
					instance_id: id,
					custom_name: cleanedName,
					updated_at: instance.updated_at,
				},
			});
			return;
		}

		console.log(`📝 Updating instance ${id} name from "${oldName}" to "${cleanedName}"`);

		// Update instance name in database
		const client = await pool.connect();

		try {
			await client.query('BEGIN');

			const updateResult = await client.query(
				'UPDATE mcp_service_table SET custom_name = $1, updated_at = NOW() WHERE instance_id = $2 AND user_id = $3 RETURNING updated_at',
				[cleanedName, id, userId]
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
			console.log(`✅ Instance ${id} name updated successfully`);

			// Log name change event
			console.log(`📝 Name change: ${id} "${oldName}" → "${cleanedName}" by user ${userId}`);

			res.status(200).json({
				data: {
					message: 'Instance name updated successfully',
					instance_id: id,
					old_name: oldName,
					new_name: cleanedName,
					updated_at: updatedAt.toISOString(),
				},
			});
		} catch (dbError) {
			await client.query('ROLLBACK');
			console.error(`❌ Database error updating instance ${id} name:`, dbError);
			throw dbError;
		} finally {
			client.release();
		}
	} catch (error) {
		console.error('Error updating instance name:', error);
		const errorMessage = error instanceof Error ? error.message : String(error);

		res.status(500).json({
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Failed to update instance name',
				details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
			},
		});
	}
}

/**
 * Validate custom name format and content
 * @param {string} name - Name to validate
 * @returns {any} Validation result with cleaned name
 */
function validateCustomName(name) {
	if (typeof name !== 'string') {
		return {
			isValid: false,
			error: 'Custom name must be a string',
			details: { received_type: typeof name },
		};
	}

	// Trim whitespace
	const trimmed = name.trim();

	// Check length
	if (trimmed.length === 0) {
		return {
			isValid: false,
			error: 'Custom name cannot be empty',
			details: { min_length: 1 },
		};
	}

	if (trimmed.length > 100) {
		return {
			isValid: false,
			error: 'Custom name must be 100 characters or less',
			details: {
				max_length: 100,
				current_length: trimmed.length,
			},
		};
	}

	// Check for invalid characters (basic XSS prevention)
	const invalidChars = /[<>'"&]/;
	if (invalidChars.test(trimmed)) {
		return {
			isValid: false,
			error: 'Custom name contains invalid characters',
			details: {
				invalid_characters: ['<', '>', '"', "'", '&'],
				suggestion: 'Use only letters, numbers, spaces, hyphens, and underscores',
			},
		};
	}

	// Check for suspicious patterns
	const suspiciousPatterns = /(?:script|javascript|vbscript|onload|onerror)/i;
	if (suspiciousPatterns.test(trimmed)) {
		return {
			isValid: false,
			error: 'Custom name contains prohibited content',
			details: {
				suggestion: 'Please use a simpler name without special keywords',
			},
		};
	}

	// Additional whitespace normalization
	const normalized = trimmed.replace(/\s+/g, ' '); // Replace multiple spaces with single space

	return {
		isValid: true,
		cleanedName: normalized,
		details: {
			original_length: name.length,
			cleaned_length: normalized.length,
		},
	};
}

/**
 * Validate custom name (standalone function for reuse)
 * @param {string} name - Name to validate
 * @returns {any} Validation result
 */
export function validateInstanceCustomName(name) {
	return validateCustomName(name);
}
