# Slack MCP Service Documentation

## User Flow: Frontend Selection to LLM Integration

### Complete System Flow: User Selects Slack Service

#### 1. Frontend Service Selection
**User Action**: Dashboard → "Create New MCP" → Select "Slack"  
**Flow**:
1. **Dashboard Page** → User clicks "Create New MCP" button
   - **File**: `/frontend/src/pages/Dashboard.tsx`
   - **Function**: Opens CreateMCPModal component
   - **Action**: Displays service selection modal

2. **Service Selection** → TypeDropdown loads available services
   - **File**: `/frontend/src/components/ui/form/TypeDropdown.tsx`
   - **API Call**: `GET /api/v1/mcp-types`
   - **Action**: Fetches available services from database

3. **Dynamic Form Generation** → Form adapts for Slack (OAuth type)
   - **File**: `/frontend/src/components/ui/form/CredentialFields.tsx`
   - **Function**: Renders OAuth credential fields
   - **Action**: Shows custom name, Client ID, Client Secret, and expiration fields

4. **Real-time Validation** → Credentials validated as user types
   - **File**: `/frontend/src/hooks/useCreateMCPForm.ts`
   - **API Call**: `POST /api/v1/mcps/validate-credentials`
   - **Action**: Validates Slack OAuth credentials against Slack API

#### 2. Backend Instance Creation
**User Action**: User clicks "Create Instance" button  
**Flow**:
1. **Request Validation** → Zod schema validation
   - **File**: `/backend/src/controllers/mcpInstances/crud/createMCP.js`
   - **Function**: `createMCP` controller
   - **Action**: Validates request body and OAuth credentials

2. **Service Definition Lookup** → Queries service configuration
   - **Database**: `mcp_table` query for Slack service
   - **Action**: Retrieves service configuration and port number

3. **Database Storage** → Creates instance records
   - **Tables**: `mcp_service_table` and `mcp_credentials`
   - **Action**: Stores instance with encrypted Client ID/Secret, sets `oauth_status: 'pending'`

4. **URL Generation** → Creates instance-specific URL
   - **Format**: `{PUBLIC_DOMAIN}/slack/{instance_id}`
   - **Action**: Returns URL and OAuth authorization URL to frontend

#### 3. OAuth Authentication Flow
**User Action**: User completes OAuth in popup window  
**Flow**:
1. **Authorization Request** → User redirected to Slack OAuth
   - **URL**: `https://slack.com/oauth/v2/authorize`
   - **Scopes**: `chat:write`, `channels:read`, `users:read`, `files:write`, `reactions:write`
   - **Action**: User grants permissions to application

2. **OAuth Callback** → Slack redirects to callback URL
   - **Endpoint**: `GET /auth/slack/callback`
   - **File**: `/backend/src/controllers/oauth/slack.js`
   - **Action**: Exchanges authorization code for access token

3. **Token Storage** → Stores OAuth tokens in database
   - **Table**: `mcp_credentials`
   - **Action**: Stores encrypted access_token, refresh_token, updates `oauth_status: 'completed'`

4. **Instance Activation** → Instance becomes active
   - **Action**: Instance status changed to "active" and ready for LLM integration

#### 4. LLM Integration Setup
**User Action**: User adds generated URL to LLM configuration  
**Flow**:
1. **LLM Connection** → LLM connects to instance URL
   - **Endpoint**: `POST /slack/{instance_id}/mcp`
   - **Protocol**: JSON-RPC 2.0 over HTTP using MCP SDK
   - **Action**: Establishes MCP session with Slack service

2. **Authentication Middleware** → Validates instance and credentials
   - **File**: `/backend/src/mcp-servers/slack/middleware/credential-auth.js`
   - **Function**: `credentialAuthMiddleware`
   - **Action**: Looks up instance, validates OAuth tokens, handles token refresh

3. **Handler Creation** → Creates persistent MCP handler
   - **File**: `/backend/src/mcp-servers/slack/services/handler-sessions.js`
   - **Function**: `getOrCreateHandler`
   - **Action**: Creates SlackMCPHandler with authenticated API access

#### 5. Tool Execution Flow (e.g., Send Message)
**User Action**: LLM calls `send_message` tool  
**Flow**:
1. **MCP Request Processing**
   - **File**: `/backend/src/mcp-servers/slack/endpoints/mcp-handler.js:554`
   - **Class**: `SlackMCPHandler`
   - **Method**: `handleMCPRequest`
   - **Action**: Processes JSON-RPC via MCP SDK

2. **Tool Execution**
   - **File**: `/backend/src/mcp-servers/slack/endpoints/mcp-handler.js:66`
   - **Method**: `send_message` tool handler
   - **Action**: Validates input with Zod schema, executes business logic

3. **External API Call**
   - **File**: `/backend/src/mcp-servers/slack/api/slack-api.js`
   - **Function**: `sendMessage`
   - **Action**: Makes authenticated call to Slack API

4. **Response Processing**
   - **Processing**: Format response as JSON, handle errors
   - **Transport**: Send back via MCP transport to LLM

### Key System Components
- **Frontend**: `/frontend/src/pages/Dashboard.tsx` - Service selection UI
- **Backend API**: `/backend/src/controllers/mcpInstances/crud/createMCP.js` - Instance creation
- **OAuth Handler**: `/backend/src/controllers/oauth/slack.js` - OAuth flow management
- **Database**: `mcp_service_table`, `mcp_credentials` - Instance storage
- **MCP Server**: `/backend/src/mcp-servers/slack/index.js` - Multi-tenant routing
- **Authentication**: `/middleware/credential-auth.js` - Instance-based auth with OAuth
- **API Integration**: `/api/slack-api.js` - Slack Web API integration

### Database Schema
```sql
-- Service instances
mcp_service_table (
  instance_id UUID PRIMARY KEY,
  user_id UUID,
  mcp_service_id UUID,
  custom_name TEXT,
  status TEXT,
  oauth_status TEXT, -- 'pending', 'completed', 'failed'
  expires_at TIMESTAMP
)

-- OAuth credentials
mcp_credentials (
  instance_id UUID,
  client_id TEXT,
  client_secret TEXT (encrypted),
  access_token TEXT (encrypted),
  refresh_token TEXT (encrypted),
  token_expires_at TIMESTAMP
)
```

### Generated URLs
- **Health Check**: `{PUBLIC_DOMAIN}/slack/{instance_id}/health`
- **MCP Endpoint**: `{PUBLIC_DOMAIN}/slack/{instance_id}/mcp`
- **Direct MCP**: `{PUBLIC_DOMAIN}/slack/{instance_id}` (Claude Code compatibility)
- **OAuth Authorization**: `https://slack.com/oauth/v2/authorize?client_id={client_id}&redirect_uri={callback_url}&response_type=code&scope=chat:write,channels:read,users:read,files:write,reactions:write`

---

## Overview

The Slack MCP (Model Context Protocol) service provides comprehensive workspace communication capabilities through Slack's Web API. This service enables users to send messages, manage channels, interact with users, handle files, and perform various workspace operations through a standardized MCP interface with advanced features including thread management, reactions, and reminders.

## Service Configuration

- **Service Name**: `slack`
- **Port**: 49298
- **Authentication**: OAuth 2.0
- **Required Scopes**: 
  - `chat:write` - Send messages to channels and users
  - `channels:read` - View basic information about public channels
  - `users:read` - View people in a workspace
  - `files:write` - Upload, edit, and delete files
  - `reactions:write` - Add and remove emoji reactions

## Available Tools

The Slack MCP service provides 19 comprehensive tools for workspace communication, channel management, and user interaction.

### Messaging Tools

#### 1. `send_message`
Send a message to a Slack channel or user.

**Parameters:**
- `channel` (string, required): Channel ID or user ID to send message to
- `text` (string, required): Message text content
- `thread_ts` (string, optional): Timestamp of parent message to reply in thread
- `reply_broadcast` (boolean, optional): Whether to broadcast thread reply to channel (default: false)

**Example:**
```json
{
  "name": "send_message",
  "arguments": {
    "channel": "C1234567890",
    "text": "Hello team! How is everyone doing today?",
    "thread_ts": "1234567890.123456",
    "reply_broadcast": false
  }
}
```

#### 2. `get_messages`
Get messages from a Slack channel.

**Parameters:**
- `channel` (string, required): Channel ID to get messages from
- `count` (number, optional): Number of messages to return (1-1000, default: 100)
- `latest` (string, optional): Latest message timestamp to include
- `oldest` (string, optional): Oldest message timestamp to include
- `inclusive` (boolean, optional): Include messages with latest and oldest timestamps (default: false)

**Example:**
```json
{
  "name": "get_messages",
  "arguments": {
    "channel": "C1234567890",
    "count": 50,
    "latest": "1234567890.123456",
    "inclusive": true
  }
}
```

#### 3. `get_thread_messages`
Get messages from a Slack thread.

**Parameters:**
- `channel` (string, required): Channel ID where the thread is located
- `ts` (string, required): Timestamp of the parent message
- `limit` (number, optional): Maximum number of messages to return (1-1000, default: 200)
- `cursor` (string, optional): Cursor for pagination

**Example:**
```json
{
  "name": "get_thread_messages",
  "arguments": {
    "channel": "C1234567890",
    "ts": "1234567890.123456",
    "limit": 100
  }
}
```

#### 4. `delete_message`
Delete a Slack message.

**Parameters:**
- `channel` (string, required): Channel ID where the message is located
- `ts` (string, required): Timestamp of the message to delete

**Example:**
```json
{
  "name": "delete_message",
  "arguments": {
    "channel": "C1234567890",
    "ts": "1234567890.123456"
  }
}
```

#### 5. `update_message`
Update a Slack message.

**Parameters:**
- `channel` (string, required): Channel ID where the message is located
- `ts` (string, required): Timestamp of the message to update
- `text` (string, required): New message text content

**Example:**
```json
{
  "name": "update_message",
  "arguments": {
    "channel": "C1234567890",
    "ts": "1234567890.123456",
    "text": "Updated message content"
  }
}
```

### Channel Management Tools

#### 6. `list_channels`
List Slack channels.

**Parameters:**
- `types` (string, optional): Channel types to include (comma separated, default: "public_channel,private_channel")
- `limit` (number, optional): Maximum number of channels to return (1-1000, default: 100)
- `cursor` (string, optional): Cursor for pagination

**Example:**
```json
{
  "name": "list_channels",
  "arguments": {
    "types": "public_channel,private_channel",
    "limit": 50
  }
}
```

#### 7. `get_channel_info`
Get information about a Slack channel.

**Parameters:**
- `channel` (string, required): Channel ID to get information about

**Example:**
```json
{
  "name": "get_channel_info",
  "arguments": {
    "channel": "C1234567890"
  }
}
```

#### 8. `join_channel`
Join a Slack channel.

**Parameters:**
- `channel` (string, required): Channel ID or name to join

**Example:**
```json
{
  "name": "join_channel",
  "arguments": {
    "channel": "general"
  }
}
```

#### 9. `leave_channel`
Leave a Slack channel.

**Parameters:**
- `channel` (string, required): Channel ID to leave

**Example:**
```json
{
  "name": "leave_channel",
  "arguments": {
    "channel": "C1234567890"
  }
}
```

### User Management Tools

#### 10. `get_user_info`
Get information about a Slack user.

**Parameters:**
- `user` (string, required): User ID to get information about

**Example:**
```json
{
  "name": "get_user_info",
  "arguments": {
    "user": "U1234567890"
  }
}
```

#### 11. `list_users`
List Slack users in the workspace.

**Parameters:**
- `limit` (number, optional): Maximum number of users to return (1-1000, default: 100)
- `cursor` (string, optional): Cursor for pagination

**Example:**
```json
{
  "name": "list_users",
  "arguments": {
    "limit": 50
  }
}
```

### Reaction Tools

#### 12. `add_reaction`
Add a reaction to a Slack message.

**Parameters:**
- `channel` (string, required): Channel ID where the message is located
- `timestamp` (string, required): Timestamp of the message to react to
- `name` (string, required): Emoji name (without colons)

**Example:**
```json
{
  "name": "add_reaction",
  "arguments": {
    "channel": "C1234567890",
    "timestamp": "1234567890.123456",
    "name": "thumbsup"
  }
}
```

#### 13. `remove_reaction`
Remove a reaction from a Slack message.

**Parameters:**
- `channel` (string, required): Channel ID where the message is located
- `timestamp` (string, required): Timestamp of the message to remove reaction from
- `name` (string, required): Emoji name (without colons)

**Example:**
```json
{
  "name": "remove_reaction",
  "arguments": {
    "channel": "C1234567890",
    "timestamp": "1234567890.123456",
    "name": "thumbsup"
  }
}
```

#### 14. `get_reactions`
Get reactions for a Slack message.

**Parameters:**
- `channel` (string, required): Channel ID where the message is located
- `timestamp` (string, required): Timestamp of the message to get reactions for

**Example:**
```json
{
  "name": "get_reactions",
  "arguments": {
    "channel": "C1234567890",
    "timestamp": "1234567890.123456"
  }
}
```

### File Management Tools

#### 15. `upload_file`
Upload a file to Slack.

**Parameters:**
- `channels` (string, required): Channel ID to upload file to
- `content` (string, required): File content as a string
- `filename` (string, required): Name of the file
- `title` (string, optional): Title for the file
- `filetype` (string, optional): File type (e.g., 'text', 'javascript')
- `initial_comment` (string, optional): Initial comment to add with the file

**Example:**
```json
{
  "name": "upload_file",
  "arguments": {
    "channels": "C1234567890",
    "content": "console.log('Hello World');",
    "filename": "hello.js",
    "title": "Hello World Script",
    "filetype": "javascript",
    "initial_comment": "Here's the script we discussed"
  }
}
```

#### 16. `get_file_info`
Get information about a Slack file.

**Parameters:**
- `file` (string, required): File ID to get information about

**Example:**
```json
{
  "name": "get_file_info",
  "arguments": {
    "file": "F1234567890"
  }
}
```

### Utility Tools

#### 17. `create_reminder`
Create a reminder in Slack.

**Parameters:**
- `text` (string, required): Reminder text
- `time` (string, required): When to remind (e.g., 'in 20 minutes', 'tomorrow at 9am')
- `user` (string, optional): User ID to remind (defaults to current user)

**Example:**
```json
{
  "name": "create_reminder",
  "arguments": {
    "text": "Review the project proposal",
    "time": "in 2 hours",
    "user": "U1234567890"
  }
}
```

#### 18. `get_team_info`
Get information about the Slack workspace/team.

**Parameters:** None

**Example:**
```json
{
  "name": "get_team_info",
  "arguments": {}
}
```

#### 19. `test_auth`
Test Slack authentication and get user/team info.

**Parameters:** None

**Example:**
```json
{
  "name": "test_auth",
  "arguments": {}
}
```

## Authentication

The Slack MCP service uses OAuth 2.0 authentication with the following flow:

1. **OAuth Setup**: Configure Slack OAuth 2.0 credentials in Slack App settings
2. **Instance Creation**: Each user gets a unique instance ID
3. **OAuth Authorization**: User authorizes the application with required Slack scopes
4. **Token Management**: Access tokens are cached and automatically refreshed
5. **API Access**: All tools use the authenticated user's Slack credentials

### Required OAuth Scopes

- `chat:write` - Send messages to channels and users
- `channels:read` - View basic information about public channels
- `users:read` - View people in a workspace
- `files:write` - Upload, edit, and delete files
- `reactions:write` - Add and remove emoji reactions

### OAuth Configuration

To set up OAuth authentication:

1. Go to the [Slack API](https://api.slack.com/apps)
2. Create a new Slack app or select an existing one
3. Configure OAuth & Permissions
4. Add the required OAuth scopes
5. Set up redirect URLs
6. Configure the client ID and client secret in your MCP instance

## Error Handling

The service includes comprehensive error handling for:

- **OAuth Authentication Errors**: Invalid tokens, expired credentials, scope issues
- **Slack API Errors**: Rate limiting, channel not found, insufficient permissions
- **Network Errors**: Connection issues, timeouts, service unavailable
- **Validation Errors**: Invalid parameters, malformed requests
- **File Upload Errors**: File size limits, upload timeouts, unsupported formats

## Rate Limiting

The service implements automatic retry logic with exponential backoff for:
- Slack API rate limits (quota exceeded)
- Server errors (HTTP 5xx)
- Network connectivity issues

Slack API has the following rate limits:
- **Tier 1**: 1+ request per minute
- **Tier 2**: 20+ requests per minute
- **Tier 3**: 50+ requests per minute
- **Tier 4**: 100+ requests per minute

## Security Features

- **OAuth 2.0 Compliance**: Secure token-based authentication
- **Credential Caching**: Secure in-memory token storage with automatic refresh
- **Audit Logging**: Comprehensive logging of all OAuth and API operations
- **Multi-tenant Isolation**: Instance-based credential separation
- **Token Validation**: Real-time validation of access tokens
- **Secure Error Handling**: Sensitive data redaction in error messages

## Usage Examples

### Basic Messaging Operations
```json
// Send a message to a channel
{
  "name": "send_message",
  "arguments": {
    "channel": "C1234567890",
    "text": "Hello team! Ready for the standup?"
  }
}

// Get recent messages from a channel
{
  "name": "get_messages",
  "arguments": {
    "channel": "C1234567890",
    "count": 20
  }
}

// Reply to a message in a thread
{
  "name": "send_message",
  "arguments": {
    "channel": "C1234567890",
    "text": "I'll be there in 5 minutes",
    "thread_ts": "1234567890.123456"
  }
}
```

### Channel Management
```json
// List all channels
{
  "name": "list_channels",
  "arguments": {
    "types": "public_channel,private_channel",
    "limit": 100
  }
}

// Get channel information
{
  "name": "get_channel_info",
  "arguments": {
    "channel": "C1234567890"
  }
}

// Join a channel
{
  "name": "join_channel",
  "arguments": {
    "channel": "general"
  }
}
```

### File Operations
```json
// Upload a file
{
  "name": "upload_file",
  "arguments": {
    "channels": "C1234567890",
    "content": "# Project Notes\n\nMeeting notes from today's session.",
    "filename": "notes.md",
    "title": "Meeting Notes",
    "filetype": "text",
    "initial_comment": "Notes from our team meeting"
  }
}

// Get file information
{
  "name": "get_file_info",
  "arguments": {
    "file": "F1234567890"
  }
}
```

### Reactions and Engagement
```json
// Add a reaction to a message
{
  "name": "add_reaction",
  "arguments": {
    "channel": "C1234567890",
    "timestamp": "1234567890.123456",
    "name": "thumbsup"
  }
}

// Get reactions for a message
{
  "name": "get_reactions",
  "arguments": {
    "channel": "C1234567890",
    "timestamp": "1234567890.123456"
  }
}
```

## Implementation Status

✅ **Production Ready**: The Slack MCP service includes enterprise-grade features:

### Core Features
- ✅ **Complete Messaging**: Send, receive, update, and delete messages
- ✅ **Channel Management**: List, join, leave, and get channel information
- ✅ **User Operations**: List users and get user information
- ✅ **Thread Support**: Full conversation thread handling
- ✅ **File Management**: Upload files and get file information
- ✅ **Reaction Support**: Add, remove, and get message reactions
- ✅ **Reminder System**: Create reminders for users

### Enterprise Features
- ✅ **OAuth 2.0 Integration**: Secure authentication with automatic token refresh
- ✅ **Credential Caching**: High-performance in-memory token storage
- ✅ **Error Recovery**: Comprehensive error handling with retry logic
- ✅ **Rate Limiting**: Automatic handling of Slack API limits
- ✅ **Audit Logging**: Complete operation tracking and security logging
- ✅ **Multi-tenant Support**: Instance-based credential isolation

### Technical Architecture
- ✅ **Optimized API Client**: Efficient Slack Web API integration
- ✅ **Response Formatting**: Consistent, clean response formats across all tools
- ✅ **Validation System**: Comprehensive input validation with Zod schemas
- ✅ **Performance Monitoring**: Real-time metrics and performance tracking
- ✅ **Security Hardening**: Token validation, secure logging, and error handling

## Performance Considerations

- **Message Threading**: Efficient thread handling for conversation context
- **Batch Operations**: Optimized API calls for better performance
- **Caching Strategy**: Optimized token caching reduces API calls
- **Connection Pooling**: Reused connections for better performance
- **Response Optimization**: Streamlined response formats for faster processing

## Limitations and Considerations

- **Rate Limits**: Subject to Slack API rate limits based on workspace tier
- **OAuth Scopes**: Requires appropriate scopes for full functionality
- **Token Expiration**: Access tokens may expire and require refresh
- **File Size Limits**: File uploads are subject to Slack's file size limits
- **Workspace Permissions**: Operations limited by user's workspace permissions

This Slack MCP service provides a comprehensive, production-ready workspace communication solution with enterprise-grade security, performance, and reliability features.