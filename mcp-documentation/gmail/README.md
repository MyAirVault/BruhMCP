# Gmail MCP Service Documentation

## User Flow: Frontend Selection to LLM Integration

### Complete System Flow: User Selects Gmail Service

#### 1. Frontend Service Selection
**User Action**: Dashboard → "Create New MCP" → Select "Gmail"  
**Flow**:
1. **Dashboard Page** → User clicks "Create New MCP" button
   - **File**: `/frontend/src/pages/Dashboard.tsx`
   - **Function**: Opens CreateMCPModal component
   - **Action**: Displays service selection modal

2. **Service Selection** → TypeDropdown loads available services
   - **File**: `/frontend/src/components/ui/form/TypeDropdown.tsx`
   - **API Call**: `GET /api/v1/mcp-types`
   - **Action**: Fetches available services from database

3. **Dynamic Form Generation** → Form adapts for Gmail (OAuth type)
   - **File**: `/frontend/src/components/ui/form/CredentialFields.tsx`
   - **Function**: Renders OAuth credential fields
   - **Action**: Shows custom name, Client ID, Client Secret, and expiration fields

4. **Real-time Validation** → Credentials validated as user types
   - **File**: `/frontend/src/hooks/useCreateMCPForm.ts`
   - **API Call**: `POST /api/v1/mcps/validate-credentials`
   - **Action**: Validates Gmail OAuth credentials against Google API

#### 2. Backend Instance Creation
**User Action**: User clicks "Create Instance" button  
**Flow**:
1. **Request Validation** → Zod schema validation
   - **File**: `/backend/src/controllers/mcpInstances/crud/createMCP.js`
   - **Function**: `createMCP` controller
   - **Action**: Validates request body and OAuth credentials

2. **Service Definition Lookup** → Queries service configuration
   - **Database**: `mcp_table` query for Gmail service
   - **Action**: Retrieves service configuration and port number

3. **Database Storage** → Creates instance records
   - **Tables**: `mcp_service_table` and `mcp_credentials`
   - **Action**: Stores instance with encrypted Client ID/Secret, sets `oauth_status: 'pending'`

4. **URL Generation** → Creates instance-specific URL
   - **Format**: `{PUBLIC_DOMAIN}/gmail/{instance_id}`
   - **Action**: Returns URL and OAuth authorization URL to frontend

#### 3. OAuth Authentication Flow
**User Action**: User completes OAuth in popup window  
**Flow**:
1. **Authorization Request** → User redirected to Google OAuth
   - **URL**: `https://accounts.google.com/o/oauth2/v2/auth`
   - **Scopes**: `gmail.modify`, `userinfo.profile`, `userinfo.email`
   - **Action**: User grants permissions to application

2. **OAuth Callback** → Google redirects to callback URL
   - **Endpoint**: `GET /auth/google/callback`
   - **File**: `/backend/src/controllers/oauth/google.js`
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
   - **Endpoint**: `POST /gmail/{instance_id}/mcp`
   - **Protocol**: JSON-RPC 2.0 over HTTP using MCP SDK
   - **Action**: Establishes MCP session with Gmail service

2. **Authentication Middleware** → Validates instance and credentials
   - **File**: `/backend/src/mcp-servers/gmail/middleware/credential-auth.js`
   - **Function**: `credentialAuthMiddleware`
   - **Action**: Looks up instance, validates OAuth tokens, handles token refresh

3. **Handler Creation** → Creates persistent MCP handler
   - **File**: `/backend/src/mcp-servers/gmail/services/handler-sessions.js`
   - **Function**: `getOrCreateHandler`
   - **Action**: Creates GmailMCPHandler with authenticated API access

#### 5. Tool Execution Flow (e.g., Send Email)
**User Action**: LLM calls `send_email` tool  
**Flow**:
1. **MCP Request Processing**
   - **File**: `/backend/src/mcp-servers/gmail/endpoints/mcp-handler.js:592`
   - **Class**: `GmailMCPHandler`
   - **Method**: `handleMCPRequest`
   - **Action**: Processes JSON-RPC via MCP SDK

2. **Tool Execution**
   - **File**: `/backend/src/mcp-servers/gmail/endpoints/mcp-handler.js:69`
   - **Method**: `send_email` tool handler
   - **Action**: Validates input with Zod schema, executes business logic

3. **External API Call**
   - **File**: `/backend/src/mcp-servers/gmail/api/gmail-api.js`
   - **Function**: `sendEmail`
   - **Action**: Makes authenticated call to Gmail API

4. **Response Processing**
   - **Processing**: Format response as JSON, handle errors
   - **Transport**: Send back via MCP transport to LLM

### Key System Components
- **Frontend**: `/frontend/src/pages/Dashboard.tsx` - Service selection UI
- **Backend API**: `/backend/src/controllers/mcpInstances/crud/createMCP.js` - Instance creation
- **OAuth Handler**: `/backend/src/controllers/oauth/google.js` - OAuth flow management
- **Database**: `mcp_service_table`, `mcp_credentials` - Instance storage
- **MCP Server**: `/backend/src/mcp-servers/gmail/index.js:162` - Multi-tenant routing
- **Authentication**: `/middleware/credential-auth.js` - Instance-based auth with OAuth
- **API Integration**: `/api/gmail-api.js` - Gmail API v1 integration

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
- **Health Check**: `{PUBLIC_DOMAIN}/gmail/{instance_id}/health`
- **MCP Endpoint**: `{PUBLIC_DOMAIN}/gmail/{instance_id}/mcp`
- **Direct MCP**: `{PUBLIC_DOMAIN}/gmail/{instance_id}` (Claude Code compatibility)
- **OAuth Authorization**: `https://accounts.google.com/o/oauth2/v2/auth?client_id={client_id}&redirect_uri={callback_url}&response_type=code&scope=gmail.modify%20userinfo.profile%20userinfo.email`

---

## Overview

The Gmail MCP (Model Context Protocol) service provides comprehensive email management capabilities through Google's Gmail API. This service enables users to send, receive, manage, and organize emails through a standardized MCP interface with advanced features including attachment handling, label management, and thread operations.

## Service Configuration

- **Service Name**: `gmail`
- **Port**: 49296
- **Authentication**: OAuth 2.0
- **Required Scopes**: 
  - `https://www.googleapis.com/auth/gmail.modify`
  - `https://www.googleapis.com/auth/userinfo.profile`
  - `https://www.googleapis.com/auth/userinfo.email`

## Available Tools

The Gmail MCP service provides 20 comprehensive tools for email management, organization, and advanced operations.

### Email Management Tools

#### 1. `send_email`
Send an email message through Gmail.

**Parameters:**
- `to` (string, required): Recipient email address
- `subject` (string, required): Email subject line
- `body` (string, required): Email body content (supports HTML)
- `cc` (string, optional): CC email addresses (comma separated)
- `bcc` (string, optional): BCC email addresses (comma separated)
- `format` (string, optional): Email format ('text' or 'html', default: 'text')

**Example:**
```json
{
  "name": "send_email",
  "arguments": {
    "to": "recipient@example.com",
    "subject": "Meeting Follow-up",
    "body": "Thank you for the productive meeting today.",
    "cc": "manager@example.com",
    "format": "text"
  }
}
```

#### 2. `send_email_with_attachments`
Send an email with file attachments.

**Parameters:**
- `to` (string, required): Recipient email address
- `subject` (string, required): Email subject line
- `body` (string, required): Email body content (supports HTML)
- `cc` (string, optional): CC email addresses (comma separated)
- `bcc` (string, optional): BCC email addresses (comma separated)
- `format` (string, optional): Email format ('text' or 'html', default: 'text')
- `attachments` (array, optional): Array of attachment objects

**Attachment Object:**
- `filename` (string, required): Filename of the attachment
- `mimeType` (string, required): MIME type (e.g., 'application/pdf', 'image/jpeg')
- `data` (string, required): Base64 encoded attachment data

**Example:**
```json
{
  "name": "send_email_with_attachments",
  "arguments": {
    "to": "recipient@example.com",
    "subject": "Report Submission",
    "body": "Please find the attached report.",
    "attachments": [
      {
        "filename": "report.pdf",
        "mimeType": "application/pdf",
        "data": "JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwo..."
      }
    ]
  }
}
```

#### 3. `fetch_emails`
Fetch emails from Gmail inbox or specific folders.

**Parameters:**
- `query` (string, optional): Gmail search query (supports Gmail search operators)
- `maxResults` (number, optional): Maximum number of emails to return (1-500, default: 10)
- `labelIds` (array, optional): Label IDs to filter by
- `includeSpamTrash` (boolean, optional): Include spam and trash in results (default: false)

**Example:**
```json
{
  "name": "fetch_emails",
  "arguments": {
    "query": "from:important@example.com",
    "maxResults": 20,
    "labelIds": ["INBOX"],
    "includeSpamTrash": false
  }
}
```

#### 4. `fetch_message_by_id`
Fetch a specific email message by its ID.

**Parameters:**
- `messageId` (string, required): Gmail message ID to fetch
- `format` (string, optional): Message format ('minimal', 'full', 'raw', 'metadata', default: 'full')

**Example:**
```json
{
  "name": "fetch_message_by_id",
  "arguments": {
    "messageId": "18f1c2e4b2d5a8f3",
    "format": "full"
  }
}
```

#### 5. `reply_to_email`
Reply to an existing email thread.

**Parameters:**
- `threadId` (string, required): Thread ID to reply to
- `body` (string, required): Reply message body
- `subject` (string, optional): Reply subject (will use 'Re:' prefix if not provided)
- `format` (string, optional): Reply format ('text' or 'html', default: 'text')

**Example:**
```json
{
  "name": "reply_to_email",
  "arguments": {
    "threadId": "18f1c2e4b2d5a8f3",
    "body": "Thank you for your email. I will review and respond shortly.",
    "format": "text"
  }
}
```

### Draft Management Tools

#### 6. `create_draft`
Create an email draft.

**Parameters:**
- `to` (string, required): Recipient email address
- `subject` (string, required): Email subject line
- `body` (string, required): Email body content
- `cc` (string, optional): CC email addresses (comma separated)
- `bcc` (string, optional): BCC email addresses (comma separated)
- `format` (string, optional): Email format ('text' or 'html', default: 'text')

**Example:**
```json
{
  "name": "create_draft",
  "arguments": {
    "to": "recipient@example.com",
    "subject": "Draft Email",
    "body": "This is a draft email.",
    "format": "text"
  }
}
```

#### 7. `send_draft`
Send an existing draft email.

**Parameters:**
- `draftId` (string, required): Draft ID to send

**Example:**
```json
{
  "name": "send_draft",
  "arguments": {
    "draftId": "r-1234567890123456789"
  }
}
```

#### 8. `list_drafts`
List all email drafts.

**Parameters:**
- `maxResults` (number, optional): Maximum number of drafts to return (1-500, default: 100)
- `query` (string, optional): Search query for drafts

**Example:**
```json
{
  "name": "list_drafts",
  "arguments": {
    "maxResults": 50,
    "query": "subject:important"
  }
}
```

### Search and Discovery Tools

#### 9. `search_emails`
Advanced email search with Gmail operators.

**Parameters:**
- `query` (string, required): Gmail search query using search operators
- `maxResults` (number, optional): Maximum number of results (1-500, default: 50)
- `newerThan` (string, optional): Only return emails newer than this date (YYYY-MM-DD format)
- `olderThan` (string, optional): Only return emails older than this date (YYYY-MM-DD format)

**Example:**
```json
{
  "name": "search_emails",
  "arguments": {
    "query": "from:client@example.com has:attachment",
    "maxResults": 30,
    "newerThan": "2024-01-01"
  }
}
```

#### 10. `get_thread`
Get an entire email thread/conversation.

**Parameters:**
- `threadId` (string, required): Thread ID to retrieve
- `format` (string, optional): Format for messages in thread ('minimal', 'full', 'metadata', default: 'full')

**Example:**
```json
{
  "name": "get_thread",
  "arguments": {
    "threadId": "18f1c2e4b2d5a8f3",
    "format": "full"
  }
}
```

### Message Management Tools

#### 11. `delete_message`
Permanently delete a message.

**Parameters:**
- `messageId` (string, required): Message ID to delete permanently

**Example:**
```json
{
  "name": "delete_message",
  "arguments": {
    "messageId": "18f1c2e4b2d5a8f3"
  }
}
```

#### 12. `move_to_trash`
Move a message to trash.

**Parameters:**
- `messageId` (string, required): Message ID to move to trash

**Example:**
```json
{
  "name": "move_to_trash",
  "arguments": {
    "messageId": "18f1c2e4b2d5a8f3"
  }
}
```

#### 13. `mark_as_read`
Mark message(s) as read.

**Parameters:**
- `messageIds` (array, required): Array of message IDs to mark as read

**Example:**
```json
{
  "name": "mark_as_read",
  "arguments": {
    "messageIds": ["18f1c2e4b2d5a8f3", "18f1c2e4b2d5a8f4"]
  }
}
```

#### 14. `mark_as_unread`
Mark message(s) as unread.

**Parameters:**
- `messageIds` (array, required): Array of message IDs to mark as unread

**Example:**
```json
{
  "name": "mark_as_unread",
  "arguments": {
    "messageIds": ["18f1c2e4b2d5a8f3", "18f1c2e4b2d5a8f4"]
  }
}
```

### Label Management Tools

#### 15. `list_labels`
List all Gmail labels.

**Parameters:** None

**Example:**
```json
{
  "name": "list_labels",
  "arguments": {}
}
```

#### 16. `create_label`
Create a new Gmail label.

**Parameters:**
- `name` (string, required): Label name
- `messageListVisibility` (string, optional): Whether to show label in message list ('show' or 'hide', default: 'show')
- `labelListVisibility` (string, optional): Whether to show label in label list ('labelShow' or 'labelHide', default: 'labelShow')

**Example:**
```json
{
  "name": "create_label",
  "arguments": {
    "name": "Important Projects",
    "messageListVisibility": "show",
    "labelListVisibility": "labelShow"
  }
}
```

#### 17. `modify_labels`
Add or remove labels from a message.

**Parameters:**
- `messageId` (string, required): Message ID to modify
- `addLabelIds` (array, optional): Label IDs to add to the message
- `removeLabelIds` (array, optional): Label IDs to remove from the message

**Example:**
```json
{
  "name": "modify_labels",
  "arguments": {
    "messageId": "18f1c2e4b2d5a8f3",
    "addLabelIds": ["Label_1", "Label_2"],
    "removeLabelIds": ["INBOX"]
  }
}
```

#### 18. `delete_label`
Delete a Gmail label.

**Parameters:**
- `labelId` (string, required): Label ID to delete

**Example:**
```json
{
  "name": "delete_label",
  "arguments": {
    "labelId": "Label_1"
  }
}
```

### Attachment Tools

#### 19. `list_attachments`
List all attachments for a specific Gmail message.

**Parameters:**
- `messageId` (string, required): Gmail message ID to list attachments for

**Example:**
```json
{
  "name": "list_attachments",
  "arguments": {
    "messageId": "18f1c2e4b2d5a8f3"
  }
}
```

#### 20. `download_attachment`
Download an attachment from a Gmail message.

**Parameters:**
- `messageId` (string, required): Gmail message ID containing the attachment
- `attachmentId` (string, required): Attachment ID to download
- `returnDataUrl` (boolean, optional): Return full data for large attachments (default: false)

**Example:**
```json
{
  "name": "download_attachment",
  "arguments": {
    "messageId": "18f1c2e4b2d5a8f3",
    "attachmentId": "ANGjdJ-5fUt9...",
    "returnDataUrl": true
  }
}
```

## Authentication

The Gmail MCP service uses OAuth 2.0 authentication with the following flow:

1. **OAuth Setup**: Configure Google OAuth 2.0 credentials in Google Cloud Console
2. **Instance Creation**: Each user gets a unique instance ID
3. **OAuth Authorization**: User authorizes the application with required Gmail scopes
4. **Token Management**: Access tokens are cached and automatically refreshed
5. **API Access**: All tools use the authenticated user's Gmail credentials

### Required OAuth Scopes

- `https://www.googleapis.com/auth/gmail.modify`: Full access to Gmail for reading, sending, and modifying emails
- `https://www.googleapis.com/auth/userinfo.profile`: Access to user's basic profile information
- `https://www.googleapis.com/auth/userinfo.email`: Access to user's email address

### OAuth Configuration

To set up OAuth authentication:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs
6. Configure the client ID and client secret in your MCP instance

## Error Handling

The service includes comprehensive error handling for:

- **OAuth Authentication Errors**: Invalid tokens, expired credentials, scope issues
- **Gmail API Errors**: Rate limiting, message not found, insufficient permissions
- **Network Errors**: Connection issues, timeouts, service unavailable
- **Validation Errors**: Invalid parameters, malformed requests
- **Attachment Errors**: File size limits, download timeouts, unsupported formats

## Rate Limiting

The service implements automatic retry logic with exponential backoff for:
- Gmail API rate limits (quota exceeded)
- Server errors (HTTP 5xx)
- Network connectivity issues

Gmail API has the following rate limits:
- **Quota**: 1 billion quota units per day
- **Per-user rate limit**: 250 quota units per user per 100 seconds
- **Per-request rate limit**: 100 quota units per 100 seconds

## Security Features

- **OAuth 2.0 Compliance**: Secure token-based authentication
- **Credential Caching**: Secure in-memory token storage with automatic refresh
- **Audit Logging**: Comprehensive logging of all OAuth and API operations
- **Multi-tenant Isolation**: Instance-based credential separation
- **Token Validation**: Real-time validation of access tokens
- **Secure Error Handling**: Sensitive data redaction in error messages

## Usage Examples

### Basic Email Operations
```json
// Send a simple email
{
  "name": "send_email",
  "arguments": {
    "to": "colleague@example.com",
    "subject": "Weekly Report",
    "body": "Please find the weekly report attached.",
    "format": "text"
  }
}

// Fetch recent emails
{
  "name": "fetch_emails",
  "arguments": {
    "query": "is:unread",
    "maxResults": 20
  }
}

// Reply to a thread
{
  "name": "reply_to_email",
  "arguments": {
    "threadId": "18f1c2e4b2d5a8f3",
    "body": "Thank you for the update. I will review the documents.",
    "format": "text"
  }
}
```

### Advanced Operations
```json
// Search for emails with attachments from specific sender
{
  "name": "search_emails",
  "arguments": {
    "query": "from:client@example.com has:attachment",
    "maxResults": 50,
    "newerThan": "2024-01-01"
  }
}

// Create and organize with labels
{
  "name": "create_label",
  "arguments": {
    "name": "Project Alpha",
    "messageListVisibility": "show"
  }
}

// Send email with attachment
{
  "name": "send_email_with_attachments",
  "arguments": {
    "to": "team@example.com",
    "subject": "Project Documentation",
    "body": "Please review the attached project documentation.",
    "attachments": [
      {
        "filename": "project_docs.pdf",
        "mimeType": "application/pdf",
        "data": "JVBERi0xLjQKJdPr6eEKMSAwIG9iago..."
      }
    ]
  }
}
```

### Attachment Management
```json
// List message attachments
{
  "name": "list_attachments",
  "arguments": {
    "messageId": "18f1c2e4b2d5a8f3"
  }
}

// Download attachment
{
  "name": "download_attachment",
  "arguments": {
    "messageId": "18f1c2e4b2d5a8f3",
    "attachmentId": "ANGjdJ-5fUt9...",
    "returnDataUrl": true
  }
}
```

## Implementation Status

✅ **Production Ready**: The Gmail MCP service includes enterprise-grade features:

### Core Features
- ✅ **Complete Email Management**: Send, receive, reply, forward, and organize emails
- ✅ **Advanced Search**: Gmail search operators with date filtering
- ✅ **Label Management**: Create, modify, and delete labels
- ✅ **Draft Operations**: Create, edit, and send drafts
- ✅ **Thread Support**: Full conversation thread handling
- ✅ **Attachment Support**: Upload, download, and manage attachments (50MB limit)

### Enterprise Features
- ✅ **OAuth 2.0 Integration**: Secure authentication with automatic token refresh
- ✅ **Credential Caching**: High-performance in-memory token storage
- ✅ **Error Recovery**: Comprehensive error handling with retry logic
- ✅ **Rate Limiting**: Automatic handling of Gmail API limits
- ✅ **Audit Logging**: Complete operation tracking and security logging
- ✅ **Multi-tenant Support**: Instance-based credential isolation

### Technical Architecture
- ✅ **Optimized API Client**: Efficient Gmail API integration with connection pooling
- ✅ **Response Formatting**: Consistent, clean response formats across all tools
- ✅ **Validation System**: Comprehensive input validation and sanitization
- ✅ **Performance Monitoring**: Real-time metrics and performance tracking
- ✅ **Security Hardening**: Token validation, secure logging, and error handling

## Performance Considerations

- **Attachment Handling**: Files up to 50MB supported with timeout protection
- **Batch Operations**: Efficient handling of multiple message operations
- **Caching Strategy**: Optimized token caching reduces API calls
- **Connection Pooling**: Reused connections for better performance
- **Response Optimization**: Streamlined response formats for faster processing

## Limitations and Considerations

- **File Size Limits**: Attachments are limited to 50MB
- **Rate Limits**: Subject to Gmail API quotas and per-user limits
- **OAuth Scopes**: Requires `gmail.modify` scope for full functionality
- **Token Expiration**: Access tokens expire and require refresh
- **Thread Complexity**: Large email threads may impact performance

This Gmail MCP service provides a comprehensive, production-ready email management solution with enterprise-grade security, performance, and reliability features.