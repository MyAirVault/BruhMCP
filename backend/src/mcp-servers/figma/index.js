/**
 * Figma MCP Service Entry Point
 * Phase 1 Implementation
 */

/// <reference path="../../types/figma.d.ts" />

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
import { healthCheck } from './endpoints/health.js';
import { createCredentialAuthMiddleware, createLightweightAuthMiddleware, createCachePerformanceMiddleware } from './middleware/credential-auth.js';
import { initializeCredentialCache, getCacheStatistics } from './services/credential-cache.js';
import { startCredentialWatcher, stopCredentialWatcher, getWatcherStatus } from './services/credential-watcher.js';
import { getOrCreateHandler, startSessionCleanup, stopSessionCleanup, getSessionStatistics } from './services/handler-sessions.js';
import { ErrorResponses } from '../../utils/errorResponse.js';
import { createMCPLoggingMiddleware, createMCPErrorMiddleware, createMCPOperationMiddleware, createMCPServiceLogger } from '../../middleware/mcpLoggingMiddleware.js';

// Service configuration (from database)
const SERVICE_CONFIG = {
  name: 'figma',
  displayName: 'Figma',
  port: 49280,
  authType: 'api_key',
  description: 'Design collaboration platform with vector graphics editor and design systems',
  version: '1.0.0'
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

// Create authentication middleware (Phase 2 with caching)
const credentialAuthMiddleware = createCredentialAuthMiddleware();
const lightweightAuthMiddleware = createLightweightAuthMiddleware();


// Global health endpoint (no instance required)
app.get('/health', (_, res) => {
  try {
    const healthStatus = healthCheck(SERVICE_CONFIG);
    res.json(healthStatus);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    ErrorResponses.internal(res, `${SERVICE_CONFIG.displayName} service health check failed`, {
      metadata: { service: SERVICE_CONFIG.name, errorMessage }
    });
  }
});

// Instance-based endpoints with multi-tenant routing

// OAuth well-known endpoint (return 404 as Figma uses API keys, not OAuth)
app.get('/.well-known/oauth-authorization-server/:instanceId', (_, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'This MCP server uses API key authentication, not OAuth'
  });
});

// Instance health endpoint (using lightweight auth - no credential caching needed)
app.get('/:instanceId/health', lightweightAuthMiddleware, (req, res) => {
  try {
    const healthStatus = {
      ...healthCheck(SERVICE_CONFIG),
      instanceId: req.instanceId,
      message: 'Instance-specific health check'
    };
    res.json(healthStatus);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    ErrorResponses.internal(res, `${SERVICE_CONFIG.displayName} instance health check failed`, {
      instanceId: req.instanceId,
      metadata: { service: SERVICE_CONFIG.name, errorMessage }
    });
  }
});

// MCP JSON-RPC endpoint at base instance URL for Claude Code compatibility
app.post('/:instanceId', credentialAuthMiddleware, async (req, res) => {
  try {
    // Get or create persistent handler for this instance
    const jsonRpcHandler = getOrCreateHandler(
      /** @type {string} */ (req.instanceId),
      SERVICE_CONFIG,
      /** @type {string} */ (req.figmaApiKey) || ''
    );
    
    // Process the MCP message with persistent handler (using new signature)
    await jsonRpcHandler.handleMCPRequest(req, res, req.body);
    
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
        data: { details: errorMessage }
      }
    });
  }
});

// MCP JSON-RPC endpoint at /mcp path (requires full credential authentication with caching)
app.post('/:instanceId/mcp', credentialAuthMiddleware, async (req, res) => {
  try {
    // Get or create persistent handler for this instance
    const jsonRpcHandler = getOrCreateHandler(
      /** @type {string} */ (req.instanceId),
      SERVICE_CONFIG,
      /** @type {string} */ (req.figmaApiKey) || ''
    );
    
    // Process the MCP message with persistent handler (using new signature)
    await jsonRpcHandler.handleMCPRequest(req, res, req.body);
    
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
        data: { details: errorMessage }
      }
    });
  }
});


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
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({
        error: 'Failed to get cache status',
        message: errorMessage
      });
    }
  });
}

// Error handling middleware with logging
app.use(createMCPErrorMiddleware(SERVICE_CONFIG.name));

/**
 * Error handling middleware with logging
 * @param {Error} err - Error object
 * @param {import('express').Request} _req - Express request object (unused)
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} _next - Express next function (unused)
 */
app.use((/** @type {Error} */ err, /** @type {import('express').Request} */ _req, /** @type {import('express').Response} */ res, /** @type {import('express').NextFunction} */ _next) => {
  console.error(`${SERVICE_CONFIG.displayName} service error:`, err);
  const errorMessage = err instanceof Error ? err.message : String(err);
  ErrorResponses.internal(res, 'Internal server error', {
    metadata: { service: SERVICE_CONFIG.name, errorMessage }
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
        'POST /:instanceId/mcp (JSON-RPC 2.0)'
      ]
    }
  });
});

// Start the server
const server = app.listen(SERVICE_CONFIG.port, () => {
  console.log(`✅ ${SERVICE_CONFIG.displayName} service running on port ${SERVICE_CONFIG.port}`);
  console.log(`🔗 Global Health: http://localhost:${SERVICE_CONFIG.port}/health`);
  console.log(`🏠 Instance Health: http://localhost:${SERVICE_CONFIG.port}/:instanceId/health`);
  console.log(`🔧 MCP JSON-RPC: POST http://localhost:${SERVICE_CONFIG.port}/:instanceId/mcp`);
  console.log(`🌐 Multi-tenant architecture enabled with instance-based routing`);
  console.log(`🚀 Phase 2: Credential caching system enabled`);
  console.log(`📋 MCP Protocol: JSON-RPC 2.0 exclusively`);
  console.log(`📝 Instance logging system enabled`);
  
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