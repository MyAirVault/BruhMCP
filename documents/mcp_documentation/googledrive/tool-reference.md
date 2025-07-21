# Google Drive MCP Tools Reference

## Tool Definitions

### 1. list_files
List files and folders in Google Drive with filtering and sorting options.

**Parameters:**
- `query` (string, optional): Search query using Google Drive search syntax (default: "")
- `maxResults` (number, optional): Maximum number of files to return (1-1000, default: 10)
- `orderBy` (string, optional): Field to sort by (default: "modifiedTime")
  - Options: `createdTime`, `folder`, `modifiedByMeTime`, `modifiedTime`, `name`, `quotaBytesUsed`, `recency`, `sharedWithMeTime`, `starred`, `viewedByMeTime`
- `folderId` (string, optional): ID of folder to list files from (leave empty for root)
- `includeItemsFromAllDrives` (boolean, optional): Include items from all drives/shared drives (default: false)

**Example:**
```json
{
  "name": "list_files",
  "arguments": {
    "query": "mimeType='application/pdf' and starred=true",
    "maxResults": 25,
    "orderBy": "modifiedTime"
  }
}
```

### 2. get_file_metadata
Get detailed metadata for a specific file or folder.

**Parameters:**
- `fileId` (string, required): ID of the file or folder
- `fields` (string, optional): Comma-separated list of fields to include
  - Default: "id,name,mimeType,parents,createdTime,modifiedTime,size,webViewLink,webContentLink"

**Example:**
```json
{
  "name": "get_file_metadata",
  "arguments": {
    "fileId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    "fields": "id,name,mimeType,size,permissions,shared,starred"
  }
}
```

### 3. download_file
Download a file from Google Drive to local storage.

**Parameters:**
- `fileId` (string, required): ID of the file to download
- `localPath` (string, required): Local path where the file should be saved
- `exportFormat` (string, optional): Export format for Google Workspace files
  - Examples: "application/pdf", "text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

**Example:**
```json
{
  "name": "download_file",
  "arguments": {
    "fileId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    "localPath": "/downloads/document.pdf",
    "exportFormat": "application/pdf"
  }
}
```

### 4. upload_file
Upload a file from local storage to Google Drive.

**Parameters:**
- `localPath` (string, required): Local path to the file to upload
- `fileName` (string, required): Name for the file in Google Drive
- `parentFolderId` (string, optional): ID of the parent folder (leave empty for root)
- `mimeType` (string, optional): MIME type of the file (auto-detected if not provided)

**Example:**
```json
{
  "name": "upload_file",
  "arguments": {
    "localPath": "/documents/report.pdf",
    "fileName": "Monthly Report.pdf",
    "parentFolderId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
  }
}
```

### 5. create_folder
Create a new folder in Google Drive.

**Parameters:**
- `folderName` (string, required): Name of the folder to create
- `parentFolderId` (string, optional): ID of the parent folder (leave empty for root)

**Example:**
```json
{
  "name": "create_folder",
  "arguments": {
    "folderName": "Project Documents",
    "parentFolderId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
  }
}
```

### 6. delete_file
Delete a file or folder from Google Drive.

**Parameters:**
- `fileId` (string, required): ID of the file or folder to delete

**Example:**
```json
{
  "name": "delete_file",
  "arguments": {
    "fileId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
  }
}
```

### 7. copy_file
Copy a file in Google Drive.

**Parameters:**
- `fileId` (string, required): ID of the file to copy
- `newName` (string, required): Name for the copied file
- `parentFolderId` (string, optional): ID of the parent folder for the copy (leave empty for same location)

**Example:**
```json
{
  "name": "copy_file",
  "arguments": {
    "fileId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    "newName": "Report Copy.pdf",
    "parentFolderId": "1ABcDE2fGHiJKlMnOpQrStUvWxYz"
  }
}
```

### 8. move_file
Move a file to a different folder in Google Drive.

**Parameters:**
- `fileId` (string, required): ID of the file to move
- `newParentFolderId` (string, required): ID of the new parent folder
- `removeFromParents` (array, optional): IDs of current parent folders to remove from

**Example:**
```json
{
  "name": "move_file",
  "arguments": {
    "fileId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    "newParentFolderId": "1ABcDE2fGHiJKlMnOpQrStUvWxYz",
    "removeFromParents": ["1OldParentFolderId"]
  }
}
```

### 9. share_file
Share a file or folder with specific users or make it publicly accessible.

**Parameters:**
- `fileId` (string, required): ID of the file or folder to share
- `type` (string, required): Type of permission
  - Options: `user`, `group`, `domain`, `anyone`
- `role` (string, required): Role/permission level
  - Options: `owner`, `organizer`, `fileOrganizer`, `writer`, `commenter`, `reader`
- `emailAddress` (string, optional): Email address (required for user/group types)
- `domain` (string, optional): Domain name (required for domain type)
- `sendNotificationEmail` (boolean, optional): Whether to send notification email (default: true)

**Example:**
```json
{
  "name": "share_file",
  "arguments": {
    "fileId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    "type": "user",
    "role": "writer",
    "emailAddress": "colleague@example.com",
    "sendNotificationEmail": true
  }
}
```

### 10. search_files
Search for files in Google Drive using advanced search syntax.

**Parameters:**
- `query` (string, required): Search query using Google Drive search syntax
- `maxResults` (number, optional): Maximum number of results to return (1-1000, default: 10)
- `orderBy` (string, optional): Field to sort by (default: "modifiedTime")
  - Options: `createdTime`, `folder`, `modifiedByMeTime`, `modifiedTime`, `name`, `quotaBytesUsed`, `recency`, `sharedWithMeTime`, `starred`, `viewedByMeTime`

**Search Query Examples:**
- `name contains "report"` - Files with "report" in the name
- `mimeType="application/pdf"` - PDF files only
- `starred=true` - Starred files
- `trashed=false` - Non-trashed files
- `parents in "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"` - Files in specific folder

**Example:**
```json
{
  "name": "search_files",
  "arguments": {
    "query": "name contains 'project' and mimeType='application/pdf' and starred=true",
    "maxResults": 20,
    "orderBy": "modifiedTime"
  }
}
```

### 11. get_file_permissions
Get sharing permissions for a file or folder.

**Parameters:**
- `fileId` (string, required): ID of the file or folder

**Example:**
```json
{
  "name": "get_file_permissions",
  "arguments": {
    "fileId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
  }
}
```

### 12. get_drive_info
Get information about the user's Google Drive storage.

**Parameters:** None

**Example:**
```json
{
  "name": "get_drive_info",
  "arguments": {}
}
```

## Common Response Format

All tools return responses in MCP-compliant format:

```json
{
  "content": [
    {
      "type": "text",
      "text": "JSON response data"
    }
  ]
}
```

## Error Handling

Errors are returned in MCP format with `isError: true`:

```json
{
  "isError": true,
  "content": [
    {
      "type": "text",
      "text": "Error: Description of the error"
    }
  ]
}
```

## Google Drive Search Syntax

The search functionality supports Google Drive's advanced search syntax:

### Basic Operators
- `name contains "text"` - Files containing text in name
- `name = "exact name"` - Files with exact name
- `fullText contains "text"` - Files containing text in content
- `mimeType = "type"` - Files of specific MIME type
- `modifiedTime > "2023-01-01T00:00:00"` - Files modified after date
- `starred = true/false` - Starred/unstarred files
- `trashed = true/false` - Trashed/not trashed files

### Logical Operators
- `and` - Both conditions must be true
- `or` - Either condition must be true
- `not` - Condition must not be true

### Common MIME Types
- `application/pdf` - PDF files
- `application/vnd.google-apps.document` - Google Docs
- `application/vnd.google-apps.spreadsheet` - Google Sheets
- `application/vnd.google-apps.presentation` - Google Slides
- `application/vnd.google-apps.folder` - Folders
- `image/jpeg`, `image/png` - Image files

### Examples
```
name contains "report" and mimeType="application/pdf"
starred=true and not trashed=true
parents in "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
modifiedTime > "2023-01-01T00:00:00" and mimeType contains "image"
```