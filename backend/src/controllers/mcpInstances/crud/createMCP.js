/**
 * Create new MCP instance for multi-tenant architecture
 * Updated for Phase 2: Instance-based routing without process spawning
 */

// const { randomUUID } = require('crypto'); // @ts-ignore - keeping for future functionality
const { createMCPSchema } = require('../schemas.js');
const { calculateExpirationDate, generateAccessUrl } = require('../utils.js');
const { ErrorResponses, formatZodErrors } = require('../../../utils/errorResponse.js');
const { updateMCPServiceStats, createMCPInstanceWithLimitCheck } = require('../../../db/queries/mcpInstances/index.js');
const { getMCPTypeByName } = require('../../../db/queries/mcpTypesQueries.js');
const { createMCPLogDirectory } = require('../../../utils/logDirectoryManager.js');
const mcpInstanceLogger = require('../../../utils/mcpInstanceLogger.js');
// Import new MCP Auth Registry
const { authRegistry } = require('../../../services/mcp-auth-registry/index.js');
const { deleteMCPInstance } = require('../../../db/queries/mcpInstances/crud.js');

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * @typedef {Object} MCPService
 * @property {string} mcp_service_id
 * @property {string} mcp_service_name
 * @property {string} display_name
 * @property {'api_key'|'oauth'} type
 * @property {boolean} is_active
 * @property {number} port
 */

/**
 * @typedef {Object} CreationResult
 * @property {boolean} success
 * @property {string} [reason]
 * @property {string} [message]
 * @property {number} [currentCount]
 * @property {number} [maxInstances]
 * @property {MCPInstance} [instance]
 */

/**
 * @typedef {Object} MCPInstance
 * @property {string} instance_id
 * @property {string} custom_name
 * @property {string} status
 * @property {string} [oauth_status]
 * @property {Date} expires_at
 * @property {string} expiration_option
 * @property {number} usage_count
 * @property {Date} created_at
 * @property {Date} updated_at
 */

/**
 * @typedef {Object} OAuthResult
 * @property {boolean} success
 * @property {string} [authorization_url]
 * @property {string} [provider]
 * @property {string} [instance_id]
 * @property {string} [message]
 * @property {string} [error]
 */

/**
 * @typedef {Object} Logger
 * @property {function(string, string, Object): void} app
 */

/**
 * Create new MCP instance with multi-tenant support
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
async function createMCP(req, res) {
	try {
		const userId = req.user?.id;
		if (!userId) {
			return ErrorResponses.unauthorized(res, 'User authentication required');
		}

		// Validate request body
		const validationResult = createMCPSchema.safeParse(req.body);

		if (!validationResult.success) {
			return ErrorResponses.validation(
				res,
				'Invalid request parameters',
				formatZodErrors(validationResult.error)
			);
		}

		const { mcp_type, custom_name, expiration_option, credentials } = validationResult.data;

		// Get user subscription for atomic limit checking
		const { checkInstanceLimit } = require('../../../utils/razorpay/subscriptionLimits.js');
		const limitCheck = await checkInstanceLimit(userId);

		if (!limitCheck.canCreate) {
			return ErrorResponses.forbidden(res, limitCheck.message, {
				userId,
				reason: limitCheck.reason,
				details: limitCheck.details
			});
		}

		// Get MCP service definition
		/** @type {MCPService|null} */
		const mcpService = /** @type {MCPService|null} */ (await getMCPTypeByName(mcp_type));

		if (!mcpService) {
			return ErrorResponses.notFound(res, `MCP service '${mcp_type}'`);
		}

		if (!mcpService.is_active) {
			return ErrorResponses.serviceDisabled(res, mcp_type);
		}

		// Validate credentials based on auth type (Authentication Contract Enforcement)
		if (mcpService.type === 'api_key') {
			if (!credentials.api_key) {
				res.status(400).json({
					error: {
						code: 'MISSING_CREDENTIALS',
						message: 'API key is required for this service',
					},
				});
				return;
			}
			// Ensure no OAuth credentials provided for API key services
			if (credentials.client_id || credentials.client_secret) {
				res.status(400).json({
					error: {
						code: 'INVALID_CREDENTIALS',
						message: 'OAuth credentials not allowed for API key services',
					},
				});
				return;
			}
		} else if (mcpService.type === 'oauth') {
			if (!credentials.client_id || !credentials.client_secret) {
				res.status(400).json({
					error: {
						code: 'MISSING_CREDENTIALS',
						message: 'Client ID and Client Secret are required for OAuth services',
					},
				});
				return;
			}
			// Ensure no API key provided for OAuth services
			if (credentials.api_key) {
				res.status(400).json({
					error: {
						code: 'INVALID_CREDENTIALS',
						message: 'API key not allowed for OAuth services',
					},
				});
				return;
			}
		}

		// Calculate expiration date
		const expiresAt = calculateExpirationDate(expiration_option);

		// Prepare credentials based on service type
		const apiKey = mcpService.type === 'api_key' ? credentials.api_key : null;
		const clientId = mcpService.type === 'oauth' ? credentials.client_id : null;
		const clientSecret = mcpService.type === 'oauth' ? credentials.client_secret : null;

		// Create MCP instance with atomic limit checking to prevent race conditions
		/** @type {CreationResult} */
		const creationResult = /** @type {CreationResult} */ (
			await createMCPInstanceWithLimitCheck(
				{
					userId,
					mcpServiceId: mcpService.mcp_service_id,
					customName: custom_name || `${mcpService.display_name} Instance`,
					apiKey: apiKey || undefined,
					clientId: clientId || undefined,
					clientSecret: clientSecret || undefined,
					expiresAt: expiresAt || undefined,
					serviceType: mcpService.type,
				},
				limitCheck.details?.maxInstances || 1
			)
		);

		// Handle creation failure due to limit reached or other errors
		if (!creationResult.success) {
			if (creationResult.reason === 'ACTIVE_LIMIT_REACHED') {
				return ErrorResponses.forbidden(res, creationResult.message, {
					userId,
					reason: creationResult.reason,
					plan: limitCheck.details?.plan || 'unknown',
					currentCount: creationResult.currentCount,
					maxInstances: creationResult.maxInstances,
					upgradeMessage: 'Upgrade to Pro plan for unlimited active instances',
				});
			} else {
				return ErrorResponses.internal(res, creationResult.message || 'Failed to create instance');
			}
		}

		/** @type {MCPInstance} */
		const createdInstance = /** @type {MCPInstance} */ (creationResult.instance);

		// Handle OAuth flow for OAuth services using new Auth Registry
		if (mcpService.type === 'oauth') {
			try {
				console.log(`🔐 Initiating OAuth flow for ${mcpService.mcp_service_name} via Auth Registry`);

				// Check if service is available in auth registry
				if (!authRegistry.hasService(mcpService.mcp_service_name.toLowerCase())) {
					await deleteMCPInstance(createdInstance.instance_id, userId);
					res.status(400).json({
						error: {
							code: 'SERVICE_NOT_FOUND',
							message: `OAuth service ${mcpService.mcp_service_name} not registered in auth registry`,
						},
					});
					return;
				}

				// Prepare credentials for OAuth flow
				const credentials = {
					clientId: clientId || '',
					clientSecret: clientSecret || '',
				};

				// Initiate OAuth flow through auth registry
				const oauthResult = await authRegistry.callServiceFunction(
					mcpService.mcp_service_name.toLowerCase(),
					'initiateOAuth',
					credentials,
					userId,
					createdInstance.instance_id
				);

				// Format instance to match frontend expectations
				const formattedInstance = {
					id: createdInstance.instance_id,
					custom_name: createdInstance.custom_name,
					status: createdInstance.status,
					oauth_status: 'pending', // Set to pending during OAuth flow
					expires_at: createdInstance.expires_at,
					expiration_option: createdInstance.expiration_option,
					mcp_type: {
						name: mcpService.mcp_service_name,
						display_name: mcpService.display_name,
						type: mcpService.type,
					},
					created_at: createdInstance.created_at,
				};

				res.status(200).json({
					instance: formattedInstance,
					oauth: {
						requires_user_consent: true,
						authorization_url: oauthResult.authUrl,
						provider: mcpService.mcp_service_name.toLowerCase(),
						instance_id: oauthResult.instanceId,
						message: `OAuth flow initiated for ${mcpService.mcp_service_name}`,
					},
				});
				return;
			} catch (oauthError) {
				const errorMessage = oauthError instanceof Error ? oauthError.message : String(oauthError);
				console.error(`❌ OAuth flow failed for instance ${createdInstance.instance_id}:`, errorMessage);

				// Delete the created instance on OAuth failure
				await deleteMCPInstance(createdInstance.instance_id, userId);

				res.status(400).json({
					error: {
						code: 'OAUTH_ERROR',
						message: 'OAuth flow encountered an error',
						details: errorMessage,
					},
				});
				return;
			}
		}

		// Create log directory structure for the new instance
		const logDirResult = await createMCPLogDirectory(userId, createdInstance.instance_id);
		if (!logDirResult.success) {
			console.warn(
				`⚠️ Log directory creation failed for instance ${createdInstance.instance_id}: ${logDirResult.error}`
			);
			// Don't fail the instance creation if log directory creation fails
		} else {
			// Initialize logger for the new instance
			/** @type {any} */
			const logger = mcpInstanceLogger.initializeLogger(createdInstance.instance_id, userId);
			logger.app('info', 'MCP instance created', {
				instanceId: createdInstance.instance_id,
				serviceName: mcpService.mcp_service_name,
				serviceType: mcpService.type,
				customName: createdInstance.custom_name,
				expiresAt: createdInstance.expires_at,
			});
		}

		// Update service statistics
		await updateMCPServiceStats(mcpService.mcp_service_id, {
			activeInstancesIncrement: 1,
		});

		// Build instance URL using centralized generateAccessUrl function for consistency
		const instanceUrl = generateAccessUrl(createdInstance.instance_id, mcpService.mcp_service_name);

		console.log(
			`✅ MCP instance created: ${createdInstance.instance_id} for user ${userId} (${mcpService.mcp_service_name})`
		);

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
					port: mcpService.port,
				},
				endpoints: {
					health: `${instanceUrl}/health`,
					tools: `${instanceUrl}/mcp/tools`,
					call: `${instanceUrl}/mcp/call`,
				},
				created_at: createdInstance.created_at,
				updated_at: createdInstance.updated_at,
			},
		});
	} catch (error) {
		console.error('Error creating MCP instance:', error);
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({
			error: {
				code: 'INTERNAL_ERROR',
				message: 'An unexpected error occurred',
				details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
			},
		});
	}
}

module.exports = { createMCP };
