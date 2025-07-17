# Dropbox MCP Service Documentation

## User Flow: Frontend Selection to LLM Integration

### Complete System Flow: User Selects Dropbox Service

#### 1. Frontend Service Selection
**User Action**: Dashboard → "Create New MCP" → Select "Dropbox"  
**Flow**:
1. **Dashboard Page** → User clicks "Create New MCP" button
   - **File**: `/frontend/src/pages/Dashboard.tsx`
   - **Function**: Opens CreateMCPModal component
   - **Action**: Displays service selection modal

2. **Service Selection** → TypeDropdown loads available services
   - **File**: `/frontend/src/components/ui/form/TypeDropdown.tsx`
   - **API Call**: `GET /api/v1/mcp-types`
   - **Action**: Fetches available services from database

3. **Dynamic Form Generation** → Form adapts for Dropbox (OAuth type)
   - **File**: `/frontend/src/components/ui/form/CredentialFields.tsx`
   - **Function**: Renders OAuth credential fields
   - **Action**: Shows custom name, Client ID, Client Secret, and expiration fields

4. **Real-time Validation** → Credentials validated as user types
   - **File**: `/frontend/src/hooks/useCreateMCPForm.ts`
   - **API Call**: `POST /api/v1/mcps/validate-credentials`
   - **Action**: Validates Dropbox OAuth credentials against Dropbox API

#### 2. Backend Instance Creation
**User Action**: User clicks "Create Instance" button  
**Flow**:
1. **Request Validation** → Zod schema validation
   - **File**: `/backend/src/controllers/mcpInstances/crud/createMCP.js`
   - **Function**: `createMCP` controller
   - **Action**: Validates request body and OAuth credentials

2. **Service Definition Lookup** → Queries service configuration
   - **Database**: `mcp_table` query for Dropbox service
   - **Action**: Retrieves service configuration and port number

3. **Database Storage** → Creates instance records
   - **Tables**: `mcp_service_table` and `mcp_credentials`
   - **Action**: Stores instance with encrypted Client ID/Secret, sets `oauth_status: 'pending'`

4. **URL Generation** → Creates instance-specific URL
   - **Format**: `{PUBLIC_DOMAIN}/dropbox/{instance_id}`
   - **Action**: Returns URL and OAuth authorization URL to frontend

#### 3. OAuth Authentication Flow
**User Action**: User completes OAuth in popup window  
**Flow**:
1. **Authorization Request** → User redirected to Dropbox OAuth
   - **URL**: `https://www.dropbox.com/oauth2/authorize`
   - **Scopes**: `account_info.read`, `files.metadata.write`, `files.content.write`, `sharing.write`
   - **Action**: User grants permissions to application

2. **OAuth Callback** → Dropbox redirects to callback URL
   - **Endpoint**: `GET /auth/dropbox/callback`
   - **File**: `/backend/src/controllers/oauth/dropbox.js`
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
   - **Endpoint**: `POST /dropbox/{instance_id}/mcp`
   - **Protocol**: JSON-RPC 2.0 over HTTP using MCP SDK
   - **Action**: Establishes MCP session with Dropbox service

2. **Authentication Middleware** → Validates instance and credentials
   - **File**: `/backend/src/mcp-servers/dropbox/middleware/credential-auth.js`
   - **Function**: `credentialAuthMiddleware`
   - **Action**: Looks up instance, validates OAuth tokens, handles token refresh

3. **Handler Creation** → Creates persistent MCP handler
   - **File**: `/backend/src/mcp-servers/dropbox/services/handler-sessions.js`
   - **Function**: `getOrCreateHandler`
   - **Action**: Creates DropboxMCPHandler with authenticated API access

#### 5. Tool Execution Flow (e.g., Upload File)
**User Action**: LLM calls `upload_file` tool  
**Flow**:
1. **MCP Request Processing**
   - **File**: `/backend/src/mcp-servers/dropbox/endpoints/mcp-handler.js:628`
   - **Class**: `DropboxMCPHandler`
   - **Method**: `handleMCPRequest`
   - **Action**: Processes JSON-RPC via MCP SDK

2. **Tool Execution**
   - **File**: `/backend/src/mcp-servers/dropbox/endpoints/mcp-handler.js:211`
   - **Method**: `upload_file` tool handler
   - **Action**: Validates input, reads local file, prepares upload

3. **External API Call**
   - **File**: `/backend/src/mcp-servers/dropbox/endpoints/mcp-handler.js:242`
   - **Function**: Direct fetch to Dropbox content API
   - **Action**: Makes authenticated call to Dropbox API

4. **Response Processing**
   - **Processing**: Handle API response, format as JSON
   - **Transport**: Send back via MCP transport to LLM

### Key System Components
- **Frontend**: `/frontend/src/pages/Dashboard.tsx` - Service selection UI
- **Backend API**: `/backend/src/controllers/mcpInstances/crud/createMCP.js` - Instance creation
- **OAuth Handler**: `/backend/src/controllers/oauth/dropbox.js` - OAuth flow management
- **Database**: `mcp_service_table`, `mcp_credentials` - Instance storage
- **MCP Server**: `/backend/src/mcp-servers/dropbox/index.js` - Multi-tenant routing
- **Authentication**: `/middleware/credential-auth.js` - Instance-based auth with OAuth
- **API Integration**: `/api/dropbox-api.js` - Dropbox API v2 integration

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
- **Health Check**: `{PUBLIC_DOMAIN}/dropbox/{instance_id}/health`
- **MCP Endpoint**: `{PUBLIC_DOMAIN}/dropbox/{instance_id}/mcp`
- **Direct MCP**: `{PUBLIC_DOMAIN}/dropbox/{instance_id}` (Claude Code compatibility)
- **OAuth Authorization**: `https://www.dropbox.com/oauth2/authorize?client_id={client_id}&redirect_uri={callback_url}&response_type=code&scope=account_info.read%20files.metadata.write%20files.content.write%20sharing.write`

---

## Overview

The Dropbox MCP (Model Context Protocol) service provides comprehensive file storage and sharing capabilities through Dropbox's API. This service enables users to manage files, folders, and shared links through a standardized MCP interface.

## Service Configuration

- **Service Name**: `dropbox`
- **Port**: 49264
- **Authentication**: OAuth 2.0
- **Required Scopes**: 
  - `account_info.read`
  - `files.metadata.write`
  - `files.content.write`
  - `sharing.write`

## Available Tools

The Dropbox MCP service provides 12 comprehensive tools for file management, search, and sharing operations.

### File Management Tools

#### 1. `list_files`
List files and folders in a directory.

**Parameters:**
- `path` (string): Directory path to list (default: "")
- `recursive` (boolean): Include subdirectories (default: false)
- `limit` (number): Maximum number of entries to return (default: 100)

**Example:**
```json
{
  "name": "list_files",
  "arguments": {
    "path": "/Documents",
    "recursive": true,
    "limit": 50
  }
}
```

#### 2. `get_file_metadata`
Get metadata for a specific file or folder.

**Parameters:**
- `path` (string, required): Path to the file or folder

**Example:**
```json
{
  "name": "get_file_metadata",
  "arguments": {
    "path": "/Documents/report.pdf"
  }
}
```

#### 3. `download_file`
Download a file from Dropbox to local storage.

**Parameters:**
- `path` (string, required): Dropbox path to the file
- `localPath` (string, required): Local path to save the file

**Example:**
```json
{
  "name": "download_file",
  "arguments": {
    "path": "/Documents/report.pdf",
    "localPath": "/home/user/downloads/report.pdf"
  }
}
```

#### 4. `upload_file`
Upload a file from local storage to Dropbox.

**Parameters:**
- `localPath` (string, required): Local path to the file
- `dropboxPath` (string, required): Destination path in Dropbox
- `overwrite` (boolean): Whether to overwrite existing files (default: false)

**Example:**
```json
{
  "name": "upload_file",
  "arguments": {
    "localPath": "/home/user/document.pdf",
    "dropboxPath": "/Documents/document.pdf",
    "overwrite": true
  }
}
```

#### 5. `create_folder`
Create a new folder in Dropbox.

**Parameters:**
- `path` (string, required): Path for the new folder
- `autorename` (boolean): Auto-rename if folder exists (default: false)

**Example:**
```json
{
  "name": "create_folder",
  "arguments": {
    "path": "/Projects/New Project",
    "autorename": true
  }
}
```

#### 6. `delete_file`
Delete a file or folder from Dropbox.

**Parameters:**
- `path` (string, required): Path to the file or folder to delete

**Example:**
```json
{
  "name": "delete_file",
  "arguments": {
    "path": "/Documents/old_report.pdf"
  }
}
```

#### 7. `move_file`
Move or rename a file or folder.

**Parameters:**
- `fromPath` (string, required): Current path of the file/folder
- `toPath` (string, required): New path for the file/folder
- `autorename` (boolean): Auto-rename if destination exists (default: false)

**Example:**
```json
{
  "name": "move_file",
  "arguments": {
    "fromPath": "/Documents/draft.pdf",
    "toPath": "/Documents/final.pdf",
    "autorename": true
  }
}
```

#### 8. `copy_file`
Copy a file or folder to a new location.

**Parameters:**
- `fromPath` (string, required): Source path of the file/folder
- `toPath` (string, required): Destination path for the copy
- `autorename` (boolean): Auto-rename if destination exists (default: false)

**Example:**
```json
{
  "name": "copy_file",
  "arguments": {
    "fromPath": "/Documents/template.docx",
    "toPath": "/Projects/project_template.docx",
    "autorename": true
  }
}
```

### Search and Discovery Tools

#### 9. `search_files`
Search for files and folders in Dropbox.

**Parameters:**
- `query` (string, required): Search query
- `path` (string): Path to search within (default: "")
- `maxResults` (number): Maximum results to return (default: 100)
- `fileStatus` (string): Filter by file status ("active", "deleted", "both")

**Example:**
```json
{
  "name": "search_files",
  "arguments": {
    "query": "report 2024",
    "path": "/Documents",
    "maxResults": 20,
    "fileStatus": "active"
  }
}
```

### Sharing Tools

#### 10. `get_shared_links`
Get existing shared links for a file or folder.

**Parameters:**
- `path` (string, required): Path to the file or folder

**Example:**
```json
{
  "name": "get_shared_links",
  "arguments": {
    "path": "/Documents/shared_report.pdf"
  }
}
```

#### 11. `create_shared_link`
Create a new shared link for a file or folder.

**Parameters:**
- `path` (string, required): Path to the file or folder
- `shortUrl` (boolean): Create a short URL (default: false)

**Example:**
```json
{
  "name": "create_shared_link",
  "arguments": {
    "path": "/Documents/presentation.pptx",
    "shortUrl": true
  }
}
```

### Account Tools

#### 12. `get_space_usage`
Get account space usage information.

**Parameters:** None

**Example:**
```json
{
  "name": "get_space_usage",
  "arguments": {}
}
```

## Authentication

The Dropbox MCP service uses OAuth 2.0 authentication with the following flow:

1. **Instance Creation**: Each user gets a unique instance ID
2. **OAuth Authorization**: User authorizes the application with required scopes
3. **Token Management**: Access tokens are cached and automatically refreshed
4. **API Access**: All tools use the authenticated user's credentials

## Error Handling

The service includes comprehensive error handling for:
- **OAuth Authentication Errors**: Invalid tokens, expired credentials
- **Dropbox API Errors**: Rate limiting, file not found, permissions
- **Network Errors**: Connection issues, timeouts
- **Validation Errors**: Invalid parameters, missing required fields

## Rate Limiting

The service implements automatic retry logic with exponential backoff for:
- Rate limit responses (HTTP 429)
- Server errors (HTTP 5xx)
- Network connectivity issues

## Security Features

- **OAuth 2.0 Compliance**: Secure token-based authentication
- **Credential Caching**: Secure in-memory token storage
- **Automatic Token Refresh**: Prevents authentication interruptions
- **Audit Logging**: Security event tracking
- **Multi-tenant Isolation**: Instance-based credential separation

## Usage Examples

### Basic File Operations
```json
// List files in root directory
{
  "name": "list_files",
  "arguments": {
    "path": "",
    "recursive": false,
    "limit": 10
  }
}

// Upload a document
{
  "name": "upload_file",
  "arguments": {
    "localPath": "/path/to/document.pdf",
    "dropboxPath": "/Documents/document.pdf",
    "overwrite": true
  }
}

// Create a shared link
{
  "name": "create_shared_link",
  "arguments": {
    "path": "/Documents/document.pdf",
    "shortUrl": true
  }
}
```

### Advanced Operations
```json
// Search for files
{
  "name": "search_files",
  "arguments": {
    "query": "quarterly report",
    "path": "/Reports",
    "maxResults": 50
  }
}

// Get account usage
{
  "name": "get_space_usage",
  "arguments": {}
}
```

## Implementation Status

⚠️ **Note**: The current Dropbox implementation is missing some critical infrastructure components that are present in the Gmail service, including:
- Database operations utilities
- OAuth validation utilities  
- Comprehensive error handling
- Token metrics tracking

These missing components may affect the reliability and functionality of some features.