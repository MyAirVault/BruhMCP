# Centralized OAuth Flow Documentation

## Overview

This document describes the centralized OAuth authentication system designed for MCP (Model Context Protocol) services that require OAuth 2.0 authentication. The system provides a unified approach to handle OAuth flows across multiple service providers (Google, Microsoft, Slack, etc.) while maintaining service independence and proper separation of concerns.

**⚠️ Important Note**: This OAuth flow is specifically designed for services that require **Client ID + Client Secret** authentication (OAuth 2.0). Services that use **API Key** authentication (like Figma) should continue using the existing simpler flow without OAuth consent.

### Key Benefits

- **Unified OAuth Logic**: Single OAuth service handles all provider flows
- **Consistent User Experience**: Same OAuth flow across all MCP services
- **Service Independence**: Each service maintains its own token cache and management
- **Scalable Architecture**: Easy to add new OAuth providers
- **Security**: Proper OAuth 2.0 flow with state validation
- **Performance**: Service-specific token caching for fast API responses

## Architecture Overview

### Core Components

```
backend/src/oauth-service/
├── index.js                    # Stateless OAuth service with HTTP endpoints
├── core/
│   ├── oauth-manager.js       # OAuth flow orchestration (stateless)
│   └── token-exchange.js      # Token exchange logic (no caching)
├── providers/
│   ├── google.js             # Google OAuth implementation
│   ├── microsoft.js          # Microsoft OAuth implementation
│   └── base-oauth.js         # Common OAuth functionality
└── utils/
    └── validation.js         # Credential and token validation
```

### Service-Specific Components (per MCP service)

```
backend/src/mcp-servers/{service}/
├── services/
│   └── credential-cache.js    # Service-specific token caching
├── middleware/
│   └── credential-auth.js     # Service-specific authentication
└── utils/
    └── oauth-integration.js   # Integration with OAuth service
```

### Integration Points

- **Frontend Modal**: Instance creation with OAuth consent
- **OAuth Service**: Stateless OAuth flow handling (no token storage)
- **MCP Services**: Each service manages its own tokens and cache
- **Database**: Credential storage managed by individual services

## Authentication Flow Comparison

### OAuth Services (Client ID + Client Secret)
**Examples**: Gmail, Google Drive, Microsoft Outlook, Slack, GitHub

**Flow**: Format validation → Instance creation → OAuth consent → Token caching → Success/Failure handling

### API Key Services (API Key Authentication)
**Examples**: Figma, Linear, Notion (with API keys)

**Flow**: Format validation → Instance creation → Direct API validation → Success (no OAuth needed)

## OAuth Flow Summary (For Client ID + Client Secret Services Only)

### Complete OAuth Flow Overview

1. **Format Validation**: User enters Client ID + Client Secret → Frontend validates format → Enables "Create" button
2. **Instance Creation**: User clicks "Create" → Backend creates instance with instance_id → Modal shows spinner
3. **OAuth Flow**: Backend triggers OAuth with instance_id → User completes consent → OAuth callback with instance_id
4. **Token Storage**: OAuth service exchanges code for tokens → Service caches tokens with instance_id
5. **Success/Failure**: If successful → Modal closes, instance active | If failed → Delete instance, show error, allow retry

### Key Benefits of This OAuth Flow

- **Atomic Operation**: Either complete success or complete failure (no orphaned instances)
- **Clear User Feedback**: Spinner shows process in progress, modal stays open until complete
- **Proper Instance ID**: OAuth flow has actual instance_id from database
- **Retry Capability**: Failed OAuth allows user to retry without losing progress
- **Clean Error Handling**: Failed OAuth automatically cleans up incomplete instance

## Detailed Flow

### Phase 1: Format Validation and Instance Creation with OAuth

#### 1.1 User Credential Entry and Format Validation

**File**: `frontend/src/components/modals/CreateInstanceModal.jsx`

- **Function**: `handleCredentialChange()`
  - Captures Client ID and Client Secret input
  - Triggers real-time format validation on input change
  - Updates UI state based on validation results

- **Function**: `validateCredentialFormat()`
  - Validates credential format locally (basic checks)
  - Enables/disables "Create" button based on format validity
  - Shows format validation feedback to user

#### 1.2 Instance Creation Initiation

**File**: `frontend/src/components/modals/CreateInstanceModal.jsx`

- **Function**: `handleCreateInstance()`
  - Triggered when user clicks "Create" button
  - Shows spinner on button and prevents modal closure
  - Sends instance creation request to backend

- **Function**: `showCreationSpinner()`
  - Displays loading spinner on "Create" button
  - Prevents modal from closing during process
  - Shows "Creating instance..." status

#### 1.3 Backend Instance Creation

**File**: `backend/src/routes/instances.js`

- **Endpoint**: `POST /instances`
  - Creates new MCP service instance in database
  - Generates unique instance_id
  - Stores Client ID and Client Secret temporarily
  - Initiates OAuth flow with instance_id

- **Function**: `createInstanceWithOAuth()`
  - Creates instance record in database
  - Generates instance_id for OAuth flow
  - Calls OAuth service with instance_id and credentials

#### 1.4 OAuth Flow with Instance ID

**File**: `backend/src/oauth-service/index.js`

- **Endpoint**: `POST /start-oauth`
  - Receives instance_id and credentials
  - Validates credential format
  - Generates OAuth authorization URL with instance_id in state

- **Function**: `startOAuthFlow()`
  - Validates provider credentials format
  - Generates authorization URL with instance_id
  - Returns authorization URL to frontend

#### 1.5 Provider-Specific OAuth Initiation

**File**: `backend/src/oauth-service/providers/google.js`

- **Function**: `validateGoogleCredentials()`
  - Validates Google OAuth Client ID/Secret format
  - Checks credential structure and format
  - Returns validation result

- **Function**: `generateAuthorizationUrl()`
  - Creates OAuth 2.0 authorization URL
  - Includes required scopes for the service
  - Adds state parameter containing instance_id
  - Returns URL for user consent

#### 1.6 User OAuth Consent

**File**: `frontend/src/components/modals/CreateInstanceModal.jsx`

- **Function**: `openOAuthPopup()`
  - Opens OAuth consent screen in popup/new tab
  - Handles popup blocking scenarios
  - Monitors popup for completion

- **Function**: `handleOAuthMessage()`
  - Listens for OAuth completion messages
  - Processes success/failure responses
  - Updates UI based on OAuth result

#### 1.7 OAuth Callback Processing

**File**: `backend/src/oauth-service/index.js`

- **Endpoint**: `GET /callback/:provider`
  - Receives authorization code from OAuth provider
  - Extracts instance_id from state parameter
  - Processes authorization code exchange

- **Function**: `handleOAuthCallback()`
  - Validates state parameter and extracts instance_id
  - Exchanges authorization code for tokens
  - Initiates token storage process

#### 1.8 Token Exchange and Storage

**File**: `backend/src/oauth-service/core/oauth-manager.js`

- **Function**: `exchangeAuthorizationCode()`
  - Exchanges authorization code for access/refresh tokens
  - Handles OAuth 2.0 token endpoint communication
  - Validates token response format

- **Function**: `validateTokenScopes()`
  - Ensures received tokens have required scopes
  - Validates token permissions for service needs
  - Returns scope validation results

#### 1.9 Service-Specific Token Caching

**File**: `backend/src/mcp-servers/{service}/services/credential-cache.js`

- **Function**: `cacheTokens()`
  - Stores access and refresh tokens in service-specific memory cache
  - Sets expiration times for token management
  - Associates tokens with instance_id

- **Function**: `generateCacheKey()`
  - Creates unique cache keys using instance_id
  - Handles instance-specific token isolation
  - Ensures proper token retrieval

#### 1.10 Success/Failure Handling

**File**: `backend/src/routes/instances.js`

- **Function**: `handleOAuthSuccess()`
  - Confirms OAuth success and token caching
  - Finalizes instance creation in database
  - Returns success response to frontend

- **Function**: `handleOAuthFailure()`
  - Detects OAuth failure or token exchange failure
  - Deletes instance from database (cleanup)
  - Returns error response to frontend

#### 1.11 Frontend Response Handling

**File**: `frontend/src/components/modals/CreateInstanceModal.jsx`

- **Function**: `onInstanceCreateSuccess()`
  - Handles successful instance creation
  - Closes modal and updates instance list
  - Shows success notification

- **Function**: `onInstanceCreateFailure()`
  - Handles OAuth or instance creation failure
  - Shows error message in modal
  - Keeps modal open for retry
  - Re-enables "Create" button for retry attempt

- **Function**: `handleRetry()`
  - Allows user to retry instance creation
  - Resets UI state and error messages
  - Enables retry with same or updated credentials

### Phase 2: API Request Authentication

#### 2.1 Service-Specific Token Retrieval

**File**: `backend/src/mcp-servers/{service}/middleware/credential-auth.js`

- **Function**: `createCredentialAuthMiddleware()`
  - Intercepts incoming API requests
  - Validates instance ID format
  - Checks service-specific token cache first

- **Function**: `getValidToken()`
  - Retrieves token from service-specific cache
  - Handles token refresh if needed
  - Attaches token to request context

#### 2.2 Service-Specific Token Management

**File**: `backend/src/mcp-servers/{service}/services/credential-cache.js`

- **Function**: `getCachedToken()`
  - Retrieves token from service-specific memory cache
  - Returns cached token or null if not found/expired
  - Handles cache hits and misses

- **Function**: `checkTokenExpiry()`
  - Validates token expiration time
  - Determines if refresh is needed
  - Handles expiry buffer for proactive refresh

- **Function**: `refreshTokenIfNeeded()`
  - Initiates token refresh process
  - Chooses refresh strategy (refresh token vs re-exchange)
  - Updates service-specific cache with new tokens

#### 2.3 OAuth Service Integration for Token Refresh

**File**: `backend/src/mcp-servers/{service}/utils/oauth-integration.js`

- **Function**: `refreshWithOAuthService()`
  - Calls OAuth service for token refresh
  - Handles both refresh token and credential re-exchange
  - Returns new tokens to service

- **Function**: `refreshWithRefreshToken()`
  - Uses refresh token via OAuth service
  - Handles OAuth 2.0 refresh token flow
  - Updates service cache with new tokens

- **Function**: `refreshWithCredentials()`
  - Falls back to credential re-exchange via OAuth service
  - Retrieves stored Client ID/Secret from database
  - Performs fresh OAuth token exchange

### Phase 3: API Execution

#### 3.1 Service API Calls

**File**: `backend/src/mcp-servers/{service}/api/{service}-api.js`

- **Function**: `executeApiCall()`
  - Uses validated access token for API requests
  - Handles OAuth-authenticated API communication
  - Processes API responses and errors

- **Function**: `handleTokenError()`
  - Manages token-related API errors
  - Triggers token refresh on authentication failures
  - Retries API calls with refreshed tokens

## Provider Support

### Google OAuth Implementation

**File**: `backend/src/oauth-service/providers/google.js`

- **Function**: `validateGoogleCredentials()`
  - Validates Google OAuth Client ID/Secret format
  - Checks Google-specific credential requirements

- **Function**: `generateGoogleAuthUrl()`
  - Creates Google OAuth authorization URL
  - Includes Google-specific scopes and parameters
  - Handles Google OAuth consent screen options

- **Function**: `exchangeGoogleCode()`
  - Exchanges authorization code with Google
  - Handles Google OAuth token endpoint
  - Processes Google token response format

- **Function**: `refreshGoogleToken()`
  - Refreshes Google OAuth access tokens
  - Uses Google refresh token endpoint
  - Handles Google-specific refresh flow

### Microsoft OAuth Implementation

**File**: `backend/src/oauth-service/providers/microsoft.js`

- **Function**: `validateMicrosoftCredentials()`
  - Validates Microsoft OAuth credentials
  - Checks Microsoft-specific format requirements

- **Function**: `generateMicrosoftAuthUrl()`
  - Creates Microsoft OAuth authorization URL
  - Includes Microsoft-specific scopes
  - Handles Microsoft consent screen options

### Base OAuth Functionality

**File**: `backend/src/oauth-service/providers/base-oauth.js`

- **Function**: `validateOAuthCredentials()`
  - Common OAuth credential validation
  - Shared validation logic across providers
  - Base credential format checking

- **Function**: `generateStateParameter()`
  - Creates secure state parameter for OAuth
  - Handles state validation for security
  - Manages state storage and retrieval

## Token Management

### Service-Specific Memory Cache Strategy

**File**: `backend/src/mcp-servers/{service}/services/credential-cache.js`

- **Function**: `initializeCache()`
  - Sets up service-specific memory-based token cache
  - Configures cache cleanup and expiry for this service
  - Initializes service-specific cache monitoring

- **Function**: `getCachedToken()`
  - Retrieves token from service-specific memory cache
  - Handles cache misses and hits
  - Returns token or null if not found

- **Function**: `setCachedToken()`
  - Stores token in service-specific memory cache
  - Sets expiration time for token
  - Handles instance-specific cache key generation

- **Function**: `clearExpiredTokens()`
  - Removes expired tokens from service cache
  - Runs periodic cleanup process for this service
  - Maintains service-specific cache performance

### OAuth Service Token Exchange (Stateless)

**File**: `backend/src/oauth-service/core/token-exchange.js`

- **Function**: `exchangeRefreshToken()`
  - Exchanges refresh token for new access token
  - Handles OAuth 2.0 refresh token flow
  - Returns new tokens without storing them

- **Function**: `exchangeCredentials()`
  - Exchanges Client ID/Secret for new tokens
  - Performs fresh OAuth authorization
  - Returns tokens without caching

### Token Refresh Strategies

#### Strategy 1: Refresh Token Usage

**File**: `backend/src/mcp-servers/{service}/utils/oauth-integration.js`

- **Function**: `refreshWithRefreshToken()`
  - Calls OAuth service to exchange refresh token
  - Receives new tokens from OAuth service
  - Updates service-specific cache with new tokens

#### Strategy 2: Credential Re-exchange

**File**: `backend/src/mcp-servers/{service}/utils/oauth-integration.js`

- **Function**: `refreshWithCredentials()`
  - Calls OAuth service to exchange stored credentials
  - Receives new tokens from OAuth service
  - Updates service-specific cache with new tokens

### Database Integration

**File**: `backend/src/mcp-servers/{service}/services/database.js`

- **Function**: `getInstanceCredentials()`
  - Retrieves stored OAuth credentials from database
  - Handles credential decryption (future enhancement)
  - Returns credentials for token refresh

- **Function**: `updateInstanceTokenMetadata()`
  - Updates token-related metadata in database
  - Tracks token usage and refresh history
  - Maintains audit trail for this service

## Database Schema

### Required Tables

#### mcp_table (Enhanced)
- `instance_id` - Primary key
- `client_id` - OAuth Client ID
- `client_secret` - OAuth Client Secret
- `auth_type` - Set to 'oauth'
- `oauth_provider` - Provider name (google, microsoft, etc.)
- `oauth_scopes` - Required scopes for the service
- `created_at` - Instance creation timestamp
- `updated_at` - Last update timestamp

#### oauth_sessions (New)
- `session_id` - Primary key
- `instance_id` - Foreign key to mcp_table
- `state_parameter` - OAuth state for security
- `redirect_uri` - OAuth callback URL
- `expires_at` - Session expiry time
- `status` - Session status (pending, completed, failed)

### Database Functions

**File**: `backend/src/oauth-service/core/oauth-manager.js`

- **Function**: `storeOAuthSession()`
  - Saves OAuth session data to database
  - Handles session state management
  - Maintains session security

- **Function**: `validateOAuthSession()`
  - Validates OAuth session during callback
  - Checks session expiry and status
  - Ensures session security

## Error Handling

### Common Error Scenarios

#### Invalid Credentials
- **Function**: `handleInvalidCredentials()`
  - Returns user-friendly error messages
  - Provides guidance for credential correction
  - Maintains security without exposing details

#### OAuth Consent Denied
- **Function**: `handleConsentDenied()`
  - Handles user consent rejection
  - Provides clear error messaging
  - Offers retry options

#### Token Refresh Failures
- **Function**: `handleRefreshFailure()`
  - Manages refresh token failures
  - Falls back to credential re-exchange
  - Notifies user of re-authorization needs

#### API Rate Limiting
- **Function**: `handleRateLimit()`
  - Manages OAuth provider rate limits
  - Implements retry logic with backoff
  - Handles quota exceeded scenarios

### Error Response Format

All error responses follow standardized format:
```json
{
  "error": {
    "code": "OAUTH_ERROR_CODE",
    "message": "User-friendly error message",
    "details": "Technical details for debugging",
    "retry": true/false
  }
}
```

## Security Considerations

### Current Implementation

1. **State Parameter Validation**: Prevents CSRF attacks during OAuth flow
2. **Secure Token Storage**: Memory-based token caching (no disk persistence)
3. **Credential Validation**: Format validation before OAuth initiation
4. **Session Management**: Temporary session storage for OAuth flows

### Future Enhancements

1. **Token Encryption**: Encrypt tokens in memory cache
2. **Credential Encryption**: Encrypt stored Client ID/Secret in database
3. **Audit Logging**: Track OAuth usage and access patterns
4. **Rate Limiting**: Implement OAuth request rate limiting
5. **Token Rotation**: Automatic token rotation for enhanced security

## Integration Guide for New MCP Services

### For OAuth Services (Client ID + Client Secret)

#### Step 1: Configure OAuth Requirements

Create service configuration in `mcp-ports/{service}/config.json`:
```json
{
  "auth": {
    "type": "oauth2",
    "provider": "google",
    "scopes": ["service.specific.scope"],
    "fields": [
      {"name": "client_id", "type": "text", "required": true},
      {"name": "client_secret", "type": "password", "required": true}
    ]
  }
}
```

### For API Key Services (API Key Authentication)

#### Step 1: Configure API Key Requirements

Create service configuration in `mcp-ports/{service}/config.json`:
```json
{
  "auth": {
    "type": "apikey",
    "fields": [
      {"name": "api_key", "type": "password", "required": true}
    ]
  }
}
```

**Note**: API Key services use the existing Figma-style flow without OAuth consent.

### Step 2: Implement Service-Specific Components

**File**: `backend/src/mcp-servers/{service}/middleware/credential-auth.js`

- **Function**: `createCredentialAuthMiddleware()`
  - Integrate with centralized OAuth service for token refresh
  - Handle service-specific token caching and validation
  - Manage API request authentication

**File**: `backend/src/mcp-servers/{service}/services/credential-cache.js`

- **Function**: `getCachedCredential()` - Retrieve tokens from service cache
- **Function**: `setCachedCredential()` - Store tokens in service cache
- **Function**: `clearExpiredTokens()` - Cleanup expired tokens

**File**: `backend/src/mcp-servers/{service}/utils/oauth-integration.js`

- **Function**: `refreshWithOAuthService()` - Integrate with OAuth service
- **Function**: `exchangeTokens()` - Exchange credentials/refresh tokens

### Step 3: Add Provider Implementation (if new)

**File**: `backend/src/oauth-service/providers/{provider}.js`

- **Function**: `validate{Provider}Credentials()`
- **Function**: `generate{Provider}AuthUrl()`
- **Function**: `exchange{Provider}Code()`
- **Function**: `refresh{Provider}Token()`

### Step 4: Update OAuth Service Router

**File**: `backend/src/oauth-service/index.js`

- Add provider-specific routes
- Register new provider in provider factory
- Update callback handler for new provider
- Ensure stateless operation (no token caching)

## Performance Considerations

### Service-Specific Cache Optimization

- **Token Expiry Management**: Proactive token refresh before expiry (per service)
- **Cache Cleanup**: Regular cleanup of expired tokens (service-specific)
- **Memory Usage**: Monitor cache memory usage and limits (per service)
- **Cache Isolation**: Each service maintains independent cache performance

### Database Query Optimization

- **Index Strategy**: Proper indexing on instance_id and oauth_provider
- **Query Batching**: Batch credential lookups where possible
- **Connection Pooling**: Efficient database connection management

## Monitoring and Logging

### Key Metrics to Track

- OAuth success/failure rates
- Token refresh frequency
- Cache hit/miss ratios
- API authentication errors
- Provider-specific error rates

### Logging Strategy

- **OAuth Flow Events**: Log all OAuth flow steps
- **Token Operations**: Log token refresh and expiry events
- **Error Tracking**: Comprehensive error logging with context
- **Performance Metrics**: Track OAuth operation timings

## Conclusion

This centralized OAuth system provides a robust, scalable foundation for OAuth authentication across MCP services that require Client ID + Client Secret authentication. The architecture separates concerns properly, maintains service independence, and provides excellent user experience while being extensible for future OAuth providers and enhancements.

### Key Success Factors for OAuth Services:
- **Timing**: OAuth consent during instance creation when user can interact
- **Service Independence**: Each service maintains its own token cache and management
- **Stateless OAuth Service**: OAuth service handles flows without storing tokens
- **Flexibility**: Support for multiple refresh strategies per service
- **Scalability**: Easy addition of new OAuth providers
- **Security**: Proper OAuth 2.0 implementation with state validation
- **Atomic Operations**: Clean success/failure handling with instance cleanup

### Service Type Distinction:
- **OAuth Services** (Gmail, Google Drive, Slack): Use this centralized OAuth flow
- **API Key Services** (Figma, Linear, Notion): Continue using existing simpler flow

This architecture maintains the established pattern where each MCP service is independent and manages its own resources while sharing common OAuth flow logic through the centralized OAuth service for services that require OAuth 2.0 authentication.