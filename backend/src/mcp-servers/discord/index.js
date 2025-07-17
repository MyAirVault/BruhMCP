/**
 * Discord MCP Service Entry Point
 * Multi-tenant OAuth implementation following Gmail MCP architecture
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env from backend root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const backendRoot = join(__dirname, '../../..');
dotenv.config({ path: join(backendRoot, '.env') });

import express from 'express';
import cors from 'cors';
import { DiscordMCPHandler } from './endpoints/mcp-handler.js';
import {
	createCredentialAuthMiddleware,
	createLightweightCredentialAuthMiddleware,
} from './middleware/credential-auth.js';
import { createDiscordApiRateLimitMiddleware, createStrictRateLimitMiddleware } from './middleware/rate-limit.js';
import { initializeCredentialCache, getCacheStatistics } from './services/credential-cache.js';
import { startCredentialWatcher, stopCredentialWatcher, getWatcherStatistics } from './services/credential-watcher.js';
import {
	getOrCreateHandler,
	startSessionCleanup,
	stopSessionCleanup,
	getSessionStatistics,
} from './services/handler-sessions.js';
import { ErrorResponses } from '../../utils/errorResponse.js';
import {
	createMCPLoggingMiddleware,
	createMCPErrorMiddleware,
	createMCPOperationMiddleware,
	createMCPServiceLogger,
} from '../../middleware/mcpLoggingMiddleware.js';
import { healthCheck } from './endpoints/health.js';

// Service configuration (following Gmail MCP architecture)
const SERVICE_CONFIG = {
	name: 'discord',
	displayName: 'Discord',
	port: 49260,
	authType: 'oauth',
	description: 'Discord is an instant messaging and VoIP social platform for communities and communication',
	version: '1.0.0',
	iconPath: '/mcp-logos/discord.svg',
	scopes: ['identify', 'email', 'connections', 'guilds', 'guilds.members.read', 'messages.read'],
};

console.log(`🚀 Starting ${SERVICE_CONFIG.displayName} MCP service on port ${SERVICE_CONFIG.port}`);
console.log(`🔧 Service configuration:`, SERVICE_CONFIG);

// Initialize Phase 2 credential caching system
initializeCredentialCache();

// Start credential watcher service
startCredentialWatcher();

// Initialize logging system
const serviceLogger = createMCPServiceLogger(SERVICE_CONFIG.name, SERVICE_CONFIG);

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Add MCP logging middleware for all instance-based routes
app.use('/:instanceId/*', createMCPLoggingMiddleware(SERVICE_CONFIG.name));
app.use('/:instanceId/*', createMCPOperationMiddleware(SERVICE_CONFIG.name));

// Create authentication middleware
const credentialAuthMiddleware = createCredentialAuthMiddleware();
const lightweightAuthMiddleware = createLightweightCredentialAuthMiddleware();

// Create rate limiting middleware
const apiRateLimitMiddleware = createDiscordApiRateLimitMiddleware();
const strictRateLimitMiddleware = createStrictRateLimitMiddleware();

// OAuth token caching endpoint (for OAuth service integration)
app.post('/cache-tokens', async (req, res) => {
	try {
		const { instance_id, tokens } = req.body;

		if (!instance_id || !tokens) {
			return res.status(400).json({
				error: 'Instance ID and tokens are required',
			});
		}

		// Cache tokens using existing credential cache
		const { setCachedCredential } = await import('./services/credential-cache.js');

		setCachedCredential(instance_id, {
			bearerToken: tokens.access_token,
			refreshToken: tokens.refresh_token,
			expiresAt: tokens.expires_at || Date.now() + tokens.expires_in * 1000,
			user_id: tokens.user_id || 'unknown',
		});

		console.log(`✅ OAuth tokens cached for instance: ${instance_id}`);

		res.json({
			success: true,
			message: 'Tokens cached successfully',
			instance_id,
		});
	} catch (error) {
		console.error('Token caching error:', error);
		res.status(500).json({
			error: 'Failed to cache tokens',
			details: error.message,
		});
	}
});

// Global health endpoint (no instance required)
app.get('/health', async (_, res) => {
	try {
		const healthStatus = await healthCheck(SERVICE_CONFIG);
		res.json(healthStatus);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		ErrorResponses.internal(res, `${SERVICE_CONFIG.displayName} service health check failed`, {
			metadata: { service: SERVICE_CONFIG.name, errorMessage },
		});
	}
});

// OAuth well-known endpoint for OAuth 2.0 discovery
app.get('/.well-known/oauth-authorization-server/:instanceId', (req, res) => {
	res.json({
		issuer: `https://discord.com`,
		authorization_endpoint: 'https://discord.com/api/oauth2/authorize',
		token_endpoint: 'https://discord.com/api/oauth2/token',
		revocation_endpoint: 'https://discord.com/api/oauth2/token/revoke',
		scopes_supported: SERVICE_CONFIG.scopes,
		response_types_supported: ['code'],
		grant_types_supported: ['authorization_code', 'refresh_token'],
		token_endpoint_auth_methods_supported: ['client_secret_post', 'client_secret_basic'],
	});
});

// Instance health endpoint (using lightweight auth)
app.get('/:instanceId/health', lightweightAuthMiddleware, async (req, res) => {
	try {
		const baseHealthStatus = await healthCheck(SERVICE_CONFIG);
		const healthStatus = {
			...baseHealthStatus,
			instanceId: req.instanceId,
			message: 'Instance-specific health check',
			authType: 'oauth2',
			tokenTypes: ['bearer'],
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

// MCP JSON-RPC endpoint at base instance URL for Claude Code compatibility
app.post('/:instanceId', apiRateLimitMiddleware, credentialAuthMiddleware, async (req, res) => {
	try {
		// Get or create persistent handler for this instance
		const mcpHandler = getOrCreateHandler(req.instanceId, SERVICE_CONFIG, req.bearerToken || '');

		// Process the MCP message with persistent handler
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

// MCP JSON-RPC endpoint at /mcp path (requires full authentication)
app.post('/:instanceId/mcp', apiRateLimitMiddleware, credentialAuthMiddleware, async (req, res) => {
	try {
		// Get or create persistent handler for this instance
		const mcpHandler = getOrCreateHandler(req.instanceId, SERVICE_CONFIG, req.bearerToken || '');

		// Process the MCP message with persistent handler
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

// Tools endpoint (for compatibility)
app.get('/tools', (req, res) => {
	res.json({
		service: SERVICE_CONFIG.name,
		version: SERVICE_CONFIG.version,
		tools: [
			'get_current_user',
			'get_user_guilds',
			'get_user_connections',
			'get_guild',
			'get_guild_member',
			'get_guild_channels',
			'get_channel',
			'get_channel_messages',
			'send_message',
			'edit_message',
			'delete_message',
			'add_reaction',
			'remove_reaction',
			'get_invite',
			'create_invite',
		],
	});
});

// Debug endpoint for cache monitoring (development only)
if (process.env.NODE_ENV === 'development') {
	app.get('/debug/cache-status', (_, res) => {
		try {
			const cacheStats = getCacheStatistics();
			const sessionStats = getSessionStatistics();
			const watcherStats = getWatcherStatistics();

			res.json({
				service: SERVICE_CONFIG.name,
				cache_statistics: cacheStats,
				session_statistics: sessionStats,
				watcher_statistics: watcherStats,
				timestamp: new Date().toISOString(),
			});
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			res.status(500).json({
				error: 'Failed to get cache status',
				message: errorMessage,
			});
		}
	});
}

// Error handling middleware with logging
app.use(createMCPErrorMiddleware(SERVICE_CONFIG.name));

// General error handler
app.use((err, req, res, next) => {
	console.error(`${SERVICE_CONFIG.displayName} service error:`, err);
	const errorMessage = err instanceof Error ? err.message : String(err);
	ErrorResponses.internal(res, 'Internal server error', {
		metadata: { service: SERVICE_CONFIG.name, errorMessage },
	});
});

// 404 handler
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
				'GET /tools (compatibility)',
			],
		},
	});
});

// Start server
const server = app.listen(SERVICE_CONFIG.port, () => {
	console.log(`✅ ${SERVICE_CONFIG.displayName} service running on port ${SERVICE_CONFIG.port}`);
	console.log(`🔗 Global Health: http://localhost:${SERVICE_CONFIG.port}/health`);
	console.log(`🏠 Instance Health: http://localhost:${SERVICE_CONFIG.port}/:instanceId/health`);
	console.log(`🔧 MCP SDK: POST http://localhost:${SERVICE_CONFIG.port}/:instanceId/mcp`);
	console.log(`🌐 Multi-tenant architecture enabled with instance-based routing`);
	console.log(`🚀 Token caching system enabled`);
	console.log(`📋 MCP Protocol: JSON-RPC 2.0 via MCP SDK`);
	console.log(`📝 Instance logging system enabled`);
	console.log(`🔐 Auth Types: Bearer Token`);
	console.log(`🔧 Tools endpoint: http://localhost:${SERVICE_CONFIG.port}/tools`);

	// Initialize logging for service
	serviceLogger.logServiceStartup();

	// Start handler session cleanup service
	startSessionCleanup();

	console.log(`🔄 Credential watcher service started`);
	console.log(`💾 Database integration enabled`);
	console.log(`🔐 OAuth2 token refresh enabled`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
	console.log(`📴 Shutting down ${SERVICE_CONFIG.displayName} service...`);
	stopSessionCleanup();
	stopCredentialWatcher();
	server.close(() => {
		console.log(`✅ ${SERVICE_CONFIG.displayName} service stopped gracefully`);
		process.exit(0);
	});
});

process.on('SIGINT', () => {
	console.log(`📴 Shutting down ${SERVICE_CONFIG.displayName} service...`);
	stopSessionCleanup();
	stopCredentialWatcher();
	server.close(() => {
		console.log(`✅ ${SERVICE_CONFIG.displayName} service stopped gracefully`);
		process.exit(0);
	});
});

export default app;
