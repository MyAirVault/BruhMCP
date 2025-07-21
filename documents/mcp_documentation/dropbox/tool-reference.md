# Dropbox MCP Service - Tool Reference

## Tool Categories

### 📁 File Management (8 tools)
- [`list_files`](#list_files) - List directory contents
- [`get_file_metadata`](#get_file_metadata) - Get file/folder metadata
- [`download_file`](#download_file) - Download files
- [`upload_file`](#upload_file) - Upload files
- [`create_folder`](#create_folder) - Create folders
- [`delete_file`](#delete_file) - Delete files/folders
- [`move_file`](#move_file) - Move/rename files
- [`copy_file`](#copy_file) - Copy files/folders

### 🔍 Search & Discovery (1 tool)
- [`search_files`](#search_files) - Search files and folders

### 🔗 Sharing (2 tools)
- [`get_shared_links`](#get_shared_links) - Get existing shared links
- [`create_shared_link`](#create_shared_link) - Create new shared links

### 📊 Account Management (1 tool)
- [`get_space_usage`](#get_space_usage) - Get account space usage

---

## Tool Details

### `list_files`
**Description**: List files and folders in a directory with optional recursive scanning.

**Parameters**:
- `path` (string, optional): Directory path to list (default: "" for root)
- `recursive` (boolean, optional): Include subdirectories (default: false)
- `limit` (number, optional): Maximum entries to return (default: 100)

**Dropbox API**: `POST /2/files/list_folder`

**Response**: Array of file/folder objects with metadata

**Example**:
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

---

### `get_file_metadata`
**Description**: Retrieve detailed metadata for a specific file or folder.

**Parameters**:
- `path` (string, required): Path to the file or folder

**Dropbox API**: `POST /2/files/get_metadata`

**Response**: File metadata object (size, modified time, content hash, etc.)

**Example**:
```json
{
  "name": "get_file_metadata",
  "arguments": {
    "path": "/Documents/report.pdf"
  }
}
```

---

### `download_file`
**Description**: Download a file from Dropbox to local storage.

**Parameters**:
- `path` (string, required): Dropbox path to the file
- `localPath` (string, required): Local destination path

**Dropbox API**: `POST /2/files/download`

**Response**: Success message with file size and location

**Example**:
```json
{
  "name": "download_file",
  "arguments": {
    "path": "/Documents/report.pdf",
    "localPath": "/home/user/downloads/report.pdf"
  }
}
```

---

### `upload_file`
**Description**: Upload a file from local storage to Dropbox.

**Parameters**:
- `localPath` (string, required): Local file path
- `dropboxPath` (string, required): Destination path in Dropbox
- `overwrite` (boolean, optional): Overwrite existing files (default: false)

**Dropbox API**: `POST /2/files/upload`

**Response**: File metadata for uploaded file

**Example**:
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

---

### `create_folder`
**Description**: Create a new folder in Dropbox.

**Parameters**:
- `path` (string, required): Path for the new folder
- `autorename` (boolean, optional): Auto-rename if folder exists (default: false)

**Dropbox API**: `POST /2/files/create_folder_v2`

**Response**: Folder metadata for created folder

**Example**:
```json
{
  "name": "create_folder",
  "arguments": {
    "path": "/Projects/New Project",
    "autorename": true
  }
}
```

---

### `delete_file`
**Description**: Permanently delete a file or folder from Dropbox.

**Parameters**:
- `path` (string, required): Path to the file or folder to delete

**Dropbox API**: `POST /2/files/delete_v2`

**Response**: Metadata of deleted file/folder

**Example**:
```json
{
  "name": "delete_file",
  "arguments": {
    "path": "/Documents/old_report.pdf"
  }
}
```

---

### `move_file`
**Description**: Move or rename a file or folder to a new location.

**Parameters**:
- `fromPath` (string, required): Current path of the file/folder
- `toPath` (string, required): New path for the file/folder
- `autorename` (boolean, optional): Auto-rename if destination exists (default: false)

**Dropbox API**: `POST /2/files/move_v2`

**Response**: Metadata of moved file/folder

**Example**:
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

---

### `copy_file`
**Description**: Copy a file or folder to a new location.

**Parameters**:
- `fromPath` (string, required): Source path of the file/folder
- `toPath` (string, required): Destination path for the copy
- `autorename` (boolean, optional): Auto-rename if destination exists (default: false)

**Dropbox API**: `POST /2/files/copy_v2`

**Response**: Metadata of copied file/folder

**Example**:
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

---

### `search_files`
**Description**: Search for files and folders in Dropbox using query terms.

**Parameters**:
- `query` (string, required): Search query
- `path` (string, optional): Path to search within (default: "" for all)
- `maxResults` (number, optional): Maximum results to return (default: 100)
- `fileStatus` (string, optional): Filter by file status ("active", "deleted", "both")

**Dropbox API**: `POST /2/files/search_v2`

**Response**: Array of matching files/folders with metadata

**Example**:
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

---

### `get_shared_links`
**Description**: Retrieve existing shared links for a file or folder.

**Parameters**:
- `path` (string, required): Path to the file or folder

**Dropbox API**: `POST /2/sharing/list_shared_links`

**Response**: Array of shared link objects

**Example**:
```json
{
  "name": "get_shared_links",
  "arguments": {
    "path": "/Documents/shared_report.pdf"
  }
}
```

---

### `create_shared_link`
**Description**: Create a new shared link for a file or folder.

**Parameters**:
- `path` (string, required): Path to the file or folder
- `shortUrl` (boolean, optional): Create a short URL (default: false)

**Dropbox API**: `POST /2/sharing/create_shared_link_with_settings`

**Response**: Shared link object with URL and settings

**Example**:
```json
{
  "name": "create_shared_link",
  "arguments": {
    "path": "/Documents/presentation.pptx",
    "shortUrl": true
  }
}
```

---

### `get_space_usage`
**Description**: Get account space usage information and storage quotas.

**Parameters**: None

**Dropbox API**: `POST /2/users/get_space_usage`

**Response**: Space usage object with used/allocated storage

**Example**:
```json
{
  "name": "get_space_usage",
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

1. **Path Conventions**: All paths should use forward slashes and start with "/" for absolute paths
2. **Error Handling**: Tools include automatic retry logic for rate limiting and network issues
3. **File Sizes**: Large file operations may take longer and have size limits
4. **Permissions**: Tools respect Dropbox folder permissions and sharing settings
5. **Rate Limiting**: Excessive API calls may trigger rate limiting with automatic backoff

## Authentication Requirements

All tools require:
- Valid OAuth 2.0 access token
- Appropriate Dropbox API scopes
- Active user session with valid credentials

## Performance Considerations

- **Batch Operations**: Use `list_files` with recursion for bulk operations
- **Search Optimization**: Use specific paths in `search_files` for better performance
- **Large Files**: Upload/download operations may timeout for very large files
- **Caching**: File metadata is not cached; repeated calls will hit the API