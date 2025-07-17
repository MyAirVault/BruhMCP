# Slack MCP Server

Complete Slack MCP server implementation following the Gmail MCP patterns.

## Features

### 🔐 Authentication
- OAuth 2.0 Bearer token authentication
- Multi-tenant architecture with credential caching
- Automatic token refresh with fallback mechanisms
- Circuit breaker pattern for OAuth service reliability

### 📊 Tools (19 total)
1. **send_message** - Send a message to a channel or user
2. **get_messages** - Get messages from a channel
3. **get_thread_messages** - Get messages from a thread
4. **delete_message** - Delete a message
5. **update_message** - Update a message
6. **list_channels** - List workspace channels
7. **get_channel_info** - Get channel information
8. **join_channel** - Join a channel
9. **leave_channel** - Leave a channel
10. **get_user_info** - Get user information
11. **list_users** - List workspace users
12. **add_reaction** - Add reaction to a message
13. **remove_reaction** - Remove reaction from a message
14. **get_reactions** - Get reactions for a message
15. **upload_file** - Upload a file to Slack
16. **get_file_info** - Get file information
17. **create_reminder** - Create a reminder
18. **get_team_info** - Get workspace information
19. **test_auth** - Test authentication

### 💾 Caching & Performance
- In-memory credential caching with TTL
- Background cache synchronization
- Token usage metrics and monitoring
- Performance insights and health checks

### 🔧 Service Configuration
- **Port**: 49458
- **Auth Type**: OAuth
- **Scopes**: `channels:history`, `chat:write`, `team:read`, `channels:read`, `users:read`, `reminders:write`, `reactions:read`, `files:read`, `files:write`

## API Endpoints

### Core Endpoints
- `POST /:instanceId/mcp` - MCP JSON-RPC endpoint
- `POST /:instanceId/call` - Legacy tool call endpoint
- `GET /:instanceId/health` - Instance health check
- `GET /:instanceId/stats` - Instance statistics

### Monitoring Endpoints
- `GET /health` - Global health status
- `GET /metrics` - Token refresh metrics

## Database Registration

The service is automatically registered in the database with:
```sql
INSERT INTO mcp_table (
    mcp_service_name, display_name, description, icon_url_path, port, type
) VALUES (
    'slack', 'Slack', 'Slack workspace communication...', 
    '/mcp-logos/slack.svg', 49458, 'oauth'
);
```

## Architecture

### Directory Structure
```
src/mcp-servers/slack/
├── api/
│   ├── slack-api.js           # Core Slack API operations
├── db/
│   └── service.sql            # Database service registration
├── endpoints/
│   ├── mcp-handler.js         # MCP JSON-RPC handler
│   └── health.js              # Health check endpoint
├── middleware/
│   └── credential-auth.js     # OAuth authentication middleware
├── services/
│   ├── credential-cache.js    # Token caching service
│   └── database.js            # Database operations
├── utils/
│   ├── oauth-integration.js   # OAuth service integration
│   ├── oauth-validation.js    # Token validation
│   ├── oauth-error-handler.js # Error handling
│   ├── slack-formatting.js    # Response formatting
│   └── token-metrics.js       # Performance metrics
└── index.js                   # Main server file
```

### Key Components

#### SlackMCPHandler
- Manages MCP sessions and tool execution
- Uses official MCP SDK with StreamableHTTP transport
- Handles 19 Slack-specific tools with Zod validation

#### Authentication Flow
1. OAuth Bearer token validation
2. Credential cache lookup (fast path)
3. Database credential lookup (cache miss)
4. Automatic token refresh if expired
5. Fallback to direct OAuth if service unavailable

#### Error Handling
- Slack-specific error codes and messages
- Retry logic with exponential backoff
- User-friendly error messages
- Comprehensive logging and metrics

## Usage

### Starting the Server
```bash
cd backend
npm run dev
# Server runs on port 49458
```

### Testing Tools
```bash
# Test authentication
curl -X POST http://localhost:49458/{instanceId}/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"test_auth","arguments":{}}}'

# Send a message
curl -X POST http://localhost:49458/{instanceId}/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"send_message","arguments":{"channel":"C1234567890","text":"Hello from MCP!"}}}'
```

## Monitoring

### Health Checks
- Global health: `GET /health`
- Instance health: `GET /{instanceId}/health`
- Metrics: `GET /metrics`

### Performance Metrics
- Token refresh success rate
- Average response time
- Cache hit rate
- Active instances count

## Security

### OAuth Scopes
The service requests minimal required scopes:
- `channels:history` - Read channel messages
- `chat:write` - Send messages
- `team:read` - Read team information
- `channels:read` - Read channel information
- `users:read` - Read user information
- `reminders:write` - Create reminders
- `reactions:read` - Read message reactions
- `files:read` - Read file information
- `files:write` - Upload files

### Token Security
- Tokens stored in memory cache with TTL
- Automatic refresh with secure fallback
- Comprehensive audit logging
- Circuit breaker for service resilience

## Integration

This Slack MCP server integrates seamlessly with the existing MCP ecosystem:
- Follows the same patterns as Gmail MCP
- Uses shared OAuth service infrastructure
- Integrates with database and logging systems
- Supports the same monitoring and management tools