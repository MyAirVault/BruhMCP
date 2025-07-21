# MCP Service Implementation Template

**Based on Gmail MCP Implementation Analysis**

This comprehensive template provides everything needed to create a new MCP (Model Context Protocol) service following the established patterns and architecture from the Gmail implementation.

## Table of Contents

1. [Quick Start Checklist](#quick-start-checklist)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Implementation Steps](#implementation-steps)
5. [Code Templates](#code-templates)
6. [Configuration Guide](#configuration-guide)
7. [Testing & Deployment](#testing--deployment)
8. [Best Practices](#best-practices)

---

## Quick Start Checklist

### Pre-Implementation

-   [ ] Choose service name and display name
-   [ ] Determine OAuth provider and scopes
-   [ ] Assign unique port number
-   [ ] Define service tools and capabilities
-   [ ] Set up database schema if needed

### Required Files (25 total)

-   [ ] `index.js` - Main entry point
-   [ ] `db/service.sql` - Database schema
-   [ ] **Endpoints** (5 files)
    -   [ ] `endpoints/call.js` - Tool execution dispatcher
    -   [ ] `endpoints/health.js` - Health check endpoint
    -   [ ] `endpoints/jsonrpc-handler.js` - Legacy JSON-RPC handler
    -   [ ] `endpoints/mcp-handler.js` - Modern MCP handler
    -   [ ] `endpoints/tools.js` - Tool definitions
-   [ ] **Services** (4 files)
    -   [ ] `services/credential-cache.js` - OAuth token caching
    -   [ ] `services/credential-watcher.js` - Background token refresh
    -   [ ] `services/database.js` - Database abstraction
    -   [ ] `services/handler-sessions.js` - Session management
-   [ ] **API** (2+ files)
    -   [ ] `api/{service}-api.js` - Main API operations
    -   [ ] `api/{feature}-operations.js` - Feature-specific operations
-   [ ] **Middleware** (1 file)
    -   [ ] `middleware/credential-auth.js` - Authentication middleware
-   [ ] **Utils** (7 files)
    -   [ ] `utils/{service}-formatting.js` - Response formatting
    -   [ ] `utils/oauth-integration.js` - OAuth service integration
    -   [ ] `utils/oauth-validation.js` - OAuth token validation
    -   [ ] `utils/oauth-error-handler.js` - OAuth error handling
    -   [ ] `utils/token-metrics.js` - Metrics collection
    -   [ ] `utils/validation.js` - Tool argument validation
    -   [ ] `utils/logger.js` - Service-specific logging utilities
-   [ ] **Validation** (1 file)
    -   [ ] `validation/credential-validator.js` - Credential validation
-   [ ] **Logs** (auto-generated)
    -   [ ] `logs/` - Directory for structured log files (created automatically)

---

## Project Structure

```
backend/src/mcp-servers/{service}/
├── index.js                           # Main entry point
├── db/
│   └── service.sql                    # Database schema
├── endpoints/
│   ├── call.js                        # Tool execution dispatcher
│   ├── health.js                      # Health check endpoint
│   ├── jsonrpc-handler.js             # Legacy JSON-RPC handler
│   ├── mcp-handler.js                 # Modern MCP handler (MCP SDK)
│   └── tools.js                       # Tool definitions with Zod schemas
├── services/
│   ├── credential-cache.js            # OAuth token caching system
│   ├── credential-watcher.js          # Background token refresh
│   ├── database.js                    # Database abstraction layer
│   └── handler-sessions.js            # Session management
├── api/
│   ├── {service}-api.js               # Main API operations
│   └── {feature}-operations.js        # Feature-specific operations
├── middleware/
│   └── credential-auth.js             # Multi-layered authentication
├── utils/
│   ├── {service}-formatting.js        # Response formatting for MCP
│   ├── oauth-integration.js           # OAuth service integration
│   ├── oauth-validation.js            # OAuth token validation
│   ├── oauth-error-handler.js         # Centralized OAuth error handling
│   ├── token-metrics.js               # Comprehensive metrics collection
│   ├── validation.js                  # Tool argument validation
│   └── logger.js                      # Service-specific logging utilities
├── validation/
│   └── credential-validator.js        # Credential format validation
└── logs/
    └── system/                        # Structured log files (auto-generated)
        ├── application-YYYY-MM-DD.log # General application events
        ├── security-YYYY-MM-DD.log    # Security and auth events
        ├── performance-YYYY-MM-DD.log # Performance monitoring
        ├── audit-YYYY-MM-DD.log       # Audit trail
        ├── database-YYYY-MM-DD.log    # Database operations
        └── cache-YYYY-MM-DD.log       # Cache operations
```

**User-Specific Logs** (auto-generated per instance):
```
logs/users/user_{userId}/mcp_{instanceId}/
├── app.log                            # Application-level events
├── access.log                         # HTTP request/response logging
└── error.log                          # Error logging with stack traces
```

---

## Core Components

### 1. Service Configuration

Every MCP service requires a configuration object in `index.js`:

```javascript
const SERVICE_CONFIG = {
  name: 'your-service',              // Unique service identifier
  displayName: 'Your Service',       // Human-readable name
  port: 49XXX,                       // Unique port number from mcp-ports/{service-name}
  authType: 'oauth',                 // Authentication type
  description: 'Service description', // Brief description
  version: '1.0.0',                  // Service version
  iconPath: '/mcp-logos/service.svg', // Icon path
  scopes: [                          // OAuth scopes required
    'https://api.provider.com/scope1',
    'https://api.provider.com/scope2'
  ]
};
```

### 2. Multi-Tenant Architecture

All services use instance-based routing:

-   Global endpoints: `/health`
-   Instance endpoints: `/:instanceId/health`, `/:instanceId/mcp`
-   OAuth discovery: `/.well-known/oauth-authorization-server/:instanceId`

### 3. Authentication Flow

1. **OAuth Service Integration** (Primary)
2. **Direct OAuth Provider** (Fallback)
3. **Token Caching** (In-memory with expiration)
4. **Background Refresh** (Automatic token maintenance)

### 4. MCP Protocol Implementation

-   **Transport**: StreamableHTTPServerTransport
-   **Protocol**: JSON-RPC 2.0 with MCP extensions
-   **Validation**: Zod schemas for all tools
-   **Error Handling**: MCP-compliant error responses

### 5. Structured Logging System

-   **System Logs**: Daily rotated logs with categorization (application, security, performance, audit, database, cache)
-   **User Logs**: Per-instance logs for monitoring (`app.log`, `access.log`, `error.log`)
-   **Log Format**: JSON structured with timestamps, context, and correlation IDs
-   **Log Management**: Automatic rotation, compression, and 90-day retention

---

## Implementation Steps

### Step 1: Create Service Directory Structure

```bash
mkdir -p backend/src/mcp-servers/{service-name}/{endpoints,services,api,middleware,utils,validation,db}
```

### Step 2: Implement Core Files

Start with these files in order:

1. **Database Schema** (`db/service.sql`)
2. **Service Configuration** (`index.js` - partial)
3. **Authentication Middleware** (`middleware/credential-auth.js`)
4. **Health Check** (`endpoints/health.js`)
5. **API Integration** (`api/{service}-api.js`)
6. **Tool Definitions** (`endpoints/tools.js`)
7. **MCP Handler** (`endpoints/mcp-handler.js`)
8. **Main Entry Point** (`index.js` - complete)

### Step 3: Add Supporting Services

1. **Credential Cache** (`services/credential-cache.js`)
2. **Credential Watcher** (`services/credential-watcher.js`)
3. **Session Management** (`services/handler-sessions.js`)
4. **Database Abstraction** (`services/database.js`)

### Step 4: Implement Utilities

1. **OAuth Integration** (`utils/oauth-integration.js`)
2. **Response Formatting** (`utils/{service}-formatting.js`)
3. **Validation** (`utils/validation.js`)
4. **Error Handling** (`utils/oauth-error-handler.js`)
5. **Metrics** (`utils/token-metrics.js`)

### Step 5: Testing & Deployment

1. **Unit Tests** - Test individual components
2. **Integration Tests** - Test OAuth flow
3. **MCP Protocol Tests** - Test tool execution
4. **Load Testing** - Test concurrent requests

---

## Code Templates

### 1. Main Entry Point (`index.js`)

```javascript
/**
 * {Service Name} MCP Service Entry Point
 * OAuth 2.0 Implementation following Multi-Tenant Architecture
 */

/// <reference path="../../types/{service}.d.ts" />

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

// Service configuration
const SERVICE_CONFIG = {
  name: '{service-name}',
  displayName: '{Service Display Name}',
  port: {port-number},
  authType: 'oauth',
  description: '{Service description}',
  version: '1.0.0',
  iconPath: '/mcp-logos/{service}.svg',
  scopes: [
    '{oauth-scope-1}',
    '{oauth-scope-2}'
  ]
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

// Create authentication middleware
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

// OAuth well-known endpoint for OAuth 2.0 discovery
app.get('/.well-known/oauth-authorization-server/:instanceId', (req, res) => {
  res.json({
    issuer: `{oauth-provider-issuer}`,
    authorization_endpoint: '{oauth-authorization-endpoint}',
    token_endpoint: '{oauth-token-endpoint}',
    userinfo_endpoint: '{oauth-userinfo-endpoint}',
    revocation_endpoint: '{oauth-revocation-endpoint}',
    scopes_supported: SERVICE_CONFIG.scopes,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    token_endpoint_auth_methods_supported: ['client_secret_post', 'client_secret_basic']
  });
});

// Instance health endpoint
app.get('/:instanceId/health', lightweightAuthMiddleware, (req, res) => {
  try {
    const healthStatus = {
      ...healthCheck(SERVICE_CONFIG),
      instanceId: req.instanceId,
      message: 'Instance-specific health check',
      authType: 'oauth',
      scopes: SERVICE_CONFIG.scopes
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

// MCP JSON-RPC endpoint at base instance URL
app.post('/:instanceId', credentialAuthMiddleware, async (req, res) => {
  try {
    const mcpHandler = getOrCreateHandler(
      req.instanceId,
      SERVICE_CONFIG,
      req.bearerToken || ''
    );

    await mcpHandler.handleMCPRequest(req, res, req.body);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('MCP processing error:', errorMessage);

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

// MCP JSON-RPC endpoint at /mcp path
app.post('/:instanceId/mcp', credentialAuthMiddleware, async (req, res) => {
  try {
    const mcpHandler = getOrCreateHandler(
      req.instanceId,
      SERVICE_CONFIG,
      req.bearerToken || ''
    );

    await mcpHandler.handleMCPRequest(req, res, req.body);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('MCP processing error:', errorMessage);

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
        oauth_scopes: SERVICE_CONFIG.scopes,
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
app.use(createMCPErrorMiddleware(SERVICE_CONFIG.name));

app.use((err, req, res, next) => {
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
        'POST /:instanceId/mcp (JSON-RPC 2.0)',
        'GET /.well-known/oauth-authorization-server/:instanceId'
      ]
    }
  });
});

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

  serviceLogger.logServiceStartup();
  startCredentialWatcher();
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
```

### 2. Tool Definitions (`endpoints/tools.js`)

```javascript
/**
 * {Service Name} MCP Tools Definition
 * Comprehensive tool definitions with Zod validation schemas
 */

import { z } from 'zod';

// Tool argument validation schemas
const toolSchemas = {
	// Example tool schema
	exampleTool: z.object({
		param1: z.string().min(1, 'Parameter 1 is required'),
		param2: z.number().optional(),
		param3: z.boolean().default(false),
	}),

	// Add more tool schemas here
};

// Tool definitions for MCP protocol
export const toolDefinitions = [
	{
		name: 'example_tool',
		description: 'Example tool that demonstrates the pattern',
		inputSchema: {
			type: 'object',
			properties: {
				param1: {
					type: 'string',
					description: 'Required string parameter',
				},
				param2: {
					type: 'number',
					description: 'Optional number parameter',
				},
				param3: {
					type: 'boolean',
					description: 'Optional boolean parameter',
					default: false,
				},
			},
			required: ['param1'],
		},
	},

	// Add more tool definitions here
];

// Validation function
export function validateToolArguments(toolName, arguments_) {
	const schema = toolSchemas[toolName];
	if (!schema) {
		throw new Error(`Unknown tool: ${toolName}`);
	}

	return schema.parse(arguments_);
}

// Get tool definition by name
export function getToolDefinition(toolName) {
	return toolDefinitions.find(tool => tool.name === toolName);
}

// Get all tool names
export function getToolNames() {
	return toolDefinitions.map(tool => tool.name);
}
```

### 3. MCP Handler (`endpoints/mcp-handler.js`)

```javascript
/**
 * {Service Name} MCP Handler
 * Modern MCP SDK implementation with session management
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { toolDefinitions } from './tools.js';
import { handleToolCall } from './call.js';

/**
 * Creates MCP handler for service instance
 */
export function createMCPHandler(instanceId, serviceConfig, bearerToken) {
	const server = new Server(
		{
			name: `${serviceConfig.name}-${instanceId}`,
			version: serviceConfig.version,
			description: serviceConfig.description,
		},
		{
			capabilities: {
				tools: {},
				logging: {},
			},
		}
	);

	// Register tools
	server.setRequestHandler('tools/list', async () => {
		return {
			tools: toolDefinitions,
		};
	});

	// Handle tool calls
	server.setRequestHandler('tools/call', async request => {
		const { name, arguments: args } = request.params;

		try {
			const result = await handleToolCall(name, args, bearerToken, instanceId);

			return {
				content: [
					{
						type: 'text',
						text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
					},
				],
				isError: false,
			};
		} catch (error) {
			console.error(`Tool call error (${name}):`, error);

			return {
				content: [
					{
						type: 'text',
						text: `Error: ${error.message}`,
					},
				],
				isError: true,
			};
		}
	});

	// Handle MCP request
	server.handleMCPRequest = async (req, res, body) => {
		const transport = new StreamableHTTPServerTransport({
			request: req,
			response: res,
		});

		try {
			await server.connect(transport);

			// Process the request
			const response = await server.processRequest(body);

			if (response) {
				res.json(response);
			}
		} catch (error) {
			console.error('MCP request processing error:', error);
			res.json({
				jsonrpc: '2.0',
				id: body?.id || null,
				error: {
					code: -32603,
					message: 'Internal error',
					data: { details: error.message },
				},
			});
		}
	};

	return server;
}
```

### 4. API Integration (`api/{service}-api.js`)

```javascript
/**
 * {Service Name} API Integration
 * Core API operations with OAuth authentication
 */

import { handleOAuthError } from '../utils/oauth-error-handler.js';
import { format{Service}Response } from '../utils/{service}-formatting.js';

/**
 * Base API request handler
 */
async function makeApiRequest(endpoint, options = {}, bearerToken) {
  const url = `{api-base-url}${endpoint}`;

  const requestOptions = {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${bearerToken}`,
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      await handleOAuthError(response, bearerToken);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`{Service} API request error:`, error);
    throw error;
  }
}

/**
 * Example API operation
 */
export async function exampleOperation(params, bearerToken) {
  try {
    const data = await makeApiRequest('/example-endpoint', {
      method: 'POST',
      body: JSON.stringify(params)
    }, bearerToken);

    return format{Service}Response(data, 'example_operation');
  } catch (error) {
    throw new Error(`Example operation failed: ${error.message}`);
  }
}

// Add more API operations here
```

### 5. Service Logger (`utils/logger.js`)

```javascript
/**
 * {Service Name} Service Logger
 * Provides structured logging for service operations
 */

/**
 * Log levels
 */
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4
};

/**
 * Current log level (can be set via environment variable)
 */
const CURRENT_LOG_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] || LOG_LEVELS.INFO;

/**
 * Log colors for console output
 */
const LOG_COLORS = {
  DEBUG: '\x1b[36m', // Cyan
  INFO: '\x1b[32m',  // Green
  WARN: '\x1b[33m',  // Yellow
  ERROR: '\x1b[31m', // Red
  FATAL: '\x1b[35m', // Magenta
  RESET: '\x1b[0m'   // Reset
};

/**
 * Format log entry
 */
function formatLogEntry(level, message, context = {}) {
  const timestamp = new Date().toISOString();
  const color = LOG_COLORS[level];
  const reset = LOG_COLORS.RESET;
  
  const contextStr = Object.keys(context).length > 0 
    ? ` ${JSON.stringify(context)}`
    : '';
  
  return `${color}[${timestamp}] ${level}${reset}: ${message}${contextStr}`;
}

/**
 * Base logging function
 */
function log(level, message, context = {}) {
  if (LOG_LEVELS[level] < CURRENT_LOG_LEVEL) {
    return;
  }
  
  const formattedMessage = formatLogEntry(level, message, context);
  
  if (LOG_LEVELS[level] >= LOG_LEVELS.ERROR) {
    console.error(formattedMessage);
  } else {
    console.log(formattedMessage);
  }
}

/**
 * Debug logging
 */
export function debug(message, context = {}) {
  log('DEBUG', message, context);
}

/**
 * Info logging
 */
export function info(message, context = {}) {
  log('INFO', message, context);
}

/**
 * Warning logging
 */
export function warn(message, context = {}) {
  log('WARN', message, context);
}

/**
 * Error logging
 */
export function error(message, context = {}) {
  log('ERROR', message, context);
}

/**
 * Fatal error logging
 */
export function fatal(message, context = {}) {
  log('FATAL', message, context);
}

/**
 * Log API request start
 */
export function logApiRequest(method, endpoint, instanceId, params = {}) {
  info(`🔄 {Service} API Request: ${method} ${endpoint}`, {
    instanceId,
    method,
    endpoint,
    params: Object.keys(params).length > 0 ? params : undefined
  });
}

/**
 * Log API response
 */
export function logApiResponse(method, endpoint, instanceId, success, duration, response = {}) {
  const status = success ? '✅' : '❌';
  const level = success ? 'INFO' : 'ERROR';
  
  log(level, `${status} {Service} API Response: ${method} ${endpoint} (${duration}ms)`, {
    instanceId,
    method,
    endpoint,
    duration,
    success,
    response: success ? undefined : response
  });
}

/**
 * Log OAuth token operations
 */
export function logTokenOperation(operation, instanceId, success, details = {}) {
  const status = success ? '✅' : '❌';
  const level = success ? 'INFO' : 'ERROR';
  
  log(level, `${status} OAuth Token ${operation}`, {
    instanceId,
    operation,
    success,
    ...details
  });
}

/**
 * Log MCP request processing
 */
export function logMcpRequest(method, params, instanceId) {
  info(`🔄 MCP Request: ${method}`, {
    instanceId,
    method,
    params: params ? Object.keys(params) : undefined
  });
}

/**
 * Log MCP response
 */
export function logMcpResponse(method, instanceId, success, duration, error = null) {
  const status = success ? '✅' : '❌';
  const level = success ? 'INFO' : 'ERROR';
  
  log(level, `${status} MCP Response: ${method} (${duration}ms)`, {
    instanceId,
    method,
    success,
    duration,
    error: error ? error.message : undefined
  });
}

/**
 * Log database operations
 */
export function logDatabaseOperation(operation, table, instanceId, success, details = {}) {
  const status = success ? '✅' : '❌';
  const level = success ? 'DEBUG' : 'ERROR';
  
  log(level, `${status} Database ${operation}: ${table}`, {
    instanceId,
    operation,
    table,
    success,
    ...details
  });
}

/**
 * Log service startup
 */
export function logStartup(port, environment, features = []) {
  info(`🚀 {Service} MCP Server Starting`, {
    port,
    environment,
    features,
    logLevel: Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === CURRENT_LOG_LEVEL)
  });
}

/**
 * Log service shutdown
 */
export function logShutdown(reason, graceful = true) {
  const level = graceful ? 'INFO' : 'ERROR';
  const emoji = graceful ? '👋' : '💥';
  
  log(level, `${emoji} {Service} MCP Server Shutting Down`, {
    reason,
    graceful,
    timestamp: new Date().toISOString()
  });
}

/**
 * Create performance timer
 */
export function createTimer(operation, instanceId) {
  const startTime = Date.now();
  
  return {
    end: (success = true, details = {}) => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      const status = success ? '✅' : '❌';
      const level = success ? 'DEBUG' : 'ERROR';
      
      log(level, `${status} ${operation} completed (${duration}ms)`, {
        instanceId,
        operation,
        duration,
        success,
        ...details
      });
      
      return duration;
    }
  };
}

export const currentLogLevel = CURRENT_LOG_LEVEL;
export const logLevels = LOG_LEVELS;
```

### 6. Database Schema (`db/service.sql`)

```sql
-- {Service Name} MCP Service Database Schema

-- Create service-specific tables if needed
CREATE TABLE IF NOT EXISTS {service}_data (
  id SERIAL PRIMARY KEY,
  instance_id UUID NOT NULL REFERENCES mcp_service_table(id) ON DELETE CASCADE,
  data_field VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_{service}_data_instance_id ON {service}_data(instance_id);
CREATE INDEX IF NOT EXISTS idx_{service}_data_created_at ON {service}_data(created_at);

-- Add service-specific constraints
ALTER TABLE {service}_data ADD CONSTRAINT unique_{service}_data_per_instance
  UNIQUE(instance_id, data_field);

-- Add trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_{service}_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_{service}_data_updated_at
  BEFORE UPDATE ON {service}_data
  FOR EACH ROW
  EXECUTE FUNCTION update_{service}_data_updated_at();
```

---

## Configuration Guide

### 1. Environment Variables

**OAuth credentials are NOT stored in environment variables.** They are provided by users during instance creation and stored in the database.

**Only infrastructure environment variables are needed:**

```env
# OAuth Service Configuration (optional - has defaults)
OAUTH_SERVICE_URL=http://localhost:3001
OAUTH_BASE_URL=http://localhost:3001
OAUTH_SERVICE_PORT=3001

# Database configuration (standard PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/database
```

**Note:** OAuth client credentials (`client_id`, `client_secret`) are:
- ✅ **User-provided** during MCP instance creation
- ✅ **Stored in database** (`mcp_credentials` table)  
- ✅ **Retrieved at runtime** via database queries
- ❌ **NOT stored in environment variables** or `.env` files

### 2. Port Assignment

Update `backend/mcp-ports/{service}/config.json`:

```json
{
  "service": "{service-name}",
  "port": {port-number},
  "description": "{Service description}",
  "authType": "oauth",
  "scopes": [
    "{oauth-scope-1}",
    "{oauth-scope-2}"
  ]
}
```

### 3. Service Registration

Add to main MCP service registry:

```javascript
// In backend/src/services/mcpServiceManager.js
const serviceConfigs = {
  // ... existing services
  '{service-name}': {
    name: '{service-name}',
    displayName: '{Service Display Name}',
    port: {port-number},
    authType: 'oauth',
    scopes: ['{oauth-scope-1}', '{oauth-scope-2}']
  }
};
```

### 4. OAuth Service Integration

**Choose your OAuth integration approach:**

#### Option A: Use Centralized OAuth Service (Google/Microsoft)
For services using Google or Microsoft OAuth:

1. **Update OAuth Service Mapping** (`backend/src/oauth-service/index.js`):
   ```javascript
   // Add service to provider mapping (around line 177)
   const serviceToProvider = {
     // ... existing mappings
     '{service-name}': 'google', // or 'microsoft'
   };
   ```

2. **Update Supported Services** (`backend/src/oauth-service/index.js`):
   ```javascript
   // Add to /providers endpoint (around line 331)
   google: {
     supported_services: [
       // ... existing services
       '{service-name}'
     ]
   }
   ```

#### Option B: Implement Custom OAuth (Other Providers)
For services requiring custom OAuth (Twitter, Slack, etc.):

1. **Create OAuth Provider Class** (`backend/src/oauth-service/providers/{provider}.js`):
   ```javascript
   import BaseOAuthProvider from './base-oauth.js';
   
   export class {Provider}OAuthProvider extends BaseOAuthProvider {
     constructor() {
       super('{provider}', {
         authUrl: 'https://api.{provider}.com/oauth/authorize',
         tokenUrl: 'https://api.{provider}.com/oauth/token',
         scopes: ['{default-scope}']
       });
     }
   }
   ```

2. **Register Provider** (`backend/src/oauth-service/core/oauth-manager.js`):
   ```javascript
   import { {Provider}OAuthProvider } from '../providers/{provider}.js';
   
   // Add to constructor
   this.providers.set('{provider}', new {Provider}OAuthProvider());
   ```

3. **Update Service Mapping** and **Providers Endpoint** as in Option A

#### Option C: Direct OAuth Implementation (Service-Specific)
For services with unique OAuth requirements (follow Slack/GitHub pattern):

1. **Implement OAuth endpoints directly in the service**
2. **Still implement `/cache-tokens` endpoint** for token caching
3. **Register service in database** with OAuth configuration

### 5. Service Startup Script

**Update** `backend/scripts/start-all-services.sh`:

1. **Add service to stop commands** (around line 71):
   ```bash
   pm2 delete mcp-{service-name} 2>/dev/null || true
   ```

2. **Add service startup call** (around line 87):
   ```bash
   start_service "{service-name}" "$MCP_SERVERS_ROOT/{service-name}" "{port-number}"
   ```

3. **Add health check** (around line 136):
   ```bash
   check_service_health "{service-name}" "{port-number}"
   ```

4. **Add service to status display** (around line 153):
   ```bash
   echo "  📋 {Service Display Name}: http://localhost:{port-number}/health"
   ```

5. **Add to logs display** (around line 166):
   ```bash
   echo "  Individual logs: pm2 logs mcp-{service-name} | pm2 logs mcp-gmail | ..."
   ```

### 6. Database Registration

**Create** `db/service.sql` file:

```sql
-- Register {Service Name} in MCP service table
INSERT INTO mcp_table (
    mcp_service_name, 
    display_name, 
    description, 
    icon_url_path, 
    port, 
    type,
    created_at,
    updated_at
) VALUES (
    '{service-name}',
    '{Service Display Name}',
    '{Service description}',
    '/mcp-logos/{service-name}.svg',
    {port-number},
    'oauth',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (mcp_service_name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    icon_url_path = EXCLUDED.icon_url_path,
    port = EXCLUDED.port,
    type = EXCLUDED.type,
    updated_at = CURRENT_TIMESTAMP;
```

**Run the migration:**
```bash
# Apply database changes
psql -d your_database -f backend/src/mcp-servers/{service-name}/db/service.sql
```

---

## Testing & Deployment

### 1. Unit Tests

Create test files for each component:

```javascript
// tests/{service}-api.test.js
import { describe, it, expect, vi } from 'vitest';
import { exampleOperation } from '../api/{service}-api.js';

describe('{Service} API', () => {
	it('should handle example operation', async () => {
		const mockToken = 'mock-token';
		const params = { param1: 'test' };

		// Mock fetch
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ data: 'success' }),
		});

		const result = await exampleOperation(params, mockToken);

		expect(result).toBeDefined();
		expect(global.fetch).toHaveBeenCalledWith(
			expect.stringContaining('/example-endpoint'),
			expect.objectContaining({
				method: 'POST',
				headers: expect.objectContaining({
					Authorization: `Bearer ${mockToken}`,
				}),
			})
		);
	});
});
```

### 2. Integration Tests

Test OAuth flow and MCP protocol:

```javascript
// tests/{service}-integration.test.js
import request from 'supertest';
import app from '../index.js';

describe('{Service} Integration', () => {
	it('should handle health check', async () => {
		const response = await request(app).get('/health').expect(200);

		expect(response.body.service).toBe('{service-name}');
		expect(response.body.status).toBe('healthy');
	});

	it('should handle MCP tool call', async () => {
		const mcpRequest = {
			jsonrpc: '2.0',
			id: 1,
			method: 'tools/call',
			params: {
				name: 'example_tool',
				arguments: { param1: 'test' },
			},
		};

		const response = await request(app)
			.post('/test-instance-id/mcp')
			.set('Authorization', 'Bearer mock-token')
			.send(mcpRequest)
			.expect(200);

		expect(response.body.result).toBeDefined();
	});
});
```

### 3. Load Testing

Test concurrent requests and performance:

```javascript
// tests/{service}-load.test.js
import { describe, it, expect } from 'vitest';
import { performance } from 'perf_hooks';

describe('{Service} Load Testing', () => {
	it('should handle concurrent requests', async () => {
		const concurrentRequests = 10;
		const startTime = performance.now();

		const promises = Array(concurrentRequests)
			.fill()
			.map(async (_, i) => {
				// Simulate concurrent API calls
				return new Promise(resolve => {
					setTimeout(() => resolve(`Request ${i} completed`), Math.random() * 100);
				});
			});

		const results = await Promise.all(promises);
		const endTime = performance.now();

		expect(results).toHaveLength(concurrentRequests);
		expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
	});
});
```

---

## Best Practices

### 1. Error Handling

-   **Centralized Error Handling**: Use consistent error response format
-   **OAuth Error Recovery**: Implement automatic token refresh
-   **Circuit Breaker Pattern**: Prevent cascading failures
-   **Comprehensive Logging**: Log all errors with context

### 2. Performance Optimization

-   **Token Caching**: Cache OAuth tokens with expiration tracking
-   **Connection Pooling**: Reuse database connections
-   **Response Compression**: Compress large API responses
-   **Batch Operations**: Group multiple API calls when possible

### 3. Security Considerations

-   **Token Security**: Never log bearer tokens
-   **Input Validation**: Validate all tool arguments
-   **Rate Limiting**: Implement rate limiting for API calls
-   **HTTPS Only**: Use HTTPS in production

### 4. Monitoring & Observability

-   **Health Checks**: Implement comprehensive health checks
-   **Metrics Collection**: Track performance and usage metrics
-   **Audit Logging**: Log all user actions and API calls
-   **Error Tracking**: Monitor error rates and types

### 5. Documentation

-   **API Documentation**: Document all tools and their parameters
-   **Setup Instructions**: Provide clear setup and configuration steps
-   **Troubleshooting Guide**: Common issues and solutions
-   **Change Log**: Track version changes and updates

### 6. Logging & Monitoring

-   **Structured Logging**: JSON-formatted logs with context and correlation IDs
-   **User-Specific Logs**: Per-instance monitoring files (`app.log`, `access.log`, `error.log`)
-   **System Logs**: Daily rotated logs for security, performance, and audit
-   **Log Management**: Automatic rotation, compression, and retention policies
-   **Real-time Monitoring**: Performance metrics and error tracking

---

## Troubleshooting Common Issues

### 1. OAuth Authentication Failures

**Symptom**: 401 Unauthorized errors
**Solution**:

-   Check OAuth scopes configuration
-   Verify token expiration and refresh logic
-   Ensure OAuth service is running and accessible

### 2. MCP Protocol Errors

**Symptom**: Invalid JSON-RPC responses
**Solution**:

-   Validate tool argument schemas
-   Check MCP SDK version compatibility
-   Ensure proper error response formatting

### 3. Database Connection Issues

**Symptom**: Database connection timeouts
**Solution**:

-   Check database configuration
-   Verify connection pool settings
-   Ensure database migrations are applied

### 4. Port Conflicts

**Symptom**: Service fails to start
**Solution**:

-   Check port availability
-   Update port configuration
-   Verify no other services use the same port

---

## Next Steps

After implementing your MCP service:

1. **Test thoroughly** - Run unit, integration, and load tests
2. **Update documentation** - Add service-specific documentation
3. **Monitor performance** - Set up monitoring and alerting
4. **Gather feedback** - Test with real users and iterate
5. **Consider scaling** - Plan for increased usage and load

This template provides a solid foundation for creating robust, production-ready MCP services. Follow the patterns and best practices outlined here to ensure consistency and maintainability across your MCP service ecosystem.
