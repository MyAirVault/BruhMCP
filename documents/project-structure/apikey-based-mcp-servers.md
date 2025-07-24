# API Key-Based MCP Servers

## Summary
This document details the structure and implementation patterns for API key-based MCP servers in the platform, using the Figma service as the reference implementation. It covers the complete folder structure, authentication flow, and all required files for creating API key-based services.

## Flow Diagram
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Service Dir   │───▶│Auth Registry    │───▶│  Instance API   │
│ /mcp-servers/   │    │   Detection     │    │   Endpoints     │
│   figma/        │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│Required Files:  │    │Service Type =   │    │MCP Protocol     │
│validateCreds.js │    │  'apikey'       │    │Tools & Calls    │
│createInstance.js│    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Required Directory Structure

### Complete Figma Service Structure
**Location**: `/backend/src/mcp-servers/figma/`

```
figma/
├── auth/                           # Authentication functions (REQUIRED)
│   ├── validateCredentials.js      # REQUIRED - Credential validation
│   ├── createInstance.js          # REQUIRED - Instance creation
│   └── revokeInstance.js          # OPTIONAL - Instance cleanup
├── validation/                     # Credential validators (REQUIRED)
│   └── credentialValidator.js     # Service-specific validation logic
├── api/                           # External API integration
│   ├── index.js                   # API client exports
│   ├── common.js                  # Common API utilities
│   ├── files.js                   # File operations
│   ├── user.js                    # User operations
│   └── [other-endpoints].js       # Additional API endpoints
├── services/                      # Business logic layer
│   ├── figmaService.js           # Main service class
│   ├── credentialCache.js        # Credential caching
│   ├── credentialWatcher.js      # Credential monitoring
│   └── instanceUtils.js          # Instance utilities
├── middleware/                    # Express middleware
│   └── credentialAuth.js         # Authentication middleware
├── endpoints/                     # MCP protocol endpoints
│   ├── tools.js                  # Available tools definition
│   ├── call.js                   # Tool execution handler
│   ├── health.js                 # Health check endpoint
│   └── mcpHandler.js             # Main MCP handler
├── utils/                        # Utility functions
│   ├── common.js                 # Common utilities
│   ├── fetchWithRetry.js         # HTTP client with retry
│   ├── logger.js                 # Logging utilities
│   └── sanitization.js           # Data sanitization
├── transformers/                 # Data transformation
│   ├── effects.js                # Effect transformations
│   ├── layout.js                 # Layout transformations
│   └── style.js                  # Style transformations
├── db/                          # Database schema
│   └── service.sql              # Service-specific DB schema
├── index.js                     # Main service entry point
└── package.json                 # Service dependencies (if any)
```

## Auth Registry Detection Pattern

### How Services Are Detected as API Key Type
**File**: `backend/src/services/mcp-auth-registry/core/serviceDiscovery.js:87-114`

**Detection Logic**:
1. **Required File**: `auth/validateCredentials.js` - Must exist for any service
2. **API Key Indicator**: `auth/createInstance.js` - Indicates API key support
3. **OAuth Exclusion**: No `auth/initiateOAuth.js` or `auth/oauthCallback.js` files
4. **Service Type**: Returns `'apikey'` when only API key files are present

### Required Files for API Key Services
**File**: `backend/src/services/mcp-auth-registry/core/serviceDiscovery.js:148-149`
```javascript
case 'apikey':
    return [...baseFiles, 'createInstance.js'];
```

**Base Files**: `['validateCredentials.js']`
**API Key Files**: `['validateCredentials.js', 'createInstance.js']`

## Authentication Implementation

### 1. Credential Validation
**File**: `/backend/src/mcp-servers/figma/auth/validateCredentials.js`

#### Purpose
- Validates API key format and credentials structure
- Used by auth registry's `/auth/validate/:serviceName` endpoint
- Does not create instances, only validates credential format/content

#### Implementation Pattern
```javascript
async function validateCredentials(credentials, userId) {
    // 1. Check required fields
    const apiKey = credentials.apiKey || credentials.apiToken;
    if (!apiKey) {
        return { success: false, message: 'API key required' };
    }

    // 2. Create service-specific validator
    const validator = createFigmaValidator({ api_key: apiKey });
    
    // 3. Test credentials against live API
    const result = await validator.testCredentials({ api_key: apiKey });
    
    // 4. Return standardized response
    return {
        success: result.valid,
        message: result.valid ? 'Valid credentials' : result.error,
        data: {
            userInfo: result.service_info,
            service: 'figma',
            authType: 'api_key'
        }
    };
}
```

### 2. Instance Creation
**File**: `/backend/src/mcp-servers/figma/auth/createInstance.js`

#### Purpose
- Creates new MCP service instance for authenticated user
- Stores encrypted credentials in database
- Returns instance details for frontend

#### Implementation Pattern
```javascript
async function createInstance(instanceData, userId) {
    // 1. Extract and validate credentials
    const { credentials, customName } = instanceData;
    const apiKey = credentials.apiKey || credentials.apiToken;
    
    // 2. Validate credentials using service validator
    const validator = createFigmaValidator({ api_key: apiKey });
    const validationResult = await validator.testCredentials({ api_key: apiKey });
    
    // 3. Get MCP service metadata from database
    const mcpService = await getMCPTypeByName('figma');
    
    // 4. Create instance record in database
    const instanceRecord = await createMCPInstance({
        userId,
        mcpServiceId: mcpService.mcp_service_id,
        customName: customName || 'Figma API',
        apiKey: apiKey,
        serviceType: 'api_key'
    });
    
    // 5. Return instance details
    return {
        success: true,
        instanceId: instanceRecord.instance_id,
        data: { instanceId, serviceName: 'figma', customName, status }
    };
}
```

### 3. Credential Validator
**File**: `/backend/src/mcp-servers/figma/validation/credentialValidator.js`

#### Service-Specific Validation Logic
```javascript
class FigmaAPIKeyValidator extends BaseValidator {
    async validateFormat(credentials) {
        // 1. Check credential structure
        if (!credentials.api_key) {
            return createValidationResult(false, 'API key is required', 'api_key');
        }
        
        // 2. Service-specific format validation
        if (!credentials.api_key.startsWith('figd_')) {
            return createValidationResult(false, 'Invalid Figma API key format', 'api_key');
        }
        
        // 3. Length validation
        if (credentials.api_key.length < 40 || credentials.api_key.length > 100) {
            return createValidationResult(false, 'Invalid API key length', 'api_key');
        }
        
        return createValidationResult(true);
    }
    
    async testCredentials(credentials) {
        // 1. Format validation first
        const formatResult = await this.validateFormat(credentials);
        if (!formatResult.valid) return formatResult;
        
        // 2. Test against live API
        const response = await fetch('https://api.figma.com/v1/me', {
            headers: { 'X-Figma-Token': credentials.api_key }
        });
        
        // 3. Handle API response
        if (response.ok) {
            const userData = await response.json();
            return createValidationResult(true, null, null, {
                service: 'Figma API',
                user_id: userData.id,
                email: userData.email,
                permissions: ['file_read', 'file_write']
            });
        } else {
            return createValidationResult(false, 'Invalid API token', 'api_key');
        }
    }
}
```

## Service Configuration

### MCP Ports Configuration
**File**: `/mcp-ports/figma/config.json`

#### Configuration Structure
```json
{
  "name": "figma",
  "displayName": "Figma", 
  "description": "Design collaboration platform",
  "category": "design",
  "port": 49280,
  "auth": {
    "type": "api_key",
    "fields": [
      {
        "name": "api_key",
        "type": "password", 
        "required": true,
        "description": "Figma Personal Access Token (starts with 'figd_')"
      }
    ]
  },
  "tools": [
    {
      "name": "get_user_info",
      "description": "Get current user information",
      "endpoint": "/me",
      "method": "GET"
    }
  ]
}
```

## Service Implementation Layers

### 1. Main Service Class
**File**: `/backend/src/mcp-servers/figma/services/figmaService.js:47-224`

#### Service Architecture Pattern
```javascript
export class FigmaService {
    constructor(authOptions) {
        this.apiKey = authOptions.figmaApiKey || '';
        this.useOAuth = false; // API key services don't use OAuth
    }
    
    async request(endpoint) {
        // Set authentication header
        const headers = {
            'X-Figma-Token': this.apiKey  // Service-specific auth header
        };
        
        const data = await fetchWithRetry(`${FIGMA_BASE_URL}${endpoint}`, { headers });
        return data;
    }
    
    // Service-specific methods
    async getFile(fileKey, depth = null) { /* ... */ }
    async getNode(fileKey, nodeId, depth = null) { /* ... */ }
    async getImages(fileKey, nodes, localPath) { /* ... */ }
}
```

### 2. Authentication Middleware
**File**: `/backend/src/mcp-servers/figma/middleware/credentialAuth.js:62-176`

#### Credential-Based Authentication
```javascript
export function createCredentialAuthMiddleware() {
    return async (req, res, next) => {
        const { instanceId } = req.params;
        
        // 1. Check credential cache (fast path)
        const cachedCredential = getCachedCredential(instanceId);
        if (cachedCredential) {
            req.figmaApiKey = cachedCredential.credential;
            req.instanceId = instanceId;
            req.userId = cachedCredential.user_id;
            return next();
        }
        
        // 2. Database lookup (slow path)
        const instance = await getFigmaInstanceCredentials(instanceId);
        const validation = validateInstanceAccess(instance);
        
        if (!validation.isValid) {
            return res.status(validation.statusCode).json({
                error: validation.error
            });
        }
        
        // 3. Extract and cache API key
        const apiKey = getApiKeyForInstance(instance);
        setCachedCredential(instanceId, {
            api_key: apiKey,
            expires_at: instance.expires_at,
            user_id: instance.user_id
        });
        
        // 4. Attach to request
        req.figmaApiKey = apiKey;
        req.instanceId = instanceId;
        req.userId = instance.user_id;
        
        next();
    };
}
```

### 3. MCP Protocol Implementation

#### Available Tools Definition
**File**: `/backend/src/mcp-servers/figma/endpoints/tools.js:8-97`
```javascript
export function getTools() {
    return {
        tools: [
            {
                name: 'get_figma_data',
                description: 'Get Figma file layout information',
                inputSchema: {
                    type: 'object',
                    properties: {
                        fileKey: {
                            type: 'string',
                            description: 'Figma file key from URL'
                        },
                        nodeId: {
                            type: 'string', 
                            description: 'Specific node ID to fetch'
                        }
                    },
                    required: ['fileKey']
                }
            }
        ]
    };
}
```

#### Tool Execution Handler
**File**: `/backend/src/mcp-servers/figma/endpoints/call.js`
- Handles MCP tool execution requests
- Uses authentication middleware to get API key
- Calls appropriate service methods
- Returns MCP-formatted responses

#### Health Check Endpoint
**File**: `/backend/src/mcp-servers/figma/endpoints/health.js`
- Provides service health status
- Tests API connectivity with cached credentials
- Returns service availability information

## Database Integration

### Instance Creation Database Flow
1. **Validate User Plan**: Check if user can create more instances
2. **Create Instance Record**: Insert into `mcp_service_table`
3. **Store Credentials**: Encrypt and store API key in `mcp_credentials`
4. **Update Statistics**: Increment service usage counters

### Credential Storage Pattern
```sql
-- mcp_credentials table stores encrypted API keys
INSERT INTO mcp_credentials (
    instance_id,
    api_key,           -- Encrypted API key
    oauth_status       -- Set to 'completed' for API key services
) VALUES (?, ?, 'completed');
```

## Credential Caching System

### Credential Cache Implementation
**File**: `/backend/src/mcp-servers/figma/services/credentialCache.js:44-254`

#### Cache Architecture
- **Storage**: In-memory Map storage for fast access
- **Entry Structure**: Includes credential, expiration, user ID, usage tracking
- **Performance**: Reduces database hits by caching frequently accessed credentials
- **Memory Management**: Automatic cleanup of expired and stale entries

#### Core Cache Functions
- **`getCachedCredential(instanceId)`**: Retrieves cached credential, checks expiration, updates last used timestamp
- **`setCachedCredential(instanceId, credentialData)`**: Stores credential with metadata (expiration, user ID, timestamps)
- **`removeCachedCredential(instanceId)`**: Removes specific credential from cache
- **`clearCredentialCache()`**: Clears entire cache (for testing/restart)
- **`isInstanceCached(instanceId)`**: Checks if instance exists in cache and is valid

#### Cache Statistics and Monitoring
**Function**: `getCacheStatistics()` - Lines 117-139
- **Total Entries**: Current number of cached credentials
- **Expired Entries**: Count of credentials past expiration time
- **Recently Used**: Credentials accessed within last hour
- **Cache Hit Rate**: Percentage of successful cache lookups in last hour
- **Memory Usage**: Memory consumed by cache in MB

### Background Cache Maintenance
**File**: `/backend/src/mcp-servers/figma/services/credentialWatcher.js:29-172`

#### Credential Watcher Service
- **Interval**: Runs every 30 seconds (`WATCHER_INTERVAL_MS = 30000`)
- **Expiration Tolerance**: 30-second buffer before expiration (`EXPIRATION_TOLERANCE_MS`)
- **Stale Threshold**: Removes unused credentials after 24 hours
- **Cache Limit**: Maximum 10,000 cached credentials (`MAX_CACHE_SIZE`)

#### Automatic Cleanup Operations
**Function**: `performCacheMaintenanceCheck()` - Lines 79-172
- **Expired Instance Removal**: Removes credentials expiring within 30-second tolerance
- **Stale Credential Cleanup**: Removes credentials unused for 24+ hours
- **Usage Tracking**: Logs maintenance results (expired count, stale count)
- **Background Processing**: Runs automatically every 30 seconds via watcher service

#### LRU (Least Recently Used) Eviction
When cache exceeds maximum size:
1. Sort entries by `last_used` timestamp (oldest first)
2. Remove oldest entries until under size limit
3. Log evicted instance IDs for monitoring

### Cache Invalidation System
**File**: `/backend/src/services/cacheInvalidationService.js:22-411`

#### Service-Specific Cache Cleanup
**Function**: `invalidateInstanceCache(serviceName, instanceId)` - Lines 22-39
- **Multi-Service Support**: Handles cache cleanup for different service types (Figma, GitHub, Slack)
- **Dynamic Imports**: Uses dynamic imports to avoid circular dependencies
- **Graceful Degradation**: Doesn't fail operations for unknown services
- **Cleanup Verification**: Validates successful removal from cache

#### Cache Validation After Cleanup
**Function**: `validateCacheCleanup()` - Lines 128-170
- Verifies instance was successfully removed from cache
- Uses `isInstanceCached()` to confirm cleanup
- Returns validation status for monitoring

#### Bulk Cache Operations
**Function**: `bulkInvalidateCache(instances)` - Lines 214-228
- **Batch Processing**: Invalidates cache for multiple instances in single operation
- **Result Tracking**: Returns success/failure status for each instance
- **Error Isolation**: Individual failures don't stop batch processing

**Function**: `emergencyCacheClear(serviceName)` - Lines 236-263
- **Complete Cache Clear**: Removes all cached credentials for a service
- **Emergency Use**: For critical situations requiring full cache reset
- **Service-Specific**: Clears only the specified service's cache

### Cache Integration in Authentication Flow

#### Fast Path (Cache Hit)
**File**: `/backend/src/mcp-servers/figma/middleware/credentialAuth.js:86-103`
- **Cache Lookup**: Checks in-memory cache for instance credentials
- **Immediate Response**: Skips database query when credential found in cache
- **Usage Tracking**: Updates last used timestamp and usage statistics
- **Performance Benefit**: Significantly faster response times for frequent requests

#### Slow Path (Cache Miss)
**File**: `/backend/src/mcp-servers/figma/middleware/credentialAuth.js:105-152`
- **Database Fallback**: Queries database when credential not in cache
- **Instance Validation**: Verifies instance exists and user has access
- **Cache Population**: Stores retrieved credential in cache for future requests
- **Hybrid Performance**: Combines database reliability with cache performance

### Cache Performance Monitoring

#### Performance Middleware
**File**: `/backend/src/mcp-servers/figma/middleware/credentialAuth.js:265-284`
- **Request Timing**: Measures response time for each API request
- **Cache Status Tracking**: Logs whether request was cache HIT or MISS
- **Performance Logging**: Records method, URL, cache status, and duration
- **Non-Intrusive**: Doesn't affect request processing, only adds logging

#### Watcher Status Monitoring
**Function**: `getWatcherStatus()` - Lines 207-216
- **Runtime Status**: Reports if credential watcher is currently running
- **Configuration Details**: Shows interval, tolerance, and threshold settings
- **Cache Limits**: Reports maximum cache size and current utilization
- **Health Monitoring**: Provides status for system health checks

### Cache Metadata Updates

#### Instance Status Changes
**Function**: `updateInstanceCacheMetadata()` - Lines 274-341
- **Metadata Only Updates**: Updates cache without changing the actual credential
- **Status Synchronization**: Keeps cache in sync with database status changes
- **Expiration Updates**: Updates cache when instance expiration time changes
- **Multi-Service Support**: Handles metadata updates for different service types

#### Metadata Update Implementation
**File**: `/backend/src/mcp-servers/figma/services/credentialCache.js:191-214`
- **Selective Updates**: Only updates specified metadata fields (expires_at, status)
- **Timestamp Tracking**: Updates last_modified timestamp on metadata changes
- **Existence Check**: Returns false if cache entry doesn't exist
- **Non-Destructive**: Preserves credential and other metadata during updates

## Security Considerations

### API Key Security
- **Encryption**: All API keys encrypted in database using AES-256
- **Caching**: Credentials cached in memory with TTL for performance
- **Validation**: Keys validated against live APIs before storage
- **Scoping**: Each instance has isolated credential storage

### Authentication Flow Security
- **UUID Validation**: Instance IDs validated as proper UUIDs
- **User Isolation**: Instance ownership validated per request
- **Token Refresh**: Cached credentials expire and refresh automatically
- **Audit Trail**: All credential operations logged in `token_audit_log`

### Cache Security
- **Memory Isolation**: Each service has separate cache namespace
- **Automatic Expiration**: Expired credentials automatically removed
- **Access Control**: Cache entries include user ID for ownership validation
- **Background Cleanup**: Credential watcher removes stale/invalid entries

## Common Implementation Patterns

### Error Handling Pattern
```javascript
try {
    const result = await someOperation();
    return { success: true, data: result };
} catch (error) {
    console.error('Operation failed:', error);
    return { 
        success: false, 
        message: `Operation failed: ${error.message}` 
    };
}
```

### Validation Response Format
```javascript
// Success response
{
    success: true,
    message: 'Credentials validated successfully',
    data: {
        userInfo: { userId, email, permissions },
        service: 'figma',
        authType: 'api_key'
    }
}

// Error response  
{
    success: false,
    message: 'API key validation failed: Invalid token format'
}
```

### Service Discovery Integration
The auth registry automatically detects API key services by:
1. Scanning `/mcp-servers/` directories
2. Looking for required auth files
3. Determining service type based on file presence
4. Registering service with database as `type: 'api_key'`

This enables automatic service discovery without manual configuration, making it easy to add new API key-based services by following the established folder structure and file naming patterns.