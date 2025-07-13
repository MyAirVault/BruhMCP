# Phase 2: Token Management and Caching System

## Overview

Phase 2 implements an intelligent token management and caching system that sits between user requests and the actual MCP service fulfillment. This system maintains active bearer tokens in memory, automatically refreshes expired tokens, and provides seamless authentication without database hits on every request.

## Architecture Components

### 1. Global Token Cache System

Each MCP service (Figma, GitHub, Slack, etc.) maintains its own **Global Map Variable** that stores active tokens and their metadata:

```
Global Token Map Structure:
{
  "instance_id_1": {
    "bearer_token": "Bearer abc123...",
    "expires_at": "2025-07-13T15:30:00Z",
    "user_id": "user-uuid-123",
    "last_used": "2025-07-13T14:45:00Z",
    "refresh_attempts": 0
  },
  "instance_id_2": { ... }
}
```

### 2. Request Flow Components

#### **Init Handler Function**

-   **Purpose**: Primary entry point for all incoming requests
-   **Location**: Each service's main request handler
-   **Responsibilities**:
    -   Extract instance_id from request URL
    -   Check Global Token Map for existing valid token
    -   Route to appropriate handler based on token status

#### **Token Validator Function**

-   **Purpose**: Validate token existence and expiration status
-   **Responsibilities**:
    -   Check if instance_id exists in Global Map
    -   Verify token hasn't expired (with 30-second tolerance)
    -   Return token validation status

#### **Database Lookup Function**

-   **Purpose**: Retrieve instance credentials from database
-   **Responsibilities**:
    -   Query mcp_service_table for instance details
    -   Validate instance status (active/inactive/expired)
    -   Return user credentials and instance metadata

#### **Token Exchange Function**

-   **Purpose**: Convert API credentials to bearer tokens
-   **Responsibilities**:
    -   Make API call to external service (Figma, GitHub, etc.)
    -   Exchange API key/OAuth credentials for bearer token
    -   Parse token expiration time from response
    -   Handle exchange failures and rate limiting

#### **Cache Update Function**

-   **Purpose**: Update Global Token Map with new token data
-   **Responsibilities**:
    -   Add new tokens to Global Map
    -   Update existing token entries
    -   Remove expired or invalid tokens
    -   Maintain cache size limits

### 3. Background Token Watcher System

#### **Token Watcher Function**

-   **Purpose**: Background process that monitors token health
-   **Execution**: Runs every 30 seconds as recursive function
-   **Responsibilities**:
    -   Scan all tokens in Global Token Map
    -   Identify tokens expiring within 30 seconds
    -   Trigger proactive token refresh
    -   Clean up expired tokens for dead instances

#### **Proactive Refresh Function**

-   **Purpose**: Refresh tokens before they expire
-   **Responsibilities**:
    -   Retrieve fresh API credentials from database
    -   Exchange credentials for new bearer token
    -   Update Global Token Map with new token
    -   Log refresh attempts and failures

#### **Cleanup Function**

-   **Purpose**: Remove stale entries from Global Token Map
-   **Responsibilities**:
    -   Remove tokens for expired instances
    -   Remove tokens that failed multiple refresh attempts
    -   Remove tokens unused for extended periods
    -   Maintain optimal cache performance

## Detailed Request Flow

### **Step 1: Request Arrival**

1. User or LLM makes request to: `https://domain.com/figma/550e8400-e29b-41d4-a716-446655440000/files/abc123`
2. Nginx routes to Figma service on port 49160
3. **Init Handler** receives request and extracts `instance_id`

### **Step 2: Token Cache Check**

1. **Token Validator** checks if `instance_id` exists in Global Token Map
2. If exists and valid (not expired within 30-second tolerance):
    - Use cached bearer token
    - Update `last_used` timestamp
    - **Proceed to Step 6** (fulfill request)
3. If not exists or expired:
    - **Proceed to Step 3** (database lookup)

### **Step 3: Database Validation**

1. **Database Lookup Function** queries mcp_service_table for instance
2. If instance not found:
    - Return **404 Not Found** error
    - Log invalid instance access attempt
3. If instance found but status is 'inactive' or 'expired':
    - Return **403 Forbidden** error
    - Log access attempt to disabled instance
4. If instance found and active:
    - **Proceed to Step 4** (token exchange)

### **Step 4: Token Exchange**

1. **Token Exchange Function** retrieves user credentials from database result
2. Make API call to external service authentication endpoint
3. Exchange API key/OAuth credentials for bearer token
4. Parse token expiration time and metadata
5. If exchange successful:
    - **Proceed to Step 5** (cache update)
6. If exchange failed:
    - Return **401 Unauthorized** error
    - Log authentication failure

### **Step 5: Cache Update**

1. **Cache Update Function** adds new token to Global Token Map
2. Store bearer token, expiration time, user metadata
3. Set initial refresh attempt counter to 0
4. **Proceed to Step 6** (fulfill request)

### **Step 6: Request Fulfillment**

1. Use bearer token to make authenticated request to external service
2. **Update Usage Tracking** in database (increment count, update last_used_at)
3. Return service response to user
4. Log successful request completion

## Background Token Management

### **Token Watcher Cycle (Every 30 Seconds)**

#### **Expiration Check Process**

1. **Token Watcher** scans all entries in Global Token Map
2. For each token, calculate time until expiration
3. If token expires within next 30 seconds:
    - **Trigger Proactive Refresh**
4. If token already expired:
    - Check if instance still active in database
    - If instance active: **Trigger Emergency Refresh**
    - If instance expired/inactive: **Remove from cache**

#### **Proactive Refresh Process**

1. **Proactive Refresh Function** retrieves current API credentials from database
2. Verify instance still active and not expired
3. If instance valid:
    - Exchange credentials for new bearer token
    - Update Global Token Map with new token
    - Reset refresh attempt counter
4. If instance invalid or exchange failed:
    - Increment refresh attempt counter
    - If attempts > 3: Remove from cache
    - Log refresh failure

#### **Cache Maintenance**

1. **Cleanup Function** removes stale entries:
    - Tokens unused for > 24 hours
    - Tokens for deleted instances
    - Tokens with > 3 failed refresh attempts
2. Monitor cache size and performance
3. Log cache statistics for monitoring

## Error Handling and Edge Cases

### **Database Connection Failures**

-   **Fallback**: Continue using cached tokens if available
-   **Recovery**: Retry database connection with exponential backoff
-   **Monitoring**: Alert on prolonged database unavailability

### **External Service API Failures**

-   **Rate Limiting**: Implement exponential backoff for token exchanges
-   **Service Downtime**: Cache last known good tokens longer
-   **Invalid Credentials**: Remove from cache and return authentication error

### **Token Exchange Failures**

-   **Retry Logic**: Attempt token refresh up to 3 times
-   **Escalation**: Log failures for manual investigation
-   **User Notification**: Return clear error messages about credential issues

### **Memory Management**

-   **Cache Size Limits**: Maximum 10,000 active tokens per service
-   **Memory Monitoring**: Alert if cache memory usage exceeds thresholds
-   **Cleanup Strategy**: LRU (Least Recently Used) eviction policy

## Performance Benefits

### **Request Latency Reduction**

-   **First Request**: Database lookup + token exchange (~500-1000ms)
-   **Subsequent Requests**: Memory lookup only (~1-5ms)
-   **99% of requests**: Served from cache without database hits

### **Database Load Reduction**

-   **Traditional Approach**: Database query on every request
-   **Phase 2 Approach**: Database query only on cache misses
-   **Expected Reduction**: 95-99% fewer database queries

### **External API Rate Limit Optimization**

-   **Token Reuse**: Single token serves multiple requests
-   **Proactive Refresh**: Prevents request failures due to expired tokens
-   **Rate Limit Compliance**: Controlled token exchange frequency

## Security Considerations

### **Memory Security**

-   **Token Encryption**: Consider encrypting tokens in memory
-   **Memory Cleanup**: Securely clear tokens from memory on removal
-   **Access Control**: Restrict memory access to authorized processes

### **Token Lifecycle Management**

-   **Expiration Enforcement**: Strict adherence to token expiration times
-   **Refresh Security**: Secure credential retrieval for token refresh
-   **Audit Trail**: Log all token operations for security monitoring

### **Instance Validation**

-   **Continuous Validation**: Regular checks against database for instance status
-   **Revocation Support**: Immediate cache invalidation for revoked instances
-   **Suspicious Activity**: Detection and logging of unusual access patterns

## Success Metrics

### **Performance Metrics**

-   **Cache Hit Rate**: Target >95% of requests served from cache
-   **Request Latency**: <10ms for cached requests
-   **Token Refresh Success Rate**: >99% successful proactive refreshes

### **Reliability Metrics**

-   **Service Uptime**: 99.9% availability during token operations
-   **Database Load Reduction**: 95% fewer database queries
-   **External API Efficiency**: 90% reduction in authentication API calls

### **Security Metrics**

-   **Failed Authentication Rate**: <0.1% invalid token usage
-   **Credential Security**: Zero credential exposure incidents
-   **Audit Compliance**: 100% of token operations logged and traceable

## Future Enhancements

### **Phase 3 Possibilities**

-   **Distributed Token Cache**: Redis-based cache for multi-server deployments
-   **Advanced Security**: Hardware security module integration
-   **ML-Based Optimization**: Predictive token refresh based on usage patterns
-   **Real-time Monitoring**: Advanced dashboards and alerting systems
