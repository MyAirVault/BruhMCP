/**
 * Google Sheets MCP Service Entry Point
 * OAuth 2.0 Implementation following Multi-Tenant Architecture
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
import {
	createCredentialAuthMiddleware,
	createLightweightAuthMiddleware,
	createCachePerformanceMiddleware,
} from './middleware/credentialAuth.js';
import { initializeCredentialCache, getCacheStatistics } from './services/credentialCache.js';
import { startCredentialWatcher, stopCredentialWatcher, getWatcherStatus } from './services/credentialWatcher.js';
import { startSessionCleanup, stopSessionCleanup, getSessionStatistics } from './services/handlerSessions.js';
import { setupRoutes } from './routes.js';
import {
	createMCPLoggingMiddleware,
	createMCPErrorMiddleware,
	createMCPOperationMiddleware,
	createMCPServiceLogger,
} from '../../middleware/mcpLoggingMiddleware.js';

// Service configuration (from mcp-ports/sheets/config.json)
const SERVICE_CONFIG = {
	name: 'sheets',
	displayName: 'Google Sheets',
	port: 49307,
	authType: 'oauth',
	description: 'Spreadsheet service for managing Google Sheets',
	version: '1.0.0',
	iconPath: '/mcp-logos/sheets.svg',
	scopes: [
		'https://www.googleapis.com/auth/spreadsheets',
		'https://www.googleapis.com/auth/drive.readonly',
		'https://www.googleapis.com/auth/userinfo.profile',
		'https://www.googleapis.com/auth/userinfo.email',
	],
};

console.log(`🚀 Starting ${SERVICE_CONFIG.displayName} service on port ${SERVICE_CONFIG.port}`);

// Initialize Phase 2 credential caching system
initializeCredentialCache();

// Initialize logging system
const serviceLogger = createMCPServiceLogger(SERVICE_CONFIG.name, SERVICE_CONFIG);

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add MCP logging middleware for all instance-based routes
app.use('/:instanceId/*', createMCPLoggingMiddleware(SERVICE_CONFIG.name));
app.use('/:instanceId/*', createMCPOperationMiddleware(SERVICE_CONFIG.name));

// Add cache performance monitoring in development
if (process.env.NODE_ENV === 'development') {
	app.use(createCachePerformanceMiddleware());
}

/**
 * OAuth token caching endpoint for OAuth service integration
 */
app.post('/cache-tokens', async (req, res) => {
	try {
		const { instance_id, tokens } = req.body;

		if (!instance_id || !tokens) {
			res.status(400).json({
				error: 'Instance ID and tokens are required',
			});
			return;
		}

		// Cache tokens using existing credential cache
		const { setCachedCredential } = await import('./services/credentialCache.js');

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
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Token caching error:', errorMessage);
		res.status(500).json({
			error: 'Failed to cache tokens',
			details: errorMessage,
		});
	}
});

// Create authentication middleware (Phase 2 with OAuth caching)
const credentialAuthMiddleware = createCredentialAuthMiddleware();
const lightweightAuthMiddleware = createLightweightAuthMiddleware();

// Setup all routes
setupRoutes(app, SERVICE_CONFIG, credentialAuthMiddleware, lightweightAuthMiddleware);

// Debug endpoint for cache monitoring (development only)
if (process.env.NODE_ENV === 'development') {
	app.get('/debug/cache-status', (_, res) => {
		try {
			const cacheStats = getCacheStatistics();
			const watcherStatus = getWatcherStatus();
			const sessionStats = getSessionStatistics();

			res.json({
				service: SERVICE_CONFIG.name,
				cache_statistics: cacheStats,
				watcher_status: watcherStatus,
				session_statistics: sessionStats,
				oauth_scopes: SERVICE_CONFIG.scopes,
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

/**
 * Global error handler middleware
 */
app.use(/** @type {import('express').ErrorRequestHandler} */ ((err, _req, res, _next) => {
	console.error(`${SERVICE_CONFIG.displayName} service error:`, err);
	const errorMessage = err instanceof Error ? err.message : String(err);
	res.status(500).json({
		error: 'Internal server error',
		message: errorMessage,
		service: SERVICE_CONFIG.name,
	});
}));

// Start the server
const server = app.listen(SERVICE_CONFIG.port, () => {
	console.log(`✅ ${SERVICE_CONFIG.displayName} service running on port ${SERVICE_CONFIG.port}`);
	console.log(`🔗 Global Health: http://localhost:${SERVICE_CONFIG.port}/health`);
	console.log(`🏠 Instance Health: http://localhost:${SERVICE_CONFIG.port}/:instanceId/health`);
	console.log(`🔧 MCP SDK: POST http://localhost:${SERVICE_CONFIG.port}/:instanceId/mcp`);
	console.log(`🌐 Multi-tenant architecture enabled with instance-based routing`);
	console.log(`🚀 Phase 2: OAuth Bearer token caching system enabled`);
	console.log(`📋 MCP Protocol: JSON-RPC 2.0 via MCP SDK`);
	console.log(`📝 Instance logging system enabled`);
	console.log(`🔐 OAuth Scopes: ${SERVICE_CONFIG.scopes.join(', ')}`);

	// Initialize logging for service
	serviceLogger.logServiceStartup();

	// Start Phase 2 credential watcher for background maintenance
	startCredentialWatcher();

	// Start handler session cleanup service
	startSessionCleanup();
});

// Graceful shutdown
process.on('SIGTERM', () => {
	console.log(`📴 Shutting down ${SERVICE_CONFIG.displayName} service...`);
	stopCredentialWatcher();
	stopSessionCleanup();
	server.close(() => {
		console.log(`✅ ${SERVICE_CONFIG.displayName} service stopped gracefully`);
		process.exit(0);
	});
});

process.on('SIGINT', () => {
	console.log(`📴 Shutting down ${SERVICE_CONFIG.displayName} service...`);
	stopCredentialWatcher();
	stopSessionCleanup();
	server.close(() => {
		console.log(`✅ ${SERVICE_CONFIG.displayName} service stopped gracefully`);
		process.exit(0);
	});
});

export default app;