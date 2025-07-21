# MCP Handler Session Management

## Overview

The handler session management system maintains persistent JSON-RPC handler instances for each MCP instance, ensuring proper state management across requests as required by the MCP protocol.


## Problem Solved

### Before Handler Sessions
- Each request created a new JSON-RPC handler instance
- Initialization state was lost between requests
- Claude Code and other MCP clients failed with "Server not initialized" errors
- Violated MCP protocol specification requiring stateful sessions

### After Handler Sessions
- Handler instances persist per instanceId
- Initialization state maintained across requests
- Full MCP protocol compliance
- Compatible with Claude Code and other MCP clients


## Architecture

### Components

1. **Handler Sessions Map**
   - Global `Map` storing handler instances by instanceId
   - Each entry contains:
     - `handler`: The JSON-RPC handler instance
     - `lastAccessed`: Timestamp for session management
     - `instanceId`: The instance identifier
     - `createdAt`: Session creation timestamp

2. **Session Lifecycle**
   - Sessions created on first request
   - Reused for subsequent requests from same instance
   - Automatically cleaned up after 30 minutes of inactivity
   - Cleared on server shutdown

3. **Integration Points**
   - Works alongside existing credential cache
   - Integrates with authentication middleware
   - Supports debug endpoints for monitoring


## Implementation Details

### File Structure
```
backend/src/mcp-servers/{service}/
├── services/
│   ├── credential-cache.js      # Existing API key cache
│   ├── handler-sessions.js      # New session management
│   └── ...
├── endpoints/
│   └── jsonrpc-handler.js       # Stateful handler class
└── index.js                     # Updated to use sessions
```

### Key Functions

#### `getOrCreateHandler(instanceId, serviceConfig, apiKey)`
- Retrieves existing handler or creates new one
- Updates last accessed timestamp
- Returns persistent handler instance

#### `removeHandlerSession(instanceId)`
- Removes specific session
- Used when credentials are invalidated
- Returns boolean indicating if removed

#### `getSessionStatistics()`
- Provides session metrics
- Shows initialization status
- Useful for debugging

#### `startSessionCleanup()` / `stopSessionCleanup()`
- Manages background cleanup process
- Removes expired sessions every 5 minutes
- Ensures graceful shutdown


## Usage Example

### In MCP Endpoint
```javascript
app.post('/:instanceId/mcp', credentialAuthMiddleware, async (req, res) => {
  try {
    // Get or create persistent handler for this instance
    const jsonRpcHandler = getOrCreateHandler(
      req.instanceId,
      SERVICE_CONFIG,
      req.figmaApiKey || ''
    );
    
    // Process message with persistent handler
    const response = await jsonRpcHandler.processMessage(req.body);
    
    if (response) {
      res.json(response);
    } else {
      res.status(204).send();
    }
  } catch (error) {
    // Error handling...
  }
});
```


## Request Flow

1. **First Request (Initialize)**
   ```
   Client → POST /figma/{instanceId}/mcp
   Body: {"method": "initialize", ...}
   
   Server:
   - credentialAuthMiddleware validates instance
   - getOrCreateHandler creates new handler
   - Handler processes initialize, sets initialized=true
   - Returns success response
   ```

2. **Subsequent Requests**
   ```
   Client → POST /figma/{instanceId}/mcp
   Body: {"method": "tools/list", ...}
   
   Server:
   - credentialAuthMiddleware validates instance
   - getOrCreateHandler returns EXISTING handler
   - Handler has initialized=true, processes request
   - Returns tools list
   ```


## Configuration

### Timeouts
- `SESSION_TIMEOUT`: 30 minutes (configurable)
- `CLEANUP_INTERVAL`: 5 minutes (configurable)

### Memory Management
- Sessions automatically expire after inactivity
- Cleanup process prevents memory leaks
- Graceful shutdown clears all sessions


## Monitoring

### Debug Endpoint
```
GET /debug/cache-status

Response includes:
{
  "session_statistics": {
    "total_sessions": 2,
    "sessions": [{
      "instanceId": "...",
      "created_at": "2025-01-14T10:00:00Z",
      "last_accessed": "2025-01-14T10:05:00Z",
      "age_minutes": 5,
      "idle_minutes": 0,
      "is_initialized": true
    }]
  }
}
```


## Benefits

1. **Protocol Compliance**
   - Fully compliant with MCP specification
   - Maintains required session state
   - Supports all MCP methods

2. **Performance**
   - Reuses handler instances
   - Reduces initialization overhead
   - Works with credential caching

3. **Reliability**
   - Automatic cleanup prevents memory leaks
   - Graceful shutdown handling
   - Session invalidation on credential changes

4. **Compatibility**
   - Works with Claude Code
   - Compatible with all MCP clients
   - Maintains backward compatibility


## Migration Guide

### For New MCP Services
1. Copy `handler-sessions.js` to service's `services/` directory
2. Import session management functions in `index.js`
3. Replace handler creation with `getOrCreateHandler()`
4. Add cleanup calls to shutdown handlers

### For Existing Services
1. Follow same steps as new services
2. Test thoroughly with MCP clients
3. Monitor session statistics
4. Adjust timeouts if needed


## Troubleshooting

### Common Issues

1. **"Server not initialized" errors**
   - Check if handler sessions are enabled
   - Verify instance ID is being passed correctly
   - Check session statistics for initialization status

2. **Memory usage increasing**
   - Verify cleanup service is running
   - Check session timeout settings
   - Monitor total active sessions

3. **Sessions not persisting**
   - Ensure same instance ID used across requests
   - Check credential middleware is working
   - Verify handler creation logic


## Future Enhancements

1. **Redis Support**
   - Store sessions in Redis for multi-server deployments
   - Share sessions across server instances

2. **Session Persistence**
   - Optionally persist sessions to database
   - Restore sessions after server restart

3. **Advanced Metrics**
   - Track method call counts per session
   - Monitor session performance
   - Alert on unusual patterns