# Slack MCP Tool Reference

## Overview

This document provides technical reference for all Slack MCP tools, including parameters, return values, and usage examples. The Slack MCP implementation follows the same patterns as the Gmail MCP for consistency.

## Authentication

All tools require OAuth authentication with appropriate Slack scopes:

```json
{
  "scopes": [
    "channels:read",
    "channels:write",
    "chat:write",
    "users:read",
    "files:read",
    "files:write:user",
    "reactions:read",
    "reactions:write",
    "team:read"
  ]
}
```

## Tool Categories

### 💬 Messaging Operations (5 tools)
- [`send_message`](#send_message) - Send messages to channels/users
- [`get_messages`](#get_messages) - Get messages from channels
- [`get_thread_messages`](#get_thread_messages) - Get messages from threads
- [`delete_message`](#delete_message) - Delete messages
- [`update_message`](#update_message) - Update/edit messages

### 🏢 Channel Management (4 tools)
- [`list_channels`](#list_channels) - List workspace channels
- [`get_channel_info`](#get_channel_info) - Get channel information
- [`join_channel`](#join_channel) - Join channels
- [`leave_channel`](#leave_channel) - Leave channels

### 👥 User Management (2 tools)
- [`get_user_info`](#get_user_info) - Get user information
- [`list_users`](#list_users) - List workspace users

### 😊 Reaction Management (3 tools)
- [`add_reaction`](#add_reaction) - Add emoji reactions
- [`remove_reaction`](#remove_reaction) - Remove emoji reactions
- [`get_reactions`](#get_reactions) - Get message reactions

### 📁 File Management (2 tools)
- [`upload_file`](#upload_file) - Upload files to channels
- [`get_file_info`](#get_file_info) - Get file information

### 🔧 Utility Tools (3 tools)
- [`create_reminder`](#create_reminder) - Create reminders
- [`get_team_info`](#get_team_info) - Get workspace information
- [`test_auth`](#test_auth) - Test authentication

---

## Tool Details

### `send_message`
**Description**: Send a message to a Slack channel or user with optional thread support.

**Parameters**:
- `channel` (string, required): Channel ID or user ID to send message to
- `text` (string, required): Message text content
- `thread_ts` (string, optional): Timestamp of parent message to reply in thread
- `reply_broadcast` (boolean, optional): Whether to broadcast thread reply to channel (default: false)

**Slack API**: `POST /api/chat.postMessage`

**Response**: Message send confirmation with timestamp and channel information

**Example**:
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

---

### `get_messages`
**Description**: Get messages from a Slack channel with optional filtering and pagination.

**Parameters**:
- `channel` (string, required): Channel ID to get messages from
- `count` (number, optional): Number of messages to return (1-1000, default: 100)
- `latest` (string, optional): Latest message timestamp to include
- `oldest` (string, optional): Oldest message timestamp to include
- `inclusive` (boolean, optional): Include messages with latest and oldest timestamps (default: false)

**Slack API**: `GET /api/conversations.history`

**Response**: Array of message objects with metadata

**Example**:
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

---

### `get_thread_messages`
**Description**: Get messages from a Slack thread with pagination support.

**Parameters**:
- `channel` (string, required): Channel ID where the thread is located
- `ts` (string, required): Timestamp of the parent message
- `limit` (number, optional): Maximum number of messages to return (1-1000, default: 200)
- `cursor` (string, optional): Cursor for pagination

**Slack API**: `GET /api/conversations.replies`

**Response**: Array of thread messages with conversation context

**Example**:
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

---

### `delete_message`
**Description**: Delete a Slack message (requires appropriate permissions).

**Parameters**:
- `channel` (string, required): Channel ID where the message is located
- `ts` (string, required): Timestamp of the message to delete

**Slack API**: `POST /api/chat.delete`

**Response**: Deletion confirmation

**Example**:
```json
{
  "name": "delete_message",
  "arguments": {
    "channel": "C1234567890",
    "ts": "1234567890.123456"
  }
}
```

---

### `update_message`
**Description**: Update/edit a Slack message (requires appropriate permissions).

**Parameters**:
- `channel` (string, required): Channel ID where the message is located
- `ts` (string, required): Timestamp of the message to update
- `text` (string, required): New message text content

**Slack API**: `POST /api/chat.update`

**Response**: Update confirmation with new message content

**Example**:
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

---

### `list_channels`
**Description**: List Slack channels with filtering and pagination support.

**Parameters**:
- `types` (string, optional): Channel types to include (comma separated, default: "public_channel,private_channel")
- `limit` (number, optional): Maximum number of channels to return (1-1000, default: 100)
- `cursor` (string, optional): Cursor for pagination

**Slack API**: `GET /api/conversations.list`

**Response**: Array of channel objects with metadata

**Example**:
```json
{
  "name": "list_channels",
  "arguments": {
    "types": "public_channel,private_channel",
    "limit": 50
  }
}
```

---

### `get_channel_info`
**Description**: Get detailed information about a Slack channel.

**Parameters**:
- `channel` (string, required): Channel ID to get information about

**Slack API**: `GET /api/conversations.info`

**Response**: Channel object with detailed information

**Example**:
```json
{
  "name": "get_channel_info",
  "arguments": {
    "channel": "C1234567890"
  }
}
```

---

### `join_channel`
**Description**: Join a Slack channel (requires appropriate permissions).

**Parameters**:
- `channel` (string, required): Channel ID or name to join

**Slack API**: `POST /api/conversations.join`

**Response**: Join confirmation with channel information

**Example**:
```json
{
  "name": "join_channel",
  "arguments": {
    "channel": "general"
  }
}
```

---

### `leave_channel`
**Description**: Leave a Slack channel.

**Parameters**:
- `channel` (string, required): Channel ID to leave

**Slack API**: `POST /api/conversations.leave`

**Response**: Leave confirmation

**Example**:
```json
{
  "name": "leave_channel",
  "arguments": {
    "channel": "C1234567890"
  }
}
```

---

### `get_user_info`
**Description**: Get information about a Slack user.

**Parameters**:
- `user` (string, required): User ID to get information about

**Slack API**: `GET /api/users.info`

**Response**: User object with profile information

**Example**:
```json
{
  "name": "get_user_info",
  "arguments": {
    "user": "U1234567890"
  }
}
```

---

### `list_users`
**Description**: List Slack users in the workspace with pagination support.

**Parameters**:
- `limit` (number, optional): Maximum number of users to return (1-1000, default: 100)
- `cursor` (string, optional): Cursor for pagination

**Slack API**: `GET /api/users.list`

**Response**: Array of user objects with profile information

**Example**:
```json
{
  "name": "list_users",
  "arguments": {
    "limit": 50
  }
}
```

---

### `add_reaction`
**Description**: Add an emoji reaction to a Slack message.

**Parameters**:
- `channel` (string, required): Channel ID where the message is located
- `timestamp` (string, required): Timestamp of the message to react to
- `name` (string, required): Emoji name (without colons)

**Slack API**: `POST /api/reactions.add`

**Response**: Reaction add confirmation

**Example**:
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

---

### `remove_reaction`
**Description**: Remove an emoji reaction from a Slack message.

**Parameters**:
- `channel` (string, required): Channel ID where the message is located
- `timestamp` (string, required): Timestamp of the message to remove reaction from
- `name` (string, required): Emoji name (without colons)

**Slack API**: `POST /api/reactions.remove`

**Response**: Reaction remove confirmation

**Example**:
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

---

### `get_reactions`
**Description**: Get all reactions for a Slack message.

**Parameters**:
- `channel` (string, required): Channel ID where the message is located
- `timestamp` (string, required): Timestamp of the message to get reactions for

**Slack API**: `GET /api/reactions.get`

**Response**: Reaction object with emoji and user information

**Example**:
```json
{
  "name": "get_reactions",
  "arguments": {
    "channel": "C1234567890",
    "timestamp": "1234567890.123456"
  }
}
```

---

### `upload_file`
**Description**: Upload a file to a Slack channel with optional metadata.

**Parameters**:
- `channels` (string, required): Channel ID to upload file to
- `content` (string, required): File content as a string
- `filename` (string, required): Name of the file
- `title` (string, optional): Title for the file
- `filetype` (string, optional): File type (e.g., 'text', 'javascript')
- `initial_comment` (string, optional): Initial comment to add with the file

**Slack API**: `POST /api/files.upload`

**Response**: File upload confirmation with file information

**Example**:
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

---

### `get_file_info`
**Description**: Get information about a Slack file.

**Parameters**:
- `file` (string, required): File ID to get information about

**Slack API**: `GET /api/files.info`

**Response**: File object with metadata and access information

**Example**:
```json
{
  "name": "get_file_info",
  "arguments": {
    "file": "F1234567890"
  }
}
```

---

### `create_reminder`
**Description**: Create a reminder in Slack for a user.

**Parameters**:
- `text` (string, required): Reminder text
- `time` (string, required): When to remind (e.g., 'in 20 minutes', 'tomorrow at 9am')
- `user` (string, optional): User ID to remind (defaults to current user)

**Slack API**: `POST /api/reminders.add`

**Response**: Reminder creation confirmation with reminder ID

**Example**:
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

---

### `get_team_info`
**Description**: Get information about the Slack workspace/team.

**Parameters**: None

**Slack API**: `GET /api/team.info`

**Response**: Team object with workspace information

**Example**:
```json
{
  "name": "get_team_info",
  "arguments": {}
}
```

---

### `test_auth`
**Description**: Test Slack authentication and get user/team information.

**Parameters**: None

**Slack API**: `GET /api/auth.test`

**Response**: Authentication test result with user and team information

**Example**:
```json
{
  "name": "test_auth",
  "arguments": {}
}
```

## Common Response Patterns

### Success Response
```json
{
  "content": [
    {
      "type": "text",
      "text": "Operation completed successfully. [Details]"
    }
  ]
}
```

### Error Response
```json
{
  "error": {
    "code": -32603,
    "message": "Error description",
    "data": {
      "details": "Additional error context"
    }
  }
}
```

## Tool Usage Tips

1. **Channel IDs vs Names**: Most tools require channel IDs (e.g., "C1234567890") rather than channel names. Use `list_channels` to get channel IDs.

2. **Message Timestamps**: Slack uses precise timestamps (e.g., "1234567890.123456") for message identification. These are returned in message operations.

3. **Thread Management**: Use `thread_ts` parameter to reply to specific messages in threads. Thread timestamps are the same as the parent message timestamp.

4. **Emoji Reactions**: Use emoji names without colons (e.g., "thumbsup" not ":thumbsup:") for reaction operations.

5. **File Types**: Common file types include 'text', 'javascript', 'python', 'markdown', 'json', 'csv', etc.

6. **Pagination**: Use `cursor` parameters for pagination with large result sets.

## Authentication Requirements

All tools require:
- Valid OAuth 2.0 access token with appropriate Slack scopes
- Active Slack workspace with API access enabled
- Proper OAuth app configuration in Slack App settings

## Performance Considerations

- **Message Batching**: Consider message frequency to avoid rate limits
- **Channel Caching**: Cache channel information to reduce API calls
- **File Size Limits**: Be aware of Slack's file size limitations
- **Token Refresh**: Automatic token refresh handles expired credentials
- **Pagination**: Use pagination for large datasets to improve performance

## Security Features

- **OAuth 2.0 Integration**: Secure token-based authentication
- **Automatic Token Refresh**: Seamless credential renewal
- **Audit Logging**: Complete operation tracking
- **Error Sanitization**: Sensitive data redaction in error messages
- **Multi-tenant Isolation**: Instance-based credential separation

## Error Handling

The service handles common Slack API errors:
- **Invalid Token**: Automatic token refresh or re-authentication prompt
- **Rate Limits**: Exponential backoff and retry logic
- **Channel Not Found**: Clear error messages with context
- **Permission Errors**: Scope validation and clear instructions
- **File Upload Errors**: Size limits and format validation

## Rate Limiting

Slack API rate limits vary by tier:
- **Tier 1**: 1+ request per minute
- **Tier 2**: 20+ requests per minute
- **Tier 3**: 50+ requests per minute
- **Tier 4**: 100+ requests per minute

The service includes automatic retry logic with exponential backoff to handle rate limits gracefully.

## Scope Requirements

Different tools require different OAuth scopes:
- **Messaging**: `chat:write`
- **Channel Info**: `channels:read`
- **User Info**: `users:read`
- **File Upload**: `files:write`
- **Reactions**: `reactions:write`

Ensure your Slack app has the necessary scopes for the tools you plan to use.