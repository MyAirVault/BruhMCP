# Google Drive MCP Server

## Overview

The Google Drive MCP server provides comprehensive integration with Google Drive API v3, enabling file management, sharing, and collaboration through MCP tools. This implementation follows the multi-tenant architecture pattern with OAuth 2.0 authentication.

## Features

- **File Management**: List, upload, download, create, delete, copy, and move files
- **Folder Operations**: Create and manage folders
- **Search**: Advanced search capabilities with Google Drive search syntax
- **Sharing**: Share files and folders with users, groups, or make them public
- **Permissions**: View and manage file permissions
- **Storage Info**: Get drive usage and storage information

## Authentication

This server uses OAuth 2.0 authentication with the following required scopes:
- `https://www.googleapis.com/auth/drive` - Full access to Google Drive
- `https://www.googleapis.com/auth/drive.file` - Access to files created/opened by the app
- `https://www.googleapis.com/auth/userinfo.email` - Access to user email for identification

## Available Tools

The server provides 12 comprehensive tools for Google Drive operations:

1. **list_files** - List files and folders with filtering and sorting
2. **get_file_metadata** - Get detailed metadata for specific files
3. **download_file** - Download files with format conversion support
4. **upload_file** - Upload files to Google Drive
5. **create_folder** - Create new folders
6. **delete_file** - Delete files and folders
7. **copy_file** - Copy files to different locations
8. **move_file** - Move files between folders
9. **share_file** - Share files with users or make them public
10. **search_files** - Advanced search with Google Drive query syntax
11. **get_file_permissions** - View sharing permissions
12. **get_drive_info** - Get drive storage information

## Usage Examples

### Listing Files
```json
{
  "method": "tools/call",
  "params": {
    "name": "list_files",
    "arguments": {
      "query": "mimeType='application/pdf'",
      "maxResults": 20,
      "orderBy": "modifiedTime"
    }
  }
}
```

### Upload File
```json
{
  "method": "tools/call",
  "params": {
    "name": "upload_file",
    "arguments": {
      "localPath": "/path/to/document.pdf",
      "fileName": "Important Document.pdf",
      "parentFolderId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
    }
  }
}
```

### Share File
```json
{
  "method": "tools/call",
  "params": {
    "name": "share_file",
    "arguments": {
      "fileId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
      "type": "user",
      "role": "writer",
      "emailAddress": "colleague@example.com"
    }
  }
}
```

## MCP Protocol Support

- **Protocol Version**: Supports multiple MCP protocol versions (2024-11-05, 2025-06-18, 1.0, 0.1.0)
- **Transport**: HTTP-based JSON-RPC 2.0
- **Content Types**: Supports text content in tool responses
- **Error Handling**: Follows MCP error code standards

## Implementation Details

### Architecture
- Uses both SDK-based (primary) and manual JSON-RPC handlers
- Multi-tenant with session-based transport management
- OAuth Bearer token authentication per request
- Comprehensive error handling and validation

### File Operations
- Supports Google Workspace document format conversion
- Handles large file uploads and downloads
- Maintains file metadata and permissions
- Integrates with Google Drive sharing capabilities

### Search Capabilities
- Full Google Drive search syntax support
- Advanced filtering by file type, date, ownership
- Sorting by various criteria (modified time, name, size, etc.)
- Pagination support for large result sets

## Error Handling

The server implements comprehensive error handling:
- **Authentication errors**: Invalid or expired tokens
- **API errors**: Google Drive API rate limits and errors
- **Validation errors**: Invalid parameters or missing required fields
- **File operation errors**: Permission denied, file not found, etc.

All errors are returned in MCP-compliant format with appropriate error codes and descriptive messages.

## Configuration

The server requires OAuth 2.0 client credentials:
- Client ID and Client Secret from Google Cloud Console
- Proper redirect URI configuration
- Required scopes enabled in the OAuth consent screen

## Security

- OAuth 2.0 Bearer token authentication
- Input validation and sanitization
- Secure credential caching
- Rate limiting and error handling
- No sensitive data logging

## Rate Limits

Google Drive API has rate limits:
- 1,000 requests per 100 seconds per user
- 10,000 requests per 100 seconds (global)
- File upload limits based on account type

The server implements proper error handling for rate limit responses and provides appropriate retry suggestions.