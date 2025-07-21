# MCP Service Implementation Guide

**Step-by-Step Implementation Guide for New MCP Services**

This guide provides a detailed walkthrough for implementing a new MCP service from scratch, based on the Gmail MCP implementation patterns.

## Table of Contents

1. [Pre-Implementation Planning](#pre-implementation-planning)
2. [Environment Setup](#environment-setup)
3. [Core Implementation Steps](#core-implementation-steps)
4. [Testing & Validation](#testing--validation)
5. [Deployment & Monitoring](#deployment--monitoring)
6. [Common Issues & Solutions](#common-issues--solutions)

---

## Pre-Implementation Planning

### 1. Service Definition

Before starting implementation, define these core aspects:

**Service Configuration**:

-   **Service Name**: Unique identifier (e.g., `twitter`, `dropbox`)
-   **Display Name**: Human-readable name (e.g., `Twitter`, `Dropbox`)
-   **Port Number**: Unique port in range 49000-50000 (from mcp-ports/{service-name})
-   **Description**: Brief service description
-   **OAuth Provider**: Authentication provider details
-   **Required Scopes**: OAuth permissions needed

**Tools & Capabilities**:

-   List all tools the service will provide
-   Define input/output schemas for each tool
-   Identify required API endpoints
-   Plan data models and storage needs

**Example Service Definition**:

```json
{
	"name": "twitter",
	"displayName": "Twitter",
	"port": 49350,
	"description": "Twitter/X social media platform integration",
	"authType": "oauth",
	"scopes": ["tweet.read", "tweet.write", "users.read"],
	"tools": ["post_tweet", "get_timeline", "search_tweets", "get_user_profile"]
}
```

### 2. OAuth Provider Setup

**Google OAuth** (Gmail, Drive, etc.):

-   Console: https://console.cloud.google.com/
-   Required: Client ID, Client Secret, Redirect URI
-   Scopes: Service-specific permissions

**Microsoft OAuth** (Office, Outlook, etc.):

-   Console: https://portal.azure.com/
-   Required: Application ID, Client Secret, Tenant ID
-   Scopes: Graph API permissions

**Custom OAuth**:

-   Authorization endpoint
-   Token endpoint
-   Userinfo endpoint
-   Revocation endpoint

### 3. Database Planning

**Service Tables**:

-   Identify service-specific data storage needs
-   Plan table relationships with MCP core tables
-   Design indexes for performance
-   Consider data retention policies

**Core MCP Tables** (already exist):

-   `mcp_service_table` - Service instances
-   `mcp_table` - Service definitions
-   `mcp_credentials` - OAuth credentials

---

## Environment Setup

### 1. Create Project Structure

```bash
# Navigate to MCP servers directory
cd backend/src/mcp-servers

# Create service directory structure
mkdir -p {service-name}/{endpoints,services,api,middleware,utils,validation,db,logs/system}

# Create all required files
touch {service-name}/index.js
touch {service-name}/db/service.sql
touch {service-name}/endpoints/{call.js,health.js,jsonrpc-handler.js,mcp-handler.js,tools.js}
touch {service-name}/services/{credential-cache.js,credential-watcher.js,database.js,handler-sessions.js}
touch {service-name}/api/{service-name}-api.js
touch {service-name}/middleware/credential-auth.js
touch {service-name}/utils/{service-name}-formatting.js
touch {service-name}/utils/{oauth-integration.js,oauth-validation.js,oauth-error-handler.js,token-metrics.js,validation.js,logger.js}
touch {service-name}/validation/credential-validator.js
```

### 2. Environment Configuration

**Environment Variables:**

**OAuth credentials are NOT stored in environment variables.** They are provided by users during instance creation and stored in the database.

**Only infrastructure environment variables are needed:**

```env
# OAuth Service Configuration (optional - has defaults)
OAUTH_SERVICE_URL=http://localhost:3001
OAUTH_BASE_URL=http://localhost:3001
OAUTH_SERVICE_PORT=3001

# Database configuration (standard PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/database

# API Configuration (if needed for service-specific APIs)
{SERVICE_NAME}_API_BASE_URL=https://api.provider.com
{SERVICE_NAME}_API_VERSION=v1
```

**Important:** OAuth client credentials (`client_id`, `client_secret`) are:

-   ✅ **User-provided** during MCP instance creation
-   ✅ **Stored in database** (`mcp_credentials` table)
-   ✅ **Retrieved at runtime** via database queries
-   ❌ **NOT stored in environment variables** or `.env` files

**Create port configuration**:

```bash
# Create port configuration file
mkdir -p backend/mcp-ports/{service-name}
cat > backend/mcp-ports/{service-name}/config.json << EOF
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
EOF
```

### 4. OAuth Service Integration

**Choose your OAuth integration approach:**

#### Option A: Use Centralized OAuth Service (Google/Microsoft)

For services using Google or Microsoft OAuth:

1. **Update OAuth Service Mapping** (`backend/src/oauth-service/index.js`):

    ```javascript
    // Add service to provider mapping (around line 177)
    const serviceToProvider = {
    	gmail: 'google',
    	googledrive: 'google',
    	// ... existing mappings
    	'{service-name}': 'google', // or 'microsoft'
    };
    ```

2. **Update Supported Services** (`backend/src/oauth-service/index.js`):
    ```javascript
    // Add to /providers endpoint (around line 331)
    google: {
    	supported_services: [
    		'gmail',
    		'googledrive',
    		// ... existing services
    		'{service-name}',
    	];
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

      // Override methods as needed
      async getAuthorizationUrl(clientId, redirectUri, state, scopes) {
        // Custom implementation
      }

      async exchangeCodeForTokens(code, clientId, clientSecret, redirectUri) {
        // Custom implementation
      }
    }
    ```

2. **Register Provider** (`backend/src/oauth-service/core/oauth-manager.js`):

    ```javascript
    import { {Provider}OAuthProvider } from '../providers/{provider}.js';

    // Add to constructor
    this.providers.set('{provider}', new {Provider}OAuthProvider());
    ```

3. **Update token exchange** (`backend/src/oauth-service/core/token-exchange.js`):

    ```javascript
    import { {Provider}OAuthProvider } from '../providers/{provider}.js';

    // Add to constructor
    this.providers.set('{provider}', new {Provider}OAuthProvider());
    ```

4. **Update Service Mapping** and **Providers Endpoint** as in Option A

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

### 6. Dependencies

**Add to package.json** (if not already present):

```json
{
	"dependencies": {
		"@modelcontextprotocol/sdk": "^0.x.x",
		"express": "^4.18.2",
		"cors": "^2.8.5",
		"dotenv": "^16.0.3",
		"zod": "^3.22.4"
	}
}
```

---

## Core Implementation Steps

### Step 1: Database Schema (`db/service.sql`)

**Create service registration schema**:

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

**Create service-specific tables if needed**:

```sql
-- {Service Name} MCP Service Database Schema

-- Service-specific data tables
CREATE TABLE IF NOT EXISTS {service}_data (
  id SERIAL PRIMARY KEY,
  instance_id UUID NOT NULL REFERENCES mcp_service_table(id) ON DELETE CASCADE,
  external_id VARCHAR(255) NOT NULL,
  data_payload JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_{service}_data_instance_id ON {service}_data(instance_id);
CREATE INDEX IF NOT EXISTS idx_{service}_data_external_id ON {service}_data(external_id);
CREATE INDEX IF NOT EXISTS idx_{service}_data_created_at ON {service}_data(created_at);

-- Unique constraints
ALTER TABLE {service}_data ADD CONSTRAINT unique_{service}_data_per_instance
  UNIQUE(instance_id, external_id);

-- Updated timestamp trigger
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

### Step 2: Service Configuration (`index.js` - partial)

```javascript
// Service configuration based on your planning
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
```

### Step 3: Health Check (`endpoints/health.js`)

```javascript
/**
 * {Service Name} Health Check
 * Comprehensive health monitoring for the service
 */

/**
 * Performs comprehensive health check
 * @param {Object} serviceConfig - Service configuration
 * @returns {Object} Health status object
 */
export function healthCheck(serviceConfig) {
	const startTime = Date.now();

	try {
		// Basic service health
		const healthStatus = {
			service: serviceConfig.name,
			status: 'healthy',
			version: serviceConfig.version,
			port: serviceConfig.port,
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
			memory: process.memoryUsage(),
			environment: process.env.NODE_ENV || 'development',
		};

		// OAuth configuration check
		const oauthHealth = checkOAuthConfiguration(serviceConfig);
		healthStatus.oauth = oauthHealth;

		// API connectivity check
		const apiHealth = checkAPIConnectivity();
		healthStatus.api = apiHealth;

		// Database connectivity check
		const dbHealth = checkDatabaseConnectivity();
		healthStatus.database = dbHealth;

		// Overall status determination
		const allHealthy =
			oauthHealth.status === 'healthy' && apiHealth.status === 'healthy' && dbHealth.status === 'healthy';

		healthStatus.status = allHealthy ? 'healthy' : 'degraded';
		healthStatus.responseTime = Date.now() - startTime;

		return healthStatus;
	} catch (error) {
		return {
			service: serviceConfig.name,
			status: 'unhealthy',
			error: error.message,
			timestamp: new Date().toISOString(),
			responseTime: Date.now() - startTime,
		};
	}
}

/**
 * Check OAuth configuration
 */
function checkOAuthConfiguration(serviceConfig) {
	try {
		// OAuth credentials are retrieved from database, not environment variables
		// This is a basic service configuration check
		return {
			status: 'healthy',
			scopes: serviceConfig.scopes,
			configured: true,
			credentialStorage: 'database',
			note: 'OAuth credentials are user-provided and stored in database',
		};
	} catch (error) {
		return {
			status: 'unhealthy',
			message: error.message,
		};
	}
}

/**
 * Check API connectivity
 */
function checkAPIConnectivity() {
	try {
		// Implement API connectivity check
		return {
			status: 'healthy',
			message: 'API connectivity verified',
		};
	} catch (error) {
		return {
			status: 'unhealthy',
			message: error.message,
		};
	}
}

/**
 * Check database connectivity
 */
function checkDatabaseConnectivity() {
	try {
		// Implement database connectivity check
		return {
			status: 'healthy',
			message: 'Database connectivity verified',
		};
	} catch (error) {
		return {
			status: 'unhealthy',
			message: error.message,
		};
	}
}
```

### Step 4: Authentication Middleware (`middleware/credential-auth.js`)

```javascript
/**
 * {Service Name} Authentication Middleware
 * Multi-layered OAuth authentication with caching
 */

import { getCachedCredential, setCachedCredential } from '../services/credential-cache.js';
import { validateUUID } from '../utils/validation.js';
import { refreshOAuthToken } from '../utils/oauth-integration.js';
import { handleOAuthError } from '../utils/oauth-error-handler.js';
import { recordTokenMetrics } from '../utils/token-metrics.js';
import { ErrorResponses } from '../../../utils/errorResponse.js';

/**
 * Creates credential authentication middleware with caching
 */
export function createCredentialAuthMiddleware() {
	return async (req, res, next) => {
		try {
			// Validate instance ID
			const instanceId = req.params.instanceId;
			if (!validateUUID(instanceId)) {
				return ErrorResponses.badRequest(res, 'Invalid instance ID format');
			}

			// Check cached credentials first
			const cachedCredential = getCachedCredential(instanceId);
			if (cachedCredential && cachedCredential.expiresAt > Date.now()) {
				req.instanceId = instanceId;
				req.bearerToken = cachedCredential.bearerToken;
				req.userId = cachedCredential.user_id;
				recordTokenMetrics(instanceId, 'cache_hit');
				return next();
			}

			// Attempt token refresh if cached but expired
			if (cachedCredential && cachedCredential.refreshToken) {
				try {
					const refreshedTokens = await refreshOAuthToken(cachedCredential.refreshToken, instanceId);

					// Update cache with new tokens
					setCachedCredential(instanceId, {
						bearerToken: refreshedTokens.access_token,
						refreshToken: refreshedTokens.refresh_token,
						expiresAt: Date.now() + refreshedTokens.expires_in * 1000,
						user_id: refreshedTokens.user_id || cachedCredential.user_id,
					});

					req.instanceId = instanceId;
					req.bearerToken = refreshedTokens.access_token;
					req.userId = refreshedTokens.user_id || cachedCredential.user_id;
					recordTokenMetrics(instanceId, 'token_refresh');
					return next();
				} catch (refreshError) {
					console.error('Token refresh failed:', refreshError);
					recordTokenMetrics(instanceId, 'refresh_failed');
				}
			}

			// Fallback to OAuth service
			return ErrorResponses.unauthorized(res, 'Authentication required', {
				instanceId,
				metadata: {
					message: 'Please authenticate with OAuth service',
					authType: 'oauth',
				},
			});
		} catch (error) {
			console.error('Authentication middleware error:', error);
			recordTokenMetrics(req.params.instanceId, 'auth_error');
			return ErrorResponses.internal(res, 'Authentication error', {
				metadata: { error: error.message },
			});
		}
	};
}

/**
 * Creates lightweight authentication middleware (no credential caching)
 */
export function createLightweightAuthMiddleware() {
	return async (req, res, next) => {
		try {
			const instanceId = req.params.instanceId;
			if (!validateUUID(instanceId)) {
				return ErrorResponses.badRequest(res, 'Invalid instance ID format');
			}

			req.instanceId = instanceId;
			return next();
		} catch (error) {
			console.error('Lightweight auth middleware error:', error);
			return ErrorResponses.internal(res, 'Authentication error', {
				metadata: { error: error.message },
			});
		}
	};
}

/**
 * Creates cache performance monitoring middleware
 */
export function createCachePerformanceMiddleware() {
	return (req, res, next) => {
		if (process.env.NODE_ENV !== 'development') {
			return next();
		}

		const startTime = Date.now();
		const instanceId = req.params.instanceId;

		res.on('finish', () => {
			const responseTime = Date.now() - startTime;
			recordTokenMetrics(instanceId, 'request_performance', { responseTime });
		});

		next();
	};
}
```

### Step 5: API Integration (`api/{service}-api.js`)

```javascript
/**
 * {Service Name} API Integration
 * Core API operations with OAuth authentication
 */

import { handleOAuthError } from '../utils/oauth-error-handler.js';
import { format{Service}Response } from '../utils/{service}-formatting.js';
import { recordTokenMetrics } from '../utils/token-metrics.js';

const API_BASE_URL = process.env.{SERVICE_NAME}_API_BASE_URL || 'https://api.provider.com';
const API_VERSION = process.env.{SERVICE_NAME}_API_VERSION || 'v1';

// Note: OAuth credentials (client_id, client_secret, access_token) are retrieved from database
// via credential cache system, not from environment variables

/**
 * Base API request handler with error handling and metrics
 */
async function makeApiRequest(endpoint, options = {}, bearerToken, instanceId) {
  const url = `${API_BASE_URL}/${API_VERSION}${endpoint}`;
  const startTime = Date.now();

  const requestOptions = {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${bearerToken}`,
      'Content-Type': 'application/json',
      'User-Agent': '{Service}-MCP-Service/1.0.0',
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, requestOptions);
    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      recordTokenMetrics(instanceId, 'api_error', {
        status: response.status,
        responseTime,
        endpoint
      });

      await handleOAuthError(response, bearerToken, instanceId);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    recordTokenMetrics(instanceId, 'api_success', {
      responseTime,
      endpoint,
      dataSize: JSON.stringify(data).length
    });

    return data;
  } catch (error) {
    const responseTime = Date.now() - startTime;
    recordTokenMetrics(instanceId, 'api_error', {
      responseTime,
      endpoint,
      error: error.message
    });

    console.error(`{Service} API request error:`, error);
    throw error;
  }
}

/**
 * Get user profile information
 */
export async function getUserProfile(bearerToken, instanceId) {
  try {
    const data = await makeApiRequest('/user/profile', {
      method: 'GET'
    }, bearerToken, instanceId);

    return format{Service}Response(data, 'user_profile');
  } catch (error) {
    throw new Error(`Get user profile failed: ${error.message}`);
  }
}

/**
 * Example API operation - customize based on your service
 */
export async function exampleOperation(params, bearerToken, instanceId) {
  try {
    const data = await makeApiRequest('/example-endpoint', {
      method: 'POST',
      body: JSON.stringify(params)
    }, bearerToken, instanceId);

    return format{Service}Response(data, 'example_operation');
  } catch (error) {
    throw new Error(`Example operation failed: ${error.message}`);
  }
}

// Add more API operations based on your service requirements
```

### Step 6: Tool Definitions (`endpoints/tools.js`)

```javascript
/**
 * {Service Name} MCP Tools Definition
 * Comprehensive tool definitions with Zod validation schemas
 */

import { z } from 'zod';

// Tool argument validation schemas
const toolSchemas = {
	getUserProfile: z.object({
		includeDetails: z.boolean().default(false).optional(),
	}),

	exampleOperation: z.object({
		param1: z.string().min(1, 'Parameter 1 is required'),
		param2: z.number().min(1).max(100).optional(),
		param3: z.enum(['option1', 'option2', 'option3']).default('option1'),
	}),

	// Add more tool schemas based on your service
};

// Tool definitions for MCP protocol
export const toolDefinitions = [
	{
		name: 'get_user_profile',
		description: "Get the authenticated user's profile information",
		inputSchema: {
			type: 'object',
			properties: {
				includeDetails: {
					type: 'boolean',
					description: 'Include detailed profile information',
					default: false,
				},
			},
		},
	},
	{
		name: 'example_operation',
		description: 'Example operation that demonstrates the pattern',
		inputSchema: {
			type: 'object',
			properties: {
				param1: {
					type: 'string',
					description: 'Required string parameter',
					minLength: 1,
				},
				param2: {
					type: 'number',
					description: 'Optional number parameter (1-100)',
					minimum: 1,
					maximum: 100,
				},
				param3: {
					type: 'string',
					description: 'Optional enum parameter',
					enum: ['option1', 'option2', 'option3'],
					default: 'option1',
				},
			},
			required: ['param1'],
		},
	},

	// Add more tool definitions based on your service
];

// Validation function with detailed error messages
export function validateToolArguments(toolName, arguments_) {
	const schema = toolSchemas[toolName];
	if (!schema) {
		throw new Error(`Unknown tool: ${toolName}`);
	}

	try {
		return schema.parse(arguments_);
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
			throw new Error(`Validation failed: ${errorMessages}`);
		}
		throw error;
	}
}

// Get tool definition by name
export function getToolDefinition(toolName) {
	return toolDefinitions.find(tool => tool.name === toolName);
}

// Get all tool names
export function getToolNames() {
	return toolDefinitions.map(tool => tool.name);
}

// Check if tool exists
export function hasToolDefinition(toolName) {
	return toolDefinitions.some(tool => tool.name === toolName);
}
```

### Step 7: Tool Call Handler (`endpoints/call.js`)

```javascript
/**
 * {Service Name} Tool Call Handler
 * Centralized tool execution with error handling
 */

import { validateToolArguments, hasToolDefinition } from './tools.js';
import { getUserProfile, exampleOperation } from '../api/{service}-api.js';
import { recordTokenMetrics } from '../utils/token-metrics.js';

/**
 * Tool execution mapping
 */
const toolHandlers = {
	get_user_profile: async (args, bearerToken, instanceId) => {
		return await getUserProfile(bearerToken, instanceId);
	},

	example_operation: async (args, bearerToken, instanceId) => {
		return await exampleOperation(args, bearerToken, instanceId);
	},

	// Add more tool handlers based on your service
};

/**
 * Handle tool call execution
 */
export async function handleToolCall(toolName, arguments_, bearerToken, instanceId) {
	const startTime = Date.now();

	try {
		// Validate tool exists
		if (!hasToolDefinition(toolName)) {
			recordTokenMetrics(instanceId, 'tool_error', {
				tool: toolName,
				error: 'tool_not_found',
			});
			throw new Error(`Tool not found: ${toolName}`);
		}

		// Validate arguments
		const validatedArgs = validateToolArguments(toolName, arguments_);

		// Execute tool
		const handler = toolHandlers[toolName];
		if (!handler) {
			recordTokenMetrics(instanceId, 'tool_error', {
				tool: toolName,
				error: 'handler_not_found',
			});
			throw new Error(`Tool handler not implemented: ${toolName}`);
		}

		const result = await handler(validatedArgs, bearerToken, instanceId);

		// Record success metrics
		const responseTime = Date.now() - startTime;
		recordTokenMetrics(instanceId, 'tool_success', {
			tool: toolName,
			responseTime,
			resultSize: JSON.stringify(result).length,
		});

		return result;
	} catch (error) {
		const responseTime = Date.now() - startTime;
		recordTokenMetrics(instanceId, 'tool_error', {
			tool: toolName,
			responseTime,
			error: error.message,
		});

		console.error(`Tool execution error (${toolName}):`, error);
		throw error;
	}
}

/**
 * Get available tools for this service
 */
export function getAvailableTools() {
	return Object.keys(toolHandlers);
}

/**
 * Check if tool is available
 */
export function isToolAvailable(toolName) {
	return toolName in toolHandlers;
}
```

### Step 8: MCP Handler (`endpoints/mcp-handler.js`)

```javascript
/**
 * {Service Name} MCP Handler
 * Modern MCP SDK implementation with session management
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { toolDefinitions } from './tools.js';
import { handleToolCall } from './call.js';
import { recordTokenMetrics } from '../utils/token-metrics.js';

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

	// Register tools list handler
	server.setRequestHandler('tools/list', async () => {
		recordTokenMetrics(instanceId, 'tools_list');
		return {
			tools: toolDefinitions,
		};
	});

	// Register tool call handler
	server.setRequestHandler('tools/call', async request => {
		const { name, arguments: args } = request.params;
		const startTime = Date.now();

		try {
			const result = await handleToolCall(name, args, bearerToken, instanceId);

			// Format response according to MCP protocol
			const response = {
				content: [
					{
						type: 'text',
						text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
					},
				],
				isError: false,
			};

			const responseTime = Date.now() - startTime;
			recordTokenMetrics(instanceId, 'mcp_tool_success', {
				tool: name,
				responseTime,
				contentLength: response.content[0].text.length,
			});

			return response;
		} catch (error) {
			const responseTime = Date.now() - startTime;
			console.error(`MCP tool call error (${name}):`, error);

			recordTokenMetrics(instanceId, 'mcp_tool_error', {
				tool: name,
				responseTime,
				error: error.message,
			});

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

	// Handle logging if needed
	server.setRequestHandler('logging/setLevel', async request => {
		const { level } = request.params;
		console.log(`Setting log level to: ${level}`);
		return {};
	});

	// Handle MCP request with proper error handling
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
			recordTokenMetrics(instanceId, 'mcp_error', {
				error: error.message,
				method: body?.method,
			});

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

### Step 9: Complete Main Entry Point (`index.js`)

Use the complete template from the MCP_SERVICE_TEMPLATE.md file, replacing placeholders with your service-specific values.

### Step 10: Supporting Services

Implement the remaining service files:

1. **`services/credential-cache.js`** - OAuth token caching
2. **`services/credential-watcher.js`** - Background token refresh
3. **`services/handler-sessions.js`** - Session management
4. **`services/database.js`** - Database operations

Use the Gmail implementation as a reference for these files.

### Step 11: Utilities

Implement utility files:

1. **`utils/{service}-formatting.js`** - Response formatting
2. **`utils/oauth-integration.js`** - OAuth service integration
3. **`utils/oauth-validation.js`** - Token validation
4. **`utils/oauth-error-handler.js`** - Error handling
5. **`utils/token-metrics.js`** - Metrics collection
6. **`utils/validation.js`** - General validation

---

## Testing & Validation

### 1. Unit Tests

**Create test files**:

```bash
mkdir -p tests/{service-name}
touch tests/{service-name}/{api.test.js,tools.test.js,auth.test.js}
```

**Example test (`tests/{service-name}/api.test.js`)**:

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserProfile } from '../../api/{service}-api.js';

describe('{Service} API', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should get user profile successfully', async () => {
		const mockResponse = {
			id: 'user123',
			name: 'Test User',
			email: 'test@example.com',
		};

		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockResponse),
		});

		const result = await getUserProfile('mock-token', 'instance-id');

		expect(result).toBeDefined();
		expect(global.fetch).toHaveBeenCalledWith(
			expect.stringContaining('/user/profile'),
			expect.objectContaining({
				method: 'GET',
				headers: expect.objectContaining({
					Authorization: 'Bearer mock-token',
				}),
			})
		);
	});

	it('should handle API errors', async () => {
		global.fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 401,
			statusText: 'Unauthorized',
		});

		await expect(getUserProfile('invalid-token', 'instance-id')).rejects.toThrow(
			'API request failed: 401 Unauthorized'
		);
	});
});
```

### 2. Integration Tests

**Test MCP protocol**:

```javascript
import request from 'supertest';
import app from '../../index.js';

describe('{Service} MCP Integration', () => {
	it('should handle tools/list request', async () => {
		const mcpRequest = {
			jsonrpc: '2.0',
			id: 1,
			method: 'tools/list',
			params: {},
		};

		const response = await request(app)
			.post('/test-instance-id/mcp')
			.set('Authorization', 'Bearer mock-token')
			.send(mcpRequest)
			.expect(200);

		expect(response.body.result).toBeDefined();
		expect(response.body.result.tools).toBeInstanceOf(Array);
	});
});
```

### 3. Manual Testing

**Test health endpoints**:

```bash
# Global health
curl http://localhost:{port}/health

# Instance health
curl http://localhost:{port}/test-instance-id/health \
  -H "Authorization: Bearer test-token"
```

**Test MCP tools**:

```bash
# List tools
curl -X POST http://localhost:{port}/test-instance-id/mcp \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
  }'

# Call tool
curl -X POST http://localhost:{port}/test-instance-id/mcp \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "get_user_profile",
      "arguments": {}
    }
  }'
```

---

## Deployment & Monitoring

### 1. Production Configuration

**Environment variables**:

```env
NODE_ENV=production
{SERVICE_NAME}_CLIENT_ID=prod-client-id
{SERVICE_NAME}_CLIENT_SECRET=prod-client-secret
{SERVICE_NAME}_API_BASE_URL=https://api.provider.com
```

**Process management**:

```bash
# Using PM2
pm2 start index.js --name "{service-name}-mcp" --instances 2

# Using systemd
sudo systemctl enable {service-name}-mcp
sudo systemctl start {service-name}-mcp
```

### 2. Monitoring Setup

**Health check monitoring**:

```bash
# Add to monitoring system
curl -f http://localhost:{port}/health || exit 1
```

**Metrics collection**:

-   Token usage metrics
-   API response times
-   Error rates
-   Cache hit rates

**Log aggregation**:

```bash
# Service logs location
tail -f backend/src/mcp-servers/{service}/logs/system/application-*.log
```

### 3. Load Testing

**Simple load test**:

```bash
# Install artillery
npm install -g artillery

# Create load test config
cat > load-test.yml << EOF
config:
  target: 'http://localhost:{port}'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Health check"
    requests:
      - get:
          url: "/health"
EOF

# Run load test
artillery run load-test.yml
```

---

## Common Issues & Solutions

### 0. Missing OAuth Service Integration

**Problem**: Service not working with OAuth flow
**Symptoms**:

-   OAuth authentication failing
-   Token caching not working
-   Service not appearing in OAuth providers

**Solutions**:

1. **Check OAuth Service Integration**:

    ```bash
    # Verify service is registered with OAuth service
    curl http://localhost:8080/providers
    ```

2. **Update OAuth Service Mapping**:

    ```javascript
    // In backend/src/oauth-service/index.js
    const serviceToProvider = {
    	// ... existing mappings
    	'your-service': 'google', // or appropriate provider
    };
    ```

3. **Verify startup script includes service**:

    ```bash
    # Check if service is in start-all-services.sh
    grep "your-service" backend/scripts/start-all-services.sh
    ```

4. **Check database registration**:
    ```sql
    -- Verify service is in database
    SELECT * FROM mcp_table WHERE mcp_service_name = 'your-service';
    ```

### 1. OAuth Authentication Issues

**Problem**: 401 Unauthorized errors
**Symptoms**:

-   API calls failing with 401 status
-   Token refresh not working
-   Cache miss errors

**Solutions**:

1. **Verify OAuth configuration**:

    ```bash
    # Check OAuth service integration
    curl http://localhost:3001/providers

    # Check database for stored credentials
    psql -d database -c "SELECT instance_id, client_id FROM mcp_credentials WHERE instance_id = 'your-instance-id';"
    ```

2. **Check token expiration**:

    ```javascript
    // Debug token expiration
    const cached = getCachedCredential(instanceId);
    console.log('Token expires at:', new Date(cached.expiresAt));
    console.log('Current time:', new Date());
    ```

3. **Verify OAuth scopes**:
    ```javascript
    // Ensure required scopes are included
    const requiredScopes = ['scope1', 'scope2'];
    const configuredScopes = SERVICE_CONFIG.scopes;
    ```

### 2. MCP Protocol Errors

**Problem**: Invalid JSON-RPC responses
**Symptoms**:

-   MCP client errors
-   Malformed responses
-   Tool execution failures

**Solutions**:

1. **Validate JSON-RPC format**:

    ```javascript
    // Ensure proper response format
    return {
    	jsonrpc: '2.0',
    	id: request.id,
    	result: {
    		/* result data */
    	},
    };
    ```

2. **Check tool argument validation**:
    ```javascript
    // Use Zod validation
    const schema = toolSchemas[toolName];
    const validatedArgs = schema.parse(arguments_);
    ```

### 3. Database Connection Issues

**Problem**: Database connection failures
**Symptoms**:

-   Database timeouts
-   Connection pool exhaustion
-   Query failures

**Solutions**:

1. **Check database configuration**:

    ```bash
    # Verify database connection
    psql -h localhost -U username -d database_name
    ```

2. **Monitor connection pool**:
    ```javascript
    // Check pool status
    console.log('Pool info:', pool.totalCount, pool.idleCount);
    ```

### 4. Port Conflicts

**Problem**: Service fails to start
**Symptoms**:

-   EADDRINUSE errors
-   Port already in use
-   Service startup failures

**Solutions**:

1. **Check port availability**:

    ```bash
    # Check if port is in use
    netstat -tlnp | grep :{port}

    # Find process using port
    lsof -i :{port}
    ```

2. **Update port configuration**:
    ```javascript
    // Use different port
    const SERVICE_CONFIG = {
      port: {new-port-number}
    };
    ```

### 5. Performance Issues

**Problem**: Slow response times
**Symptoms**:

-   High response latency
-   Timeout errors
-   Poor user experience

**Solutions**:

1. **Enable caching**:

    ```javascript
    // Implement response caching
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse) return cachedResponse;
    ```

2. **Optimize database queries**:

    ```sql
    -- Add indexes
    CREATE INDEX idx_performance ON table_name(column);
    ```

3. **Monitor metrics**:
    ```javascript
    // Track performance metrics
    recordTokenMetrics(instanceId, 'performance', {
    	responseTime: Date.now() - startTime,
    });
    ```

---

## Next Steps

After successful implementation:

1. **Documentation**:

    - Update service documentation
    - Add API reference
    - Create user guides

2. **Monitoring**:

    - Set up alerts
    - Monitor performance
    - Track usage metrics

3. **Scaling**:

    - Plan for increased load
    - Implement load balancing
    - Consider caching strategies

4. **Security**:

    - Security audit
    - Vulnerability assessment
    - Access control review

5. **Maintenance**:
    - Regular updates
    - Dependency management
    - Performance optimization

This comprehensive implementation guide provides everything needed to create a robust, production-ready MCP service following established patterns and best practices.
