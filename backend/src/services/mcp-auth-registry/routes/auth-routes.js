/**
 * @fileoverview Authentication Routes
 * Express routes for MCP authentication registry
 */

import express from 'express';
// Import authMiddleware
import { requireAuth as authMiddleware } from '../../../middleware/authMiddleware.js';

/**
 * @typedef {import('../types/auth-types.js').AuthCredentials} AuthCredentials
 * @typedef {import('../types/auth-types.js').InstanceCreationData} InstanceCreationData
 */

/**
 * @typedef {Object} InstanceStatus
 * @property {string} oauth_status - OAuth status
 * @property {string} status - Instance status
 * @property {string} [error] - Error message
 * @property {string} [message] - Status message
 */

/**
 * @typedef {Object} AuthenticatedUser
 * @property {string} id - User ID
 * @property {string} email - User email
 */

/**
 * @typedef {Object} AuthenticatedRequest
 * @property {AuthenticatedUser} user - Authenticated user
 * @property {Object} body - Request body
 * @property {Object} params - Request parameters
 * @property {Object} query - Query parameters
 */

/**
 * Creates authentication routes for the MCP auth registry
 * @param {Object} coordinators - Coordinator instances
 * @param {import('../coordinators/oauth-coordinator.js')} coordinators.oauthCoordinator - OAuth coordinator
 * @param {import('../coordinators/apikey-coordinator.js')} coordinators.apiKeyCoordinator - API key coordinator
 * @returns {express.Router} Express router with auth routes
 */
function createAuthRoutes(coordinators) {
	const router = express.Router();
	const { oauthCoordinator, apiKeyCoordinator } = coordinators;

	/**
	 * Validates OAuth credentials for a service
	 * POST /auth/validate/:serviceName
	 */
	router.post('/validate/:serviceName', authMiddleware, async (req, res) => {
		try {
			const { serviceName } = req.params;
			/** @type {AuthCredentials} */
			const credentials = req.body;

			console.log(`🔍 Validating credentials for service: ${serviceName}`);

			// Determine service type and route to appropriate coordinator
			if (oauthCoordinator.hasService(serviceName)) {
				const result = await oauthCoordinator.validateCredentials(serviceName, credentials);
				res.json(result);
				return;
			} else if (apiKeyCoordinator.hasService(serviceName)) {
				const result = await apiKeyCoordinator.validateCredentials(serviceName, credentials);
				res.json(result);
				return;
			} else {
				res.status(404).json({
					isValid: false,
					error: `Service ${serviceName} not found or not registered`,
				});
				return;
			}
		} catch (error) {
			console.error('Credential validation error:', error);
			res.status(500).json({
				isValid: false,
				error: 'Internal server error during validation',
			});
			return;
		}
	});

	/**
	 * Creates OAuth instance (initiates OAuth flow)
	 * POST /auth/create/:serviceName
	 */
	router.post('/create/:serviceName', authMiddleware, async (req, res) => {
		try {
			const { serviceName } = req.params;
			/** @type {AuthCredentials} */
			const credentials = req.body;

			// Ensure user is authenticated
			if (!req.user || !req.user.id) {
				res.status(401).json({
					success: false,
					error: 'User not authenticated',
				});
				return;
			}

			console.log(`🚀 Creating OAuth instance for service: ${serviceName}`);

			if (!oauthCoordinator.hasService(serviceName)) {
				res.status(404).json({
					success: false,
					error: `OAuth service ${serviceName} not found`,
				});
				return;
			}

			// Generate instance ID using timestamp and random string
			const instanceId = generateInstanceId();

			const result = await oauthCoordinator.initiateOAuthFlow(serviceName, instanceId, credentials);

			res.json({
				success: true,
				authUrl: result.authUrl,
				instanceId: result.instanceId,
				message: `OAuth flow initiated for ${serviceName}`,
			});
			return;
		} catch (error) {
			console.error('OAuth flow initiation error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to initiate OAuth flow',
			});
			return;
		}
	});

	/**
	 * Creates API key instance (validates and creates immediately)
	 * POST /auth/validate-and-create/:serviceName
	 */
	router.post('/validate-and-create/:serviceName', authMiddleware, async (req, res) => {
		try {
			const { serviceName } = req.params;
			/** @type {AuthCredentials} */
			const credentials = req.body;

			// Ensure user is authenticated
			if (!req.user || !req.user.id) {
				res.status(401).json({
					success: false,
					error: 'User not authenticated',
				});
				return;
			}

			console.log(`🔑 Validating and creating instance for API key service: ${serviceName}`);

			if (!apiKeyCoordinator.hasService(serviceName)) {
				res.status(404).json({
					success: false,
					error: `API key service ${serviceName} not found`,
				});
				return;
			}

			/** @type {InstanceCreationData} */
			const creationData = {
				serviceName,
				credentials,
				userId: req.user.id,
				metadata: {
					userEmail: req.user.email,
					createdVia: 'auth_registry',
				},
			};

			const result = await apiKeyCoordinator.validateAndCreateInstance(serviceName, creationData);

			if (result.success) {
				res.json({
					success: true,
					instanceId: result.instanceId,
					userInfo: result.userInfo,
					message: `Instance created successfully for ${serviceName}`,
				});
				return;
			} else {
				res.status(400).json({
					success: false,
					error: result.error,
				});
				return;
			}
		} catch (error) {
			console.error('API key instance creation error:', error);
			res.status(500).json({
				success: false,
				error: 'Failed to create API key instance',
			});
			return;
		}
	});

	/**
	 * Handles OAuth callback from providers (Google, etc.)
	 * GET /auth/callback/:serviceName
	 */
	router.get('/callback/:serviceName', async (req, res) => {
		try {
			const { serviceName } = req.params;
			const { code, state, error } = req.query;

			console.log(`🔄 Processing OAuth callback for service: ${serviceName}`);

			// Handle OAuth error responses
			if (error) {
				console.error(`❌ OAuth callback error for ${serviceName}: ${error}`);
				return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?error=${encodeURIComponent(String(error))}`);
			}

			// Validate required parameters
			if (!code || !state) {
				console.error(`❌ Missing OAuth callback parameters for ${serviceName}`);
				return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?error=missing_parameters`);
			}

			if (!oauthCoordinator.hasService(serviceName)) {
				console.error(`❌ OAuth service ${serviceName} not found`);
				return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?error=service_not_found`);
			}

			// Process callback with OAuth coordinator
			const result = await oauthCoordinator.handleOAuthCallback(serviceName, String(code), String(state));

			if (result.success) {
				console.log(`✅ OAuth callback successful for ${serviceName}`);
				return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?success=oauth_complete&service=${serviceName}`);
			} else {
				console.error(`❌ OAuth callback failed for ${serviceName}: ${result.error}`);
				return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?error=${encodeURIComponent(result.error || 'oauth_failed')}`);
			}
		} catch (error) {
			console.error('OAuth callback processing error:', error);
			const errorMessage = error instanceof Error ? error.message : String(error);
			return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?error=${encodeURIComponent(errorMessage)}`);
		}
	});

	/**
	 * Gets OAuth status for an instance
	 * GET /auth/status/:instanceId
	 */
	router.get('/status/:instanceId', authMiddleware, async (req, res) => {
		try {
			const { instanceId } = req.params;

			console.log(`📊 Checking OAuth status for instance: ${instanceId}`);

			// Query database for instance OAuth status
			const status = await getInstanceOAuthStatus(instanceId);

			/** @type {InstanceStatus} */
			const statusResponse = /** @type {InstanceStatus} */ (status);
			res.json({
				instanceId,
				oauth_status: statusResponse.oauth_status,
				status: statusResponse.status,
				error: statusResponse.error,
				message: statusResponse.message,
			});
			return;
		} catch (error) {
			console.error('OAuth status check error:', error);
			res.status(500).json({
				error: 'Failed to check OAuth status',
			});
			return;
		}
	});

	/**
	 * Lists available services
	 * GET /auth/services
	 */
	router.get('/services', async (_req, res) => {
		try {
			const oauthServices = oauthCoordinator.getRegisteredServices().map(name => ({
				name,
				type: 'oauth',
				fields: ['client_id', 'client_secret'],
			}));

			const apiKeyServices = apiKeyCoordinator.getRegisteredServices().map(name => {
				const config = apiKeyCoordinator.getServiceConfig(name);
				return {
					name,
					type: 'apikey',
					fields: config ? config.requiredFields : ['api_token'],
				};
			});

			const allServices = [...oauthServices, ...apiKeyServices];

			res.json({
				services: allServices,
				total: allServices.length,
			});
		} catch (error) {
			console.error('Services listing error:', error);
			res.status(500).json({
				error: 'Failed to list available services',
			});
		}
	});

	return router;
}

/**
 * Generates a unique instance ID
 * @returns {string} Generated instance ID
 */
function generateInstanceId() {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 15);
	return `mcp_${timestamp}_${random}`;
}

/**
 * Gets OAuth status for an instance from database
 * @param {string} instanceId - Instance ID
 * @returns {Promise<InstanceStatus>} Instance status
 */
async function getInstanceOAuthStatus(instanceId) {
	try {
		// This would typically query your database
		// Using the existing getMCPInstanceById function
		const { getMCPInstanceById } = await import('../../../db/queries/mcpInstances/crud.js');

		const instance = await getMCPInstanceById(instanceId, '');

		if (!instance) {
			return {
				oauth_status: 'not_found',
				status: 'not_found',
				error: 'Instance not found',
			};
		}

		return {
			oauth_status: instance.oauth_status || 'unknown',
			status: instance.status || 'unknown',
			error: instance.error_message,
			message:
				instance.oauth_status === 'completed'
					? 'OAuth completed successfully'
					: instance.oauth_status === 'pending'
						? 'OAuth in progress'
						: instance.oauth_status === 'failed'
							? 'OAuth failed'
							: 'Unknown status',
		};
	} catch (error) {
		console.error('Database query error:', error);
		return {
			oauth_status: 'error',
			status: 'error',
			error: 'Database query failed',
		};
	}
}

export { createAuthRoutes };
