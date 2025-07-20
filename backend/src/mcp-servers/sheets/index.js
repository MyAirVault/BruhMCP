/**
 * Google Sheets MCP Server
 *
 * Multi-tenant Google Sheets service with OAuth authentication
 * Following Gmail MCP implementation patterns
 */

const express = require('express');
const cors = require('cors');
const { createHandlerSession, getHandlerSession } = require('./services/handler-sessions');
const credentialAuth = require('./middleware/credential-auth');
const callEndpoint = require('./endpoints/call');
const healthEndpoint = require('./endpoints/health');

const app = express();
const PORT = 49307;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Logging middleware
app.use((req, res, next) => {
	const timestamp = new Date().toISOString();
	console.log(`[${timestamp}] ${req.method} ${req.url}`);
	next();
});

// Global health endpoint
app.get('/health', (req, res) => {
	res.json({
		status: 'healthy',
		service: 'sheets-mcp',
		timestamp: new Date().toISOString(),
	});
});

// OAuth token caching endpoint (for OAuth service integration)
app.post('/cache-tokens', async (req, res) => {
	try {
		const { instance_id, tokens } = req.body;

		if (!instance_id || !tokens) {
			return res.status(400).json({
				error: 'Instance ID and tokens are required'
			});
		}

		// Cache tokens using existing credential cache
		const { setCachedCredential } = await import('./services/credential-cache.js');
		
		setCachedCredential(instance_id, {
			bearerToken: tokens.access_token,
			refreshToken: tokens.refresh_token,
			expiresAt: tokens.expires_at || (Date.now() + (tokens.expires_in * 1000)),
			user_id: tokens.user_id || 'unknown'
		});

		console.log(`✅ OAuth tokens cached for instance: ${instance_id}`);
		
		res.json({
			success: true,
			message: 'Tokens cached successfully',
			instance_id
		});

	} catch (error) {
		console.error('Token caching error:', error);
		res.status(500).json({
			error: 'Failed to cache tokens',
			details: error.message
		});
	}
});

// Instance-specific routes with credential authentication
app.use('/:instanceId', credentialAuth);

// Instance-specific health endpoint
app.get('/:instanceId/health', healthEndpoint);

// Main MCP call endpoint
app.post('/:instanceId/call', callEndpoint);

// Initialize handler session on first request
app.use('/:instanceId', async (req, res, next) => {
	const { instanceId } = req.params;

	try {
		let session = getHandlerSession(instanceId);
		if (!session) {
			session = await createHandlerSession(instanceId, req.oauth);
			console.log(`Created new handler session for instance: ${instanceId}`);
		}

		req.handlerSession = session;
		next();
	} catch (error) {
		console.error(`Failed to initialize handler session for ${instanceId}:`, error);
		res.status(500).json({
			error: 'Failed to initialize MCP handler session',
			details: error.message,
		});
	}
});

// Error handling middleware
app.use((error, req, res, next) => {
	console.error('Unhandled error:', error);
	res.status(500).json({
		error: 'Internal server error',
		message: error.message,
		timestamp: new Date().toISOString(),
	});
});

// 404 handler
app.use((req, res) => {
	res.status(404).json({
		error: 'Endpoint not found',
		path: req.path,
		method: req.method,
	});
});

app.listen(PORT, () => {
	console.log(`Google Sheets MCP Server running on port ${PORT}`);
	console.log(`Health check: http://localhost:${PORT}/health`);
	console.log(`Instance endpoint: http://localhost:${PORT}/:instanceId/call`);
});

export default app;
