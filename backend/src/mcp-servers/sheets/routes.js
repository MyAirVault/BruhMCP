/**
 * Google Sheets MCP Service Routes
 * Express route handlers for the Sheets service
 */

import healthCheck from './endpoints/health.js';
import { getOrCreateHandler } from './services/handlerSessions.js';
import { ErrorResponses } from '../../utils/errorResponse.js';

/**
 * Setup routes for the Sheets service
 * @param {import('express').Application} app - Express app instance
 * @param {Object} SERVICE_CONFIG - Service configuration
 * @param {Function} credentialAuthMiddleware - Credential auth middleware
 * @param {Function} lightweightAuthMiddleware - Lightweight auth middleware
 */
export function setupRoutes(app, SERVICE_CONFIG, credentialAuthMiddleware, lightweightAuthMiddleware) {
	/**
	 * Global health endpoint (no instance required)
	 */
	app.get('/health', (_, res) => {
		try {
			const healthStatus = healthCheck(SERVICE_CONFIG);
			res.json(healthStatus);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			ErrorResponses.internal(res, `${SERVICE_CONFIG.displayName} service health check failed`, {
				metadata: { service: SERVICE_CONFIG.name, errorMessage },
			});
		}
	});

	/**
	 * OAuth well-known endpoint for OAuth 2.0 discovery
	 */
	app.get('/.well-known/oauth-authorization-server/:instanceId', (_, res) => {
		res.json({
			issuer: `https://accounts.google.com`,
			authorization_endpoint: 'https://accounts.google.com/o/oauth2/auth',
			token_endpoint: 'https://oauth2.googleapis.com/token',
			userinfo_endpoint: 'https://www.googleapis.com/oauth2/v2/userinfo',
			revocation_endpoint: 'https://oauth2.googleapis.com/revoke',
			scopes_supported: SERVICE_CONFIG.scopes,
			response_types_supported: ['code'],
			grant_types_supported: ['authorization_code', 'refresh_token'],
			token_endpoint_auth_methods_supported: ['client_secret_post', 'client_secret_basic'],
		});
	});

	/**
	 * Instance health endpoint (using lightweight auth - no credential caching needed)
	 */
	app.get('/:instanceId/health', lightweightAuthMiddleware, (req, res) => {
		try {
			const healthStatus = {
				...healthCheck(SERVICE_CONFIG),
				instanceId: req.instanceId,
				message: 'Instance-specific health check',
				authType: 'oauth',
				scopes: SERVICE_CONFIG.scopes,
			};
			res.json(healthStatus);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			ErrorResponses.internal(res, `${SERVICE_CONFIG.displayName} instance health check failed`, {
				instanceId: req.instanceId,
				metadata: { service: SERVICE_CONFIG.name, errorMessage },
			});
		}
	});

	/**
	 * MCP JSON-RPC endpoint at base instance URL for Claude Code compatibility
	 */
	app.post('/:instanceId', credentialAuthMiddleware, async (req, res) => {
		try {
			// Get or create persistent handler for this instance
			const mcpHandler = getOrCreateHandler(req.instanceId, SERVICE_CONFIG, req.bearerToken || '');

			// Process the MCP message with persistent handler (using new SDK signature)
			await mcpHandler.handleMCPRequest(req, res, req.body);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			console.error('MCP processing error:', errorMessage);

			// Return proper MCP JSON-RPC error response
			res.json({
				jsonrpc: '2.0',
				id: req.body?.id || null,
				error: {
					code: -32603,
					message: 'Internal error',
					data: { details: errorMessage },
				},
			});
		}
	});

	/**
	 * MCP JSON-RPC endpoint at /mcp path (requires full credential authentication with caching)
	 */
	app.post('/:instanceId/mcp', credentialAuthMiddleware, async (req, res) => {
		try {
			// Get or create persistent handler for this instance
			const mcpHandler = getOrCreateHandler(req.instanceId, SERVICE_CONFIG, req.bearerToken || '');

			// Process the MCP message with persistent handler (using new SDK signature)
			await mcpHandler.handleMCPRequest(req, res, req.body);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			console.error('MCP processing error:', errorMessage);

			// Return proper MCP JSON-RPC error response
			res.json({
				jsonrpc: '2.0',
				id: req.body?.id || null,
				error: {
					code: -32603,
					message: 'Internal error',
					data: { details: errorMessage },
				},
			});
		}
	});

	/**
	 * 404 handler for unmatched routes
	 */
	app.use('*', (req, res) => {
		ErrorResponses.notFound(res, 'Endpoint', {
			metadata: {
				service: SERVICE_CONFIG.name,
				requested: `${req.method} ${req.originalUrl}`,
				availableEndpoints: [
					'GET /health (global)',
					'GET /:instanceId/health',
					'POST /:instanceId (JSON-RPC 2.0)',
					'POST /:instanceId/mcp (JSON-RPC 2.0)',
					'GET /.well-known/oauth-authorization-server/:instanceId',
				],
			},
		});
	});
}