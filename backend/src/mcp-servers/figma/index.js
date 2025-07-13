/**
 * Figma MCP Service Entry Point
 * Phase 1 Implementation
 */

/// <reference path="../../types/figma.d.ts" />

import express from 'express';
import cors from 'cors';
import { healthCheck } from './endpoints/health.js';
import { getTools } from './endpoints/tools.js';
import { executeToolCall } from './endpoints/call.js';
import { createCredentialAuthMiddleware, createLightweightAuthMiddleware, createCachePerformanceMiddleware } from './middleware/credential-auth.js';
import { initializeCredentialCache, getCacheStatistics } from './services/credential-cache.js';
import { startCredentialWatcher, stopCredentialWatcher, getWatcherStatus } from './services/credential-watcher.js';
import { ErrorResponses } from '../../utils/errorResponse.js';

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

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Get available tools (using lightweight auth - basic validation only)
app.get('/:instanceId/mcp/tools', lightweightAuthMiddleware, (req, res) => {
  try {
    const tools = {
      ...getTools(),
      instanceId: req.instanceId,
      message: 'Instance-specific tools'
    };
    res.json(tools);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    ErrorResponses.internal(res, 'Failed to retrieve tools', {
      instanceId: req.instanceId,
      metadata: { errorMessage }
    });
  }
});

// Execute tool calls (requires full credential authentication with caching)
app.post('/:instanceId/mcp/call', credentialAuthMiddleware, async (req, res) => {
  try {
    const { name, arguments: args } = req.body;
    
    if (!name) {
      return ErrorResponses.missingField(res, 'name', { instanceId: req.instanceId });
    }
    
    if (!args) {
      return ErrorResponses.missingField(res, 'arguments', { instanceId: req.instanceId });
    }
    
    // Execute the tool call with the instance's API key
    const result = await executeToolCall(name, args, req.figmaApiKey || '');
    res.json({
      ...result,
      instanceId: req.instanceId,
      userId: req.userId,
      cache_hit: req.cacheHit
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    ErrorResponses.internal(res, 'Tool execution failed', {
      instanceId: req.instanceId,
      metadata: { 
        errorMessage,
        content: [{ type: 'text', text: `Error: ${errorMessage}` }]
      }
    });
  }
});

// Additional endpoints for direct API access (authenticated)

// Get file info directly (requires full credential authentication with caching)
app.get('/:instanceId/api/files/:fileKey', credentialAuthMiddleware, async (req, res) => {
  try {
    const { fileKey } = req.params;
    const result = await executeToolCall('get_figma_file', { fileKey }, req.figmaApiKey || '');
    res.json({
      ...result,
      instanceId: req.instanceId
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      error: 'Failed to get file info',
      message: errorMessage,
      instanceId: req.instanceId
    });
  }
});

// Get components directly (requires full credential authentication with caching)
app.get('/:instanceId/api/files/:fileKey/components', credentialAuthMiddleware, async (req, res) => {
  try {
    const { fileKey } = req.params;
    const result = await executeToolCall('get_figma_components', { fileKey }, req.figmaApiKey || '');
    res.json({
      ...result,
      instanceId: req.instanceId
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      error: 'Failed to get components',
      message: errorMessage,
      instanceId: req.instanceId
    });
  }
});

// Debug endpoint for cache monitoring (development only)
if (process.env.NODE_ENV === 'development') {
  app.get('/debug/cache-status', (_, res) => {
    try {
      const cacheStats = getCacheStatistics();
      const watcherStatus = getWatcherStatus();
      
      res.json({
        service: SERVICE_CONFIG.name,
        cache_statistics: cacheStats,
        watcher_status: watcherStatus,
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

// Error handling middleware
/**
 * @param {any} err
 * @param {any} _
 * @param {any} res
 * @param {any} __
 */
app.use((err, _, res, __) => {
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
        'GET /:instanceId/mcp/tools',
        'POST /:instanceId/mcp/call',
        'GET /:instanceId/api/files/:fileKey',
        'GET /:instanceId/api/files/:fileKey/components'
      ]
    }
  });
});

// Start the server
const server = app.listen(SERVICE_CONFIG.port, () => {
  console.log(`✅ ${SERVICE_CONFIG.displayName} service running on port ${SERVICE_CONFIG.port}`);
  console.log(`🔗 Global Health: http://localhost:${SERVICE_CONFIG.port}/health`);
  console.log(`🏠 Instance Health: http://localhost:${SERVICE_CONFIG.port}/:instanceId/health`);
  console.log(`🛠️  MCP Tools: http://localhost:${SERVICE_CONFIG.port}/:instanceId/mcp/tools`);
  console.log(`📞 MCP Call: POST http://localhost:${SERVICE_CONFIG.port}/:instanceId/mcp/call`);
  console.log(`📁 File API: GET http://localhost:${SERVICE_CONFIG.port}/:instanceId/api/files/:fileKey`);
  console.log(`🌐 Multi-tenant architecture enabled with instance-based routing`);
  console.log(`🚀 Phase 2: Credential caching system enabled`);
  
  // Start Phase 2 credential watcher for background maintenance
  startCredentialWatcher();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log(`📴 Shutting down ${SERVICE_CONFIG.displayName} service...`);
  stopCredentialWatcher();
  server.close(() => {
    console.log(`✅ ${SERVICE_CONFIG.displayName} service stopped gracefully`);
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log(`📴 Shutting down ${SERVICE_CONFIG.displayName} service...`);
  stopCredentialWatcher();
  server.close(() => {
    console.log(`✅ ${SERVICE_CONFIG.displayName} service stopped gracefully`);
    process.exit(0);
  });
});

export default app;