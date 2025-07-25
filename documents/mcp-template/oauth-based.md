# OAuth-Based MCP Service Implementation Checklist

## Overview

This checklist provides step-by-step instructions for adding a new OAuth-based MCP service to the system. Follow this exact structure and naming conventions to ensure proper integration with the sophisticated token management, caching, and multi-tenant architecture.

**Template Structure:** Based on Gmail MCP server implementation
**Authentication Type:** OAuth 2.0 with token caching and refresh capabilities

## Prerequisites

- [ ] Choose unique service name (lowercase, no spaces, e.g., `github`, `discord`)
- [ ] Assign unique port number (check existing services in `ecosystem.config.js`)
- [ ] Obtain OAuth 2.0 credentials from service provider (client_id, client_secret)
- [ ] Document required OAuth scopes for service integration
- [ ] Create service icon (SVG format) and place in `/frontend/public/mcp-logos/`
- [ ] Research service API documentation and rate limits

## Implementation Checklist

### 1. Database Registration (`db/service.sql`)

**File:** `/backend/src/mcp-servers/{service-name}/db/service.sql`

- [ ] Create service registration SQL file with exact structure:
  - `mcp_service_name` - Must match directory name (e.g., 'github')
  - `display_name` - Human-readable name (e.g., 'GitHub')
  - `description` - Brief service description
  - `icon_url_path` - Path to SVG icon (e.g., '/mcp-logos/github.svg')
  - `port` - Unique port number (check ecosystem.config.js for available ports)
  - `type` - Must be exactly 'oauth' for OAuth services

### 2. Auth Folder Implementation (`auth/`)

#### Required Files with Standardized Interfaces:

**File:** `auth/validateCredentials.js`
- [ ] Export function named exactly `validateCredentials(credentials, userId)`
- [ ] Import credential validator from `../validation/credentialValidator.js`
- [ ] Validate OAuth credential format (client_id, client_secret structure)
- [ ] Return standardized validation result with service metadata
- [ ] Include service-specific permission information

**File:** `auth/initiateOAuth.js`
- [ ] Export function named exactly `initiateOAuth(credentials, userId, instanceId)`
- [ ] Import OAuth handler from `../oauth/oauthHandler.js`
- [ ] Generate authorization URL with CSRF-protected state parameter
- [ ] State parameter must contain: `{ instanceId, userId, timestamp, service }`
- [ ] Return object: `{ success, authUrl, state, instanceId, message }`
- [ ] Handle OAuth initiation errors properly

**File:** `auth/oauthCallback.js`
- [ ] Export function named exactly `oauthCallback(code, state)`
- [ ] Import OAuth handler and database queries
- [ ] Validate state parameter for CSRF protection
- [ ] **CRITICAL**: Parse state parameter to extract `instanceId` and `userId`:
  ```javascript
  const stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
  const { instanceId, userId } = stateData;
  ```
- [ ] Use `userId` for authorization when retrieving instance data
- [ ] Exchange authorization code for access/refresh tokens
- [ ] Store tokens in database with encrypted storage
- [ ] Update instance oauth_status to 'completed' using extracted `instanceId`
- [ ] Return object: `{ success, message, data: { instanceId, tokens, status } }`

**File:** `auth/revokeInstance.js`
- [ ] Export function named exactly `revokeInstance(instanceId, userId)`
- [ ] Import database queries for instance deletion
- [ ] Optionally revoke tokens with OAuth provider
- [ ] Clean up cached credentials and sessions
- [ ] Return standardized revocation result

### 3. **CRITICAL OAuth State Management Pattern**

**⚠️ SECURITY REQUIREMENT**: The OAuth state parameter MUST contain both `userId` and `instanceId` for proper authorization and security. This pattern is essential for:
- CSRF protection
- Multi-tenant authorization  
- Correct instance association
- Security audit trails

**State Creation Pattern** (in OAuth handler `initiateFlow()`):
```javascript
const state = Buffer.from(
  JSON.stringify({
    instanceId,  // ← REQUIRED: Links callback to correct instance
    userId,      // ← REQUIRED: Ensures user owns the instance  
    timestamp: Date.now(),
    service: '{serviceName}',
  })
).toString('base64');
```

**State Parsing Pattern** (in OAuth callback handler):
```javascript
const stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
const { instanceId, userId } = stateData;

// Use userId for authorization when retrieving instance
const instance = await getMCPInstanceById(instanceId, userId);
```

### 4. OAuth Handler Implementation (`oauth/`)

**File:** `oauth/oauthHandler.js`
- [ ] Create service-specific OAuth handler class (e.g., `GitHubOAuthHandler`)
- [ ] Configure OAuth endpoints (authorization, token, refresh URLs)
- [ ] Set redirect URI: `${process.env.PUBLIC_DOMAIN}/api/v1/auth-registry/callback/{service}`
- [ ] Define required OAuth scopes array
- [ ] Implement methods:
  - `initiateFlow(instanceId, userId, credentials)` - Generate auth URL with state
  - `handleCallback(code, state)` - Exchange code for tokens
  - `refreshToken(refreshToken, credentials)` - Refresh expired tokens
- [ ] **CRITICAL**: In `initiateFlow()`, create state parameter with both `instanceId` and `userId`:
  ```javascript
  const state = Buffer.from(
    JSON.stringify({
      instanceId,
      userId,
      timestamp: Date.now(),
      service: '{serviceName}',
    })
  ).toString('base64');
  ```
- [ ] **CRITICAL**: In `handleCallback()`, parse state to extract both values:
  ```javascript
  const stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
  const { instanceId, userId } = stateData;
  ```
- [ ] Use `userId` for authorization when retrieving instance credentials from database
- [ ] Include proper error handling for OAuth flow failures
- [ ] Handle provider-specific OAuth quirks and requirements

### 4. Validation Folder (`validation/`)

**File:** `validation/credentialValidator.js`
- [ ] Create class extending `BaseValidator` from `../../../services/validation/baseValidator.js`
- [ ] Set authentication type to 'oauth' in constructor
- [ ] Implement required methods:
  - `validateFormat(credentials)` - Validate client_id/client_secret format
  - `getServiceInfo(credentials)` - Return service metadata
- [ ] Include provider-specific format validation rules
- [ ] Export factory function `create{ServiceName}Validator(credentials)`
- [ ] Note: OAuth services do format validation only, not functional testing

### 5. Sophisticated Token Management (`services/`)

#### Core Service Files:

**File:** `services/credentialCache.js`
- [ ] Implement in-memory credential caching using Map objects
- [ ] Define cache entry structure with required fields:
  - `bearerToken` - OAuth access token
  - `refreshToken` - OAuth refresh token
  - `expiresAt` - Token expiration timestamp
  - `user_id` - Owner user ID
  - `last_used` - Last access timestamp
  - `refresh_attempts` - Failed refresh counter
  - `cached_at` - Cache creation time
  - `last_modified` - Last update time
  - `status` - Instance status
- [ ] Implement cache operations:
  - `setCachedCredential(instanceId, credentials)`
  - `getCachedCredential(instanceId)` with auto-expiry checking
  - `updateCachedCredentialMetadata(instanceId, metadata)`
  - `deleteCachedCredential(instanceId)`
- [ ] Background database synchronization every 5 minutes
- [ ] Cache initialization and cleanup functions

**File:** `services/credentialWatcher.js`
- [ ] Implement background token refresh watcher service
- [ ] Configuration:
  - Watcher interval: 5 minutes
  - Refresh threshold: 10 minutes before expiration
  - Maximum refresh attempts: 3 with exponential backoff
  - Session timeout: 30 minutes
- [ ] Automatic cleanup of invalid/expired entries
- [ ] Integration with circuit breaker pattern for failures

**File:** `services/handlerSessions.js`
- [ ] Implement MCP handler session management
- [ ] Cache handler instances per instanceId using official MCP SDK
- [ ] Automatic bearer token updates in active sessions
- [ ] Session cleanup on expiry or token invalidation
- [ ] Session statistics tracking and monitoring

**File:** `services/database.js`
- [ ] Database operations for OAuth credential management
- [ ] Encrypted token storage with versioning
- [ ] Optimistic locking for concurrent token updates
- [ ] Integration with audit logging system

### 6. Token Refresh and Error Handling (`middleware/`)

**File:** `middleware/credentialAuth.js`
- [ ] Export `createCredentialAuthMiddleware()` for full OAuth authentication
- [ ] Export `createLightweightAuthMiddleware()` for basic instance validation
- [ ] Export `createCachePerformanceMiddleware()` for development monitoring
- [ ] Token flow implementation:
  1. Check in-memory cache for valid tokens
  2. Database lookup if cache miss
  3. Automatic token refresh if expired
  4. Re-authentication prompt if refresh fails
- [ ] UUID validation for instance IDs
- [ ] Usage tracking integration

**File:** `middleware/tokenRefresh.js`
- [ ] Implement `attemptTokenRefresh()` with dual-path strategy:
  - OAuth service integration (preferred)
  - Direct provider refresh (fallback)
- [ ] Implement `processSuccessfulRefresh()`:
  - Update in-memory cache
  - Synchronize with database
  - Update token metrics
  - Reset refresh attempt counters
- [ ] Implement `processFailedRefresh()`:
  - Error categorization and handling
  - Cleanup invalid tokens
  - Audit logging for failures
- [ ] Complete orchestration with `performTokenRefresh()`

**File:** `middleware/authErrorHandler.js`
- [ ] Comprehensive error handling for OAuth operations
- [ ] Error types: Network, authentication, token expiry, rate limiting
- [ ] Fallback mechanisms: Direct OAuth, re-authentication prompts
- [ ] User-friendly error messages with actionable guidance
- [ ] Integration with circuit breaker pattern

**File:** `middleware/auditLogger.js`
- [ ] Audit logging for all token operations
- [ ] Security event tracking for OAuth flows
- [ ] Compliance logging for token access and refresh

**File:** `middleware/validation.js`
- [ ] Request validation utilities for OAuth endpoints
- [ ] Parameter sanitization and format checking
- [ ] CSRF protection for OAuth state parameters

### 7. API Integration Layer (`api/`)

**File:** `api/{serviceName}Api.js`
- [ ] Main API integration class (e.g., `GitHubApi`)
- [ ] Constructor accepting OAuth bearer token
- [ ] Implement authenticated request methods:
  - `request(endpoint, options)` - Base authenticated HTTP client
  - Service-specific API methods for MCP tools
- [ ] Proper error handling and rate limit compliance
- [ ] Integration with token refresh mechanisms
- [ ] Response data transformation for MCP tools

### 8. MCP Protocol Implementation (`endpoints/`)

**File:** `endpoints/mcpHandler.js`
- [ ] Create service-specific MCP handler class (e.g., `GitHubMCPHandler`)
- [ ] Import dependencies:
  - `@modelcontextprotocol/sdk/server/mcp.js`
  - `@modelcontextprotocol/sdk/server/streamableHttp.js`
  - Service API integration class
- [ ] Constructor accepting serviceConfig and bearerToken
- [ ] Implement `setupTools()` method with comprehensive tool definitions:
  - Use Zod schemas for input validation
  - Define tools covering main service functionality
  - Include proper error handling and response formatting
- [ ] Implement `handleMCPRequest(req, res, message)` method:
  - Session-based transport management
  - Request routing and response handling
  - Integration with token refresh system

**File:** `endpoints/health.js`
- [ ] Export `healthCheck(serviceConfig)` function
- [ ] Test OAuth service availability
- [ ] Return health status with provider connectivity
- [ ] Include token refresh service health

### 9. Utilities (`utils/`)

**File:** `utils/oauthValidation.js`
- [ ] OAuth token format validation utilities
- [ ] Token expiration checking functions
- [ ] Scope validation helpers

**File:** `utils/tokenMetrics.js`
- [ ] Token refresh metrics collection
- [ ] Performance monitoring for OAuth operations
- [ ] Circuit breaker statistics

**File:** `utils/oauthErrorHandler.js`
- [ ] OAuth-specific error handling utilities
- [ ] Provider error code mapping
- [ ] Retry logic for transient failures
- [ ] Integration with logging system for OAuth errors

**File:** `utils/{serviceName}Formatting.js`
- [ ] Service-specific data formatting utilities
- [ ] API response transformation helpers
- [ ] MCP response formatting functions
- [ ] Data sanitization for logging

### 10. Main Service Entry Point (`index.js`)

**Service Configuration:**
- [ ] Define `SERVICE_CONFIG` object with exact structure:
  - `name` - Service identifier (lowercase)
  - `displayName` - Human-readable service name
  - `port` - Unique port number
  - `authType` - Must be exactly 'oauth'
  - `description` - Service description
  - `version` - Semantic version
  - `iconPath` - Path to service icon
  - `scopes` - Array of required OAuth scopes

**Express Route Configuration:**
- [ ] Global health endpoint: `GET /health`
- [ ] OAuth well-known endpoint: `GET /.well-known/oauth-authorization-server/:instanceId`
- [ ] Instance health endpoint: `GET /:instanceId/health`
- [ ] Main MCP endpoints: `POST /:instanceId` and `POST /:instanceId/mcp`
- [ ] Token caching endpoint: `POST /cache-tokens`

**Required Middleware Integration:**
- [ ] Import and use `credentialAuthMiddleware` for MCP endpoints
- [ ] Import and use `lightweightAuthMiddleware` for health endpoints
- [ ] Include OAuth-specific error handling middleware
- [ ] Integration with audit logging system

### 11. Logging and Monitoring Integration

**Required Logging Components:**
- [ ] Initialize service-specific logger with `mcpInstanceLogger.initializeLogger(instanceId, userId)`
- [ ] Implement user-specific log directories: `/logs/users/user_{userId}/mcp_{instanceId}/`
- [ ] Create log files: `app.log`, `access.log`, `error.log`
- [ ] Integrate with system-wide logging categories: application, security, performance, audit

**OAuth-Specific Logging:**
- [ ] Token refresh attempt logging with success/failure tracking
- [ ] OAuth flow event logging (initiation, callback, completion)
- [ ] Provider-specific error logging with sanitization
- [ ] Authentication state change logging
- [ ] Token expiration and renewal logging

**Token Management Monitoring:**
- [ ] Cache hit/miss ratio tracking for credential cache
- [ ] Token refresh frequency and success rate monitoring
- [ ] Background credential watcher performance monitoring
- [ ] Session management metrics and statistics

**Circuit Breaker Integration:**
- [ ] Import and configure circuit breaker from `/utils/circuitBreaker.js`
- [ ] Wrap OAuth provider API calls with circuit breaker protection
- [ ] Configure failure thresholds specific to OAuth operations
- [ ] Monitor OAuth service availability and recovery
- [ ] Track token refresh circuit breaker metrics

**Performance Monitoring:**
- [ ] OAuth flow timing (initiation to callback completion)
- [ ] Token refresh operation timing and performance
- [ ] API request timing with bearer token authentication
- [ ] Database query performance for token operations
- [ ] Cache synchronization performance monitoring

**Security Event Logging:**
- [ ] OAuth state parameter validation events
- [ ] Token storage and encryption events
- [ ] Authentication failure and retry attempts
- [ ] Suspicious activity detection and logging
- [ ] CSRF protection validation events

**Health Check Implementation:**
- [ ] OAuth provider connectivity verification
- [ ] Token cache health and synchronization status
- [ ] Background service status (credential watcher)
- [ ] Circuit breaker status for OAuth operations
- [ ] Session handler health and active session count

**Example OAuth Logging Implementation:**
```javascript
// Initialize logger for OAuth instance
const logger = mcpInstanceLogger.initializeLogger(instanceId, userId);

// OAuth flow logging
logger.info('OAuth flow initiated', { 
  provider: 'google', 
  scopes: ['email', 'profile'],
  state: 'sanitized-state-id'
});

// Token refresh logging
logger.info('Token refresh successful', {
  provider: 'google',
  instanceId: instanceId,
  refreshAttempt: 1,
  duration: 250,
  expiresIn: 3600
});

// Circuit breaker logging
logger.warn('OAuth provider circuit breaker opened', {
  provider: 'google',
  failureCount: 5,
  lastError: 'Connection timeout'
});

// Performance monitoring
logger.performance('oauth-callback', callbackDuration);
logger.performance('token-refresh', refreshDuration);

// Security event logging
logger.security('OAuth state validation failed', {
  provided: 'state-hash',
  expected: 'expected-hash',
  ip: req.ip
});
```

### 12. Multi-Tenant Architecture Requirements

**Instance Isolation:**
- [ ] Per-instance token caching with namespace isolation
- [ ] User-instance ownership validation
- [ ] Separate MCP sessions per instance
- [ ] Independent token refresh cycles
- [ ] Isolated logging per instance

**Scalability Features:**
- [ ] Database connection pooling integration
- [ ] Background service coordination
- [ ] Circuit breaker pattern implementation
- [ ] Rate limiting with user quotas
- [ ] Performance monitoring across tenants

### 13. Integration Requirements

**PM2 Configuration:**
- [ ] Add service to `/backend/ecosystem.config.js` apps array
- [ ] Service configuration:
  - `name` - Service name with prefix (e.g., 'minimcp-github')
  - `script` - Path to service index.js
  - `cwd` - Service directory path
  - `instances` - Usually 1 for OAuth services
  - `max_memory_restart` - Memory limit (e.g., '200M')

**OAuth Service Manager Integration:**
- [ ] Service automatically registered with OAuth service manager
- [ ] Health monitoring and automatic restart capabilities
- [ ] Performance monitoring integration
- [ ] Circuit breaker coordination

**Frontend Integration:**
- [ ] Service appears in MCP creation modal with OAuth flow
- [ ] OAuth initiation redirects to provider authorization
- [ ] Callback handling updates instance status
- [ ] Real-time status updates during OAuth flow

## Advanced Features Checklist

### Token Caching and Refresh System:
- [ ] In-memory cache with TTL expiration
- [ ] Background synchronization with database
- [ ] Automatic token refresh before expiration
- [ ] Retry logic with exponential backoff
- [ ] Cache invalidation on authentication failures
- [ ] Performance monitoring and metrics

### OAuth Flow Security:
- [ ] CSRF protection with cryptographic state parameters
- [ ] Secure token storage with encryption
- [ ] Audit logging for all OAuth operations
- [ ] Proper scope validation and enforcement
- [ ] Token revocation on instance deletion

### Error Handling and Recovery:
- [ ] Circuit breaker pattern for provider outages
- [ ] Graceful degradation on token refresh failures
- [ ] User-friendly error messages with recovery guidance
- [ ] Automatic cleanup of invalid tokens and sessions
- [ ] Comprehensive error logging and monitoring

## Validation Checklist

### Pre-Deployment Testing:
- [ ] Service starts without errors on assigned port
- [ ] Health endpoints return proper status
- [ ] OAuth flow initiation generates valid authorization URL with proper state parameter
- [ ] **CRITICAL**: Verify state parameter contains both `userId` and `instanceId`
- [ ] **CRITICAL**: Verify OAuth callback correctly parses and uses `userId` for authorization
- [ ] OAuth callback successfully exchanges code for tokens
- [ ] Token refresh works with real refresh tokens
- [ ] MCP tools respond correctly with OAuth authentication
- [ ] Token caching and invalidation work properly
- [ ] Background token refresh operates correctly

### Integration Testing:
- [ ] Service appears in auth registry service list
- [ ] Frontend OAuth flow completes successfully
- [ ] Instance creation updates database with OAuth status
- [ ] Token refresh maintains active sessions
- [ ] Error handling provides meaningful user feedback
- [ ] Multi-tenant isolation works correctly

## Common Pitfalls to Avoid

1. **OAuth State Management**: Always include BOTH `userId` and `instanceId` in state parameter for security and authorization
2. **OAuth Flow Security**: Always validate state parameters for CSRF protection  
3. **User Authorization**: Use `userId` from state to verify user owns the instance before processing callback
4. **Token Storage**: Use encrypted storage for refresh tokens and access tokens
5. **Token Refresh**: Implement proactive refresh before expiration, not reactive
6. **Error Handling**: Distinguish between recoverable and non-recoverable OAuth errors
7. **Scope Management**: Request minimal required scopes, handle scope changes
8. **Rate Limiting**: Respect provider rate limits and implement backoff strategies
9. **Multi-tenant**: Ensure complete isolation between user instances
10. **Caching**: Implement proper cache invalidation strategies
11. **Session Management**: Coordinate token updates with active MCP sessions
12. **Circuit Breakers**: Implement proper fallback mechanisms for provider outages

## Dependencies

**Required NPM Dependencies:**
- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `express` - Web server framework
- `zod` - Schema validation for MCP tools
- OAuth client libraries (provider-specific)
- Crypto libraries for secure token handling

**Required Internal Dependencies:**
- Database query functions from `/db/queries/mcpInstances/`
- OAuth service manager integration
- Logging utilities from main application
- Registry integration from `/services/mcp-auth-registry/`
- Validation base classes from `/services/validation/`
- Circuit breaker utilities
- Cache invalidation service integration

**Environment Variables:**
- `PUBLIC_DOMAIN` - Domain for OAuth redirect URIs
- Provider-specific OAuth credentials
- Database connection strings
- OAuth service configuration