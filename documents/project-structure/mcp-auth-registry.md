# MCP Authentication Registry

## Summary
This document details the MCP Authentication Registry system that automatically discovers MCP services, detects their authentication types (API key, OAuth, or hybrid), and provides a unified API for authentication across all services. The registry uses a service discovery pattern to analyze service directory structures and determine capabilities.

## Flow Diagram
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Service Scanner │───▶│Service Registry │───▶│ Auth Routes API │
│(Auto-Discovery)│    │  (Central Hub)  │    │ (Express Routes)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   File System   │    │   Service Map   │    │  Client Calls   │
│   /mcp-servers  │    │{name: entry}    │    │POST /validate   │
│   /*/auth/*.js  │    │                 │    │POST /oauth      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Core Architecture

### Main Registry Class
**File**: `backend/src/services/mcp-auth-registry/index.js:27-276`
- **Class**: `MCPAuthRegistry`
  - Singleton pattern managing service discovery and authentication
  - Provides unified API for all MCP services regardless of auth type
  - Handles automatic service discovery and function loading
  - Manages Express routes for authentication endpoints

### Service Registry Core  
**File**: `backend/src/services/mcp-auth-registry/core/registry.js:20-264`
- **Class**: `ServiceRegistry`  
  - Manages service discovery, function loading, and execution
  - Maps service names to service entries with metadata
  - Provides dynamic function loading and safe execution
  - Tracks service health and availability

## Authentication Type Detection

### Service Discovery System
**File**: `backend/src/services/mcp-auth-registry/core/serviceDiscovery.js:21-44`
- **Function**: `discoverServices(servicesDir)`
  - Scans `/backend/src/mcp-servers/` directory for service folders
  - Calls `analyzeServiceDirectory()` for each found service
  - Returns complete service registry mapping
  - Logs discovery statistics and results

### Authentication Type Detection Logic
**File**: `backend/src/services/mcp-auth-registry/core/serviceDiscovery.js:87-114`
- **Function**: `determineServiceType(servicePath)`
  - Analyzes service's `/auth/` directory for authentication files
  - **Required Files Check**:
    - `validateCredentials.js` - Required for all services
    - `createInstance.js` - Indicates API key support  
    - `initiateOAuth.js` - Indicates OAuth support
    - `oauthCallback.js` - Required for OAuth completion
  - **Authentication Type Logic**:
    - **`'hybrid'`**: Has all OAuth files AND `createInstance.js` (supports both)
    - **`'oauth'`**: Has OAuth files but no `createInstance.js` (OAuth only)
    - **`'apikey'`**: Has `createInstance.js` but no OAuth files (API key only)
    - **`null`**: Missing `validateCredentials.js` or invalid configuration

### Service Health Validation
**File**: `backend/src/services/mcp-auth-registry/core/serviceDiscovery.js:123-136`
- **Function**: `checkServiceHealth(servicePath, serviceType)`
  - Validates all required files exist for determined service type
  - Uses `getRequiredFiles()` to get type-specific file requirements
  - Returns boolean indicating service health status

### Required Files by Authentication Type
**File**: `backend/src/services/mcp-auth-registry/core/serviceDiscovery.js:144-157`
- **Function**: `getRequiredFiles(serviceType)`
  - **API Key Services**: `['validateCredentials.js', 'createInstance.js']`
  - **OAuth Services**: `['validateCredentials.js', 'initiateOAuth.js', 'oauthCallback.js']`
  - **Hybrid Services**: `['validateCredentials.js', 'createInstance.js', 'initiateOAuth.js', 'oauthCallback.js']`

## Authentication Flow Implementations

### API Key Authentication Flow

#### Credential Validation (API Key)
**Example**: `backend/src/mcp-servers/airtable/validation/credential-validator.js:18-36`
- **Function**: `validateFormat(credentials)`
  - Checks for `api_key` or `apiKey` field in credentials
  - Validates API key is non-empty string
  - Performs basic format validation without external API calls
  - Returns standardized validation result

#### API Key Testing
**Example**: `backend/src/mcp-servers/airtable/validation/credential-validator.js:43-77`  
- **Function**: `testCredentials(credentials)`
  - Makes actual API call to service (e.g., Airtable `/meta/bases`)
  - Uses Bearer token authentication
  - Handles different HTTP error codes (401 = invalid key)
  - Returns detailed validation result with permissions and metadata

#### Authentication Utilities
**Example**: `backend/src/mcp-servers/airtable/utils/auth.js:31-94`
- **Function**: `validateToken(token)`  
  - Implements token caching (5-minute cache duration)
  - Determines token type (Personal Access Token vs Legacy API Key)
  - Tests token against live API endpoints
  - Extracts token scopes and user information
  - Caches successful validation results

### OAuth Authentication Flow

#### Credential Validation (OAuth)
**Example**: `backend/src/mcp-servers/gmail/auth/validateCredentials.js:20-81`
- **Function**: `validateCredentials(credentials, userId)`
  - Validates OAuth client credentials format (client_id, client_secret)
  - Handles both snake_case and camelCase credential formats
  - Uses service-specific validators for format checking
  - Returns validation result without initiating OAuth flow

#### OAuth Initiation
**Implementation Pattern**: Services have `auth/initiateOAuth.js`
- Creates OAuth authorization URL with proper scopes
- Generates secure state parameter for CSRF protection
- Stores pending OAuth request in database
- Returns authorization URL for user redirection

#### OAuth Callback Handling  
**Implementation Pattern**: Services have `auth/oauthCallback.js`
- Validates OAuth callback parameters (code, state)
- Exchanges authorization code for access/refresh tokens
- Stores encrypted tokens in `mcp_credentials` table
- Updates instance status to completed

## Registry API Endpoints

### Authentication Routes
**File**: `backend/src/services/mcp-auth-registry/routes/authRoutes.js:20-512`

#### Credential Validation Endpoint
- **Route**: `POST /auth/validate/:serviceName`
- **File**: `authRoutes.js:28-63`
- **Function**: Validates credentials for any service type
- **Logic**: 
  - Checks if service exists and is active
  - Calls service's `validateCredentials` function
  - Returns standardized validation result

#### OAuth Initiation Endpoint
- **Route**: `POST /auth/initiate-oauth/:serviceName`  
- **File**: `authRoutes.js:70-121`
- **Function**: Starts OAuth flow for OAuth/hybrid services
- **Logic**:
  - Validates service supports OAuth (`oauth` or `hybrid` type)
  - Calls service's `initiateOAuth` function
  - Returns OAuth authorization URL

#### Instance Creation Endpoint  
- **Route**: `POST /auth/create-instance/:serviceName`
- **File**: `authRoutes.js:128-179`
- **Function**: Creates instances for API key/hybrid services
- **Logic**:
  - Rejects pure OAuth services (must use OAuth flow)
  - Calls service's `createInstance` function
  - Creates database records for new instance

#### OAuth Callback Endpoint
- **Route**: `GET /auth/callback/:serviceName`
- **File**: `authRoutes.js:186-408`
- **Function**: Handles OAuth provider callbacks
- **Logic**:
  - Validates OAuth callback parameters (code, state, error)
  - Calls service's `oauthCallback` function
  - Returns HTML popup window with success/error status
  - Uses `postMessage` API to communicate with parent window

#### Service Listing Endpoint
- **Route**: `GET /auth/services`
- **File**: `authRoutes.js:463-491`
- **Function**: Lists all available services with metadata
- **Returns**: Service names, types, available functions, and registry statistics

### Registry Statistics Endpoint  
- **Route**: `GET /auth/stats`
- **File**: `authRoutes.js:498-509`
- **Function**: Returns registry health and statistics
- **Data**: Total services, active services, services by type

## Service Function Loading and Execution

### Dynamic Function Loading
**File**: `backend/src/services/mcp-auth-registry/core/registry.js:60-73`
- **Function**: `#loadAllServiceFunctions()`
  - Loads authentication functions for all discovered services
  - Uses `serviceLoader.js` for dynamic module loading  
  - Caches loaded functions in service registry entries
  - Reports loading success/failure per service

### Safe Function Execution
**File**: `backend/src/services/mcp-auth-registry/core/registry.js:140-179`
- **Function**: `callServiceFunction(serviceName, functionName, ...args)`
  - Validates service exists and is active
  - Checks if function exists, loads dynamically if needed
  - Uses `safeCallFunction` wrapper for error handling
  - Returns standardized success/error response format

### Service Health Monitoring
**File**: `backend/src/services/mcp-auth-registry/core/registry.js:203-227`
- **Function**: `reloadService(serviceName)`
  - Reloads functions for specific service (hot reload capability)
  - Useful for development and service updates
  - Maintains service state while refreshing functions

## Auto-Discovery and Monitoring

### Automatic Service Discovery
**File**: `backend/src/services/mcp-auth-registry/index.js:203-215`
- **Function**: `startAutoDiscovery(servicesPath, interval)`
  - Runs periodic service discovery (default: 30 seconds)
  - Detects new services added to filesystem
  - Updates registry with changes automatically
  - Logs discovery results and statistics

### Registry Initialization  
**File**: `backend/src/services/mcp-auth-registry/index.js:48-93`
- **Function**: `initialize(config)`
  - Performs initial service discovery from `/mcp-servers/` directory
  - Creates Express routes for authentication API
  - Starts auto-discovery if enabled
  - Logs complete registry summary

### Service Statistics and Monitoring
**File**: `backend/src/services/mcp-auth-registry/core/registry.js:234-263`
- **Function**: `getStats()`
  - Returns comprehensive registry statistics
  - Counts total and active services
  - Groups services by authentication type
  - Provides service health overview

## Integration with Database

### Service Type Storage
The discovered authentication types are stored in the database:
- **Table**: `mcp_table.type` field stores `'api_key'` or `'oauth'`
- **Validation**: Database constraint ensures only valid types
- **Usage**: Frontend uses this to determine authentication UI flow

### Instance Authentication Status
- **Table**: `mcp_service_table.oauth_status` tracks OAuth flow progress
- **States**: `'pending'`, `'completed'`, `'failed'`
- **Credentials**: `mcp_credentials` table stores encrypted tokens/keys per instance

## Error Handling and Security

### Authentication Error Handling
- **Validation Errors**: Standardized error responses with specific error codes
- **OAuth Errors**: Proper error parameter handling in callback URLs
- **Security**: OAuth state parameter validation prevents CSRF attacks
- **Rate Limiting**: Token validation caching prevents API abuse

### Service Discovery Security
- **File System Access**: Only scans designated `/mcp-servers/` directory
- **Function Loading**: Uses safe dynamic imports with error catching
- **Service Validation**: Requires specific file structure for service activation

## Configuration and Extensibility

### Service Configuration Detection
The registry automatically detects service capabilities without requiring manual configuration files. Authentication type is determined purely by analyzing the service's file structure in the `/auth/` directory.

### Adding New Authentication Types
To add a new authentication type:
1. Extend `determineServiceType()` logic in `serviceDiscovery.js`
2. Add required files pattern to `getRequiredFiles()`
3. Update route handlers to support new type
4. Add database migration for new type if needed

### Service Function Requirements
All services must implement these authentication functions:
- **`validateCredentials(credentials, userId)`**: Validate credential format/content
- **API Key Services**: `createInstance(instanceData, userId)` 
- **OAuth Services**: `initiateOAuth(credentials, userId)`, `oauthCallback(code, state)`
- **Optional**: `revokeInstance(instanceId, userId)` for cleanup