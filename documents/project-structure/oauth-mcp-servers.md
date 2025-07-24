# OAuth MCP Servers - Implementation Guide

## Overview

OAuth MCP servers provide secure, token-based authentication for third-party services through the Model Context Protocol. This document outlines the complete architecture, required files, and functionality for implementing OAuth-based MCP servers.

## Architecture Pattern

### Core Structure
Every OAuth MCP server follows this standardized directory structure:
```
/mcp-servers/{service-name}/
├── index.js                    # Express server entry point
├── auth/                       # OAuth authentication handlers
│   ├── initiateOAuth.js       # OAuth flow initiation
│   ├── oauthCallback.js       # OAuth callback handler
│   └── validateCredentials.js  # Credential validation
├── api/                        # Service-specific API operations
│   └── {service}Api.js        # API wrapper functions
├── endpoints/                  # MCP protocol handlers
│   └── mcpHandler.js          # MCP tools and resources
├── oauth/                      # OAuth utilities
│   └── oauthHandler.js        # OAuth configuration and flow
├── services/                   # Business logic services
├── middleware/                 # Express middleware
└── utils/                      # Utility functions
```

## Required Files and Functionality

### 1. Entry Point (`index.js`)

**Purpose**: Express server configuration and startup
**Port Convention**: 49296+ (sequential allocation)

**Required Functionality**:
- Express server initialization with CORS
- Multi-tenant routing (`/:instanceId/mcp`, `/:instanceId/health`)
- Global health endpoint (`/health`)
- Token caching endpoint (`/cache-tokens`)
- Graceful shutdown handling
- Error middleware integration

**Key Features**:
- Instance-based request routing
- Session management for persistent connections
- Statistics tracking and monitoring
- Proper error handling and logging

### 2. OAuth Flow Initiation (`auth/initiateOAuth.js`)

**Purpose**: Start OAuth 2.0 authorization flow

**Required Functionality**:
- Validate client credentials (client_id, client_secret)  
- Generate secure state parameter with instance metadata
- Construct authorization URL with proper scopes
- Return authorization URL for user redirection

**Input Parameters**:
- `instanceId`: Unique instance identifier
- `clientId`: OAuth client ID
- `clientSecret`: OAuth client secret
- Service-specific parameters

**Output**:
- Authorization URL with state parameter
- Success/error status
- Instance tracking information

### 3. OAuth Callback Handler (`auth/oauthCallback.js`)

**Purpose**: Process OAuth authorization response

**Required Functionality**:
- Validate state parameter for CSRF protection
- Exchange authorization code for access token
- Store tokens securely in database
- Update instance status to completed
- Handle error states and cleanup

**Input Parameters**:
- `code`: Authorization code from provider
- `state`: CSRF protection state parameter
- `error`: Error code if authorization failed

**Output**:
- Success/failure status
- Token storage confirmation
- Error details if applicable

### 4. Credential Validation (`auth/validateCredentials.js`)

**Purpose**: Verify OAuth credentials validity

**Required Functionality**:
- Test OAuth client credentials
- Verify token freshness and validity
- Check required scopes availability
- Validate API endpoint accessibility

**Input Parameters**:
- OAuth credentials object
- Instance configuration

**Output**:
- Validation status (valid/invalid)
- Error details if validation fails
- Scope verification results

### 5. OAuth Handler (`oauth/oauthHandler.js`)

**Purpose**: OAuth 2.0 flow configuration and management

**Required Functionality**:
- OAuth client configuration (client_id, client_secret, scopes)
- Authorization URL generation with proper parameters
- Token exchange implementation
- Token refresh logic
- Scope management

**Key Components**:
- OAuth provider endpoints configuration
- Scope definitions for service access
- PKCE support if required by provider
- State parameter generation and validation

### 6. MCP Handler (`endpoints/mcpHandler.js`)

**Purpose**: MCP protocol implementation using official SDK

**Required Functionality**:
- MCP server creation with official `@modelcontextprotocol/sdk`
- Tool definitions for service-specific operations
- Resource definitions for data access
- Request handling with proper authentication
- Error handling and response formatting

**Tool Categories**:
- **CRUD Operations**: Create, read, update, delete data
- **Search Operations**: Query and filter functionality  
- **Batch Operations**: Multiple operations in single request
- **Management Operations**: Configuration and settings
- **Utility Operations**: Helper functions and data conversion

**Implementation Requirements**:
- JSON-RPC 2.0 protocol compliance
- Proper error codes and messages
- Input validation and sanitization
- Rate limiting and quota management
- Comprehensive logging

### 7. API Wrapper (`api/{service}Api.js`)

**Purpose**: Service-specific API integration

**Required Functionality**:
- HTTP client configuration with proper headers
- Authentication token injection
- Request/response transformation
- Error handling and retry logic
- Rate limiting compliance

**Key Features**:
- Token refresh automation
- API versioning support
- Response caching where appropriate
- Pagination handling
- Error mapping to standard formats

### 8. Database Integration

**Required Tables**:
- `mcp_table`: Service registration and metadata
- `mcp_service_table`: Instance-specific configurations
- `mcp_credentials`: Encrypted token storage

**Required Functionality**:
- Service registration during startup
- Instance status tracking
- Secure credential storage with encryption
- Token refresh scheduling
- Audit logging for security events

## Multi-Tenant Architecture

### Instance Management

**Instance Identification**:
- Unique instance IDs per OAuth configuration
- Isolated credential storage per instance
- Independent session management
- Separate statistics and monitoring

**Routing Pattern**:
```
GET  /:instanceId/health      # Instance health check
POST /:instanceId/mcp         # MCP protocol endpoint
GET  /:instanceId/status      # Instance status
POST /:instanceId/refresh     # Token refresh
```

### Token Caching Architecture

**In-Memory Cache Implementation**:
- Each MCP service maintains isolated JavaScript `Map` objects for fast token storage
- Cache keys use instance IDs (UUIDs) for unique identification
- Cache entries store: `bearerToken`, `refreshToken`, `expiresAt`, `user_id`, `last_used`, `refresh_attempts`, `cached_at`, `last_modified`, `status`

**Service-Specific Cache Services**:
- `services/credentialCache.js` - Token lifecycle management per service
- Background database synchronization every 5 minutes
- Automatic cache-database consistency verification
- Cache initialization on service startup with cleanup

**Cache Entry Structure**:
```javascript
{
  bearerToken: string,           // OAuth access token
  refreshToken: string,          // OAuth refresh token  
  expiresAt: number,            // Expiration timestamp (ms)
  user_id: string,              // Owner user ID
  last_used: string,            // Last access timestamp
  refresh_attempts: number,     // Failed refresh count
  cached_at: string,            // Cache creation time
  last_modified: string,        // Last update time
  status: string               // Instance status
}
```

### Cache Invalidation System

**Centralized Invalidation Service** (`/services/cacheInvalidationService.js`):
- Individual instance invalidation: `invalidateInstanceCache(serviceName, instanceId)`
- Bulk invalidation: `bulkInvalidateCache(instances)`
- Emergency cache clearing: `emergencyCacheClear(serviceName)`
- Automatic cleanup: `cleanupInvalidCacheEntries(reason)`

**Invalidation Triggers**:
- Instance deletion with automatic cache cleanup
- Token expiration with lazy removal
- Status changes updating cache state
- Manual administrative cleanup operations
- Post-deletion validation ensuring complete removal

### Token Refresh Mechanisms

**OAuth Service Integration** (`/utils/oauth-integration.js`):
- Circuit breaker pattern preventing cascading OAuth service failures
- Retry logic with exponential backoff for transient failures
- Automatic token refresh before expiration threshold
- Graceful degradation when refresh operations fail

**Refresh Process Flow**:
1. Check OAuth service availability and health
2. Execute refresh request through circuit breaker protection
3. Update in-memory cache with new tokens
4. Synchronize updates to database storage
5. Track refresh attempts and reset counters on success

**Refresh Attempt Management**:
- Failed refresh attempt counter per instance
- Throttling to prevent excessive refresh requests
- Counter reset after successful token refresh
- Circuit breaking after repeated refresh failures

### Cache Expiration Handling

**Expiration Monitor Service** (`/services/expirationMonitor.js`):
- Runs every minute checking all instances across services
- Marks expired instances and invalidates cache entries
- Cleans up failed OAuth instances automatically
- Removes instances pending OAuth >5 minutes

**Multi-Level Expiration**:
- Lazy expiration checking tokens on access
- Proactive background cleanup of expired tokens
- Grace period token refresh before actual expiration
- Cache-database consistency during cleanup operations

### OAuth Service Manager

**Dynamic Service Management** (`/services/oauth-service-manager.js`):
- Automatic OAuth service startup/shutdown as needed
- Continuous health monitoring with automatic restart
- HTTP connection pooling for optimized performance
- Circuit breaker protection against service failures
- Performance monitoring tracking response times and success rates

**Health Assessment Features**:
- OAuth service endpoint testing and validation
- Health status reporting: healthy/degraded/unhealthy
- Optimization recommendations based on performance metrics
- Provider-specific availability monitoring

### Session Management

**Persistent Connections**:
- MCP handler instances cached per instanceId using official SDK
- Transport management for WebSocket-like persistent behavior
- Session cleanup coordinated with cache invalidation
- Connection pooling integrated with OAuth service manager

**State Management**:
- Instance configuration caching with TTL expiration
- Token caching with automatic refresh scheduling
- Session statistics tracking and performance monitoring
- Error state recovery with circuit breaker integration

## Security Requirements

### OAuth Security

**Token Management**:
- Secure storage with encryption at rest
- Automatic token refresh before expiration
- Token revocation on instance deletion
- Scope validation on every request

**CSRF Protection**:
- Cryptographically secure state parameters
- State validation in callback handler
- Instance metadata encoding in state
- Expiration handling for state parameters

**Error Handling**:
- No sensitive data in error messages
- Proper error logging without token exposure
- Graceful degradation on authentication failures
- Security event auditing

### Multi-Tenant Security

**Isolation**:
- Instance-based credential isolation
- Separate authentication contexts
- Independent rate limiting
- Isolated error handling

**Access Control**:
- Instance ownership validation
- Scope-based permission checking
- API endpoint authorization
- Resource access validation

## Service Registration

### Automatic Discovery

**Registration Process**:
1. Service detection in `/mcp-servers/` directory
2. File structure analysis for authentication type
3. Automatic service registration in database
4. Health monitoring setup

**Detection Logic**:
- OAuth services: Has `initiateOAuth.js`, `oauthCallback.js`, `validateCredentials.js`
- Missing `createInstance.js` confirms OAuth-only type
- Port assignment and health endpoint setup

### Registry Integration

**MCP Auth Registry**:
- Centralized service management
- Dynamic function loading
- Unified API endpoints
- Health monitoring aggregation

**API Endpoints**:
```
POST /api/v1/auth-registry/auth/validate/:serviceName
POST /api/v1/auth-registry/auth/initiate-oauth/:serviceName  
GET  /api/v1/auth-registry/auth/callback/:serviceName
GET  /api/v1/auth-registry/auth/services
```

## Implementation Checklist

### Core Requirements
- [ ] Express server with proper routing
- [ ] OAuth 2.0 flow implementation
- [ ] MCP protocol compliance using official SDK
- [ ] Multi-tenant architecture support
- [ ] Database integration for credentials
- [ ] Security best practices implementation

### Authentication Flow
- [ ] OAuth client credential validation
- [ ] Authorization URL generation
- [ ] Callback handling with CSRF protection
- [ ] Token storage and refresh logic
- [ ] Error handling and recovery

### MCP Integration
- [ ] Tool definitions for service operations
- [ ] Resource definitions for data access
- [ ] Proper JSON-RPC 2.0 implementation
- [ ] Error handling and response formatting
- [ ] Input validation and sanitization

### Operations and Monitoring
- [ ] Health endpoints implementation
- [ ] Statistics and metrics collection
- [ ] Logging and audit trails
- [ ] Graceful shutdown handling
- [ ] Performance monitoring

### Testing Requirements
- [ ] OAuth flow testing
- [ ] MCP protocol testing
- [ ] Multi-tenant scenario testing
- [ ] Security testing
- [ ] Performance testing

## Best Practices

### Development Guidelines
1. **Follow OAuth 2.0 Security Best Practices**
2. **Implement Proper Error Handling**
3. **Use Official MCP SDK**
4. **Maintain Instance Isolation**
5. **Implement Comprehensive Logging**
6. **Plan for Token Refresh**
7. **Design for Scalability**
8. **Test Multi-Tenant Scenarios**

### Common Patterns
- Use environment variables for OAuth configuration
- Implement exponential backoff for API retries
- Cache frequently accessed data appropriately
- Log security events for auditing
- Validate all inputs thoroughly
- Handle rate limiting gracefully

This architecture ensures secure, scalable, and maintainable OAuth MCP server implementations that integrate seamlessly with the broader MCP ecosystem.