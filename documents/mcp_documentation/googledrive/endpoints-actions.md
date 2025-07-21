# Google Drive MCP Endpoints and Actions

## Base Configuration

**Service**: Google Drive MCP Server  
**Port**: 49303  
**Base URL**: `https://www.googleapis.com/drive/v3`  
**Authentication**: OAuth 2.0 Bearer Token  

## MCP Protocol Endpoints

### 1. Initialize
**Endpoint**: `/:instanceId/mcp`  
**Method**: POST  
**Content-Type**: application/json  

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "tools": {}
    },
    "clientInfo": {
      "name": "client-name",
      "version": "1.0.0"
    }
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "tools": {},
      "resources": {}
    },
    "serverInfo": {
      "name": "Google Drive",
      "version": "1.0.0",
      "description": "Google Drive MCP server for file management"
    }
  }
}
```

### 2. List Tools
**Endpoint**: `/:instanceId/mcp`  
**Method**: POST  
**Content-Type**: application/json  

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list",
  "params": {}
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "tools": [
      {
        "name": "list_files",
        "description": "List files and folders in Google Drive",
        "inputSchema": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "Search query using Google Drive search syntax",
              "default": ""
            },
            "maxResults": {
              "type": "number",
              "description": "Maximum number of files to return",
              "minimum": 1,
              "maximum": 1000,
              "default": 10
            }
          }
        }
      }
    ]
  }
}
```

### 3. Call Tool
**Endpoint**: `/:instanceId/mcp`  
**Method**: POST  
**Content-Type**: application/json  

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "list_files",
    "arguments": {
      "query": "mimeType='application/pdf'",
      "maxResults": 10
    }
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\"files\": [{\"id\": \"1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms\", \"name\": \"document.pdf\", \"mimeType\": \"application/pdf\"}]}"
      }
    ]
  }
}
```

## Google Drive API Mapping

### File Operations

| MCP Tool | Google Drive API Endpoint | HTTP Method | Description |
|----------|-------------------------|-------------|-------------|
| list_files | `/drive/v3/files` | GET | List files with query parameters |
| get_file_metadata | `/drive/v3/files/{fileId}` | GET | Get file metadata |
| download_file | `/drive/v3/files/{fileId}` | GET | Download file content |
| upload_file | `/upload/drive/v3/files` | POST | Upload file |
| create_folder | `/drive/v3/files` | POST | Create folder |
| delete_file | `/drive/v3/files/{fileId}` | DELETE | Delete file |
| copy_file | `/drive/v3/files/{fileId}/copy` | POST | Copy file |
| move_file | `/drive/v3/files/{fileId}` | PATCH | Move file |
| search_files | `/drive/v3/files` | GET | Search with query |

### Sharing Operations

| MCP Tool | Google Drive API Endpoint | HTTP Method | Description |
|----------|-------------------------|-------------|-------------|
| share_file | `/drive/v3/files/{fileId}/permissions` | POST | Create permission |
| get_file_permissions | `/drive/v3/files/{fileId}/permissions` | GET | List permissions |

### Storage Operations

| MCP Tool | Google Drive API Endpoint | HTTP Method | Description |
|----------|-------------------------|-------------|-------------|
| get_drive_info | `/drive/v3/about` | GET | Get drive info |

## Authentication Flow

### 1. OAuth 2.0 Setup
- **Authorization URL**: `https://accounts.google.com/o/oauth2/auth`
- **Token URL**: `https://oauth2.googleapis.com/token`
- **Scopes**: 
  - `https://www.googleapis.com/auth/drive`
  - `https://www.googleapis.com/auth/drive.file`
  - `https://www.googleapis.com/auth/userinfo.email`

### 2. Request Headers
All API requests include:
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

### 3. Token Validation
The server validates Bearer tokens for each request and handles token refresh as needed.

## Error Responses

### MCP Protocol Errors

| Error Code | Description | Example |
|------------|-------------|---------|
| -32600 | Invalid Request | Malformed JSON-RPC |
| -32601 | Method not found | Unknown method |
| -32602 | Invalid params | Missing required parameters |
| -32603 | Internal error | Server error |
| -31000 | Server not initialized | Need to call initialize first |

### Google Drive API Errors

| HTTP Status | Error Type | Description |
|-------------|------------|-------------|
| 401 | Authentication Error | Invalid or expired token |
| 403 | Permission Denied | Insufficient permissions |
| 404 | Not Found | File or folder not found |
| 429 | Rate Limited | Too many requests |
| 500 | Server Error | Google Drive server error |

## Rate Limiting

Google Drive API has the following rate limits:
- **Per-user limit**: 1,000 requests per 100 seconds
- **Global limit**: 10,000 requests per 100 seconds

The server handles rate limiting by:
- Implementing exponential backoff
- Returning appropriate error messages
- Suggesting retry after periods

## File Upload Specifications

### Supported Upload Types
- **Simple upload**: Files up to 5MB
- **Multipart upload**: Files up to 5MB with metadata
- **Resumable upload**: Files larger than 5MB

### Upload Endpoints
- **Simple**: `POST /upload/drive/v3/files?uploadType=media`
- **Multipart**: `POST /upload/drive/v3/files?uploadType=multipart`
- **Resumable**: `POST /upload/drive/v3/files?uploadType=resumable`

### Content Types
The server auto-detects content types but supports manual specification:
- Documents: `application/pdf`, `text/plain`, `application/msword`
- Images: `image/jpeg`, `image/png`, `image/gif`
- Archives: `application/zip`, `application/x-rar-compressed`
- Google Workspace: `application/vnd.google-apps.document`

## Search Query Examples

### Basic Searches
```javascript
// Files containing "report" in name
"name contains 'report'"

// PDF files only
"mimeType='application/pdf'"

// Files modified after specific date
"modifiedTime > '2023-01-01T00:00:00'"

// Starred files
"starred=true"

// Files in specific folder
"parents in '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'"
```

### Advanced Searches
```javascript
// Starred PDF files with "report" in name
"name contains 'report' and mimeType='application/pdf' and starred=true"

// Non-trashed images modified in last month
"mimeType contains 'image' and trashed=false and modifiedTime > '2023-12-01T00:00:00'"

// Files shared with me
"sharedWithMe=true"

// Files owned by specific user
"'user@example.com' in owners"
```

## Response Data Structures

### File Metadata
```json
{
  "id": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
  "name": "document.pdf",
  "mimeType": "application/pdf",
  "parents": ["1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"],
  "size": "1048576",
  "createdTime": "2023-01-01T00:00:00.000Z",
  "modifiedTime": "2023-01-02T00:00:00.000Z",
  "webViewLink": "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view",
  "webContentLink": "https://drive.google.com/uc?id=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
}
```

### Permission Object
```json
{
  "id": "12345678901234567890",
  "type": "user",
  "role": "writer",
  "emailAddress": "user@example.com",
  "displayName": "John Doe"
}
```

### Drive Info
```json
{
  "storageQuota": {
    "limit": "17179869184",
    "usage": "8589934592",
    "usageInDrive": "5368709120"
  },
  "user": {
    "displayName": "John Doe",
    "emailAddress": "user@example.com"
  }
}
```

## Session Management

### Session Headers
```
MCP-Session-ID: uuid-v4-session-identifier
```

### Session Lifecycle
1. **Initialize**: Client sends initialize request
2. **Session Creation**: Server creates session with UUID
3. **Tool Operations**: Client makes tool calls with session ID
4. **Session Cleanup**: Server cleans up on transport close

## Performance Optimization

### Caching Strategy
- **Credential caching**: OAuth tokens cached per session
- **Metadata caching**: File metadata cached for short periods
- **Response optimization**: Large responses are simplified

### Batch Operations
- Multiple file operations can be batched
- Pagination support for large result sets
- Streaming support for large file downloads

## Security Considerations

### Token Security
- Bearer tokens are validated on each request
- Tokens are not logged or exposed in responses
- Session-based token management

### Input Validation
- All tool parameters are validated
- File paths are sanitized
- Search queries are validated for syntax

### Error Handling
- Detailed errors for debugging
- Sanitized error messages for security
- No sensitive data in error responses