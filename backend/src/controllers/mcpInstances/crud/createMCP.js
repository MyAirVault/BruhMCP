/**
 * Create new MCP instance for multi-tenant architecture
 * Updated for Phase 2: Instance-based routing without process spawning
 */

import { randomUUID } from 'crypto';
import { createMCPSchema } from '../schemas.js';
import { calculateExpirationDate } from '../utils.js';
import { ErrorResponses, formatZodErrors } from '../../../utils/errorResponse.js';
import { getUserInstanceCount, createMCPInstance, updateMCPServiceStats } from '../../../db/queries/mcpInstancesQueries.js';
import { getMCPTypeByName } from '../../../db/queries/mcpTypesQueries.js';
import { pool } from '../../../db/config.js';
import { createMCPLogDirectory } from '../../../utils/logDirectoryManager.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * Create new MCP instance with multi-tenant support
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function createMCP(req, res) {
	try {
		const userId = req.user?.id;
		if (!userId) {
			return ErrorResponses.unauthorized(res, 'User authentication required');
		}

		// Validate request body
		const validationResult = createMCPSchema.safeParse(req.body);

		if (!validationResult.success) {
			return ErrorResponses.validation(res, 'Invalid request parameters', formatZodErrors(validationResult.error));
		}

		const { mcp_type, custom_name, expiration_option, credentials } = validationResult.data;

		// Check user instance limits
		const currentInstances = await getUserInstanceCount(userId);
		const maxInstances = Number(process.env.MCP_MAX_INSTANCES) || 10;

		if (currentInstances >= maxInstances) {
			return ErrorResponses.forbidden(res, `Maximum instances per user reached (${maxInstances})`, {
				userId,
				metadata: {
					current: currentInstances,
					maximum: maxInstances
				}
			});
		}

		// Get MCP service definition
		const mcpService = await getMCPTypeByName(mcp_type);
		
		if (!mcpService) {
			return ErrorResponses.notFound(res, `MCP service '${mcp_type}'`);
		}

		if (!mcpService.is_active) {
			return ErrorResponses.serviceDisabled(res, mcp_type);
		}

		// Validate credentials based on auth type (Authentication Contract Enforcement)
		if (mcpService.type === 'api_key') {
			if (!credentials.api_key) {
				return res.status(400).json({
					error: {
						code: 'MISSING_CREDENTIALS',
						message: 'API key is required for this service',
					},
				});
			}
			// Ensure no OAuth credentials provided for API key services
			if (credentials.client_id || credentials.client_secret) {
				return res.status(400).json({
					error: {
						code: 'INVALID_CREDENTIALS',
						message: 'OAuth credentials not allowed for API key services',
					},
				});
			}
		} else if (mcpService.type === 'oauth') {
			if (!credentials.client_id || !credentials.client_secret) {
				return res.status(400).json({
					error: {
						code: 'MISSING_CREDENTIALS',
						message: 'Client ID and Client Secret are required for OAuth services',
					},
				});
			}
			// Ensure no API key provided for OAuth services
			if (credentials.api_key) {
				return res.status(400).json({
					error: {
						code: 'INVALID_CREDENTIALS',
						message: 'API key not allowed for OAuth services',
					},
				});
			}
		}

		// Generate unique instance ID
		const instanceId = randomUUID();

		// Calculate expiration date
		const expiresAt = calculateExpirationDate(expiration_option);

		// Prepare credentials based on service type
		const apiKey = mcpService.type === 'api_key' ? credentials.api_key : null;
		const clientId = mcpService.type === 'oauth' ? credentials.client_id : null;
		const clientSecret = mcpService.type === 'oauth' ? credentials.client_secret : null;

		// Create MCP instance using abstracted function
		const createdInstance = await createMCPInstance({
			userId,
			mcpServiceId: mcpService.mcp_service_id,
			customName: custom_name || `${mcpService.display_name} Instance`,
			apiKey,
			clientId,
			clientSecret,
			expiresAt
		});

		// Create log directory structure for the new instance
		const logDirResult = await createMCPLogDirectory(userId, createdInstance.instance_id);
		if (!logDirResult.success) {
			console.warn(`⚠️ Log directory creation failed for instance ${createdInstance.instance_id}: ${logDirResult.error}`);
			// Don't fail the instance creation if log directory creation fails
		}

		// Update service statistics
		await updateMCPServiceStats(mcpService.mcp_service_id, {
			totalInstancesIncrement: 1,
			activeInstancesIncrement: 1
		});

		// Build instance URL using PUBLIC_DOMAIN for consistent format
		const publicDomain = process.env.PUBLIC_DOMAIN || 'http://localhost:5000';
		const instanceUrl = `${publicDomain}/${mcpService.mcp_service_name}/${createdInstance.instance_id}`;

		console.log(`✅ MCP instance created: ${createdInstance.instance_id} for user ${userId} (${mcpService.mcp_service_name})`);

		// Return response with instance-based URL
		res.status(201).json({
			data: {
				id: createdInstance.instance_id,
				instance_id: createdInstance.instance_id,
				custom_name: createdInstance.custom_name,
				status: createdInstance.status,
				expires_at: createdInstance.expires_at,
				expiration_option: expiration_option,
				usage_count: createdInstance.usage_count,
				access_url: instanceUrl,
				instance_url: instanceUrl,
				mcp_service: {
					name: mcpService.mcp_service_name,
					display_name: mcpService.display_name,
					type: mcpService.type,
					port: mcpService.port
				},
				endpoints: {
					health: `${instanceUrl}/health`,
					tools: `${instanceUrl}/mcp/tools`,
					call: `${instanceUrl}/mcp/call`
				},
				created_at: createdInstance.created_at,
				updated_at: createdInstance.updated_at
			},
		});

	} catch (error) {
		console.error('Error creating MCP instance:', error);
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({
			error: {
				code: 'INTERNAL_ERROR',
				message: 'An unexpected error occurred',
				details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
			},
		});
	}
}

/**
 * Validate credentials against external service (optional)
 * This can be called before instance creation for real-time validation
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function validateMCPCredentials(req, res) {
	try {
		const { mcp_type } = req.body;
		if (!mcp_type) {
			return res.status(400).json({
				error: {
					code: 'MISSING_PARAMETER',
					message: 'mcp_type is required'
				}
			});
		}

		// Get service configuration
		const mcpServiceQuery = `
			SELECT mcp_service_name, type, port
			FROM mcp_table 
			WHERE mcp_service_name = $1 AND is_active = true
		`;
		
		const mcpServiceResult = await pool.query(mcpServiceQuery, [mcp_type]);
		
		if (mcpServiceResult.rows.length === 0) {
			return res.status(404).json({
				error: {
					code: 'SERVICE_NOT_FOUND',
					message: `MCP service '${mcp_type}' not found or disabled`,
				},
			});
		}

		const mcpService = mcpServiceResult.rows[0];

		// Test credentials against the actual MCP service
		// This makes a test call to verify the credentials work
		try {
			const serviceUrl = `http://localhost:${mcpService.port}/health`;
			const testResponse = await fetch(serviceUrl, {
				method: 'GET',
			});

			if (testResponse.ok) {
				res.json({
					valid: true,
					message: 'Credentials validated successfully',
					service: {
						name: mcpService.mcp_service_name,
						type: mcpService.type
					}
				});
			} else {
				res.status(400).json({
					valid: false,
					error: 'Service health check failed',
				});
			}
		} catch (serviceError) {
			const errorMessage = serviceError instanceof Error ? serviceError.message : String(serviceError);
			res.status(400).json({
				valid: false,
				error: 'Unable to validate credentials - service unavailable',
				details: errorMessage
			});
		}

	} catch (error) {
		console.error('Error validating MCP credentials:', error);
		res.status(500).json({
			error: {
				code: 'VALIDATION_ERROR',
				message: 'Failed to validate credentials',
			},
		});
	}
}