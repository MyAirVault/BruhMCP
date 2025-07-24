# API Key-Based MCP Service Implementation Checklist

## Overview

This checklist provides step-by-step instructions for adding a new API key-based MCP service to the system. Follow this exact structure and naming conventions to ensure proper integration with the frontend and registry system.

**Template Structure:** Based on Figma MCP server implementation
**Authentication Type:** API key-based (no OAuth flow required)

## Prerequisites

- [ ] Choose unique service name (lowercase, no spaces, e.g., `notion`, `airtable`)
- [ ] Assign unique port number (check existing services in `ecosystem.config.js`)
- [ ] Obtain API documentation for the service you're integrating
- [ ] Create service icon (SVG format) and place in `/frontend/public/mcp-logos/`

## Implementation Checklist

### 1. Database Registration (`db/service.sql`)

**File:** `/backend/src/mcp-servers/{service-name}/db/service.sql`

- [ ] Create service registration SQL file with exact structure:
  - `mcp_service_name` - Must match directory name (e.g., 'notion')
  - `display_name` - Human-readable name (e.g., 'Notion')
  - `description` - Brief service description
  - `icon_url_path` - Path to SVG icon (e.g., '/mcp-logos/notion.svg')
  - `port` - Unique port number (check ecosystem.config.js for available ports)
  - `type` - Must be exactly 'api_key' for API key services

### 2. Auth Folder Implementation (`auth/`)

#### Required Files (Exact Names):

**File:** `auth/validateCredentials.js`
- [ ] Export function named exactly `validateCredentials(credentials, userId)`
- [ ] Import and use credential validator from `../validation/credentialValidator.js`
- [ ] Return standardized validation result object
- [ ] Handle validation errors properly

**File:** `auth/createInstance.js`  
- [ ] Export function named exactly `createInstance(instanceData, userId)`
- [ ] Import dependencies:
  - `../validation/credentialValidator.js`
  - `../../../db/queries/mcpInstances/creation.js`
  - `../../../db/queries/mcpTypesQueries.js`
- [ ] Validate credentials before creating instance
- [ ] Store instance in database with proper status
- [ ] Return standardized instance creation result

**File:** `auth/revokeInstance.js`
- [ ] Export function named exactly `revokeInstance(instanceId, userId)`
- [ ] Import `../../../db/queries/mcpInstances/crud.js`
- [ ] Delete instance from database
- [ ] Return standardized revocation result

### 3. Validation Folder (`validation/`)

**File:** `validation/credentialValidator.js`
- [ ] Create class extending `BaseValidator` from `../../../services/validation/baseValidator.js`
- [ ] Implement required methods:
  - `validateFormat(credentials)` - Format validation without API calls
  - `testCredentials(credentials)` - Actual API validation with real API call
  - `getServiceInfo(credentials)` - Service metadata retrieval
- [ ] Export factory function `create{ServiceName}Validator(credentials)`
- [ ] Make actual API call to service (e.g., `/v1/users/me` endpoint)
- [ ] Handle API errors and rate limiting properly

### 4. API Folder (`api/`)

**File:** `api/index.js`
- [ ] Central export file for all API functions
- [ ] Export common utilities: `{SERVICE}_BASE_URL`, `handleApiError`, `makeAuthenticatedRequest`

**File:** `api/common.js`
- [ ] Define base API URL constant
- [ ] Implement `handleApiError(error)` function
- [ ] Implement `makeAuthenticatedRequest(endpoint, options, apiKey)` function
- [ ] Include proper error handling and retry logic

**Additional API Files:**
- [ ] Create specific API modules for different service areas (e.g., `files.js`, `pages.js`, `databases.js`)
- [ ] Each module should export specific API functions
- [ ] Use consistent error handling patterns

### 5. Endpoints Folder (`endpoints/`)

**File:** `endpoints/mcpHandler.js`
- [ ] Create service-specific MCP handler class (e.g., `NotionMCPHandler`)
- [ ] Import required dependencies:
  - `@modelcontextprotocol/sdk/server/mcp.js`
  - `@modelcontextprotocol/sdk/server/streamableHttp.js`
  - `../services/{serviceName}Service.js`
- [ ] Implement `setupTools()` method with Zod schema definitions
- [ ] Implement `handleMCPRequest(req, res, message)` method
- [ ] Define MCP tools covering main service functionality
- [ ] Use proper JSON-RPC 2.0 error handling

**File:** `endpoints/health.js`
- [ ] Export `healthCheck(serviceConfig)` function
- [ ] Return health status object with service availability

### 6. Middleware Folder (`middleware/`)

**File:** `middleware/credentialAuth.js`
- [ ] Export `createCredentialAuthMiddleware()` function for full authentication
- [ ] Export `createLightweightAuthMiddleware()` function for basic validation
- [ ] Export `createCachePerformanceMiddleware()` function for development monitoring
- [ ] Implement UUID validation for instance IDs
- [ ] Integrate with credential caching system
- [ ] Include database fallback for cache misses
- [ ] Add usage tracking integration

### 7. Services Folder (`services/`)

**File:** `services/credentialCache.js`
- [ ] Implement in-memory credential caching system
- [ ] Use service-specific cache namespace
- [ ] Include cache entry structure with required fields:
  - `api_key`, `user_id`, `last_used`, `cached_at`, `last_modified`, `status`
- [ ] Implement cache initialization and cleanup functions

**File:** `services/{serviceName}Service.js`
- [ ] Create main service class (e.g., `NotionService`)
- [ ] Constructor should accept `{ apiKey }` parameter
- [ ] Implement `request(endpoint, options)` method for authenticated requests
- [ ] Implement service-specific methods for MCP tools
- [ ] Include proper error handling and rate limiting

**File:** `services/handlerSessions.js`
- [ ] Implement MCP handler session management
- [ ] Cache handler instances per instanceId
- [ ] Include session cleanup functionality

**File:** `services/instanceUtils.js`
- [ ] Implement instance validation utilities
- [ ] Include instance status checking functions

### 8. Utils Folder (`utils/`)

**File:** `utils/common.js`
- [ ] Implement service-specific utility functions
- [ ] Include data transformation utilities
- [ ] Add helper functions for API response processing

**File:** `utils/fetchWithRetry.js`
- [ ] Implement HTTP retry logic with exponential backoff
- [ ] Handle service-specific rate limiting
- [ ] Integration with circuit breaker pattern

**File:** `utils/logger.js`
- [ ] Service-specific logging utilities with credential sanitization
- [ ] Integrate with main logging system (`/services/logging/loggingService.js`)
- [ ] Implement structured logging methods:
  - `logger.info(message, metadata)` - General information logging
  - `logger.error(message, error, metadata)` - Error event logging
  - `logger.apiCall(method, endpoint, status, timing)` - API operation logging
  - `logger.mcpOperation(operation, metadata)` - MCP protocol logging
  - `logger.performance(operation, duration)` - Performance metrics
- [ ] Include automatic credential sanitization for API keys and sensitive data
- [ ] Integration with user-specific logging (`/logs/users/user_{userId}/mcp_{instanceId}/`)

**File:** `utils/mcpResponses.js`
- [ ] MCP response formatting utilities
- [ ] Standardized error response formats
- [ ] Response logging integration

**File:** `utils/sanitization.js`
- [ ] Data sanitization utilities for API keys and credentials
- [ ] Input validation helpers
- [ ] Logging data sanitization functions

### 9. Main Service Entry Point (`index.js`)

**Service Configuration:**
- [ ] Define `SERVICE_CONFIG` object with exact structure:
  - `name` - Must match database entry and directory name
  - `displayName` - Human-readable service name
  - `port` - Unique port number
  - `authType` - Must be exactly 'api_key'
  - `description` - Service description
  - `version` - Service version

**Express Route Configuration:**
- [ ] Implement global health endpoint: `GET /health`
- [ ] Implement OAuth well-known endpoint (404 response): `GET /.well-known/oauth-authorization-server/:instanceId`
- [ ] Implement instance health endpoint: `GET /:instanceId/health`
- [ ] Implement main MCP endpoints: `POST /:instanceId` and `POST /:instanceId/mcp`
- [ ] Use proper middleware for each route type

**Required Middleware Integration:**
- [ ] Import and use `credentialAuthMiddleware` for MCP endpoints
- [ ] Import and use `lightweightAuthMiddleware` for health endpoints
- [ ] Include proper error handling middleware

### 10. Logging and Monitoring Integration

**Required Logging Components:**
- [ ] Initialize service-specific logger with `mcpInstanceLogger.initializeLogger(instanceId, userId)`
- [ ] Implement user-specific log directories: `/logs/users/user_{userId}/mcp_{instanceId}/`
- [ ] Create log files: `app.log`, `access.log`, `error.log`
- [ ] Integrate with system-wide logging categories: application, security, performance, audit

**Circuit Breaker Integration:**
- [ ] Import and configure circuit breaker from `/utils/circuitBreaker.js`
- [ ] Wrap external API calls with circuit breaker protection
- [ ] Configure failure thresholds and reset timeouts
- [ ] Monitor circuit breaker states and metrics

**Performance Monitoring:**
- [ ] Implement request timing and performance logging
- [ ] Track API response times and error rates
- [ ] Monitor memory usage and connection pooling
- [ ] Log slow operations (>1 second for database, >5 seconds for API)

**Health Check Implementation:**
- [ ] Implement health check endpoint returning service status
- [ ] Include API connectivity verification
- [ ] Monitor credential cache health
- [ ] Report circuit breaker status and metrics

**Example Logging Implementation:**
```javascript
// Initialize logger for instance
const logger = mcpInstanceLogger.initializeLogger(instanceId, userId);

// Log service startup
logger.info('Service started', { service: 'notion', port: 49280 });

// Log API operations with sanitization
logger.apiCall('GET', '/databases', 200, { duration: 150 });

// Log MCP operations
logger.mcpOperation('list-databases', { count: 5, duration: 200 });

// Error logging with context
logger.error('API request failed', error, { 
  operation: 'fetch-database',
  apiKey: '[REDACTED]' // Automatic sanitization
});
```

### 11. Integration Requirements

**PM2 Configuration:**
- [ ] Add service to `/backend/ecosystem.config.js` apps array
- [ ] Include proper service configuration:
  - `name` - Service name with prefix (e.g., 'minimcp-notion')
  - `script` - Path to service index.js
  - `cwd` - Service directory path
  - `instances` - Usually 1
  - `max_memory_restart` - Memory limit (e.g., '200M')

**Service Registry Integration:**
- [ ] Ensure auth functions are exported with exact names
- [ ] Functions must return standardized response formats
- [ ] Service automatically discovered by registry system

**Frontend Integration:**
- [ ] Service appears automatically in MCP creation modal
- [ ] Icon displays correctly from `/mcp-logos/{service}.svg`
- [ ] Credential validation works through registry API

## Validation Checklist

### Pre-Deployment Testing:
- [ ] Service starts without errors on assigned port
- [ ] Health endpoint returns 200 status
- [ ] Credential validation works with real API keys
- [ ] Instance creation and deletion work properly
- [ ] MCP tools respond correctly to JSON-RPC requests
- [ ] Frontend can create and manage instances
- [ ] Logging works properly
- [ ] Error handling works for invalid credentials

### Integration Testing:
- [ ] Service appears in auth registry service list
- [ ] Frontend dropdown shows service with correct icon
- [ ] Credential validation provides meaningful error messages
- [ ] Instance creation updates database correctly
- [ ] MCP protocol communication works end-to-end

## Common Pitfalls to Avoid

1. **Naming Inconsistencies**: Service name must match across database, directory, config, and code
2. **Missing Required Functions**: Auth functions must be named exactly as expected by registry
3. **Port Conflicts**: Ensure port number is unique and added to PM2 config
4. **Credential Validation**: Must make real API call, not just format validation
5. **MCP Tool Definitions**: Use proper Zod schemas and JSON-RPC error codes
6. **Middleware Order**: Ensure middleware is applied in correct order
7. **Database Integration**: Follow existing patterns for instance management
8. **Error Handling**: Use standardized error response formats
9. **Caching Integration**: Implement proper credential caching for performance
10. **Security**: Never log sensitive credentials or API keys

## Dependencies

**Required NPM Dependencies** (should already be installed):
- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `express` - Web server framework
- `zod` - Schema validation for MCP tools
- `node-fetch` or `axios` - HTTP client for API requests
- Database query modules from existing codebase

**Required Internal Dependencies:**
- Database query functions from `/db/queries/`
- Validation base classes from `/services/validation/`
- Logging utilities from main application
- Registry integration from `/services/mcp-auth-registry/`