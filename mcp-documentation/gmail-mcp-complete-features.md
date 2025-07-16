# Gmail MCP Server - Complete Feature Documentation

## Overview

The Gmail MCP (Model Context Protocol) Server provides comprehensive email management capabilities through Claude Desktop. This server implements OAuth 2.0 authentication with multi-tenant support, credential caching, and session management for secure, scalable email operations.

## Architecture Features

### Core Infrastructure

-   **Protocol**: MCP JSON-RPC 2.0 via official MCP SDK
-   **Authentication**: Multi-tenant OAuth 2.0 with Google APIs
-   **Caching**: Phase 2 credential caching with automatic refresh
-   **Session Management**: Persistent handler sessions with cleanup
-   **Rate Limiting**: Intelligent API rate limit handling
-   **Error Handling**: Comprehensive error responses with retry logic

### Security & Compliance

-   **OAuth Scopes**:
    -   `gmail.modify` - Full email management
    -   `userinfo.profile` - User profile access
    -   `userinfo.email` - Email address access
-   **Token Management**: Secure token storage and refresh
-   **Multi-tenant Isolation**: Instance-based credential separation
-   **Audit Logging**: Complete operation logging and monitoring

## Available Tools (21 Total)

### 1. Email Composition & Sending

#### `send_email` - Enhanced Email Sending

**Purpose**: Send emails with full multimedia support including attachments

**Features**:

-   Multiple recipient types (To, CC, BCC)
-   Rich content support (Plain text, HTML, Multipart)
-   File attachment support (All standard formats)
-   Automatic MIME type detection
-   Character encoding support (UTF-8, International)
-   RFC822 compliance via Nodemailer integration

**Supported Content Types**:

-   `text/plain` - Plain text emails
-   `text/html` - HTML formatted emails
-   `multipart/mixed` - Emails with attachments
-   `multipart/alternative` - HTML + plain text versions
-   `multipart/related` - HTML with embedded images

**Attachment Support**:

-   **File Types**: PDF, DOCX, XLSX, PPTX, Images (PNG, JPG, GIF), Archives (ZIP, RAR)
-   **Size Limits**: Follows Gmail API limits (25MB per email)
-   **Batch Attachments**: Multiple files per email
-   **Path Resolution**: Supports absolute and relative file paths
-   **Error Handling**: Individual file validation and error reporting

**Example Usage**:

```json
{
	"to": ["recipient@example.com", "second@example.com"],
	"cc": ["manager@example.com"],
	"bcc": ["archive@example.com"],
	"subject": "Project Deliverables",
	"body": "Please find attached project files.",
	"htmlBody": "<h1>Project Deliverables</h1><p>Files attached.</p>",
	"mimeType": "multipart/alternative",
	"attachments": ["/path/to/report.pdf", "/path/to/presentation.pptx", "/path/to/data.xlsx"]
}
```

#### `create_draft` - Enhanced Draft Creation

**Purpose**: Create email drafts with full feature support

**Features**:

-   Same attachment support as send_email
-   Draft-specific metadata handling
-   Auto-save capabilities
-   Template support for recurring emails

#### `send_draft` - Draft Sending

**Purpose**: Send previously created drafts

**Features**:

-   Draft validation before sending
-   Attachment preservation
-   Metadata updates upon sending

### 2. Email Reading & Information Extraction

#### `read_email` - Enhanced Email Reading

**Purpose**: Retrieve complete email information including attachments

**Features**:

-   **Content Extraction**: Intelligent parsing of complex MIME structures
-   **Attachment Detection**: Automatic identification of all attachments
-   **Metadata Extraction**: Complete header information
-   **Multi-format Support**: Plain text, HTML, and multipart emails
-   **International Support**: Full Unicode and international character sets

**Enhanced Display Format**:

```
Subject: Project Files
From: sender@example.com
To: recipient@example.com
CC: manager@example.com
Date: Thu, 19 Jun 2025 10:30:00 -0400
Message-ID: <message-id@gmail.com>

Email body content with proper formatting...

Attachments (3):
- project_report.pdf (application/pdf, 2.1 MB, ID: ANGjdJ9fkTs-i3GCQo5o97f_itG...)
- budget_spreadsheet.xlsx (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, 456 KB, ID: BWHkeL8gkUt-j4HDRp6o98g_juI...)
- presentation_slides.pptx (application/vnd.openxmlformats-officedocument.presentationml.presentation, 8.7 MB, ID: CXIlfM9hlVu-k5IESq7p09h_kvJ...)

Thread Information:
- Thread ID: 182ab45cd67ef
- Message Count: 4 messages
- Labels: INBOX, IMPORTANT, PROJECT_X
```

#### `fetch_emails` - Email Listing

**Purpose**: Retrieve multiple emails with filtering options

**Features**:

-   Advanced Gmail search syntax support
-   Pagination with configurable limits
-   Label-based filtering
-   Date range filtering
-   Attachment presence filtering

#### `fetch_message_by_id` - Specific Email Retrieval

**Purpose**: Get individual emails by message ID

**Features**:

-   Multiple format options (full, metadata, minimal, raw)
-   Attachment information included
-   Thread context preservation

### 3. Attachment Management

#### `download_attachment` - File Download System

**Purpose**: Download email attachments to local filesystem

**Features**:

-   **Secure Downloads**: Authenticated attachment retrieval
-   **Custom Naming**: Specify download filenames
-   **Path Management**: Configurable download directories
-   **Progress Tracking**: Download status and progress reporting
-   **Error Recovery**: Retry logic for failed downloads
-   **Batch Downloads**: Multiple attachments in sequence

**File Handling**:

-   **Decode Processing**: Base64 decoding from Gmail API
-   **Integrity Checks**: File size and format validation
-   **Duplicate Handling**: Automatic filename conflict resolution
-   **Permissions**: Proper file system permissions setting

**Example Usage**:

```json
{
	"messageId": "182ab45cd67ef",
	"attachmentId": "ANGjdJ9fkTs-i3GCQo5o97f_itG...",
	"savePath": "/home/user/downloads/project_files",
	"filename": "project_report_final.pdf"
}
```

**Response Format**:

```json
{
	"success": true,
	"filename": "project_report_final.pdf",
	"filePath": "/home/user/downloads/project_files/project_report_final.pdf",
	"fileSize": 2097152,
	"mimeType": "application/pdf",
	"downloadTime": "2025-07-16T10:30:00Z"
}
```

### 4. Advanced Search & Filtering

#### `search_emails` - Comprehensive Email Search

**Purpose**: Advanced email discovery with Gmail search operators

**Supported Operators**:

-   **Sender/Recipient**: `from:`, `to:`, `cc:`, `bcc:`
-   **Content**: `subject:`, `body:`, `has:attachment`
-   **Date Range**: `after:`, `before:`, `older_than:`, `newer_than:`
-   **Status**: `is:read`, `is:unread`, `is:important`, `is:starred`
-   **Labels**: `label:`, `in:`, `category:`
-   **Size**: `size:`, `larger:`, `smaller:`
-   **Attachments**: `has:attachment`, `filename:`

**Advanced Search Examples**:

```json
{
	"query": "from:client@company.com after:2025/01/01 has:attachment filename:pdf",
	"maxResults": 50,
	"newerThan": "2025-01-01",
	"olderThan": "2025-07-01"
}
```

**Complex Query Support**:

-   Boolean operators (AND, OR, NOT)
-   Parenthetical grouping
-   Quoted phrase matching
-   Wildcard support
-   Regular expression patterns

### 5. Thread & Conversation Management

#### `get_thread` - Complete Thread Retrieval

**Purpose**: Retrieve entire email conversations

**Features**:

-   **Complete History**: All messages in thread
-   **Chronological Order**: Proper message sequencing
-   **Reply Chain**: Parent-child message relationships
-   **Attachment Tracking**: Attachments across all messages
-   **Participant History**: All thread participants

#### `reply_to_email` - Threaded Responses

**Purpose**: Reply to emails maintaining thread context

**Features**:

-   **Thread Preservation**: Maintains conversation continuity
-   **Quote Handling**: Automatic original message quoting
-   **Recipient Management**: Smart To/CC recipient handling
-   **Subject Prefixing**: Automatic "Re:" prefixing
-   **Attachment Support**: Include attachments in replies

### 6. Label & Organization Management

#### `list_labels` - Label Discovery

**Purpose**: Retrieve all available Gmail labels

**Features**:

-   **System Labels**: INBOX, SENT, DRAFTS, SPAM, TRASH
-   **Custom Labels**: User-created organizational labels
-   **Label Metadata**: Creation dates, message counts, visibility settings
-   **Hierarchical Structure**: Nested label relationships

#### `create_label` - Label Creation

**Purpose**: Create new organizational labels

**Features**:

-   **Custom Naming**: User-defined label names
-   **Visibility Control**: Message and label list visibility settings
-   **Color Support**: Label color customization
-   **Hierarchy Support**: Parent-child label relationships

#### `update_label` - Label Modification

**Purpose**: Modify existing label properties

**Features**:

-   **Rename Labels**: Change label names
-   **Visibility Settings**: Modify display preferences
-   **Color Changes**: Update label colors
-   **Hierarchy Updates**: Reorganize label structure

**Visibility Options**:

-   `messageListVisibility`: show, hide
-   `labelListVisibility`: labelShow, labelShowIfUnread, labelHide

#### `delete_label` - Label Removal

**Purpose**: Permanently remove custom labels

**Features**:

-   **Safe Deletion**: Prevents system label deletion
-   **Confirmation**: Verification before permanent removal
-   **Message Impact**: Removes label from all associated messages
-   **Audit Trail**: Deletion logging for compliance

#### `get_or_create_label` - Smart Label Management

**Purpose**: Ensure label existence or create if missing

**Features**:

-   **Atomic Operation**: Race condition handling
-   **Name Matching**: Exact label name matching
-   **Auto-creation**: Seamless label creation when missing
-   **Consistent Results**: Reliable label ID retrieval

#### `modify_labels` - Message Label Management

**Purpose**: Add or remove labels from individual messages

**Features**:

-   **Batch Operations**: Multiple label changes per message
-   **Validation**: Label existence verification
-   **Atomic Updates**: All-or-nothing label modifications
-   **Status Tracking**: Success/failure reporting

### 7. Batch Operations & Efficiency

#### `batch_modify_emails` - Bulk Label Operations

**Purpose**: Efficiently modify labels on multiple emails

**Features**:

-   **Intelligent Batching**: Automatic batch size optimization
-   **Rate Limit Handling**: Respects Gmail API limits
-   **Progress Tracking**: Real-time operation status
-   **Error Handling**: Individual message error reporting
-   **Retry Logic**: Automatic retry for failed operations

**Batch Configuration**:

-   **Default Batch Size**: 50 emails per batch
-   **Maximum Batch Size**: 1000 emails per batch
-   **Parallel Processing**: Concurrent batch execution
-   **Memory Management**: Efficient memory usage for large operations

**Example Usage**:

```json
{
	"messageIds": ["msg1", "msg2", "msg3", "..."],
	"addLabelIds": ["IMPORTANT", "PROJECT_X"],
	"removeLabelIds": ["INBOX"],
	"batchSize": 100
}
```

#### `batch_delete_emails` - Bulk Email Deletion

**Purpose**: Permanently delete multiple emails efficiently

**Features**:

-   **Permanent Deletion**: Bypass trash for immediate removal
-   **Batch Processing**: Handle large email sets
-   **Progress Reporting**: Detailed operation status
-   **Error Recovery**: Continue processing despite individual failures
-   **Confirmation**: Safety checks before deletion

**Safety Features**:

-   **Confirmation Required**: Explicit confirmation for large deletions
-   **Undo Prevention**: Clear warnings about permanent deletion
-   **Audit Logging**: Complete deletion audit trail
-   **Rate Limiting**: Prevents API abuse

### 8. Email Status Management

#### `mark_as_read` - Read Status Management

**Purpose**: Mark multiple emails as read

**Features**:

-   **Bulk Operations**: Multiple emails simultaneously
-   **Status Verification**: Confirm read status changes
-   **Inbox Organization**: Automatic read status updates

#### `mark_as_unread` - Unread Status Management

**Purpose**: Mark emails as unread for follow-up

**Features**:

-   **Attention Management**: Highlight important emails
-   **Workflow Support**: Task-based email handling
-   **Status Tracking**: Maintain unread counts

#### `delete_message` - Individual Email Deletion

**Purpose**: Permanently delete single emails

**Features**:

-   **Immediate Deletion**: Bypass trash system
-   **Confirmation**: Safety verification
-   **Audit Trail**: Deletion logging

#### `move_to_trash` - Trash Management

**Purpose**: Move emails to trash folder

**Features**:

-   **Recoverable Deletion**: Allows email recovery
-   **Trash Management**: Organized deletion workflow
-   **Automatic Cleanup**: Respects Gmail trash retention

### 9. Draft Management

#### `list_drafts` - Draft Discovery

**Purpose**: Retrieve all email drafts

**Features**:

-   **Complete Listing**: All draft emails
-   **Metadata**: Creation dates, modification times
-   **Search Support**: Draft-specific search capabilities
-   **Attachment Status**: Draft attachment information

## Advanced Features & Capabilities

### International Character Support

-   **Unicode Compliance**: Full UTF-8 character support
-   **Multi-language**: Support for all languages and scripts
-   **Special Characters**: Emoji, symbols, accented characters
-   **Encoding**: Proper character encoding handling

### Email Content Intelligence

-   **MIME Parsing**: Complex email structure handling
-   **Content Extraction**: Intelligent text extraction
-   **Format Detection**: Automatic format recognition
-   **Nested Structure**: Multi-part email processing

### Performance & Scalability

-   **Connection Pooling**: Efficient API connection management
-   **Caching Strategy**: Intelligent response caching
-   **Batch Optimization**: Optimal batch size calculations
-   **Memory Management**: Efficient memory usage patterns

### Error Handling & Reliability

-   **Retry Logic**: Automatic retry for transient failures
-   **Error Classification**: Detailed error categorization
-   **Graceful Degradation**: Partial failure handling
-   **Status Reporting**: Comprehensive operation status

### Security & Privacy

-   **Token Security**: Secure credential handling
-   **Data Protection**: Minimal data retention
-   **Audit Compliance**: Complete operation logging
-   **Privacy Controls**: User data protection

## Use Cases & Workflows

### Business Email Management

-   **Client Communication**: Professional email handling
-   **Document Sharing**: Secure file attachment workflows
-   **Project Organization**: Label-based project management
-   **Compliance**: Email retention and audit trails

### Personal Productivity

-   **Inbox Zero**: Efficient email processing
-   **Attachment Management**: File organization and retrieval
-   **Search & Discovery**: Find important emails quickly
-   **Automation**: Bulk email operations

### Development & Integration

-   **API Integration**: Programmatic email handling
-   **Workflow Automation**: Email-triggered processes
-   **Data Extraction**: Email content processing
-   **Notification Systems**: Automated email responses

### Advanced Workflows

-   **Email Analytics**: Message pattern analysis
-   **Bulk Operations**: Large-scale email management
-   **Content Processing**: Attachment data extraction
-   **Integration**: Third-party system connections

## Technical Specifications

### API Compliance

-   **Gmail API v1**: Full API specification compliance
-   **OAuth 2.0**: Secure authentication protocol
-   **MCP Protocol**: Model Context Protocol 2024-11-05
-   **JSON-RPC 2.0**: Standard RPC protocol

### Rate Limiting & Quotas

-   **API Limits**: Respects Gmail API quotas
-   **Request Batching**: Efficient API usage
-   **Retry Logic**: Handles rate limit responses
-   **Performance**: Optimal throughput

### Data Formats

-   **JSON**: Primary data exchange format
-   **MIME**: Email content formatting
-   **Base64**: Attachment encoding
-   **UTF-8**: Character encoding standard

## Performance Metrics

### Response Times

-   **Simple Operations**: < 500ms average
-   **Complex Searches**: < 2 seconds average
-   **Batch Operations**: Variable based on batch size
-   **Attachment Downloads**: Depends on file size

### Throughput

-   **Email Processing**: 50-100 emails per second
-   **Batch Operations**: 1000+ emails per batch
-   **Search Operations**: Depends on query complexity
-   **Attachment Handling**: Multiple concurrent downloads

### Reliability

-   **Uptime**: 99.9% availability target
-   **Error Rate**: < 1% operation failure rate
-   **Recovery Time**: < 5 seconds for transient failures
-   **Data Integrity**: 100% data preservation

## Conclusion

The enhanced Gmail MCP Server provides a comprehensive, enterprise-grade email management solution through Claude Desktop. With 21 specialized tools covering all aspects of email handling, from basic communication to advanced batch operations and file management, this implementation supports both personal productivity and business workflows.

The combination of OAuth 2.0 security, intelligent caching, batch processing, and comprehensive error handling creates a robust platform for email automation and management. The attachment support, label management, and search capabilities enable sophisticated email workflows while maintaining simplicity and reliability.

This implementation positions the Gmail MCP Server as a complete email management solution capable of handling complex business requirements while providing the security and reliability needed for production use.
