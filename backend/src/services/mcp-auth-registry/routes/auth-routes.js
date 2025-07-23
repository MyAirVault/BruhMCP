/**
 * @fileoverview Authentication Routes
 * Express routes for MCP authentication registry using Service Registry
 */

import express from 'express';
import { requireAuth as authMiddleware } from '../../../middleware/authMiddleware.js';

/**
 * @typedef {import('../types/service-types.js').CredentialsData} CredentialsData
 * @typedef {import('../types/service-types.js').InstanceData} InstanceData
 */


/**
 * Creates authentication routes for the MCP auth registry
 * @param {import('../core/registry.js').ServiceRegistry} serviceRegistry - Service registry instance
 * @returns {express.Router} Express router with auth routes
 */
function createAuthRoutes(serviceRegistry) {
	const router = express.Router();


	/**
	 * Validates credentials for any service
	 * POST /auth/validate/:serviceName
	 */
	router.post('/validate/:serviceName', authMiddleware, async (req, res) => {
		try {
			const { serviceName } = req.params;
			/** @type {CredentialsData} */
			const credentials = req.body;
			const userId = req.user?.id;

			console.log(`🔍 Validating credentials for service: ${serviceName}`);

			// Check if service exists
			if (!serviceRegistry.hasService(serviceName)) {
				res.status(404).json({
					success: false,
					message: `Service ${serviceName} not found or not active`
				});
				return;
			}

			// Call service validation function
			const result = await serviceRegistry.callServiceFunction(
				serviceName,
				'validateCredentials',
				credentials,
				userId
			);

			res.json(result);
		} catch (error) {
			console.error('Credential validation error:', error);
			res.status(500).json({
				success: false,
				message: 'Internal server error during validation'
			});
		}
	});


	/**
	 * Initiates OAuth flow for OAuth services
	 * POST /auth/initiate-oauth/:serviceName
	 */
	router.post('/initiate-oauth/:serviceName', authMiddleware, async (req, res) => {
		try {
			const { serviceName } = req.params;
			/** @type {CredentialsData} */
			const credentials = req.body;
			const userId = req.user?.id;

			if (!userId) {
				res.status(401).json({
					success: false,
					message: 'User not authenticated'
				});
				return;
			}

			console.log(`🚀 Initiating OAuth for service: ${serviceName}`);

			// Check if service exists and supports OAuth
			const service = serviceRegistry.getService(serviceName);
			if (!service || !service.isActive) {
				res.status(404).json({
					success: false,
					message: `Service ${serviceName} not found or not active`
				});
				return;
			}

			if (service.type !== 'oauth' && service.type !== 'hybrid') {
				res.status(400).json({
					success: false,
					message: `Service ${serviceName} does not support OAuth`
				});
				return;
			}

			// Call service OAuth initiation function
			const result = await serviceRegistry.callServiceFunction(
				serviceName,
				'initiateOAuth',
				credentials,
				userId
			);

			res.json(result);
		} catch (error) {
			console.error('OAuth initiation error:', error);
			res.status(500).json({
				success: false,
				message: 'Failed to initiate OAuth flow'
			});
		}
	});


	/**
	 * Creates instance for API key or hybrid services
	 * POST /auth/create-instance/:serviceName
	 */
	router.post('/create-instance/:serviceName', authMiddleware, async (req, res) => {
		try {
			const { serviceName } = req.params;
			/** @type {InstanceData} */
			const instanceData = req.body;
			const userId = req.user?.id;

			if (!userId) {
				res.status(401).json({
					success: false,
					message: 'User not authenticated'
				});
				return;
			}

			console.log(`🔑 Creating instance for service: ${serviceName}`);

			// Check if service exists and supports instance creation
			const service = serviceRegistry.getService(serviceName);
			if (!service || !service.isActive) {
				res.status(404).json({
					success: false,
					message: `Service ${serviceName} not found or not active`
				});
				return;
			}

			if (service.type === 'oauth') {
				res.status(400).json({
					success: false,
					message: `Service ${serviceName} requires OAuth flow, use /initiate-oauth instead`
				});
				return;
			}

			// Call service instance creation function
			const result = await serviceRegistry.callServiceFunction(
				serviceName,
				'createInstance',
				instanceData,
				userId
			);

			res.json(result);
		} catch (error) {
			console.error('Instance creation error:', error);
			res.status(500).json({
				success: false,
				message: 'Failed to create instance'
			});
		}
	});


	/**
	 * Handles OAuth callback from providers
	 * GET /auth/callback/:serviceName
	 */
	router.get('/callback/:serviceName', async (req, res) => {
		try {
			const { serviceName } = req.params;
			const { code, state, error } = req.query;
			const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

			console.log(`🔄 Processing OAuth callback for service: ${serviceName}`);

			// Handle OAuth error responses
			if (error) {
				console.error(`❌ OAuth callback error for ${serviceName}: ${error}`);
				return res.redirect(`${frontendUrl}/dashboard?error=${encodeURIComponent(String(error))}`);
			}

			// Validate required parameters
			if (!code || !state) {
				console.error(`❌ Missing OAuth callback parameters for ${serviceName}`);
				return res.redirect(`${frontendUrl}/dashboard?error=missing_parameters`);
			}

			// Check if service exists and supports OAuth
			const service = serviceRegistry.getService(serviceName);
			if (!service || !service.isActive) {
				console.error(`❌ Service ${serviceName} not found`);
				return res.redirect(`${frontendUrl}/dashboard?error=service_not_found`);
			}

			if (service.type !== 'oauth' && service.type !== 'hybrid') {
				console.error(`❌ Service ${serviceName} does not support OAuth`);
				return res.redirect(`${frontendUrl}/dashboard?error=service_not_oauth`);
			}

			// Call service OAuth callback function
			const result = await serviceRegistry.callServiceFunction(
				serviceName,
				'oauthCallback',
				String(code),
				String(state)
			);

			if (result.success) {
				console.log(`✅ OAuth callback successful for ${serviceName}`);
				return res.redirect(`${frontendUrl}/dashboard?success=oauth_complete&service=${serviceName}`);
			} else {
				console.error(`❌ OAuth callback failed for ${serviceName}: ${result.message}`);
				return res.redirect(`${frontendUrl}/dashboard?error=${encodeURIComponent(result.message || 'oauth_failed')}`);
			}
		} catch (error) {
			console.error('OAuth callback processing error:', error);
			const errorMessage = error instanceof Error ? error.message : String(error);
			const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
			return res.redirect(`${frontendUrl}/dashboard?error=${encodeURIComponent(errorMessage)}`);
		}
	});


	/**
	 * Revokes an instance
	 * DELETE /auth/revoke/:serviceName/:instanceId
	 */
	router.delete('/revoke/:serviceName/:instanceId', authMiddleware, async (req, res) => {
		try {
			const { serviceName, instanceId } = req.params;
			const userId = req.user?.id;

			if (!userId) {
				res.status(401).json({
					success: false,
					message: 'User not authenticated'
				});
				return;
			}

			console.log(`🗑️ Revoking instance ${instanceId} for service: ${serviceName}`);

			// Check if service exists
			if (!serviceRegistry.hasService(serviceName)) {
				res.status(404).json({
					success: false,
					message: `Service ${serviceName} not found or not active`
				});
				return;
			}

			// Call service revoke function
			const result = await serviceRegistry.callServiceFunction(
				serviceName,
				'revokeInstance',
				instanceId,
				userId
			);

			res.json(result);
		} catch (error) {
			console.error('Instance revocation error:', error);
			res.status(500).json({
				success: false,
				message: 'Failed to revoke instance'
			});
		}
	});


	/**
	 * Lists available services
	 * GET /auth/services
	 */
	router.get('/services', async (_req, res) => {
		try {
			const availableServices = serviceRegistry.getAvailableServices();
			const services = [];

			for (const serviceName of availableServices) {
				const service = serviceRegistry.getService(serviceName);
				if (service) {
					services.push({
						name: serviceName,
						type: service.type,
						functions: Object.keys(service.functions)
					});
				}
			}

			res.json({
				services,
				total: services.length,
				stats: serviceRegistry.getStats()
			});
		} catch (error) {
			console.error('Services listing error:', error);
			res.status(500).json({
				success: false,
				message: 'Failed to list available services'
			});
		}
	});


	/**
	 * Get registry statistics
	 * GET /auth/stats
	 */
	router.get('/stats', async (_req, res) => {
		try {
			const stats = serviceRegistry.getStats();
			res.json(stats);
		} catch (error) {
			console.error('Stats retrieval error:', error);
			res.status(500).json({
				success: false,
				message: 'Failed to retrieve registry statistics'
			});
		}
	});

	return router;
}


export { createAuthRoutes };